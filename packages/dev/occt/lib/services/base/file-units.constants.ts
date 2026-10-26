import * as Inputs from "../../api/inputs";

type UnitOfLength = Inputs.Base.unitOfLengthEnum;

export const STEP_EXTENSIONS: readonly string[] = ["step", "stp", "stpz"];
export const IGES_EXTENSIONS: readonly string[] = ["iges", "igs", "igz"];

export const STEP_SI_PREFIXES: Readonly<Record<string, UnitOfLength>> = {
    "$": Inputs.Base.unitOfLengthEnum.metre,
    "MILLI": Inputs.Base.unitOfLengthEnum.millimetre,
    "CENTI": Inputs.Base.unitOfLengthEnum.centimetre,
};

export const STEP_CONVERSION_NAMES: Readonly<Record<string, UnitOfLength>> = {
    "INCH": Inputs.Base.unitOfLengthEnum.inch,
    "MILLIMETRE": Inputs.Base.unitOfLengthEnum.millimetre,
    "MILLIMETER": Inputs.Base.unitOfLengthEnum.millimetre,
    "CENTIMETRE": Inputs.Base.unitOfLengthEnum.centimetre,
    "CENTIMETER": Inputs.Base.unitOfLengthEnum.centimetre,
    "METRE": Inputs.Base.unitOfLengthEnum.metre,
    "METER": Inputs.Base.unitOfLengthEnum.metre,
};

export const IGES_UNIT_FLAGS: Readonly<Record<string, UnitOfLength>> = {
    "1": Inputs.Base.unitOfLengthEnum.inch,
    "2": Inputs.Base.unitOfLengthEnum.millimetre,
    "6": Inputs.Base.unitOfLengthEnum.metre,
    "10": Inputs.Base.unitOfLengthEnum.centimetre,
};

export const IGES_UNIT_NAMES: Readonly<Record<string, UnitOfLength>> = {
    "IN": Inputs.Base.unitOfLengthEnum.inch,
    "INCH": Inputs.Base.unitOfLengthEnum.inch,
    "MM": Inputs.Base.unitOfLengthEnum.millimetre,
    "CM": Inputs.Base.unitOfLengthEnum.centimetre,
    "M": Inputs.Base.unitOfLengthEnum.metre,
};

export const IGES_NAMED_UNITS_FLAG = "3";
export const IGES_DEFAULT_UNIT_FLAG = "1";
export const IGES_UNIT_FLAG_FIELD = 14;
export const IGES_UNIT_NAME_FIELD = 15;
export const IGES_RECORD_LENGTH = 80;
export const IGES_DATA_COLUMNS = 72;
export const IGES_GLOBAL_SECTION = "G";
export const IGES_DEFAULT_PARAMETER_DELIMITER = ",";
export const IGES_DEFAULT_RECORD_DELIMITER = ";";

export const STEP_UNIT_WORD = /LENGTH_UNIT|GLOBAL_UNIT_ASSIGNED_CONTEXT/i;
export const STEP_INSTANCE = /^\s*#(\d+)\s*=\s*([\s\S]*)$/;
export const STEP_UNIT_CONTEXT = /GLOBAL_UNIT_ASSIGNED_CONTEXT\s*\(\s*\(([^)]*)\)\s*\)/i;
export const STEP_LENGTH_UNIT = /\bLENGTH_UNIT\s*\(\s*\)/i;
export const STEP_SI_LENGTH = /\bSI_UNIT\s*\(\s*(\$|\.(\w+)\.)\s*,\s*\.METRE\.\s*\)/i;
export const STEP_CONVERSION_UNIT = /\bCONVERSION_BASED_UNIT\s*\(\s*'([^']*)'/i;
export const STEP_REFERENCE = /#(\d+)/g;
export const IGES_HOLLERITH = /^\s*(\d+)H/;
