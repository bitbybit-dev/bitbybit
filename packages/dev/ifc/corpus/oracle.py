import json
import multiprocessing
import sys

import ifcopenshell
import ifcopenshell.geom
import ifcopenshell.util.shape
import ifcopenshell.util.unit
import numpy

SKIPPED = ("IfcFeatureElementSubtraction",)


def settings():
    chosen = ifcopenshell.geom.settings()
    chosen.set("convert-back-units", True)
    return chosen


WELD_DECIMALS = 6


def is_closed(geometry):
    faces = numpy.array(geometry.faces, dtype=numpy.int64).reshape(-1, 3)
    if not len(faces):
        return False
    verts = numpy.array(geometry.verts, dtype=float).reshape(-1, 3)
    welded = numpy.unique(numpy.round(verts, WELD_DECIMALS), axis=0, return_inverse=True)[1].reshape(-1)[faces]
    edges = numpy.sort(numpy.concatenate([welded[:, [0, 1]], welded[:, [1, 2]], welded[:, [2, 0]]]), axis=1)
    return bool((numpy.unique(edges, axis=0, return_counts=True)[1] == 2).all())


def measured(shape):
    geometry = shape.geometry
    matrix = ifcopenshell.util.shape.get_shape_matrix(shape)
    placed = numpy.array(geometry.verts, dtype=float).reshape(-1, 3) @ matrix[:3, :3].T + matrix[:3, 3]
    return {
        "closed": is_closed(geometry),
        "volume": ifcopenshell.util.shape.get_volume(geometry),
        "area": ifcopenshell.util.shape.get_area(geometry),
        "min": placed.min(axis=0).tolist() if len(placed) else None,
        "max": placed.max(axis=0).tolist() if len(placed) else None,
    }


def metres_per_unit(model):
    try:
        return ifcopenshell.util.unit.calculate_unit_scale(model), None
    except Exception as error:
        return None, f"{type(error).__name__}: {error}"


def measured_elements(model):
    products = [
        product
        for product in model.by_type("IfcElement")
        if product.Representation is not None and not any(product.is_a(kind) for kind in SKIPPED)
    ]
    results = {product.id(): {"id": product.id(), "globalId": product.GlobalId, "type": product.is_a(), "status": "not built"} for product in products}
    if not products:
        return results
    iterator = ifcopenshell.geom.iterator(settings(), model, multiprocessing.cpu_count(), include=products)
    if not iterator.initialize():
        return results
    while True:
        shape = iterator.get()
        element = results.get(shape.id)
        if element is not None:
            try:
                element.update(measured(shape))
                element["status"] = "ok"
            except Exception as error:
                element["status"] = str(error)
        if not iterator.next():
            break
    return results


MAX_STRUCTURE_DEPTH = 64
SIMPLE_VALUES = (str, int, float, bool)


def whole_of(entity):
    for rel in getattr(entity, "Decomposes", None) or []:
        if rel.is_a("IfcRelAggregates"):
            return rel.RelatingObject
    return None


def standing_in(element):
    current = element
    for _ in range(MAX_STRUCTURE_DEPTH):
        for rel in getattr(current, "ContainedInStructure", None) or []:
            return rel.RelatingStructure.GlobalId
        current = whole_of(current)
        if current is None or current.is_a("IfcSpatialElement"):
            return ""
    return ""


def single_value_names(property_set):
    return {
        prop.Name
        for prop in property_set.HasProperties or []
        if prop.is_a("IfcPropertySingleValue")
        and prop.NominalValue is not None
        and isinstance(prop.NominalValue.wrappedValue, SIMPLE_VALUES)
        and not (prop.NominalValue.is_a("IfcLogical") and prop.NominalValue.wrappedValue == "UNKNOWN")
    }


def property_sets_of(element):
    sets = []
    for rel in getattr(element, "IsDefinedBy", None) or []:
        definition = rel.RelatingPropertyDefinition if rel.is_a("IfcRelDefinesByProperties") else None
        if definition is not None and definition.is_a("IfcPropertySet"):
            sets.append(f"{definition.Name or ''}:{len(single_value_names(definition))}")
    return sorted(sets)


def semantics(model):
    elements = model.by_type("IfcElement")
    counts = {}
    for element in elements:
        counts[element.is_a()] = counts.get(element.is_a(), 0) + 1
    return {
        "counts": counts,
        "elements": [{"globalId": element.GlobalId, "storey": standing_in(element), "sets": property_sets_of(element)} for element in elements],
    }


def main(path):
    model = ifcopenshell.open(path)
    metres, unit_error = metres_per_unit(model)
    print(json.dumps({"ifcopenshell": ifcopenshell.version, "schema": model.schema, "metresPerUnit": metres, "unitError": unit_error, "elements": list(measured_elements(model).values()), "semantics": semantics(model)}))


if __name__ == "__main__":
    main(sys.argv[1])
