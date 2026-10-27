import type { ThreeMfUnit } from "./three-mf-types";

export const THREE_MF_UNITS: readonly ThreeMfUnit[] = ["micron", "millimeter", "centimeter", "inch", "foot", "meter"];
export const DEFAULT_UNIT: ThreeMfUnit = "millimeter";
export const DEFAULT_COLOR = [1, 160 / 255, 0, 1];
export const CHANNEL_MAX = 255;
export const HEX_RADIX = 16;
export const HEX_DIGITS = 2;
export const COLOR_CHANNELS = 3;
export const COLOR_CHANNELS_WITH_ALPHA = 4;
export const TRIANGLE_CORNERS = 3;
export const INDENT = "  ";
export const OBJECT_INDENT = INDENT.repeat(2);
export const MESH_INDENT = INDENT.repeat(3);
export const LIST_INDENT = INDENT.repeat(4);
export const ITEM_INDENT = INDENT.repeat(5);
export const APPLICATION = "JSCAD";
export const ZIP_COMMENT = "created by JSCAD";
export const MODEL_PART = "3D/3dmodel.model";
export const RELATIONSHIPS_PART = "_rels/.rels";
export const CONTENT_TYPES_PART = "[Content_Types].xml";
export const CORE_NAMESPACE = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02";
export const XML_DECLARATION = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";

export const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" ?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml">
  </Default>
  <Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml">
  </Default>
</Types>`;

export const RELATIONSHIPS = `<?xml version="1.0" encoding="UTF-8" ?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel">
  </Relationship>
</Relationships>`;

export const XML_ESCAPES: Readonly<Record<string, string>> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" };
