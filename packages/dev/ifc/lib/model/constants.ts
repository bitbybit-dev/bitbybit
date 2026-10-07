export const GUID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$";
export const GUID_BYTES = 16;
export const BYTE_RANGE = 256;
export const FIRST_BYTE_DIGITS = 2;
export const THREE_BYTE_DIGITS = 4;
export const BYTES_PER_GROUP = 3;
export const HASH_BYTES_USED = 6;
export const VERSION_BYTE = 6;
export const VERSION_MASK = 0x0f;
export const VERSION_BITS = 0x40;
export const VARIANT_BYTE = 8;
export const VARIANT_MASK = 0x3f;
export const VARIANT_BITS = 0x80;

export const KEY_DOMAIN = "key";
export const AUTOMATIC_DOMAIN = "automatic";
export const STRUCTURE_DOMAIN = "structure";
export const PROJECT_KEY = "project";

export const TRIE_BITS = 5;
export const TRIE_WIDTH = 2 ** TRIE_BITS;
export const TRIE_MASK = TRIE_WIDTH - 1;
export const TRIE_LEVELS = 7;

export const PRUNABLE_TYPES = ["IfcRepresentation", "IfcRepresentationItem", "IfcProductRepresentation", "IfcObjectPlacement", "IfcProfileDef", "IfcMaterialUsageDefinition", "IfcRepresentationMap", "IfcPropertySetDefinition", "IfcProperty", "IfcPhysicalQuantity"] as const;

export const LONGEST_STRING = 2 ** 29 - 24;
export const TEXT_PER_CHUNK = 2 ** 24;
export const LINE_BREAK = "\n";
export const WINDOWS_LINE_BREAK = "\r\n";
export const LINE_FEED = 0x0a;
export const CARRIAGE_RETURN = 0x0d;
