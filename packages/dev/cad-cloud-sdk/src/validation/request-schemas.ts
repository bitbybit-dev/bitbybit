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
    "MeshAngle": {
      "type": "number",
      "minimum": 0.01,
      "maximum": 3.141592653589793
    },
    "MeshPrecision": {
      "type": "number",
      "minimum": 0.005,
      "maximum": 10
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
      ]
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
    "PipelineBody": {
      "type": "object",
      "properties": {
        "steps": {
          "minItems": 1,
          "maxItems": 50,
          "type": "array",
          "items": {
            "$ref": "#/$defs/PipelineStep"
          }
        },
        "outputs": {
          "$ref": "#/$defs/OutputOptions"
        }
      },
      "required": [
        "steps"
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
        "params": {}
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
    "StepToGltfBody": {
      "type": "object",
      "properties": {
        "stepFileId": {
          "type": "string",
          "minLength": 1
        },
        "meshPrecision": {
          "$ref": "#/$defs/MeshPrecision"
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
