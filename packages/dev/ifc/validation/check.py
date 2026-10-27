import json
import sys

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.geom
import ifcopenshell.util.element
import ifcopenshell.util.representation
import ifcopenshell.util.shape
import ifcopenshell.validate


def settings():
    chosen = ifcopenshell.geom.settings()
    chosen.set("use-world-coords", True)
    return chosen


def shape_of(chosen, product):
    body = ifcopenshell.util.representation.get_representation(product, "Model", "Body", "MODEL_VIEW")
    if body is None:
        return ifcopenshell.geom.create_shape(chosen, product)
    return ifcopenshell.geom.create_shape(chosen, product, body)


def volume_of(chosen, product):
    return ifcopenshell.util.shape.get_volume(shape_of(chosen, product).geometry)


EXECUTOR_CRASH = "unsupported operand type(s)"
RULES_THE_EXECUTOR_CRASHES_ON = {
    "IfcRationalBSplineSurfaceWithKnots.WeightValuesGreaterZero": lambda surface: all(weight > 0 for row in surface.WeightsData for weight in row),
}


def holds_where_the_executor_crashed(statement):
    rule = RULES_THE_EXECUTOR_CRASHES_ON.get(statement.get("attribute"))
    return rule is not None and EXECUTOR_CRASH in str(statement.get("message")) and rule(statement.get("instance"))


def statements_of(model):
    logger = ifcopenshell.validate.json_logger()
    ifcopenshell.validate.validate(model, logger, express_rules=True)
    return [
        {
            "level": str(statement.get("level")),
            "message": str(statement.get("message")),
            "instance": str(statement.get("instance")) if statement.get("instance") is not None else None,
            "attribute": statement.get("attribute"),
        }
        for statement in logger.statements
        if not holds_where_the_executor_crashed(statement)
    ]


def geometry_failures_of(chosen, model):
    failures = []
    for product in model.by_type("IfcProduct"):
        if product.Representation is None:
            continue
        try:
            shape_of(chosen, product)
        except Exception as error:
            failures.append({"globalId": product.GlobalId, "type": product.is_a(), "problem": str(error)})
    return failures


def booleans_of(item):
    if not item.is_a("IfcBooleanResult"):
        return []
    return [item, *booleans_of(item.FirstOperand)]


def listed_booleans_of(wall):
    data = ifcopenshell.util.element.get_pset(wall, "BBIM_Boolean", "Data")
    return set(json.loads(data)) if data else set()


def has_unlisted_clippings(wall):
    body = ifcopenshell.util.representation.get_representation(wall, "Model", "Body", "MODEL_VIEW")
    if body is None:
        return False
    listed = listed_booleans_of(wall)
    return any(boolean.id() not in listed for item in body.Items for boolean in booleans_of(item))


def regenerated_walls_of(chosen, model):
    walls = [wall for wall in model.by_type("IfcWall") if not has_unlisted_clippings(wall)]
    ours = {}
    for wall in walls:
        try:
            ours[wall.GlobalId] = volume_of(chosen, wall)
        except Exception:
            ours[wall.GlobalId] = None
    results = []
    for wall in walls:
        problem = None
        try:
            ifcopenshell.api.run("geometry.regenerate_wall_representation", model, wall=wall)
        except Exception as error:
            problem = str(error)
        results.append({"wall": wall, "problem": problem})
    reports = []
    for result in results:
        wall = result["wall"]
        regenerated = None
        problem = result["problem"]
        if problem is None:
            try:
                regenerated = volume_of(chosen, wall)
            except Exception as error:
                problem = str(error)
        reports.append({
            "name": wall.Name or "",
            "globalId": wall.GlobalId,
            "ours": ours[wall.GlobalId],
            "regenerated": regenerated,
            "problem": problem,
        })
    unlisted = len(model.by_type("IfcWall")) - len(walls)
    return reports, unlisted


EXPECTED_SET = "Validation_Expected"


def is_curved_item(item):
    if item.is_a("IfcCsgSolid"):
        return is_curved_item(item.TreeRootExpression)
    if item.is_a("IfcBooleanResult"):
        return is_curved_item(item.FirstOperand) or is_curved_item(item.SecondOperand)
    if item.is_a("IfcSweptAreaSolid"):
        return item.SweptArea.is_a("IfcCircleProfileDef")
    if item.is_a("IfcAdvancedBrep"):
        shells = [item.Outer, *(item.Voids if item.is_a("IfcAdvancedBrepWithVoids") else [])]
        return any(not face.FaceSurface.is_a("IfcPlane") for shell in shells for face in shell.CfsFaces)
    return False


def is_curved(product):
    body = ifcopenshell.util.representation.get_representation(product, "Model", "Body", "MODEL_VIEW")
    items = body.Items if body is not None else []
    return any(is_curved_item(item) for item in items)


def stated_volume_of(definition):
    if definition.is_a("IfcElementQuantity"):
        return {quantity.Name: quantity.VolumeValue for quantity in definition.Quantities if quantity.is_a("IfcQuantityVolume")}.get("NetVolume")
    if definition.is_a("IfcPropertySet") and definition.Name == EXPECTED_SET:
        return {value.Name: value.NominalValue.wrappedValue for value in definition.HasProperties if value.is_a("IfcPropertySingleValue") and value.NominalValue is not None}.get("NetVolume")
    return None


def measured_volumes_of(chosen, model):
    results = []
    for relationship in model.by_type("IfcRelDefinesByProperties"):
        ours = stated_volume_of(relationship.RelatingPropertyDefinition)
        if ours is None:
            continue
        for product in relationship.RelatedObjects:
            try:
                measured = volume_of(chosen, product)
            except Exception as error:
                measured = None
            results.append({"globalId": product.GlobalId, "type": product.is_a(), "ours": ours, "measured": measured, "curved": is_curved(product)})
    return results


def report_of(path):
    chosen = settings()
    statements = statements_of(ifcopenshell.open(path))
    geometry_failures = geometry_failures_of(chosen, ifcopenshell.open(path))
    volumes = measured_volumes_of(chosen, ifcopenshell.open(path))
    walls, unlisted = regenerated_walls_of(chosen, ifcopenshell.open(path))
    return {"file": path, "statements": statements, "geometryFailures": geometry_failures, "volumes": volumes, "walls": walls, "wallsWithUnlistedClippings": unlisted}


if __name__ == "__main__":
    json.dump([report_of(path) for path in sys.argv[1:]], sys.stdout)
