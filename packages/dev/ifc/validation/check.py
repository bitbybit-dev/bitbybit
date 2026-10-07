import json
import sys

import ifcopenshell
import ifcopenshell.api
import ifcopenshell.geom
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


def is_clipped(wall):
    body = ifcopenshell.util.representation.get_representation(wall, "Model", "Body", "MODEL_VIEW")
    return body is not None and any(item.is_a("IfcBooleanResult") for item in body.Items)


def regenerated_walls_of(chosen, model):
    walls = [wall for wall in model.by_type("IfcWall") if not is_clipped(wall)]
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
    clipped = len(model.by_type("IfcWall")) - len(walls)
    return reports, clipped


def is_curved(product):
    body = ifcopenshell.util.representation.get_representation(product, "Model", "Body", "MODEL_VIEW")
    items = body.Items if body is not None else []
    return any(item.is_a("IfcSweptAreaSolid") and item.SweptArea.is_a("IfcCircleProfileDef") for item in items)


def measured_volumes_of(chosen, model):
    results = []
    for relationship in model.by_type("IfcRelDefinesByProperties"):
        definition = relationship.RelatingPropertyDefinition
        if not definition.is_a("IfcElementQuantity"):
            continue
        volumes = {quantity.Name: quantity.VolumeValue for quantity in definition.Quantities if quantity.is_a("IfcQuantityVolume")}
        ours = volumes.get("NetVolume")
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
    walls, clipped = regenerated_walls_of(chosen, ifcopenshell.open(path))
    return {"file": path, "statements": statements, "geometryFailures": geometry_failures, "volumes": volumes, "walls": walls, "clippedWalls": clipped}


json.dump([report_of(path) for path in sys.argv[1:]], sys.stdout)
