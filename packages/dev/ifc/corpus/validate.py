import collections
import json
import os
import re
import sys

import ifcopenshell

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "validation"))

from check import statements_of

INSTANCE = re.compile(r"^#(\d+)=(\w+)")
SAMPLE = 10


def key_of(statement):
    instance = INSTANCE.match(statement["instance"] or "")
    if instance is None:
        return (statement["attribute"], None, None, statement["message"])
    return (statement["attribute"], instance.group(2), int(instance.group(1)), None)


def errors_of(path):
    return [statement for statement in statements_of(ifcopenshell.open(path)) if statement["level"] == "error"]


def main(baseline_path, edited_path):
    baseline = errors_of(baseline_path)
    edited = errors_of(edited_path)
    remaining = collections.Counter(key_of(statement) for statement in baseline)
    added = []
    for statement in edited:
        key = key_of(statement)
        if remaining[key] > 0:
            remaining[key] -= 1
        else:
            added.append(statement)
    print(json.dumps({"baselineErrors": len(baseline), "editedErrors": len(edited), "added": len(added), "sample": added[:SAMPLE]}))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
