// AUTO-GENERATED — do not edit. Re-run generate:sdk-types to update.

export const schemaBundle = {
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$defs": {
    "BatchModelSubmissionBody": {
      "type": "object",
      "properties": {
        "items": {
          "minItems": 1,
          "maxItems": 50,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "params": {
                "type": "object",
                "propertyNames": {
                  "type": "string"
                },
                "additionalProperties": {}
              }
            }
          }
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "items",
        "outputs"
      ]
    },
    "ChoiceStep": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "const": "choice"
        },
        "value": {},
        "operator": {
          "$ref": "#/$defs/ComparisonOperator"
        },
        "compareTo": {},
        "then": {
          "minItems": 1,
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineStep"
          }
        },
        "else": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineStep"
          }
        }
      },
      "required": [
        "type",
        "value",
        "operator",
        "then"
      ]
    },
    "ComparisonOperator": {
      "type": "string",
      "enum": [
        "eq",
        "neq",
        "gt",
        "gte",
        "lt",
        "lte",
        "exists"
      ]
    },
    "CompoundExecuteBody": {
      "type": "object",
      "properties": {
        "parallel": {
          "type": "boolean",
          "const": true
        },
        "items": {
          "minItems": 1,
          "maxItems": 100,
          "type": "array",
          "items": {
            "$ref": "#/$defs/CompoundItem"
          }
        }
      },
      "required": [
        "parallel",
        "items"
      ],
      "additionalProperties": false
    },
    "CompoundItem": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "minLength": 1
        },
        "params": {},
        "inputFiles": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/InputFileItem"
          }
        },
        "outputFormats": {
          "maxItems": 10,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "ConvertAdvancedOptions": {
      "type": "object",
      "properties": {
        "readColors": {
          "type": "boolean"
        },
        "readNames": {
          "type": "boolean"
        },
        "readMaterials": {
          "type": "boolean"
        },
        "readLayers": {
          "type": "boolean"
        },
        "readProps": {
          "type": "boolean"
        },
        "meshDeflection": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "meshAngle": {
          "$ref": "#/$defs/MeshAngle"
        },
        "meshParallel": {
          "type": "boolean"
        },
        "meshRelative": {
          "type": "boolean"
        },
        "internalVerticesMode": {
          "type": "boolean"
        },
        "controlSurfaceDeflection": {
          "type": "boolean"
        },
        "faceCountThreshold": {
          "type": "integer",
          "minimum": -1,
          "maximum": 500000
        },
        "mergeFaces": {
          "type": "boolean"
        },
        "splitIndices16": {
          "type": "boolean"
        },
        "parallelWrite": {
          "type": "boolean"
        },
        "embedTextures": {
          "type": "boolean"
        },
        "forceUVExport": {
          "type": "boolean"
        },
        "nodeNameFormat": {
          "$ref": "#/$defs/GltfNameFormat"
        },
        "meshNameFormat": {
          "$ref": "#/$defs/GltfNameFormat"
        },
        "transformFormat": {
          "$ref": "#/$defs/GltfTransformFormat"
        },
        "adjustZtoY": {
          "type": "boolean"
        },
        "scale": {
          "$ref": "#/$defs/PositiveScale"
        }
      },
      "additionalProperties": false
    },
    "DefinitionsBody": {
      "type": "object",
      "properties": {
        "names": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        }
      },
      "required": [
        "names"
      ],
      "additionalProperties": false
    },
    "DracoCompressionOptions": {
      "type": "object",
      "properties": {
        "useDraco": {
          "type": "boolean"
        },
        "dracoCompressionLevel": {
          "type": "integer",
          "minimum": 0,
          "maximum": 10
        },
        "dracoQuantizePositionBits": {
          "type": "integer",
          "minimum": 0,
          "maximum": 31
        },
        "dracoQuantizeNormalBits": {
          "type": "integer",
          "minimum": 0,
          "maximum": 31
        },
        "dracoQuantizeTexcoordBits": {
          "type": "integer",
          "minimum": 0,
          "maximum": 31
        },
        "dracoQuantizeColorBits": {
          "type": "integer",
          "minimum": 0,
          "maximum": 31
        },
        "dracoQuantizeGenericBits": {
          "type": "integer",
          "minimum": 0,
          "maximum": 31
        },
        "dracoUnifiedQuantization": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    },
    "DragonCupBody": {
      "type": "object",
      "properties": {
        "params": {
          "$ref": "#/$defs/DragonCupParams"
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "outputs"
      ],
      "additionalProperties": false
    },
    "DragonCupParams": {
      "type": "object",
      "properties": {
        "height": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "radiusBottom": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 30
        },
        "radiusTopOffset": {
          "type": "number",
          "minimum": 0,
          "maximum": 20
        },
        "radiusMidOffset": {
          "type": "number",
          "minimum": 0,
          "maximum": 20
        },
        "rotationTopAngle": {
          "type": "number",
          "minimum": -360,
          "maximum": 360
        },
        "rotationMidAngle": {
          "type": "number",
          "minimum": -360,
          "maximum": 360
        },
        "nrSkinCellsVertical": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 30
        },
        "nrSkinCellsHorizontal": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "nrSkinCellDivisionsTop": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 10
        },
        "nrSkinCellDivisionsBottom": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 10
        },
        "skinCellOuterHeight": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "skinCellInnerHeight": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "skinCellBottomHeight": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "skinCellTopHeight": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "thickness": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "bottomThickness": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "precision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "rotation": {
          "type": "number",
          "minimum": -360,
          "maximum": 360
        },
        "scale": {
          "$ref": "#/$defs/PositiveScale"
        },
        "origin": {
          "$ref": "#/$defs/Point3"
        },
        "direction": {
          "$ref": "#/$defs/Point3"
        }
      },
      "additionalProperties": false
    },
    "DrawingAnnotatedProduct": {
      "type": "object",
      "properties": {
        "product": {
          "type": "integer",
          "minimum": 0,
          "maximum": 99999
        },
        "instance": {
          "type": "integer",
          "minimum": 0,
          "maximum": 99999
        },
        "addViews": {
          "type": "boolean"
        },
        "notes": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    },
    "DrawingBalloons": {
      "type": "object",
      "properties": {
        "view": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "section": {
          "type": "string",
          "pattern": "^[A-Z0-9]{1,2}$"
        },
        "items": {
          "minItems": 1,
          "maxItems": 100,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "item": {
                "type": "string",
                "maxLength": 24,
                "minLength": 1
              },
              "parts": {
                "minItems": 1,
                "maxItems": 10000,
                "type": "array",
                "items": {
                  "type": "integer",
                  "minimum": 0,
                  "maximum": 9999
                }
              }
            },
            "required": [
              "item",
              "parts"
            ],
            "additionalProperties": false
          }
        }
      },
      "required": [
        "items"
      ],
      "additionalProperties": false
    },
    "DrawingDrawBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "plan": {
          "$ref": "#/$defs/DrawingPlan"
        },
        "planFileId": {
          "type": "string",
          "minLength": 1
        },
        "outputs": {
          "$ref": "#/$defs/DrawingOutputOptions"
        },
        "onlySheets": {
          "$ref": "#/$defs/DrawingOnlySheets"
        },
        "modelFromTask": {
          "type": "string",
          "pattern": "^task_[A-Za-z0-9-]{1,59}$"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "DrawingFlat": {
      "type": "object",
      "properties": {
        "kFactor": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "thickness": {
          "type": "number",
          "minimum": 0,
          "maximum": 10000
        },
        "auto": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    },
    "DrawingFrame": {
      "type": "object",
      "properties": {
        "origin": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            }
          ]
        },
        "normal": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            }
          ]
        },
        "direction": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            }
          ]
        }
      },
      "required": [
        "normal",
        "direction"
      ],
      "additionalProperties": false
    },
    "DrawingHatch": {
      "type": "object",
      "properties": {
        "pattern": {
          "type": "string",
          "enum": [
            "ansi31",
            "ansi32",
            "ansi37",
            "solid"
          ]
        },
        "angle": {
          "type": "number",
          "minimum": -360,
          "maximum": 360
        },
        "spacing": {
          "type": "number",
          "minimum": 0.5,
          "maximum": 50
        }
      },
      "additionalProperties": false
    },
    "DrawingHoleTable": {
      "type": "object",
      "properties": {
        "rows": {
          "minItems": 1,
          "maxItems": 500,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingHoleTableRow"
          }
        }
      },
      "required": [
        "rows"
      ],
      "additionalProperties": false
    },
    "DrawingHoleTableRow": {
      "type": "object",
      "properties": {
        "tag": {
          "type": "string",
          "maxLength": 24
        },
        "x": {
          "type": "string",
          "maxLength": 24
        },
        "y": {
          "type": "string",
          "maxLength": 24
        },
        "size": {
          "type": "string",
          "maxLength": 120
        },
        "depth": {
          "type": "string",
          "maxLength": 24
        }
      },
      "additionalProperties": false
    },
    "DrawingInspectBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "plan": {
          "$ref": "#/$defs/DrawingPlan"
        },
        "planFileId": {
          "type": "string",
          "minLength": 1
        },
        "modelFromTask": {
          "type": "string",
          "pattern": "^task_[A-Za-z0-9-]{1,59}$"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "DrawingLeftMark": {
      "type": "object",
      "properties": {
        "view": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "callout": {
          "type": "string",
          "maxLength": 24
        },
        "balloon": {
          "type": "string",
          "maxLength": 24
        }
      },
      "required": [
        "view"
      ],
      "additionalProperties": false
    },
    "DrawingOnlySheets": {
      "minItems": 1,
      "maxItems": 500,
      "type": "array",
      "items": {
        "type": "integer",
        "minimum": 0,
        "maximum": 499
      }
    },
    "DrawingOutputOptions": {
      "type": "object",
      "properties": {
        "formats": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "svg",
              "dxf",
              "pdf"
            ]
          }
        }
      },
      "required": [
        "formats"
      ],
      "additionalProperties": false
    },
    "DrawingPartsList": {
      "type": "object",
      "properties": {
        "rows": {
          "minItems": 1,
          "maxItems": 500,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingPartsListRow"
          }
        },
        "alone": {
          "type": "boolean"
        }
      },
      "required": [
        "rows"
      ],
      "additionalProperties": false
    },
    "DrawingPartsListRow": {
      "type": "object",
      "properties": {
        "item": {
          "type": "string",
          "maxLength": 24
        },
        "name": {
          "type": "string",
          "maxLength": 120
        },
        "quantity": {
          "type": "string",
          "maxLength": 24
        },
        "sheet": {
          "type": "string",
          "maxLength": 24
        },
        "product": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000
        }
      },
      "additionalProperties": false
    },
    "DrawingPlan": {
      "type": "object",
      "properties": {
        "sheet": {
          "$ref": "#/$defs/DrawingSheet"
        },
        "units": {
          "type": "string",
          "enum": [
            "mm",
            "in"
          ]
        },
        "decimals": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4
        },
        "front": {
          "anyOf": [
            {
              "type": "string",
              "const": "annotations"
            },
            {
              "$ref": "#/$defs/DrawingFrame"
            }
          ]
        },
        "parts": {
          "anyOf": [
            {
              "type": "string",
              "const": "all"
            },
            {
              "minItems": 1,
              "maxItems": 10000,
              "type": "array",
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9999
              }
            }
          ]
        },
        "views": {
          "maxItems": 12,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingView"
          }
        },
        "sections": {
          "maxItems": 6,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingSection"
          }
        },
        "lines": {
          "type": "object",
          "properties": {
            "method": {
              "type": "string",
              "enum": [
                "auto",
                "exact",
                "sight",
                "mesh"
              ]
            }
          },
          "additionalProperties": false
        },
        "titleBlock": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingTitleBlock"
            }
          ]
        },
        "revisions": {
          "maxItems": 12,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingRevision"
          }
        },
        "dimensions": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "type": "string",
              "const": "auto"
            },
            {
              "type": "string",
              "const": "ordinate"
            }
          ]
        },
        "holes": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "type": "string",
              "const": "auto"
            }
          ]
        },
        "holeTable": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingHoleTable"
            }
          ]
        },
        "flat": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "type": "string",
              "const": "auto"
            },
            {
              "$ref": "#/$defs/DrawingFlat"
            }
          ]
        },
        "annotations": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingAnnotatedProduct"
            }
          ]
        },
        "shared": {
          "$ref": "#/$defs/DrawingShared"
        },
        "partsList": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingPartsList"
            }
          ]
        },
        "balloons": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingBalloons"
            }
          ]
        },
        "sheets": {
          "anyOf": [
            {
              "minItems": 1,
              "maxItems": 500,
              "type": "array",
              "items": {
                "$ref": "#/$defs/DrawingSetSheet"
              }
            },
            {
              "$ref": "#/$defs/DrawingSetRule"
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "DrawingRevision": {
      "type": "object",
      "properties": {
        "mark": {
          "type": "string",
          "maxLength": 120
        },
        "date": {
          "type": "string",
          "maxLength": 120
        },
        "by": {
          "type": "string",
          "maxLength": 120
        }
      },
      "additionalProperties": false
    },
    "DrawingScale": {
      "type": "object",
      "properties": {
        "numerator": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "denominator": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        }
      },
      "required": [
        "numerator",
        "denominator"
      ],
      "additionalProperties": false
    },
    "DrawingSection": {
      "type": "object",
      "properties": {
        "label": {
          "type": "string",
          "pattern": "^[A-Z0-9]{1,2}$"
        },
        "frame": {
          "$ref": "#/$defs/DrawingFrame"
        },
        "shownOn": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "hatch": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingHatch"
            }
          ]
        },
        "scale": {
          "$ref": "#/$defs/DrawingScale"
        }
      },
      "required": [
        "label",
        "frame"
      ],
      "additionalProperties": false
    },
    "DrawingSetRule": {
      "type": "object",
      "properties": {
        "auto": {
          "type": "string",
          "enum": [
            "structure",
            "parts",
            "assemblies"
          ]
        },
        "overview": {
          "type": "boolean"
        },
        "turned": {
          "type": "boolean"
        },
        "most": {
          "type": "integer",
          "minimum": 1,
          "maximum": 500
        },
        "depth": {
          "type": "integer",
          "minimum": 1,
          "maximum": 64
        }
      },
      "required": [
        "auto"
      ],
      "additionalProperties": false
    },
    "DrawingSetSheet": {
      "type": "object",
      "properties": {
        "sheet": {
          "$ref": "#/$defs/DrawingSheet"
        },
        "units": {
          "type": "string",
          "enum": [
            "mm",
            "in"
          ]
        },
        "decimals": {
          "type": "integer",
          "minimum": 0,
          "maximum": 4
        },
        "front": {
          "anyOf": [
            {
              "type": "string",
              "const": "annotations"
            },
            {
              "$ref": "#/$defs/DrawingFrame"
            }
          ]
        },
        "parts": {
          "anyOf": [
            {
              "type": "string",
              "const": "all"
            },
            {
              "minItems": 1,
              "maxItems": 10000,
              "type": "array",
              "items": {
                "type": "integer",
                "minimum": 0,
                "maximum": 9999
              }
            }
          ]
        },
        "views": {
          "maxItems": 12,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingView"
          }
        },
        "sections": {
          "maxItems": 6,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingSection"
          }
        },
        "lines": {
          "type": "object",
          "properties": {
            "method": {
              "type": "string",
              "enum": [
                "auto",
                "exact",
                "sight",
                "mesh"
              ]
            }
          },
          "additionalProperties": false
        },
        "titleBlock": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingTitleBlock"
            }
          ]
        },
        "revisions": {
          "maxItems": 12,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingRevision"
          }
        },
        "dimensions": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "type": "string",
              "const": "auto"
            },
            {
              "type": "string",
              "const": "ordinate"
            }
          ]
        },
        "holes": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "type": "string",
              "const": "auto"
            }
          ]
        },
        "holeTable": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingHoleTable"
            }
          ]
        },
        "flat": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "type": "string",
              "const": "auto"
            },
            {
              "$ref": "#/$defs/DrawingFlat"
            }
          ]
        },
        "annotations": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#/$defs/DrawingAnnotatedProduct"
            }
          ]
        },
        "shared": {
          "$ref": "#/$defs/DrawingShared"
        },
        "name": {
          "type": "string",
          "maxLength": 120
        },
        "product": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000
        },
        "turned": {
          "type": "boolean"
        },
        "pagination": {
          "type": "string",
          "maxLength": 120
        },
        "partsList": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "$ref": "#/$defs/DrawingPartsList"
            }
          ]
        },
        "balloons": {
          "anyOf": [
            {
              "type": "boolean",
              "const": false
            },
            {
              "$ref": "#/$defs/DrawingBalloons"
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "DrawingShared": {
      "type": "object",
      "properties": {
        "views": {
          "maxItems": 12,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingView"
          }
        },
        "marks": {
          "maxItems": 500,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingSharedMark"
          }
        },
        "elsewhere": {
          "maxItems": 500,
          "type": "array",
          "items": {
            "$ref": "#/$defs/DrawingLeftMark"
          }
        },
        "notes": {
          "type": "boolean"
        }
      },
      "additionalProperties": false
    },
    "DrawingSharedMark": {
      "type": "object",
      "properties": {
        "view": {
          "type": "integer",
          "minimum": 0,
          "maximum": 11
        },
        "callout": {
          "type": "string",
          "maxLength": 24
        },
        "balloon": {
          "type": "string",
          "maxLength": 24
        },
        "at": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            }
          ]
        },
        "centre": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            },
            {
              "type": "number",
              "minimum": -1000000000,
              "maximum": 1000000000
            }
          ]
        }
      },
      "required": [
        "view",
        "at"
      ],
      "additionalProperties": false
    },
    "DrawingSheet": {
      "type": "object",
      "properties": {
        "size": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "A0",
                "A1",
                "A2",
                "A3",
                "A4",
                "ANSI-A",
                "ANSI-B",
                "ANSI-C",
                "ANSI-D",
                "ANSI-E"
              ]
            },
            {
              "type": "object",
              "properties": {
                "width": {
                  "type": "number",
                  "minimum": 50,
                  "maximum": 5000
                },
                "height": {
                  "type": "number",
                  "minimum": 50,
                  "maximum": 5000
                }
              },
              "required": [
                "width",
                "height"
              ],
              "additionalProperties": false
            }
          ]
        },
        "orientation": {
          "type": "string",
          "enum": [
            "landscape",
            "portrait"
          ]
        },
        "projection": {
          "type": "string",
          "enum": [
            "first-angle",
            "third-angle"
          ]
        },
        "scale": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "fill",
                "auto"
              ]
            },
            {
              "$ref": "#/$defs/DrawingScale"
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "DrawingTitleBlock": {
      "type": "object",
      "properties": {
        "title": {
          "type": "string",
          "maxLength": 120
        },
        "number": {
          "type": "string",
          "maxLength": 120
        },
        "material": {
          "type": "string",
          "maxLength": 120
        },
        "revision": {
          "type": "string",
          "maxLength": 120
        },
        "date": {
          "type": "string",
          "maxLength": 120
        },
        "drawnBy": {
          "type": "string",
          "maxLength": 120
        },
        "checkedBy": {
          "type": "string",
          "maxLength": 120
        },
        "approvedBy": {
          "type": "string",
          "maxLength": 120
        },
        "documentType": {
          "type": "string",
          "maxLength": 120
        },
        "company": {
          "type": "string",
          "maxLength": 120
        },
        "finish": {
          "type": "string",
          "maxLength": 120
        },
        "custom": {
          "maxItems": 6,
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "caption": {
                "type": "string",
                "maxLength": 120,
                "minLength": 1
              },
              "value": {
                "type": "string",
                "maxLength": 120
              }
            },
            "required": [
              "caption"
            ],
            "additionalProperties": false
          }
        },
        "sheet": {
          "type": "string",
          "maxLength": 24
        },
        "quantity": {
          "type": "string",
          "maxLength": 24
        }
      },
      "additionalProperties": false
    },
    "DrawingView": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "enum": [
            "front",
            "top",
            "bottom",
            "left",
            "right",
            "back",
            "isometric"
          ]
        },
        "frame": {
          "$ref": "#/$defs/DrawingFrame"
        },
        "saved": {
          "type": "string",
          "maxLength": 120,
          "minLength": 1
        },
        "hiddenLines": {
          "type": "boolean"
        },
        "smoothEdges": {
          "type": "boolean"
        },
        "scale": {
          "$ref": "#/$defs/DrawingScale"
        },
        "caption": {
          "type": "string",
          "maxLength": 120
        }
      },
      "additionalProperties": false
    },
    "ExecuteBody": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "minLength": 1
        },
        "params": {}
      },
      "required": [
        "operation"
      ],
      "additionalProperties": false
    },
    "FileUploadBody": {
      "type": "object",
      "properties": {
        "filename": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "contentType": {
          "type": "string",
          "minLength": 1,
          "maxLength": 255
        },
        "bytes": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1073741824
        },
        "sha256": {
          "type": "string",
          "minLength": 1,
          "maxLength": 128
        }
      },
      "required": [
        "filename",
        "contentType",
        "bytes"
      ],
      "additionalProperties": false
    },
    "GltfNameFormat": {
      "type": "string",
      "enum": [
        "empty",
        "product",
        "instance",
        "instanceOrProduct",
        "productOrInstance",
        "productAndInstance",
        "productAndInstanceAndOcaf"
      ]
    },
    "GltfTransformFormat": {
      "type": "string",
      "enum": [
        "compact",
        "mat4",
        "trs"
      ]
    },
    "InputFileItem": {
      "type": "object",
      "properties": {
        "fileId": {
          "type": "string",
          "minLength": 1
        },
        "role": {
          "type": "string",
          "minLength": 1
        }
      },
      "required": [
        "fileId",
        "role"
      ],
      "additionalProperties": false
    },
    "LengthUnit": {
      "type": "string",
      "enum": [
        "mm",
        "cm",
        "m",
        "in"
      ]
    },
    "MapStep": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "const": "map"
        },
        "items": {},
        "steps": {
          "minItems": 1,
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineStep"
          }
        },
        "reduce": {
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineStep"
          }
        }
      },
      "required": [
        "type",
        "items",
        "steps"
      ]
    },
    "MeshAngle": {
      "type": "number",
      "minimum": 0.01,
      "maximum": 3.141592653589793
    },
    "MeshPrecision": {
      "type": "number",
      "minimum": 0.0001,
      "maximum": 10,
      "example": 0.1
    },
    "ModelSubmissionBody": {
      "type": "object",
      "properties": {
        "params": {
          "type": "object",
          "propertyNames": {
            "type": "string"
          },
          "additionalProperties": {}
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "outputs"
      ],
      "additionalProperties": false
    },
    "NestingInspectBody": {
      "type": "object",
      "properties": {
        "stepFileIds": {
          "minItems": 1,
          "maxItems": 50,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "options": {
          "$ref": "#/$defs/NestingInspectOptions"
        }
      },
      "required": [
        "stepFileIds"
      ],
      "additionalProperties": false
    },
    "NestingInspectOptions": {
      "type": "object",
      "properties": {
        "sheets": {
          "maxItems": 100,
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/$defs/NestingStrip"
              },
              {
                "$ref": "#/$defs/NestingSheet"
              }
            ]
          }
        },
        "parts": {
          "maxItems": 5000,
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/$defs/NestingPartOptions"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "spacing": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "margin": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "timeBudgetSeconds": {
          "type": "number",
          "minimum": 0.001,
          "maximum": 120
        },
        "tolerance": {
          "type": "number",
          "minimum": 1e-9,
          "maximum": 1000000000
        },
        "evaluationBudget": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000000000
        },
        "seed": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "sheetGap": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        }
      },
      "additionalProperties": false
    },
    "NestingNestBody": {
      "type": "object",
      "properties": {
        "stepFileIds": {
          "minItems": 1,
          "maxItems": 50,
          "type": "array",
          "items": {
            "type": "string",
            "minLength": 1
          }
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "options": {
          "$ref": "#/$defs/NestingOptions"
        },
        "outputs": {
          "$ref": "#/$defs/NestingOutputOptions"
        }
      },
      "required": [
        "stepFileIds",
        "options"
      ],
      "additionalProperties": false
    },
    "NestingOptions": {
      "type": "object",
      "properties": {
        "sheets": {
          "minItems": 1,
          "maxItems": 100,
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/$defs/NestingStrip"
              },
              {
                "$ref": "#/$defs/NestingSheet"
              }
            ]
          }
        },
        "parts": {
          "maxItems": 5000,
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/$defs/NestingPartOptions"
              },
              {
                "type": "null"
              }
            ]
          }
        },
        "spacing": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "margin": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "timeBudgetSeconds": {
          "type": "number",
          "minimum": 0.001,
          "maximum": 120
        },
        "tolerance": {
          "type": "number",
          "minimum": 1e-9,
          "maximum": 1000000000
        },
        "evaluationBudget": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000000000
        },
        "seed": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "sheetGap": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        }
      },
      "required": [
        "sheets"
      ],
      "additionalProperties": false
    },
    "NestingOutputFormat": {
      "type": "string",
      "enum": [
        "step",
        "stpz",
        "decomposed-mesh",
        "gltf",
        "dxf",
        "svg",
        "outlines"
      ]
    },
    "NestingOutputOptions": {
      "type": "object",
      "properties": {
        "formats": {
          "minItems": 1,
          "type": "array",
          "items": {
            "$ref": "#/$defs/NestingOutputFormat"
          }
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "gltfMeshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "adjustYtoZ": {
          "type": "boolean"
        },
        "unit": {
          "$ref": "#/$defs/LengthUnit"
        }
      },
      "required": [
        "formats"
      ],
      "additionalProperties": false
    },
    "NestingPartOptions": {
      "type": "object",
      "properties": {
        "quantity": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        },
        "rotations": {
          "$ref": "#/$defs/NestingRotations"
        },
        "allowFlip": {
          "type": "boolean"
        },
        "priority": {
          "type": "integer",
          "minimum": -1000000,
          "maximum": 1000000
        },
        "xDirection": {
          "type": "array",
          "prefixItems": [
            {
              "type": "number"
            },
            {
              "type": "number"
            },
            {
              "type": "number"
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "NestingRotations": {
      "oneOf": [
        {
          "type": "object",
          "properties": {
            "mode": {
              "type": "string",
              "const": "fixed"
            },
            "angles": {
              "minItems": 1,
              "maxItems": 720,
              "type": "array",
              "items": {
                "type": "number",
                "minimum": -36000,
                "maximum": 36000
              }
            }
          },
          "required": [
            "mode",
            "angles"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "mode": {
              "type": "string",
              "const": "step"
            },
            "step": {
              "type": "number",
              "minimum": 0.5,
              "maximum": 360
            }
          },
          "required": [
            "mode",
            "step"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "mode": {
              "type": "string",
              "const": "free"
            }
          },
          "required": [
            "mode"
          ],
          "additionalProperties": false
        }
      ],
      "type": "object"
    },
    "NestingSheet": {
      "type": "object",
      "properties": {
        "width": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000000000
        },
        "height": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000000000
        },
        "quantity": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        },
        "cost": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000000
        },
        "strip": {
          "type": "boolean",
          "const": false
        }
      },
      "required": [
        "width",
        "height"
      ],
      "additionalProperties": false
    },
    "NestingStrip": {
      "type": "object",
      "properties": {
        "strip": {
          "type": "boolean",
          "const": true
        },
        "height": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 1000000000
        },
        "cost": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000000
        }
      },
      "required": [
        "strip",
        "height"
      ],
      "additionalProperties": false
    },
    "OutputFormat": {
      "type": "string",
      "enum": [
        "step",
        "stpz",
        "decomposed-mesh",
        "gltf"
      ]
    },
    "OutputOptions": {
      "type": "object",
      "properties": {
        "formats": {
          "minItems": 1,
          "type": "array",
          "items": {
            "$ref": "#/$defs/OutputFormat"
          }
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "gltfMeshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "adjustYtoZ": {
          "type": "boolean"
        }
      },
      "required": [
        "formats"
      ],
      "additionalProperties": false
    },
    "PhoneNestBody": {
      "type": "object",
      "properties": {
        "params": {
          "$ref": "#/$defs/PhoneNestParams"
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "outputs"
      ],
      "additionalProperties": false
    },
    "PhoneNestParams": {
      "type": "object",
      "properties": {
        "heightBottom": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "heightTop": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "widthBack": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "widthFront": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "length": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 50
        },
        "backOffset": {
          "type": "number",
          "minimum": 0,
          "maximum": 30
        },
        "thickness": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 5
        },
        "applyOrnaments": {
          "type": "boolean"
        },
        "filletRadius": {
          "type": "number",
          "minimum": 0,
          "maximum": 15
        },
        "phoneHeight": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 35
        },
        "phoneWidth": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 35
        },
        "phoneThickness": {
          "type": "number",
          "exclusiveMinimum": 0,
          "maximum": 3
        },
        "precision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "rotation": {
          "type": "number",
          "minimum": -360,
          "maximum": 360
        },
        "scale": {
          "$ref": "#/$defs/PositiveScale"
        },
        "origin": {
          "$ref": "#/$defs/Point3"
        },
        "direction": {
          "$ref": "#/$defs/Point3"
        }
      },
      "additionalProperties": false
    },
    "PipelineAnyStep": {
      "anyOf": [
        {
          "$ref": "#/$defs/MapStep"
        },
        {
          "$ref": "#/$defs/ChoiceStep"
        },
        {
          "$ref": "#/$defs/PipelineStep"
        }
      ]
    },
    "PipelineBody": {
      "type": "object",
      "properties": {
        "steps": {
          "minItems": 1,
          "maxItems": 50,
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineAnyStep"
          }
        },
        "inputFiles": {
          "maxItems": 5,
          "type": "array",
          "items": {
            "$ref": "#/$defs/InputFileItem"
          }
        },
        "outputs": {
          "$ref": "#/$defs/PipelineOutputOptions"
        }
      },
      "required": [
        "steps"
      ],
      "additionalProperties": false
    },
    "PipelineOutputFormat": {
      "type": "string",
      "enum": [
        "step",
        "stpz",
        "decomposed-mesh",
        "gltf",
        "json",
        "csv",
        "stl",
        "3mf",
        "brep",
        "brep-binary"
      ]
    },
    "PipelineOutputOptions": {
      "type": "object",
      "properties": {
        "formats": {
          "minItems": 1,
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineOutputFormat"
          }
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "gltfMeshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "adjustYtoZ": {
          "type": "boolean"
        },
        "includePipelineInMetadata": {
          "type": "boolean"
        },
        "unit": {
          "$ref": "#/$defs/LengthUnit"
        }
      },
      "required": [
        "formats"
      ],
      "additionalProperties": false
    },
    "PipelineStep": {
      "type": "object",
      "properties": {
        "operation": {
          "type": "string",
          "minLength": 1
        },
        "params": {},
        "output": {
          "type": "boolean"
        }
      },
      "required": [
        "operation",
        "params"
      ]
    },
    "Point3": {
      "type": "array",
      "prefixItems": [
        {
          "type": "number",
          "minimum": -1000,
          "maximum": 1000
        },
        {
          "type": "number",
          "minimum": -1000,
          "maximum": 1000
        },
        {
          "type": "number",
          "minimum": -1000,
          "maximum": 1000
        }
      ]
    },
    "PositiveScale": {
      "type": "number",
      "minimum": 0.000001,
      "maximum": 1000
    },
    "StepToGltfAdvancedBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "options": {
          "$ref": "#/$defs/ConvertAdvancedOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "StepToGltfAdvancedWithDracoBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "options": {
          "$ref": "#/$defs/ConvertAdvancedOptions"
        },
        "draco": {
          "$ref": "#/$defs/DracoCompressionOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "StepToGltfBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "meshAngle": {
          "$ref": "#/$defs/MeshAngle"
        },
        "meshRelative": {
          "type": "boolean"
        },
        "internalVerticesMode": {
          "type": "boolean"
        },
        "controlSurfaceDeflection": {
          "type": "boolean"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "StepToGltfWithDracoBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "meshAngle": {
          "$ref": "#/$defs/MeshAngle"
        },
        "meshRelative": {
          "type": "boolean"
        },
        "internalVerticesMode": {
          "type": "boolean"
        },
        "controlSurfaceDeflection": {
          "type": "boolean"
        },
        "draco": {
          "$ref": "#/$defs/DracoCompressionOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldAndNestBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "kFactor": {
          "default": 0.5,
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "thicknessOverride": {
          "default": 0,
          "type": "number",
          "minimum": 0
        },
        "nesting": {
          "$ref": "#/$defs/UnfoldNestingOptions"
        },
        "outputs": {
          "$ref": "#/$defs/UnfoldAndNestOutputOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldAndNestOutputOptions": {
      "type": "object",
      "properties": {
        "formats": {
          "minItems": 1,
          "type": "array",
          "items": {
            "type": "string",
            "enum": [
              "step",
              "stpz",
              "decomposed-mesh",
              "gltf",
              "dxf",
              "svg",
              "outlines",
              "flat-meshes"
            ]
          }
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "gltfMeshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
        },
        "adjustYtoZ": {
          "type": "boolean"
        },
        "unit": {
          "$ref": "#/$defs/LengthUnit"
        }
      },
      "required": [
        "formats"
      ],
      "additionalProperties": false
    },
    "UnfoldFaceReportBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "faceIndex": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldFaceToFlatBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "faceIndex": {
          "default": 0,
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldNestingOptions": {
      "type": "object",
      "properties": {
        "sheets": {
          "minItems": 1,
          "maxItems": 100,
          "type": "array",
          "items": {
            "anyOf": [
              {
                "$ref": "#/$defs/NestingStrip"
              },
              {
                "$ref": "#/$defs/NestingSheet"
              }
            ]
          }
        },
        "quantity": {
          "type": "integer",
          "minimum": 1,
          "maximum": 100000
        },
        "rotations": {
          "$ref": "#/$defs/NestingRotations"
        },
        "allowFlip": {
          "type": "boolean"
        },
        "spacing": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "margin": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        },
        "timeBudgetSeconds": {
          "type": "number",
          "minimum": 0.001,
          "maximum": 120
        },
        "tolerance": {
          "type": "number",
          "minimum": 1e-9,
          "maximum": 1000000000
        },
        "evaluationBudget": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000000000
        },
        "seed": {
          "type": "integer",
          "minimum": 0,
          "maximum": 9007199254740991
        },
        "sheetGap": {
          "type": "number",
          "minimum": 0,
          "maximum": 1000000000
        }
      },
      "additionalProperties": false
    },
    "UnfoldSolidBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "kFactor": {
          "default": 0.5,
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "thicknessOverride": {
          "default": 0,
          "type": "number",
          "minimum": 0
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldSolidReportBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "kFactor": {
          "default": 0.5,
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "thicknessOverride": {
          "default": 0,
          "type": "number",
          "minimum": 0
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    },
    "UnfoldSolidToFlatBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "fileUnit": {
          "$ref": "#/$defs/LengthUnit"
        },
        "kFactor": {
          "default": 0.5,
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "thicknessOverride": {
          "default": 0,
          "type": "number",
          "minimum": 0
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "stepFileId"
      ],
      "additionalProperties": false
    }
  },
  "endpoints": {
    "cad.execute": "ExecuteBody",
    "cad.pipeline": "PipelineBody",
    "cad.compound": "CompoundExecuteBody",
    "models.submit": "ModelSubmissionBody",
    "models.batchSubmit": "BatchModelSubmissionBody",
    "models.definitions": "DefinitionsBody",
    "convert.stepToGltf": "StepToGltfBody",
    "convert.stepToGltfAdvanced": "StepToGltfAdvancedBody",
    "files.upload": "FileUploadBody",
    "models.submit.dragon-cup": "DragonCupBody",
    "models.submit.phone-nest": "PhoneNestBody"
  }
} as const;
