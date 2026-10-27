/**
 * An ISO metric thread size, from M1.6 to M24: the nominal diameter in millimetres after the M.
 * @optionLabels value
 */
export enum isoThreadSizeEnum {
    m1_6 = "M1.6",
    m2 = "M2",
    m2_5 = "M2.5",
    m3 = "M3",
    m4 = "M4",
    m5 = "M5",
    m6 = "M6",
    m8 = "M8",
    m10 = "M10",
    m12 = "M12",
    m14 = "M14",
    m16 = "M16",
    m20 = "M20",
    m24 = "M24",
}

/**
 * How much room a clearance hole leaves around its screw: close (fine), normal (medium) or loose
 * (coarse), as ISO 273 and ASME B18.2.8 grade it.
 */
export enum clearanceFitEnum {
    close = "close",
    normal = "normal",
    loose = "loose",
}

/**
 * The point of an ISO hexagon socket set screw: flat (ISO 4026), cone (ISO 4027), dog (ISO 4028)
 * or cup (ISO 4029).
 */
export enum isoSetScrewPointEnum {
    flat = "flat",
    cone = "cone",
    dog = "dog",
    cup = "cup",
}

/**
 * A Unified inch thread size, from #0 to 1 inch: a number for the small sizes, a fraction of an
 * inch for the larger ones.
 * @optionLabels value
 */
export enum ansiThreadSizeEnum {
    n0 = "#0",
    n1 = "#1",
    n2 = "#2",
    n3 = "#3",
    n4 = "#4",
    n5 = "#5",
    n6 = "#6",
    n8 = "#8",
    n10 = "#10",
    n12 = "#12",
    in1_4 = "1/4",
    in5_16 = "5/16",
    in3_8 = "3/8",
    in7_16 = "7/16",
    in1_2 = "1/2",
    in9_16 = "9/16",
    in5_8 = "5/8",
    in3_4 = "3/4",
    in7_8 = "7/8",
    in1 = "1",
}

/**
 * The series of a Unified inch thread: coarse (UNC) or fine (UNF).
 * @optionLabels value
 */
export enum ansiThreadSeriesEnum {
    unc = "UNC",
    unf = "UNF",
}

/**
 * The point of an ASME B18.3 hexagon socket set screw: cup, flat, cone, oval or half dog.
 */
export enum ansiSetScrewPointEnum {
    cup = "cup",
    flat = "flat",
    cone = "cone",
    oval = "oval",
    halfDog = "halfDog",
}

/**
 * The series of an ASME B18.22.1 type A plain washer: narrow, the former SAE sizes, or wide, the
 * former standard plate sizes.
 */
export enum ansiWasherSeriesEnum {
    narrow = "narrow",
    wide = "wide",
}

/**
 * An inch deep groove ball bearing by its R-series designation: the miniature R1-4 to R1810, and
 * R2 to R20, whose number is the bore in sixteenths of an inch.
 * @optionLabels value
 */
export enum ansiBallBearingEnum {
    r1_4 = "R1-4",
    r1_5 = "R1-5",
    r133 = "R133",
    r144 = "R144",
    r155 = "R155",
    r156 = "R156",
    r166 = "R166",
    r168 = "R168",
    r188 = "R188",
    r1810 = "R1810",
    r2 = "R2",
    r2_5 = "R2-5",
    r2_6 = "R2-6",
    r3 = "R3",
    r4 = "R4",
    r4a = "R4A",
    r6 = "R6",
    r8 = "R8",
    r10 = "R10",
    r12 = "R12",
    r14 = "R14",
    r16 = "R16",
    r18 = "R18",
    r20 = "R20",
}

/**
 * The diametral pitch of an ANSI B92.1 involute spline as the standard writes it: the pitch over
 * the stub pitch that sets the teeth's depth, such as 16/32. These are the pitches the standard
 * gives its 30 degree flat root side fit, 2.5/5 to 32/64; the finer ones it makes only with a
 * fillet root or at 45 degrees.
 * @optionLabels value
 */
export enum ansiSplinePitchEnum {
    p2_5_5 = "2.5/5",
    p3_6 = "3/6",
    p4_8 = "4/8",
    p5_10 = "5/10",
    p6_12 = "6/12",
    p8_16 = "8/16",
    p10_20 = "10/20",
    p12_24 = "12/24",
    p16_32 = "16/32",
    p20_40 = "20/40",
    p24_48 = "24/48",
    p32_64 = "32/64",
}

/**
 * The standard a key and its keyway are sized by: the metric DIN 6885 or the inch ANSI B17.1.
 */
export enum keyStandardEnum {
    din = "din",
    ansi = "ansi",
}

/**
 * Where a retaining ring sits: on a shaft (DIN 471, or an external ASME B18.27 ring) or in a bore
 * (DIN 472, or an internal one).
 */
export enum retainingRingKindEnum {
    shaft = "shaft",
    bore = "bore",
}

/**
 * The pattern of a knurl: straight grooves (DIN 82 RAA), helical grooves turning left (RBL) or
 * right (RBR), or both crossing in a raised diamond (RGE); ASME B94.6 names the helical ones
 * diagonal.
 */
export enum knurlPatternEnum {
    straight = "straight",
    left = "left",
    right = "right",
    diamond = "diamond",
}

/**
 * A deep groove ball bearing by its ISO designation, from the 60 and 62 series and the small 62x
 * and 60x sizes.
 * @optionLabels value
 */
export enum isoBallBearingEnum {
    b623 = "623",
    b624 = "624",
    b625 = "625",
    b626 = "626",
    b608 = "608",
    b609 = "609",
    b6000 = "6000",
    b6001 = "6001",
    b6002 = "6002",
    b6003 = "6003",
    b6004 = "6004",
    b6005 = "6005",
    b6006 = "6006",
    b6007 = "6007",
    b6008 = "6008",
    b6009 = "6009",
    b6010 = "6010",
    b6200 = "6200",
    b6201 = "6201",
    b6202 = "6202",
    b6203 = "6203",
    b6204 = "6204",
    b6205 = "6205",
    b6206 = "6206",
    b6207 = "6207",
    b6208 = "6208",
    b6209 = "6209",
    b6210 = "6210",
}
