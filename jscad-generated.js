
let CSG;

(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
CSG = require('./node_modules/@jscad/modeling/src/index.js');
CSG.IOUTILS = require('./node_modules/@jscad/io-utils/index.js');
CSG.STLSERIALIZER = require('./node_modules/@jscad/stl-serializer/index.js');
CSG.DXFSERIALIZER = require('./node_modules/@jscad/dxf-serializer/index.js');

},{"./node_modules/@jscad/dxf-serializer/index.js":12,"./node_modules/@jscad/io-utils/index.js":16,"./node_modules/@jscad/modeling/src/index.js":108,"./node_modules/@jscad/stl-serializer/index.js":421}],2:[function(require,module,exports){
/**
 * Flatten the given array into a single array of elements.
 * The given array can be composed of multiple depths of objects and or arrays.
 * @param {Array} array - array to flatten
 * @returns {Array} a flat array with a single list of elements
 * @alias module:array-utils.flatten
 * @example
 * const flat = flatten([[1], [2, 3, [4, 5]], 6]) // returns [1, 2, 3, 4, 5, 6]
 */
const flatten = (arr) => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])

module.exports = flatten

},{}],3:[function(require,module,exports){
/**
 * Compare function for sorting arrays of numbers.
 * @param {Number} a - first number
 * @param {Number} b - second number
 * @return {Number} result of a - b
 * @alias module:array-utils.fnNumberSort
 * @example
 * const numbers = [2, 1, 4, 3, 6, 5, 8, 7, 9, 0]
 * const sorted = numbers.sort(fnNumberSort)
 */
const fnNumberSort = (a, b) => a - b

module.exports = fnNumberSort

},{}],4:[function(require,module,exports){
/**
 * Return the first element of the given array.
 * @param {*} array - anything
 * @returns {*} first element of the array, or undefined
 * @alias module:array-utils.head
 * @example
 * let element = head([1, 2])
 */
const head = (array) => {
  if (!Array.isArray(array) || array.length === 0) {
    return undefined
  }
  return array[0]
}

module.exports = head

},{}],5:[function(require,module,exports){
/**
 * Utility functions for arrays.
 * @module array-utils
 * @example
 * const { flatten, head } = require('@jscad/array-utils')
 */

module.exports = {
  flatten: require('./flatten'),
  fnNumberSort: require('./fnNumberSort'),
  head: require('./head'),
  insertSorted: require('./insertSorted'),
  nth: require('./nth'),
  padToLength: require('./padToLength'),
  toArray: require('./toArray')
}

},{"./flatten":2,"./fnNumberSort":3,"./head":4,"./insertSorted":6,"./nth":7,"./padToLength":8,"./toArray":9}],6:[function(require,module,exports){
/**
 * Insert the given element into the give array using the compareFunction.
 * @param {Array} array - array in which to insert
 * @param {*} element - element to insert into the array
 * @param {Function} compareFunction - a function that defines the sort order of elements
 * @alias module:array-utils.insertSorted
 * @example
 * const numbers = [1, 5]
 * const result = insertSorted(numbers, 3, fnNumberSort)
 */
const insertSorted = (array, element, compareFunction) => {
  let leftbound = 0
  let rightbound = array.length
  while (rightbound > leftbound) {
    const testindex = Math.floor((leftbound + rightbound) / 2)
    const testelement = array[testindex]
    const compareresult = compareFunction(element, testelement)
    if (compareresult > 0) { // element > testelement
      leftbound = testindex + 1
    } else {
      rightbound = testindex
    }
  }
  array.splice(leftbound, 0, element)
  return array
}

module.exports = insertSorted

},{}],7:[function(require,module,exports){
/**
 * Return the Nth element of the given array.
 * @param {*} array - anything
 * @param {Number} index - index of the element to return
 * @returns {*} Nth element of the array, or undefined
 * @alias module:array-utils.nth
 * @example
 * let value = nth([1], 2) // undefined
 * let value = nth([1, 2, 3, 4, 5], 3) // 4
 */
const nth = (array, index) => {
  if (!Array.isArray(array) || array.length < index) {
    return undefined
  }
  return array[index]
}

module.exports = nth

},{}],8:[function(require,module,exports){
/**
 * Build an array of the given target length from an existing array and a padding value.
 * If the array is already larger than the target length, it will not be shortened.
 * @param {Array} anArray - the source array to copy into the result.
 * @param {*} padding - the value to add to the new array to reach the desired length.
 * @param {Number} targetLength - The desired length of the returned array.
 * @returns {Array} an array with at least 'target length" elements
 * @alias module:array-utils.padToLength
 * @example
 * const srcArray = [2, 3, 4]
 * const paddedArray = padToLength(srcArray, 0, 5)
 */
const padToLength = (anArray, padding, targetLength) => {
  anArray = anArray.slice()
  while (anArray.length < targetLength) {
    anArray.push(padding)
  }
  return anArray
}

module.exports = padToLength

},{}],9:[function(require,module,exports){
/**
 * Convert the given array to an array if not already an array.
 * @param {*} array - anything
 * @returns {Array} an array
 * @alias module:array-utils.toArray
 * @example
 * const array = toArray(1) // [1]
 */
const toArray = (array) => {
  if (Array.isArray(array)) return array
  if (array === undefined || array === null) return []
  return [array]
}

module.exports = toArray

},{}],10:[function(require,module,exports){
/*
AutoCAD DXF Content

These are the common headers, classes, tables, blocks, and objects required for AC2017 DXF files.

## License

Copyright (c) 2018 Z3 Development https://github.com/z3dev

All code released under MIT license
*/

// Important Variables
//   ANGDIR = 0 : counter clockwise angles
//   INSUNITS = 4 : millimeters
//
const dxfHeaders = function () {
  const content = `  0
SECTION
  2
HEADER
  9
$ACADVER
  1
AC1027
  9
$ACADMAINTVER
 70
8
  9
$DWGCODEPAGE
  3
ANSI_1252
  9
$LASTSAVEDBY
  1
unknown
  9
$REQUIREDVERSIONS
160
0
  9
$INSBASE
 10
0.0
 20
0.0
 30
0.0
  9
$EXTMIN
 10
1e+20
 20
1e+20
 30
1e+20
  9
$EXTMAX
 10
-1e+20
 20
-1e+20
 30
-1e+20
  9
$LIMMIN
 10
0.0
 20
0.0
  9
$LIMMAX
 10
12.0
 20
9.0
  9
$ORTHOMODE
 70
0
  9
$REGENMODE
 70
1
  9
$FILLMODE
 70
1
  9
$QTEXTMODE
 70
0
  9
$MIRRTEXT
 70
0
  9
$LTSCALE
 40
1.0
  9
$ATTMODE
 70
1
  9
$TEXTSIZE
 40
0.2
  9
$TRACEWID
 40
0.05
  9
$TEXTSTYLE
  7
Notes
  9
$CLAYER
  8
0
  9
$CELTYPE
  6
ByLayer
  9
$CECOLOR
 62
256
  9
$CELTSCALE
 40
1.0
  9
$DISPSILH
 70
0
  9
$DIMSCALE
 40
1.0
  9
$DIMASZ
 40
3.0
  9
$DIMEXO
 40
1.5
  9
$DIMDLI
 40
6.0
  9
$DIMRND
 40
0.0
  9
$DIMDLE
 40
0.0
  9
$DIMEXE
 40
3.0
  9
$DIMTP
 40
0.0
  9
$DIMTM
 40
0.0
  9
$DIMTXT
 40
3.0
  9
$DIMCEN
 40
3.0
  9
$DIMTSZ
 40
0.0
  9
$DIMTOL
 70
0
  9
$DIMLIM
 70
0
  9
$DIMTIH
 70
0
  9
$DIMTOH
 70
0
  9
$DIMSE1
 70
0
  9
$DIMSE2
 70
0
  9
$DIMTAD
 70
1
  9
$DIMZIN
 70
3
  9
$DIMBLK
  1

  9
$DIMASO
 70
1
  9
$DIMSHO
 70
1
  9
$DIMPOST
  1

  9
$DIMAPOST
  1

  9
$DIMALT
 70
0
  9
$DIMALTD
 70
2
  9
$DIMALTF
 40
25.4
  9
$DIMLFAC
 40
1.0
  9
$DIMTOFL
 70
0
  9
$DIMTVP
 40
0.0
  9
$DIMTIX
 70
0
  9
$DIMSOXD
 70
0
  9
$DIMSAH
 70
0
  9
$DIMBLK1
  1

  9
$DIMBLK2
  1

  9
$DIMSTYLE
  2
Civil-Metric
  9
$DIMCLRD
 70
0
  9
$DIMCLRE
 70
0
  9
$DIMCLRT
 70
0
  9
$DIMTFAC
 40
1.0
  9
$DIMGAP
 40
2.0
  9
$DIMJUST
 70
0
  9
$DIMSD1
 70
0
  9
$DIMSD2
 70
0
  9
$DIMTOLJ
 70
1
  9
$DIMTZIN
 70
0
  9
$DIMALTZ
 70
0
  9
$DIMALTTZ
 70
0
  9
$DIMUPT
 70
0
  9
$DIMDEC
 70
2
  9
$DIMTDEC
 70
2
  9
$DIMALTU
 70
2
  9
$DIMALTTD
 70
2
  9
$DIMTXSTY
  7
Standard
  9
$DIMAUNIT
 70
0
  9
$DIMADEC
 70
2
  9
$DIMALTRND
 40
0.0
  9
$DIMAZIN
 70
2
  9
$DIMDSEP
 70
46
  9
$DIMATFIT
 70
3
  9
$DIMFRAC
 70
1
  9
$DIMLDRBLK
  1

  9
$DIMLUNIT
 70
2
  9
$DIMLWD
 70
-2
  9
$DIMLWE
 70
-2
  9
$DIMTMOVE
 70
0
  9
$DIMFXL
 40
1.0
  9
$DIMFXLON
 70
0
  9
$DIMJOGANG
 40
0.785398163397
  9
$DIMTFILL
 70
0
  9
$DIMTFILLCLR
 70
0
  9
$DIMARCSYM
 70
0
  9
$DIMLTYPE
  6

  9
$DIMLTEX1
  6

  9
$DIMLTEX2
  6

  9
$DIMTXTDIRECTION
 70
0
  9
$LUNITS
 70
2
  9
$LUPREC
 70
4
  9
$SKETCHINC
 40
0.1
  9
$FILLETRAD
 40
0.0
  9
$AUNITS
 70
4
  9
$AUPREC
 70
5
  9
$MENU
  1
.
  9
$ELEVATION
 40
0.0
  9
$PELEVATION
 40
0.0
  9
$THICKNESS
 40
0.0
  9
$LIMCHECK
 70
0
  9
$CHAMFERA
 40
0.0
  9
$CHAMFERB
 40
0.0
  9
$CHAMFERC
 40
0.0
  9
$CHAMFERD
 40
0.0
  9
$SKPOLY
 70
0
  9
$TDCREATE
 40
2457986.69756
  9
$TDUCREATE
 40
2455631.2632
  9
$TDUPDATE
 40
2457986.69756
  9
$TDUUPDATE
 40
2456436.43179
  9
$TDINDWG
 40
0.0003490741
  9
$TDUSRTIMER
 40
0.0003487153
  9
$USRTIMER
 70
1
  9
$ANGBASE
 50
0.0
  9
$ANGDIR
 70
0
  9
$PDMODE
 70
0
  9
$PDSIZE
 40
0.0
  9
$PLINEWID
 40
0.0
  9
$SPLFRAME
 70
0
  9
$SPLINETYPE
 70
6
  9
$SPLINESEGS
 70
8
  9
$HANDSEED
  5
5C7
  9
$SURFTAB1
 70
6
  9
$SURFTAB2
 70
6
  9
$SURFTYPE
 70
6
  9
$SURFU
 70
6
  9
$SURFV
 70
6
  9
$UCSBASE
  2

  9
$UCSNAME
  2

  9
$UCSORG
 10
0.0
 20
0.0
 30
0.0
  9
$UCSXDIR
 10
1.0
 20
0.0
 30
0.0
  9
$UCSYDIR
 10
0.0
 20
1.0
 30
0.0
  9
$UCSORTHOREF
  2

  9
$UCSORTHOVIEW
 70
0
  9
$UCSORGTOP
 10
0.0
 20
0.0
 30
0.0
  9
$UCSORGBOTTOM
 10
0.0
 20
0.0
 30
0.0
  9
$UCSORGLEFT
 10
0.0
 20
0.0
 30
0.0
  9
$UCSORGRIGHT
 10
0.0
 20
0.0
 30
0.0
  9
$UCSORGFRONT
 10
0.0
 20
0.0
 30
0.0
  9
$UCSORGBACK
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSBASE
  2

  9
$PUCSNAME
  2

  9
$PUCSORG
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSXDIR
 10
1.0
 20
0.0
 30
0.0
  9
$PUCSYDIR
 10
0.0
 20
1.0
 30
0.0
  9
$PUCSORTHOREF
  2

  9
$PUCSORTHOVIEW
 70
0
  9
$PUCSORGTOP
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSORGBOTTOM
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSORGLEFT
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSORGRIGHT
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSORGFRONT
 10
0.0
 20
0.0
 30
0.0
  9
$PUCSORGBACK
 10
0.0
 20
0.0
 30
0.0
  9
$USERI1
 70
0
  9
$USERI2
 70
0
  9
$USERI3
 70
0
  9
$USERI4
 70
0
  9
$USERI5
 70
0
  9
$USERR1
 40
0.0
  9
$USERR2
 40
0.0
  9
$USERR3
 40
0.0
  9
$USERR4
 40
0.0
  9
$USERR5
 40
0.0
  9
$WORLDVIEW
 70
1
  9
$SHADEDGE
 70
3
  9
$SHADEDIF
 70
70
  9
$TILEMODE
 70
1
  9
$MAXACTVP
 70
64
  9
$PINSBASE
 10
0.0
 20
0.0
 30
0.0
  9
$PLIMCHECK
 70
0
  9
$PEXTMIN
 10
0.628866766397
 20
0.799999952316
 30
0.0
  9
$PEXTMAX
 10
9.02886638493
 20
7.19999957085
 30
0.0
  9
$PLIMMIN
 10
-0.700541819174
 20
-0.228100386192
  9
$PLIMMAX
 10
10.2994579405
 20
8.27189937351
  9
$UNITMODE
 70
0
  9
$VISRETAIN
 70
1
  9
$PLINEGEN
 70
0
  9
$PSLTSCALE
 70
1
  9
$TREEDEPTH
 70
3020
  9
$CMLSTYLE
  2
Standard
  9
$CMLJUST
 70
0
  9
$CMLSCALE
 40
1.0
  9
$PROXYGRAPHICS
 70
1
  9
$MEASUREMENT
 70
1
  9
$CELWEIGHT
370
-1
  9
$ENDCAPS
280
0
  9
$JOINSTYLE
280
0
  9
$LWDISPLAY
290
0
  9
$INSUNITS
 70
4
  9
$HYPERLINKBASE
  1

  9
$STYLESHEET
  1

  9
$XEDIT
290
1
  9
$CEPSNTYPE
380
0
  9
$PSTYLEMODE
290
1
  9
$FINGERPRINTGUID
  2
{39DB1BDD-BC6C-46D3-A333-DFCC0DC4782D}
  9
$VERSIONGUID
  2
{69EEBB2D-7039-498F-9366-3F994E4A07E7}
  9
$EXTNAMES
290
1
  9
$PSVPSCALE
 40
0.0
  9
$OLESTARTUP
290
0
  9
$SORTENTS
280
127
  9
$INDEXCTL
280
0
  9
$HIDETEXT
280
1
  9
$XCLIPFRAME
280
0
  9
$HALOGAP
280
0
  9
$OBSCOLOR
 70
257
  9
$OBSLTYPE
280
0
  9
$INTERSECTIONDISPLAY
280
0
  9
$INTERSECTIONCOLOR
 70
257
  9
$DIMASSOC
280
2
  9
$PROJECTNAME
  1

  9
$CAMERADISPLAY
290
0
  9
$LENSLENGTH
 40
50.0
  9
$CAMERAHEIGHT
 40
0.0
  9
$STEPSPERSEC
 40
2.0
  9
$STEPSIZE
 40
6.0
  9
$3DDWFPREC
 40
2.0
  9
$PSOLWIDTH
 40
0.25
  9
$PSOLHEIGHT
 40
4.0
  9
$LOFTANG1
 40
1.57079632679
  9
$LOFTANG2
 40
1.57079632679
  9
$LOFTMAG1
 40
0.0
  9
$LOFTMAG2
 40
0.0
  9
$LOFTPARAM
 70
7
  9
$LOFTNORMALS
280
1
  9
$LATITUDE
 40
37.795
  9
$LONGITUDE
 40
-122.394
  9
$NORTHDIRECTION
 40
0.0
  9
$TIMEZONE
 70
-8000
  9
$LIGHTGLYPHDISPLAY
280
1
  9
$TILEMODELIGHTSYNCH
280
1
  9
$CMATERIAL
347
96
  9
$SOLIDHIST
280
1
  9
$SHOWHIST
280
1
  9
$DWFFRAME
280
2
  9
$DGNFRAME
280
0
  9
$REALWORLDSCALE
290
1
  9
$INTERFERECOLOR
 62
1
  9
$INTERFEREOBJVS
345
A3
  9
$INTERFEREVPVS
346
A0
  9
$CSHADOW
280
0
  9
$SHADOWPLANELOCATION
 40
0.0
  0
ENDSEC`
  return content
}

const dxfClasses = function () {
  const content = `  0
SECTION
  2
CLASSES
  0
CLASS
  1
ACDBDICTIONARYWDFLT
  2
AcDbDictionaryWithDefault
  3
ObjectDBX Classes
 90
0
 91
1
280
0
281
0
  0
CLASS
  1
DICTIONARYVAR
  2
AcDbDictionaryVar
  3
ObjectDBX Classes
 90
0
 91
15
280
0
281
0
  0
CLASS
  1
TABLESTYLE
  2
AcDbTableStyle
  3
ObjectDBX Classes
 90
4095
 91
1
280
0
281
0
  0
CLASS
  1
MATERIAL
  2
AcDbMaterial
  3
ObjectDBX Classes
 90
1153
 91
3
280
0
281
0
  0
CLASS
  1
VISUALSTYLE
  2
AcDbVisualStyle
  3
ObjectDBX Classes
 90
4095
 91
26
280
0
281
0
  0
CLASS
  1
SCALE
  2
AcDbScale
  3
ObjectDBX Classes
 90
1153
 91
17
280
0
281
0
  0
CLASS
  1
MLEADERSTYLE
  2
AcDbMLeaderStyle
  3
ACDB_MLEADERSTYLE_CLASS
 90
4095
 91
3
280
0
281
0
  0
CLASS
  1
CELLSTYLEMAP
  2
AcDbCellStyleMap
  3
ObjectDBX Classes
 90
1152
 91
2
280
0
281
0
  0
CLASS
  1
EXACXREFPANELOBJECT
  2
ExAcXREFPanelObject
  3
EXAC_ESW
 90
1025
 91
0
280
0
281
0
  0
CLASS
  1
NPOCOLLECTION
  2
AcDbImpNonPersistentObjectsCollection
  3
ObjectDBX Classes
 90
1153
 91
0
280
0
281
0
  0
CLASS
  1
LAYER_INDEX
  2
AcDbLayerIndex
  3
ObjectDBX Classes
 90
0
 91
0
280
0
281
0
  0
CLASS
  1
SPATIAL_INDEX
  2
AcDbSpatialIndex
  3
ObjectDBX Classes
 90
0
 91
0
280
0
281
0
  0
CLASS
  1
IDBUFFER
  2
AcDbIdBuffer
  3
ObjectDBX Classes
 90
0
 91
0
280
0
281
0
  0
CLASS
  1
DIMASSOC
  2
AcDbDimAssoc
  3
"AcDbDimAssoc|Product Desc:     AcDim ARX App For Dimension|Company:          Autodesk, Inc.|WEB Address:      www.autodesk.com"
 90
0
 91
0
280
0
281
0
  0
CLASS
  1
ACDBSECTIONVIEWSTYLE
  2
AcDbSectionViewStyle
  3
ObjectDBX Classes
 90
1025
 91
1
280
0
281
0
  0
CLASS
  1
ACDBDETAILVIEWSTYLE
  2
AcDbDetailViewStyle
  3
ObjectDBX Classes
 90
1025
 91
1
280
0
281
0
  0
CLASS
  1
IMAGEDEF
  2
AcDbRasterImageDef
  3
ISM
 90
0
 91
1
280
0
281
0
  0
CLASS
  1
RASTERVARIABLES
  2
AcDbRasterVariables
  3
ISM
 90
0
 91
1
280
0
281
0
  0
CLASS
  1
IMAGEDEF_REACTOR
  2
AcDbRasterImageDefReactor
  3
ISM
 90
1
 91
1
280
0
281
0
  0
CLASS
  1
IMAGE
  2
AcDbRasterImage
  3
ISM
 90
2175
 91
1
280
0
281
1
  0
CLASS
  1
PDFDEFINITION
  2
AcDbPdfDefinition
  3
ObjectDBX Classes
 90
1153
 91
1
280
0
281
0
  0
CLASS
  1
PDFUNDERLAY
  2
AcDbPdfReference
  3
ObjectDBX Classes
 90
4095
 91
1
280
0
281
1
  0
CLASS
  1
DWFDEFINITION
  2
AcDbDwfDefinition
  3
ObjectDBX Classes
 90
1153
 91
2
280
0
281
0
  0
CLASS
  1
DWFUNDERLAY
  2
AcDbDwfReference
  3
ObjectDBX Classes
 90
1153
 91
1
280
0
281
1
  0
CLASS
  1
DGNDEFINITION
  2
AcDbDgnDefinition
  3
ObjectDBX Classes
 90
1153
 91
2
280
0
281
0
  0
CLASS
  1
DGNUNDERLAY
  2
AcDbDgnReference
  3
ObjectDBX Classes
 90
1153
 91
1
280
0
281
1
  0
ENDSEC`
  return content
}

const dxfTables = function () {
  const content = `  0
SECTION
  2
TABLES
  0
TABLE
  2
VPORT
  5
8
330
0
100
AcDbSymbolTable
 70
0
  0
ENDTAB
  0
TABLE
  2
LTYPE
  5
5F
330
0
100
AcDbSymbolTable
 70
7
  0
LTYPE
  5
14
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
ByBlock
 70
0
  3

 72
65
 73
0
 40
0.0
  0
LTYPE
  5
15
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
ByLayer
 70
0
  3

 72
65
 73
0
 40
0.0
  0
LTYPE
  5
16
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
Continuous
 70
0
  3
Solid line
 72
65
 73
0
 40
0.0
  0
LTYPE
  5
1B1
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
CENTER
 70
0
  3
Center ____ _ ____ _ ____ _ ____ _ ____ _ ____
 72
65
 73
4
 40
2.0
 49
1.25
 74
0
 49
-0.25
 74
0
 49
0.25
 74
0
 49
-0.25
 74
0
  0
LTYPE
  5
1B2
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
DASHED
 70
0
  3
Dashed __ __ __ __ __ __ __ __ __ __ __ __ __ _
 72
65
 73
2
 40
0.75
 49
0.5
 74
0
 49
-0.25
 74
0
  0
LTYPE
  5
1B3
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
PHANTOM
 70
0
  3
Phantom ______  __  __  ______  __  __  ______
 72
65
 73
6
 40
2.5
 49
1.25
 74
0
 49
-0.25
 74
0
 49
0.25
 74
0
 49
-0.25
 74
0
 49
0.25
 74
0
 49
-0.25
 74
0
  0
LTYPE
  5
39E
330
5F
100
AcDbSymbolTableRecord
100
AcDbLinetypeTableRecord
  2
HIDDEN
 70
0
  3
Hidden __ __ __ __ __ __ __ __ __ __ __ __ __ __
 72
65
 73
2
 40
9.525
 49
6.35
 74
0
 49
-3.175
 74
0
  0
ENDTAB
  0
TABLE
  2
LAYER
  5
2
330
0
100
AcDbSymbolTable
 70
3
  0
LAYER
  5
10
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
0
 70
0
  6
Continuous
370
-3
390
F
347
98
348
0
  0
LAYER
  5
1B4
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
View Port
 70
0
  6
Continuous
290
0
370
-3
390
F
347
98
348
0
  0
LAYER
  5
21D
330
2
100
AcDbSymbolTableRecord
100
AcDbLayerTableRecord
  2
Defpoints
 70
0
  6
Continuous
290
0
370
-3
390
F
347
98
348
0
  0
ENDTAB
  0
TABLE
  2
STYLE
  5
3
330
0
100
AcDbSymbolTable
 70
3
  0
STYLE
  5
11
330
3
100
AcDbSymbolTableRecord
100
AcDbTextStyleTableRecord
  2
Standard
 70
0
 40
0.0
 41
1.0
 50
0.0
 71
0
 42
0.2
  3
arial.ttf
  4

  0
STYLE
  5
DC
330
3
100
AcDbSymbolTableRecord
100
AcDbTextStyleTableRecord
  2
Annotative
 70
0
 40
0.0
 41
1.0
 50
0.0
 71
0
 42
0.2
  3
arial.ttf
  4

  0
STYLE
  5
178
330
3
100
AcDbSymbolTableRecord
100
AcDbTextStyleTableRecord
  2
Notes
 70
0
 40
3.0
 41
1.0
 50
0.0
 71
0
 42
0.2
  3
arial.ttf
  4

  0
ENDTAB
  0
TABLE
  2
VIEW
  5
6
330
0
100
AcDbSymbolTable
 70
0
  0
ENDTAB
  0
TABLE
  2
UCS
  5
7
330
0
100
AcDbSymbolTable
 70
0
  0
ENDTAB
  0
TABLE
  2
APPID
  5
9
330
0
100
AcDbSymbolTable
 70
12
  0
APPID
  5
12
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD
 70
0
  0
APPID
  5
DD
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
AcadAnnoPO
 70
0
  0
APPID
  5
DE
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
AcadAnnotative
 70
0
  0
APPID
  5
DF
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_DSTYLE_DIMJAG
 70
0
  0
APPID
  5
E0
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_DSTYLE_DIMTALN
 70
0
  0
APPID
  5
107
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_MLEADERVER
 70
0
  0
APPID
  5
1B5
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
AcAecLayerStandard
 70
0
  0
APPID
  5
1BA
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_EXEMPT_FROM_CAD_STANDARDS
 70
0
  0
APPID
  5
237
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_DSTYLE_DIMBREAK
 70
0
  0
APPID
  5
28E
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_PSEXT
 70
0
  0
APPID
  5
4B0
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
ACAD_NAV_VCDISPLAY
 70
0
  0
APPID
  5
4E3
330
9
100
AcDbSymbolTableRecord
100
AcDbRegAppTableRecord
  2
HATCHBACKGROUNDCOLOR
 70
0
  0
ENDTAB
  0
TABLE
  2
DIMSTYLE
  5
A
330
0
100
AcDbSymbolTable
 70
3
100
AcDbDimStyleTable
 71
3
340
242
340
27
340
E1
  0
DIMSTYLE
105
27
330
A
100
AcDbSymbolTableRecord
100
AcDbDimStyleTableRecord
  2
Standard
 70
0
 41
3.0
 42
2.0
 43
9.0
 44
5.0
140
3.0
141
2.0
147
2.0
340
11
1001
ACAD_DSTYLE_DIMJAG
1070
388
1040
38.0
1001
ACAD_DSTYLE_DIMBREAK
1070
391
1040
90.0
1001
ACAD_DSTYLE_DIMTALN
1070
392
1070
0
  0
DIMSTYLE
105
E1
330
A
100
AcDbSymbolTableRecord
100
AcDbDimStyleTableRecord
  2
Annotative
 70
0
 40
0.0
 41
3.0
 42
2.5
 43
10.0
 44
5.0
140
3.0
141
2.0
147
2.0
340
11
1001
AcadAnnotative
1000
AnnotativeData
1002
{
1070
1
1070
1
1002
}
1001
ACAD_DSTYLE_DIMJAG
1070
388
1040
38.0
1001
ACAD_DSTYLE_DIMBREAK
1070
391
1040
90.0
1001
ACAD_DSTYLE_DIMTALN
1070
392
1070
0
  0
DIMSTYLE
105
242
330
A
100
AcDbSymbolTableRecord
100
AcDbDimStyleTableRecord
  2
Civil-Metric
 70
0
 41
3.0
 42
1.5
 43
6.0
 44
3.0
 73
0
 74
0
 77
1
 78
3
 79
2
140
3.0
141
3.0
147
2.0
179
2
271
2
272
2
276
1
340
11
1001
ACAD_DSTYLE_DIMBREAK
1070
391
1040
3.0
1001
ACAD_DSTYLE_DIMJAG
1070
388
1040
38.0
1001
ACAD_DSTYLE_DIMTALN
1070
392
1070
0
  0
ENDTAB
  0
TABLE
  2
BLOCK_RECORD
  5
1
330
0
100
AcDbSymbolTable
 70
4
  0
BLOCK_RECORD
  5
1F
330
1
100
AcDbSymbolTableRecord
100
AcDbBlockTableRecord
  2
*Model_Space
340
530
 70
0
280
1
281
0
  0
BLOCK_RECORD
  5
58
330
1
100
AcDbSymbolTableRecord
100
AcDbBlockTableRecord
  2
*Paper_Space
340
531
 70
0
280
1
281
0
  0
BLOCK_RECORD
  5
238
330
1
100
AcDbSymbolTableRecord
100
AcDbBlockTableRecord
  2
_ArchTick
340
0
 70
0
280
1
281
0
  0
BLOCK_RECORD
  5
23C
330
1
100
AcDbSymbolTableRecord
100
AcDbBlockTableRecord
  2
_Open30
340
0
 70
0
280
1
281
0
  0
ENDTAB
  0
ENDSEC`
  return content
}

const dxfBlocks = function () {
  const content = `  0
SECTION
  2
BLOCKS
  0
BLOCK
  5
23A
330
238
100
AcDbEntity
  8
0
100
AcDbBlockBegin
  2
_ArchTick
 70
0
 10
0.0
 20
0.0
 30
0.0
  3
_ArchTick
  1

  0
ENDBLK
  5
23B
330
238
100
AcDbEntity
  8
0
100
AcDbBlockEnd
  0
BLOCK
  5
20
330
1F
100
AcDbEntity
  8
0
100
AcDbBlockBegin
  2
*Model_Space
 70
0
 10
0.0
 20
0.0
 30
0.0
  3
*Model_Space
  1

  0
ENDBLK
  5
21
330
1F
100
AcDbEntity
  8
0
100
AcDbBlockEnd
  0
BLOCK
  5
5A
330
58
100
AcDbEntity
 67
1
  8
0
100
AcDbBlockBegin
  2
*Paper_Space
 70
0
 10
0.0
 20
0.0
 30
0.0
  3
*Paper_Space
  1

  0
ENDBLK
  5
5B
330
58
100
AcDbEntity
 67
1
  8
0
100
AcDbBlockEnd
  0
BLOCK
  5
240
330
23C
100
AcDbEntity
  8
0
100
AcDbBlockBegin
  2
_Open30
 70
0
 10
0.0
 20
0.0
 30
0.0
  3
_Open30
  1

  0
ENDBLK
  5
241
330
23C
100
AcDbEntity
  8
0
100
AcDbBlockEnd
  0
ENDSEC`
  return content
}

const dxfObjects = function () {
  const content = `  0
SECTION
  2
OBJECTS
  0
DICTIONARY
  5
C
330
0
100
AcDbDictionary
281
1
  3
ACAD_COLOR
350
524
  3
ACAD_GROUP
350
525
  3
ACAD_LAYOUT
350
526
  3
ACAD_MATERIAL
350
527
  3
ACAD_MLEADERSTYLE
350
528
  3
ACAD_MLINESTYLE
350
529
  3
ACAD_PLOTSETTINGS
350
52A
  3
ACAD_PLOTSTYLENAME
350
52C
  3
ACAD_SCALELIST
350
52D
  3
ACAD_TABLESTYLE
350
52E
  3
ACAD_VISUALSTYLE
350
52F
  0
DICTIONARY
  5
524
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
525
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
526
330
C
100
AcDbDictionary
281
1
  3
Model
350
530
  3
Layout1
350
531
  0
DICTIONARY
  5
527
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
528
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
529
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
52A
330
C
100
AcDbDictionary
281
1
  0
ACDBPLACEHOLDER
  5
52B
330
52C
  0
ACDBDICTIONARYWDFLT
  5
52C
330
C
100
AcDbDictionary
281
1
  3
Normal
350
52B
100
AcDbDictionaryWithDefault
340
52B
  0
DICTIONARY
  5
52D
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
52E
330
C
100
AcDbDictionary
281
1
  0
DICTIONARY
  5
52F
330
C
100
AcDbDictionary
281
1
  0
LAYOUT
  5
530
330
526
100
AcDbPlotSettings
  1

  2
DWFx ePlot (XPS Compatible).pc3
  4
ANSI_A_(8.50_x_11.00_Inches)
  6

 40
5.8
 41
17.8
 42
5.8
 43
17.8
 44
215.9
 45
279.4
 46
0.0
 47
0.0
 48
0.0
 49
0.0
140
0.0
141
0.0
142
1.0
143
14.53
 70
11952
 72
0
 73
1
 74
0
  7

 75
0
147
0.069
148
114.98
149
300.29
100
AcDbLayout
  1
Model
 70
1
 71
0
 10
0.0
 20
0.0
 11
12.0
 21
9.0
 12
0.0
 22
0.0
 32
0.0
 14
0.0
 24
0.0
 34
0.0
 15
0.0
 25
0.0
 35
0.0
146
0.0
 13
0.0
 23
0.0
 33
0.0
 16
1.0
 26
0.0
 36
0.0
 17
0.0
 27
1.0
 37
0.0
 76
0
330
1F
  0
LAYOUT
  5
531
330
526
100
AcDbPlotSettings
  1

  2
DWFx ePlot (XPS Compatible).pc3
  4
ANSI_A_(8.50_x_11.00_Inches)
  6

 40
5.8
 41
17.8
 42
5.8
 43
17.8
 44
215.9
 45
279.4
 46
0.0
 47
0.0
 48
0.0
 49
0.0
140
0.0
141
0.0
142
1.0
143
1.0
 70
688
 72
0
 73
1
 74
5
  7
acad.ctb
 75
16
147
1.0
148
0.0
149
0.0
100
AcDbLayout
  1
Layout1
 70
1
 71
1
 10
-0.7
 20
-0.23
 11
10.3
 21
8.27
 12
0.0
 22
0.0
 32
0.0
 14
0.63
 24
0.8
 34
0.0
 15
9.0
 25
7.2
 35
0.0
146
0.0
 13
0.0
 23
0.0
 33
0.0
 16
1.0
 26
0.0
 36
0.0
 17
0.0
 27
1.0
 37
0.0
 76
0
330
58
  0
ENDSEC`
  return content
}

module.exports = {
  dxfHeaders,
  dxfClasses,
  dxfTables,
  dxfBlocks,
  dxfObjects
}

},{}],11:[function(require,module,exports){
/*
 * AutoCAD 2017 2018 Color Index (1-255) as RGB + ALPHA colors
 */

const colorIndex = [
  [0, 0, 0, 255], // index 0, added for easy maintenance
  // 1
  [255, 0, 0, 255],
  [255, 255, 0, 255],
  [0, 255, 0, 255],
  [0, 255, 255, 255],
  [0, 0, 255, 255],
  [255, 0, 255, 255],
  [255, 255, 255, 255],
  [128, 128, 128, 255],
  [192, 192, 192, 255],
  [255, 0, 0, 255],
  // 11
  [255, 127, 127, 255],
  [165, 0, 0, 255],
  [165, 82, 82, 255],
  [127, 0, 0, 255],
  [127, 63, 63, 255],
  [76, 0, 0, 255],
  [76, 38, 38, 255],
  [38, 0, 0, 255],
  [38, 19, 19, 255],
  [255, 63, 0, 255],
  // 21
  [255, 159, 127, 255],
  [165, 41, 0, 255],
  [165, 103, 82, 255],
  [127, 31, 0, 255],
  [127, 79, 63, 255],
  [76, 19, 0, 255],
  [76, 47, 38, 255],
  [38, 9, 0, 255],
  [38, 28, 19, 255],
  [255, 127, 0, 255],
  // 31
  [255, 191, 127, 255],
  [165, 82, 0, 255],
  [165, 124, 82, 255],
  [127, 63, 0, 255],
  [127, 95, 63, 255],
  [76, 38, 0, 255],
  [76, 57, 38, 255],
  [38, 19, 0, 255],
  [38, 28, 19, 255],
  [255, 191, 0, 255],
  // 41
  [255, 223, 127, 255],
  [165, 124, 0, 255],
  [165, 145, 82, 255],
  [127, 95, 0, 255],
  [127, 111, 63, 255],
  [76, 57, 0, 255],
  [76, 66, 38, 255],
  [38, 28, 0, 255],
  [38, 33, 19, 255],
  [255, 255, 0, 255],
  // 51
  [255, 255, 127, 255],
  [165, 165, 0, 255],
  [165, 165, 82, 255],
  [127, 127, 0, 255],
  [127, 127, 63, 255],
  [76, 76, 0, 255],
  [76, 76, 38, 255],
  [38, 38, 0, 255],
  [38, 38, 19, 255],
  [191, 255, 0, 255],
  // 61
  [223, 255, 127, 255],
  [124, 165, 0, 255],
  [145, 165, 82, 255],
  [95, 127, 0, 255],
  [111, 127, 63, 255],
  [57, 76, 0, 255],
  [66, 76, 38, 255],
  [28, 38, 0, 255],
  [33, 38, 19, 255],
  [127, 255, 0, 255],
  // 71
  [191, 255, 127, 255],
  [82, 165, 0, 255],
  [124, 165, 82, 255],
  [63, 127, 0, 255],
  [95, 127, 63, 255],
  [38, 76, 0, 255],
  [57, 76, 38, 255],
  [19, 38, 0, 255],
  [28, 38, 19, 255],
  [63, 255, 0, 255],
  // 81
  [159, 255, 127, 255],
  [41, 165, 0, 255],
  [103, 165, 82, 255],
  [31, 127, 0, 255],
  [79, 127, 63, 255],
  [19, 76, 0, 255],
  [47, 76, 38, 255],
  [9, 38, 0, 255],
  [23, 38, 19, 255],
  [0, 255, 0, 255],
  // 91
  [125, 255, 127, 255],
  [0, 165, 0, 255],
  [82, 165, 82, 255],
  [0, 127, 0, 255],
  [63, 127, 63, 255],
  [0, 76, 0, 255],
  [38, 76, 38, 255],
  [0, 38, 0, 255],
  [19, 38, 19, 255],
  [0, 255, 63, 255],
  // 101
  [127, 255, 159, 255],
  [0, 165, 41, 255],
  [82, 165, 103, 255],
  [0, 127, 31, 255],
  [63, 127, 79, 255],
  [0, 76, 19, 255],
  [38, 76, 47, 255],
  [0, 38, 9, 255],
  [19, 88, 23, 255],
  [0, 255, 127, 255],
  // 111
  [127, 255, 191, 255],
  [0, 165, 82, 255],
  [82, 165, 124, 255],
  [0, 127, 63, 255],
  [63, 127, 95, 255],
  [0, 76, 38, 255],
  [38, 76, 57, 255],
  [0, 38, 19, 255],
  [19, 88, 28, 255],
  [0, 255, 191, 255],
  // 121
  [127, 255, 223, 255],
  [0, 165, 124, 255],
  [82, 165, 145, 255],
  [0, 127, 95, 255],
  [63, 127, 111, 255],
  [0, 76, 57, 255],
  [38, 76, 66, 255],
  [0, 38, 28, 255],
  [19, 88, 88, 255],
  [0, 255, 255, 255],
  // 131
  [127, 255, 255, 255],
  [0, 165, 165, 255],
  [82, 165, 165, 255],
  [0, 127, 127, 255],
  [63, 127, 127, 255],
  [0, 76, 76, 255],
  [38, 76, 76, 255],
  [0, 38, 38, 255],
  [19, 88, 88, 255],
  [0, 191, 255, 255],
  // 141
  [127, 223, 255, 255],
  [0, 124, 165, 255],
  [82, 145, 165, 255],
  [0, 95, 127, 255],
  [63, 111, 217, 255],
  [0, 57, 76, 255],
  [38, 66, 126, 255],
  [0, 28, 38, 255],
  [19, 88, 88, 255],
  [0, 127, 255, 255],
  // 151
  [127, 191, 255, 255],
  [0, 82, 165, 255],
  [82, 124, 165, 255],
  [0, 63, 127, 255],
  [63, 95, 127, 255],
  [0, 38, 76, 255],
  [38, 57, 126, 255],
  [0, 19, 38, 255],
  [19, 28, 88, 255],
  [0, 63, 255, 255],
  // 161
  [127, 159, 255, 255],
  [0, 41, 165, 255],
  [82, 103, 165, 255],
  [0, 31, 127, 255],
  [63, 79, 127, 255],
  [0, 19, 76, 255],
  [38, 47, 126, 255],
  [0, 9, 38, 255],
  [19, 23, 88, 255],
  [0, 0, 255, 255],
  // 171
  [127, 127, 255, 255],
  [0, 0, 165, 255],
  [82, 82, 165, 255],
  [0, 0, 127, 255],
  [63, 63, 127, 255],
  [0, 0, 76, 255],
  [38, 38, 126, 255],
  [0, 0, 38, 255],
  [19, 19, 88, 255],
  [63, 0, 255, 255],
  // 181
  [159, 127, 255, 255],
  [41, 0, 165, 255],
  [103, 82, 165, 255],
  [31, 0, 127, 255],
  [79, 63, 127, 255],
  [19, 0, 76, 255],
  [47, 38, 126, 255],
  [9, 0, 38, 255],
  [23, 19, 88, 255],
  [127, 0, 255, 255],
  // 191
  [191, 127, 255, 255],
  [165, 0, 82, 255],
  [124, 82, 165, 255],
  [63, 0, 127, 255],
  [95, 63, 127, 255],
  [38, 0, 76, 255],
  [57, 38, 126, 255],
  [19, 0, 38, 255],
  [28, 19, 88, 255],
  [191, 0, 255, 255],
  // 201
  [223, 127, 255, 255],
  [124, 0, 165, 255],
  [142, 82, 165, 255],
  [95, 0, 127, 255],
  [111, 63, 127, 255],
  [57, 0, 76, 255],
  [66, 38, 76, 255],
  [28, 0, 38, 255],
  [88, 19, 88, 255],
  [255, 0, 255, 255],
  // 211
  [255, 127, 255, 255],
  [165, 0, 165, 255],
  [165, 82, 165, 255],
  [127, 0, 127, 255],
  [127, 63, 127, 255],
  [76, 0, 76, 255],
  [76, 38, 76, 255],
  [38, 0, 38, 255],
  [88, 19, 88, 255],
  [255, 0, 191, 255],
  // 221
  [255, 127, 223, 255],
  [165, 0, 124, 255],
  [165, 82, 145, 255],
  [127, 0, 95, 255],
  [127, 63, 111, 255],
  [76, 0, 57, 255],
  [76, 38, 66, 255],
  [38, 0, 28, 255],
  [88, 19, 88, 255],
  [255, 0, 127, 255],
  // 231
  [255, 127, 191, 255],
  [165, 0, 82, 255],
  [165, 82, 124, 255],
  [127, 0, 63, 255],
  [127, 63, 95, 255],
  [76, 0, 38, 255],
  [76, 38, 57, 255],
  [38, 0, 19, 255],
  [88, 19, 28, 255],
  [255, 0, 63, 255],
  // 241
  [255, 127, 159, 255],
  [165, 0, 41, 255],
  [165, 82, 103, 255],
  [127, 0, 31, 255],
  [127, 63, 79, 255],
  [76, 0, 19, 255],
  [76, 38, 47, 255],
  [38, 0, 9, 255],
  [88, 19, 23, 255],
  [0, 0, 0, 255],
  // 251
  [101, 101, 101, 255],
  [102, 102, 102, 255],
  [153, 153, 153, 255],
  [204, 204, 204, 255],
  [255, 255, 255, 255]
]

module.exports = colorIndex

},{}],12:[function(require,module,exports){
/*
JSCAD Object to AutoCAD DXF Entity Serialization

## License

Copyright (c) 2018 Z3 Development https://github.com/z3dev

All code released under MIT license

Notes:
1) geom2 conversion to:
     POLYLINE
     LWPOLYLINE
2) geom3 conversion to:
     3DFACE
     POLYLINE (face mesh)
3) path2 conversion to:
     LWPOLYLINE
TBD
1) support binary output
2) add color conversion
*/

const { geometries, modifiers } = require('@jscad/modeling')
const { geom3, geom2, path2 } = geometries

const { flatten, toArray } = require('@jscad/array-utils')

const { dxfHeaders, dxfClasses, dxfTables, dxfBlocks, dxfObjects } = require('./autocad_AC2017')
const colorindex2017 = require('./colorindex2017')

const mimeType = 'application/dxf'

/**
 * Serializer of JSCAD geometries to DXF entities.
 * @module io/dxf-serializer
 * @example
 * const { serializer, mimeType } = require('@jscad/dxf-serializer')
 */

/**
 * Serialize the give objects to AutoCad DXF format.
 * @param {Object} options - options for serialization, REQUIRED
 * @param {String} [options.geom2To='lypolyline'] - target entity for 2D geometries, 'lwpolyline' or 'polyline'
 * @param {String} [options.geom3To='3dface'] - target entity for 3D geometries, '3dface' or 'polyline'
 * @param {Object|Array} objects - objects to serialize as DXF
 * @returns {Array} serialized contents, DXF format
 * @alias module:io/dxf-serializer.serialize
 * @example
 * const geometry = primitives.cube()
 * const dxfData = serializer({geom3To: '3dface'}, geometry)
 */
const serialize = (options, ...objects) => {
  const defaults = {
    geom2To: 'lwpolyline', // or polyline
    geom3To: '3dface', // or polyline
    pathTo: 'lwpolyline',
    statusCallback: null,
    colorIndex: colorindex2017
  }
  options = Object.assign({}, defaults, options)

  options.entityId = 0 // sequence id for entities created

  objects = flatten(objects)

  objects = objects.filter((object) => geom3.isA(object) || geom2.isA(object) || path2.isA(object))

  if (objects.length === 0) throw new Error('only JSCAD geometries can be serialized to DXF')

  // convert to triangles
  objects = toArray(modifiers.generalize({ snap: true, triangulate: true }, objects))

  const dxfContent = `999
Created by JSCAD
${dxfHeaders(options)}
${dxfClasses(options)}
${dxfTables(options)}
${dxfBlocks(options)}
${dxfEntities(objects, options)}
${dxfObjects(options)}
  0
EOF
`
  return [dxfContent]
}

/**
 * Serialize the given objects as a DXF entity section
 * @param {Array} objects - objects to serialize as DXF
 * @param {Object} options - options for serialization
 * @returns {Object} serialized contents, DXF format
 */
const dxfEntities = (objects, options) => {
  const entityContents = objects.map((object, i) => {
    if (geom2.isA(object)) {
      const color = object.color
      const name = object.name
      const outlines = geom2.toOutlines(object)
      const paths = outlines.map((outline) => ({ closed: true, points: outline, color, name }))
      if (options.geom2To === 'polyline') {
        return PathsToPolyine(paths, options)
      }
      return PathsToLwpolyline(paths, options)
    }
    if (geom3.isA(object)) {
      // TODO object = ensureManifoldness(object)
      if (options.geom3To === 'polyline') {
        return PolygonsToPolyline(object, options)
      }
      return PolygonsTo3DFaces(object, options)
    }
    if (path2.isA(object)) {
      // mimic a path (outline) from geom2
      const color = object.color
      const name = object.name
      const path = { closed: object.isClosed, points: path2.toPoints(object), color, name }
      return PathsToLwpolyline([path], options)
    }
    return ''
  })
  let section = `  0
SECTION
  2
ENTITIES
`
  entityContents.forEach((content) => {
    if (content) {
      section += content
    }
  })
  section += `  0
ENDSEC`
  return section
}

//
// convert the given paths (from 2D outlines) to DXF lwpolyline entities
// @return array of strings
//
// Group Codes Used:
// 5 - Handle, unique HEX value, e.g. 5C6
// 8 - layer name (0 is default layer)
// 67 (0 - model space, 1 - paper space)
// 100 -
//
const PathsToLwpolyline = (paths, options) => {
  options.statusCallback && options.statusCallback({ progress: 0 })
  let str = ''
  paths.forEach((path, i) => {
    if (path.points.length < 1) return
    const numpointsClosed = path.points.length + (path.closed ? 1 : 0)
    str += `  0
LWPOLYLINE
  5
${getEntityId(options)}
  100
AcDbEntity
  3
${getName(path, options)}
  8
0
  67
0
  62
${getColorNumber(path, options)}
  100
AcDbPolyline
  90
${numpointsClosed}
  70
${(path.closed ? 1 : 0)}
`
    for (let pointindex = 0; pointindex < numpointsClosed; pointindex++) {
      let pointindexwrapped = pointindex
      if (pointindexwrapped >= path.points.length) pointindexwrapped -= path.points.length
      const point = path.points[pointindexwrapped]
      str += `  10
${point[0]}
  20
${point[1]}
`
    }
    options.statusCallback && options.statusCallback({ progress: 100 * i / paths.length })
  })
  options.statusCallback && options.statusCallback({ progress: 100 })
  return [str]
}

//
// convert the given paths (from outlines) to DXF polyline (2D line) entities
// @return array of strings
//
const PathsToPolyine = (paths, options) => {
  options.statusCallback && options.statusCallback({ progress: 0 })
  let str = ''
  paths.forEach((path, i) => {
    const numpointsClosed = path.points.length + (path.closed ? 1 : 0)
    str += `  0
POLYLINE
  5
${getEntityId(options)}
  100
AcDbEntity
  3
${getName(path, options)}
  8
0
  62
${getColorNumber(path, options)}
  100
AcDb2dPolyline
`
    for (let pointindex = 0; pointindex < numpointsClosed; pointindex++) {
      let pointindexwrapped = pointindex
      if (pointindexwrapped >= path.points.length) pointindexwrapped -= path.points.length
      const point = path.points[pointindexwrapped]
      str += `  0
VERTEX
  5
${getEntityId(options)}
  100
AcDbEntity
  8
0
  100
AcDbVertex
  100
AcDb2dVertex
 10
${point[0]}
 20
${point[1]}
`
    }
    str += `  0
SEQEND
  5
${getEntityId(options)}
  100
AcDbEntity
`
    options.statusCallback && options.statusCallback({ progress: 100 * i / paths.length })
  })
  options.statusCallback && options.statusCallback({ progress: 100 })
  return [str]
}

//
// convert the given object (geom3) to DXF 3D face entities
// @return array of strings
//
const PolygonsTo3DFaces = (object, options) => {
  options.statusCallback && options.statusCallback({ progress: 0 })
  let str = ''
  const polygons = geom3.toPolygons(object)
  const objectColor = getColorNumber(object, options)
  polygons.forEach((polygon, i) => {
    const polyColor = polygon.color ? getColorNumber(polygon, options) : objectColor
    const triangles = polygonToTriangles(polygon)
    triangles.forEach((triangle, i) => {
      str += triangleTo3DFaces(triangle, options, polyColor)
    })
  })
  options.statusCallback && options.statusCallback({ progress: 100 })
  return [str]
}

//
// convert the given polygon to triangles
//
// NOTE: This only works for CONVEX polygons
const polygonToTriangles = (polygon) => {
  const length = polygon.vertices.length - 2
  if (length < 1) return []

  const pivot = polygon.vertices[0]
  const triangles = []
  for (let i = 0; i < length; i++) {
    triangles.push([pivot, polygon.vertices[i + 1], polygon.vertices[i + 2]])
  }
  return triangles
}

//
// convert the given triangle to DXF 3D face entity
//
const triangleTo3DFaces = (triangle, options, color) => {
  const corner10 = triangle[0]
  const corner11 = triangle[1]
  const corner12 = triangle[2]
  const corner13 = triangle[2] // same in DXF
  const str = `  0
3DFACE
  5
${getEntityId(options)}
  100
AcDbEntity
  8
0
  62
${color}
  100
AcDbFace
  70
0
  10
${corner10[0]}
  20
${corner10[1]}
  30
${corner10[2]}
  11
${corner11[0]}
  21
${corner11[1]}
  31
${corner11[2]}
  12
${corner12[0]}
  22
${corner12[1]}
  32
${corner12[2]}
  13
${corner13[0]}
  23
${corner13[1]}
  33
${corner13[2]}
`
  return str
}

// convert the given object (geom3) to DXF POLYLINE (polyface mesh)
// FIXME The entity types are wrong, resulting in imterpretation as a 3D lines, not faces
// @return array of strings
const PolygonsToPolyline = (object, options) => {
  let str = ''
  const mesh = polygons2polyfaces(geom3.toPolygons(object))
  if (mesh.faces.length > 0) {
    str += `  0
POLYLINE
  5
${getEntityId(options)}
  100
AcDbEntity
  3
${getName(object, options)}
  8
0
  62
${getColorNumber(object, options)}
  100
AcDb3dPolyline
  70
64
  71
${mesh.vertices.length}
  72
${mesh.faces.length}
`
    mesh.vertices.forEach((vertex) => {
      str += `  0
VERTEX
  5
${getEntityId(options)}
  100
AcDbEntity
  8
0
  100
AcDbVertex
  100
AcDb3dPolylineVertex
  10
${vertex[0]}
  20
${vertex[1]}
  30
${vertex[2]}
  70
192
`
    })
    mesh.faces.forEach((face) => {
      str += `  0
VERTEX
  5
${getEntityId(options)}
  100
AcDbEntity
  8
0
  100
AcDbVertex
  100
AcDb3dPolylineVertex
  10
0
  20
0
  30
0
  70
128
  71
${face[0]}
  72
${face[1]}
  73
${face[2]}
  74
${face[3]}
`
    })
  }
  return [str]
}

// convert the given polygons to polyfaces (DXF)
// @return array of faces, array of vertices
const polygons2polyfaces = (polygons) => {
  const faces = []
  const vertices = []
  for (let i = 0; i < polygons.length; ++i) {
    const polygon = polygons[i]
    const face = []
    for (let j = 0; j < polygon.vertices.length; ++j) {
      const vv = polygon.vertices[j]
      vertices.push([vv[0], vv[1], vv[2]])
      face.push(vertices.length)
    }
    while (face.length < 4) { face.push(0) }
    faces.push(face)
  }
  return { faces: faces, vertices: vertices }
}

// get a unique id for a DXF entity
// @return unique id string
const getEntityId = (options) => {
  options.entityId++
  // add more zeros if the id needs to be larger
  const padded = '00000' + options.entityId.toString(16).toUpperCase()
  return 'CAD' + padded.substr(padded.length - 5)
}

const getName = (object, options) => {
  if (object.name) return object.name
  // add more zeros if the id needs to be larger
  const padded = '00000' + options.entityId.toString(16).toUpperCase()
  return 'CAD' + padded.substr(padded.length - 5)
}

const getColorNumber = (object, options) => {
  let colorNumber = 256
  if (object.color) {
    const r = Math.floor(object.color[0] * 255)
    const g = Math.floor(object.color[1] * 255)
    const b = Math.floor(object.color[2] * 255)
    // find the closest Autocad color number
    const index = options.colorIndex
    let closest = 255 + 255 + 255
    for (let i = 1; i < index.length; i++) {
      const rgb = index[i]
      const diff = Math.abs(r - rgb[0]) + Math.abs(g - rgb[1]) + Math.abs(b - rgb[2])
      if (diff < closest) {
        colorNumber = i
        if (diff === 0) break
        closest = diff
      }
    }
  }
  return colorNumber
}

module.exports = {
  serialize,
  mimeType
}

},{"./autocad_AC2017":10,"./colorindex2017":11,"@jscad/array-utils":5,"@jscad/modeling":108}],13:[function(require,module,exports){
// BinaryReader
// Converted to ES5 Class by @z3dev
// Refactored by Vjeux <vjeuxx@gmail.com>
// http://blog.vjeux.com/2010/javascript/javascript-binary-reader.html

// Original
// + Jonas Raoni Soares Silva
// @ http://jsfromhell.com/classes/binary-deserializer [rev. #1]

class BinaryReader {
  /*
   * Construct a BinaryReader from the given data.
   * The data is a string created from the specified sequence of UTF-16 code units.
   * See String.fromCharCode()
   * See _readByte() below
   */
  constructor (data) {
    this._buffer = data
    this._pos = 0
  }

  /* Public */
  readInt8 () { return this._decodeInt(8, true) }
  readUInt8 () { return this._decodeInt(8, false) }
  readInt16 () { return this._decodeInt(16, true) }
  readUInt16 () { return this._decodeInt(16, false) }
  readInt32 () { return this._decodeInt(32, true) }
  readUInt32 () { return this._decodeInt(32, false) }

  readFloat () { return this._decodeFloat(23, 8) }
  readDouble () { return this._decodeFloat(52, 11) }

  readChar () { return this.readString(1) }
  readString (length) {
    this._checkSize(length * 8)
    const result = this._buffer.substr(this._pos, length)
    this._pos += length
    return result
  }

  seek (pos) {
    this._pos = pos
    this._checkSize(0)
  }

  getPosition () {
    return this._pos
  }

  getSize () {
    return this._buffer.length
  }

  /* Private */
  _decodeFloat (precisionBits, exponentBits) {
    const length = precisionBits + exponentBits + 1
    const size = length >> 3
    this._checkSize(length)

    const bias = Math.pow(2, exponentBits - 1) - 1
    const signal = this._readBits(precisionBits + exponentBits, 1, size)
    const exponent = this._readBits(precisionBits, exponentBits, size)
    let significand = 0
    let divisor = 2
    let curByte = 0 // length + (-precisionBits >> 3) - 1;
    let startBit = 0
    do {
      const byteValue = this._readByte(++curByte, size)
      startBit = precisionBits % 8 || 8
      let mask = 1 << startBit
      while ((mask >>= 1)) {
        if (byteValue & mask) {
          significand += 1 / divisor
        }
        divisor *= 2
      }
    } while ((precisionBits -= startBit))

    this._pos += size

    return exponent === (bias << 1) + 1 ? significand ? NaN : signal ? -Infinity : +Infinity
      : (1 + signal * -2) * (exponent || significand ? !exponent ? Math.pow(2, -bias + 1) * significand
          : Math.pow(2, exponent - bias) * (1 + significand) : 0)
  }

  _decodeInt (bits, signed) {
    const x = this._readBits(0, bits, bits / 8)
    const max = Math.pow(2, bits)
    const result = signed && x >= max / 2 ? x - max : x

    this._pos += bits / 8
    return result
  }

  // shl fix: Henri Torgemane ~1996 (compressed by Jonas Raoni)
  _shl (a, b) {
    for (++b; --b; a = ((a %= 0x7fffffff + 1) & 0x40000000) === 0x40000000 ? a * 2 : (a - 0x40000000) * 2 + 0x7fffffff + 1);
    return a
  }

  _readByte (i, size) {
    return this._buffer.charCodeAt(this._pos + size - i - 1) & 0xff
  }

  _readBits (start, length, size) {
    const offsetLeft = (start + length) % 8
    const offsetRight = start % 8
    const curByte = size - (start >> 3) - 1
    let lastByte = size + (-(start + length) >> 3)
    let diff = curByte - lastByte

    let sum = (this._readByte(curByte, size) >> offsetRight) & ((1 << (diff ? 8 - offsetRight : length)) - 1)

    if (diff && offsetLeft) {
      sum += (this._readByte(lastByte++, size) & ((1 << offsetLeft) - 1)) << (diff-- << 3) - offsetRight
    }

    while (diff) {
      sum += this._shl(this._readByte(lastByte++, size), (diff-- << 3) - offsetRight)
    }

    return sum
  }

  _checkSize (neededBits) {
    if (!(this._pos + Math.ceil(neededBits / 8) < this._buffer.length)) {
      // throw new Error("Index out of bound");
    }
  }
}

module.exports = BinaryReader

},{}],14:[function(require,module,exports){
(function (Buffer){
/*
 * Blob.js
 *
 * Node and Browserify Compatible
 *
 * Copyright (c) 2015 by Z3 Dev (@zdev/www.z3dev.jp)
 * License: MIT License
 *
 * This implementation uses the Buffer class for all storage.
 * See https://nodejs.org/api/buffer.html
 *
 * URL.createObjectURL(blob)
 *
 * History:
 * 2020/10/07: converted to class
 * 2015/07/02: contributed to OpenJSCAD.org CLI openjscad
 */

/**
 * The Blob object represents a blob, which is a file-like object of immutable, raw data; they can be read as text or binary data.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
 */
class Blob {
  /**
   * Returns a newly created Blob object which contains a concatenation of all of the data in the given contents.
   * @param {Array} contents - an array of ArrayBuffer, or String objects that will be put inside the Blob.
   */
  constructor (contents, options) {
    // make the optional options non-optional
    options = options || {}
    // the size of the byte sequence in number of bytes
    this.size = 0 // contents, not allocation
    // the media type, as an ASCII-encoded string in lower case, and parsable as a MIME type
    this.type = ''
    // readability state (CLOSED: true, OPENED: false)
    this.isClosed = false
    // encoding of given strings
    this.encoding = 'utf8'
    // storage
    this.buffer = null
    this.length = 0 // allocation, not contents

    if (!contents) return
    if (!Array.isArray(contents)) return

    // Find content length
    contents.forEach((content) => {
      if (typeof (content) === 'string') {
        this.length += content.length
      } else if (content instanceof ArrayBuffer) {
        this.length += content.byteLength
      }
    })

    // process options if any
    if (options.type) {
      // TBD if type contains any chars outside range U+0020 to U+007E, then set type to the empty string
      // Convert every character in type to lowercase
      this.type = options.type.toLowerCase()
    }
    if (options.endings) {
      // convert the EOL on strings
    }
    if (options.encoding) {
      this.encoding = options.encoding.toLowerCase()
    }
    if (options.length) {
      this.length = options.length
    }

    let wbytes
    let object
    // convert the contents (String, ArrayBufferView, ArrayBuffer, Blob)
    // MAX_LENGTH : 2147483647
    this.buffer = Buffer.allocUnsafe(this.length) // new Buffer(this.length)
    for (let index = 0; index < contents.length; index++) {
      switch (typeof (contents[index])) {
        case 'string':
          wbytes = this.buffer.write(contents[index], this.size, this.encoding)
          this.size = this.size + wbytes
          break
        case 'object':
          object = contents[index] // this should be a reference to an object
          // FIXME if (Buffer.isBuffer(object)) { }
          if (object instanceof ArrayBuffer) {
            const view = new DataView(object)
            for (let bindex = 0; bindex < object.byteLength; bindex++) {
              const xbyte = view.getUint8(bindex)
              wbytes = this.buffer.writeUInt8(xbyte, this.size, false)
              this.size++
            }
          }
          break
        default:
          break
      }
    }
  }

  asBuffer () {
    // return a deep copy as blobs are written to files with full length, not size
    return this.buffer.slice(0, this.size)
  }

  arrayBuffer () {
    return this.buffer.slice(0, this.size)
  }

  slice (start, end, type) {
    start = start || 0
    end = end || this.size
    type = type || ''
    // TODO
    return new Blob()
  }

  stream () {
    // TODO
    return null
  }

  text () {
    // TODO
    return ''
  }

  close () {
    // if state of context objext is already CLOSED then return
    if (this.isClosed) return
    // set the readbility state of the context object to CLOSED and remove storage
    this.isClosed = true
  }

  toString () {
    // TODO
    return ''
  }
}

module.exports = Blob

}).call(this,require("buffer").Buffer)
},{"buffer":423}],15:[function(require,module,exports){
const makeBlob = require('./makeBlob')

const Blob = makeBlob()

/**
 * Convert the given input into a BLOB of data for export.
 * @param {Object} input - input object to convert
 * @param {Array} input.data - array of data to be inserted into the blob, either String or ArrayBuffer
 * @param {String} input.mimeType - mime type of the data to be inserted
 * @return {Blob} a new Blob
 * @alias module:io/utils.convertToBlob
 * @example
 * const blob1 = convertToBlob({ data: ['test'], mimeType: 'text/plain' })
 * const blob2 = convertToBlob({ data: [Int32Array.from('12345').buffer], mimeType: 'application/mine' })
 */
const convertToBlob = (input) => {
  const { data, mimeType } = input
  const blob = new Blob(data, { type: mimeType })
  return blob
}

module.exports = convertToBlob

},{"./makeBlob":17}],16:[function(require,module,exports){
/**
 * Utility functions of various sorts in support of IO packages.
 * @module io/utils
 * @example
 * const { BinaryReader } = require('@jscad/io-utils')
 */
module.exports = {
  convertToBlob: require('./convertToBlob'),
  makeBlob: require('./makeBlob'),
  BinaryReader: require('./BinaryReader'),
  Blob: require('./Blob')
}

},{"./BinaryReader":13,"./Blob":14,"./convertToBlob":15,"./makeBlob":17}],17:[function(require,module,exports){
const nodeBlob = require('./Blob.js')

/**
 * Make a constructor for Blob objects.
 * @return {Function} constructor of Blob objects
 * @alias module:io/utils.makeBlob
 * @example
 * const Blob = makeBlob()
 * const ablob = new Blob(data, { type: mimeType })
 */
const makeBlob = () => {
  const blob = typeof window !== 'undefined' ? window.Blob : nodeBlob
  return blob
}

module.exports = makeBlob

},{"./Blob.js":14}],18:[function(require,module,exports){
const cssColors = require('./cssColors')

/**
 * Converts a CSS color name to RGB color.
 *
 * @param {String} s - the CSS color name
 * @return {Array} the RGB color, or undefined if not found
 * @alias module:modeling/colors.colorNameToRgb
 * @example
 * let mysphere = colorize(colorNameToRgb('lightblue'), sphere())
 */
const colorNameToRgb = (s) => cssColors[s.toLowerCase()]

module.exports = colorNameToRgb

},{"./cssColors":20}],19:[function(require,module,exports){
const flatten = require('../utils/flatten')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')
const poly3 = require('../geometries/poly3')

const colorGeom2 = (color, object) => {
  const newgeom2 = geom2.clone(object)
  newgeom2.color = color
  return newgeom2
}

const colorGeom3 = (color, object) => {
  const newgeom3 = geom3.clone(object)
  newgeom3.color = color
  return newgeom3
}

const colorPath2 = (color, object) => {
  const newpath2 = path2.clone(object)
  newpath2.color = color
  return newpath2
}

const colorPoly3 = (color, object) => {
  const newpoly = poly3.clone(object)
  newpoly.color = color
  return newpoly
}

/**
 * Assign the given color to the given objects.
 * @param {Array} color - RGBA color values, where each value is between 0 and 1.0
 * @param {Object|Array} objects - the objects of which to apply the given color
 * @return {Object|Array} new object, or list of new objects with an additional attribute 'color'
 * @alias module:modeling/colors.colorize
 *
 * @example
 * let redSphere = colorize([1,0,0], sphere()) // red
 * let greenCircle = colorize([0,1,0,0.8], circle()) // green transparent
 * let blueArc = colorize([0,0,1], arc()) // blue
 * let wildcylinder = colorize(colorNameToRgb('fuchsia'), cylinder()) // CSS color
 */
const colorize = (color, ...objects) => {
  if (!Array.isArray(color)) throw new Error('color must be an array')
  if (color.length < 3) throw new Error('color must contain R, G and B values')
  if (color.length === 3) color = [color[0], color[1], color[2], 1.0] // add alpha

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (geom2.isA(object)) return colorGeom2(color, object)
    if (geom3.isA(object)) return colorGeom3(color, object)
    if (path2.isA(object)) return colorPath2(color, object)
    if (poly3.isA(object)) return colorPoly3(color, object)

    object.color = color
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = colorize

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78,"../geometries/poly3":95,"../utils/flatten":412}],20:[function(require,module,exports){
/**
 * @alias module:modeling/colors.cssColors
 * @see CSS color table from http://www.w3.org/TR/css3-color/
 * @enum {Array}
 * @example
 * let newshape = colorize(cssColors.red, oldshape)
 */
const cssColors = {
  // basic color keywords
  black: [0 / 255, 0 / 255, 0 / 255],
  silver: [192 / 255, 192 / 255, 192 / 255],
  gray: [128 / 255, 128 / 255, 128 / 255],
  white: [255 / 255, 255 / 255, 255 / 255],
  maroon: [128 / 255, 0 / 255, 0 / 255],
  red: [255 / 255, 0 / 255, 0 / 255],
  purple: [128 / 255, 0 / 255, 128 / 255],
  fuchsia: [255 / 255, 0 / 255, 255 / 255],
  green: [0 / 255, 128 / 255, 0 / 255],
  lime: [0 / 255, 255 / 255, 0 / 255],
  olive: [128 / 255, 128 / 255, 0 / 255],
  yellow: [255 / 255, 255 / 255, 0 / 255],
  navy: [0 / 255, 0 / 255, 128 / 255],
  blue: [0 / 255, 0 / 255, 255 / 255],
  teal: [0 / 255, 128 / 255, 128 / 255],
  aqua: [0 / 255, 255 / 255, 255 / 255],
  // extended color keywords
  aliceblue: [240 / 255, 248 / 255, 255 / 255],
  antiquewhite: [250 / 255, 235 / 255, 215 / 255],
  // 'aqua': [ 0 / 255, 255 / 255, 255 / 255 ],
  aquamarine: [127 / 255, 255 / 255, 212 / 255],
  azure: [240 / 255, 255 / 255, 255 / 255],
  beige: [245 / 255, 245 / 255, 220 / 255],
  bisque: [255 / 255, 228 / 255, 196 / 255],
  // 'black': [ 0 / 255, 0 / 255, 0 / 255 ],
  blanchedalmond: [255 / 255, 235 / 255, 205 / 255],
  // 'blue': [ 0 / 255, 0 / 255, 255 / 255 ],
  blueviolet: [138 / 255, 43 / 255, 226 / 255],
  brown: [165 / 255, 42 / 255, 42 / 255],
  burlywood: [222 / 255, 184 / 255, 135 / 255],
  cadetblue: [95 / 255, 158 / 255, 160 / 255],
  chartreuse: [127 / 255, 255 / 255, 0 / 255],
  chocolate: [210 / 255, 105 / 255, 30 / 255],
  coral: [255 / 255, 127 / 255, 80 / 255],
  cornflowerblue: [100 / 255, 149 / 255, 237 / 255],
  cornsilk: [255 / 255, 248 / 255, 220 / 255],
  crimson: [220 / 255, 20 / 255, 60 / 255],
  cyan: [0 / 255, 255 / 255, 255 / 255],
  darkblue: [0 / 255, 0 / 255, 139 / 255],
  darkcyan: [0 / 255, 139 / 255, 139 / 255],
  darkgoldenrod: [184 / 255, 134 / 255, 11 / 255],
  darkgray: [169 / 255, 169 / 255, 169 / 255],
  darkgreen: [0 / 255, 100 / 255, 0 / 255],
  darkgrey: [169 / 255, 169 / 255, 169 / 255],
  darkkhaki: [189 / 255, 183 / 255, 107 / 255],
  darkmagenta: [139 / 255, 0 / 255, 139 / 255],
  darkolivegreen: [85 / 255, 107 / 255, 47 / 255],
  darkorange: [255 / 255, 140 / 255, 0 / 255],
  darkorchid: [153 / 255, 50 / 255, 204 / 255],
  darkred: [139 / 255, 0 / 255, 0 / 255],
  darksalmon: [233 / 255, 150 / 255, 122 / 255],
  darkseagreen: [143 / 255, 188 / 255, 143 / 255],
  darkslateblue: [72 / 255, 61 / 255, 139 / 255],
  darkslategray: [47 / 255, 79 / 255, 79 / 255],
  darkslategrey: [47 / 255, 79 / 255, 79 / 255],
  darkturquoise: [0 / 255, 206 / 255, 209 / 255],
  darkviolet: [148 / 255, 0 / 255, 211 / 255],
  deeppink: [255 / 255, 20 / 255, 147 / 255],
  deepskyblue: [0 / 255, 191 / 255, 255 / 255],
  dimgray: [105 / 255, 105 / 255, 105 / 255],
  dimgrey: [105 / 255, 105 / 255, 105 / 255],
  dodgerblue: [30 / 255, 144 / 255, 255 / 255],
  firebrick: [178 / 255, 34 / 255, 34 / 255],
  floralwhite: [255 / 255, 250 / 255, 240 / 255],
  forestgreen: [34 / 255, 139 / 255, 34 / 255],
  // 'fuchsia': [ 255 / 255, 0 / 255, 255 / 255 ],
  gainsboro: [220 / 255, 220 / 255, 220 / 255],
  ghostwhite: [248 / 255, 248 / 255, 255 / 255],
  gold: [255 / 255, 215 / 255, 0 / 255],
  goldenrod: [218 / 255, 165 / 255, 32 / 255],
  // 'gray': [ 128 / 255, 128 / 255, 128 / 255 ],
  // 'green': [ 0 / 255, 128 / 255, 0 / 255 ],
  greenyellow: [173 / 255, 255 / 255, 47 / 255],
  grey: [128 / 255, 128 / 255, 128 / 255],
  honeydew: [240 / 255, 255 / 255, 240 / 255],
  hotpink: [255 / 255, 105 / 255, 180 / 255],
  indianred: [205 / 255, 92 / 255, 92 / 255],
  indigo: [75 / 255, 0 / 255, 130 / 255],
  ivory: [255 / 255, 255 / 255, 240 / 255],
  khaki: [240 / 255, 230 / 255, 140 / 255],
  lavender: [230 / 255, 230 / 255, 250 / 255],
  lavenderblush: [255 / 255, 240 / 255, 245 / 255],
  lawngreen: [124 / 255, 252 / 255, 0 / 255],
  lemonchiffon: [255 / 255, 250 / 255, 205 / 255],
  lightblue: [173 / 255, 216 / 255, 230 / 255],
  lightcoral: [240 / 255, 128 / 255, 128 / 255],
  lightcyan: [224 / 255, 255 / 255, 255 / 255],
  lightgoldenrodyellow: [250 / 255, 250 / 255, 210 / 255],
  lightgray: [211 / 255, 211 / 255, 211 / 255],
  lightgreen: [144 / 255, 238 / 255, 144 / 255],
  lightgrey: [211 / 255, 211 / 255, 211 / 255],
  lightpink: [255 / 255, 182 / 255, 193 / 255],
  lightsalmon: [255 / 255, 160 / 255, 122 / 255],
  lightseagreen: [32 / 255, 178 / 255, 170 / 255],
  lightskyblue: [135 / 255, 206 / 255, 250 / 255],
  lightslategray: [119 / 255, 136 / 255, 153 / 255],
  lightslategrey: [119 / 255, 136 / 255, 153 / 255],
  lightsteelblue: [176 / 255, 196 / 255, 222 / 255],
  lightyellow: [255 / 255, 255 / 255, 224 / 255],
  // 'lime': [ 0 / 255, 255 / 255, 0 / 255 ],
  limegreen: [50 / 255, 205 / 255, 50 / 255],
  linen: [250 / 255, 240 / 255, 230 / 255],
  magenta: [255 / 255, 0 / 255, 255 / 255],
  // 'maroon': [ 128 / 255, 0 / 255, 0 / 255 ],
  mediumaquamarine: [102 / 255, 205 / 255, 170 / 255],
  mediumblue: [0 / 255, 0 / 255, 205 / 255],
  mediumorchid: [186 / 255, 85 / 255, 211 / 255],
  mediumpurple: [147 / 255, 112 / 255, 219 / 255],
  mediumseagreen: [60 / 255, 179 / 255, 113 / 255],
  mediumslateblue: [123 / 255, 104 / 255, 238 / 255],
  mediumspringgreen: [0 / 255, 250 / 255, 154 / 255],
  mediumturquoise: [72 / 255, 209 / 255, 204 / 255],
  mediumvioletred: [199 / 255, 21 / 255, 133 / 255],
  midnightblue: [25 / 255, 25 / 255, 112 / 255],
  mintcream: [245 / 255, 255 / 255, 250 / 255],
  mistyrose: [255 / 255, 228 / 255, 225 / 255],
  moccasin: [255 / 255, 228 / 255, 181 / 255],
  navajowhite: [255 / 255, 222 / 255, 173 / 255],
  // 'navy': [ 0 / 255, 0 / 255, 128 / 255 ],
  oldlace: [253 / 255, 245 / 255, 230 / 255],
  // 'olive': [ 128 / 255, 128 / 255, 0 / 255 ],
  olivedrab: [107 / 255, 142 / 255, 35 / 255],
  orange: [255 / 255, 165 / 255, 0 / 255],
  orangered: [255 / 255, 69 / 255, 0 / 255],
  orchid: [218 / 255, 112 / 255, 214 / 255],
  palegoldenrod: [238 / 255, 232 / 255, 170 / 255],
  palegreen: [152 / 255, 251 / 255, 152 / 255],
  paleturquoise: [175 / 255, 238 / 255, 238 / 255],
  palevioletred: [219 / 255, 112 / 255, 147 / 255],
  papayawhip: [255 / 255, 239 / 255, 213 / 255],
  peachpuff: [255 / 255, 218 / 255, 185 / 255],
  peru: [205 / 255, 133 / 255, 63 / 255],
  pink: [255 / 255, 192 / 255, 203 / 255],
  plum: [221 / 255, 160 / 255, 221 / 255],
  powderblue: [176 / 255, 224 / 255, 230 / 255],
  // 'purple': [ 128 / 255, 0 / 255, 128 / 255 ],
  // 'red': [ 255 / 255, 0 / 255, 0 / 255 ],
  rosybrown: [188 / 255, 143 / 255, 143 / 255],
  royalblue: [65 / 255, 105 / 255, 225 / 255],
  saddlebrown: [139 / 255, 69 / 255, 19 / 255],
  salmon: [250 / 255, 128 / 255, 114 / 255],
  sandybrown: [244 / 255, 164 / 255, 96 / 255],
  seagreen: [46 / 255, 139 / 255, 87 / 255],
  seashell: [255 / 255, 245 / 255, 238 / 255],
  sienna: [160 / 255, 82 / 255, 45 / 255],
  // 'silver': [ 192 / 255, 192 / 255, 192 / 255 ],
  skyblue: [135 / 255, 206 / 255, 235 / 255],
  slateblue: [106 / 255, 90 / 255, 205 / 255],
  slategray: [112 / 255, 128 / 255, 144 / 255],
  slategrey: [112 / 255, 128 / 255, 144 / 255],
  snow: [255 / 255, 250 / 255, 250 / 255],
  springgreen: [0 / 255, 255 / 255, 127 / 255],
  steelblue: [70 / 255, 130 / 255, 180 / 255],
  tan: [210 / 255, 180 / 255, 140 / 255],
  // 'teal': [ 0 / 255, 128 / 255, 128 / 255 ],
  thistle: [216 / 255, 191 / 255, 216 / 255],
  tomato: [255 / 255, 99 / 255, 71 / 255],
  turquoise: [64 / 255, 224 / 255, 208 / 255],
  violet: [238 / 255, 130 / 255, 238 / 255],
  wheat: [245 / 255, 222 / 255, 179 / 255],
  // 'white': [ 255 / 255, 255 / 255, 255 / 255 ],
  whitesmoke: [245 / 255, 245 / 255, 245 / 255],
  // 'yellow': [ 255 / 255, 255 / 255, 0 / 255 ],
  yellowgreen: [154 / 255, 205 / 255, 50 / 255]
}

module.exports = cssColors

},{}],21:[function(require,module,exports){
/**
 * Converts CSS color notations (string of hex values) to RGB values.
 *
 * @see https://www.w3.org/TR/css-color-3/
 * @param {String} notation - color notation
 * @return {Array} RGB color values
 * @alias module:modeling/colors.hexToRgb
 *
 * @example
 * let mysphere = colorize(hexToRgb('#000080'), sphere()) // navy blue
 */
const hexToRgb = (notation) => {
  notation = notation.replace('#', '')
  if (notation.length < 6) throw new Error('the given notation must contain 3 or more hex values')

  const r = parseInt(notation.substring(0, 2), 16) / 255
  const g = parseInt(notation.substring(2, 4), 16) / 255
  const b = parseInt(notation.substring(4, 6), 16) / 255
  if (notation.length >= 8) {
    const a = parseInt(notation.substring(6, 8), 16) / 255
    return [r, g, b, a]
  }
  return [r, g, b]
}

module.exports = hexToRgb

},{}],22:[function(require,module,exports){
const flatten = require('../utils/flatten')

const hueToColorComponent = require('./hueToColorComponent')

/**
 * Converts HSL color values to RGB color values.
 *
 * @see http://en.wikipedia.org/wiki/HSL_color_space
 * @param {...Number|Array} values - HSL or HSLA color values
 * @return {Array} RGB or RGBA color values
 * @alias module:modeling/colors.hslToRgb
 *
 * @example
 * let mysphere = colorize(hslToRgb([0.9166666666666666, 1, 0.5]), sphere())
 */
const hslToRgb = (...values) => {
  values = flatten(values)
  if (values.length < 3) throw new Error('values must contain H, S and L values')

  const h = values[0]
  const s = values[1]
  const l = values[2]

  let r = l // default is achromatic
  let g = l
  let b = l

  if (s !== 0) {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hueToColorComponent(p, q, h + 1 / 3)
    g = hueToColorComponent(p, q, h)
    b = hueToColorComponent(p, q, h - 1 / 3)
  }

  if (values.length > 3) {
    // add alpha value if provided
    const a = values[3]
    return [r, g, b, a]
  }
  return [r, g, b]
}

module.exports = hslToRgb

},{"../utils/flatten":412,"./hueToColorComponent":24}],23:[function(require,module,exports){
const flatten = require('../utils/flatten')

/**
 * Converts HSV color values to RGB color values.
 *
 * @see http://en.wikipedia.org/wiki/HSV_color_space.
 * @param {...Number|Array} values - HSV or HSVA color values
 * @return {Array} RGB or RGBA color values
 * @alias module:modeling/colors.hsvToRgb
 *
 * @example
 * let mysphere = colorize(hsvToRgb([0.9166666666666666, 1, 1]), sphere())
 */
const hsvToRgb = (...values) => {
  values = flatten(values)
  if (values.length < 3) throw new Error('values must contain H, S and V values')

  const h = values[0]
  const s = values[1]
  const v = values[2]

  let r = 0
  let g = 0
  let b = 0

  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)

  switch (i % 6) {
    case 0:
      r = v
      g = t
      b = p
      break
    case 1:
      r = q
      g = v
      b = p
      break
    case 2:
      r = p
      g = v
      b = t
      break
    case 3:
      r = p
      g = q
      b = v
      break
    case 4:
      r = t
      g = p
      b = v
      break
    case 5:
      r = v
      g = p
      b = q
      break
  }

  if (values.length > 3) {
    // add alpha value if provided
    const a = values[3]
    return [r, g, b, a]
  }
  return [r, g, b]
}

module.exports = hsvToRgb

},{"../utils/flatten":412}],24:[function(require,module,exports){
/**
 * Convert hue values to a color component (ie one of r, g, b)
 * @param  {Number} p
 * @param  {Number} q
 * @param  {Number} t
 * @return {Number} color component
 * @alias module:modeling/colors.hueToColorComponent
 */
const hueToColorComponent = (p, q, t) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

module.exports = hueToColorComponent

},{}],25:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be assigned a color (RGBA).
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/colors
 * @example
 * const { colorize, hexToRgb } = require('@jscad/modeling').colors
 */
module.exports = {
  colorize: require('./colorize'),
  colorNameToRgb: require('./colorNameToRgb'),
  cssColors: require('./cssColors'),
  hexToRgb: require('./hexToRgb'),
  hslToRgb: require('./hslToRgb'),
  hsvToRgb: require('./hsvToRgb'),
  hueToColorComponent: require('./hueToColorComponent'),
  rgbToHex: require('./rgbToHex'),
  rgbToHsl: require('./rgbToHsl'),
  rgbToHsv: require('./rgbToHsv')
}

},{"./colorNameToRgb":18,"./colorize":19,"./cssColors":20,"./hexToRgb":21,"./hslToRgb":22,"./hsvToRgb":23,"./hueToColorComponent":24,"./rgbToHex":26,"./rgbToHsl":27,"./rgbToHsv":28}],26:[function(require,module,exports){
const flatten = require('../utils/flatten')

/**
 * Convert the given RGB color values to CSS color notation (string)
 * @see https://www.w3.org/TR/css-color-3/
 * @param {...Number|Array} values - RGB or RGBA color values
 * @return {String} CSS color notation
 * @alias module:modeling/colors.rgbToHex
 */
const rgbToHex = (...values) => {
  values = flatten(values)
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  const r = values[0] * 255
  const g = values[1] * 255
  const b = values[2] * 255

  let s = `#${Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1, 7)}`

  if (values.length > 3) {
    // convert alpha to opacity
    s = s + Number(values[3] * 255).toString(16)
  }
  return s
}

module.exports = rgbToHex

},{"../utils/flatten":412}],27:[function(require,module,exports){
const flatten = require('../utils/flatten')

/**
 * Converts an RGB color value to HSL.
 *
 * @see http://en.wikipedia.org/wiki/HSL_color_space.
 * @see http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * @param {...Number|Array} values - RGB or RGBA color values
 * @return {Array} HSL or HSLA color values
 * @alias module:modeling/colors.rgbToHsl
 */
const rgbToHsl = (...values) => {
  values = flatten(values)
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  const r = values[0]
  const g = values[1]
  const b = values[2]

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  let s
  const l = (max + min) / 2

  if (max === min) {
    h = s = 0 // achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  if (values.length > 3) {
    // add alpha value if provided
    const a = values[3]
    return [h, s, l, a]
  }
  return [h, s, l]
}

module.exports = rgbToHsl

},{"../utils/flatten":412}],28:[function(require,module,exports){
const flatten = require('../utils/flatten')

/**
 * Converts an RGB color value to HSV.
 *
 * @see http://en.wikipedia.org/wiki/HSV_color_space.
 * @param {...Number|Array} values - RGB or RGBA color values
 * @return {Array} HSV or HSVA color values
 * @alias module:modeling/colors.rgbToHsv
 */
const rgbToHsv = (...values) => {
  values = flatten(values)
  if (values.length < 3) throw new Error('values must contain R, G and B values')

  const r = values[0]
  const g = values[1]
  const b = values[2]

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  const v = max

  const d = max - min
  const s = max === 0 ? 0 : d / max

  if (max === min) {
    h = 0 // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  if (values.length > 3) {
    // add alpha if provided
    const a = values[3]
    return [h, s, v, a]
  }
  return [h, s, v]
}

module.exports = rgbToHsv

},{"../utils/flatten":412}],29:[function(require,module,exports){
const lengths = require('./lengths')

/**
 * Convert a given arc length along a bezier curve to a t value.
 * Useful for generating equally spaced points along a bezier curve.
 *
 * @example
 * const points = [];
 * const segments = 9; // this will generate 10 equally spaced points
 * const increment = bezier.length(100, bezierCurve) / segments;
 * for(let i = 0; i <= segments; i++) {
 *   const t = bezier.arcLengthToT({distance: i * increment}, bezierCurve);
 *   const point = bezier.valueAt(t, bezierCurve);
 *   points.push(point);
 * }
 * return points;
 *
 * @param {Object} [options] options for construction
 * @param {Number} [options.distance=0] the distance along the bezier curve for which we want to find the corresponding t value.
 * @param {Number} [options.segments=100] the number of segments to use when approximating the curve length.
 * @param {Object} bezier a bezier curve.
 * @returns a number in the [0, 1] interval or NaN if the arcLength is negative or greater than the total length of the curve.
 * @alias module:modeling/curves/bezier.arcLengthToT
 */
const arcLengthToT = (options, bezier) => {
  const defaults = {
    distance: 0,
    segments: 100
  }
  const { distance, segments } = Object.assign({}, defaults, options)

  const arcLengths = lengths(segments, bezier)
  // binary search for the index with largest value smaller than target arcLength
  let startIndex = 0
  let endIndex = segments
  while (startIndex <= endIndex) {
    const middleIndex = Math.floor(startIndex + (endIndex - startIndex) / 2)
    const diff = arcLengths[middleIndex] - distance
    if (diff < 0) {
      startIndex = middleIndex + 1
    } else if (diff > 0) {
      endIndex = middleIndex - 1
    } else {
      endIndex = middleIndex
      break
    }
  }
  // if we have an exact match, return it
  const targetIndex = endIndex
  if (arcLengths[targetIndex] === distance) {
    return targetIndex / segments
  }
  // we could get finer grain at lengths, or use simple interpolation between two points
  const lengthBefore = arcLengths[targetIndex]
  const lengthAfter = arcLengths[targetIndex + 1]
  const segmentLength = lengthAfter - lengthBefore
  // determine where we are between the 'before' and 'after' points
  const segmentFraction = (distance - lengthBefore) / segmentLength
  // add that fractional amount and return
  return (targetIndex + segmentFraction) / segments
}

module.exports = arcLengthToT

},{"./lengths":33}],30:[function(require,module,exports){
/**
 * Represents a bezier easing function.
 * @typedef {Object} bezier
 * @property {Array} points - The control points for the bezier curve. The first and last point will also be the start and end of the curve
 * @property {string} pointType - A reference to the type and dimensionality of the points that the curve was created from
 * @property {number} dimensions - The dimensionality of the bezier
 * @property {Array} permutations - A pre-calculation of the bezier algorithm's co-efficients
 * @property {Array} tangentPermutations - A pre-calculation of the bezier algorithm's tangent co-efficients
 *
 */

/**
 * Creates an object representing a bezier easing curve.
 * Curves can have both an arbitrary number of control points, and an arbitrary number of dimensions.
 *
 * @example
 * const b = bezier.create([0,10]) // a linear progression from 0 to 10
 * const b = bezier.create([0, 0, 10, 10]) // a symmetrical cubic easing curve that starts slowly and ends slowly from 0 to 10
 * const b = bezier.create([0,0,0], [0,5,10], [10,0,-5], [10,10,10]]) // a cubic 3 dimensional easing curve that can generate position arrays for modelling
 * // Usage
 * let position = bezier.valueAt(t,b) // where 0 < t < 1
 * let tangent = bezier.tangentAt(t,b) // where 0 < t < 1
 *
 * @param {Array} points An array with at least 2 elements of either all numbers, or all arrays of numbers that are the same size.
 * @returns {bezier} a new bezier data object
 * @alias module:modeling/curves/bezier.create
 */
const create = (points) => {
  if (!Array.isArray(points)) throw new Error('Bezier points must be a valid array/')
  if (points.length < 2) throw new Error('Bezier points must contain at least 2 values.')
  const pointType = getPointType(points)

  return {
    points: points,
    pointType: pointType,
    dimensions: pointType === 'float_single' ? 0 : points[0].length,
    permutations: getPermutations(points.length - 1),
    tangentPermutations: getPermutations(points.length - 2)
  }
}

const getPointType = function (points) {
  let firstPointType = null
  points.forEach((point) => {
    let pType = ''
    if (Number.isFinite(point)) {
      pType = 'float_single'
    } else if (Array.isArray(point)) {
      point.forEach((val) => {
        if (!Number.isFinite(val)) throw new Error('Bezier point values must all be numbers.')
      })
      pType = 'float_' + point.length
    } else throw new Error('Bezier points must all be numbers or arrays of number.')
    if (firstPointType == null) {
      firstPointType = pType
    } else {
      if (firstPointType !== pType) {
        throw new Error('Bezier points must be either all numbers or all arrays of numbers of the same size.')
      }
    }
  })
  return firstPointType
}

const getPermutations = function (c) {
  const permutations = []
  for (let i = 0; i <= c; i++) {
    permutations.push(factorial(c) / (factorial(i) * factorial(c - i)))
  }
  return permutations
}

const factorial = function (b) {
  let out = 1
  for (let i = 2; i <= b; i++) {
    out *= i
  }
  return out
}

module.exports = create

},{}],31:[function(require,module,exports){
/**
 * Represents a bezier easing function.
 * @see {@link bezier} for data structure information.
 * @module modeling/curves/bezier
 */
module.exports = {
  create: require('./create'),
  valueAt: require('./valueAt'),
  tangentAt: require('./tangentAt'),
  lengths: require('./lengths'),
  length: require('./length'),
  arcLengthToT: require('./arcLengthToT')
}

},{"./arcLengthToT":29,"./create":30,"./length":32,"./lengths":33,"./tangentAt":34,"./valueAt":35}],32:[function(require,module,exports){
const lengths = require('./lengths')

/**
 * Approximates the length of the bezier curve by sampling it at a sequence of points, then adding up all the distances.
 * This is equivalent to flattening the curve into lines and adding up all the line lengths.
 *
 * @example
 * const b = bezier.create([[0, 0], [0, 10]]);
 * console.log(length(100, b)) // output 10
 *
 * @param {Number} segments the number of segments to use when approximating the curve length.
 * @param {Object} bezier a bezier curve.
 * @returns an approximation of the curve's length.
 * @alias module:modeling/curves/bezier.length
 */
const length = (segments, bezier) => lengths(segments, bezier)[segments]

module.exports = length

},{"./lengths":33}],33:[function(require,module,exports){
const valueAt = require('./valueAt')

/**
 * Divides the bezier curve into line segments and returns the cumulative length of those segments as an array.
 * Utility function used to calculate the curve's approximate length and determine the equivalence between arc length and time.
 *
 * @example
 * const b = bezier.create([[0, 0], [0, 10]]);
 * const totalLength = lengths(100, b).pop(); // the last element of the array is the curve's approximate length
 *
 * @param {Number} segments the number of segments to use when approximating the curve length.
 * @param {Object} bezier a bezier curve.
 * @returns an array containing the cumulative length of the segments.
 */
const lengths = (segments, bezier) => {
  let sum = 0
  const lengths = [0]
  let previous = valueAt(0, bezier)
  for (let index = 1; index <= segments; index++) {
    const current = valueAt(index / segments, bezier)
    sum += distanceBetween(current, previous)
    lengths.push(sum)
    previous = current
  }
  return lengths
}

/**
 * Calculates the Euclidean distance between two n-dimensional points.
 *
 * @example
 * const distance = distanceBetween([0, 0], [0, 10]); // calculate distance between 2D points
 * console.log(distance); // output 10
 *
 * @param {Array} a - first operand.
 * @param {Array} b - second operand.
 * @returns {Number} - distance.
 */
const distanceBetween = (a, b) => {
  if (Number.isFinite(a) && Number.isFinite(b)) {
    return Math.abs(a - b)
  } else if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      throw new Error('The operands must have the same number of dimensions.')
    }
    let sum = 0
    for (let i = 0; i < a.length; i++) {
      sum += (b[i] - a[i]) * (b[i] - a[i])
    }
    return Math.sqrt(sum)
  } else {
    throw new Error('The operands must be of the same type, either number or array.')
  }
}

module.exports = lengths

},{"./valueAt":35}],34:[function(require,module,exports){
/**
 * Calculates the tangent at a specific position along a bezier easing curve.
 * For multidimensional curves, the tangent is the slope of each dimension at that point.
 * See the example called extrudeAlongPath.js
 *
 * @example
 * const b = bezier.create([[0,0,0], [0,5,10], [10,0,-5], [10,10,10]]) // a cubic 3 dimensional easing curve that can generate position arrays for modelling
 * let tangent = bezier.tangentAt(t, b)
 *
 * @param {number} t : the position of which to calculate the bezier's tangent value; 0 < t < 1
 * @param {Object} bezier : an array with at least 2 elements of either all numbers, or all arrays of numbers that are the same size.
 * @return {array | number} the tangent at the requested position.
 * @alias module:modeling/curves/bezier.tangentAt
 */
const tangentAt = (t, bezier) => {
  if (t < 0 || t > 1) {
    throw new Error('Bezier tangentAt() input must be between 0 and 1')
  }
  if (bezier.pointType === 'float_single') {
    return bezierTangent(bezier, bezier.points, t)
  } else {
    const result = []
    for (let i = 0; i < bezier.dimensions; i++) {
      const singleDimensionPoints = []
      for (let j = 0; j < bezier.points.length; j++) {
        singleDimensionPoints.push(bezier.points[j][i])
      }
      result.push(bezierTangent(bezier, singleDimensionPoints, t))
    }
    return result
  }
}

const bezierTangent = function (bezier, p, t) {
  // from https://pages.mtu.edu/~shene/COURSES/cs3621/NOTES/spline/Bezier/bezier-der.html
  const n = p.length - 1
  let result = 0
  for (let i = 0; i < n; i++) {
    const q = n * (p[i + 1] - p[i])
    result += bezier.tangentPermutations[i] * Math.pow(1 - t, n - 1 - i) * Math.pow(t, i) * q
  }
  return result
}

module.exports = tangentAt

},{}],35:[function(require,module,exports){
/**
 * Calculates the value at a specific position along a bezier easing curve.
 * For multidimensional curves, the tangent is the slope of each dimension at that point.
 * See the example called extrudeAlongPath.js to see this in use.
 * Math and explanation comes from {@link https://www.freecodecamp.org/news/nerding-out-with-bezier-curves-6e3c0bc48e2f/}
 *
 * @example
 * const b = bezier.create([0,0,0], [0,5,10], [10,0,-5], [10,10,10]]) // a cubic 3 dimensional easing curve that can generate position arrays for modelling
 * let position = bezier.valueAt(t,b) // where 0 < t < 1
 *
 * @param {number} t : the position of which to calculate the value; 0 < t < 1
 * @param {Object} bezier : a bezier curve created with bezier.create().
 * @returns {array | number} the value at the requested position.
 * @alias module:modeling/curves/bezier.valueAt
 */
const valueAt = (t, bezier) => {
  if (t < 0 || t > 1) {
    throw new Error('Bezier valueAt() input must be between 0 and 1')
  }
  if (bezier.pointType === 'float_single') {
    return bezierFunction(bezier, bezier.points, t)
  } else {
    const result = []
    for (let i = 0; i < bezier.dimensions; i++) {
      const singleDimensionPoints = []
      for (let j = 0; j < bezier.points.length; j++) {
        singleDimensionPoints.push(bezier.points[j][i])
      }
      result.push(bezierFunction(bezier, singleDimensionPoints, t))
    }
    return result
  }
}

const bezierFunction = function (bezier, p, t) {
  const n = p.length - 1
  let result = 0
  for (let i = 0; i <= n; i++) {
    result += bezier.permutations[i] * Math.pow(1 - t, n - i) * Math.pow(t, i) * p[i]
  }
  return result
}

module.exports = valueAt

},{}],36:[function(require,module,exports){
/**
 * Curves are n-dimensional mathematical constructs that define a path from point 0 to point 1.
 * @module modeling/curves
 * @example
 * const { bezier } = require('@jscad/modeling').curves

 */
module.exports = {
  bezier: require('./bezier')
}

},{"./bezier":31}],37:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec2 = require('../../maths/vec2')

/*
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toSides().
 * @param {geom2} geometry - the geometry to transform
 * @returns {geom2} the given geometry
 *
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms = (geometry) => {
  if (mat4.isIdentity(geometry.transforms)) return geometry

  // apply transforms to each side
  geometry.sides = geometry.sides.map((side) => {
    const p0 = vec2.transform(vec2.create(), side[0], geometry.transforms)
    const p1 = vec2.transform(vec2.create(), side[1], geometry.transforms)
    return [p0, p1]
  })
  geometry.transforms = mat4.create()
  return geometry
}

module.exports = applyTransforms

},{"../../maths/mat4":159,"../../maths/vec2":206}],38:[function(require,module,exports){
/**
 * Performs a shallow clone of the given geometry.
 * @param {geom2} geometry - the geometry to clone
 * @returns {geom2} new geometry
 * @alias module:modeling/geometries/geom2.clone
 */
const clone = (geometry) => Object.assign({}, geometry)

module.exports = clone

},{}],39:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Represents a 2D geometry consisting of a list of sides.
 * @typedef {Object} geom2
 * @property {Array} sides - list of sides, each side containing two points
 * @property {mat4} transforms - transforms to apply to the sides, see transform()
 */

/**
 * Create a new 2D geometry composed of unordered sides (two connected points).
 * @param {Array} [sides] - list of sides where each side is an array of two points
 * @returns {geom2} a new geometry
 * @alias module:modeling/geometries/geom2.create
 */
const create = (sides) => {
  if (sides === undefined) {
    sides = [] // empty contents
  }
  return {
    sides: sides,
    transforms: mat4.create()
  }
}

module.exports = create

},{"../../maths/mat4":159}],40:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec2 = require('../../maths/vec2')

const create = require('./create')

/**
 * Create a new 2D geometry from the given compact binary data.
 * @param {Array} data - compact binary data
 * @returns {geom2} a new geometry
 * @alias module:modeling/geometries/geom2.fromCompactBinary
 */
const fromCompactBinary = (data) => {
  if (data[0] !== 0) throw new Error('invalid compact binary data')

  const created = create()

  created.transforms = mat4.clone(data.slice(1, 17))

  for (let i = 21; i < data.length; i += 4) {
    const point0 = vec2.fromValues(data[i + 0], data[i + 1])
    const point1 = vec2.fromValues(data[i + 2], data[i + 3])
    created.sides.push([point0, point1])
  }
  // transfer known properties, i.e. color
  if (data[17] >= 0) {
    created.color = [data[17], data[18], data[19], data[20]]
  }
  // TODO: how about custom properties or fields ?
  return created
}

module.exports = fromCompactBinary

},{"../../maths/mat4":159,"../../maths/vec2":206,"./create":39}],41:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const create = require('./create')

/**
 * Create a new 2D geometry from the given points.
 * The direction (rotation) of the points is not relevant,
 * as the points can define a convex or a concave polygon.
 * The geometry must not self intersect, i.e. the sides cannot cross.
 * @param {Array} points - list of points in 2D space
 * @returns {geom2} a new geometry
 * @alias module:modeling/geometries/geom2.fromPoints
 */
const fromPoints = (points) => {
  if (!Array.isArray(points)) {
    throw new Error('the given points must be an array')
  }
  let length = points.length
  if (length < 3) {
    throw new Error('the given points must define a closed geometry with three or more points')
  }
  // adjust length if the given points are closed by the same point
  if (vec2.equals(points[0], points[length - 1])) --length

  const sides = []
  let prevpoint = points[length - 1]
  for (let i = 0; i < length; i++) {
    const point = points[i]
    sides.push([vec2.clone(prevpoint), vec2.clone(point)])
    prevpoint = point
  }
  return create(sides)
}

module.exports = fromPoints

},{"../../maths/vec2":206,"./create":39}],42:[function(require,module,exports){
/**
 * Represents a 2D geometry consisting of a list of sides.
 * @see {@link geom2} for data structure information.
 * @module modeling/geometries/geom2
 *
 * @example
 * colorize([0.5,0,1,1], square()) // purple square
 *
 * @example
 * {
 *   "sides": [[[-1,1],[-1,-1]],[[-1,-1],[1,-1]],[[1,-1],[1,1]],[[1,1],[-1,1]]],
 *   "transforms": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 *   "color": [0.5,0,1,1]
 * }
 */
module.exports = {
  clone: require('./clone'),
  create: require('./create'),
  fromPoints: require('./fromPoints'),
  fromCompactBinary: require('./fromCompactBinary'),
  isA: require('./isA'),
  reverse: require('./reverse'),
  toOutlines: require('./toOutlines'),
  toPoints: require('./toPoints'),
  toSides: require('./toSides'),
  toString: require('./toString'),
  toCompactBinary: require('./toCompactBinary'),
  transform: require('./transform'),
  validate: require('./validate')
}

},{"./clone":38,"./create":39,"./fromCompactBinary":40,"./fromPoints":41,"./isA":43,"./reverse":44,"./toCompactBinary":45,"./toOutlines":46,"./toPoints":47,"./toSides":48,"./toString":49,"./transform":50,"./validate":51}],43:[function(require,module,exports){
/**
 * Determine if the given object is a 2D geometry.
 * @param {Object} object - the object to interrogate
 * @returns {Boolean} true, if the object matches a geom2 based object
 * @alias module:modeling/geometries/geom2.isA
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    if ('sides' in object && 'transforms' in object) {
      if (Array.isArray(object.sides) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
}

module.exports = isA

},{}],44:[function(require,module,exports){
const create = require('./create')
const toSides = require('./toSides')

/**
 * Reverses the given geometry so that the sides are flipped in the opposite order.
 * This swaps the left (interior) and right (exterior) edges.
 * @param {geom2} geometry - the geometry to reverse
 * @returns {geom2} the new reversed geometry
 * @alias module:modeling/geometries/geom2.reverse
 *
 * @example
 * let newgeometry = reverse(geometry)
 */
const reverse = (geometry) => {
  const oldsides = toSides(geometry)

  const newsides = oldsides.map((side) => [side[1], side[0]])
  newsides.reverse() // is this required?
  return create(newsides)
}

module.exports = reverse

},{"./create":39,"./toSides":48}],45:[function(require,module,exports){
/**
 * Produces a compact binary representation from the given geometry.
 * @param {geom2} geometry - the geometry
 * @returns {TypedArray} compact binary representation
 * @alias module:modeling/geometries/geom2.toCompactBinary
 */
const toCompactBinary = (geometry) => {
  const sides = geometry.sides
  const transforms = geometry.transforms
  let color = [-1, -1, -1, -1]
  if (geometry.color) color = geometry.color

  // FIXME why Float32Array?
  const compacted = new Float32Array(1 + 16 + 4 + (sides.length * 4)) // type + transforms + color + sides data

  compacted[0] = 0 // type code: 0 => geom2, 1 => geom3 , 2 => path2

  compacted[1] = transforms[0]
  compacted[2] = transforms[1]
  compacted[3] = transforms[2]
  compacted[4] = transforms[3]
  compacted[5] = transforms[4]
  compacted[6] = transforms[5]
  compacted[7] = transforms[6]
  compacted[8] = transforms[7]
  compacted[9] = transforms[8]
  compacted[10] = transforms[9]
  compacted[11] = transforms[10]
  compacted[12] = transforms[11]
  compacted[13] = transforms[12]
  compacted[14] = transforms[13]
  compacted[15] = transforms[14]
  compacted[16] = transforms[15]

  compacted[17] = color[0]
  compacted[18] = color[1]
  compacted[19] = color[2]
  compacted[20] = color[3]

  for (let i = 0; i < sides.length; i++) {
    const ci = i * 4 + 21
    const point0 = sides[i][0]
    const point1 = sides[i][1]
    compacted[ci + 0] = point0[0]
    compacted[ci + 1] = point0[1]
    compacted[ci + 2] = point1[0]
    compacted[ci + 3] = point1[1]
  }
  // TODO: how about custom properties or fields ?
  return compacted
}

module.exports = toCompactBinary

},{}],46:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const toSides = require('./toSides')

/*
 * Create a list of edges which SHARE vertices.
 * This allows the edges to be traversed in order.
 */
const toSharedVertices = (sides) => {
  const unique = new Map() // {key: vertex}
  const getUniqueVertex = (vertex) => {
    const key = vertex.toString()
    if (unique.has(key)) {
      return unique.get(key)
    } else {
      unique.set(key, vertex)
      return vertex
    }
  }

  return sides.map((side) => side.map(getUniqueVertex))
}

/*
 * Convert a list of sides into a map from vertex to edges.
 */
const toVertexMap = (sides) => {
  const vertexMap = new Map()
  // first map to edges with shared vertices
  const edges = toSharedVertices(sides)
  // construct adjacent edges map
  edges.forEach((edge) => {
    if (vertexMap.has(edge[0])) {
      vertexMap.get(edge[0]).push(edge)
    } else {
      vertexMap.set(edge[0], [edge])
    }
  })
  return vertexMap
}

/**
 * Create the outline(s) of the given geometry.
 * @param {geom2} geometry - geometry to create outlines from
 * @returns {Array} an array of outlines, where each outline is an array of ordered points
 * @alias module:modeling/geometries/geom2.toOutlines
 *
 * @example
 * let geometry = subtract(rectangle({size: [5, 5]}), rectangle({size: [3, 3]}))
 * let outlines = toOutlines(geometry) // returns two outlines
 */
const toOutlines = (geometry) => {
  const vertexMap = toVertexMap(toSides(geometry)) // {vertex: [edges]}
  const outlines = []
  while (true) {
    let startSide
    for (const [vertex, edges] of vertexMap) {
      startSide = edges.shift()
      if (!startSide) {
        vertexMap.delete(vertex)
        continue
      }
      break
    }
    if (startSide === undefined) break // all starting sides have been visited

    const connectedVertexPoints = []
    const startVertex = startSide[0]
    while (true) {
      connectedVertexPoints.push(startSide[0])
      const nextVertex = startSide[1]
      if (nextVertex === startVertex) break // the outline has been closed
      const nextPossibleSides = vertexMap.get(nextVertex)
      if (!nextPossibleSides) {
        throw new Error(`geometry is not closed at vertex ${nextVertex}`)
      }
      const nextSide = popNextSide(startSide, nextPossibleSides)
      if (nextPossibleSides.length === 0) {
        vertexMap.delete(nextVertex)
      }
      startSide = nextSide
    } // inner loop

    // due to the logic of fromPoints()
    // move the first point to the last
    if (connectedVertexPoints.length > 0) {
      connectedVertexPoints.push(connectedVertexPoints.shift())
    }
    outlines.push(connectedVertexPoints)
  } // outer loop
  vertexMap.clear()
  return outlines
}

// find the first counter-clockwise edge from startSide and pop from nextSides
const popNextSide = (startSide, nextSides) => {
  if (nextSides.length === 1) {
    return nextSides.pop()
  }
  const v0 = vec2.create()
  const startAngle = vec2.angleDegrees(vec2.subtract(v0, startSide[1], startSide[0]))
  let bestAngle
  let bestIndex
  nextSides.forEach((nextSide, index) => {
    const nextAngle = vec2.angleDegrees(vec2.subtract(v0, nextSide[1], nextSide[0]))
    let angle = nextAngle - startAngle
    if (angle < -180) angle += 360
    if (angle >= 180) angle -= 360
    if (bestIndex === undefined || angle > bestAngle) {
      bestIndex = index
      bestAngle = angle
    }
  })
  const nextSide = nextSides[bestIndex]
  nextSides.splice(bestIndex, 1) // remove side from list
  return nextSide
}

module.exports = toOutlines

},{"../../maths/vec2":206,"./toSides":48}],47:[function(require,module,exports){
const toSides = require('./toSides')

/**
 * Produces an array of points from the given geometry.
 * The returned array should not be modified as the points are shared with the geometry.
 * NOTE: The points returned do NOT define an order. Use toOutlines() for ordered points.
 * @param {geom2} geometry - the geometry
 * @returns {Array} an array of points
 * @alias module:modeling/geometries/geom2.toPoints
 *
 * @example
 * let sharedpoints = toPoints(geometry)
 */
const toPoints = (geometry) => {
  const sides = toSides(geometry)
  const points = sides.map((side) => side[0])
  // due to the logic of fromPoints()
  // move the first point to the last
  if (points.length > 0) {
    points.push(points.shift())
  }
  return points
}

module.exports = toPoints

},{"./toSides":48}],48:[function(require,module,exports){
const applyTransforms = require('./applyTransforms')

/**
 * Produces an array of sides from the given geometry.
 * The returned array should not be modified as the data is shared with the geometry.
 * NOTE: The sides returned do NOT define an order. Use toOutlines() for ordered points.
 * @param {geom2} geometry - the geometry
 * @returns {Array} an array of sides
 * @alias module:modeling/geometries/geom2.toSides
 *
 * @example
 * let sharedsides = toSides(geometry)
 */
const toSides = (geometry) => applyTransforms(geometry).sides

module.exports = toSides

},{"./applyTransforms":37}],49:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const toSides = require('./toSides')

/**
 * Create a string representing the contents of the given geometry.
 * @param {geom2} geometry - the geometry
 * @returns {String} a representative string
 * @alias module:modeling/geometries/geom2.toString
 *
 * @example
 * console.out(toString(geometry))
 */
const toString = (geometry) => {
  const sides = toSides(geometry)
  let result = 'geom2 (' + sides.length + ' sides):\n[\n'
  sides.forEach((side) => {
    result += '  [' + vec2.toString(side[0]) + ', ' + vec2.toString(side[1]) + ']\n'
  })
  result += ']\n'
  return result
}

module.exports = toString

},{"../../maths/vec2":206,"./toSides":48}],50:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Transform the given geometry using the given matrix.
 * This is a lazy transform of the sides, as this function only adjusts the transforms.
 * The transforms are applied when accessing the sides via toSides().
 * @param {mat4} matrix - the matrix to transform with
 * @param {geom2} geometry - the geometry to transform
 * @returns {geom2} a new geometry
 * @alias module:modeling/geometries/geom2.transform
 *
 * @example
 * let newgeometry = transform(fromZRotation(degToRad(90)), geometry)
 */
const transform = (matrix, geometry) => {
  const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms)
  return Object.assign({}, geometry, { transforms })
}

module.exports = transform

},{"../../maths/mat4":159}],51:[function(require,module,exports){
const vec2 = require('../../maths/vec2')
const isA = require('./isA')
const toOutlines = require('./toOutlines')

/**
 * Determine if the given object is a valid geom2.
 * Checks for closedness, self-edges, and valid data points.
 *
 * **If the geometry is not valid, an exception will be thrown with details of the geometry error.**
 *
 * @param {Object} object - the object to interrogate
 * @throws {Error} error if the geometry is not valid
 * @alias module:modeling/geometries/geom2.validate
 */
const validate = (object) => {
  if (!isA(object)) {
    throw new Error('invalid geom2 structure')
  }

  // check for closedness
  toOutlines(object)

  // check for self-edges
  object.sides.forEach((side) => {
    if (vec2.equals(side[0], side[1])) {
      throw new Error(`geom2 self-edge ${side[0]}`)
    }
  })

  // check transforms
  if (!object.transforms.every(Number.isFinite)) {
    throw new Error(`geom2 invalid transforms ${object.transforms}`)
  }
}

module.exports = validate

},{"../../maths/vec2":206,"./isA":43,"./toOutlines":46}],52:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

const poly3 = require('../poly3')

/*
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toPolygons.
 * @param {geom3} geometry - the geometry to transform
 * @returns {geom3} the given geometry
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms = (geometry) => {
  if (mat4.isIdentity(geometry.transforms)) return geometry

  // apply transforms to each polygon
  geometry.polygons = geometry.polygons.map((polygon) => poly3.transform(geometry.transforms, polygon))
  // reset transforms
  geometry.transforms = mat4.create()
  return geometry
}

module.exports = applyTransforms

},{"../../maths/mat4":159,"../poly3":95}],53:[function(require,module,exports){
/**
 * Performs a shallow clone of the given geometry.
 * @param {geom3} geometry - the geometry to clone
 * @returns {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.clone
 */
const clone = (geometry) => Object.assign({}, geometry)

module.exports = clone

},{}],54:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Represents a 3D geometry consisting of a list of polygons.
 * @typedef {Object} geom3
 * @property {Array} polygons - list of polygons, each polygon containing three or more points
 * @property {mat4} transforms - transforms to apply to the polygons, see transform()
 */

/**
 * Create a new 3D geometry composed of the given polygons.
 * @param {Array} [polygons] - list of polygons, or undefined
 * @returns {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.create
 */
const create = (polygons) => {
  if (polygons === undefined) {
    polygons = [] // empty contents
  }
  return {
    polygons,
    transforms: mat4.create()
  }
}

module.exports = create

},{"../../maths/mat4":159}],55:[function(require,module,exports){
const vec3 = require('../../maths/vec3')
const mat4 = require('../../maths/mat4')

const poly3 = require('../poly3')

const create = require('./create')

/**
 * Construct a new 3D geometry from the given compact binary data.
 * @param {TypedArray} data - compact binary data
 * @returns {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.fromCompactBinary
 */
const fromCompactBinary = (data) => {
  if (data[0] !== 1) throw new Error('invalid compact binary data')

  const created = create()

  created.transforms = mat4.clone(data.slice(1, 17))

  const numberOfVertices = data[21]
  let ci = 22
  let vi = data.length - (numberOfVertices * 3)
  while (vi < data.length) {
    const verticesPerPolygon = data[ci]
    ci++

    const vertices = []
    for (let i = 0; i < verticesPerPolygon; i++) {
      vertices.push(vec3.fromValues(data[vi], data[vi + 1], data[vi + 2]))
      vi += 3
    }
    created.polygons.push(poly3.create(vertices))
  }

  // transfer known properties, i.e. color
  if (data[17] >= 0) {
    created.color = [data[17], data[18], data[19], data[20]]
  }
  // TODO: how about custom properties or fields ?
  return created
}

module.exports = fromCompactBinary

},{"../../maths/mat4":159,"../../maths/vec3":237,"../poly3":95,"./create":54}],56:[function(require,module,exports){
const poly3 = require('../poly3')

const create = require('./create')

/**
 * Construct a new 3D geometry from a list of points.
 * The list of points should contain sub-arrays, each defining a single polygon of points.
 * In addition, the points should follow the right-hand rule for rotation in order to
 * define an external facing polygon.
 * @param {Array} listofpoints - list of lists, where each list is a set of points to construct a polygon
 * @returns {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.fromPoints
 */
const fromPoints = (listofpoints) => {
  if (!Array.isArray(listofpoints)) {
    throw new Error('the given points must be an array')
  }

  const polygons = listofpoints.map((points, index) => {
    // TODO catch the error, and rethrow with index
    const polygon = poly3.create(points)
    return polygon
  })
  const result = create(polygons)
  return result
}

module.exports = fromPoints

},{"../poly3":95,"./create":54}],57:[function(require,module,exports){
/**
 * Represents a 3D geometry consisting of a list of polygons.
 * @see {@link geom3} for data structure information.
 * @module modeling/geometries/geom3
 *
 * @example
 * colorize([0,0.5,1,0.6], cube()) // transparent ice cube
 *
 * @example
 * {
 *   "polygons": [
 *     {"vertices": [[-1,-1,-1], [-1,-1,1], [-1,1,1], [-1,1,-1]]},
 *     {"vertices": [[1,-1,-1], [1,1,-1], [1,1,1], [1,-1,1]]},
 *     {"vertices": [[-1,-1,-1], [1,-1,-1], [1,-1,1], [-1,-1,1]]},
 *     {"vertices": [[-1,1,-1], [-1,1,1], [1,1,1], [1,1,-1]]},
 *     {"vertices": [[-1,-1,-1], [-1,1,-1], [1,1,-1], [1,-1,-1]]},
 *     {"vertices": [[-1,-1,1], [1,-1,1], [1,1,1], [-1,1,1]]}
 *   ],
 *   "transforms": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 *   "color": [0,0.5,1,0.6]
 * }
 */
module.exports = {
  clone: require('./clone'),
  create: require('./create'),
  fromPoints: require('./fromPoints'),
  fromCompactBinary: require('./fromCompactBinary'),
  invert: require('./invert'),
  isA: require('./isA'),
  toPoints: require('./toPoints'),
  toPolygons: require('./toPolygons'),
  toString: require('./toString'),
  toCompactBinary: require('./toCompactBinary'),
  transform: require('./transform'),
  validate: require('./validate')
}

},{"./clone":53,"./create":54,"./fromCompactBinary":55,"./fromPoints":56,"./invert":58,"./isA":59,"./toCompactBinary":60,"./toPoints":61,"./toPolygons":62,"./toString":63,"./transform":64,"./validate":65}],58:[function(require,module,exports){
const poly3 = require('../poly3')

const create = require('./create')
const toPolygons = require('./toPolygons')

/**
 * Invert the given geometry, transposing solid and empty space.
 * @param {geom3} geometry - the geometry to invert
 * @return {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.invert
 */
const invert = (geometry) => {
  const polygons = toPolygons(geometry)
  const newpolygons = polygons.map((polygon) => poly3.invert(polygon))
  return create(newpolygons)
}

module.exports = invert

},{"../poly3":95,"./create":54,"./toPolygons":62}],59:[function(require,module,exports){
/**
 * Determine if the given object is a 3D geometry.
 * @param {Object} object - the object to interrogate
 * @returns {Boolean} true if the object matches a geom3
 * @alias module:modeling/geometries/geom3.isA
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    if ('polygons' in object && 'transforms' in object) {
      if (Array.isArray(object.polygons) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
}

module.exports = isA

},{}],60:[function(require,module,exports){
const poly3 = require('../poly3')

/**
 * Return the given geometry in compact binary representation.
 * @param {geom3} geometry - the geometry
 * @return {TypedArray} compact binary representation
 * @alias module:modeling/geometries/geom3.toCompactBinary
 */
const toCompactBinary = (geometry) => {
  const polygons = geometry.polygons
  const transforms = geometry.transforms

  const numberOfPolygons = polygons.length
  const numberOfVertices = polygons.reduce((count, polygon) => count + polygon.vertices.length, 0)
  let color = [-1, -1, -1, -1]
  if (geometry.color) color = geometry.color

  // FIXME why Float32Array?
  const compacted = new Float32Array(1 + 16 + 4 + 1 + numberOfPolygons + (numberOfVertices * 3))
  // type + transforms + color + numberOfPolygons + numberOfVerticesPerPolygon[] + vertices data[]

  compacted[0] = 1 // type code: 0 => geom2, 1 => geom3 , 2 => path2

  compacted[1] = transforms[0]
  compacted[2] = transforms[1]
  compacted[3] = transforms[2]
  compacted[4] = transforms[3]
  compacted[5] = transforms[4]
  compacted[6] = transforms[5]
  compacted[7] = transforms[6]
  compacted[8] = transforms[7]
  compacted[9] = transforms[8]
  compacted[10] = transforms[9]
  compacted[11] = transforms[10]
  compacted[12] = transforms[11]
  compacted[13] = transforms[12]
  compacted[14] = transforms[13]
  compacted[15] = transforms[14]
  compacted[16] = transforms[15]

  compacted[17] = color[0]
  compacted[18] = color[1]
  compacted[19] = color[2]
  compacted[20] = color[3]

  compacted[21] = numberOfVertices

  let ci = 22
  let vi = ci + numberOfPolygons
  polygons.forEach((polygon) => {
    const points = poly3.toPoints(polygon)
    // record the number of vertices per polygon
    compacted[ci] = points.length
    ci++
    // convert the vertices
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      compacted[vi + 0] = point[0]
      compacted[vi + 1] = point[1]
      compacted[vi + 2] = point[2]
      vi += 3
    }
  })
  // TODO: how about custom properties or fields ?
  return compacted
}

module.exports = toCompactBinary

},{"../poly3":95}],61:[function(require,module,exports){
const poly3 = require('../poly3')

const toPolygons = require('./toPolygons')

/**
 * Return the given geometry as a list of points, after applying transforms.
 * The returned array should not be modified as the points are shared with the geometry.
 * @param {geom3} geometry - the geometry
 * @return {Array} list of points, where each sub-array represents a polygon
 * @alias module:modeling/geometries/geom3.toPoints
 */
const toPoints = (geometry) => {
  const polygons = toPolygons(geometry)
  const listofpoints = polygons.map((polygon) => poly3.toPoints(polygon))
  return listofpoints
}

module.exports = toPoints

},{"../poly3":95,"./toPolygons":62}],62:[function(require,module,exports){
const applyTransforms = require('./applyTransforms')

/**
 * Produces an array of polygons from the given geometry, after applying transforms.
 * The returned array should not be modified as the polygons are shared with the geometry.
 * @param {geom3} geometry - the geometry
 * @returns {Array} an array of polygons
 * @alias module:modeling/geometries/geom3.toPolygons
 *
 * @example
 * let sharedpolygons = toPolygons(geometry)
 */
const toPolygons = (geometry) => applyTransforms(geometry).polygons

module.exports = toPolygons

},{"./applyTransforms":52}],63:[function(require,module,exports){
const poly3 = require('../poly3')

const toPolygons = require('./toPolygons')

/**
 * Create a string representing the contents of the given geometry.
 * @param {geom3} geometry - the geometry
 * @returns {String} a representative string
 * @alias module:modeling/geometries/geom3.toString
 *
 * @example
 * console.out(toString(geometry))
 */
const toString = (geometry) => {
  const polygons = toPolygons(geometry)
  let result = 'geom3 (' + polygons.length + ' polygons):\n'
  polygons.forEach((polygon) => {
    result += '  ' + poly3.toString(polygon) + '\n'
  })
  return result
}

module.exports = toString

},{"../poly3":95,"./toPolygons":62}],64:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Transform the given geometry using the given matrix.
 * This is a lazy transform of the polygons, as this function only adjusts the transforms.
 * See applyTransforms() for the actual application of the transforms to the polygons.
 * @param {mat4} matrix - the matrix to transform with
 * @param {geom3} geometry - the geometry to transform
 * @returns {geom3} a new geometry
 * @alias module:modeling/geometries/geom3.transform
 *
 * @example
 * let newgeometry = transform(fromXRotation(degToRad(90)), geometry)
 */
const transform = (matrix, geometry) => {
  const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms)
  return Object.assign({}, geometry, { transforms })
}

module.exports = transform

},{"../../maths/mat4":159}],65:[function(require,module,exports){
const poly3 = require('../poly3')
const isA = require('./isA')

/**
 * Determine if the given object is a valid 3D geometry.
 * Checks for valid data structure, convex polygon faces, and manifold edges.
 *
 * **If the geometry is not valid, an exception will be thrown with details of the geometry error.**
 *
 * @param {Object} object - the object to interrogate
 * @throws {Error} error if the geometry is not valid
 * @alias module:modeling/geometries/geom3.validate
 */
const validate = (object) => {
  if (!isA(object)) {
    throw new Error('invalid geom3 structure')
  }

  // check polygons
  object.polygons.forEach(poly3.validate)
  validateManifold(object)

  // check transforms
  if (!object.transforms.every(Number.isFinite)) {
    throw new Error(`geom3 invalid transforms ${object.transforms}`)
  }

  // TODO: check for self-intersecting
}

/*
 * Check manifold edge condition: Every edge is in exactly 2 faces
 */
const validateManifold = (object) => {
  // count of each edge
  const edgeCount = new Map()
  object.polygons.forEach(({ vertices }) => {
    vertices.forEach((v, i) => {
      const v1 = `${v}`
      const v2 = `${vertices[(i + 1) % vertices.length]}`
      // sort for undirected edge
      const edge = `${v1}/${v2}`
      const count = edgeCount.has(edge) ? edgeCount.get(edge) : 0
      edgeCount.set(edge, count + 1)
    })
  })

  // check that edges are always matched
  const nonManifold = []
  edgeCount.forEach((count, edge) => {
    const complementEdge = edge.split('/').reverse().join('/')
    const complementCount = edgeCount.get(complementEdge)
    if (count !== complementCount) {
      nonManifold.push(edge.replace('/', ' -> '))
    }
  })
  if (nonManifold.length > 0) {
    throw new Error(`non-manifold edges ${nonManifold.length}\n${nonManifold.join('\n')}`)
  }
}

module.exports = validate

},{"../poly3":95,"./isA":59}],66:[function(require,module,exports){
/**
 * Geometries are objects that represent the contents of primitives or the results of operations.
 * Note: Geometries are considered immutable, so never change the contents directly.
 *
 * @see {@link geom2} - 2D geometry consisting of sides
 * @see {@link geom3} - 3D geometry consisting of polygons
 * @see {@link path2} - 2D geometry consisting of ordered points
 * @see {@link poly2} - 2D polygon consisting of ordered vertices
 * @see {@link poly3} - 3D polygon consisting of ordered vertices
 *
 * @module modeling/geometries
 * @example
 * const { geom2, geom3, path2, poly2, poly3 } = require('@jscad/modeling').geometries
 */
module.exports = {
  geom2: require('./geom2'),
  geom3: require('./geom3'),
  path2: require('./path2'),
  poly2: require('./poly2'),
  poly3: require('./poly3')
}

},{"./geom2":42,"./geom3":57,"./path2":78,"./poly2":89,"./poly3":95}],67:[function(require,module,exports){
const { TAU } = require('../../maths/constants')
const vec2 = require('../../maths/vec2')

const fromPoints = require('./fromPoints')
const toPoints = require('./toPoints')

/**
 * Append a series of points to the given geometry that represent an arc.
 * This implementation follows the SVG specifications.
 * @see http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
 * @param {Object} options - options for construction
 * @param {vec2} options.endpoint - end point of arc (REQUIRED)
 * @param {vec2} [options.radius=[0,0]] - radius of arc (X and Y)
 * @param {Number} [options.xaxisrotation=0] - rotation (RADIANS) of the X axis of the arc with respect to the X axis of the coordinate system
 * @param {Boolean} [options.clockwise=false] - draw an arc clockwise with respect to the center point
 * @param {Boolean} [options.large=false] - draw an arc longer than TAU / 2 radians
 * @param {Number} [options.segments=16] - number of segments per full rotation
 * @param {path2} geometry - the path of which to append the arc
 * @returns {path2} a new path with the appended points
 * @alias module:modeling/geometries/path2.appendArc
 *
 * @example
 * let p1 = path2.fromPoints({}, [[27.5,-22.96875]]);
 * p1 = path2.appendPoints([[27.5,-3.28125]], p1);
 * p1 = path2.appendArc({endpoint: [12.5, -22.96875], radius: [15, -19.6875]}, p1);
 */
const appendArc = (options, geometry) => {
  const defaults = {
    radius: [0, 0], // X and Y radius
    xaxisrotation: 0,
    clockwise: false,
    large: false,
    segments: 16
  }
  let { endpoint, radius, xaxisrotation, clockwise, large, segments } = Object.assign({}, defaults, options)

  // validate the given options
  if (!Array.isArray(endpoint)) throw new Error('endpoint must be an array of X and Y values')
  if (endpoint.length < 2) throw new Error('endpoint must contain X and Y values')
  endpoint = vec2.clone(endpoint)

  if (!Array.isArray(radius)) throw new Error('radius must be an array of X and Y values')
  if (radius.length < 2) throw new Error('radius must contain X and Y values')

  if (segments < 4) throw new Error('segments must be four or more')

  const decimals = 100000

  // validate the given geometry
  if (geometry.isClosed) {
    throw new Error('the given path cannot be closed')
  }

  const points = toPoints(geometry)
  if (points.length < 1) {
    throw new Error('the given path must contain one or more points (as the starting point for the arc)')
  }

  let xradius = radius[0]
  let yradius = radius[1]
  const startpoint = points[points.length - 1]

  // round to precision in order to have determinate calculations
  xradius = Math.round(xradius * decimals) / decimals
  yradius = Math.round(yradius * decimals) / decimals
  endpoint = vec2.fromValues(Math.round(endpoint[0] * decimals) / decimals, Math.round(endpoint[1] * decimals) / decimals)

  const sweepFlag = !clockwise
  let newpoints = []
  if ((xradius === 0) || (yradius === 0)) {
    // http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes:
    // If rx = 0 or ry = 0, then treat this as a straight line from (x1, y1) to (x2, y2) and stop
    newpoints.push(endpoint)
  } else {
    xradius = Math.abs(xradius)
    yradius = Math.abs(yradius)

    // see http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes :
    const phi = xaxisrotation
    const cosphi = Math.cos(phi)
    const sinphi = Math.sin(phi)
    const minushalfdistance = vec2.subtract(vec2.create(), startpoint, endpoint)
    vec2.scale(minushalfdistance, minushalfdistance, 0.5)
    // F.6.5.1:
    // round to precision in order to have determinate calculations
    const x = Math.round((cosphi * minushalfdistance[0] + sinphi * minushalfdistance[1]) * decimals) / decimals
    const y = Math.round((-sinphi * minushalfdistance[0] + cosphi * minushalfdistance[1]) * decimals) / decimals
    const startTranslated = vec2.fromValues(x, y)
    // F.6.6.2:
    const biglambda = (startTranslated[0] * startTranslated[0]) / (xradius * xradius) + (startTranslated[1] * startTranslated[1]) / (yradius * yradius)
    if (biglambda > 1.0) {
      // F.6.6.3:
      const sqrtbiglambda = Math.sqrt(biglambda)
      xradius *= sqrtbiglambda
      yradius *= sqrtbiglambda
      // round to precision in order to have determinate calculations
      xradius = Math.round(xradius * decimals) / decimals
      yradius = Math.round(yradius * decimals) / decimals
    }
    // F.6.5.2:
    let multiplier1 = Math.sqrt((xradius * xradius * yradius * yradius - xradius * xradius * startTranslated[1] * startTranslated[1] - yradius * yradius * startTranslated[0] * startTranslated[0]) / (xradius * xradius * startTranslated[1] * startTranslated[1] + yradius * yradius * startTranslated[0] * startTranslated[0]))
    if (sweepFlag === large) multiplier1 = -multiplier1
    const centerTranslated = vec2.fromValues(xradius * startTranslated[1] / yradius, -yradius * startTranslated[0] / xradius)
    vec2.scale(centerTranslated, centerTranslated, multiplier1)
    // F.6.5.3:
    let center = vec2.fromValues(cosphi * centerTranslated[0] - sinphi * centerTranslated[1], sinphi * centerTranslated[0] + cosphi * centerTranslated[1])
    center = vec2.add(center, center, vec2.scale(vec2.create(), vec2.add(vec2.create(), startpoint, endpoint), 0.5))

    // F.6.5.5:
    const vector1 = vec2.fromValues((startTranslated[0] - centerTranslated[0]) / xradius, (startTranslated[1] - centerTranslated[1]) / yradius)
    const vector2 = vec2.fromValues((-startTranslated[0] - centerTranslated[0]) / xradius, (-startTranslated[1] - centerTranslated[1]) / yradius)
    const theta1 = vec2.angleRadians(vector1)
    const theta2 = vec2.angleRadians(vector2)
    let deltatheta = theta2 - theta1
    deltatheta = deltatheta % TAU
    if ((!sweepFlag) && (deltatheta > 0)) {
      deltatheta -= TAU
    } else if ((sweepFlag) && (deltatheta < 0)) {
      deltatheta += TAU
    }

    // Ok, we have the center point and angle range (from theta1, deltatheta radians) so we can create the ellipse
    let numsteps = Math.ceil(Math.abs(deltatheta) / TAU * segments) + 1
    if (numsteps < 1) numsteps = 1
    for (let step = 1; step < numsteps; step++) {
      const theta = theta1 + step / numsteps * deltatheta
      const costheta = Math.cos(theta)
      const sintheta = Math.sin(theta)
      // F.6.3.1:
      const point = vec2.fromValues(cosphi * xradius * costheta - sinphi * yradius * sintheta, sinphi * xradius * costheta + cosphi * yradius * sintheta)
      vec2.add(point, point, center)
      newpoints.push(point)
    }
    // ensure end point is precisely what user gave as parameter
    if (numsteps) newpoints.push(options.endpoint)
  }
  newpoints = points.concat(newpoints)
  const result = fromPoints({}, newpoints)
  return result
}

module.exports = appendArc

},{"../../maths/constants":110,"../../maths/vec2":206,"./fromPoints":77,"./toPoints":82}],68:[function(require,module,exports){
const { TAU } = require('../../maths/constants')
const vec2 = require('../../maths/vec2')
const vec3 = require('../../maths/vec2')

const appendPoints = require('./appendPoints')
const toPoints = require('./toPoints')

/**
 * Append a series of points to the given geometry that represent a Bezier curve.
 * The Bézier curve starts at the last point in the given geometry, and ends at the last control point.
 * The other control points are intermediate control points to transition the curve from start to end points.
 * The first control point may be null to ensure a smooth transition occurs. In this case,
 * the second to last point of the given geometry is mirrored into the control points of the Bezier curve.
 * In other words, the trailing gradient of the geometry matches the new gradient of the curve.
 * @param {Object} options - options for construction
 * @param {Array} options.controlPoints - list of control points (2D) for the bezier curve
 * @param {Number} [options.segment=16] - number of segments per 360 rotation
 * @param {path2} geometry - the path of which to appended points
 * @returns {path2} a new path with the appended points
 * @alias module:modeling/geometries/path2.appendBezier
 *
 * @example
 * let p5 = path2.create({}, [[10,-20]])
 * p5 = path2.appendBezier({controlPoints: [[10,-10],[25,-10],[25,-20]]}, p5);
 * p5 = path2.appendBezier({controlPoints: [null, [25,-30],[40,-30],[40,-20]]}, p5)
 */
const appendBezier = (options, geometry) => {
  const defaults = {
    segments: 16
  }
  let { controlPoints, segments } = Object.assign({}, defaults, options)

  // validate the given options
  if (!Array.isArray(controlPoints)) throw new Error('controlPoints must be an array of one or more points')
  if (controlPoints.length < 1) throw new Error('controlPoints must be an array of one or more points')

  if (segments < 4) throw new Error('segments must be four or more')

  // validate the given geometry
  if (geometry.isClosed) {
    throw new Error('the given geometry cannot be closed')
  }

  const points = toPoints(geometry)
  if (points.length < 1) {
    throw new Error('the given path must contain one or more points (as the starting point for the bezier curve)')
  }

  // make a copy of the control points
  controlPoints = controlPoints.slice()

  // special handling of null control point (only first is allowed)
  const firstControlPoint = controlPoints[0]
  if (firstControlPoint === null) {
    if (controlPoints.length < 2) {
      throw new Error('a null control point must be passed with one more control points')
    }
    // special handling of a previous bezier curve
    let lastBezierControlPoint = points[points.length - 2]
    if ('lastBezierControlPoint' in geometry) {
      lastBezierControlPoint = geometry.lastBezierControlPoint
    }
    if (!Array.isArray(lastBezierControlPoint)) {
      throw new Error('the given path must contain TWO or more points if given a null control point')
    }
    // replace the first control point with the mirror of the last bezier control point
    const controlpoint = vec2.scale(vec2.create(), points[points.length - 1], 2)
    vec2.subtract(controlpoint, controlpoint, lastBezierControlPoint)

    controlPoints[0] = controlpoint
  }

  // add a control point for the previous end point
  controlPoints.unshift(points[points.length - 1])

  const bezierOrder = controlPoints.length - 1
  const factorials = []
  let fact = 1
  for (let i = 0; i <= bezierOrder; ++i) {
    if (i > 0) fact *= i
    factorials.push(fact)
  }

  const binomials = []
  for (let i = 0; i <= bezierOrder; ++i) {
    const binomial = factorials[bezierOrder] / (factorials[i] * factorials[bezierOrder - i])
    binomials.push(binomial)
  }

  const v0 = vec2.create()
  const v1 = vec2.create()
  const v3 = vec3.create()
  const getPointForT = (t) => {
    let tk = 1 // = pow(t,k)
    let oneMinusTNMinusK = Math.pow(1 - t, bezierOrder) // = pow( 1-t, bezierOrder - k)
    const invOneMinusT = (t !== 1) ? (1 / (1 - t)) : 1
    const point = vec2.create() // 0, 0, 0
    for (let k = 0; k <= bezierOrder; ++k) {
      if (k === bezierOrder) oneMinusTNMinusK = 1
      const bernsteinCoefficient = binomials[k] * tk * oneMinusTNMinusK
      const derivativePoint = vec2.scale(v0, controlPoints[k], bernsteinCoefficient)
      vec2.add(point, point, derivativePoint)
      tk *= t
      oneMinusTNMinusK *= invOneMinusT
    }
    return point
  }

  const newpoints = []
  const newpointsT = []
  const numsteps = bezierOrder + 1
  for (let i = 0; i < numsteps; ++i) {
    const t = i / (numsteps - 1)
    const point = getPointForT(t)
    newpoints.push(point)
    newpointsT.push(t)
  }

  // subdivide each segment until the angle at each vertex becomes small enough:
  let subdivideBase = 1
  const maxangle = TAU / segments
  const maxsinangle = Math.sin(maxangle)
  while (subdivideBase < newpoints.length - 1) {
    const dir1 = vec2.subtract(v0, newpoints[subdivideBase], newpoints[subdivideBase - 1])
    vec2.normalize(dir1, dir1)
    const dir2 = vec2.subtract(v1, newpoints[subdivideBase + 1], newpoints[subdivideBase])
    vec2.normalize(dir2, dir2)
    const sinangle = vec2.cross(v3, dir1, dir2) // the sine of the angle
    if (Math.abs(sinangle[2]) > maxsinangle) {
      // angle is too big, we need to subdivide
      const t0 = newpointsT[subdivideBase - 1]
      const t1 = newpointsT[subdivideBase + 1]
      const newt0 = t0 + (t1 - t0) * 1 / 3
      const newt1 = t0 + (t1 - t0) * 2 / 3
      const point0 = getPointForT(newt0)
      const point1 = getPointForT(newt1)
      // remove the point at subdivideBase and replace with 2 new points:
      newpoints.splice(subdivideBase, 1, point0, point1)
      newpointsT.splice(subdivideBase, 1, newt0, newt1)
      // re - evaluate the angles, starting at the previous junction since it has changed:
      subdivideBase--
      if (subdivideBase < 1) subdivideBase = 1
    } else {
      ++subdivideBase
    }
  }

  // append to the new points to the given path
  // but skip the first new point because it is identical to the last point in the given path
  newpoints.shift()
  const result = appendPoints(newpoints, geometry)
  result.lastBezierControlPoint = controlPoints[controlPoints.length - 2]
  return result
}

module.exports = appendBezier

},{"../../maths/constants":110,"../../maths/vec2":206,"./appendPoints":69,"./toPoints":82}],69:[function(require,module,exports){
const concat = require('./concat')
const create = require('./create')

/**
 * Append the given list of points to the end of the given geometry.
 * @param {Array} points - the points (2D) to append to the given path
 * @param {path2} geometry - the given path
 * @returns {path2} a new path with the appended points
 * @alias module:modeling/geometries/path2.appendPoints
 * @example
 * let newpath = appendPoints([[3, 4], [4, 5]], oldpath)
 */
const appendPoints = (points, geometry) => concat(geometry, create(points))

module.exports = appendPoints

},{"./concat":73,"./create":74}],70:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec2 = require('../../maths/vec2')

/*
 * Apply the transforms of the given geometry.
 * NOTE: This function must be called BEFORE exposing any data. See toPoints.
 * @param {path} geometry - the geometry to transform
 * @returns {path} the given geometry
 * @example
 * geometry = applyTransforms(geometry)
 */
const applyTransforms = (geometry) => {
  if (mat4.isIdentity(geometry.transforms)) return geometry

  geometry.points = geometry.points.map((point) => vec2.transform(vec2.create(), point, geometry.transforms))
  geometry.transforms = mat4.create()
  return geometry
}

module.exports = applyTransforms

},{"../../maths/mat4":159,"../../maths/vec2":206}],71:[function(require,module,exports){
/**
 * Performs a shallow clone of the give geometry.
 * @param {path2} geometry - the geometry to clone
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.clone
 */
const clone = (geometry) => Object.assign({}, geometry)

module.exports = clone

},{}],72:[function(require,module,exports){
const { EPS } = require('../../maths/constants')

const vec2 = require('../../maths/vec2')

const clone = require('./clone')

/**
 * Close the given geometry.
 * @param {path2} geometry - the path to close
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.close
 */
const close = (geometry) => {
  if (geometry.isClosed) return geometry

  const cloned = clone(geometry)
  cloned.isClosed = true

  if (cloned.points.length > 1) {
    // make sure the paths are formed properly
    const points = cloned.points
    const p0 = points[0]
    let pn = points[points.length - 1]
    while (vec2.distance(p0, pn) < (EPS * EPS)) {
      points.pop()
      if (points.length === 1) break
      pn = points[points.length - 1]
    }
  }
  return cloned
}

module.exports = close

},{"../../maths/constants":110,"../../maths/vec2":206,"./clone":71}],73:[function(require,module,exports){
const fromPoints = require('./fromPoints')
const toPoints = require('./toPoints')

const { equals } = require('../../maths/vec2')

/**
 * Concatenate the given paths.
 *
 * If both contain the same point at the junction, merge it into one.
 * A concatenation of zero paths is an empty, open path.
 * A concatenation of one closed path to a series of open paths produces a closed path.
 * A concatenation of a path to a closed path is an error.
 * @param {...path2} paths - the paths to concatenate
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.concat
 *
 * @example
 * let newpath = concat(fromPoints({}, [[1, 2]]), fromPoints({}, [[3, 4]]))
 */
const concat = (...paths) => {
  // Only the last path can be closed, producing a closed path.
  let isClosed = false
  let newpoints = []
  paths.forEach((path, i) => {
    const tmp = toPoints(path).slice()
    if (newpoints.length > 0 && tmp.length > 0 && equals(tmp[0], newpoints[newpoints.length - 1])) tmp.shift()
    if (tmp.length > 0 && isClosed) {
      throw new Error(`Cannot concatenate to a closed path; check the ${i}th path`)
    }
    isClosed = path.isClosed
    newpoints = newpoints.concat(tmp)
  })
  return fromPoints({ closed: isClosed }, newpoints)
}

module.exports = concat

},{"../../maths/vec2":206,"./fromPoints":77,"./toPoints":82}],74:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Represents a 2D geometry consisting of a list of ordered points.
 * @typedef {Object} path2
 * @property {Array} points - list of ordered points
 * @property {Boolean} isClosed - true if the path is closed where start and end points are the same
 * @property {mat4} transforms - transforms to apply to the points, see transform()
 */

/**
 * Create an empty, open path.
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.create
 *
 * @example
 * let newpath = create()
 */
const create = (points) => {
  if (points === undefined) {
    points = []
  }
  return {
    points: points,
    isClosed: false,
    transforms: mat4.create()
  }
}

module.exports = create

},{"../../maths/mat4":159}],75:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const toPoints = require('./toPoints')

/**
  * Determine if the given paths are equal.
  * For closed paths, this includes equality under point order rotation.
  * @param {path2} a - the first path to compare
  * @param {path2} b - the second path to compare
  * @returns {Boolean}
  * @alias module:modeling/geometries/path2.equals
  */
const equals = (a, b) => {
  if (a.isClosed !== b.isClosed) {
    return false
  }
  if (a.points.length !== b.points.length) {
    return false
  }

  const apoints = toPoints(a)
  const bpoints = toPoints(b)

  // closed paths might be equal under graph rotation
  // so try comparison by rotating across all points
  const length = apoints.length
  let offset = 0
  do {
    let unequal = false
    for (let i = 0; i < length; i++) {
      if (!vec2.equals(apoints[i], bpoints[(i + offset) % length])) {
        unequal = true
        break
      }
    }
    if (unequal === false) {
      return true
    }
    // unequal open paths should only be compared once, never rotated
    if (!a.isClosed) {
      return false
    }
  } while (++offset < length)
  return false
}

module.exports = equals

},{"../../maths/vec2":206,"./toPoints":82}],76:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec2 = require('../../maths/vec2')

const create = require('./create')

/**
 * Create a new path from the given compact binary data.
 * @param {TypedArray} data - compact binary data
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.fromCompactBinary
 */
const fromCompactBinary = (data) => {
  if (data[0] !== 2) throw new Error('invalid compact binary data')

  const created = create()

  created.transforms = mat4.clone(data.slice(1, 17))

  created.isClosed = !!data[17]

  for (let i = 22; i < data.length; i += 2) {
    const point = vec2.fromValues(data[i], data[i + 1])
    created.points.push(point)
  }
  // transfer known properties, i.e. color
  if (data[18] >= 0) {
    created.color = [data[18], data[19], data[20], data[21]]
  }
  // TODO: how about custom properties or fields ?
  return created
}

module.exports = fromCompactBinary

},{"../../maths/mat4":159,"../../maths/vec2":206,"./create":74}],77:[function(require,module,exports){
const { EPS } = require('../../maths/constants')

const vec2 = require('../../maths/vec2')

const close = require('./close')
const create = require('./create')

/**
 * Create a new path from the given points.
 * The points must be provided an array of points,
 * where each point is an array of two numbers.
 * @param {Object} options - options for construction
 * @param {Boolean} [options.closed=false] - if the path should be open or closed
 * @param {Array} points - array of points (2D) from which to create the path
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.fromPoints
 *
 * @example:
 * my newpath = fromPoints({closed: true}, [[10, 10], [-10, 10]])
 */
const fromPoints = (options, points) => {
  const defaults = { closed: false }
  let { closed } = Object.assign({}, defaults, options)

  let created = create()
  created.points = points.map((point) => vec2.clone(point))

  // check if first and last points are equal
  if (created.points.length > 1) {
    const p0 = created.points[0]
    const pn = created.points[created.points.length - 1]
    if (vec2.distance(p0, pn) < (EPS * EPS)) {
      // and close automatically
      closed = true
    }
  }
  if (closed === true) created = close(created)

  return created
}

module.exports = fromPoints

},{"../../maths/constants":110,"../../maths/vec2":206,"./close":72,"./create":74}],78:[function(require,module,exports){
/**
 * Represents a 2D geometry consisting of a list of ordered points.
 * @see {@link path2} for data structure information.
 * @module modeling/geometries/path2
 *
 * @example
 * colorize([0,0,0,1], path2.fromPoints({ closed: true }, [[0,0], [4,0], [4,3]]))
 *
 * @example
 * {
 *   "points": [[0,0], [4,0], [4,3]],
 *   "isClosed": true,
 *   "transforms": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
 *   "color": [0,0,0,1]
 * }
 */
module.exports = {
  appendArc: require('./appendArc'),
  appendBezier: require('./appendBezier'),
  appendPoints: require('./appendPoints'),
  clone: require('./clone'),
  close: require('./close'),
  concat: require('./concat'),
  create: require('./create'),
  equals: require('./equals'),
  fromPoints: require('./fromPoints'),
  fromCompactBinary: require('./fromCompactBinary'),
  isA: require('./isA'),
  reverse: require('./reverse'),
  toPoints: require('./toPoints'),
  toString: require('./toString'),
  toCompactBinary: require('./toCompactBinary'),
  transform: require('./transform'),
  validate: require('./validate')
}

},{"./appendArc":67,"./appendBezier":68,"./appendPoints":69,"./clone":71,"./close":72,"./concat":73,"./create":74,"./equals":75,"./fromCompactBinary":76,"./fromPoints":77,"./isA":79,"./reverse":80,"./toCompactBinary":81,"./toPoints":82,"./toString":83,"./transform":84,"./validate":85}],79:[function(require,module,exports){
/**
 * Determine if the given object is a path2 geometry.
 * @param {Object} object - the object to interrogate
 * @returns {Boolean} true if the object matches a path2
 * @alias module:modeling/geometries/path2.isA
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    // see create for the required attributes and types
    if ('points' in object && 'transforms' in object && 'isClosed' in object) {
      // NOTE: transforms should be a TypedArray, which has a read-only length
      if (Array.isArray(object.points) && 'length' in object.transforms) {
        return true
      }
    }
  }
  return false
}

module.exports = isA

},{}],80:[function(require,module,exports){
const clone = require('./clone')

/**
 * Reverses the path so that the points are in the opposite order.
 * This swaps the left (interior) and right (exterior) edges.
 * @param {path2} geometry - the path to reverse
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.reverse
 *
 * @example
 * let newpath = reverse(mypath)
 */
const reverse = (geometry) => {
  // NOTE: this only updates the order of the points
  const cloned = clone(geometry)
  cloned.points = geometry.points.slice().reverse()
  return cloned
}

module.exports = reverse

},{"./clone":71}],81:[function(require,module,exports){
/**
 * Produce a compact binary representation from the given path.
 * @param {path2} geometry - the path geometry
 * @returns {TypedArray} compact binary representation
 * @alias module:modeling/geometries/path2.toCompactBinary
 */
const toCompactBinary = (geometry) => {
  const points = geometry.points
  const transforms = geometry.transforms
  let color = [-1, -1, -1, -1]
  if (geometry.color) color = geometry.color

  // FIXME why Float32Array?
  const compacted = new Float32Array(1 + 16 + 1 + 4 + (points.length * 2)) // type + transforms + isClosed + color + points data

  compacted[0] = 2 // type code: 0 => geom2, 1 => geom3 , 2 => path2

  compacted[1] = transforms[0]
  compacted[2] = transforms[1]
  compacted[3] = transforms[2]
  compacted[4] = transforms[3]
  compacted[5] = transforms[4]
  compacted[6] = transforms[5]
  compacted[7] = transforms[6]
  compacted[8] = transforms[7]
  compacted[9] = transforms[8]
  compacted[10] = transforms[9]
  compacted[11] = transforms[10]
  compacted[12] = transforms[11]
  compacted[13] = transforms[12]
  compacted[14] = transforms[13]
  compacted[15] = transforms[14]
  compacted[16] = transforms[15]

  compacted[17] = geometry.isClosed ? 1 : 0

  compacted[18] = color[0]
  compacted[19] = color[1]
  compacted[20] = color[2]
  compacted[21] = color[3]

  for (let j = 0; j < points.length; j++) {
    const ci = j * 2 + 22
    const point = points[j]
    compacted[ci] = point[0]
    compacted[ci + 1] = point[1]
  }
  // TODO: how about custom properties or fields ?
  return compacted
}

module.exports = toCompactBinary

},{}],82:[function(require,module,exports){
const applyTransforms = require('./applyTransforms')

/**
 * Produces an array of points from the given geometry.
 * The returned array should not be modified as the data is shared with the geometry.
 * @param {path2} geometry - the geometry
 * @returns {Array} an array of points
 * @alias module:modeling/geometries/path2.toPoints
 *
 * @example
 * let sharedpoints = toPoints(geometry)
 */
const toPoints = (geometry) => applyTransforms(geometry).points

module.exports = toPoints

},{"./applyTransforms":70}],83:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const toPoints = require('./toPoints')

/**
 * Create a string representing the contents of the given path.
 * @param {path2} geometry - the path
 * @returns {String} a representative string
 * @alias module:modeling/geometries/path2.toString
 *
 * @example
 * console.out(toString(path))
 */
const toString = (geometry) => {
  const points = toPoints(geometry)
  let result = 'path (' + points.length + ' points, ' + geometry.isClosed + '):\n[\n'
  points.forEach((point) => {
    result += '  ' + vec2.toString(point) + ',\n'
  })
  result += ']\n'
  return result
}

module.exports = toString

},{"../../maths/vec2":206,"./toPoints":82}],84:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

/**
 * Transform the given geometry using the given matrix.
 * This is a lazy transform of the points, as this function only adjusts the transforms.
 * The transforms are applied when accessing the points via toPoints().
 * @param {mat4} matrix - the matrix to transform with
 * @param {path2} geometry - the geometry to transform
 * @returns {path2} a new path
 * @alias module:modeling/geometries/path2.transform
 *
 * @example
 * let newpath = transform(fromZRotation(TAU / 8), path)
 */
const transform = (matrix, geometry) => {
  const transforms = mat4.multiply(mat4.create(), matrix, geometry.transforms)
  return Object.assign({}, geometry, { transforms })
}

module.exports = transform

},{"../../maths/mat4":159}],85:[function(require,module,exports){
const vec2 = require('../../maths/vec2')
const isA = require('./isA')

/**
 * Determine if the given object is a valid path2.
 * Checks for valid data points, and duplicate points.
 *
 * **If the geometry is not valid, an exception will be thrown with details of the geometry error.**
 *
 * @param {Object} object - the object to interrogate
 * @throws {Error} error if the geometry is not valid
 * @alias module:modeling/geometries/path2.validate
 */
const validate = (object) => {
  if (!isA(object)) {
    throw new Error('invalid path2 structure')
  }

  // check for duplicate points
  if (object.points.length > 1) {
    for (let i = 0; i < object.points.length; i++) {
      if (vec2.equals(object.points[i], object.points[(i + 1) % object.points.length])) {
        throw new Error(`path2 duplicate points ${object.points[i]}`)
      }
    }
  }

  // check for infinity, nan
  object.points.forEach((point) => {
    if (!point.every(Number.isFinite)) {
      throw new Error(`path2 invalid point ${point}`)
    }
  })

  // check transforms
  if (!object.transforms.every(Number.isFinite)) {
    throw new Error(`path2 invalid transforms ${object.transforms}`)
  }
}

module.exports = validate

},{"../../maths/vec2":206,"./isA":79}],86:[function(require,module,exports){
const measureArea = require('./measureArea')
const flip = require('./flip')

/**
 * Determine if the given points are inside the given polygon.
 *
 * @param {Array} points - a list of points, where each point is an array with X and Y values
 * @param {poly2} polygon - a 2D polygon
 * @return {Integer} 1 if all points are inside, 0 if some or none are inside
 * @alias module:modeling/geometries/poly2.arePointsInside
 */
const arePointsInside = (points, polygon) => {
  if (points.length === 0) return 0 // nothing to check

  const vertices = polygon.vertices
  if (vertices.length < 3) return 0 // nothing can be inside an empty polygon

  if (measureArea(polygon) < 0) {
    polygon = flip(polygon) // CCW is required
  }

  const sum = points.reduce((acc, point) => acc + isPointInside(point, vertices), 0)
  return sum === points.length ? 1 : 0
}

/*
 * Determine if the given point is inside the polygon.
 *
 * @see http://erich.realtimerendering.com/ptinpoly/ (Crossings Test)
 * @param {Array} point - an array with X and Y values
 * @param {Array} polygon - a list of points, where each point is an array with X and Y values
 * @return {Integer} 1 if the point is inside, 0 if outside
 */
const isPointInside = (point, polygon) => {
  const numverts = polygon.length

  const tx = point[0]
  const ty = point[1]

  let vtx0 = polygon[numverts - 1]
  let vtx1 = polygon[0]

  let yflag0 = (vtx0[1] > ty)

  let insideFlag = 0

  let i = 0
  for (let j = (numverts + 1); --j;) {
    /*
     * check if Y endpoints straddle (are on opposite sides) of point's Y
     * if so, +X ray could intersect this edge.
     */
    const yflag1 = (vtx1[1] > ty)
    if (yflag0 !== yflag1) {
      /*
       * check if X endpoints are on same side of the point's X
       * if so, it's easy to test if edge hits or misses.
       */
      const xflag0 = (vtx0[0] > tx)
      const xflag1 = (vtx1[0] > tx)
      if (xflag0 && xflag1) {
        /* if edge's X values are both right of the point, then the point must be inside */
        insideFlag = !insideFlag
      } else {
        /*
         * if X endpoints straddle the point, then
         * the compute intersection of polygon edge with +X ray
         * if intersection >= point's X then the +X ray hits it.
         */
        if ((vtx1[0] - (vtx1[1] - ty) * (vtx0[0] - vtx1[0]) / (vtx0[1] - vtx1[1])) >= tx) {
          insideFlag = !insideFlag
        }
      }
    }
    /* move to next pair of vertices, retaining info as possible */
    yflag0 = yflag1
    vtx0 = vtx1
    vtx1 = polygon[++i]
  }
  return insideFlag
}

module.exports = arePointsInside

},{"./flip":88,"./measureArea":90}],87:[function(require,module,exports){
/**
 * Represents a convex 2D polygon consisting of a list of ordered vertices.
 * @typedef {Object} poly2
 * @property {Array} vertices - list of ordered vertices (2D)
 */

/**
 * Creates a new polygon with initial values.
 *
 * @param {Array} [vertices] - list of vertices (2D)
 * @returns {poly2} a new polygon
 * @alias module:modeling/geometries/poly2.create
 *
 * @example
 * let polygon = create()
 */
const create = (vertices) => {
  if (vertices === undefined || vertices.length < 3) {
    vertices = [] // empty contents
  }
  return { vertices: vertices }
}

module.exports = create

},{}],88:[function(require,module,exports){
const create = require('./create')

/**
 * Flip the give polygon, rotating the opposite direction.
 *
 * @param {poly2} polygon - the polygon to flip
 * @returns {poly2} a new polygon
 * @alias module:modeling/geometries/poly2.flip
 */
const flip = (polygon) => {
  const vertices = polygon.vertices.slice().reverse()
  return create(vertices)
}

module.exports = flip

},{"./create":87}],89:[function(require,module,exports){
/**
 * Represents a 2D polygon consisting of a list of ordered vertices.
 * @see {@link poly2} for data structure information.
 * @module modeling/geometries/poly2
 *
 * @example
 * poly2.create([[0,0], [4,0], [4,3]])
 *
 * @example
 * {"vertices": [[0,0], [4,0], [4,3]]}
 */
module.exports = {
  arePointsInside: require('./arePointsInside'),
  create: require('./create'),
  flip: require('./flip'),
  measureArea: require('./measureArea')
}

},{"./arePointsInside":86,"./create":87,"./flip":88,"./measureArea":90}],90:[function(require,module,exports){
/**
 * Measure the area under the given polygon.
 *
 * @param {poly2} polygon - the polygon to measure
 * @return {Number} the area of the polygon
 * @alias module:modeling/geometries/poly2.measureArea
 */
const area = require('../../maths/utils/area')

const measureArea = (polygon) => area(polygon.vertices)

module.exports = measureArea

},{"../../maths/utils/area":183}],91:[function(require,module,exports){
const create = require('./create')

const vec3 = require('../../maths/vec3')

/**
 * Create a deep clone of the given polygon
 *
 * @param {poly3} [out] - receiving polygon
 * @param {poly3} polygon - polygon to clone
 * @returns {poly3} a new polygon
 * @alias module:modeling/geometries/poly3.clone
 */
const clone = (...params) => {
  let out
  let poly3
  if (params.length === 1) {
    out = create()
    poly3 = params[0]
  } else {
    out = params[0]
    poly3 = params[1]
  }
  // deep clone of vertices
  out.vertices = poly3.vertices.map((vec) => vec3.clone(vec))
  return out
}

module.exports = clone

},{"../../maths/vec3":237,"./create":92}],92:[function(require,module,exports){

/**
 * Represents a convex 3D polygon. The vertices used to initialize a polygon must
 * be coplanar and form a convex shape. The vertices do not have to be `vec3`
 * instances but they must behave similarly.
 * @typedef {Object} poly3
 * @property {Array} vertices - list of ordered vertices (3D)
 */

/**
 * Creates a new 3D polygon with initial values.
 *
 * @param {Array} [vertices] - a list of vertices (3D)
 * @returns {poly3} a new polygon
 * @alias module:modeling/geometries/poly3.create
 */
const create = (vertices) => {
  if (vertices === undefined || vertices.length < 3) {
    vertices = [] // empty contents
  }
  return { vertices }
}

module.exports = create

},{}],93:[function(require,module,exports){
const vec3 = require('../../maths/vec3')

const create = require('./create')

/**
 * Create a polygon from the given points.
 *
 * @param {Array} points - list of points (3D)
 * @returns {poly3} a new polygon
 * @alias module:modeling/geometries/poly3.fromPoints
 *
 * @example
 * const points = [
 *   [0,  0, 0],
 *   [0, 10, 0],
 *   [0, 10, 10]
 * ]
 * const polygon = fromPoints(points)
 */
const fromPoints = (points) => {
  const vertices = points.map((point) => vec3.clone(point))
  return create(vertices)
}

module.exports = fromPoints

},{"../../maths/vec3":237,"./create":92}],94:[function(require,module,exports){
const create = require('./create')

/**
 * Create a polygon from the given vertices and plane.
 * NOTE: No checks are performed on the parameters.
 * @param {Array} vertices - list of vertices (3D)
 * @param {plane} plane - plane of the polygon
 * @returns {poly3} a new polygon
 * @alias module:modeling/geometries/poly3.fromPointsAndPlane
 */
const fromPointsAndPlane = (vertices, plane) => {
  const poly = create(vertices)
  poly.plane = plane // retain the plane for later use
  return poly
}

module.exports = fromPointsAndPlane

},{"./create":92}],95:[function(require,module,exports){
/**
 * Represents a convex 3D polygon consisting of a list of ordered vertices.
 * @see {@link poly3} for data structure information.
 * @module modeling/geometries/poly3
 *
 * @example
 * poly3.create([[0,0,0], [4,0,0], [4,3,12]])
 *
 * @example
 * {"vertices": [[0,0,0], [4,0,0], [4,3,12]]}
 */
module.exports = {
  clone: require('./clone'),
  create: require('./create'),
  fromPoints: require('./fromPoints'),
  fromPointsAndPlane: require('./fromPointsAndPlane'),
  invert: require('./invert'),
  isA: require('./isA'),
  isConvex: require('./isConvex'),
  measureArea: require('./measureArea'),
  measureBoundingBox: require('./measureBoundingBox'),
  measureBoundingSphere: require('./measureBoundingSphere'),
  measureSignedVolume: require('./measureSignedVolume'),
  plane: require('./plane'),
  toPoints: require('./toPoints'),
  toString: require('./toString'),
  transform: require('./transform'),
  validate: require('./validate')
}

},{"./clone":91,"./create":92,"./fromPoints":93,"./fromPointsAndPlane":94,"./invert":96,"./isA":97,"./isConvex":98,"./measureArea":99,"./measureBoundingBox":100,"./measureBoundingSphere":101,"./measureSignedVolume":102,"./plane":103,"./toPoints":104,"./toString":105,"./transform":106,"./validate":107}],96:[function(require,module,exports){
const plane = require('../../maths/plane')
const create = require('./create')

/**
 * Invert the give polygon to face the opposite direction.
 *
 * @param {poly3} polygon - the polygon to invert
 * @returns {poly3} a new poly3
 * @alias module:modeling/geometries/poly3.invert
 */
const invert = (polygon) => {
  const vertices = polygon.vertices.slice().reverse()
  const inverted = create(vertices)
  if (polygon.plane) {
    // Flip existing plane to save recompute
    inverted.plane = plane.flip(plane.create(), polygon.plane)
  }
  return inverted
}

module.exports = invert

},{"../../maths/plane":178,"./create":92}],97:[function(require,module,exports){
/**
 * Determine if the given object is a polygon.
 * @param {Object} object - the object to interrogate
 * @returns {Boolean} true if the object matches a poly3
 * @alias module:modeling/geometries/poly3.isA
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    if ('vertices' in object) {
      if (Array.isArray(object.vertices)) {
        return true
      }
    }
  }
  return false
}

module.exports = isA

},{}],98:[function(require,module,exports){
const plane = require('../../maths/plane')
const vec3 = require('../../maths/vec3')

/**
 * Check whether the given polygon is convex.
 * @param {poly3} polygon - the polygon to interrogate
 * @returns {Boolean} true if convex
 * @alias module:modeling/geometries/poly3.isConvex
 */
const isConvex = (polygon) => areVerticesConvex(polygon.vertices)

const areVerticesConvex = (vertices) => {
  const numvertices = vertices.length
  if (numvertices > 2) {
    // note: plane ~= normal point
    const normal = plane.fromPoints(plane.create(), ...vertices)
    let prevprevpos = vertices[numvertices - 2]
    let prevpos = vertices[numvertices - 1]
    for (let i = 0; i < numvertices; i++) {
      const pos = vertices[i]
      if (!isConvexPoint(prevprevpos, prevpos, pos, normal)) {
        return false
      }
      prevprevpos = prevpos
      prevpos = pos
    }
  }
  return true
}

// calculate whether three points form a convex corner
//  prevpoint, point, nextpoint: the 3 coordinates (Vector3D instances)
//  normal: the normal vector of the plane
const isConvexPoint = (prevpoint, point, nextpoint, normal) => {
  const crossproduct = vec3.cross(
    vec3.create(),
    vec3.subtract(vec3.create(), point, prevpoint),
    vec3.subtract(vec3.create(), nextpoint, point)
  )
  const crossdotnormal = vec3.dot(crossproduct, normal)
  return crossdotnormal >= 0
}

module.exports = isConvex

},{"../../maths/plane":178,"../../maths/vec3":237}],99:[function(require,module,exports){
const plane = require('./plane')

/**
 * Measure the area of the given polygon.
 * @see 2000 softSurfer http://geomalgorithms.com
 * @param {poly3} polygon - the polygon to measure
 * @return {Number} area of the polygon
 * @alias module:modeling/geometries/poly3.measureArea
 */
const measureArea = (polygon) => {
  const n = polygon.vertices.length
  if (n < 3) {
    return 0 // degenerate polygon
  }
  const vertices = polygon.vertices

  // calculate a normal vector
  const normal = plane(polygon)

  // determine direction of projection
  const ax = Math.abs(normal[0])
  const ay = Math.abs(normal[1])
  const az = Math.abs(normal[2])

  if (ax + ay + az === 0) {
    // normal does not exist
    return 0
  }

  let coord = 3 // ignore Z coordinates
  if ((ax > ay) && (ax > az)) {
    coord = 1 // ignore X coordinates
  } else
  if (ay > az) {
    coord = 2 // ignore Y coordinates
  }

  let area = 0
  let h = 0
  let i = 1
  let j = 2
  switch (coord) {
    case 1: // ignore X coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1
        j = (i + 1) % n
        area += (vertices[i][1] * (vertices[j][2] - vertices[h][2]))
      }
      area += (vertices[0][1] * (vertices[1][2] - vertices[n - 1][2]))
      // scale to get area
      area /= (2 * normal[0])
      break

    case 2: // ignore Y coordinates
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1
        j = (i + 1) % n
        area += (vertices[i][2] * (vertices[j][0] - vertices[h][0]))
      }
      area += (vertices[0][2] * (vertices[1][0] - vertices[n - 1][0]))
      // scale to get area
      area /= (2 * normal[1])
      break

    case 3: // ignore Z coordinates
    default:
      // compute area of 2D projection
      for (i = 1; i < n; i++) {
        h = i - 1
        j = (i + 1) % n
        area += (vertices[i][0] * (vertices[j][1] - vertices[h][1]))
      }
      area += (vertices[0][0] * (vertices[1][1] - vertices[n - 1][1]))
      // scale to get area
      area /= (2 * normal[2])
      break
  }
  return area
}

module.exports = measureArea

},{"./plane":103}],100:[function(require,module,exports){
const vec3 = require('../../maths/vec3')

/**
 * @param {poly3} polygon - the polygon to measure
 * @returns {Array} an array of two vectors (3D);  minimum and maximum coordinates
 * @alias module:modeling/geometries/poly3.measureBoundingBox
 */
const measureBoundingBox = (polygon) => {
  const vertices = polygon.vertices
  const numvertices = vertices.length
  const min = numvertices === 0 ? vec3.create() : vec3.clone(vertices[0])
  const max = vec3.clone(min)
  for (let i = 1; i < numvertices; i++) {
    vec3.min(min, min, vertices[i])
    vec3.max(max, max, vertices[i])
  }
  return [min, max]
}

module.exports = measureBoundingBox

},{"../../maths/vec3":237}],101:[function(require,module,exports){
const vec4 = require('../../maths/vec4')

const cache = new WeakMap()

/**
 * Measure the bounding sphere of the given polygon.
 * @param {poly3} polygon - the polygon to measure
 * @returns {vec4} the computed bounding sphere; center point (3D) and radius
 * @alias module:modeling/geometries/poly3.measureBoundingSphere
 */
const measureBoundingSphere = (polygon) => {
  const boundingSphere = cache.get(polygon)
  if (boundingSphere) return boundingSphere

  const vertices = polygon.vertices
  const out = vec4.create()

  if (vertices.length === 0) {
    out[0] = 0
    out[1] = 0
    out[2] = 0
    out[3] = 0
    return out
  }

  // keep a list of min/max vertices by axis
  let minx = vertices[0]
  let miny = minx
  let minz = minx
  let maxx = minx
  let maxy = minx
  let maxz = minx

  vertices.forEach((v) => {
    if (minx[0] > v[0]) minx = v
    if (miny[1] > v[1]) miny = v
    if (minz[2] > v[2]) minz = v
    if (maxx[0] < v[0]) maxx = v
    if (maxy[1] < v[1]) maxy = v
    if (maxz[2] < v[2]) maxz = v
  })

  out[0] = (minx[0] + maxx[0]) * 0.5 // center of sphere
  out[1] = (miny[1] + maxy[1]) * 0.5
  out[2] = (minz[2] + maxz[2]) * 0.5
  const x = out[0] - maxx[0]
  const y = out[1] - maxy[1]
  const z = out[2] - maxz[2]
  out[3] = Math.sqrt(x * x + y * y + z * z) // radius of sphere

  cache.set(polygon, out)

  return out
}

module.exports = measureBoundingSphere

},{"../../maths/vec4":263}],102:[function(require,module,exports){
const vec3 = require('../../maths/vec3')

/**
 * Measure the signed volume of the given polygon, which must be convex.
 * The volume is that formed by the tetrahedron connected to the axis [0,0,0],
 * and will be positive or negative based on the rotation of the vertices.
 * @see http://chenlab.ece.cornell.edu/Publication/Cha/icip01_Cha.pdf
 * @param {poly3} polygon - the polygon to measure
 * @return {Number} volume of the polygon
 * @alias module:modeling/geometries/poly3.measureSignedVolume
 */
const measureSignedVolume = (polygon) => {
  let signedVolume = 0
  const vertices = polygon.vertices
  // calculate based on triangular polygons
  const cross = vec3.create()
  for (let i = 0; i < vertices.length - 2; i++) {
    vec3.cross(cross, vertices[i + 1], vertices[i + 2])
    signedVolume += vec3.dot(vertices[0], cross)
  }
  signedVolume /= 6
  return signedVolume
}

module.exports = measureSignedVolume

},{"../../maths/vec3":237}],103:[function(require,module,exports){
const mplane = require('../../maths/plane/')

const plane = (polygon) => {
  if (!polygon.plane) {
    polygon.plane = mplane.fromPoints(mplane.create(), ...polygon.vertices)
  }
  return polygon.plane
}

module.exports = plane

},{"../../maths/plane/":178}],104:[function(require,module,exports){
/**
 * Return the given polygon as a list of points.
 * NOTE: The returned array should not be modified as the points are shared with the geometry.
 * @param {poly3} polygon - the polygon
 * @return {Array} list of points (3D)
 * @alias module:modeling/geometries/poly3.toPoints
 */
const toPoints = (polygon) => polygon.vertices

module.exports = toPoints

},{}],105:[function(require,module,exports){
const vec3 = require('../../maths/vec3/')

/**
 * @param {poly3} polygon - the polygon to measure
 * @return {String} the string representation
 * @alias module:modeling/geometries/poly3.toString
 */
const toString = (polygon) => {
  let result = 'poly3: vertices: ['
  polygon.vertices.forEach((vertex) => {
    result += `${vec3.toString(vertex)}, `
  })
  result += ']'
  return result
}

module.exports = toString

},{"../../maths/vec3/":237}],106:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec3 = require('../../maths/vec3')

const create = require('./create')

/**
 * Transform the given polygon using the given matrix.
 * @param {mat4} matrix - the matrix to transform with
 * @param {poly3} polygon - the polygon to transform
 * @returns {poly3} a new polygon
 * @alias module:modeling/geometries/poly3.transform
 */
const transform = (matrix, polygon) => {
  const vertices = polygon.vertices.map((vertex) => vec3.transform(vec3.create(), vertex, matrix))
  if (mat4.isMirroring(matrix)) {
    // reverse the order to preserve the orientation
    vertices.reverse()
  }
  return create(vertices)
}

module.exports = transform

},{"../../maths/mat4":159,"../../maths/vec3":237,"./create":92}],107:[function(require,module,exports){
const signedDistanceToPoint = require('../../maths/plane/signedDistanceToPoint')
const { NEPS } = require('../../maths/constants')
const vec3 = require('../../maths/vec3')
const isA = require('./isA')
const isConvex = require('./isConvex')
const measureArea = require('./measureArea')
const plane = require('./plane')

/**
 * Determine if the given object is a valid polygon.
 * Checks for valid data structure, convex polygons, and duplicate points.
 *
 * **If the geometry is not valid, an exception will be thrown with details of the geometry error.**
 *
 * @param {Object} object - the object to interrogate
 * @throws {Error} error if the geometry is not valid
 * @alias module:modeling/geometries/poly3.validate
 */
const validate = (object) => {
  if (!isA(object)) {
    throw new Error('invalid poly3 structure')
  }

  // check for empty polygon
  if (object.vertices.length < 3) {
    throw new Error(`poly3 not enough vertices ${object.vertices.length}`)
  }
  // check area
  if (measureArea(object) <= 0) {
    throw new Error('poly3 area must be greater than zero')
  }

  // check for duplicate points
  for (let i = 0; i < object.vertices.length; i++) {
    if (vec3.equals(object.vertices[i], object.vertices[(i + 1) % object.vertices.length])) {
      throw new Error(`poly3 duplicate vertex ${object.vertices[i]}`)
    }
  }

  // check convexity
  if (!isConvex(object)) {
    throw new Error('poly3 must be convex')
  }

  // check for infinity, nan
  object.vertices.forEach((vertex) => {
    if (!vertex.every(Number.isFinite)) {
      throw new Error(`poly3 invalid vertex ${vertex}`)
    }
  })

  // check that points are co-planar
  if (object.vertices.length > 3) {
    const normal = plane(object)
    object.vertices.forEach((vertex) => {
      const dist = Math.abs(signedDistanceToPoint(normal, vertex))
      if (dist > NEPS) {
        throw new Error(`poly3 must be coplanar: vertex ${vertex} distance ${dist}`)
      }
    })
  }
}

module.exports = validate

},{"../../maths/constants":110,"../../maths/plane/signedDistanceToPoint":180,"../../maths/vec3":237,"./isA":97,"./isConvex":98,"./measureArea":99,"./plane":103}],108:[function(require,module,exports){
module.exports = {
  colors: require('./colors'),
  curves: require('./curves'),
  geometries: require('./geometries'),
  maths: require('./maths'),
  measurements: require('./measurements'),
  primitives: require('./primitives'),
  text: require('./text'),
  utils: require('./utils'),

  booleans: require('./operations/booleans'),
  expansions: require('./operations/expansions'),
  extrusions: require('./operations/extrusions'),
  hulls: require('./operations/hulls'),
  modifiers: require('./operations/modifiers'),
  transforms: require('./operations/transforms')
}

},{"./colors":25,"./curves":36,"./geometries":66,"./maths":111,"./measurements":267,"./operations/booleans":281,"./operations/expansions":310,"./operations/extrusions":333,"./operations/hulls":355,"./operations/modifiers":366,"./operations/transforms":376,"./primitives":392,"./text":406,"./utils":414}],109:[function(require,module,exports){
const mat4 = require('./mat4')

const vec2 = require('./vec2')
const vec3 = require('./vec3')

/*
 * Class OrthoNormalBasis
 * Reprojects points on a 3D plane onto a 2D plane
 * or from a 2D plane back onto the 3D plane
 * @param  {plane} plane
 * @param  {vec3} rightvector
 */
const OrthoNormalBasis = function (plane, rightvector) {
  if (arguments.length < 2) {
    // choose an arbitrary right hand vector, making sure it is somewhat orthogonal to the plane normal:
    rightvector = vec3.orthogonal(vec3.create(), plane)
  }
  this.v = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), plane, rightvector))
  this.u = vec3.cross(vec3.create(), this.v, plane)
  this.plane = plane
  this.planeorigin = vec3.scale(vec3.create(), plane, plane[3])
}

// Get an orthonormal basis for the standard XYZ planes.
// Parameters: the names of two 3D axes. The 2d x axis will map to the first given 3D axis, the 2d y
// axis will map to the second.
// Prepend the axis with a "-" to invert the direction of this axis.
// For example: OrthoNormalBasis.GetCartesian("-Y","Z")
//   will return an orthonormal basis where the 2d X axis maps to the 3D inverted Y axis, and
//   the 2d Y axis maps to the 3D Z axis.
OrthoNormalBasis.GetCartesian = function (xaxisid, yaxisid) {
  const axisid = xaxisid + '/' + yaxisid
  let planenormal, rightvector
  if (axisid === 'X/Y') {
    planenormal = [0, 0, 1]
    rightvector = [1, 0, 0]
  } else if (axisid === 'Y/-X') {
    planenormal = [0, 0, 1]
    rightvector = [0, 1, 0]
  } else if (axisid === '-X/-Y') {
    planenormal = [0, 0, 1]
    rightvector = [-1, 0, 0]
  } else if (axisid === '-Y/X') {
    planenormal = [0, 0, 1]
    rightvector = [0, -1, 0]
  } else if (axisid === '-X/Y') {
    planenormal = [0, 0, -1]
    rightvector = [-1, 0, 0]
  } else if (axisid === '-Y/-X') {
    planenormal = [0, 0, -1]
    rightvector = [0, -1, 0]
  } else if (axisid === 'X/-Y') {
    planenormal = [0, 0, -1]
    rightvector = [1, 0, 0]
  } else if (axisid === 'Y/X') {
    planenormal = [0, 0, -1]
    rightvector = [0, 1, 0]
  } else if (axisid === 'X/Z') {
    planenormal = [0, -1, 0]
    rightvector = [1, 0, 0]
  } else if (axisid === 'Z/-X') {
    planenormal = [0, -1, 0]
    rightvector = [0, 0, 1]
  } else if (axisid === '-X/-Z') {
    planenormal = [0, -1, 0]
    rightvector = [-1, 0, 0]
  } else if (axisid === '-Z/X') {
    planenormal = [0, -1, 0]
    rightvector = [0, 0, -1]
  } else if (axisid === '-X/Z') {
    planenormal = [0, 1, 0]
    rightvector = [-1, 0, 0]
  } else if (axisid === '-Z/-X') {
    planenormal = [0, 1, 0]
    rightvector = [0, 0, -1]
  } else if (axisid === 'X/-Z') {
    planenormal = [0, 1, 0]
    rightvector = [1, 0, 0]
  } else if (axisid === 'Z/X') {
    planenormal = [0, 1, 0]
    rightvector = [0, 0, 1]
  } else if (axisid === 'Y/Z') {
    planenormal = [1, 0, 0]
    rightvector = [0, 1, 0]
  } else if (axisid === 'Z/-Y') {
    planenormal = [1, 0, 0]
    rightvector = [0, 0, 1]
  } else if (axisid === '-Y/-Z') {
    planenormal = [1, 0, 0]
    rightvector = [0, -1, 0]
  } else if (axisid === '-Z/Y') {
    planenormal = [1, 0, 0]
    rightvector = [0, 0, -1]
  } else if (axisid === '-Y/Z') {
    planenormal = [-1, 0, 0]
    rightvector = [0, -1, 0]
  } else if (axisid === '-Z/-Y') {
    planenormal = [-1, 0, 0]
    rightvector = [0, 0, -1]
  } else if (axisid === 'Y/-Z') {
    planenormal = [-1, 0, 0]
    rightvector = [0, 1, 0]
  } else if (axisid === 'Z/Y') {
    planenormal = [-1, 0, 0]
    rightvector = [0, 0, 1]
  } else {
    throw new Error('OrthoNormalBasis.GetCartesian: invalid combination of axis identifiers. Should pass two string arguments from [X,Y,Z,-X,-Y,-Z], being two different axes.')
  }
  return new OrthoNormalBasis(new Plane(new Vector3D(planenormal), 0), new Vector3D(rightvector))
}

/*
// test code for OrthoNormalBasis.GetCartesian()
OrthoNormalBasis.GetCartesian_Test=function() {
  let axisnames=["X","Y","Z","-X","-Y","-Z"];
  let axisvectors=[[1,0,0], [0,1,0], [0,0,1], [-1,0,0], [0,-1,0], [0,0,-1]];
  for(let axis1=0; axis1 < 3; axis1++) {
    for(let axis1inverted=0; axis1inverted < 2; axis1inverted++) {
      let axis1name=axisnames[axis1+3*axis1inverted];
      let axis1vector=axisvectors[axis1+3*axis1inverted];
      for(let axis2=0; axis2 < 3; axis2++) {
        if(axis2 != axis1) {
          for(let axis2inverted=0; axis2inverted < 2; axis2inverted++) {
            let axis2name=axisnames[axis2+3*axis2inverted];
            let axis2vector=axisvectors[axis2+3*axis2inverted];
            let orthobasis=OrthoNormalBasis.GetCartesian(axis1name, axis2name);
            let test1=orthobasis.to3D(new Vector2D([1,0]));
            let test2=orthobasis.to3D(new Vector2D([0,1]));
            let expected1=new Vector3D(axis1vector);
            let expected2=new Vector3D(axis2vector);
            let d1=test1.distanceTo(expected1);
            let d2=test2.distanceTo(expected2);
            if( (d1 > 0.01) || (d2 > 0.01) ) {
              throw new Error("Wrong!");
  }}}}}}
  throw new Error("OK");
};
*/

// The z=0 plane, with the 3D x and y vectors mapped to the 2D x and y vector
OrthoNormalBasis.Z0Plane = function () {
  const plane = new Plane(new Vector3D([0, 0, 1]), 0)
  return new OrthoNormalBasis(plane, new Vector3D([1, 0, 0]))
}

OrthoNormalBasis.prototype = {

  getProjectionMatrix: function () {
    return mat4.fromValues(
      this.u[0], this.v[0], this.plane[0], 0,
      this.u[1], this.v[1], this.plane[1], 0,
      this.u[2], this.v[2], this.plane[2], 0,
      0, 0, -this.plane[3], 1
    )
  },

  getInverseProjectionMatrix: function () {
    const p = vec3.scale(vec3.create(), this.plane, this.plane[3])
    return mat4.fromValues(
      this.u[0], this.u[1], this.u[2], 0,
      this.v[0], this.v[1], this.v[2], 0,
      this.plane[0], this.plane[1], this.plane[2], 0,
      p[0], p[1], p[2], 1
    )
  },

  to2D: function (point) {
    return vec2.fromValues(vec3.dot(point, this.u), vec3.dot(point, this.v))
  },

  to3D: function (point) {
    const v1 = vec3.scale(vec3.create(), this.u, point[0])
    const v2 = vec3.scale(vec3.create(), this.v, point[1])

    const v3 = vec3.add(v1, v1, this.planeorigin)
    const v4 = vec3.add(v2, v2, v3)
    return v4
  },

  line3Dto2D: function (line3d) {
    const a = line3d.point
    const b = line3d.direction.plus(a)
    const a2d = this.to2D(a)
    const b2d = this.to2D(b)
    return Line2D.fromPoints(a2d, b2d)
  },

  line2Dto3D: function (line2d) {
    const a = line2d.origin()
    const b = line2d.direction().plus(a)
    const a3d = this.to3D(a)
    const b3d = this.to3D(b)
    return Line3D.fromPoints(a3d, b3d)
  },

  transform: function (matrix4x4) {
    // todo: this may not work properly in case of mirroring
    const newplane = this.plane.transform(matrix4x4)
    const rightpointTransformed = this.u.transform(matrix4x4)
    const originTransformed = new Vector3D(0, 0, 0).transform(matrix4x4)
    const newrighthandvector = rightpointTransformed.minus(originTransformed)
    const newbasis = new OrthoNormalBasis(newplane, newrighthandvector)
    return newbasis
  }
}

module.exports = OrthoNormalBasis

},{"./mat4":159,"./vec2":206,"./vec3":237}],110:[function(require,module,exports){
/**
 * The resolution of space, currently one hundred nanometers.
 * This should be 1 / EPS.
 * @alias module:modeling/maths.spatialResolution
 * @default
 */
const spatialResolution = 1e5

/**
 * Epsilon used during determination of near zero distances.
 * This should be 1 / spacialResolution.
 * @default
 * @alias module:modeling/maths.EPS
 */
const EPS = 1e-5

/**
 * Smaller epsilon used for measuring near zero distances.
 * @default
 * @alias module:modeling/maths.NEPS
 */
const NEPS = 1e-13
// NEPS is derived from a series of tests to determine the optimal precision
// for comparing coplanar polygons, as provided by the sphere primitive at high
// segmentation. NEPS is for 64 bit Number values.

/**
 * The TAU property represents the ratio of the circumference of a circle to its radius.
 * Approximately 6.28318530717958647692
 * @default
 * @example
 * const { TAU } = require('@jscad/modeling').maths.constants
 */
const TAU = Math.PI * 2

module.exports = {
  EPS,
  NEPS,
  TAU,
  spatialResolution
}

},{}],111:[function(require,module,exports){
/**
 * Maths are computational units for fundamental Euclidean geometry. All maths operate upon array data structures.
 * Note: Maths data structures are considered immutable, so never change the contents directly.
 * @see Most computations are based upon the glMatrix library (glmatrix.net)
 * @module modeling/maths
 * @example
 * const { constants, line2, mat4, vec2, vec3 } = require('@jscad/modeling').maths

 */
module.exports = {
  constants: require('./constants'),
  line2: require('./line2'),
  line3: require('./line3'),
  mat4: require('./mat4'),
  plane: require('./plane'),
  utils: require('./utils'),
  vec2: require('./vec2'),
  vec3: require('./vec3'),
  vec4: require('./vec4')
}

},{"./constants":110,"./line2":121,"./line3":138,"./mat4":159,"./plane":178,"./utils":184,"./vec2":206,"./vec3":237,"./vec4":263}],112:[function(require,module,exports){
const create = require('./create')

/**
 * Create a clone of the given line.
 *
 * @param {line2} line - line to clone
 * @returns {line2} a new unbounded line
 * @alias module:modeling/maths/line2.clone
 */
const clone = (line) => {
  const out = create()
  out[0] = line[0]
  out[1] = line[1]
  out[2] = line[2]
  return out
}

module.exports = clone

},{"./create":115}],113:[function(require,module,exports){
const vec2 = require('../vec2')

const direction = require('./direction')
const origin = require('./origin')

/**
 * Determine the closest point on the given line to the given point.
 *
 * @param {line2} line - line of reference
 * @param {vec2} point - point of reference
 * @returns {vec2} closest point
 * @alias module:modeling/maths/line2.closestPoint
 */
const closestPoint = (line, point) => {
  const orig = origin(line)
  const dir = direction(line)

  const v = vec2.subtract(vec2.create(), point, orig)
  const dist = vec2.dot(v, dir)
  vec2.scale(v, dir, dist)
  vec2.add(v, v, orig)
  return v
}

module.exports = closestPoint

},{"../vec2":206,"./direction":116,"./origin":123}],114:[function(require,module,exports){
/**
 * Copy the given line to the receiving line.
 *
 * @param {line2} out - receiving line
 * @param {line2} line - line to copy
 * @returns {line2} out
 * @alias module:modeling/maths/line2.copy
 */
const copy = (out, line) => {
  out[0] = line[0]
  out[1] = line[1]
  out[2] = line[2]
  return out
}

module.exports = copy

},{}],115:[function(require,module,exports){
/**
 * Represents a unbounded line in 2D space, positioned at a point of origin.
 * A line is parametrized by a normal vector (perpendicular to the line, rotated 90 degrees counter clockwise) and
 * distance from the origin.
 *
 * Equation: A Point (P) is on Line (L) if dot(L.normal, P) == L.distance
 *
 * The contents of the array are a normal [0,1] and a distance [2].
 * @typedef {Array} line2
 */

/**
 * Create a line, positioned at 0,0, and running along the X axis.
 *
 * @returns {line2} a new unbounded line
 * @alias module:modeling/maths/line2.create
 */
const create = () => [0, 1, 0] // normal and distance

module.exports = create

},{}],116:[function(require,module,exports){
const vec2 = require('../vec2')

/**
 * Return the direction of the given line.
 *
 * @param {line2} line - line of reference
 * @return {vec2} a vector in the direction of the line
 * @alias module:modeling/maths/line2.direction
 */
const direction = (line) => {
  const vector = vec2.normal(vec2.create(), line)
  vec2.negate(vector, vector)
  return vector
}

module.exports = direction

},{"../vec2":206}],117:[function(require,module,exports){
const vec2 = require('../vec2')

/**
 * Calculate the distance (positive) between the given point and line.
 *
 * @param {line2} line - line of reference
 * @param {vec2} point - point of reference
 * @return {Number} distance between line and point
 * @alias module:modeling/maths/line2.distanceToPoint
 */
const distanceToPoint = (line, point) => {
  let distance = vec2.dot(point, line)
  distance = Math.abs(distance - line[2])
  return distance
}

module.exports = distanceToPoint

},{"../vec2":206}],118:[function(require,module,exports){
/**
 * Compare the given lines for equality.
 *
 * @param {line2} line1 - first line to compare
 * @param {line2} line2 - second line to compare
 * @return {Boolean} true if lines are equal
 * @alias module:modeling/maths/line2.equals
 */
const equals = (line1, line2) => (line1[0] === line2[0]) && (line1[1] === line2[1] && (line1[2] === line2[2]))

module.exports = equals

},{}],119:[function(require,module,exports){
const vec2 = require('../vec2')

/**
 * Create a new line that passes through the given points.
 *
 * @param {line2} out - receiving line
 * @param {vec2} point1 - start point of the line
 * @param {vec2} point2 - end point of the line
 * @returns {line2} a new unbounded line
 * @alias module:modeling/maths/line2.fromPoints
 */
const fromPoints = (out, point1, point2) => {
  const vector = vec2.subtract(vec2.create(), point2, point1) // directional vector

  vec2.normal(vector, vector)
  vec2.normalize(vector, vector) // normalized

  const distance = vec2.dot(point1, vector)

  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = distance
  return out
}

module.exports = fromPoints

},{"../vec2":206}],120:[function(require,module,exports){
const create = require('./create')

/**
 * Creates a new line initialized with the given values.
 *
 * @param {Number} x - X coordinate of the unit normal
 * @param {Number} y - Y coordinate of the unit normal
 * @param {Number} d - distance of the line from [0,0]
 * @returns {line2} a new unbounded line
 * @alias module:modeling/maths/line2.fromValues
 */
const fromValues = (x, y, d) => {
  const out = create()
  out[0] = x
  out[1] = y
  out[2] = d
  return out
}

module.exports = fromValues

},{"./create":115}],121:[function(require,module,exports){
/**
 * Represents a unbounded line in 2D space, positioned at a point of origin.
 * @see {@link line2} for data structure information.
 * @module modeling/maths/line2
 */
module.exports = {
  clone: require('./clone'),
  closestPoint: require('./closestPoint'),
  copy: require('./copy'),
  create: require('./create'),
  direction: require('./direction'),
  distanceToPoint: require('./distanceToPoint'),
  equals: require('./equals'),
  fromPoints: require('./fromPoints'),
  fromValues: require('./fromValues'),
  intersectPointOfLines: require('./intersectPointOfLines'),
  origin: require('./origin'),
  reverse: require('./reverse'),
  toString: require('./toString'),
  transform: require('./transform'),
  xAtY: require('./xAtY')
}

},{"./clone":112,"./closestPoint":113,"./copy":114,"./create":115,"./direction":116,"./distanceToPoint":117,"./equals":118,"./fromPoints":119,"./fromValues":120,"./intersectPointOfLines":122,"./origin":123,"./reverse":124,"./toString":125,"./transform":126,"./xAtY":127}],122:[function(require,module,exports){
const vec2 = require('../vec2')
const { solve2Linear } = require('../utils')

/**
 * Return the point of intersection between the given lines.
 *
 * NOTES:
 * The point will have Infinity values if the lines are parallel.
 * The point will have NaN values if the lines are the same.
 *
 * @param {line2} line1 - line of reference
 * @param {line2} line2 - line of reference
 * @return {vec2} the point of intersection
 * @alias module:modeling/maths/line2.intersectPointOfLines
 */
const intersectToLine = (line1, line2) => {
  const point = solve2Linear(line1[0], line1[1], line2[0], line2[1], line1[2], line2[2])
  return vec2.clone(point)
}

module.exports = intersectToLine

},{"../utils":184,"../vec2":206}],123:[function(require,module,exports){
const vec2 = require('../vec2')

/**
 * Return the origin of the given line.
 * The origin is the point on the line which is closest to the origin [0, 0].
 *
 * @param {line2} line - line of reference
 * @return {vec2} the origin of the line
 * @alias module:modeling/maths/line2.origin
 */
const origin = (line) => vec2.scale(vec2.create(), line, line[2])

module.exports = origin

},{"../vec2":206}],124:[function(require,module,exports){
const vec2 = require('../vec2')

const copy = require('./copy')
const fromValues = require('./fromValues')

/**
 * Create a new line in the opposite direction as the given.
 *
 * @param {line2} out - receiving line
 * @param {line2} line - line to reverse
 * @returns {line2} out
 * @alias module:modeling/maths/line2.reverse
 */
const reverse = (out, line) => {
  const normal = vec2.negate(vec2.create(), line)
  const distance = -line[2]
  return copy(out, fromValues(normal[0], normal[1], distance))
}

module.exports = reverse

},{"../vec2":206,"./copy":114,"./fromValues":120}],125:[function(require,module,exports){
/**
 * Return a string representing the given line.
 *
 * @param {line2} line - line of reference
 * @returns {String} string representation
 * @alias module:modeling/maths/line2.toString
 */
const toString = (line) => `line2: (${line[0].toFixed(7)}, ${line[1].toFixed(7)}, ${line[2].toFixed(7)})`

module.exports = toString

},{}],126:[function(require,module,exports){
const vec2 = require('../vec2')

const fromPoints = require('./fromPoints')
const origin = require('./origin')
const direction = require('./direction')

/**
 * Transforms the given line using the given matrix.
 *
 * @param {line2} out - receiving line
 * @param {line2} line - line to transform
 * @param {mat4} matrix - matrix to transform with
 * @returns {line2} out
 * @alias module:modeling/maths/line2.transform
 */
const transform = (out, line, matrix) => {
  const org = origin(line)
  const dir = direction(line)

  vec2.transform(org, org, matrix)
  vec2.transform(dir, dir, matrix)

  return fromPoints(out, org, dir)
}

module.exports = transform

},{"../vec2":206,"./direction":116,"./fromPoints":119,"./origin":123}],127:[function(require,module,exports){
const origin = require('./origin')

/**
 * Determine the X coordinate of the given line at the Y coordinate.
 *
 * The X coordinate will be Infinity if the line is parallel to the X axis.
 *
 * @param {line2} line - line of reference
 * @param {Number} y - Y coordinate on the line
 * @return {Number} the X coordinate on the line
 * @alias module:modeling/maths/line2.xAtY
 */
const xAtY = (line, y) => {
  let x = (line[2] - (line[1] * y)) / line[0]
  if (Number.isNaN(x)) {
    const org = origin(line)
    x = org[0]
  }
  return x
}

module.exports = xAtY

},{"./origin":123}],128:[function(require,module,exports){
const vec3 = require('../vec3')

const create = require('./create')

/**
 * Create a clone of the given line.
 *
 * @param {line3} line - line to clone
 * @returns {line3} a new unbounded line
 * @alias module:modeling/maths/line3.clone
 */
const clone = (line) => {
  const out = create()
  vec3.copy(out[0], line[0])
  vec3.copy(out[1], line[1])
  return out
}

module.exports = clone

},{"../vec3":237,"./create":131}],129:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Determine the closest point on the given line to the given point.
 *
 * @param {line3} line - line of reference
 * @param {vec3} point - point of reference
 * @returns {vec3} a point
 * @alias module:modeling/maths/line3.closestPoint
 */
const closestPoint = (line, point) => {
  const lpoint = line[0]
  const ldirection = line[1]

  const a = vec3.dot(vec3.subtract(vec3.create(), point, lpoint), ldirection)
  const b = vec3.dot(ldirection, ldirection)
  const t = a / b

  const closestpoint = vec3.scale(vec3.create(), ldirection, t)
  vec3.add(closestpoint, closestpoint, lpoint)
  return closestpoint
}

module.exports = closestPoint

},{"../vec3":237}],130:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Copy the given line into the receiving line.
 *
 * @param {line3} out - receiving line
 * @param {line3} line - line to copy
 * @returns {line3} out
 * @alias module:modeling/maths/line3.copy
 */
const copy = (out, line) => {
  vec3.copy(out[0], line[0])
  vec3.copy(out[1], line[1])
  return out
}

module.exports = copy

},{"../vec3":237}],131:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Represents a unbounded line in 3D space, positioned at a point of origin.
 * A line is parametrized by a point of origin and a directional vector.
 *
 * The array contents are two 3D vectors; origin [0,0,0] and directional vector [0,0,1].
 * @see https://en.wikipedia.org/wiki/Hesse_normal_form
 * @typedef {Array} line3
 */

/**
 * Create a line, positioned at 0,0,0 and lying on the X axis.
 *
 * @returns {line3} a new unbounded line
 * @alias module:modeling/maths/line3.create
 */
const create = () => [
  vec3.fromValues(0, 0, 0), // origin
  vec3.fromValues(0, 0, 1) // direction
]

module.exports = create

},{"../vec3":237}],132:[function(require,module,exports){
/**
 * Return the direction of the given line.
 *
 * @param {line3} line - line for reference
 * @return {vec3} the relative vector in the direction of the line
 * @alias module:modeling/maths/line3.direction
 */
const direction = (line) => line[1]

module.exports = direction

},{}],133:[function(require,module,exports){
const vec3 = require('../vec3')

const closestPoint = require('./closestPoint')

/**
 * Calculate the distance (positive) between the given point and line.
 *
 * @param {line3} line - line of reference
 * @param {vec3} point - point of reference
 * @return {Number} distance between line and point
 * @alias module:modeling/maths/line3.distanceToPoint
 */
const distanceToPoint = (line, point) => {
  const closest = closestPoint(line, point)
  const distancevector = vec3.subtract(vec3.create(), point, closest)
  return vec3.length(distancevector)
}

module.exports = distanceToPoint

},{"../vec3":237,"./closestPoint":129}],134:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Compare the given lines for equality.
 *
 * @param {line3} line1 - first line to compare
 * @param {line3} line2 - second line to compare
 * @return {Boolean} true if lines are equal
 * @alias module:modeling/maths/line3.equals
 */
const equals = (line1, line2) => {
  // compare directions (unit vectors)
  if (!vec3.equals(line1[1], line2[1])) return false

  // compare points
  if (!vec3.equals(line1[0], line2[0])) return false

  // why would lines with the same slope (direction) and different points be equal?
  // let distance = distanceToPoint(line1, line2[0])
  // if (distance > EPS) return false

  return true
}

module.exports = equals

},{"../vec3":237}],135:[function(require,module,exports){
const vec3 = require('../vec3')
const { solve2Linear } = require('../utils')

const { EPS } = require('../constants')

const fromPointAndDirection = require('./fromPointAndDirection')

/**
 * Create a line the intersection of the given planes.
 *
 * @param {line3} out - receiving line
 * @param {plane} plane1 - first plane of reference
 * @param {plane} plane2 - second plane of reference
 * @returns {line3} out
 * @alias module:modeling/maths/line3.fromPlanes
 */
const fromPlanes = (out, plane1, plane2) => {
  let direction = vec3.cross(vec3.create(), plane1, plane2)
  let length = vec3.length(direction)
  if (length < EPS) {
    throw new Error('parallel planes do not intersect')
  }
  length = (1.0 / length)
  direction = vec3.scale(direction, direction, length)

  const absx = Math.abs(direction[0])
  const absy = Math.abs(direction[1])
  const absz = Math.abs(direction[2])
  let origin
  let r
  if ((absx >= absy) && (absx >= absz)) {
    // find a point p for which x is zero
    r = solve2Linear(plane1[1], plane1[2], plane2[1], plane2[2], plane1[3], plane2[3])
    origin = vec3.fromValues(0, r[0], r[1])
  } else if ((absy >= absx) && (absy >= absz)) {
    // find a point p for which y is zero
    r = solve2Linear(plane1[0], plane1[2], plane2[0], plane2[2], plane1[3], plane2[3])
    origin = vec3.fromValues(r[0], 0, r[1])
  } else {
    // find a point p for which z is zero
    r = solve2Linear(plane1[0], plane1[1], plane2[0], plane2[1], plane1[3], plane2[3])
    origin = vec3.fromValues(r[0], r[1], 0)
  }
  return fromPointAndDirection(out, origin, direction)
}

module.exports = fromPlanes

},{"../constants":110,"../utils":184,"../vec3":237,"./fromPointAndDirection":136}],136:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Create a line from the given point (origin) and direction.
 *
 * The point can be any random point on the line.
 * The direction must be a vector with positive or negative distance from the point.
 *
 * See the logic of fromPoints() for appropriate values.
 *
 * @param {line3} out - receiving line
 * @param {vec3} point - start point of the line segment
 * @param {vec3} direction - direction of the line segment
 * @returns {line3} out
 * @alias module:modeling/maths/line3.fromPointAndDirection
 */
const fromPointAndDirection = (out, point, direction) => {
  const unit = vec3.normalize(vec3.create(), direction)

  vec3.copy(out[0], point)
  vec3.copy(out[1], unit)
  return out
}

module.exports = fromPointAndDirection

},{"../vec3":237}],137:[function(require,module,exports){
const vec3 = require('../vec3')

const fromPointAndDirection = require('./fromPointAndDirection')

/**
 * Create a line that passes through the given points.
 *
 * @param {line3} out - receiving line
 * @param {vec3} point1 - start point of the line segment
 * @param {vec3} point2 - end point of the line segment
 * @returns {line3} out
 * @alias module:modeling/maths/line3.fromPoints
 */
const fromPoints = (out, point1, point2) => {
  const direction = vec3.subtract(vec3.create(), point2, point1)
  return fromPointAndDirection(out, point1, direction)
}

module.exports = fromPoints

},{"../vec3":237,"./fromPointAndDirection":136}],138:[function(require,module,exports){
/**
 * Represents a unbounded line in 3D space, positioned at a point of origin.
 * @see {@link line3} for data structure information.
 * @module modeling/maths/line3
 */
module.exports = {
  clone: require('./clone'),
  closestPoint: require('./closestPoint'),
  copy: require('./copy'),
  create: require('./create'),
  direction: require('./direction'),
  distanceToPoint: require('./distanceToPoint'),
  equals: require('./equals'),
  fromPlanes: require('./fromPlanes'),
  fromPointAndDirection: require('./fromPointAndDirection'),
  fromPoints: require('./fromPoints'),
  intersectPointOfLineAndPlane: require('./intersectPointOfLineAndPlane'),
  origin: require('./origin'),
  reverse: require('./reverse'),
  toString: require('./toString'),
  transform: require('./transform')
}

},{"./clone":128,"./closestPoint":129,"./copy":130,"./create":131,"./direction":132,"./distanceToPoint":133,"./equals":134,"./fromPlanes":135,"./fromPointAndDirection":136,"./fromPoints":137,"./intersectPointOfLineAndPlane":139,"./origin":140,"./reverse":141,"./toString":142,"./transform":143}],139:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Determine the closest point on the given plane to the given line.
 *
 * NOTES:
 * The point of intersection will be invalid if the line is parallel to the plane, e.g. NaN.
 *
 * @param {line3} line - line of reference
 * @param {plane} plane - plane of reference
 * @returns {vec3} a point on the line
 * @alias module:modeling/maths/line3.intersectPointOfLineAndPlane
 */
const intersectToPlane = (line, plane) => {
  // plane: plane.normal * p = plane.w
  const pnormal = plane
  const pw = plane[3]

  const lpoint = line[0]
  const ldirection = line[1]

  // point: p = line.point + labda * line.direction
  const labda = (pw - vec3.dot(pnormal, lpoint)) / vec3.dot(pnormal, ldirection)

  const point = vec3.add(vec3.create(), lpoint, vec3.scale(vec3.create(), ldirection, labda))
  return point
}

module.exports = intersectToPlane

},{"../vec3":237}],140:[function(require,module,exports){
/**
 * Return the origin of the given line.
 *
 * @param {line3} line - line of reference
 * @return {vec3} the origin of the line
 * @alias module:modeling/maths/line3.origin
 */
const origin = (line) => line[0]

module.exports = origin

},{}],141:[function(require,module,exports){
const vec3 = require('../vec3')

const fromPointAndDirection = require('./fromPointAndDirection')

/**
 * Create a line in the opposite direction as the given.
 *
 * @param {line3} out - receiving line
 * @param {line3} line - line to reverse
 * @returns {line3} out
 * @alias module:modeling/maths/line3.reverse
 */
const reverse = (out, line) => {
  const point = vec3.clone(line[0])
  const direction = vec3.negate(vec3.create(), line[1])
  return fromPointAndDirection(out, point, direction)
}

module.exports = reverse

},{"../vec3":237,"./fromPointAndDirection":136}],142:[function(require,module,exports){
/**
 * Return a string representing the given line.
 *
 * @param {line3} line - line of reference
 * @returns {String} string representation
 * @alias module:modeling/maths/line3.toString
 */
const toString = (line) => {
  const point = line[0]
  const direction = line[1]
  return `line3: point: (${point[0].toFixed(7)}, ${point[1].toFixed(7)}, ${point[2].toFixed(7)}) direction: (${direction[0].toFixed(7)}, ${direction[1].toFixed(7)}, ${direction[2].toFixed(7)})`
}

module.exports = toString

},{}],143:[function(require,module,exports){
const vec3 = require('../vec3')

const fromPointAndDirection = require('./fromPointAndDirection')

/**
 * Transforms the given line using the given matrix.
 *
 * @param {line3} out - line to update
 * @param {line3} line - line to transform
 * @param {mat4} matrix - matrix to transform with
 * @returns {line3} a new unbounded line
 * @alias module:modeling/maths/line3.transform
 */
const transform = (out, line, matrix) => {
  const point = line[0]
  const direction = line[1]
  const pointPlusDirection = vec3.add(vec3.create(), point, direction)

  const newpoint = vec3.transform(vec3.create(), point, matrix)
  const newPointPlusDirection = vec3.transform(pointPlusDirection, pointPlusDirection, matrix)
  const newdirection = vec3.subtract(newPointPlusDirection, newPointPlusDirection, newpoint)

  return fromPointAndDirection(out, newpoint, newdirection)
}

module.exports = transform

},{"../vec3":237,"./fromPointAndDirection":136}],144:[function(require,module,exports){
/**
 * Adds the two matrices (A+B).
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} a - first operand
 * @param {mat4} b - second operand
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.add
 */
const add = (out, a, b) => {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  out[2] = a[2] + b[2]
  out[3] = a[3] + b[3]
  out[4] = a[4] + b[4]
  out[5] = a[5] + b[5]
  out[6] = a[6] + b[6]
  out[7] = a[7] + b[7]
  out[8] = a[8] + b[8]
  out[9] = a[9] + b[9]
  out[10] = a[10] + b[10]
  out[11] = a[11] + b[11]
  out[12] = a[12] + b[12]
  out[13] = a[13] + b[13]
  out[14] = a[14] + b[14]
  out[15] = a[15] + b[15]
  return out
}

module.exports = add

},{}],145:[function(require,module,exports){
const create = require('./create')

/**
 * Creates a clone of the given matrix.
 *
 * @param {mat4} matrix - matrix to clone
 * @returns {mat4} a new matrix
 * @alias module:modeling/maths/mat4.clone
 */
const clone = (matrix) => {
  const out = create()
  out[0] = matrix[0]
  out[1] = matrix[1]
  out[2] = matrix[2]
  out[3] = matrix[3]
  out[4] = matrix[4]
  out[5] = matrix[5]
  out[6] = matrix[6]
  out[7] = matrix[7]
  out[8] = matrix[8]
  out[9] = matrix[9]
  out[10] = matrix[10]
  out[11] = matrix[11]
  out[12] = matrix[12]
  out[13] = matrix[13]
  out[14] = matrix[14]
  out[15] = matrix[15]
  return out
}

module.exports = clone

},{"./create":147}],146:[function(require,module,exports){
/**
 * Creates a copy of the given matrix.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to copy
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.copy
 */
const copy = (out, matrix) => {
  out[0] = matrix[0]
  out[1] = matrix[1]
  out[2] = matrix[2]
  out[3] = matrix[3]
  out[4] = matrix[4]
  out[5] = matrix[5]
  out[6] = matrix[6]
  out[7] = matrix[7]
  out[8] = matrix[8]
  out[9] = matrix[9]
  out[10] = matrix[10]
  out[11] = matrix[11]
  out[12] = matrix[12]
  out[13] = matrix[13]
  out[14] = matrix[14]
  out[15] = matrix[15]
  return out
}

module.exports = copy

},{}],147:[function(require,module,exports){
/**
 * Represents a 4x4 matrix which is column-major (when typed out it looks row-major).
 * See fromValues().
 * @typedef {Array} mat4
 */

/**
 * Creates a new identity matrix.
 *
 * @returns {mat4} a new matrix
 * @alias module:modeling/maths/mat4.create
 */
const create = () => [
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1
]

module.exports = create

},{}],148:[function(require,module,exports){
/**
 * Returns whether or not the matrices have exactly the same elements in the same position.
 *
 * @param {mat4} a - first matrix
 * @param {mat4} b - second matrix
 * @returns {Boolean} true if the matrices are equal
 * @alias module:modeling/maths/mat4.equals
 */
const equals = (a, b) => (
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3] &&
  a[4] === b[4] && a[5] === b[5] && a[6] === b[6] && a[7] === b[7] &&
  a[8] === b[8] && a[9] === b[9] && a[10] === b[10] && a[11] === b[11] &&
  a[12] === b[12] && a[13] === b[13] && a[14] === b[14] && a[15] === b[15]
)

module.exports = equals

},{}],149:[function(require,module,exports){
const { EPS } = require('../constants')

const { sin, cos } = require('../utils/trigonometry')

const identity = require('./identity')

/**
 * Creates a matrix from a given angle around a given axis
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.rotate(dest, dest, rad, axis)
 *
 * @param {mat4} out - receiving matrix
 * @param {Number} rad - angle to rotate the matrix by
 * @param {vec3} axis - axis of which to rotate around
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromRotation
 * @example
 * let matrix = fromRotation(create(), TAU / 4, [0, 0, 3])
 */
const fromRotation = (out, rad, axis) => {
  let [x, y, z] = axis
  const lengthSquared = x * x + y * y + z * z

  if (Math.abs(lengthSquared) < EPS) {
    // axis is 0,0,0 or almost
    return identity(out)
  }

  const len = 1 / Math.sqrt(lengthSquared)
  x *= len
  y *= len
  z *= len

  const s = sin(rad)
  const c = cos(rad)
  const t = 1 - c

  // Perform rotation-specific matrix multiplication
  out[0] = x * x * t + c
  out[1] = y * x * t + z * s
  out[2] = z * x * t - y * s
  out[3] = 0
  out[4] = x * y * t - z * s
  out[5] = y * y * t + c
  out[6] = z * y * t + x * s
  out[7] = 0
  out[8] = x * z * t + y * s
  out[9] = y * z * t - x * s
  out[10] = z * z * t + c
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromRotation

},{"../constants":110,"../utils/trigonometry":188,"./identity":158}],150:[function(require,module,exports){
/**
 * Creates a matrix from a vector scaling.
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.scale(dest, dest, vec)
 *
 * @param {mat4} out - receiving matrix
 * @param {vec3} vector - X, Y, Z factors by which to scale
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromScaling
 * @example
 * let matrix = fromScaling([1, 2, 0.5])
 */
const fromScaling = (out, vector) => {
  out[0] = vector[0]
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = vector[1]
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = vector[2]
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromScaling

},{}],151:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Creates a matrix from the given Tait–Bryan angles.
 *
 * Tait-Bryan Euler angle convention using active, intrinsic rotations around the axes in the order z-y-x.
 * @see https://en.wikipedia.org/wiki/Euler_angles
 *
 * @param {mat4} out - receiving matrix
 * @param {Number} yaw - Z rotation in radians
 * @param {Number} pitch - Y rotation in radians
 * @param {Number} roll - X rotation in radians
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromTaitBryanRotation
 * @example
 * let matrix = fromTaitBryanRotation(create(), TAU / 4, 0, TAU / 2)
 */
const fromTaitBryanRotation = (out, yaw, pitch, roll) => {
  // precompute sines and cosines of Euler angles
  const sy = sin(yaw)
  const cy = cos(yaw)
  const sp = sin(pitch)
  const cp = cos(pitch)
  const sr = sin(roll)
  const cr = cos(roll)

  // create and populate rotation matrix
  // left-hand-rule rotation
  // const els = [
  //  cp*cy, sr*sp*cy - cr*sy, sr*sy + cr*sp*cy, 0,
  //  cp*sy, cr*cy + sr*sp*sy, cr*sp*sy - sr*cy, 0,
  //  -sp, sr*cp, cr*cp, 0,
  //  0, 0, 0, 1
  // ]
  // right-hand-rule rotation
  out[0] = cp * cy
  out[1] = cp * sy
  out[2] = -sp
  out[3] = 0
  out[4] = sr * sp * cy - cr * sy
  out[5] = cr * cy + sr * sp * sy
  out[6] = sr * cp
  out[7] = 0
  out[8] = sr * sy + cr * sp * cy
  out[9] = cr * sp * sy - sr * cy
  out[10] = cr * cp
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromTaitBryanRotation

},{"../utils/trigonometry":188}],152:[function(require,module,exports){
/**
 * Creates a matrix from a vector translation.
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.translate(dest, dest, vec)
 *
 * @param {mat4} out - receiving matrix
 * @param {vec3} vector - offset (vector) of translation
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromTranslation
 * @example
 * let matrix = fromTranslation(create(), [1, 2, 3])
 */
const fromTranslation = (out, vector) => {
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = 1
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = 1
  out[11] = 0
  out[12] = vector[0]
  out[13] = vector[1]
  out[14] = vector[2]
  out[15] = 1
  return out
}

module.exports = fromTranslation

},{}],153:[function(require,module,exports){
const create = require('./create')

/**
 * Create a matrix with the given values.
 *
 * @param {Number} m00 Component in column 0, row 0 position (index 0)
 * @param {Number} m01 Component in column 0, row 1 position (index 1)
 * @param {Number} m02 Component in column 0, row 2 position (index 2)
 * @param {Number} m03 Component in column 0, row 3 position (index 3)
 * @param {Number} m10 Component in column 1, row 0 position (index 4)
 * @param {Number} m11 Component in column 1, row 1 position (index 5)
 * @param {Number} m12 Component in column 1, row 2 position (index 6)
 * @param {Number} m13 Component in column 1, row 3 position (index 7)
 * @param {Number} m20 Component in column 2, row 0 position (index 8)
 * @param {Number} m21 Component in column 2, row 1 position (index 9)
 * @param {Number} m22 Component in column 2, row 2 position (index 10)
 * @param {Number} m23 Component in column 2, row 3 position (index 11)
 * @param {Number} m30 Component in column 3, row 0 position (index 12)
 * @param {Number} m31 Component in column 3, row 1 position (index 13)
 * @param {Number} m32 Component in column 3, row 2 position (index 14)
 * @param {Number} m33 Component in column 3, row 3 position (index 15)
 * @returns {mat4} a new matrix
 * @alias module:modeling/maths/mat4.fromValues
 * @example
 * let matrix = fromValues(
 *   1, 0, 0, 1,
 *   0, 1, 0, 0,
 *   0, 0, 1, 0,
 *   0, 0, 0, 1
 * )
 */
const fromValues = (m00, m01, m02, m03, m10, m11, m12, m13, m20, m21, m22, m23, m30, m31, m32, m33) => {
  const out = create()
  out[0] = m00
  out[1] = m01
  out[2] = m02
  out[3] = m03
  out[4] = m10
  out[5] = m11
  out[6] = m12
  out[7] = m13
  out[8] = m20
  out[9] = m21
  out[10] = m22
  out[11] = m23
  out[12] = m30
  out[13] = m31
  out[14] = m32
  out[15] = m33
  return out
}

module.exports = fromValues

},{"./create":147}],154:[function(require,module,exports){
const vec3 = require('../vec3')

const fromRotation = require('./fromRotation')

/**
 * Create a matrix that rotates the given source to the given target vector.
 *
 * Each vector must be a directional vector with a length greater than zero.
 * @see https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
 * @param {mat4} out - receiving matrix
 * @param {vec3} source - source vector
 * @param {vec3} target - target vector
 * @returns {mat4} a new matrix
 * @alias module:modeling/maths/mat4.fromVectorRotation
 * @example
 * let matrix = fromVectorRotation(mat4.create(), [1, 2, 2], [-3, 3, 12])
 */
const fromVectorRotation = (out, source, target) => {
  const sourceNormal = vec3.normalize(vec3.create(), source)
  const targetNormal = vec3.normalize(vec3.create(), target)

  const axis = vec3.cross(vec3.create(), targetNormal, sourceNormal)
  const cosA = vec3.dot(targetNormal, sourceNormal)
  if (cosA === -1.0) return fromRotation(out, Math.PI, vec3.orthogonal(axis, sourceNormal))

  const k = 1 / (1 + cosA)
  out[0] = (axis[0] * axis[0] * k) + cosA
  out[1] = (axis[1] * axis[0] * k) - axis[2]
  out[2] = (axis[2] * axis[0] * k) + axis[1]
  out[3] = 0

  out[4] = (axis[0] * axis[1] * k) + axis[2]
  out[5] = (axis[1] * axis[1] * k) + cosA
  out[6] = (axis[2] * axis[1] * k) - axis[0]
  out[7] = 0

  out[8] = (axis[0] * axis[2] * k) - axis[1]
  out[9] = (axis[1] * axis[2] * k) + axis[0]
  out[10] = (axis[2] * axis[2] * k) + cosA
  out[11] = 0

  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromVectorRotation

},{"../vec3":237,"./fromRotation":149}],155:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Creates a matrix from the given angle around the X axis.
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.rotateX(dest, dest, radians)
 *
 * @param {mat4} out - receiving matrix
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromXRotation
 * @example
 * let matrix = fromXRotation(create(), TAU / 4)
 */
const fromXRotation = (out, radians) => {
  const s = sin(radians)
  const c = cos(radians)

  // Perform axis-specific matrix multiplication
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = c
  out[6] = s
  out[7] = 0
  out[8] = 0
  out[9] = -s
  out[10] = c
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromXRotation

},{"../utils/trigonometry":188}],156:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Creates a matrix from the given angle around the Y axis.
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.rotateY(dest, dest, radians)
 *
 * @param {mat4} out - receiving matrix
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromYRotation
 * @example
 * let matrix = fromYRotation(create(), TAU / 4)
 */
const fromYRotation = (out, radians) => {
  const s = sin(radians)
  const c = cos(radians)

  // Perform axis-specific matrix multiplication
  out[0] = c
  out[1] = 0
  out[2] = -s
  out[3] = 0
  out[4] = 0
  out[5] = 1
  out[6] = 0
  out[7] = 0
  out[8] = s
  out[9] = 0
  out[10] = c
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromYRotation

},{"../utils/trigonometry":188}],157:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Creates a matrix from the given angle around the Z axis.
 * This is equivalent to (but much faster than):
 *
 *     mat4.identity(dest)
 *     mat4.rotateZ(dest, dest, radians)
 *
 * @param {mat4} out - receiving matrix
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.fromZRotation
 * @example
 * let matrix = fromZRotation(create(), TAU / 4)
 */
const fromZRotation = (out, radians) => {
  const s = sin(radians)
  const c = cos(radians)

  // Perform axis-specific matrix multiplication
  out[0] = c
  out[1] = s
  out[2] = 0
  out[3] = 0
  out[4] = -s
  out[5] = c
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = 1
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = fromZRotation

},{"../utils/trigonometry":188}],158:[function(require,module,exports){
/**
 * Set a matrix to the identity transform.
 *
 * @param {mat4} out - receiving matrix
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.identity
 */
const identity = (out) => {
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = 1
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = 1
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

module.exports = identity

},{}],159:[function(require,module,exports){
/**
 * Represents a 4x4 matrix which is column-major (when typed out it looks row-major).
 * @see {@link mat4} for data structure information.
 * @module modeling/maths/mat4
 */
module.exports = {
  add: require('./add'),
  clone: require('./clone'),
  copy: require('./copy'),
  create: require('./create'),
  invert: require('./invert'),
  equals: require('./equals'),
  fromRotation: require('./fromRotation'),
  fromScaling: require('./fromScaling'),
  fromTaitBryanRotation: require('./fromTaitBryanRotation'),
  fromTranslation: require('./fromTranslation'),
  fromValues: require('./fromValues'),
  fromVectorRotation: require('./fromVectorRotation'),
  fromXRotation: require('./fromXRotation'),
  fromYRotation: require('./fromYRotation'),
  fromZRotation: require('./fromZRotation'),
  identity: require('./identity'),
  isIdentity: require('./isIdentity'),
  isOnlyTransformScale: require('./isOnlyTransformScale'),
  isMirroring: require('./isMirroring'),
  mirrorByPlane: require('./mirrorByPlane'),
  multiply: require('./multiply'),
  rotate: require('./rotate'),
  rotateX: require('./rotateX'),
  rotateY: require('./rotateY'),
  rotateZ: require('./rotateZ'),
  scale: require('./scale'),
  subtract: require('./subtract'),
  toString: require('./toString'),
  translate: require('./translate')
}

},{"./add":144,"./clone":145,"./copy":146,"./create":147,"./equals":148,"./fromRotation":149,"./fromScaling":150,"./fromTaitBryanRotation":151,"./fromTranslation":152,"./fromValues":153,"./fromVectorRotation":154,"./fromXRotation":155,"./fromYRotation":156,"./fromZRotation":157,"./identity":158,"./invert":160,"./isIdentity":161,"./isMirroring":162,"./isOnlyTransformScale":163,"./mirrorByPlane":164,"./multiply":165,"./rotate":166,"./rotateX":167,"./rotateY":168,"./rotateZ":169,"./scale":170,"./subtract":171,"./toString":172,"./translate":173}],160:[function(require,module,exports){
/**
 * Creates a invert copy of the given matrix.
 * @author Julian Lloyd
 * code from https://github.com/jlmakes/rematrix/blob/master/src/index.js
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to invert
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.invert
 */
const invert = (out, matrix) => {
  const a00 = matrix[0]
  const a01 = matrix[1]
  const a02 = matrix[2]
  const a03 = matrix[3]
  const a10 = matrix[4]
  const a11 = matrix[5]
  const a12 = matrix[6]
  const a13 = matrix[7]
  const a20 = matrix[8]
  const a21 = matrix[9]
  const a22 = matrix[10]
  const a23 = matrix[11]
  const a30 = matrix[12]
  const a31 = matrix[13]
  const a32 = matrix[14]
  const a33 = matrix[15]

  const b00 = a00 * a11 - a01 * a10
  const b01 = a00 * a12 - a02 * a10
  const b02 = a00 * a13 - a03 * a10
  const b03 = a01 * a12 - a02 * a11
  const b04 = a01 * a13 - a03 * a11
  const b05 = a02 * a13 - a03 * a12
  const b06 = a20 * a31 - a21 * a30
  const b07 = a20 * a32 - a22 * a30
  const b08 = a20 * a33 - a23 * a30
  const b09 = a21 * a32 - a22 * a31
  const b10 = a21 * a33 - a23 * a31
  const b11 = a22 * a33 - a23 * a32

  // Calculate the determinant
  let det =
    b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06

  if (!det) {
    return null
  }
  det = 1.0 / det

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det

  return out
}

module.exports = invert

},{}],161:[function(require,module,exports){
/**
 * Determine whether the given matrix is the identity transform.
 * This is equivalent to (but much faster than):
 *
 *     mat4.equals(mat4.create(), matrix)
 *
 * @param {mat4} matrix - the matrix
 * @returns {Boolean} true if matrix is the identity transform
 * @alias module:modeling/maths/mat4.isIdentity
 * @example
 * if (mat4.isIdentity(mymatrix)) ...
 */
const isIdentity = (matrix) => (
  matrix[0] === 1 && matrix[1] === 0 && matrix[2] === 0 && matrix[3] === 0 &&
  matrix[4] === 0 && matrix[5] === 1 && matrix[6] === 0 && matrix[7] === 0 &&
  matrix[8] === 0 && matrix[9] === 0 && matrix[10] === 1 && matrix[11] === 0 &&
  matrix[12] === 0 && matrix[13] === 0 && matrix[14] === 0 && matrix[15] === 1
)

module.exports = isIdentity

},{}],162:[function(require,module,exports){
/**
 * Determine whether the given matrix is a mirroring transformation.
 *
 * @param {mat4} matrix - matrix of reference
 * @returns {Boolean} true if matrix is a mirroring transformation
 * @alias module:modeling/maths/mat4.isMirroring
 */
const isMirroring = (matrix) => {
  // const xVector = [matrix[0], matrix[4], matrix[8]]
  // const yVector = [matrix[1], matrix[5], matrix[9]]
  // const zVector = [matrix[2], matrix[6], matrix[10]]

  // for a true orthogonal, non-mirrored base, xVector.cross(yVector) == zVector
  // If they have an opposite direction then we are mirroring
  // calcuate xVector.cross(yVector)
  const x = matrix[4] * matrix[9] - matrix[8] * matrix[5]
  const y = matrix[8] * matrix[1] - matrix[0] * matrix[9]
  const z = matrix[0] * matrix[5] - matrix[4] * matrix[1]
  // calcualte dot(cross, zVector)
  const d = x * matrix[2] + y * matrix[6] + z * matrix[10]
  return (d < 0)
}

module.exports = isMirroring

},{}],163:[function(require,module,exports){

/**
 * Determine whether the given matrix is only translate and/or scale.
 * This code returns true for TAU / 2 rotation as it can be interpreted as scale.
 *
 * @param {mat4} matrix - the matrix
 * @returns {Boolean} true if matrix is for translate and/or scale
 * @alias module:modeling/maths/mat4.isOnlyTransformScale
 */
const isOnlyTransformScale = (matrix) => (

  // TODO check if it is worth the effort to add recognition of 90 deg rotations

  isZero(matrix[1]) && isZero(matrix[2]) && isZero(matrix[3]) &&
  isZero(matrix[4]) && isZero(matrix[6]) && isZero(matrix[7]) &&
  isZero(matrix[8]) && isZero(matrix[9]) && isZero(matrix[11]) &&
  matrix[15] === 1
)

const isZero = (num) => Math.abs(num) < Number.EPSILON

module.exports = isOnlyTransformScale

},{}],164:[function(require,module,exports){
/**
 * Create a matrix for mirroring about the given plane.
 *
 * @param {mat4} out - receiving matrix
 * @param {vec4} plane - plane of which to mirror the matrix
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.mirrorByPlane
 */
const mirrorByPlane = (out, plane) => {
  const [nx, ny, nz, w] = plane

  out[0] = (1.0 - 2.0 * nx * nx)
  out[1] = (-2.0 * ny * nx)
  out[2] = (-2.0 * nz * nx)
  out[3] = 0
  out[4] = (-2.0 * nx * ny)
  out[5] = (1.0 - 2.0 * ny * ny)
  out[6] = (-2.0 * nz * ny)
  out[7] = 0
  out[8] = (-2.0 * nx * nz)
  out[9] = (-2.0 * ny * nz)
  out[10] = (1.0 - 2.0 * nz * nz)
  out[11] = 0
  out[12] = (2.0 * nx * w)
  out[13] = (2.0 * ny * w)
  out[14] = (2.0 * nz * w)
  out[15] = 1

  return out
}

module.exports = mirrorByPlane

},{}],165:[function(require,module,exports){
/**
 * Multiplies the two matrices.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} a - first operand
 * @param {mat4} b - second operand
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.multiply
 */
const multiply = (out, a, b) => {
  const a00 = a[0]
  const a01 = a[1]
  const a02 = a[2]
  const a03 = a[3]
  const a10 = a[4]
  const a11 = a[5]
  const a12 = a[6]
  const a13 = a[7]
  const a20 = a[8]
  const a21 = a[9]
  const a22 = a[10]
  const a23 = a[11]
  const a30 = a[12]
  const a31 = a[13]
  const a32 = a[14]
  const a33 = a[15]

  // Cache only the current line of the second matrix
  let b0 = b[0]
  let b1 = b[1]
  let b2 = b[2]
  let b3 = b[3]
  out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[4]
  b1 = b[5]
  b2 = b[6]
  b3 = b[7]
  out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[8]
  b1 = b[9]
  b2 = b[10]
  b3 = b[11]
  out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

  b0 = b[12]
  b1 = b[13]
  b2 = b[14]
  b3 = b[15]
  out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
  out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
  out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
  out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
  return out
}

module.exports = multiply

},{}],166:[function(require,module,exports){
const { EPS } = require('../constants')

const { sin, cos } = require('../utils/trigonometry')

const copy = require('./copy')

/**
 * Rotates a matrix by the given angle about the given axis.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to rotate
 * @param {Number} radians - angle to rotate the matrix by
 * @param {vec3} axis - axis to rotate around
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.rotate
 */
const rotate = (out, matrix, radians, axis) => {
  let [x, y, z] = axis
  const lengthSquared = x * x + y * y + z * z

  if (Math.abs(lengthSquared) < EPS) {
    // axis is 0,0,0 or almost
    return copy(out, matrix)
  }

  const len = 1 / Math.sqrt(lengthSquared)
  x *= len
  y *= len
  z *= len

  const s = sin(radians)
  const c = cos(radians)
  const t = 1 - c

  const a00 = matrix[0]
  const a01 = matrix[1]
  const a02 = matrix[2]
  const a03 = matrix[3]
  const a10 = matrix[4]
  const a11 = matrix[5]
  const a12 = matrix[6]
  const a13 = matrix[7]
  const a20 = matrix[8]
  const a21 = matrix[9]
  const a22 = matrix[10]
  const a23 = matrix[11]

  // Construct the elements of the rotation matrix
  const b00 = x * x * t + c
  const b01 = y * x * t + z * s
  const b02 = z * x * t - y * s
  const b10 = x * y * t - z * s
  const b11 = y * y * t + c
  const b12 = z * y * t + x * s
  const b20 = x * z * t + y * s
  const b21 = y * z * t - x * s
  const b22 = z * z * t + c

  // Perform rotation-specific matrix multiplication
  out[0] = a00 * b00 + a10 * b01 + a20 * b02
  out[1] = a01 * b00 + a11 * b01 + a21 * b02
  out[2] = a02 * b00 + a12 * b01 + a22 * b02
  out[3] = a03 * b00 + a13 * b01 + a23 * b02
  out[4] = a00 * b10 + a10 * b11 + a20 * b12
  out[5] = a01 * b10 + a11 * b11 + a21 * b12
  out[6] = a02 * b10 + a12 * b11 + a22 * b12
  out[7] = a03 * b10 + a13 * b11 + a23 * b12
  out[8] = a00 * b20 + a10 * b21 + a20 * b22
  out[9] = a01 * b20 + a11 * b21 + a21 * b22
  out[10] = a02 * b20 + a12 * b21 + a22 * b22
  out[11] = a03 * b20 + a13 * b21 + a23 * b22

  if (matrix !== out) { // If the source and destination differ, copy the unchanged last row
    out[12] = matrix[12]
    out[13] = matrix[13]
    out[14] = matrix[14]
    out[15] = matrix[15]
  }
  return out
}

module.exports = rotate

},{"../constants":110,"../utils/trigonometry":188,"./copy":146}],167:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Rotates a matrix by the given angle around the X axis.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to rotate
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.rotateX
 */
const rotateX = (out, matrix, radians) => {
  const s = sin(radians)
  const c = cos(radians)
  const a10 = matrix[4]
  const a11 = matrix[5]
  const a12 = matrix[6]
  const a13 = matrix[7]
  const a20 = matrix[8]
  const a21 = matrix[9]
  const a22 = matrix[10]
  const a23 = matrix[11]

  if (matrix !== out) { // If the source and destination differ, copy the unchanged rows
    out[0] = matrix[0]
    out[1] = matrix[1]
    out[2] = matrix[2]
    out[3] = matrix[3]
    out[12] = matrix[12]
    out[13] = matrix[13]
    out[14] = matrix[14]
    out[15] = matrix[15]
  }

  // Perform axis-specific matrix multiplication
  out[4] = a10 * c + a20 * s
  out[5] = a11 * c + a21 * s
  out[6] = a12 * c + a22 * s
  out[7] = a13 * c + a23 * s
  out[8] = a20 * c - a10 * s
  out[9] = a21 * c - a11 * s
  out[10] = a22 * c - a12 * s
  out[11] = a23 * c - a13 * s
  return out
}

module.exports = rotateX

},{"../utils/trigonometry":188}],168:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Rotates a matrix by the given angle around the Y axis.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to rotate
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.rotateY
 */
const rotateY = (out, matrix, radians) => {
  const s = sin(radians)
  const c = cos(radians)
  const a00 = matrix[0]
  const a01 = matrix[1]
  const a02 = matrix[2]
  const a03 = matrix[3]
  const a20 = matrix[8]
  const a21 = matrix[9]
  const a22 = matrix[10]
  const a23 = matrix[11]

  if (matrix !== out) { // If the source and destination differ, copy the unchanged rows
    out[4] = matrix[4]
    out[5] = matrix[5]
    out[6] = matrix[6]
    out[7] = matrix[7]
    out[12] = matrix[12]
    out[13] = matrix[13]
    out[14] = matrix[14]
    out[15] = matrix[15]
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c - a20 * s
  out[1] = a01 * c - a21 * s
  out[2] = a02 * c - a22 * s
  out[3] = a03 * c - a23 * s
  out[8] = a00 * s + a20 * c
  out[9] = a01 * s + a21 * c
  out[10] = a02 * s + a22 * c
  out[11] = a03 * s + a23 * c
  return out
}

module.exports = rotateY

},{"../utils/trigonometry":188}],169:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Rotates a matrix by the given angle around the Z axis.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to rotate
 * @param {Number} radians - angle to rotate the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.rotateZ
 */
const rotateZ = (out, matrix, radians) => {
  const s = sin(radians)
  const c = cos(radians)
  const a00 = matrix[0]
  const a01 = matrix[1]
  const a02 = matrix[2]
  const a03 = matrix[3]
  const a10 = matrix[4]
  const a11 = matrix[5]
  const a12 = matrix[6]
  const a13 = matrix[7]

  if (matrix !== out) { // If the source and destination differ, copy the unchanged last row
    out[8] = matrix[8]
    out[9] = matrix[9]
    out[10] = matrix[10]
    out[11] = matrix[11]
    out[12] = matrix[12]
    out[13] = matrix[13]
    out[14] = matrix[14]
    out[15] = matrix[15]
  }

  // Perform axis-specific matrix multiplication
  out[0] = a00 * c + a10 * s
  out[1] = a01 * c + a11 * s
  out[2] = a02 * c + a12 * s
  out[3] = a03 * c + a13 * s
  out[4] = a10 * c - a00 * s
  out[5] = a11 * c - a01 * s
  out[6] = a12 * c - a02 * s
  out[7] = a13 * c - a03 * s
  return out
}

module.exports = rotateZ

},{"../utils/trigonometry":188}],170:[function(require,module,exports){
/**
 * Scales the matrix by the given dimensions.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to scale
 * @param {vec3} dimensions - dimensions to scale the matrix by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.scale
 */
const scale = (out, matrix, dimensions) => {
  const x = dimensions[0]
  const y = dimensions[1]
  const z = dimensions[2]

  out[0] = matrix[0] * x
  out[1] = matrix[1] * x
  out[2] = matrix[2] * x
  out[3] = matrix[3] * x
  out[4] = matrix[4] * y
  out[5] = matrix[5] * y
  out[6] = matrix[6] * y
  out[7] = matrix[7] * y
  out[8] = matrix[8] * z
  out[9] = matrix[9] * z
  out[10] = matrix[10] * z
  out[11] = matrix[11] * z
  out[12] = matrix[12]
  out[13] = matrix[13]
  out[14] = matrix[14]
  out[15] = matrix[15]
  return out
}

module.exports = scale

},{}],171:[function(require,module,exports){
/**
 * Subtracts matrix b from matrix a. (A-B)
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} a - first operand
 * @param {mat4} b - second operand
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.subtract
 */
const subtract = (out, a, b) => {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
  out[3] = a[3] - b[3]
  out[4] = a[4] - b[4]
  out[5] = a[5] - b[5]
  out[6] = a[6] - b[6]
  out[7] = a[7] - b[7]
  out[8] = a[8] - b[8]
  out[9] = a[9] - b[9]
  out[10] = a[10] - b[10]
  out[11] = a[11] - b[11]
  out[12] = a[12] - b[12]
  out[13] = a[13] - b[13]
  out[14] = a[14] - b[14]
  out[15] = a[15] - b[15]
  return out
}

module.exports = subtract

},{}],172:[function(require,module,exports){
/**
 * Return a string representing the given matrix.
 *
 * @param {mat4} mat - matrix of reference
 * @returns {String} string representation
 * @alias module:modeling/maths/mat4.toString
 */
const toString = (mat) => mat.map((n) => n.toFixed(7)).toString()

module.exports = toString

},{}],173:[function(require,module,exports){
/**
 * Translate the matrix by the given offset vector.
 *
 * @param {mat4} out - receiving matrix
 * @param {mat4} matrix - matrix to translate
 * @param {vec3} offsets - offset vector to translate by
 * @returns {mat4} out
 * @alias module:modeling/maths/mat4.translate
 */
const translate = (out, matrix, offsets) => {
  const x = offsets[0]
  const y = offsets[1]
  const z = offsets[2]
  let a00
  let a01
  let a02
  let a03
  let a10
  let a11
  let a12
  let a13
  let a20
  let a21
  let a22
  let a23

  if (matrix === out) {
  // 0-11 assignments are unnecessary
    out[12] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]
    out[13] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]
    out[14] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
    out[15] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  } else {
    a00 = matrix[0]; a01 = matrix[1]; a02 = matrix[2]; a03 = matrix[3]
    a10 = matrix[4]; a11 = matrix[5]; a12 = matrix[6]; a13 = matrix[7]
    a20 = matrix[8]; a21 = matrix[9]; a22 = matrix[10]; a23 = matrix[11]

    out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03
    out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13
    out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23

    out[12] = a00 * x + a10 * y + a20 * z + matrix[12]
    out[13] = a01 * x + a11 * y + a21 * z + matrix[13]
    out[14] = a02 * x + a12 * y + a22 * z + matrix[14]
    out[15] = a03 * x + a13 * y + a23 * z + matrix[15]
  }

  return out
}

module.exports = translate

},{}],174:[function(require,module,exports){
/**
 * Flip the given plane.
 *
 * @param {plane} out - receiving plane
 * @param {plane} plane - plane to flip
 * @return {plane} out
 * @alias module:modeling/maths/plane.flip
 */
const flip = (out, plane) => {
  out[0] = -plane[0]
  out[1] = -plane[1]
  out[2] = -plane[2]
  out[3] = -plane[3]
  return out
}

module.exports = flip

},{}],175:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Represents a plane in 3D coordinate space as determined by a normal (perpendicular to the plane)
 * and distance from 0,0,0.
 *
 * The contents of the array are a normal [0,1,2] and a distance [3].
 * @see https://en.wikipedia.org/wiki/Hesse_normal_form
 * @typedef {Array} plane
 */

/**
 * Create a new plane from the given normal and point values.
 *
 * @param {plane} out - receiving plane
 * @param {vec3} normal - directional vector
 * @param {vec3} point - origin of plane
 * @returns {plane} out
 * @alias module:modeling/maths/plane.fromNormalAndPoint
 */
const fromNormalAndPoint = (out, normal, point) => {
  const u = vec3.normalize(vec3.create(), normal)
  const w = vec3.dot(point, u)

  out[0] = u[0]
  out[1] = u[1]
  out[2] = u[2]
  out[3] = w
  return out
}

module.exports = fromNormalAndPoint

},{"../vec3":237}],176:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Create a plane from the given points.
 *
 * @param {plane} out - receiving plane
 * @param {Array} vertices - points on the plane
 * @returns {plane} out
 * @alias module:modeling/maths/plane.fromPoints
 */
const fromPoints = (out, ...vertices) => {
  const len = vertices.length

  // Calculate normal vector for a single vertex
  // Inline to avoid allocations
  const ba = vec3.create()
  const ca = vec3.create()
  const vertexNormal = (index) => {
    const a = vertices[index]
    const b = vertices[(index + 1) % len]
    const c = vertices[(index + 2) % len]
    vec3.subtract(ba, b, a) // ba = b - a
    vec3.subtract(ca, c, a) // ca = c - a
    vec3.cross(ba, ba, ca) // ba = ba x ca
    vec3.normalize(ba, ba)
    return ba
  }

  out[0] = 0
  out[1] = 0
  out[2] = 0
  if (len === 3) {
    // optimization for triangles, which are always coplanar
    vec3.copy(out, vertexNormal(0))
  } else {
    // sum of vertex normals
    vertices.forEach((v, i) => {
      vec3.add(out, out, vertexNormal(i))
    })
    // renormalize normal vector
    vec3.normalize(out, out)
  }
  out[3] = vec3.dot(out, vertices[0])
  return out
}

module.exports = fromPoints

},{"../vec3":237}],177:[function(require,module,exports){
const { EPS } = require('../constants')

const vec3 = require('../vec3')

/**
 * Create a new plane from the given points like fromPoints,
 * but allow the vectors to be on one point or one line.
 * In such a case, a random plane through the given points is constructed.
 *
 * @param {plane} out - receiving plane
 * @param {vec3} a - 3D point
 * @param {vec3} b - 3D point
 * @param {vec3} c - 3D point
 * @returns {plane} out
 * @alias module:modeling/maths/plane.fromPointsRandom
 */
const fromPointsRandom = (out, a, b, c) => {
  let ba = vec3.subtract(vec3.create(), b, a)
  let ca = vec3.subtract(vec3.create(), c, a)
  if (vec3.length(ba) < EPS) {
    ba = vec3.orthogonal(ba, ca)
  }
  if (vec3.length(ca) < EPS) {
    ca = vec3.orthogonal(ca, ba)
  }
  let normal = vec3.cross(vec3.create(), ba, ca)
  if (vec3.length(normal) < EPS) {
    // this would mean that ba == ca.negated()
    ca = vec3.orthogonal(ca, ba)
    normal = vec3.cross(normal, ba, ca)
  }
  normal = vec3.normalize(normal, normal)
  const w = vec3.dot(normal, a)

  out[0] = normal[0]
  out[1] = normal[1]
  out[2] = normal[2]
  out[3] = w
  return out
}

module.exports = fromPointsRandom

},{"../constants":110,"../vec3":237}],178:[function(require,module,exports){
/**
 * Represents a plane in 3D coordinate space as determined by a normal (perpendicular to the plane)
 * and distance from 0,0,0.
 * @see {@link plane} for data structure information.
 * @module modeling/maths/plane
 */
module.exports = {
  /**
   * @see [vec4.clone()]{@link module:modeling/maths/vec4.clone}
   * @function clone
   */
  clone: require('../vec4/clone'),
  /**
   * @see [vec4.copy()]{@link module:modeling/maths/vec4.copy}
   * @function copy
   */
  copy: require('../vec4/copy'),
  /**
   * @see [vec4.create()]{@link module:modeling/maths/vec4.create}
   * @function create
   */
  create: require('../vec4/create'),
  /**
   * @see [vec4.equals()]{@link module:modeling/maths/vec4.equals}
   * @function equals
   */
  equals: require('../vec4/equals'),
  flip: require('./flip'),
  fromNormalAndPoint: require('./fromNormalAndPoint'),
  /**
   * @see [vec4.fromValues()]{@link module:modeling/maths/vec4.fromValues}
   * @function fromValues
   */
  fromValues: require('../vec4/fromValues'),
  fromPoints: require('./fromPoints'),
  fromPointsRandom: require('./fromPointsRandom'),
  projectionOfPoint: require('./projectionOfPoint'),
  signedDistanceToPoint: require('./signedDistanceToPoint'),
  /**
   * @see [vec4.toString()]{@link module:modeling/maths/vec4.toString}
   * @function toString
   */
  toString: require('../vec4/toString'),
  transform: require('./transform')
}

},{"../vec4/clone":256,"../vec4/copy":257,"../vec4/create":258,"../vec4/equals":260,"../vec4/fromValues":262,"../vec4/toString":264,"./flip":174,"./fromNormalAndPoint":175,"./fromPoints":176,"./fromPointsRandom":177,"./projectionOfPoint":179,"./signedDistanceToPoint":180,"./transform":181}],179:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Project the given point on to the given plane.
 *
 * @param {plane} plane - plane of reference
 * @param {vec3} point - point of reference
 * @return {vec3} projected point on plane
 * @alias module:modeling/maths/plane.projectionOfPoint
 */
const projectionOfPoint = (plane, point) => {
  const a = point[0] * plane[0] + point[1] * plane[1] + point[2] * plane[2] - plane[3]
  const x = point[0] - a * plane[0]
  const y = point[1] - a * plane[1]
  const z = point[2] - a * plane[2]
  return vec3.fromValues(x, y, z)
}

module.exports = projectionOfPoint

},{"../vec3":237}],180:[function(require,module,exports){
const vec3 = require('../vec3')

/**
 * Calculate the distance to the given point.
 *
 * @param {plane} plane - plane of reference
 * @param {vec3} point - point of reference
 * @return {Number} signed distance to point
 * @alias module:modeling/maths/plane.signedDistanceToPoint
 */
const signedDistanceToPoint = (plane, point) => vec3.dot(plane, point) - plane[3]

module.exports = signedDistanceToPoint

},{"../vec3":237}],181:[function(require,module,exports){
const mat4 = require('../mat4')
const vec3 = require('../vec3')

const fromPoints = require('./fromPoints')
const flip = require('./flip')

/**
 * Transform the given plane using the given matrix
 *
 * @param {plane} out - receiving plane
 * @param {plane} plane - plane to transform
 * @param {mat4} matrix - matrix to transform with
 * @return {plane} out
 * @alias module:modeling/maths/plane.transform
 */
const transform = (out, plane, matrix) => {
  const ismirror = mat4.isMirroring(matrix)
  // get two vectors in the plane:
  const r = vec3.orthogonal(vec3.create(), plane)
  const u = vec3.cross(r, plane, r)
  const v = vec3.cross(vec3.create(), plane, u)
  // get 3 points in the plane:
  let point1 = vec3.fromScalar(vec3.create(), plane[3])
  vec3.multiply(point1, point1, plane)
  let point2 = vec3.add(vec3.create(), point1, u)
  let point3 = vec3.add(vec3.create(), point1, v)
  // transform the points:
  point1 = vec3.transform(point1, point1, matrix)
  point2 = vec3.transform(point2, point2, matrix)
  point3 = vec3.transform(point3, point3, matrix)
  // and create a new plane from the transformed points:
  fromPoints(out, point1, point2, point3)
  if (ismirror) {
    // the transform is mirroring so flip the plane
    flip(out, out)
  }
  return out
}

module.exports = transform

},{"../mat4":159,"../vec3":237,"./flip":174,"./fromPoints":176}],182:[function(require,module,exports){
const { NEPS } = require('../constants')

/**
 * Compare two normals (unit vectors) for near equality.
 * @param {vec3} a - normal a
 * @param {vec3} b - normal b
 * @returns {Boolean} true if a and b are nearly equal
 * @alias module:modeling/maths/utils.aboutEqualNormals
 */
const aboutEqualNormals = (a, b) => (Math.abs(a[0] - b[0]) <= NEPS && Math.abs(a[1] - b[1]) <= NEPS && Math.abs(a[2] - b[2]) <= NEPS)

module.exports = aboutEqualNormals

},{"../constants":110}],183:[function(require,module,exports){
/**
 * Calculate the area under the given points.
 * @param {Array} points - list of 2D points
 * @return {Number} area under the given points
 * @alias module:modeling/maths/utils.area
 */
const area = (points) => {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i][0] * points[j][1]
    area -= points[j][0] * points[i][1]
  }
  return (area / 2.0)
}

module.exports = area

},{}],184:[function(require,module,exports){
/**
 * Utility functions for maths.
 * @module modeling/maths/utils
 * @example
 * const { area, solve2Linear } = require('@jscad/maths').utils
 */
module.exports = {
  aboutEqualNormals: require('./aboutEqualNormals'),
  area: require('./area'),
  cos: require('./trigonometry').cos,
  interpolateBetween2DPointsForY: require('./interpolateBetween2DPointsForY'),
  intersect: require('./intersect'),
  sin: require('./trigonometry').sin,
  solve2Linear: require('./solve2Linear')
}

},{"./aboutEqualNormals":182,"./area":183,"./interpolateBetween2DPointsForY":185,"./intersect":186,"./solve2Linear":187,"./trigonometry":188}],185:[function(require,module,exports){
/**
 * Get the X coordinate of a point with a certain Y coordinate, interpolated between two points.
 * Interpolation is robust even if the points have the same Y coordinate
 * @param {vec2} point1
 * @param {vec2} point2
 * @param {Number} y
 * @return {Array} X and Y of interpolated point
 * @alias module:modeling/maths/utils.interpolateBetween2DPointsForY
 */
const interpolateBetween2DPointsForY = (point1, point2, y) => {
  let f1 = y - point1[1]
  let f2 = point2[1] - point1[1]
  if (f2 < 0) {
    f1 = -f1
    f2 = -f2
  }
  let t
  if (f1 <= 0) {
    t = 0.0
  } else if (f1 >= f2) {
    t = 1.0
  } else if (f2 < 1e-10) { // FIXME Should this be EPS?
    t = 0.5
  } else {
    t = f1 / f2
  }
  const result = point1[0] + t * (point2[0] - point1[0])
  return result
}

module.exports = interpolateBetween2DPointsForY

},{}],186:[function(require,module,exports){
/**
 * Calculate the intersect point of the two line segments (p1-p2 and p3-p4), end points included.
 * Note: If the line segments do NOT intersect then undefined is returned.
 * @see http://paulbourke.net/geometry/pointlineplane/
 * @param {vec2} p1 - first point of first line segment
 * @param {vec2} p2 - second point of first line segment
 * @param {vec2} p3 - first point of second line segment
 * @param {vec2} p4 - second point of second line segment
 * @returns {vec2} intersection point of the two line segments, or undefined
 * @alias module:modeling/maths/utils.intersect
 */
const intersect = (p1, p2, p3, p4) => {
  // Check if none of the lines are of length 0
  if ((p1[0] === p2[0] && p1[1] === p2[1]) || (p3[0] === p4[0] && p3[1] === p4[1])) {
    return undefined
  }

  const denominator = ((p4[1] - p3[1]) * (p2[0] - p1[0]) - (p4[0] - p3[0]) * (p2[1] - p1[1]))

  // Lines are parallel
  if (Math.abs(denominator) < Number.MIN_VALUE) {
    return undefined
  }

  const ua = ((p4[0] - p3[0]) * (p1[1] - p3[1]) - (p4[1] - p3[1]) * (p1[0] - p3[0])) / denominator
  const ub = ((p2[0] - p1[0]) * (p1[1] - p3[1]) - (p2[1] - p1[1]) * (p1[0] - p3[0])) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return undefined
  }

  // Return the x and y coordinates of the intersection
  const x = p1[0] + ua * (p2[0] - p1[0])
  const y = p1[1] + ua * (p2[1] - p1[1])

  return [x, y]
}

module.exports = intersect

},{}],187:[function(require,module,exports){
const solve2Linear = (a, b, c, d, u, v) => {
  const det = a * d - b * c
  const invdet = 1.0 / det
  let x = u * d - b * v
  let y = -u * c + a * v
  x *= invdet
  y *= invdet
  return [x, y]
}

module.exports = solve2Linear

},{}],188:[function(require,module,exports){
const { NEPS } = require('../constants')

/*
 * Returns zero if n is within epsilon of zero, otherwise return n
 */
const rezero = (n) => Math.abs(n) < NEPS ? 0 : n

/**
 * Return Math.sin but accurate for TAU / 4 rotations.
 * Fixes rounding errors when sin should be 0.
 *
 * @param {Number} radians - angle in radians
 * @returns {Number} sine of the given angle
 * @alias module:modeling/utils.sin
 * @example
 * sin(TAU / 2) == 0
 * sin(TAU) == 0
 */
const sin = (radians) => rezero(Math.sin(radians))

/**
 * Return Math.cos but accurate for TAU / 4 rotations.
 * Fixes rounding errors when cos should be 0.
 *
 * @param {Number} radians - angle in radians
 * @returns {Number} cosine of the given angle
 * @alias module:modeling/utils.cos
 * @example
 * cos(TAU * 0.25) == 0
 * cos(TAU * 0.75) == 0
 */
const cos = (radians) => rezero(Math.cos(radians))

module.exports = { sin, cos }

},{"../constants":110}],189:[function(require,module,exports){
/**
 * Calculates the absolute coordinates of the given vector.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector of reference
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.abs
 */
const abs = (out, vector) => {
  out[0] = Math.abs(vector[0])
  out[1] = Math.abs(vector[1])
  return out
}

module.exports = abs

},{}],190:[function(require,module,exports){
/**
 * Adds the coordinates of two vectors (A+B).
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.add
 */
const add = (out, a, b) => {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  return out
}

module.exports = add

},{}],191:[function(require,module,exports){
module.exports = require('./angleRadians')

},{"./angleRadians":193}],192:[function(require,module,exports){
const angleRadians = require('./angleRadians')

/**
 * Calculate the angle of the given vector.
 *
 * @param {vec2} vector - vector of reference
 * @returns {Number} angle in degrees
 * @alias module:modeling/maths/vec2.angleDegrees
 */
const angleDegrees = (vector) => angleRadians(vector) * 57.29577951308232

module.exports = angleDegrees

},{"./angleRadians":193}],193:[function(require,module,exports){
/**
 * Calculate the angle of the given vector.
 *
 * @param {vec2} vector - vector of reference
 * @returns {Number} angle in radians
 * @alias module:modeling/maths/vec2.angleRadians
 */
const angleRadians = (vector) => Math.atan2(vector[1], vector[0]) // y=sin, x=cos

module.exports = angleRadians

},{}],194:[function(require,module,exports){
const create = require('./create')

/**
 * Create a clone of the given vector.
 *
 * @param {vec2} vector - vector to clone
 * @returns {vec2} a new vector
 * @alias module:modeling/maths/vec2.clone
 */
const clone = (vector) => {
  const out = create()
  out[0] = vector[0]
  out[1] = vector[1]
  return out
}

module.exports = clone

},{"./create":196}],195:[function(require,module,exports){
/**
 * Create a copy of the given vector.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - source vector
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.copy
 */
const copy = (out, vector) => {
  out[0] = vector[0]
  out[1] = vector[1]
  return out
}

module.exports = copy

},{}],196:[function(require,module,exports){
/**
 * Represents a two dimensional vector.
 * See fromValues().
 * @typedef {Array} vec2
 */

/**
 * Creates a new vector, initialized to [0,0].
 *
 * @returns {vec2} a new vector
 * @alias module:modeling/maths/vec2.create
 */
const create = () => [0, 0]

module.exports = create

},{}],197:[function(require,module,exports){
/**
 * Computes the cross product (3D) of two vectors.
 *
 * @param {vec3} out - receiving vector (3D)
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec2.cross
 */
const cross = (out, a, b) => {
  out[0] = 0
  out[1] = 0
  out[2] = a[0] * b[1] - a[1] * b[0]
  return out
}

module.exports = cross

},{}],198:[function(require,module,exports){
/**
 * Calculates the distance between two vectors.
 *
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {Number} distance
 * @alias module:modeling/maths/vec2.distance
 */
const distance = (a, b) => {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  return Math.sqrt(x * x + y * y)
}

module.exports = distance

},{}],199:[function(require,module,exports){
/**
 * Divides the coordinates of two vectors (A/B).
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.divide
 */
const divide = (out, a, b) => {
  out[0] = a[0] / b[0]
  out[1] = a[1] / b[1]
  return out
}

module.exports = divide

},{}],200:[function(require,module,exports){
/**
 * Calculates the dot product of two vectors.
 *
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {Number} dot product
 * @alias module:modeling/maths/vec2.dot
 */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1]

module.exports = dot

},{}],201:[function(require,module,exports){
/**
 * Compare the given vectors for equality.
 *
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {Boolean} true if a and b are equal
 * @alias module:modeling/maths/vec2.equals
 */
const equals = (a, b) => (a[0] === b[0]) && (a[1] === b[1])

module.exports = equals

},{}],202:[function(require,module,exports){
const fromAngleRadians = require('./fromAngleRadians')

/**
 * Create a new vector in the direction of the given angle.
 *
 * @param {vec2} out - receiving vector
 * @param {Number} degrees - angle in degrees
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.fromAngleDegrees
 */
const fromAngleDegrees = (out, degrees) => fromAngleRadians(out, degrees * 0.017453292519943295)

module.exports = fromAngleDegrees

},{"./fromAngleRadians":203}],203:[function(require,module,exports){
const { sin, cos } = require('../utils/trigonometry')

/**
 * Create a new vector in the direction of the given angle.
 *
 * @param {vec2} out - receiving vector
 * @param {Number} radians - angle in radians
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.fromAngleRadians
 */
const fromAngleRadians = (out, radians) => {
  out[0] = cos(radians)
  out[1] = sin(radians)
  return out
}

module.exports = fromAngleRadians

},{"../utils/trigonometry":188}],204:[function(require,module,exports){
/**
 * Create a vector from a single scalar value.
 *
 * @param {vec2} out - receiving vector
 * @param {Number} scalar - the scalar value
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.fromScalar
 */
const fromScalar = (out, scalar) => {
  out[0] = scalar
  out[1] = scalar
  return out
}

module.exports = fromScalar

},{}],205:[function(require,module,exports){
const create = require('./create')

/**
 * Creates a new vector initialized with the given values.
 *
 * @param {Number} x - X coordinate
 * @param {Number} y - Y coordinate
 * @returns {vec2} a new vector
 * @alias module:modeling/maths/vec2.fromValues
 */
const fromValues = (x, y) => {
  const out = create()
  out[0] = x
  out[1] = y
  return out
}

module.exports = fromValues

},{"./create":196}],206:[function(require,module,exports){
/**
 * Represents a two dimensional vector.
 * @module modeling/maths/vec2
 */
module.exports = {
  abs: require('./abs'),
  add: require('./add'),
  angle: require('./angle'),
  angleDegrees: require('./angleDegrees'),
  angleRadians: require('./angleRadians'),
  clone: require('./clone'),
  copy: require('./copy'),
  create: require('./create'),
  cross: require('./cross'),
  distance: require('./distance'),
  divide: require('./divide'),
  dot: require('./dot'),
  equals: require('./equals'),
  fromAngleDegrees: require('./fromAngleDegrees'),
  fromAngleRadians: require('./fromAngleRadians'),
  fromScalar: require('./fromScalar'),
  fromValues: require('./fromValues'),
  length: require('./length'),
  lerp: require('./lerp'),
  max: require('./max'),
  min: require('./min'),
  multiply: require('./multiply'),
  negate: require('./negate'),
  normal: require('./normal'),
  normalize: require('./normalize'),
  rotate: require('./rotate'),
  scale: require('./scale'),
  snap: require('./snap'),
  squaredDistance: require('./squaredDistance'),
  squaredLength: require('./squaredLength'),
  subtract: require('./subtract'),
  toString: require('./toString'),
  transform: require('./transform')
}

},{"./abs":189,"./add":190,"./angle":191,"./angleDegrees":192,"./angleRadians":193,"./clone":194,"./copy":195,"./create":196,"./cross":197,"./distance":198,"./divide":199,"./dot":200,"./equals":201,"./fromAngleDegrees":202,"./fromAngleRadians":203,"./fromScalar":204,"./fromValues":205,"./length":207,"./lerp":208,"./max":209,"./min":210,"./multiply":211,"./negate":212,"./normal":213,"./normalize":214,"./rotate":215,"./scale":216,"./snap":217,"./squaredDistance":218,"./squaredLength":219,"./subtract":220,"./toString":221,"./transform":222}],207:[function(require,module,exports){
/**
 * Calculates the length of the given vector.
 *
 * @param {vec2} vector - vector of reference
 * @returns {Number} length
 * @alias module:modeling/maths/vec2.length
 */
const length = (vector) => Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])

module.exports = length

},{}],208:[function(require,module,exports){
/**
 * Performs a linear interpolation between two vectors.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @param {Number} t - interpolation amount between the two vectors
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.lerp
 */
const lerp = (out, a, b, t) => {
  const ax = a[0]
  const ay = a[1]
  out[0] = ax + t * (b[0] - ax)
  out[1] = ay + t * (b[1] - ay)
  return out
}

module.exports = lerp

},{}],209:[function(require,module,exports){
/**
 * Returns the maximum coordinates of two vectors.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.max
 */
const max = (out, a, b) => {
  out[0] = Math.max(a[0], b[0])
  out[1] = Math.max(a[1], b[1])
  return out
}

module.exports = max

},{}],210:[function(require,module,exports){
/**
 * Returns the minimum coordinates of two vectors.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.min
 */
const min = (out, a, b) => {
  out[0] = Math.min(a[0], b[0])
  out[1] = Math.min(a[1], b[1])
  return out
}

module.exports = min

},{}],211:[function(require,module,exports){
/**
 * Multiplies the coordinates of two vectors (A*B).
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.multiply
 */
const multiply = (out, a, b) => {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  return out
}

module.exports = multiply

},{}],212:[function(require,module,exports){
/**
 * Negates the coordinates of the given vector.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to negate
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.negate
 */
const negate = (out, vector) => {
  out[0] = -vector[0]
  out[1] = -vector[1]
  return out
}

module.exports = negate

},{}],213:[function(require,module,exports){
const { TAU } = require('../constants')

const create = require('./create')
const rotate = require('./rotate')

/**
 * Calculates the normal of the given vector.
 * The normal value is the given vector rotated 90 degrees.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - given value
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.normal
 */
const normal = (out, vector) => rotate(out, vector, create(), (TAU / 4))

module.exports = normal

},{"../constants":110,"./create":196,"./rotate":215}],214:[function(require,module,exports){
/**
 * Normalize the given vector.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to normalize
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.normalize
 */
const normalize = (out, vector) => {
  const x = vector[0]
  const y = vector[1]
  let len = x * x + y * y
  if (len > 0) {
    len = 1 / Math.sqrt(len)
  }
  out[0] = x * len
  out[1] = y * len
  return out
}

// old this.dividedBy(this.length())

module.exports = normalize

},{}],215:[function(require,module,exports){
/**
 * Rotates the given vector by the given angle.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to rotate
 * @param {vec2} origin - origin of the rotation
 * @param {Number} radians - angle of rotation (radians)
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.rotate
 */
const rotate = (out, vector, origin, radians) => {
  const x = vector[0] - origin[0]
  const y = vector[1] - origin[1]
  const c = Math.cos(radians)
  const s = Math.sin(radians)

  out[0] = x * c - y * s + origin[0]
  out[1] = x * s + y * c + origin[1]

  return out
}

module.exports = rotate

},{}],216:[function(require,module,exports){
/**
 * Scales the coordinates of the given vector.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to scale
 * @param {Number} amount - amount to scale
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.scale
 */
const scale = (out, vector, amount) => {
  out[0] = vector[0] * amount
  out[1] = vector[1] * amount
  return out
}

module.exports = scale

},{}],217:[function(require,module,exports){
/**
 * Snaps the coordinates of the given vector to the given epsilon.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to snap
 * @param {Number} epsilon - epsilon of precision, less than 0
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.snap
 */
const snap = (out, vector, epsilon) => {
  out[0] = Math.round(vector[0] / epsilon) * epsilon + 0
  out[1] = Math.round(vector[1] / epsilon) * epsilon + 0
  return out
}

module.exports = snap

},{}],218:[function(require,module,exports){
/**
 * Calculates the squared distance between the given vectors.
 *
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {Number} squared distance
 * @alias module:modeling/maths/vec2.squaredDistance
 */
const squaredDistance = (a, b) => {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  return x * x + y * y
}

module.exports = squaredDistance

},{}],219:[function(require,module,exports){
/**
 * Calculates the squared length of the given vector.
 *
 * @param {vec2} vector - vector of reference
 * @returns {Number} squared length
 * @alias module:modeling/maths/vec2.squaredLength
 */
const squaredLength = (vector) => {
  const x = vector[0]
  const y = vector[1]
  return x * x + y * y
}

module.exports = squaredLength

},{}],220:[function(require,module,exports){
/**
 * Subtracts the coordinates of two vectors (A-B).
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} a - first operand
 * @param {vec2} b - second operand
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.subtract
 */
const subtract = (out, a, b) => {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  return out
}

module.exports = subtract

},{}],221:[function(require,module,exports){
/**
 * Convert the given vector to a representative string.
 *
 * @param {vec2} vector - vector of reference
 * @returns {String} string representation
 * @alias module:modeling/maths/vec2.toString
 */
const toString = (vector) => `[${vector[0].toFixed(7)}, ${vector[1].toFixed(7)}]`

module.exports = toString

},{}],222:[function(require,module,exports){
/**
 * Transforms the given vector using the given matrix.
 *
 * @param {vec2} out - receiving vector
 * @param {vec2} vector - vector to transform
 * @param {mat4} matrix - matrix to transform with
 * @returns {vec2} out
 * @alias module:modeling/maths/vec2.transform
 */
const transform = (out, vector, matrix) => {
  const x = vector[0]
  const y = vector[1]
  out[0] = matrix[0] * x + matrix[4] * y + matrix[12]
  out[1] = matrix[1] * x + matrix[5] * y + matrix[13]
  return out
}

module.exports = transform

},{}],223:[function(require,module,exports){
/**
 * Calculates the absolute coordinates of the give vector.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector of reference
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.abs
 */
const abs = (out, vector) => {
  out[0] = Math.abs(vector[0])
  out[1] = Math.abs(vector[1])
  out[2] = Math.abs(vector[2])
  return out
}

module.exports = abs

},{}],224:[function(require,module,exports){
/**
 * Adds the coordinates of two vectors (A+B).
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.add
 */
const add = (out, a, b) => {
  out[0] = a[0] + b[0]
  out[1] = a[1] + b[1]
  out[2] = a[2] + b[2]
  return out
}

module.exports = add

},{}],225:[function(require,module,exports){
const dot = require('./dot')

/**
 * Calculate the angle between two vectors.
 *
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {Number} angle (radians)
 * @alias module:modeling/maths/vec3.angle
 */
const angle = (a, b) => {
  const ax = a[0]
  const ay = a[1]
  const az = a[2]
  const bx = b[0]
  const by = b[1]
  const bz = b[2]
  const mag1 = Math.sqrt(ax * ax + ay * ay + az * az)
  const mag2 = Math.sqrt(bx * bx + by * by + bz * bz)
  const mag = mag1 * mag2
  const cosine = mag && dot(a, b) / mag
  return Math.acos(Math.min(Math.max(cosine, -1), 1))
}

module.exports = angle

},{"./dot":232}],226:[function(require,module,exports){
const create = require('./create')

/**
 * Create a clone of the given vector.
 *
 * @param {vec3} vector - vector to clone
 * @returns {vec3} a new vector
 * @alias module:modeling/maths/vec3.clone
 */
const clone = (vector) => {
  const out = create()
  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = vector[2]
  return out
}

module.exports = clone

},{"./create":228}],227:[function(require,module,exports){
/**
 * Create a copy of the given vector.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to copy
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.copy
 */
const copy = (out, vector) => {
  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = vector[2]
  return out
}

module.exports = copy

},{}],228:[function(require,module,exports){
/**
 * Represents a three dimensional vector.
 * See fromValues().
 * @typedef {Array} vec3
 */

/**
 * Creates a new vector initialized to [0,0,0].
 *
 * @returns {vec3} a new vector
 * @alias module:modeling/maths/vec3.create
 */
const create = () => [0, 0, 0]

module.exports = create

},{}],229:[function(require,module,exports){
/**
 * Computes the cross product of the given vectors (AxB).
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.cross
 */
const cross = (out, a, b) => {
  const ax = a[0]
  const ay = a[1]
  const az = a[2]
  const bx = b[0]
  const by = b[1]
  const bz = b[2]

  out[0] = ay * bz - az * by
  out[1] = az * bx - ax * bz
  out[2] = ax * by - ay * bx
  return out
}

module.exports = cross

},{}],230:[function(require,module,exports){
/**
 * Calculates the Euclidian distance between the given vectors.
 *
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {Number} distance
 * @alias module:modeling/maths/vec3.distance
 */
const distance = (a, b) => {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  const z = b[2] - a[2]
  return Math.sqrt(x * x + y * y + z * z)
}

module.exports = distance

},{}],231:[function(require,module,exports){
/**
 * Divides the coordinates of two vectors (A/B).
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - dividend vector
 * @param {vec3} b - divisor vector
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.divide
 */
const divide = (out, a, b) => {
  out[0] = a[0] / b[0]
  out[1] = a[1] / b[1]
  out[2] = a[2] / b[2]
  return out
}

module.exports = divide

},{}],232:[function(require,module,exports){
/**
 * Calculates the dot product of two vectors.
 *
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {Number} dot product
 * @alias module:modeling/maths/vec3.dot
 */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

module.exports = dot

},{}],233:[function(require,module,exports){
/**
 * Compare the given vectors for equality.
 *
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {Boolean} true if a and b are equal
 * @alias module:modeling/maths/vec3.equals
 */
const equals = (a, b) => (a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2])

module.exports = equals

},{}],234:[function(require,module,exports){
/**
 * Creates a vector from a single scalar value.
 * All components of the resulting vector have the given value.
 *
 * @param {vec3} out - receiving vector
 * @param {Number} scalar
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.fromScalar
 */
const fromScalar = (out, scalar) => {
  out[0] = scalar
  out[1] = scalar
  out[2] = scalar
  return out
}

module.exports = fromScalar

},{}],235:[function(require,module,exports){
const create = require('./create')

/**
 * Creates a new vector initialized with the given values.
 *
 * @param {Number} x - X component
 * @param {Number} y - Y component
 * @param {Number} z - Z component
 * @returns {vec3} a new vector
 * @alias module:modeling/maths/vec3.fromValues
 */
const fromValues = (x, y, z) => {
  const out = create()
  out[0] = x
  out[1] = y
  out[2] = z
  return out
}

module.exports = fromValues

},{"./create":228}],236:[function(require,module,exports){
/**
 * Create a new vector by extending a 2D vector with a Z value.
 *
 * @param {vec3} out - receiving vector
 * @param {Array} vector - 2D vector of values
 * @param {Number} [z=0] - Z value
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.fromVec2
 */
const fromVector2 = (out, vector, z = 0) => {
  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = z
  return out
}

module.exports = fromVector2

},{}],237:[function(require,module,exports){
/**
 * Represents a three dimensional vector.
 * @see {@link vec3} for data structure information.
 * @module modeling/maths/vec3
 */
module.exports = {
  abs: require('./abs'),
  add: require('./add'),
  angle: require('./angle'),
  clone: require('./clone'),
  copy: require('./copy'),
  create: require('./create'),
  cross: require('./cross'),
  distance: require('./distance'),
  divide: require('./divide'),
  dot: require('./dot'),
  equals: require('./equals'),
  fromScalar: require('./fromScalar'),
  fromValues: require('./fromValues'),
  fromVec2: require('./fromVec2'),
  length: require('./length'),
  lerp: require('./lerp'),
  max: require('./max'),
  min: require('./min'),
  multiply: require('./multiply'),
  negate: require('./negate'),
  normalize: require('./normalize'),
  orthogonal: require('./orthogonal'),
  rotateX: require('./rotateX'),
  rotateY: require('./rotateY'),
  rotateZ: require('./rotateZ'),
  scale: require('./scale'),
  snap: require('./snap'),
  squaredDistance: require('./squaredDistance'),
  squaredLength: require('./squaredLength'),
  subtract: require('./subtract'),
  toString: require('./toString'),
  transform: require('./transform')
}

},{"./abs":223,"./add":224,"./angle":225,"./clone":226,"./copy":227,"./create":228,"./cross":229,"./distance":230,"./divide":231,"./dot":232,"./equals":233,"./fromScalar":234,"./fromValues":235,"./fromVec2":236,"./length":238,"./lerp":239,"./max":240,"./min":241,"./multiply":242,"./negate":243,"./normalize":244,"./orthogonal":245,"./rotateX":246,"./rotateY":247,"./rotateZ":248,"./scale":249,"./snap":250,"./squaredDistance":251,"./squaredLength":252,"./subtract":253,"./toString":254,"./transform":255}],238:[function(require,module,exports){
/**
 * Calculates the length of a vector.
 *
 * @param {vec3} vector - vector to calculate length of
 * @returns {Number} length
 * @alias module:modeling/maths/vec3.length
 */
const length = (vector) => {
  const x = vector[0]
  const y = vector[1]
  const z = vector[2]
  return Math.sqrt(x * x + y * y + z * z)
}

module.exports = length

},{}],239:[function(require,module,exports){
/**
 * Performs a linear interpolation between two vectors.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @param {Number} t - interpolant (0.0 to 1.0) applied between the two inputs
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.lerp
 */
const lerp = (out, a, b, t) => {
  out[0] = a[0] + t * (b[0] - a[0])
  out[1] = a[1] + t * (b[1] - a[1])
  out[2] = a[2] + t * (b[2] - a[2])
  return out
}

module.exports = lerp

},{}],240:[function(require,module,exports){
/**
 * Returns the maximum coordinates of the given vectors.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.max
 */
const max = (out, a, b) => {
  out[0] = Math.max(a[0], b[0])
  out[1] = Math.max(a[1], b[1])
  out[2] = Math.max(a[2], b[2])
  return out
}

module.exports = max

},{}],241:[function(require,module,exports){
/**
 * Returns the minimum coordinates of the given vectors.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.min
 */
const min = (out, a, b) => {
  out[0] = Math.min(a[0], b[0])
  out[1] = Math.min(a[1], b[1])
  out[2] = Math.min(a[2], b[2])
  return out
}

module.exports = min

},{}],242:[function(require,module,exports){
/**
 * Multiply the coordinates of the given vectors (A*B).
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.multiply
 */
const multiply = (out, a, b) => {
  out[0] = a[0] * b[0]
  out[1] = a[1] * b[1]
  out[2] = a[2] * b[2]
  return out
}

module.exports = multiply

},{}],243:[function(require,module,exports){
/**
 * Negates the coordinates of the given vector.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to negate
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.negate
 */
const negate = (out, vector) => {
  out[0] = -vector[0]
  out[1] = -vector[1]
  out[2] = -vector[2]
  return out
}

module.exports = negate

},{}],244:[function(require,module,exports){
/**
 * Normalize the given vector.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to normalize
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.normalize
 */
const normalize = (out, vector) => {
  const x = vector[0]
  const y = vector[1]
  const z = vector[2]
  let len = x * x + y * y + z * z
  if (len > 0) {
    len = 1 / Math.sqrt(len)
  }
  out[0] = x * len
  out[1] = y * len
  out[2] = z * len
  return out
}

module.exports = normalize

},{}],245:[function(require,module,exports){
const abs = require('./abs')
const create = require('./create')
const cross = require('./cross')

/**
 * Create a new vector that is orthogonal to the given vector.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector of reference
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.orthogonal
 */
const orthogonal = (out, vector) => {
  const bV = abs(create(), vector)
  const b0 = 0 + ((bV[0] < bV[1]) && (bV[0] < bV[2]))
  const b1 = 0 + ((bV[1] <= bV[0]) && (bV[1] < bV[2]))
  const b2 = 0 + ((bV[2] <= bV[0]) && (bV[2] <= bV[1]))

  return cross(out, vector, [b0, b1, b2])
}

module.exports = orthogonal

},{"./abs":223,"./create":228,"./cross":229}],246:[function(require,module,exports){
/**
 * Rotate the given vector around the given origin, X axis only.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to rotate
 * @param {vec3} origin - origin of the rotation
 * @param {Number} radians - angle of rotation
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.rotateX
 */
const rotateX = (out, vector, origin, radians) => {
  const p = []
  const r = []

  // translate point to the origin
  p[0] = vector[0] - origin[0]
  p[1] = vector[1] - origin[1]
  p[2] = vector[2] - origin[2]

  // perform rotation
  r[0] = p[0]
  r[1] = p[1] * Math.cos(radians) - p[2] * Math.sin(radians)
  r[2] = p[1] * Math.sin(radians) + p[2] * Math.cos(radians)

  // translate to correct position
  out[0] = r[0] + origin[0]
  out[1] = r[1] + origin[1]
  out[2] = r[2] + origin[2]

  return out
}

module.exports = rotateX

},{}],247:[function(require,module,exports){
/**
 * Rotate the given vector around the given origin, Y axis only.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to rotate
 * @param {vec3} origin - origin of the rotation
 * @param {Number} radians - angle of rotation
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.rotateY
 */
const rotateY = (out, vector, origin, radians) => {
  const p = []
  const r = []

  // translate point to the origin
  p[0] = vector[0] - origin[0]
  p[1] = vector[1] - origin[1]
  p[2] = vector[2] - origin[2]

  // perform rotation
  r[0] = p[2] * Math.sin(radians) + p[0] * Math.cos(radians)
  r[1] = p[1]
  r[2] = p[2] * Math.cos(radians) - p[0] * Math.sin(radians)

  // translate to correct position
  out[0] = r[0] + origin[0]
  out[1] = r[1] + origin[1]
  out[2] = r[2] + origin[2]

  return out
}

module.exports = rotateY

},{}],248:[function(require,module,exports){
/**
 * Rotate the given vector around the given origin, Z axis only.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to rotate
 * @param {vec3} origin - origin of the rotation
 * @param {Number} radians - angle of rotation in radians
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.rotateZ
 */
const rotateZ = (out, vector, origin, radians) => {
  const p = []
  const r = []
  // Translate point to the origin
  p[0] = vector[0] - origin[0]
  p[1] = vector[1] - origin[1]

  // perform rotation
  r[0] = (p[0] * Math.cos(radians)) - (p[1] * Math.sin(radians))
  r[1] = (p[0] * Math.sin(radians)) + (p[1] * Math.cos(radians))

  // translate to correct position
  out[0] = r[0] + origin[0]
  out[1] = r[1] + origin[1]
  out[2] = vector[2]

  return out
}

module.exports = rotateZ

},{}],249:[function(require,module,exports){
/**
 * Scales the coordinates of the given vector by a scalar number.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to scale
 * @param {Number} amount - amount to scale the vector by
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.scale
 */
const scale = (out, vector, amount) => {
  out[0] = vector[0] * amount
  out[1] = vector[1] * amount
  out[2] = vector[2] * amount
  return out
}

module.exports = scale

},{}],250:[function(require,module,exports){
/**
 * Snaps the coordinates of the given vector to the given epsilon.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to snap
 * @param {Number} epsilon - epsilon of precision, less than 0
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.snap
 */
const snap = (out, vector, epsilon) => {
  out[0] = Math.round(vector[0] / epsilon) * epsilon + 0
  out[1] = Math.round(vector[1] / epsilon) * epsilon + 0
  out[2] = Math.round(vector[2] / epsilon) * epsilon + 0
  return out
}

module.exports = snap

},{}],251:[function(require,module,exports){
/**
 * Calculates the squared distance between two vectors.
 *
 * @param {vec3} a - first operand
 * @param {vec3} b - second operand
 * @returns {Number} squared distance
 * @alias module:modeling/maths/vec3.squaredDistance
 */
const squaredDistance = (a, b) => {
  const x = b[0] - a[0]
  const y = b[1] - a[1]
  const z = b[2] - a[2]
  return x * x + y * y + z * z
}

module.exports = squaredDistance

},{}],252:[function(require,module,exports){
/**
 * Calculates the squared length of the given vector.
 *
 * @param {vec3} vector - vector to calculate squared length of
 * @returns {Number} squared length
 * @alias module:modeling/maths/vec3.squaredLength
 */
const squaredLength = (vector) => {
  const x = vector[0]
  const y = vector[1]
  const z = vector[2]
  return x * x + y * y + z * z
}

module.exports = squaredLength

},{}],253:[function(require,module,exports){
/**
 * Subtracts the coordinates of two vectors (A-B).
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} a - minuend vector
 * @param {vec3} b - subtrahend vector
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.subtract
 */
const subtract = (out, a, b) => {
  out[0] = a[0] - b[0]
  out[1] = a[1] - b[1]
  out[2] = a[2] - b[2]
  return out
}

module.exports = subtract

},{}],254:[function(require,module,exports){
/**
 * Convert the given vector to a representative string.
 * @param {vec3} vec - vector of reference
 * @returns {String} string representation
 * @alias module:modeling/maths/vec3.toString
 */
const toString = (vec) => `[${vec[0].toFixed(7)}, ${vec[1].toFixed(7)}, ${vec[2].toFixed(7)}]`

module.exports = toString

},{}],255:[function(require,module,exports){
/**
 * Transforms the given vector using the given matrix.
 *
 * @param {vec3} out - receiving vector
 * @param {vec3} vector - vector to transform
 * @param {mat4} matrix - transform matrix
 * @returns {vec3} out
 * @alias module:modeling/maths/vec3.transform
 */
const transform = (out, vector, matrix) => {
  const x = vector[0]
  const y = vector[1]
  const z = vector[2]
  let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15]
  w = w || 1.0
  out[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w
  out[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w
  out[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w
  return out
}

module.exports = transform

},{}],256:[function(require,module,exports){
const create = require('./create')

/**
 * Create a clone of the given vector.
 *
 * @param {vec4} vector - source vector
 * @returns {vec4} a new vector
 * @alias module:modeling/maths/vec4.clone
 */
const clone = (vector) => {
  const out = create()
  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = vector[2]
  out[3] = vector[3]
  return out
}

module.exports = clone

},{"./create":258}],257:[function(require,module,exports){
/**
 * Create a copy of the given vector.
 *
 * @param {vec4} out - receiving vector
 * @param {vec4} vector - source vector
 * @returns {vec4} out
 * @alias module:modeling/maths/vec4.copy
 */
const copy = (out, vector) => {
  out[0] = vector[0]
  out[1] = vector[1]
  out[2] = vector[2]
  out[3] = vector[3]
  return out
}

module.exports = copy

},{}],258:[function(require,module,exports){
/**
 * Represents a four dimensional vector.
 * See fromValues().
 * @typedef {Array} vec4
 */

/**
 * Creates a new vector initialized to [0,0,0,0].
 *
 * @returns {vec4} a new vector
 * @alias module:modeling/maths/vec4.create
 */
const create = () => [0, 0, 0, 0]

module.exports = create

},{}],259:[function(require,module,exports){
/**
 * Calculates the dot product of the given vectors.
 *
 * @param {vec4} a - first vector
 * @param {vec4} b - second vector
 * @returns {Number} dot product
 * @alias module:modeling/maths/vec4.dot
 */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]

module.exports = dot

},{}],260:[function(require,module,exports){
/**
 * Compare the given vectors for equality.
 *
 * @param {vec4} a - first vector
 * @param {vec4} b - second vector
 * @return {Boolean} true if vectors are equal
 * @alias module:modeling/maths/vec4.equals
 */
const equals = (a, b) => ((a[0] === b[0]) && (a[1] === b[1]) && (a[2] === b[2]) && (a[3] === b[3]))

module.exports = equals

},{}],261:[function(require,module,exports){
/**
 * Create a new vector from the given scalar value.
 *
 * @param {vec4} out - receiving vector
 * @param  {Number} scalar
 * @returns {vec4} out
 * @alias module:modeling/maths/vec4.fromScalar
 */
const fromScalar = (out, scalar) => {
  out[0] = scalar
  out[1] = scalar
  out[2] = scalar
  out[3] = scalar
  return out
}

module.exports = fromScalar

},{}],262:[function(require,module,exports){
const create = require('./create')

/**
 * Creates a new vector with the given values.
 *
 * @param {Number} x - X component
 * @param {Number} y - Y component
 * @param {Number} z - Z component
 * @param {Number} w - W component
 * @returns {vec4} a new vector
 * @alias module:modeling/maths/vec4.fromValues
 */
const fromValues = (x, y, z, w) => {
  const out = create()
  out[0] = x
  out[1] = y
  out[2] = z
  out[3] = w
  return out
}

module.exports = fromValues

},{"./create":258}],263:[function(require,module,exports){
/**
 * Represents a four dimensional vector.
 * @see {@link vec4} for data structure information.
 * @module modeling/maths/vec4
 */
module.exports = {
  clone: require('./clone'),
  copy: require('./copy'),
  create: require('./create'),
  dot: require('./dot'),
  equals: require('./equals'),
  fromScalar: require('./fromScalar'),
  fromValues: require('./fromValues'),
  toString: require('./toString'),
  transform: require('./transform')
}

},{"./clone":256,"./copy":257,"./create":258,"./dot":259,"./equals":260,"./fromScalar":261,"./fromValues":262,"./toString":264,"./transform":265}],264:[function(require,module,exports){
/**
 * Convert the given vector to a representative string.
 *
 * @param {vec4} vec - vector to convert
 * @returns {String} representative string
 * @alias module:modeling/maths/vec4.toString
 */
const toString = (vec) => `(${vec[0].toFixed(9)}, ${vec[1].toFixed(9)}, ${vec[2].toFixed(9)}, ${vec[3].toFixed(9)})`

module.exports = toString

},{}],265:[function(require,module,exports){
/**
 * Transform the given vector using the given matrix.
 *
 * @param {vec4} out - receiving vector
 * @param {vec4} vector - vector to transform
 * @param {mat4} matrix - matrix to transform with
 * @returns {vec4} out
 * @alias module:modeling/maths/vec4.transform
 */
const transform = (out, vector, matrix) => {
  const [x, y, z, w] = vector

  out[0] = matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12] * w
  out[1] = matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13] * w
  out[2] = matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14] * w
  out[3] = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15] * w
  return out
}

module.exports = transform

},{}],266:[function(require,module,exports){
const { EPS } = require('../maths/constants')

const calculateEpsilonFromBounds = (bounds, dimensions) => {
  let total = 0
  for (let i = 0; i < dimensions; i++) {
    total += bounds[1][i] - bounds[0][i]
  }
  return EPS * total / dimensions
}

module.exports = calculateEpsilonFromBounds

},{"../maths/constants":110}],267:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be measured, e.g. calculate volume, etc.
 * @module modeling/measurements
 * @example
 * const { measureArea, measureBoundingBox, measureVolume } = require('@jscad/modeling').measurements
 */
module.exports = {
  measureAggregateArea: require('./measureAggregateArea'),
  measureAggregateBoundingBox: require('./measureAggregateBoundingBox'),
  measureAggregateEpsilon: require('./measureAggregateEpsilon'),
  measureAggregateVolume: require('./measureAggregateVolume'),
  measureArea: require('./measureArea'),
  measureBoundingBox: require('./measureBoundingBox'),
  measureBoundingSphere: require('./measureBoundingSphere'),
  measureCenter: require('./measureCenter'),
  measureCenterOfMass: require('./measureCenterOfMass'),
  measureDimensions: require('./measureDimensions'),
  measureEpsilon: require('./measureEpsilon'),
  measureVolume: require('./measureVolume')
}

},{"./measureAggregateArea":268,"./measureAggregateBoundingBox":269,"./measureAggregateEpsilon":270,"./measureAggregateVolume":271,"./measureArea":272,"./measureBoundingBox":273,"./measureBoundingSphere":274,"./measureCenter":275,"./measureCenterOfMass":276,"./measureDimensions":277,"./measureEpsilon":278,"./measureVolume":279}],268:[function(require,module,exports){
const flatten = require('../utils/flatten')

const measureArea = require('./measureArea')

/**
 * Measure the total (aggregate) area for the given geometries.
 * Note: This measurement will not account for overlapping geometry
 * @param {...Object} geometries - the geometries to measure.
 * @return {Number} the total surface area for the group of geometry.
 * @alias module:modeling/measurements.measureAggregateArea
 *
 * @example
 * let totalArea = measureAggregateArea(sphere(),cube())
 */
const measureAggregateArea = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('measureAggregateArea: no geometries supplied')
  const areas = measureArea(geometries)
  if (geometries.length === 1) {
    return areas
  }
  const result = 0
  return areas.reduce((result, area) => result + area, result)
}

module.exports = measureAggregateArea

},{"../utils/flatten":412,"./measureArea":272}],269:[function(require,module,exports){
const flatten = require('../utils/flatten')
const vec3min = require('../maths/vec3/min')
const vec3max = require('../maths/vec3/max')

const measureBoundingBox = require('./measureBoundingBox')

/**
 * Measure the aggregated minimum and maximum bounds for the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the min and max bounds for the group of geometry, i.e. [[x,y,z],[X,Y,Z]]
 * @alias module:modeling/measurements.measureAggregateBoundingBox
 *
 * @example
 * let bounds = measureAggregateBoundingBox(sphere(),cube())
 */
const measureAggregateBoundingBox = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('measureAggregateBoundingBox: no geometries supplied')
  const bounds = measureBoundingBox(geometries)
  if (geometries.length === 1) {
    return bounds
  }
  const result = [[Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE], [-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE]]
  return bounds.reduce((result, item) => {
    result = [vec3min(result[0], result[0], item[0]), vec3max(result[1], result[1], item[1])]
    return result
  }, result)
}

module.exports = measureAggregateBoundingBox

},{"../maths/vec3/max":240,"../maths/vec3/min":241,"../utils/flatten":412,"./measureBoundingBox":273}],270:[function(require,module,exports){
const flatten = require('../utils/flatten')
const measureAggregateBoundingBox = require('./measureAggregateBoundingBox')
const calculateEpsilonFromBounds = require('./calculateEpsilonFromBounds')
const { geom2, geom3, path2 } = require('../geometries')

/**
 * Measure the aggregated Epsilon for the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Number} the aggregated Epsilon for the whole group of geometries
 * @alias module:modeling/measurements.measureAggregateEpsilon
 *
 * @example
 * let groupEpsilon = measureAggregateEpsilon(sphere(),cube())
 */
const measureAggregateEpsilon = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('measureAggregateEpsilon: no geometries supplied')
  const bounds = measureAggregateBoundingBox(geometries)

  let dimensions = 0
  dimensions = geometries.reduce((dimensions, geometry) => {
    if (path2.isA(geometry) || geom2.isA(geometry)) return Math.max(dimensions, 2)
    if (geom3.isA(geometry)) return Math.max(dimensions, 3)
    return 0
  }, dimensions)
  return calculateEpsilonFromBounds(bounds, dimensions)
}

module.exports = measureAggregateEpsilon

},{"../geometries":66,"../utils/flatten":412,"./calculateEpsilonFromBounds":266,"./measureAggregateBoundingBox":269}],271:[function(require,module,exports){
const flatten = require('../utils/flatten')

const measureVolume = require('./measureVolume')

/**
 * Measure the total (aggregate) volume for the given geometries.
 * Note: This measurement will not account for overlapping geometry
 * @param {...Object} geometries - the geometries to measure.
 * @return {Number} the volume for the group of geometry.
 * @alias module:modeling/measurements.measureAggregateVolume
 *
 * @example
 * let totalVolume = measureAggregateVolume(sphere(),cube())
 */
const measureAggregateVolume = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('measureAggregateVolume: no geometries supplied')
  const volumes = measureVolume(geometries)
  if (geometries.length === 1) {
    return volumes
  }
  const result = 0
  return volumes.reduce((result, volume) => result + volume, result)
}

module.exports = measureAggregateVolume

},{"../utils/flatten":412,"./measureVolume":279}],272:[function(require,module,exports){
const flatten = require('../utils/flatten')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')
const poly3 = require('../geometries/poly3')

const cache = new WeakMap()

/*
 * Measure the area of the given geometry.
 * NOTE: paths are infinitely narrow and do not have an area
 *
 * @param {path2} geometry - geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfPath2 = () => 0

/*
 * Measure the area of the given geometry.
 * For a counter clockwise rotating geometry (about Z) the area is positive, otherwise negative.
 *
 * @see http://paulbourke.net/geometry/polygonmesh/
 * @param {geom2} geometry - 2D geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfGeom2 = (geometry) => {
  let area = cache.get(geometry)
  if (area) return area

  const sides = geom2.toSides(geometry)
  area = sides.reduce((area, side) => area + (side[0][0] * side[1][1] - side[0][1] * side[1][0]), 0)
  area *= 0.5

  cache.set(geometry, area)

  return area
}

/*
 * Measure the area of the given geometry.
 *
 * @param {geom3} geometry - 3D geometry to measure
 * @returns {Number} area of the geometry
 */
const measureAreaOfGeom3 = (geometry) => {
  let area = cache.get(geometry)
  if (area) return area

  const polygons = geom3.toPolygons(geometry)
  area = polygons.reduce((area, polygon) => area + poly3.measureArea(polygon), 0)

  cache.set(geometry, area)

  return area
}

/**
 * Measure the area of the given geometries.
 * @param {...Objects} geometries - the geometries to measure
 * @return {Number|Array} the area, or a list of areas for each geometry
 * @alias module:modeling/measurements.measureArea
 *
 * @example
 * let area = measureArea(sphere())
 */
const measureArea = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return measureAreaOfPath2(geometry)
    if (geom2.isA(geometry)) return measureAreaOfGeom2(geometry)
    if (geom3.isA(geometry)) return measureAreaOfGeom3(geometry)
    return 0
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureArea

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78,"../geometries/poly3":95,"../utils/flatten":412}],273:[function(require,module,exports){
const flatten = require('../utils/flatten')

const vec2 = require('../maths/vec2')
const vec3 = require('../maths/vec3')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')
const poly3 = require('../geometries/poly3')

const cache = new WeakMap()

/*
 * Measure the min and max bounds of the given (path2) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundingBoxOfPath2 = (geometry) => {
  let boundingBox = cache.get(geometry)
  if (boundingBox) return boundingBox

  const points = path2.toPoints(geometry)

  let minpoint
  if (points.length === 0) {
    minpoint = vec2.create()
  } else {
    minpoint = vec2.clone(points[0])
  }
  let maxpoint = vec2.clone(minpoint)

  points.forEach((point) => {
    vec2.min(minpoint, minpoint, point)
    vec2.max(maxpoint, maxpoint, point)
  })
  minpoint = [minpoint[0], minpoint[1], 0]
  maxpoint = [maxpoint[0], maxpoint[1], 0]

  boundingBox = [minpoint, maxpoint]

  cache.set(geometry, boundingBox)

  return boundingBox
}

/*
 * Measure the min and max bounds of the given (geom2) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundingBoxOfGeom2 = (geometry) => {
  let boundingBox = cache.get(geometry)
  if (boundingBox) return boundingBox

  const points = geom2.toPoints(geometry)

  let minpoint
  if (points.length === 0) {
    minpoint = vec2.create()
  } else {
    minpoint = vec2.clone(points[0])
  }
  let maxpoint = vec2.clone(minpoint)

  points.forEach((point) => {
    vec2.min(minpoint, minpoint, point)
    vec2.max(maxpoint, maxpoint, point)
  })

  minpoint = [minpoint[0], minpoint[1], 0]
  maxpoint = [maxpoint[0], maxpoint[1], 0]

  boundingBox = [minpoint, maxpoint]

  cache.set(geometry, boundingBox)

  return boundingBox
}

/*
 * Measure the min and max bounds of the given (geom3) geometry.
 * @return {Array[]} the min and max bounds for the geometry
 */
const measureBoundingBoxOfGeom3 = (geometry) => {
  let boundingBox = cache.get(geometry)
  if (boundingBox) return boundingBox

  const polygons = geom3.toPolygons(geometry)

  let minpoint = vec3.create()
  if (polygons.length > 0) {
    const points = poly3.toPoints(polygons[0])
    vec3.copy(minpoint, points[0])
  }
  let maxpoint = vec3.clone(minpoint)

  polygons.forEach((polygon) => {
    poly3.toPoints(polygon).forEach((point) => {
      vec3.min(minpoint, minpoint, point)
      vec3.max(maxpoint, maxpoint, point)
    })
  })

  minpoint = [minpoint[0], minpoint[1], minpoint[2]]
  maxpoint = [maxpoint[0], maxpoint[1], maxpoint[2]]

  boundingBox = [minpoint, maxpoint]

  cache.set(geometry, boundingBox)

  return boundingBox
}

/**
 * Measure the min and max bounds of the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the min and max bounds, or a list of bounds for each geometry
 * @alias module:modeling/measurements.measureBoundingBox
 *
 * @example
 * let bounds = measureBoundingBox(sphere())
 */
const measureBoundingBox = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return measureBoundingBoxOfPath2(geometry)
    if (geom2.isA(geometry)) return measureBoundingBoxOfGeom2(geometry)
    if (geom3.isA(geometry)) return measureBoundingBoxOfGeom3(geometry)
    return [[0, 0, 0], [0, 0, 0]]
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureBoundingBox

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78,"../geometries/poly3":95,"../maths/vec2":206,"../maths/vec3":237,"../utils/flatten":412}],274:[function(require,module,exports){
const flatten = require('../utils/flatten')

const vec2 = require('../maths/vec2')
const vec3 = require('../maths/vec3')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')
const poly3 = require('../geometries/poly3')

const cacheOfBoundingSpheres = new WeakMap()

/*
 * Measure the bounding sphere of the given (path2) geometry.
 * @return {[[x, y, z], radius]} the bounding sphere for the geometry
 */
const measureBoundingSphereOfPath2 = (geometry) => {
  let boundingSphere = cacheOfBoundingSpheres.get(geometry)
  if (boundingSphere !== undefined) return boundingSphere

  const centroid = vec3.create()
  let radius = 0

  const points = path2.toPoints(geometry)

  if (points.length > 0) {
    // calculate the centroid of the geometry
    let numPoints = 0
    const temp = vec3.create()
    points.forEach((point) => {
      vec3.add(centroid, centroid, vec3.fromVec2(temp, point, 0))
      numPoints++
    })
    vec3.scale(centroid, centroid, 1 / numPoints)

    // find the farthest point from the centroid
    points.forEach((point) => {
      radius = Math.max(radius, vec2.squaredDistance(centroid, point))
    })
    radius = Math.sqrt(radius)
  }

  boundingSphere = [centroid, radius]
  cacheOfBoundingSpheres.set(geometry, boundingSphere)

  return boundingSphere
}

/*
 * Measure the bounding sphere of the given (geom2) geometry.
 * @return {[[x, y, z], radius]} the bounding sphere for the geometry
 */
const measureBoundingSphereOfGeom2 = (geometry) => {
  let boundingSphere = cacheOfBoundingSpheres.get(geometry)
  if (boundingSphere !== undefined) return boundingSphere

  const centroid = vec3.create()
  let radius = 0

  const sides = geom2.toSides(geometry)

  if (sides.length > 0) {
    // calculate the centroid of the geometry
    let numPoints = 0
    const temp = vec3.create()
    sides.forEach((side) => {
      vec3.add(centroid, centroid, vec3.fromVec2(temp, side[0], 0))
      numPoints++
    })
    vec3.scale(centroid, centroid, 1 / numPoints)

    // find the farthest point from the centroid
    sides.forEach((side) => {
      radius = Math.max(radius, vec2.squaredDistance(centroid, side[0]))
    })
    radius = Math.sqrt(radius)
  }

  boundingSphere = [centroid, radius]
  cacheOfBoundingSpheres.set(geometry, boundingSphere)

  return boundingSphere
}

/*
 * Measure the bounding sphere of the given (geom3) geometry.
 * @return {[[x, y, z], radius]} the bounding sphere for the geometry
 */
const measureBoundingSphereOfGeom3 = (geometry) => {
  let boundingSphere = cacheOfBoundingSpheres.get(geometry)
  if (boundingSphere !== undefined) return boundingSphere

  const centroid = vec3.create()
  let radius = 0

  const polygons = geom3.toPolygons(geometry)

  if (polygons.length > 0) {
    // calculate the centroid of the geometry
    let numPoints = 0
    polygons.forEach((polygon) => {
      poly3.toPoints(polygon).forEach((point) => {
        vec3.add(centroid, centroid, point)
        numPoints++
      })
    })
    vec3.scale(centroid, centroid, 1 / numPoints)

    // find the farthest point from the centroid
    polygons.forEach((polygon) => {
      poly3.toPoints(polygon).forEach((point) => {
        radius = Math.max(radius, vec3.squaredDistance(centroid, point))
      })
    })
    radius = Math.sqrt(radius)
  }

  boundingSphere = [centroid, radius]
  cacheOfBoundingSpheres.set(geometry, boundingSphere)

  return boundingSphere
}

/**
 * Measure the (approximate) bounding sphere of the given geometries.
 * @see https://en.wikipedia.org/wiki/Bounding_sphere
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the bounding sphere for each geometry, i.e. [centroid, radius]
 * @alias module:modeling/measurements.measureBoundingSphere
 *
 * @example
 * let bounds = measureBoundingSphere(cube())
 */
const measureBoundingSphere = (...geometries) => {
  geometries = flatten(geometries)

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return measureBoundingSphereOfPath2(geometry)
    if (geom2.isA(geometry)) return measureBoundingSphereOfGeom2(geometry)
    if (geom3.isA(geometry)) return measureBoundingSphereOfGeom3(geometry)
    return [[0, 0, 0], 0]
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureBoundingSphere

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78,"../geometries/poly3":95,"../maths/vec2":206,"../maths/vec3":237,"../utils/flatten":412}],275:[function(require,module,exports){
const flatten = require('../utils/flatten')

const measureBoundingBox = require('./measureBoundingBox')

/**
 * Measure the center of the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the center point for each geometry, i.e. [X, Y, Z]
 * @alias module:modeling/measurements.measureCenter
 *
 * @example
 * let center = measureCenter(sphere())
 */
const measureCenter = (...geometries) => {
  geometries = flatten(geometries)

  const results = geometries.map((geometry) => {
    const bounds = measureBoundingBox(geometry)
    return [
      (bounds[0][0] + ((bounds[1][0] - bounds[0][0]) / 2)),
      (bounds[0][1] + ((bounds[1][1] - bounds[0][1]) / 2)),
      (bounds[0][2] + ((bounds[1][2] - bounds[0][2]) / 2))
    ]
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureCenter

},{"../utils/flatten":412,"./measureBoundingBox":273}],276:[function(require,module,exports){
const flatten = require('../utils/flatten')

const vec3 = require('../maths/vec3')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')

const cacheOfCenterOfMass = new WeakMap()

/*
 * Measure the center of mass for the given geometry.
 *
 * @see http://paulbourke.net/geometry/polygonmesh/
 * @return {Array} the center of mass for the geometry
 */
const measureCenterOfMassGeom2 = (geometry) => {
  let centerOfMass = cacheOfCenterOfMass.get(geometry)
  if (centerOfMass !== undefined) return centerOfMass

  const sides = geom2.toSides(geometry)

  let area = 0
  let x = 0
  let y = 0
  if (sides.length > 0) {
    for (let i = 0; i < sides.length; i++) {
      const p1 = sides[i][0]
      const p2 = sides[i][1]

      const a = p1[0] * p2[1] - p1[1] * p2[0]
      area += a
      x += (p1[0] + p2[0]) * a
      y += (p1[1] + p2[1]) * a
    }
    area /= 2

    const f = 1 / (area * 6)
    x *= f
    y *= f
  }

  centerOfMass = vec3.fromValues(x, y, 0)

  cacheOfCenterOfMass.set(geometry, centerOfMass)
  return centerOfMass
}

/*
 * Measure the center of mass for the given geometry.
 * @return {Array} the center of mass for the geometry
 */
const measureCenterOfMassGeom3 = (geometry) => {
  let centerOfMass = cacheOfCenterOfMass.get(geometry)
  if (centerOfMass !== undefined) return centerOfMass

  centerOfMass = vec3.create() // 0, 0, 0

  const polygons = geom3.toPolygons(geometry)
  if (polygons.length === 0) return centerOfMass

  let totalVolume = 0
  const vector = vec3.create() // for speed
  polygons.forEach((polygon) => {
    // calculate volume and center of each tetrahedron
    const vertices = polygon.vertices
    for (let i = 0; i < vertices.length - 2; i++) {
      vec3.cross(vector, vertices[i + 1], vertices[i + 2])
      const volume = vec3.dot(vertices[0], vector) / 6

      totalVolume += volume

      vec3.add(vector, vertices[0], vertices[i + 1])
      vec3.add(vector, vector, vertices[i + 2])
      const weightedCenter = vec3.scale(vector, vector, 1 / 4 * volume)

      vec3.add(centerOfMass, centerOfMass, weightedCenter)
    }
  })
  vec3.scale(centerOfMass, centerOfMass, 1 / totalVolume)

  cacheOfCenterOfMass.set(geometry, centerOfMass)
  return centerOfMass
}

/**
 * Measure the center of mass for the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the center of mass for each geometry, i.e. [X, Y, Z]
 * @alias module:modeling/measurements.measureCenterOfMass
 *
 * @example
 * let center = measureCenterOfMass(sphere())
 */
const measureCenterOfMass = (...geometries) => {
  geometries = flatten(geometries)

  const results = geometries.map((geometry) => {
    // NOTE: center of mass for geometry path2 is not possible
    if (geom2.isA(geometry)) return measureCenterOfMassGeom2(geometry)
    if (geom3.isA(geometry)) return measureCenterOfMassGeom3(geometry)
    return [0, 0, 0]
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureCenterOfMass

},{"../geometries/geom2":42,"../geometries/geom3":57,"../maths/vec3":237,"../utils/flatten":412}],277:[function(require,module,exports){
const flatten = require('../utils/flatten')

const measureBoundingBox = require('./measureBoundingBox')

/**
 * Measure the dimensions of the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Array} the dimensions for each geometry, i.e. [width, depth, height]
 * @alias module:modeling/measurements.measureDimensions
 *
 * @example
 * let dimensions = measureDimensions(sphere())
 */
const measureDimensions = (...geometries) => {
  geometries = flatten(geometries)

  const results = geometries.map((geometry) => {
    const boundingBox = measureBoundingBox(geometry)
    return [
      boundingBox[1][0] - boundingBox[0][0],
      boundingBox[1][1] - boundingBox[0][1],
      boundingBox[1][2] - boundingBox[0][2]
    ]
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureDimensions

},{"../utils/flatten":412,"./measureBoundingBox":273}],278:[function(require,module,exports){
const flatten = require('../utils/flatten')
const { geom2, geom3, path2 } = require('../geometries')

const calculateEpsilonFromBounds = require('./calculateEpsilonFromBounds')
const measureBoundingBox = require('./measureBoundingBox')

/*
 * Measure the epsilon of the given (path2) geometry.
 * @return {Number} the epsilon (precision) of the geometry
 */
const measureEpsilonOfPath2 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox(geometry), 2)

/*
 * Measure the epsilon of the given (geom2) geometry.
 * @return {Number} the epsilon (precision) of the geometry
 */
const measureEpsilonOfGeom2 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox(geometry), 2)

/*
 * Measure the epsilon of the given (geom3) geometry.
 * @return {Float} the epsilon (precision) of the geometry
 */
const measureEpsilonOfGeom3 = (geometry) => calculateEpsilonFromBounds(measureBoundingBox(geometry), 3)

/**
 * Measure the epsilon of the given geometries.
 * Epsilon values are used in various functions to determine minimum distances between points, planes, etc.
 * @param {...Object} geometries - the geometries to measure
 * @return {Number|Array} the epsilon, or a list of epsilons for each geometry
 * @alias module:modeling/measurements.measureEpsilon
 *
 * @example
 * let epsilon = measureEpsilon(sphere())
 */
const measureEpsilon = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return measureEpsilonOfPath2(geometry)
    if (geom2.isA(geometry)) return measureEpsilonOfGeom2(geometry)
    if (geom3.isA(geometry)) return measureEpsilonOfGeom3(geometry)
    return 0
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureEpsilon

},{"../geometries":66,"../utils/flatten":412,"./calculateEpsilonFromBounds":266,"./measureBoundingBox":273}],279:[function(require,module,exports){
const flatten = require('../utils/flatten')

const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')
const poly3 = require('../geometries/poly3')

const cache = new WeakMap()

/*
 * Measure the volume of the given geometry.
 * NOTE: paths are infinitely narrow and do not have an volume
 *
 * @param {Path2} geometry - geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfPath2 = () => 0

/*
 * Measure the volume of the given geometry.
 * NOTE: 2D geometry are infinitely thin and do not have an volume
 *
 * @param {Geom2} geometry - 2D geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfGeom2 = () => 0

/*
 * Measure the volume of the given geometry.
 *
 * @param {Geom3} geometry - 3D geometry to measure
 * @returns {Number} volume of the geometry
 */
const measureVolumeOfGeom3 = (geometry) => {
  let volume = cache.get(geometry)
  if (volume) return volume

  const polygons = geom3.toPolygons(geometry)
  volume = polygons.reduce((volume, polygon) => volume + poly3.measureSignedVolume(polygon), 0)

  cache.set(geometry, volume)

  return volume
}

/**
 * Measure the volume of the given geometries.
 * @param {...Object} geometries - the geometries to measure
 * @return {Number|Array} the volume, or a list of volumes for each geometry
 * @alias module:modeling/measurements.measureVolume
 *
 * @example
 * let volume = measureVolume(sphere())
 */
const measureVolume = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return measureVolumeOfPath2(geometry)
    if (geom2.isA(geometry)) return measureVolumeOfGeom2(geometry)
    if (geom3.isA(geometry)) return measureVolumeOfGeom3(geometry)
    return 0
  })
  return results.length === 1 ? results[0] : results
}

module.exports = measureVolume

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78,"../geometries/poly3":95,"../utils/flatten":412}],280:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

const geom2 = require('../../geometries/geom2')

const fromFakePolygon = (epsilon, polygon) => {
  // this can happen based on union, seems to be residuals -
  // return null and handle in caller
  if (polygon.vertices.length < 4) {
    return null
  }
  const vert1Indices = []
  const points3D = polygon.vertices.filter((vertex, i) => {
    if (vertex[2] > 0) {
      vert1Indices.push(i)
      return true
    }
    return false
  })

  if (points3D.length !== 2) {
    throw new Error('Assertion failed: fromFakePolygon: not enough points found') // TBD remove later
  }

  const points2D = points3D.map((v3) => {
    const x = Math.round(v3[0] / epsilon) * epsilon + 0 // no more -0
    const y = Math.round(v3[1] / epsilon) * epsilon + 0 // no more -0
    return vec2.fromValues(x, y)
  })

  if (vec2.equals(points2D[0], points2D[1])) return null

  const d = vert1Indices[1] - vert1Indices[0]
  if (d === 1 || d === 3) {
    if (d === 1) {
      points2D.reverse()
    }
  } else {
    throw new Error('Assertion failed: fromFakePolygon: unknown index ordering')
  }
  return points2D
}

/*
 * Convert the given polygons to a list of sides.
 * The polygons must have only z coordinates +1 and -1, as constructed by to3DWalls().
 */
const fromFakePolygons = (epsilon, polygons) => {
  const sides = polygons.map((polygon) => fromFakePolygon(epsilon, polygon)).filter((polygon) => (polygon !== null))
  return geom2.create(sides)
}

module.exports = fromFakePolygons

},{"../../geometries/geom2":42,"../../maths/vec2":206}],281:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be passed to boolean functions
 * to perform logical operations, e.g. remove a hole from a board.
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/booleans
 * @example
 * const { intersect, subtract, union } = require('@jscad/modeling').booleans
 */
module.exports = {
  intersect: require('./intersect'),
  scission: require('./scission'),
  subtract: require('./subtract'),
  union: require('./union')
}

},{"./intersect":282,"./scission":287,"./subtract":289,"./union":300}],282:[function(require,module,exports){
const flatten = require('../../utils/flatten')
const areAllShapesTheSameType = require('../../utils/areAllShapesTheSameType')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')

const intersectGeom2 = require('./intersectGeom2')
const intersectGeom3 = require('./intersectGeom3')

/**
 * Return a new geometry representing space in both the first geometry and
 * all subsequent geometries.
 * The given geometries should be of the same type, either geom2 or geom3.
 *
 * @param {...Object} geometries - list of geometries
 * @returns {geom2|geom3} a new geometry
 * @alias module:modeling/booleans.intersect
 *
 * @example
 * let myshape = intersect(cube({size: [5,5,5]}), cube({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+
 * |       |
 * |   A   |
 * |    +--+----+   =   +--+
 * +----+--+    |       +--+
 *      |   B   |
 *      |       |
 *      +-------+
 */
const intersect = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType(geometries)) {
    throw new Error('only intersect of the types are supported')
  }

  const geometry = geometries[0]
  // if (path.isA(geometry)) return pathintersect(matrix, geometries)
  if (geom2.isA(geometry)) return intersectGeom2(geometries)
  if (geom3.isA(geometry)) return intersectGeom3(geometries)
  return geometry
}

module.exports = intersect

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../utils/areAllShapesTheSameType":410,"../../utils/flatten":412,"./intersectGeom2":283,"./intersectGeom3":284}],283:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom3 = require('../../geometries/geom3')

const measureEpsilon = require('../../measurements/measureEpsilon')

const fromFakePolygons = require('./fromFakePolygons')
const to3DWalls = require('./to3DWalls')
const intersectGeom3 = require('./intersectGeom3')

/*
 * Return a new 2D geometry representing space in both the first geometry and
 * in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom2} geometries - list of 2D geometries
 * @returns {geom2} new 2D geometry
 */
const intersect = (...geometries) => {
  geometries = flatten(geometries)
  const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry))

  const newgeom3 = intersectGeom3(newgeometries)
  const epsilon = measureEpsilon(newgeom3)

  return fromFakePolygons(epsilon, geom3.toPolygons(newgeom3))
}

module.exports = intersect

},{"../../geometries/geom3":57,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"./fromFakePolygons":280,"./intersectGeom3":284,"./to3DWalls":293}],284:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const retessellate = require('../modifiers/retessellate')

const intersectSub = require('./intersectGeom3Sub')

/*
 * Return a new 3D geometry representing space in both the first geometry and
 * in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom3} geometries - list of 3D geometries
 * @returns {geom3} new 3D geometry
 */
const intersect = (...geometries) => {
  geometries = flatten(geometries)

  let newgeometry = geometries.shift()
  geometries.forEach((geometry) => {
    newgeometry = intersectSub(newgeometry, geometry)
  })

  newgeometry = retessellate(newgeometry)
  return newgeometry
}

module.exports = intersect

},{"../../utils/flatten":412,"../modifiers/retessellate":370,"./intersectGeom3Sub":285}],285:[function(require,module,exports){
const geom3 = require('../../geometries/geom3')

const mayOverlap = require('./mayOverlap')
const { Tree } = require('./trees')

/*
 * Return a new 3D geometry representing the space in both the first geometry and
 * the second geometry. None of the given geometries are modified.
 * @param {geom3} geometry1 - a geometry
 * @param {geom3} geometry2 - a geometry
 * @returns {geom3} new 3D geometry
 */
const intersectGeom3Sub = (geometry1, geometry2) => {
  if (!mayOverlap(geometry1, geometry2)) {
    return geom3.create() // empty geometry
  }

  const a = new Tree(geom3.toPolygons(geometry1))
  const b = new Tree(geom3.toPolygons(geometry2))

  a.invert()
  b.clipTo(a)
  b.invert()
  a.clipTo(b)
  b.clipTo(a)
  a.addPolygons(b.allPolygons())
  a.invert()

  const newpolygons = a.allPolygons()
  return geom3.create(newpolygons)
}

module.exports = intersectGeom3Sub

},{"../../geometries/geom3":57,"./mayOverlap":286,"./trees":297}],286:[function(require,module,exports){
const { EPS } = require('../../maths/constants')

const measureBoundingBox = require('../../measurements/measureBoundingBox')

/*
 * Determine if the given geometries overlap by comparing min and max bounds.
 * NOTE: This is used in union for performance gains.
 * @param {geom3} geometry1 - geometry for comparison
 * @param {geom3} geometry2 - geometry for comparison
 * @returns {boolean} true if the geometries overlap
 */
const mayOverlap = (geometry1, geometry2) => {
  // FIXME accessing the data structure of the geometry should not be allowed
  if ((geometry1.polygons.length === 0) || (geometry2.polygons.length === 0)) {
    return false
  }

  const bounds1 = measureBoundingBox(geometry1)
  const min1 = bounds1[0]
  const max1 = bounds1[1]

  const bounds2 = measureBoundingBox(geometry2)
  const min2 = bounds2[0]
  const max2 = bounds2[1]

  if ((min2[0] - max1[0]) > EPS) return false
  if ((min1[0] - max2[0]) > EPS) return false
  if ((min2[1] - max1[1]) > EPS) return false
  if ((min1[1] - max2[1]) > EPS) return false
  if ((min2[2] - max1[2]) > EPS) return false
  if ((min1[2] - max2[2]) > EPS) return false
  return true
}

module.exports = mayOverlap

},{"../../maths/constants":110,"../../measurements/measureBoundingBox":273}],287:[function(require,module,exports){
const flatten = require('../../utils/flatten')

// const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')

// const scissionGeom2 = require('./scissionGeom2')
const scissionGeom3 = require('./scissionGeom3')

/**
 * Scission (divide) the given geometry into the component pieces.
 *
 * @param {...Object} objects - list of geometries
 * @returns {Array} list of pieces from each geometry
 * @alias module:modeling/booleans.scission
 *
 * @example
 * let figure = require('./my.stl')
 * let pieces = scission(figure)
 *
 * @example
 * +-------+            +-------+
 * |       |            |       |
 * |   +---+            | A +---+
 * |   |    +---+   =   |   |    +---+
 * +---+    |   |       +---+    |   |
 *      +---+   |            +---+   |
 *      |       |            |    B  |
 *      +-------+            +-------+
 */
const scission = (...objects) => {
  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    // if (path2.isA(object)) return path2.transform(matrix, object)
    // if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return scissionGeom3(object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = scission

},{"../../geometries/geom3":57,"../../utils/flatten":412,"./scissionGeom3":288}],288:[function(require,module,exports){
const vec3 = require('../../maths/vec3')
const measureEpsilon = require('../../measurements/measureEpsilon')

const geom3 = require('../../geometries/geom3')

// returns array numerically sorted and duplicates removed
const sortNb = (array) => array.sort((a, b) => a - b).filter((item, pos, ary) => !pos || item !== ary[pos - 1])

const insertMapping = (map, point, index) => {
  const key = `${point}`
  const mapping = map.get(key)
  if (mapping === undefined) {
    map.set(key, [index])
  } else {
    mapping.push(index)
  }
}

const findMapping = (map, point) => {
  const key = `${point}`
  return map.get(key)
}

const scissionGeom3 = (geometry) => {
  // construit table de correspondance entre polygones
  // build polygons lookup table
  const eps = measureEpsilon(geometry)
  const polygons = geom3.toPolygons(geometry)
  const pl = polygons.length

  const indexesPerPoint = new Map()
  const temp = vec3.create()
  polygons.forEach((polygon, index) => {
    polygon.vertices.forEach((point) => {
      insertMapping(indexesPerPoint, vec3.snap(temp, point, eps), index)
    })
  })

  const indexesPerPolygon = polygons.map((polygon) => {
    let indexes = []
    polygon.vertices.forEach((point) => {
      indexes = indexes.concat(findMapping(indexesPerPoint, vec3.snap(temp, point, eps)))
    })
    return { e: 1, d: sortNb(indexes) } // for each polygon, push the list of indexes
  })

  indexesPerPoint.clear()

  // regroupe les correspondances des polygones se touchant
  // boucle ne s'arrêtant que quand deux passages retournent le même nb de polygones
  // merge lookup data from linked polygons as long as possible
  let merges = 0
  const ippl = indexesPerPolygon.length
  for (let i = 0; i < ippl; i++) {
    const mapi = indexesPerPolygon[i]
    // merge mappings if necessary
    if (mapi.e > 0) {
      const indexes = new Array(pl)
      indexes[i] = true // include ourself
      do {
        merges = 0
        // loop through the known indexes
        indexes.forEach((e, j) => {
          const mapj = indexesPerPolygon[j]
          // merge this mapping if necessary
          if (mapj.e > 0) {
            mapj.e = -1 // merged
            for (let d = 0; d < mapj.d.length; d++) {
              indexes[mapj.d[d]] = true
            }
            merges++
          }
        })
      } while (merges > 0)
      mapi.indexes = indexes
    }
  }

  // construit le tableau des geometry à retourner
  // build array of geometry to return
  const newgeometries = []
  for (let i = 0; i < ippl; i++) {
    if (indexesPerPolygon[i].indexes) {
      const newpolygons = []
      indexesPerPolygon[i].indexes.forEach((e, p) => newpolygons.push(polygons[p]))
      newgeometries.push(geom3.create(newpolygons))
    }
  }

  return newgeometries
}

module.exports = scissionGeom3

},{"../../geometries/geom3":57,"../../maths/vec3":237,"../../measurements/measureEpsilon":278}],289:[function(require,module,exports){
const flatten = require('../../utils/flatten')
const areAllShapesTheSameType = require('../../utils/areAllShapesTheSameType')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')

const subtractGeom2 = require('./subtractGeom2')
const subtractGeom3 = require('./subtractGeom3')

/**
 * Return a new geometry representing space in the first geometry but
 * not in all subsequent geometries.
 * The given geometries should be of the same type, either geom2 or geom3.
 *
 * @param {...Object} geometries - list of geometries
 * @returns {geom2|geom3} a new geometry
 * @alias module:modeling/booleans.subtract
 *
 * @example
 * let myshape = subtract(cuboid({size: [5,5,5]}), cuboid({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+            +-------+
 * |       |            |       |
 * |   A   |            |       |
 * |    +--+----+   =   |    +--+
 * +----+--+    |       +----+
 *      |   B   |
 *      |       |
 *      +-------+
 */
const subtract = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType(geometries)) {
    throw new Error('only subtract of the types are supported')
  }

  const geometry = geometries[0]
  // if (path.isA(geometry)) return pathsubtract(matrix, geometries)
  if (geom2.isA(geometry)) return subtractGeom2(geometries)
  if (geom3.isA(geometry)) return subtractGeom3(geometries)
  return geometry
}

module.exports = subtract

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../utils/areAllShapesTheSameType":410,"../../utils/flatten":412,"./subtractGeom2":290,"./subtractGeom3":291}],290:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom3 = require('../../geometries/geom3')

const measureEpsilon = require('../../measurements/measureEpsilon')

const fromFakePolygons = require('./fromFakePolygons')
const to3DWalls = require('./to3DWalls')
const subtractGeom3 = require('./subtractGeom3')

/*
 * Return a new 2D geometry representing space in the first geometry but
 * not in the subsequent geometries. None of the given geometries are modified.
 * @param {...geom2} geometries - list of geometries
 * @returns {geom2} new 2D geometry
 */
const subtract = (...geometries) => {
  geometries = flatten(geometries)
  const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry))

  const newgeom3 = subtractGeom3(newgeometries)
  const epsilon = measureEpsilon(newgeom3)

  return fromFakePolygons(epsilon, geom3.toPolygons(newgeom3))
}

module.exports = subtract

},{"../../geometries/geom3":57,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"./fromFakePolygons":280,"./subtractGeom3":291,"./to3DWalls":293}],291:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const retessellate = require('../modifiers/retessellate')

const subtractSub = require('./subtractGeom3Sub')

/*
 * Return a new 3D geometry representing space in this geometry but not in the given geometries.
 * Neither this geometry nor the given geometries are modified.
 * @param {...geom3} geometries - list of geometries
 * @returns {geom3} new 3D geometry
 */
const subtract = (...geometries) => {
  geometries = flatten(geometries)

  let newgeometry = geometries.shift()
  geometries.forEach((geometry) => {
    newgeometry = subtractSub(newgeometry, geometry)
  })

  newgeometry = retessellate(newgeometry)
  return newgeometry
}

module.exports = subtract

},{"../../utils/flatten":412,"../modifiers/retessellate":370,"./subtractGeom3Sub":292}],292:[function(require,module,exports){
const geom3 = require('../../geometries/geom3')

const mayOverlap = require('./mayOverlap')
const { Tree } = require('./trees')

/*
 * Return a new 3D geometry representing the space in the first geometry but not
 * in the second geometry. None of the given geometries are modified.
 * @param {geom3} geometry1 - a geometry
 * @param {geom3} geometry2 - a geometry
 * @returns {geom3} new 3D geometry
 */
const subtractGeom3Sub = (geometry1, geometry2) => {
  if (!mayOverlap(geometry1, geometry2)) {
    return geom3.clone(geometry1)
  }

  const a = new Tree(geom3.toPolygons(geometry1))
  const b = new Tree(geom3.toPolygons(geometry2))

  a.invert()
  a.clipTo(b)
  b.clipTo(a, true)
  a.addPolygons(b.allPolygons())
  a.invert()

  const newpolygons = a.allPolygons()
  return geom3.create(newpolygons)
}

module.exports = subtractGeom3Sub

},{"../../geometries/geom3":57,"./mayOverlap":286,"./trees":297}],293:[function(require,module,exports){
const vec3 = require('../../maths/vec3')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

/*
 * Create a polygon (wall) from the given Z values and side.
 */
const to3DWall = (z0, z1, side) => {
  const points = [
    vec3.fromVec2(vec3.create(), side[0], z0),
    vec3.fromVec2(vec3.create(), side[1], z0),
    vec3.fromVec2(vec3.create(), side[1], z1),
    vec3.fromVec2(vec3.create(), side[0], z1)
  ]
  return poly3.create(points)
}

/*
 * Create a 3D geometry with walls, as constructed from the given options and geometry.
 *
 * @param {Object} options - options with Z offsets
 * @param {geom2} geometry - geometry used as base of walls
 * @return {geom3} the new geometry
 */
const to3DWalls = (options, geometry) => {
  const sides = geom2.toSides(geometry)

  const polygons = sides.map((side) => to3DWall(options.z0, options.z1, side))

  const result = geom3.create(polygons)
  return result
}

module.exports = to3DWalls

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/vec3":237}],294:[function(require,module,exports){
const plane = require('../../../maths/plane')
const poly3 = require('../../../geometries/poly3')

// # class Node
// Holds a node in a BSP tree.
// A BSP tree is built from a collection of polygons by picking a polygon to split along.
// Polygons are not stored directly in the tree, but in PolygonTreeNodes, stored in this.polygontreenodes.
// Those PolygonTreeNodes are children of the owning Tree.polygonTree.
// This is not a leafy BSP tree since there is no distinction between internal and leaf nodes.
class Node {
  constructor (parent) {
    this.plane = null
    this.front = null
    this.back = null
    this.polygontreenodes = []
    this.parent = parent
  }

  // Convert solid space to empty space and empty space to solid space.
  invert () {
    const queue = [this]
    let node
    for (let i = 0; i < queue.length; i++) {
      node = queue[i]
      if (node.plane) node.plane = plane.flip(plane.create(), node.plane)
      if (node.front) queue.push(node.front)
      if (node.back) queue.push(node.back)
      const temp = node.front
      node.front = node.back
      node.back = temp
    }
  }

  // clip polygontreenodes to our plane
  // calls remove() for all clipped PolygonTreeNodes
  clipPolygons (polygontreenodes, alsoRemovecoplanarFront) {
    let current = { node: this, polygontreenodes: polygontreenodes }
    let node
    const stack = []

    do {
      node = current.node
      polygontreenodes = current.polygontreenodes

      if (node.plane) {
        const plane = node.plane

        const backnodes = []
        const frontnodes = []
        const coplanarfrontnodes = alsoRemovecoplanarFront ? backnodes : frontnodes
        const numpolygontreenodes = polygontreenodes.length
        for (let i = 0; i < numpolygontreenodes; i++) {
          const treenode = polygontreenodes[i]
          if (!treenode.isRemoved()) {
            // split this polygon tree node using the plane
            // NOTE: children are added to the tree if there are spanning polygons
            treenode.splitByPlane(plane, coplanarfrontnodes, backnodes, frontnodes, backnodes)
          }
        }

        if (node.front && (frontnodes.length > 0)) {
          // add front node for further splitting
          stack.push({ node: node.front, polygontreenodes: frontnodes })
        }
        const numbacknodes = backnodes.length
        if (node.back && (numbacknodes > 0)) {
          // add back node for further splitting
          stack.push({ node: node.back, polygontreenodes: backnodes })
        } else {
          // remove all back nodes from processing
          for (let i = 0; i < numbacknodes; i++) {
            backnodes[i].remove()
          }
        }
      }
      current = stack.pop()
    } while (current !== undefined)
  }

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `tree`.
  clipTo (tree, alsoRemovecoplanarFront) {
    let node = this
    const stack = []
    do {
      if (node.polygontreenodes.length > 0) {
        tree.rootnode.clipPolygons(node.polygontreenodes, alsoRemovecoplanarFront)
      }
      if (node.front) stack.push(node.front)
      if (node.back) stack.push(node.back)
      node = stack.pop()
    } while (node !== undefined)
  }

  addPolygonTreeNodes (newpolygontreenodes) {
    let current = { node: this, polygontreenodes: newpolygontreenodes }
    const stack = []
    do {
      const node = current.node
      const polygontreenodes = current.polygontreenodes

      if (polygontreenodes.length === 0) {
        current = stack.pop()
        continue
      }
      if (!node.plane) {
        let index = 0 // default
        index = Math.floor(polygontreenodes.length / 2)
        // index = polygontreenodes.length >> 1
        // index = Math.floor(Math.random()*polygontreenodes.length)
        const bestpoly = polygontreenodes[index].getPolygon()
        node.plane = poly3.plane(bestpoly)
      }
      const frontnodes = []
      const backnodes = []
      const n = polygontreenodes.length
      for (let i = 0; i < n; ++i) {
        polygontreenodes[i].splitByPlane(node.plane, node.polygontreenodes, backnodes, frontnodes, backnodes)
      }

      if (frontnodes.length > 0) {
        if (!node.front) node.front = new Node(node)

        // unable to split by any of the current nodes
        const stopCondition = n === frontnodes.length && backnodes.length === 0
        if (stopCondition) node.front.polygontreenodes = frontnodes
        else stack.push({ node: node.front, polygontreenodes: frontnodes })
      }
      if (backnodes.length > 0) {
        if (!node.back) node.back = new Node(node)

        // unable to split by any of the current nodes
        const stopCondition = n === backnodes.length && frontnodes.length === 0

        if (stopCondition) node.back.polygontreenodes = backnodes
        else stack.push({ node: node.back, polygontreenodes: backnodes })
      }

      current = stack.pop()
    } while (current !== undefined)
  }
}

module.exports = Node

},{"../../../geometries/poly3":95,"../../../maths/plane":178}],295:[function(require,module,exports){
const { EPS } = require('../../../maths/constants')

const vec3 = require('../../../maths/vec3')

const poly3 = require('../../../geometries/poly3')

const splitPolygonByPlane = require('./splitPolygonByPlane')

// # class PolygonTreeNode
// This class manages hierarchical splits of polygons.
// At the top is a root node which does not hold a polygon, only child PolygonTreeNodes.
// Below that are zero or more 'top' nodes; each holds a polygon.
// The polygons can be in different planes.
// splitByPlane() splits a node by a plane. If the plane intersects the polygon, two new child nodes
// are created holding the splitted polygon.
// getPolygons() retrieves the polygons from the tree. If for PolygonTreeNode the polygon is split but
// the two split parts (child nodes) are still intact, then the unsplit polygon is returned.
// This ensures that we can safely split a polygon into many fragments. If the fragments are untouched,
// getPolygons() will return the original unsplit polygon instead of the fragments.
// remove() removes a polygon from the tree. Once a polygon is removed, the parent polygons are invalidated
// since they are no longer intact.
class PolygonTreeNode {
  // constructor creates the root node
  constructor (parent, polygon) {
    this.parent = parent
    this.children = []
    this.polygon = polygon
    this.removed = false // state of branch or leaf
  }

  // fill the tree with polygons. Should be called on the root node only; child nodes must
  // always be a derivate (split) of the parent node.
  addPolygons (polygons) {
    // new polygons can only be added to root node; children can only be splitted polygons
    if (!this.isRootNode()) {
      throw new Error('Assertion failed')
    }
    const _this = this
    polygons.forEach((polygon) => {
      _this.addChild(polygon)
    })
  }

  // remove a node
  // - the siblings become toplevel nodes
  // - the parent is removed recursively
  remove () {
    if (!this.removed) {
      this.removed = true
      this.polygon = null

      // remove ourselves from the parent's children list:
      const parentschildren = this.parent.children
      const i = parentschildren.indexOf(this)
      if (i < 0) throw new Error('Assertion failed')
      parentschildren.splice(i, 1)

      // invalidate the parent's polygon, and of all parents above it:
      this.parent.recursivelyInvalidatePolygon()
    }
  }

  isRemoved () {
    return this.removed
  }

  isRootNode () {
    return !this.parent
  }

  // invert all polygons in the tree. Call on the root node
  invert () {
    if (!this.isRootNode()) throw new Error('Assertion failed') // can only call this on the root node
    this.invertSub()
  }

  getPolygon () {
    if (!this.polygon) throw new Error('Assertion failed') // doesn't have a polygon, which means that it has been broken down
    return this.polygon
  }

  getPolygons (result) {
    let children = [this]
    const queue = [children]
    let i, j, l, node
    for (i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i]
      for (j = 0, l = children.length; j < l; j++) { // ok to cache length
        node = children[j]
        if (node.polygon) {
          // the polygon hasn't been broken yet. We can ignore the children and return our polygon:
          result.push(node.polygon)
        } else {
          // our polygon has been split up and broken, so gather all subpolygons from the children
          if (node.children.length > 0) queue.push(node.children)
        }
      }
    }
  }

  // split the node by a plane; add the resulting nodes to the frontnodes and backnodes array
  // If the plane doesn't intersect the polygon, the 'this' object is added to one of the arrays
  // If the plane does intersect the polygon, two new child nodes are created for the front and back fragments,
  //  and added to both arrays.
  splitByPlane (plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
    if (this.children.length) {
      const queue = [this.children]
      let i
      let j
      let l
      let node
      let nodes
      for (i = 0; i < queue.length; i++) { // queue.length can increase, do not cache
        nodes = queue[i]
        for (j = 0, l = nodes.length; j < l; j++) { // ok to cache length
          node = nodes[j]
          if (node.children.length > 0) {
            queue.push(node.children)
          } else {
            // no children. Split the polygon:
            node._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes)
          }
        }
      }
    } else {
      this._splitByPlane(plane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes)
    }
  }

  // only to be called for nodes with no children
  _splitByPlane (splane, coplanarfrontnodes, coplanarbacknodes, frontnodes, backnodes) {
    const polygon = this.polygon
    if (polygon) {
      const bound = poly3.measureBoundingSphere(polygon)
      const sphereradius = bound[3] + EPS // ensure radius is LARGER then polygon
      const spherecenter = bound
      const d = vec3.dot(splane, spherecenter) - splane[3]
      if (d > sphereradius) {
        frontnodes.push(this)
      } else if (d < -sphereradius) {
        backnodes.push(this)
      } else {
        const splitresult = splitPolygonByPlane(splane, polygon)
        switch (splitresult.type) {
          case 0:
            // coplanar front:
            coplanarfrontnodes.push(this)
            break

          case 1:
            // coplanar back:
            coplanarbacknodes.push(this)
            break

          case 2:
            // front:
            frontnodes.push(this)
            break

          case 3:
            // back:
            backnodes.push(this)
            break

          case 4:
            // spanning:
            if (splitresult.front) {
              const frontnode = this.addChild(splitresult.front)
              frontnodes.push(frontnode)
            }
            if (splitresult.back) {
              const backnode = this.addChild(splitresult.back)
              backnodes.push(backnode)
            }
            break
        }
      }
    }
  }

  // PRIVATE methods from here:
  // add child to a node
  // this should be called whenever the polygon is split
  // a child should be created for every fragment of the split polygon
  // returns the newly created child
  addChild (polygon) {
    const newchild = new PolygonTreeNode(this, polygon)
    this.children.push(newchild)
    return newchild
  }

  invertSub () {
    let children = [this]
    const queue = [children]
    let i, j, l, node
    for (i = 0; i < queue.length; i++) {
      children = queue[i]
      for (j = 0, l = children.length; j < l; j++) {
        node = children[j]
        if (node.polygon) {
          node.polygon = poly3.invert(node.polygon)
        }
        if (node.children.length > 0) queue.push(node.children)
      }
    }
  }

  // private method
  // remove the polygon from the node, and all parent nodes above it
  // called to invalidate parents of removed nodes
  recursivelyInvalidatePolygon () {
    this.polygon = null
    if (this.parent) {
      this.parent.recursivelyInvalidatePolygon()
    }
  }

  clear () {
    let children = [this]
    const queue = [children]
    for (let i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i]
      const l = children.length
      for (let j = 0; j < l; j++) {
        const node = children[j]
        if (node.polygon) {
          node.polygon = null
        }
        if (node.parent) {
          node.parent = null
        }
        if (node.children.length > 0) queue.push(node.children)
        node.children = []
      }
    }
  }

  toString () {
    let result = ''
    let children = [this]
    const queue = [children]
    let i, j, l, node
    for (i = 0; i < queue.length; ++i) { // queue size can change in loop, don't cache length
      children = queue[i]
      const prefix = ' '.repeat(i)
      for (j = 0, l = children.length; j < l; j++) { // ok to cache length
        node = children[j]
        result += `${prefix}PolygonTreeNode (${node.isRootNode()}): ${node.children.length}`
        if (node.polygon) {
          result += `\n ${prefix}polygon: ${node.polygon.vertices}\n`
        } else {
          result += '\n'
        }
        if (node.children.length > 0) queue.push(node.children)
      }
    }
    return result
  }
}

module.exports = PolygonTreeNode

},{"../../../geometries/poly3":95,"../../../maths/constants":110,"../../../maths/vec3":237,"./splitPolygonByPlane":299}],296:[function(require,module,exports){
const Node = require('./Node')
const PolygonTreeNode = require('./PolygonTreeNode')

// # class Tree
// This is the root of a BSP tree.
// This separate class for the root of the tree in order to hold the PolygonTreeNode root.
// The actual tree is kept in this.rootnode
class Tree {
  constructor (polygons) {
    this.polygonTree = new PolygonTreeNode()
    this.rootnode = new Node(null)
    if (polygons) this.addPolygons(polygons)
  }

  invert () {
    this.polygonTree.invert()
    this.rootnode.invert()
  }

  // Remove all polygons in this BSP tree that are inside the other BSP tree
  // `tree`.
  clipTo (tree, alsoRemovecoplanarFront = false) {
    this.rootnode.clipTo(tree, alsoRemovecoplanarFront)
  }

  allPolygons () {
    const result = []
    this.polygonTree.getPolygons(result)
    return result
  }

  addPolygons (polygons) {
    const polygontreenodes = new Array(polygons.length)
    for (let i = 0; i < polygons.length; i++) {
      polygontreenodes[i] = this.polygonTree.addChild(polygons[i])
    }
    this.rootnode.addPolygonTreeNodes(polygontreenodes)
  }

  clear () {
    this.polygonTree.clear()
  }

  toString () {
    const result = 'Tree: ' + this.polygonTree.toString('')
    return result
  }
}

module.exports = Tree

},{"./Node":294,"./PolygonTreeNode":295}],297:[function(require,module,exports){
module.exports = {
  Tree: require('./Tree')
}

},{"./Tree":296}],298:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

const splitLineSegmentByPlane = (plane, p1, p2) => {
  const direction = vec3.subtract(vec3.create(), p2, p1)
  let lambda = (plane[3] - vec3.dot(plane, p1)) / vec3.dot(plane, direction)
  if (Number.isNaN(lambda)) lambda = 0
  if (lambda > 1) lambda = 1
  if (lambda < 0) lambda = 0

  vec3.scale(direction, direction, lambda)
  vec3.add(direction, p1, direction)
  return direction
}

module.exports = splitLineSegmentByPlane

},{"../../../maths/vec3":237}],299:[function(require,module,exports){
const { EPS } = require('../../../maths/constants')

const plane = require('../../../maths/plane')
const vec3 = require('../../../maths/vec3')

const poly3 = require('../../../geometries/poly3')

const splitLineSegmentByPlane = require('./splitLineSegmentByPlane')

// Returns object:
// .type:
//   0: coplanar-front
//   1: coplanar-back
//   2: front
//   3: back
//   4: spanning
// In case the polygon is spanning, returns:
// .front: a Polygon3 of the front part
// .back: a Polygon3 of the back part
const splitPolygonByPlane = (splane, polygon) => {
  const result = {
    type: null,
    front: null,
    back: null
  }
  // cache in local lets (speedup):
  const vertices = polygon.vertices
  const numvertices = vertices.length
  const pplane = poly3.plane(polygon)
  if (plane.equals(pplane, splane)) {
    result.type = 0
  } else {
    let hasfront = false
    let hasback = false
    const vertexIsBack = []
    const MINEPS = -EPS
    for (let i = 0; i < numvertices; i++) {
      const t = vec3.dot(splane, vertices[i]) - splane[3]
      const isback = (t < MINEPS)
      vertexIsBack.push(isback)
      if (t > EPS) hasfront = true
      if (t < MINEPS) hasback = true
    }
    if ((!hasfront) && (!hasback)) {
      // all points coplanar
      const t = vec3.dot(splane, pplane)
      result.type = (t >= 0) ? 0 : 1
    } else if (!hasback) {
      result.type = 2
    } else if (!hasfront) {
      result.type = 3
    } else {
      // spanning
      result.type = 4
      const frontvertices = []
      const backvertices = []
      let isback = vertexIsBack[0]
      for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        const vertex = vertices[vertexindex]
        let nextvertexindex = vertexindex + 1
        if (nextvertexindex >= numvertices) nextvertexindex = 0
        const nextisback = vertexIsBack[nextvertexindex]
        if (isback === nextisback) {
          // line segment is on one side of the plane:
          if (isback) {
            backvertices.push(vertex)
          } else {
            frontvertices.push(vertex)
          }
        } else {
          // line segment intersects plane:
          const nextpoint = vertices[nextvertexindex]
          const intersectionpoint = splitLineSegmentByPlane(splane, vertex, nextpoint)
          if (isback) {
            backvertices.push(vertex)
            backvertices.push(intersectionpoint)
            frontvertices.push(intersectionpoint)
          } else {
            frontvertices.push(vertex)
            frontvertices.push(intersectionpoint)
            backvertices.push(intersectionpoint)
          }
        }
        isback = nextisback
      } // for vertexindex
      // remove duplicate vertices:
      const EPS_SQUARED = EPS * EPS
      if (backvertices.length >= 3) {
        let prevvertex = backvertices[backvertices.length - 1]
        for (let vertexindex = 0; vertexindex < backvertices.length; vertexindex++) {
          const vertex = backvertices[vertexindex]
          if (vec3.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            backvertices.splice(vertexindex, 1)
            vertexindex--
          }
          prevvertex = vertex
        }
      }
      if (frontvertices.length >= 3) {
        let prevvertex = frontvertices[frontvertices.length - 1]
        for (let vertexindex = 0; vertexindex < frontvertices.length; vertexindex++) {
          const vertex = frontvertices[vertexindex]
          if (vec3.squaredDistance(vertex, prevvertex) < EPS_SQUARED) {
            frontvertices.splice(vertexindex, 1)
            vertexindex--
          }
          prevvertex = vertex
        }
      }
      if (frontvertices.length >= 3) {
        result.front = poly3.fromPointsAndPlane(frontvertices, pplane)
      }
      if (backvertices.length >= 3) {
        result.back = poly3.fromPointsAndPlane(backvertices, pplane)
      }
    }
  }
  return result
}

module.exports = splitPolygonByPlane

},{"../../../geometries/poly3":95,"../../../maths/constants":110,"../../../maths/plane":178,"../../../maths/vec3":237,"./splitLineSegmentByPlane":298}],300:[function(require,module,exports){
const flatten = require('../../utils/flatten')
const areAllShapesTheSameType = require('../../utils/areAllShapesTheSameType')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')

const unionGeom2 = require('./unionGeom2')
const unionGeom3 = require('./unionGeom3')

/**
 * Return a new geometry representing the total space in the given geometries.
 * The given geometries should be of the same type, either geom2 or geom3.
 *
 * @param {...Object} geometries - list of geometries
 * @returns {geom2|geom3} a new geometry
 * @alias module:modeling/booleans.union
 *
 * @example
 * let myshape = union(cube({size: [5,5,5]}), cube({size: [5,5,5], center: [5,5,5]}))
 *
 * @example
 * +-------+            +-------+
 * |       |            |       |
 * |   A   |            |       |
 * |    +--+----+   =   |       +----+
 * +----+--+    |       +----+       |
 *      |   B   |            |       |
 *      |       |            |       |
 *      +-------+            +-------+
 */
const union = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType(geometries)) {
    throw new Error('only unions of the same type are supported')
  }

  const geometry = geometries[0]
  // if (path.isA(geometry)) return pathunion(matrix, geometries)
  if (geom2.isA(geometry)) return unionGeom2(geometries)
  if (geom3.isA(geometry)) return unionGeom3(geometries)
  return geometry
}

module.exports = union

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../utils/areAllShapesTheSameType":410,"../../utils/flatten":412,"./unionGeom2":301,"./unionGeom3":302}],301:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom3 = require('../../geometries/geom3')

const measureEpsilon = require('../../measurements/measureEpsilon')

const fromFakePolygons = require('./fromFakePolygons')
const to3DWalls = require('./to3DWalls')
const unionGeom3 = require('./unionGeom3')

/*
 * Return a new 2D geometry representing the total space in the given 2D geometries.
 * @param {...geom2} geometries - list of 2D geometries to union
 * @returns {geom2} new 2D geometry
 */
const union = (...geometries) => {
  geometries = flatten(geometries)
  const newgeometries = geometries.map((geometry) => to3DWalls({ z0: -1, z1: 1 }, geometry))

  const newgeom3 = unionGeom3(newgeometries)
  const epsilon = measureEpsilon(newgeom3)

  return fromFakePolygons(epsilon, geom3.toPolygons(newgeom3))
}

module.exports = union

},{"../../geometries/geom3":57,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"./fromFakePolygons":280,"./to3DWalls":293,"./unionGeom3":302}],302:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const retessellate = require('../modifiers/retessellate')

const unionSub = require('./unionGeom3Sub')

/*
 * Return a new 3D geometry representing the space in the given 3D geometries.
 * @param {...objects} geometries - list of geometries to union
 * @returns {geom3} new 3D geometry
 */
const union = (...geometries) => {
  geometries = flatten(geometries)

  // combine geometries in a way that forms a balanced binary tree pattern
  let i
  for (i = 1; i < geometries.length; i += 2) {
    geometries.push(unionSub(geometries[i - 1], geometries[i]))
  }
  let newgeometry = geometries[i - 1]
  newgeometry = retessellate(newgeometry)
  return newgeometry
}

module.exports = union

},{"../../utils/flatten":412,"../modifiers/retessellate":370,"./unionGeom3Sub":303}],303:[function(require,module,exports){
const geom3 = require('../../geometries/geom3')

const mayOverlap = require('./mayOverlap')
const { Tree } = require('./trees')

/*
 * Return a new 3D geometry representing the space in the given geometries.
 * @param {geom3} geometry1 - geometry to union
 * @param {geom3} geometry2 - geometry to union
 * @returns {geom3} new 3D geometry
 */
const unionSub = (geometry1, geometry2) => {
  if (!mayOverlap(geometry1, geometry2)) {
    return unionForNonIntersecting(geometry1, geometry2)
  }

  const a = new Tree(geom3.toPolygons(geometry1))
  const b = new Tree(geom3.toPolygons(geometry2))

  a.clipTo(b, false)
  // b.clipTo(a, true); // ERROR: doesn't work
  b.clipTo(a)
  b.invert()
  b.clipTo(a)
  b.invert()

  const newpolygons = a.allPolygons().concat(b.allPolygons())
  const result = geom3.create(newpolygons)
  return result
}

// Like union, but when we know that the two solids are not intersecting
// Do not use if you are not completely sure that the solids do not intersect!
const unionForNonIntersecting = (geometry1, geometry2) => {
  let newpolygons = geom3.toPolygons(geometry1)
  newpolygons = newpolygons.concat(geom3.toPolygons(geometry2))
  return geom3.create(newpolygons)
}

module.exports = unionSub

},{"../../geometries/geom3":57,"./mayOverlap":286,"./trees":297}],304:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

const expandGeom2 = require('./expandGeom2')
const expandGeom3 = require('./expandGeom3')
const expandPath2 = require('./expandPath2')

/**
 * Expand the given geometry using the given options.
 * Both internal and external space is expanded for 2D and 3D shapes.
 *
 * Note: Contract is expand using a negative delta.
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='edge'] - type of corner to create after expanding; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {...Objects} objects - the geometries to expand
 * @return {Object|Array} new geometry, or list of new geometries
 * @alias module:modeling/expansions.expand
 *
 * @example
 * let newarc = expand({delta: 5, corners: 'edge'}, arc({}))
 * let newsquare = expand({delta: 5, corners: 'chamfer'}, square({size: 30}))
 * let newsphere = expand({delta: 2, corners: 'round'}, cuboid({size: [20, 25, 5]}))
 */
const expand = (options, ...objects) => {
  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (path2.isA(object)) return expandPath2(options, object)
    if (geom2.isA(object)) return expandGeom2(options, object)
    if (geom3.isA(object)) return expandGeom3(options, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = expand

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../utils/flatten":412,"./expandGeom2":305,"./expandGeom3":306,"./expandPath2":307}],305:[function(require,module,exports){
const geom2 = require('../../geometries/geom2')

const offsetFromPoints = require('./offsetFromPoints')

/*
 * Expand the given geometry (geom2) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {geom2} geometry - the geometry to expand
 * @returns {geom2} expanded geometry
 */
const expandGeom2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 16
  }
  const { delta, corners, segments } = Object.assign({ }, defaults, options)

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  // convert the geometry to outlines, and generate offsets from each
  const outlines = geom2.toOutlines(geometry)
  const newoutlines = outlines.map((outline) => {
    options = {
      delta,
      corners,
      closed: true,
      segments
    }
    return offsetFromPoints(options, outline)
  })

  // create a composite geometry from the new outlines
  const allsides = newoutlines.reduce((sides, newoutline) => sides.concat(geom2.toSides(geom2.fromPoints(newoutline))), [])
  return geom2.create(allsides)
}

module.exports = expandGeom2

},{"../../geometries/geom2":42,"./offsetFromPoints":312}],306:[function(require,module,exports){
const geom3 = require('../../geometries/geom3')

const union = require('../booleans/union')

const expandShell = require('./expandShell')

/*
 * Expand the given geometry (geom3) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+/-) of expansion
 * @param {String} [options.corners='round'] - type corner to create during of expansion; round
 * @param {Integer} [options.segments=12] - number of segments when creating round corners
 * @param {geom3} geometry - the geometry to expand
 * @returns {geom3} expanded geometry
 */
const expandGeom3 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'round',
    segments: 12
  }
  const { delta, corners, segments } = Object.assign({ }, defaults, options)

  if (!(corners === 'round')) {
    throw new Error('corners must be "round" for 3D geometries')
  }

  const polygons = geom3.toPolygons(geometry)
  if (polygons.length === 0) throw new Error('the given geometry cannot be empty')

  options = { delta, corners, segments }
  const expanded = expandShell(options, geometry)
  return union(geometry, expanded)
}

module.exports = expandGeom3

},{"../../geometries/geom3":57,"../booleans/union":300,"./expandShell":308}],307:[function(require,module,exports){
const area = require('../../maths/utils/area')

const vec2 = require('../../maths/vec2')

const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const offsetFromPoints = require('./offsetFromPoints')

const createGeometryFromClosedOffsets = (paths) => {
  let { external, internal } = paths
  if (area(external) < 0) {
    external = external.reverse()
  } else {
    internal = internal.reverse()
  }
  // NOTE: creating path2 from the points ensures proper closure
  const externalPath = path2.fromPoints({ closed: true }, external)
  const internalPath = path2.fromPoints({ closed: true }, internal)
  const externalSides = geom2.toSides(geom2.fromPoints(path2.toPoints(externalPath)))
  const internalSides = geom2.toSides(geom2.fromPoints(path2.toPoints(internalPath)))
  externalSides.push(...internalSides)
  return geom2.create(externalSides)
}

const createGeometryFromExpandedOpenPath = (paths, segments, corners, delta) => {
  const { points, external, internal } = paths
  const capSegments = Math.floor(segments / 2) // rotation is 180 degrees
  const e2iCap = []
  const i2eCap = []
  if (corners === 'round' && capSegments > 0) {
    // added round caps to the geometry
    const step = Math.PI / capSegments
    const eCorner = points[points.length - 1]
    const e2iStart = vec2.angle(vec2.subtract(vec2.create(), external[external.length - 1], eCorner))
    const iCorner = points[0]
    const i2eStart = vec2.angle(vec2.subtract(vec2.create(), internal[0], iCorner))
    for (let i = 1; i < capSegments; i++) {
      let radians = e2iStart + (step * i)
      let point = vec2.fromAngleRadians(vec2.create(), radians)
      vec2.scale(point, point, delta)
      vec2.add(point, point, eCorner)
      e2iCap.push(point)

      radians = i2eStart + (step * i)
      point = vec2.fromAngleRadians(vec2.create(), radians)
      vec2.scale(point, point, delta)
      vec2.add(point, point, iCorner)
      i2eCap.push(point)
    }
  }
  const allPoints = []
  allPoints.push(...external, ...e2iCap, ...internal.reverse(), ...i2eCap)
  return geom2.fromPoints(allPoints)
}

/*
 * Expand the given geometry (path2) using the given options (if any).
 * @param {Object} options - options for expand
 * @param {Number} [options.delta=1] - delta (+) of expansion
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {path2} geometry - the geometry to expand
 * @returns {geom2} expanded geometry
 */
const expandPath2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 16
  }

  options = Object.assign({ }, defaults, options)
  const { delta, corners, segments } = options

  if (delta <= 0) throw new Error('the given delta must be positive for paths')

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  const closed = geometry.isClosed
  const points = path2.toPoints(geometry)
  if (points.length === 0) throw new Error('the given geometry cannot be empty')

  const paths = {
    points: points,
    external: offsetFromPoints({ delta, corners, segments, closed }, points),
    internal: offsetFromPoints({ delta: -delta, corners, segments, closed }, points)
  }

  if (geometry.isClosed) {
    return createGeometryFromClosedOffsets(paths)
  } else {
    return createGeometryFromExpandedOpenPath(paths, segments, corners, delta)
  }
}

module.exports = expandPath2

},{"../../geometries/geom2":42,"../../geometries/path2":78,"../../maths/utils/area":183,"../../maths/vec2":206,"./offsetFromPoints":312}],308:[function(require,module,exports){
const { EPS, TAU } = require('../../maths/constants')

const mat4 = require('../../maths/mat4')
const vec3 = require('../../maths/vec3')

const fnNumberSort = require('../../utils/fnNumberSort')

const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

const sphere = require('../../primitives/sphere')

const retessellate = require('../modifiers/retessellate')

const unionGeom3Sub = require('../booleans/unionGeom3Sub')

const extrudePolygon = require('./extrudePolygon')

/*
 * Collect all planes adjacent to each vertex
 */
const mapPlaneToVertex = (map, vertex, plane) => {
  const key = vertex.toString()
  if (!map.has(key)) {
    const entry = [vertex, [plane]]
    map.set(key, entry)
  } else {
    const planes = map.get(key)[1]
    planes.push(plane)
  }
}

/*
 * Collect all planes adjacent to each edge.
 * Combine undirected edges, no need for duplicate cylinders.
 */
const mapPlaneToEdge = (map, edge, plane) => {
  const key0 = edge[0].toString()
  const key1 = edge[1].toString()
  // Sort keys to make edges undirected
  const key = key0 < key1 ? `${key0},${key1}` : `${key1},${key0}`
  if (!map.has(key)) {
    const entry = [edge, [plane]]
    map.set(key, entry)
  } else {
    const planes = map.get(key)[1]
    planes.push(plane)
  }
}

const addUniqueAngle = (map, angle) => {
  const i = map.findIndex((item) => item === angle)
  if (i < 0) {
    map.push(angle)
  }
}

/*
 * Create the expanded shell of the solid:
 * All faces are extruded to 2 times delta
 * Cylinders are constructed around every side
 * Spheres are placed on every vertex
 * the result is a true expansion of the solid
 * @param  {Number} delta
 * @param  {Integer} segments
 */
const expandShell = (options, geometry) => {
  const defaults = {
    delta: 1,
    segments: 12
  }
  const { delta, segments } = Object.assign({ }, defaults, options)

  let result = geom3.create()
  const vertices2planes = new Map() // {vertex: [vertex, [plane, ...]]}
  const edges2planes = new Map() // {edge: [[vertex, vertex], [plane, ...]]}

  const v1 = vec3.create()
  const v2 = vec3.create()

  // loop through the polygons
  // - extruded the polygon, and add to the composite result
  // - add the plane to the unique vertice map
  // - add the plane to the unique edge map
  const polygons = geom3.toPolygons(geometry)
  polygons.forEach((polygon, index) => {
    const extrudevector = vec3.scale(vec3.create(), poly3.plane(polygon), 2 * delta)
    const translatedpolygon = poly3.transform(mat4.fromTranslation(mat4.create(), vec3.scale(vec3.create(), extrudevector, -0.5)), polygon)
    const extrudedface = extrudePolygon(extrudevector, translatedpolygon)
    result = unionGeom3Sub(result, extrudedface)

    const vertices = polygon.vertices
    for (let i = 0; i < vertices.length; i++) {
      mapPlaneToVertex(vertices2planes, vertices[i], poly3.plane(polygon))
      const j = (i + 1) % vertices.length
      const edge = [vertices[i], vertices[j]]
      mapPlaneToEdge(edges2planes, edge, poly3.plane(polygon))
    }
  })

  // now construct a cylinder on every side
  // The cylinder is always an approximation of a true cylinder, having polygons
  // around the sides. We will make sure though that the cylinder will have an edge at every
  // face that touches this side. This ensures that we will get a smooth fill even
  // if two edges are at, say, 10 degrees and the segments is low.
  edges2planes.forEach((item) => {
    const edge = item[0]
    const planes = item[1]
    const startpoint = edge[0]
    const endpoint = edge[1]

    // our x,y and z vectors:
    const zbase = vec3.subtract(vec3.create(), endpoint, startpoint)
    vec3.normalize(zbase, zbase)
    const xbase = planes[0]
    const ybase = vec3.cross(vec3.create(), xbase, zbase)

    // make a list of angles that the cylinder should traverse:
    let angles = []

    // first of all equally spaced around the cylinder:
    for (let i = 0; i < segments; i++) {
      addUniqueAngle(angles, (i * TAU / segments))
    }

    // and also at every normal of all touching planes:
    for (let i = 0, iMax = planes.length; i < iMax; i++) {
      const planenormal = planes[i]
      const si = vec3.dot(ybase, planenormal)
      const co = vec3.dot(xbase, planenormal)
      let angle = Math.atan2(si, co)

      if (angle < 0) angle += TAU
      addUniqueAngle(angles, angle)
      angle = Math.atan2(-si, -co)
      if (angle < 0) angle += TAU
      addUniqueAngle(angles, angle)
    }

    // this will result in some duplicate angles but we will get rid of those later.
    angles = angles.sort(fnNumberSort)

    // Now construct the cylinder by traversing all angles:
    const numangles = angles.length
    let prevp1
    let prevp2
    const startfacevertices = []
    const endfacevertices = []
    const polygons = []
    for (let i = -1; i < numangles; i++) {
      const angle = angles[(i < 0) ? (i + numangles) : i]
      const si = Math.sin(angle)
      const co = Math.cos(angle)
      vec3.scale(v1, xbase, co * delta)
      vec3.scale(v2, ybase, si * delta)
      vec3.add(v1, v1, v2)
      const p1 = vec3.add(vec3.create(), startpoint, v1)
      const p2 = vec3.add(vec3.create(), endpoint, v1)
      let skip = false
      if (i >= 0) {
        if (vec3.distance(p1, prevp1) < EPS) {
          skip = true
        }
      }
      if (!skip) {
        if (i >= 0) {
          startfacevertices.push(p1)
          endfacevertices.push(p2)
          const points = [prevp2, p2, p1, prevp1]
          const polygon = poly3.create(points)
          polygons.push(polygon)
        }
        prevp1 = p1
        prevp2 = p2
      }
    }
    endfacevertices.reverse()
    polygons.push(poly3.create(startfacevertices))
    polygons.push(poly3.create(endfacevertices))

    const cylinder = geom3.create(polygons)
    result = unionGeom3Sub(result, cylinder)
  })

  // build spheres at each unique vertex
  // We will try to set the x and z axis to the normals of 2 planes
  // This will ensure that our sphere tesselation somewhat matches 2 planes
  vertices2planes.forEach((item) => {
    const vertex = item[0]
    const planes = item[1]
    // use the first normal to be the x axis of our sphere:
    const xaxis = planes[0]
    // and find a suitable z axis. We will use the normal which is most perpendicular to the x axis:
    let bestzaxis = null
    let bestzaxisorthogonality = 0
    for (let i = 1; i < planes.length; i++) {
      const normal = planes[i]
      const cross = vec3.cross(v1, xaxis, normal)
      const crosslength = vec3.length(cross)
      if (crosslength > 0.05) { // FIXME why 0.05?
        if (crosslength > bestzaxisorthogonality) {
          bestzaxisorthogonality = crosslength
          bestzaxis = normal
        }
      }
    }
    if (!bestzaxis) {
      bestzaxis = vec3.orthogonal(v1, xaxis)
    }
    const yaxis = vec3.cross(v1, xaxis, bestzaxis)
    vec3.normalize(yaxis, yaxis)
    const zaxis = vec3.cross(v2, yaxis, xaxis)
    const corner = sphere({
      center: [vertex[0], vertex[1], vertex[2]],
      radius: delta,
      segments: segments,
      axes: [xaxis, yaxis, zaxis]
    })
    result = unionGeom3Sub(result, corner)
  })
  return retessellate(result)
}

module.exports = expandShell

},{"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/constants":110,"../../maths/mat4":159,"../../maths/vec3":237,"../../primitives/sphere":400,"../../utils/fnNumberSort":413,"../booleans/unionGeom3Sub":303,"../modifiers/retessellate":370,"./extrudePolygon":309}],309:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec3 = require('../../maths/vec3')

const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

// Extrude a polygon in the direction of the offsetvector.
// Returns (geom3) a new geometry
const extrudePolygon = (offsetvector, polygon1) => {
  const direction = vec3.dot(poly3.plane(polygon1), offsetvector)
  if (direction > 0) {
    polygon1 = poly3.invert(polygon1)
  }

  const newpolygons = [polygon1]

  const polygon2 = poly3.transform(mat4.fromTranslation(mat4.create(), offsetvector), polygon1)
  const numvertices = polygon1.vertices.length
  for (let i = 0; i < numvertices; i++) {
    const nexti = (i < (numvertices - 1)) ? i + 1 : 0
    const sideFacePolygon = poly3.create([
      polygon1.vertices[i],
      polygon2.vertices[i],
      polygon2.vertices[nexti],
      polygon1.vertices[nexti]
    ])
    newpolygons.push(sideFacePolygon)
  }
  newpolygons.push(poly3.invert(polygon2))

  return geom3.create(newpolygons)
}

module.exports = extrudePolygon

},{"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/mat4":159,"../../maths/vec3":237}],310:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be expanded (or contracted.)
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/expansions
 * @example
 * const { expand, offset } = require('@jscad/modeling').expansions
 */
module.exports = {
  expand: require('./expand'),
  offset: require('./offset')
}

},{"./expand":304,"./offset":311}],311:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const offsetGeom2 = require('./offsetGeom2')
const offsetPath2 = require('./offsetPath2')

/**
 * Create offset geometry from the given geometry using the given options.
 * Offsets from internal and external space are created.
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type of corner to create after offseting; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {...Object} objects - the geometries to offset
 * @return {Object|Array} new geometry, or list of new geometries
 * @alias module:modeling/expansions.offset
 *
 * @example
 * let small = offset({ delta: -4, corners: 'chamfer' }, square({size: 40})) // contract
 */
const offset = (options, ...objects) => {
  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (path2.isA(object)) return offsetPath2(options, object)
    if (geom2.isA(object)) return offsetGeom2(options, object)
    // if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = offset

},{"../../geometries/geom2":42,"../../geometries/path2":78,"../../utils/flatten":412,"./offsetGeom2":313,"./offsetPath2":314}],312:[function(require,module,exports){
const { EPS, TAU } = require('../../maths/constants')

const intersect = require('../../maths/utils/intersect')
const line2 = require('../../maths/line2')
const vec2 = require('../../maths/vec2')
const area = require('../../maths/utils/area')

/*
 * Create a set of offset points from the given points using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {Integer} [options.closed=false] - is the last point connected back to the first point?
 * @param {Array} points - array of 2D points
 * @returns {Array} new set of offset points, plus points for each rounded corner
 */
const offsetFromPoints = (options, points) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    closed: false,
    segments: 16
  }
  let { delta, corners, closed, segments } = Object.assign({ }, defaults, options)

  if (Math.abs(delta) < EPS) return points

  let rotation = options.closed ? area(points) : 1.0 // + counter clockwise, - clockwise
  if (rotation === 0) rotation = 1.0

  // use right hand normal?
  const orientation = ((rotation > 0) && (delta >= 0)) || ((rotation < 0) && (delta < 0))
  delta = Math.abs(delta) // sign is no longer required

  let previousSegment = null
  let newPoints = []
  const newCorners = []
  const of = vec2.create()
  const n = points.length
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n
    const p0 = points[i]
    const p1 = points[j]
    // calculate the unit normal
    orientation ? vec2.subtract(of, p0, p1) : vec2.subtract(of, p1, p0)
    vec2.normal(of, of)
    vec2.normalize(of, of)
    // calculate the offset vector
    vec2.scale(of, of, delta)
    // calculate the new points (edge)
    const n0 = vec2.add(vec2.create(), p0, of)
    const n1 = vec2.add(vec2.create(), p1, of)

    const currentSegment = [n0, n1]
    if (previousSegment != null) {
      if (closed || (!closed && j !== 0)) {
        // check for intersection of new line segments
        const ip = intersect(previousSegment[0], previousSegment[1], currentSegment[0], currentSegment[1])
        if (ip) {
          // adjust the previous points
          newPoints.pop()
          // adjust current points
          currentSegment[0] = ip
        } else {
          newCorners.push({ c: p0, s0: previousSegment, s1: currentSegment })
        }
      }
    }
    previousSegment = [n0, n1]

    if (j === 0 && !closed) continue

    newPoints.push(currentSegment[0])
    newPoints.push(currentSegment[1])
  }
  // complete the closure if required
  if (closed && previousSegment != null) {
    // check for intersection of closing line segments
    const n0 = newPoints[0]
    const n1 = newPoints[1]
    const ip = intersect(previousSegment[0], previousSegment[1], n0, n1)
    if (ip) {
      // adjust the previous points
      newPoints[0] = ip
      newPoints.pop()
    } else {
      const p0 = points[0]
      const cursegment = [n0, n1]
      newCorners.push({ c: p0, s0: previousSegment, s1: cursegment })
    }
  }

  // generate corners if necessary

  if (corners === 'edge') {
    // map for fast point index lookup
    const pointIndex = new Map() // {point: index}
    newPoints.forEach((point, index) => pointIndex.set(point, index))

    // create edge corners
    const line0 = line2.create()
    const line1 = line2.create()
    newCorners.forEach((corner) => {
      line2.fromPoints(line0, corner.s0[0], corner.s0[1])
      line2.fromPoints(line1, corner.s1[0], corner.s1[1])
      const ip = line2.intersectPointOfLines(line0, line1)
      if (Number.isFinite(ip[0]) && Number.isFinite(ip[1])) {
        const p0 = corner.s0[1]
        const i = pointIndex.get(p0)
        newPoints[i] = ip
        newPoints[(i + 1) % newPoints.length] = undefined
      } else {
        // paralell segments, drop one
        const p0 = corner.s1[0]
        const i = pointIndex.get(p0)
        newPoints[i] = undefined
      }
    })
    newPoints = newPoints.filter((p) => p !== undefined)
  }

  if (corners === 'round') {
    // create rounded corners
    let cornersegments = Math.floor(segments / 4)
    const v0 = vec2.create()
    newCorners.forEach((corner) => {
      // calculate angle of rotation
      let rotation = vec2.angle(vec2.subtract(v0, corner.s1[0], corner.c))
      rotation -= vec2.angle(vec2.subtract(v0, corner.s0[1], corner.c))
      if (orientation && rotation < 0) {
        rotation = rotation + Math.PI
        if (rotation < 0) rotation = rotation + Math.PI
      }
      if ((!orientation) && rotation > 0) {
        rotation = rotation - Math.PI
        if (rotation > 0) rotation = rotation - Math.PI
      }

      if (rotation !== 0.0) {
        // generate the segments
        cornersegments = Math.floor(segments * (Math.abs(rotation) / TAU))
        const step = rotation / cornersegments
        const start = vec2.angle(vec2.subtract(v0, corner.s0[1], corner.c))
        const cornerpoints = []
        for (let i = 1; i < cornersegments; i++) {
          const radians = start + (step * i)
          const point = vec2.fromAngleRadians(vec2.create(), radians)
          vec2.scale(point, point, delta)
          vec2.add(point, point, corner.c)
          cornerpoints.push(point)
        }
        if (cornerpoints.length > 0) {
          const p0 = corner.s0[1]
          let i = newPoints.findIndex((point) => vec2.equals(p0, point))
          i = (i + 1) % newPoints.length
          newPoints.splice(i, 0, ...cornerpoints)
        }
      } else {
        // paralell segments, drop one
        const p0 = corner.s1[0]
        const i = newPoints.findIndex((point) => vec2.equals(p0, point))
        newPoints.splice(i, 1)
      }
    })
  }
  return newPoints
}

module.exports = offsetFromPoints

},{"../../maths/constants":110,"../../maths/line2":121,"../../maths/utils/area":183,"../../maths/utils/intersect":186,"../../maths/vec2":206}],313:[function(require,module,exports){
const geom2 = require('../../geometries/geom2')
const poly2 = require('../../geometries/poly2')

const offsetFromPoints = require('./offsetFromPoints')

/*
 * Create a offset geometry from the given geom2 using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {geom2} geometry - geometry from which to create the offset
 * @returns {geom2} offset geometry, plus rounded corners
 */
const offsetGeom2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    segments: 0
  }
  const { delta, corners, segments } = Object.assign({ }, defaults, options)

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  // convert the geometry to outlines, and generate offsets from each
  const outlines = geom2.toOutlines(geometry)
  const newoutlines = outlines.map((outline) => {
    const level = outlines.reduce((acc, polygon) => acc + poly2.arePointsInside(outline, poly2.create(polygon)), 0)
    const outside = (level % 2) === 0

    options = {
      delta: outside ? delta : -delta,
      corners,
      closed: true,
      segments
    }
    return offsetFromPoints(options, outline)
  })

  // create a composite geometry from the new outlines
  const allsides = newoutlines.reduce((sides, newoutline) => sides.concat(geom2.toSides(geom2.fromPoints(newoutline))), [])
  return geom2.create(allsides)
}

module.exports = offsetGeom2

},{"../../geometries/geom2":42,"../../geometries/poly2":89,"./offsetFromPoints":312}],314:[function(require,module,exports){
const path2 = require('../../geometries/path2')

const offsetFromPoints = require('./offsetFromPoints')

/*
 * Create a offset geometry from the given path using the given options (if any).
 * @param {Object} options - options for offset
 * @param {Float} [options.delta=1] - delta of offset (+ to exterior, - from interior)
 * @param {String} [options.corners='edge'] - type corner to create during of expansion; edge, chamfer, round
 * @param {Integer} [options.segments=16] - number of segments when creating round corners
 * @param {path2} geometry - geometry from which to create the offset
 * @returns {path2} offset geometry, plus rounded corners
 */
const offsetPath2 = (options, geometry) => {
  const defaults = {
    delta: 1,
    corners: 'edge',
    closed: geometry.isClosed,
    segments: 16
  }
  const { delta, corners, closed, segments } = Object.assign({ }, defaults, options)

  if (!(corners === 'edge' || corners === 'chamfer' || corners === 'round')) {
    throw new Error('corners must be "edge", "chamfer", or "round"')
  }

  options = { delta, corners, closed, segments }
  const newpoints = offsetFromPoints(options, path2.toPoints(geometry))
  return path2.fromPoints({ closed: closed }, newpoints)
}

module.exports = offsetPath2

},{"../../geometries/path2":78,"./offsetFromPoints":312}],315:[function(require,module,exports){
const { area } = require('../../../maths/utils')
const { toOutlines } = require('../../../geometries/geom2')
const { arePointsInside } = require('../../../geometries/poly2')

/*
 * Constructs a polygon hierarchy of solids and holes.
 * The hierarchy is represented as a forest of trees. All trees shall be depth at most 2.
 * If a solid exists inside the hole of another solid, it will be split out as its own root.
 *
 * @param {geom2} geometry
 * @returns {Array} an array of polygons with associated holes
 * @alias module:modeling/geometries/geom2.toTree
 *
 * @example
 * const geometry = subtract(rectangle({size: [5, 5]}), rectangle({size: [3, 3]}))
 * console.log(assignHoles(geometry))
 * [{
 *   "solid": [[-2.5,-2.5],[2.5,-2.5],[2.5,2.5],[-2.5,2.5]],
 *   "holes": [[[-1.5,1.5],[1.5,1.5],[1.5,-1.5],[-1.5,-1.5]]]
 * }]
 */
const assignHoles = (geometry) => {
  const outlines = toOutlines(geometry)
  const solids = [] // solid indices
  const holes = [] // hole indices
  outlines.forEach((outline, i) => {
    const a = area(outline)
    if (a < 0) {
      holes.push(i)
    } else if (a > 0) {
      solids.push(i)
    }
  })

  // for each hole, determine what solids it is inside of
  const children = [] // child holes of solid[i]
  const parents = [] // parent solids of hole[i]
  solids.forEach((s, i) => {
    const solid = outlines[s]
    children[i] = []
    holes.forEach((h, j) => {
      const hole = outlines[h]
      // check if a point of hole j is inside solid i
      if (arePointsInside([hole[0]], { vertices: solid })) {
        children[i].push(h)
        if (!parents[j]) parents[j] = []
        parents[j].push(i)
      }
    })
  })

  // check if holes have multiple parents and choose one with fewest children
  holes.forEach((h, j) => {
    // ensure at least one parent exists
    if (parents[j] && parents[j].length > 1) {
      // the solid directly containing this hole
      const directParent = minIndex(parents[j], (p) => children[p].length)
      parents[j].forEach((p, i) => {
        if (i !== directParent) {
          // Remove hole from skip level parents
          children[p] = children[p].filter((c) => c !== h)
        }
      })
    }
  })

  // map indices back to points
  return children.map((holes, i) => ({
    solid: outlines[solids[i]],
    holes: holes.map((h) => outlines[h])
  }))
}

/*
 * Find the item in the list with smallest score(item).
 * If the list is empty, return undefined.
 */
const minIndex = (list, score) => {
  let bestIndex
  let best
  list.forEach((item, index) => {
    const value = score(item)
    if (best === undefined || value < best) {
      bestIndex = index
      best = value
    }
  })
  return bestIndex
}

module.exports = assignHoles

},{"../../../geometries/geom2":42,"../../../geometries/poly2":89,"../../../maths/utils":184}],316:[function(require,module,exports){
const { filterPoints, linkedPolygon, locallyInside, splitPolygon } = require('./linkedPolygon')
const { area, pointInTriangle } = require('./triangle')

/*
 * link every hole into the outer loop, producing a single-ring polygon without holes
 *
 * Original source from https://github.com/mapbox/earcut
 * Copyright (c) 2016 Mapbox
 */
const eliminateHoles = (data, holeIndices, outerNode, dim) => {
  const queue = []

  for (let i = 0, len = holeIndices.length; i < len; i++) {
    const start = holeIndices[i] * dim
    const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length
    const list = linkedPolygon(data, start, end, dim, false)
    if (list === list.next) list.steiner = true
    queue.push(getLeftmost(list))
  }

  queue.sort((a, b) => a.x - b.x) // compare X

  // process holes from left to right
  for (let i = 0; i < queue.length; i++) {
    outerNode = eliminateHole(queue[i], outerNode)
    outerNode = filterPoints(outerNode, outerNode.next)
  }

  return outerNode
}

/*
 * find a bridge between vertices that connects hole with an outer ring and link it
 */
const eliminateHole = (hole, outerNode) => {
  const bridge = findHoleBridge(hole, outerNode)
  if (!bridge) {
    return outerNode
  }

  const bridgeReverse = splitPolygon(bridge, hole)

  // filter colinear points around the cuts
  const filteredBridge = filterPoints(bridge, bridge.next)
  filterPoints(bridgeReverse, bridgeReverse.next)

  // Check if input node was removed by the filtering
  return outerNode === bridge ? filteredBridge : outerNode
}

/*
 * David Eberly's algorithm for finding a bridge between hole and outer polygon
 */
const findHoleBridge = (hole, outerNode) => {
  let p = outerNode
  const hx = hole.x
  const hy = hole.y
  let qx = -Infinity
  let m

  // find a segment intersected by a ray from the hole's leftmost point to the left
  // segment's endpoint with lesser x will be potential connection point
  do {
    if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {
      const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y)
      if (x <= hx && x > qx) {
        qx = x
        if (x === hx) {
          if (hy === p.y) return p
          if (hy === p.next.y) return p.next
        }

        m = p.x < p.next.x ? p : p.next
      }
    }

    p = p.next
  } while (p !== outerNode)

  if (!m) return null

  if (hx === qx) return m // hole touches outer segment; pick leftmost endpoint

  // look for points inside the triangle of hole point, segment intersection and endpoint
  // if there are no points found, we have a valid connection
  // otherwise choose the point of the minimum angle with the ray as connection point

  const stop = m
  const mx = m.x
  const my = m.y
  let tanMin = Infinity

  p = m

  do {
    if (hx >= p.x && p.x >= mx && hx !== p.x &&
        pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {
      const tan = Math.abs(hy - p.y) / (hx - p.x) // tangential

      if (locallyInside(p, hole) && (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {
        m = p
        tanMin = tan
      }
    }

    p = p.next
  } while (p !== stop)

  return m
}

/*
 * whether sector in vertex m contains sector in vertex p in the same coordinates
 */
const sectorContainsSector = (m, p) => area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0

/*
 * find the leftmost node of a polygon ring
 */
const getLeftmost = (start) => {
  let p = start
  let leftmost = start
  do {
    if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p
    p = p.next
  } while (p !== start)

  return leftmost
}

module.exports = eliminateHoles

},{"./linkedPolygon":320,"./triangle":322}],317:[function(require,module,exports){
const eliminateHoles = require('./eliminateHoles')
const { removeNode, sortLinked } = require('./linkedList')
const { cureLocalIntersections, filterPoints, isValidDiagonal, linkedPolygon, splitPolygon } = require('./linkedPolygon')
const { area, pointInTriangle } = require('./triangle')

/*
 * An implementation of the earcut polygon triangulation algorithm.
 *
 * Original source from https://github.com/mapbox/earcut
 * Copyright (c) 2016 Mapbox
 *
 * @param {data} A flat array of vertex coordinates.
 * @param {holeIndices} An array of hole indices if any.
 * @param {dim} The number of coordinates per vertex in the input array.
 */
const triangulate = (data, holeIndices, dim = 2) => {
  const hasHoles = holeIndices && holeIndices.length
  const outerLen = hasHoles ? holeIndices[0] * dim : data.length
  let outerNode = linkedPolygon(data, 0, outerLen, dim, true)
  const triangles = []

  if (!outerNode || outerNode.next === outerNode.prev) return triangles

  let minX, minY, maxX, maxY, invSize

  if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim)

  // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
  if (data.length > 80 * dim) {
    minX = maxX = data[0]
    minY = maxY = data[1]

    for (let i = dim; i < outerLen; i += dim) {
      const x = data[i]
      const y = data[i + 1]
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }

    // minX, minY and invSize are later used to transform coords into integers for z-order calculation
    invSize = Math.max(maxX - minX, maxY - minY)
    invSize = invSize !== 0 ? 1 / invSize : 0
  }

  earcutLinked(outerNode, triangles, dim, minX, minY, invSize)

  return triangles
}

/*
 * main ear slicing loop which triangulates a polygon (given as a linked list)
 */
const earcutLinked = (ear, triangles, dim, minX, minY, invSize, pass) => {
  if (!ear) return

  // interlink polygon nodes in z-order
  if (!pass && invSize) indexCurve(ear, minX, minY, invSize)

  let stop = ear
  let prev
  let next

  // iterate through ears, slicing them one by one
  while (ear.prev !== ear.next) {
    prev = ear.prev
    next = ear.next

    if (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear)) {
      // cut off the triangle
      triangles.push(prev.i / dim)
      triangles.push(ear.i / dim)
      triangles.push(next.i / dim)

      removeNode(ear)

      // skipping the next vertex leads to less sliver triangles
      ear = next.next
      stop = next.next

      continue
    }

    ear = next

    // if we looped through the whole remaining polygon and can't find any more ears
    if (ear === stop) {
      // try filtering points and slicing again
      if (!pass) {
        earcutLinked(filterPoints(ear), triangles, dim, minX, minY, invSize, 1)

        // if this didn't work, try curing all small self-intersections locally
      } else if (pass === 1) {
        ear = cureLocalIntersections(filterPoints(ear), triangles, dim)
        earcutLinked(ear, triangles, dim, minX, minY, invSize, 2)

        // as a last resort, try splitting the remaining polygon into two
      } else if (pass === 2) {
        splitEarcut(ear, triangles, dim, minX, minY, invSize)
      }

      break
    }
  }
}

/*
 * check whether a polygon node forms a valid ear with adjacent nodes
 */
const isEar = (ear) => {
  const a = ear.prev
  const b = ear
  const c = ear.next

  if (area(a, b, c) >= 0) return false // reflex, can't be an ear

  // now make sure we don't have other points inside the potential ear
  let p = ear.next.next

  while (p !== ear.prev) {
    if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) && area(p.prev, p, p.next) >= 0) {
      return false
    }
    p = p.next
  }

  return true
}

const isEarHashed = (ear, minX, minY, invSize) => {
  const a = ear.prev
  const b = ear
  const c = ear.next

  if (area(a, b, c) >= 0) return false // reflex, can't be an ear

  // triangle bbox; min & max are calculated like this for speed
  const minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x)
  const minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y)
  const maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x)
  const maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y)

  // z-order range for the current triangle bbox
  const minZ = zOrder(minTX, minTY, minX, minY, invSize)
  const maxZ = zOrder(maxTX, maxTY, minX, minY, invSize)

  let p = ear.prevZ
  let n = ear.nextZ

  // look for points inside the triangle in both directions
  while (p && p.z >= minZ && n && n.z <= maxZ) {
    if (p !== ear.prev && p !== ear.next &&
      pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
      area(p.prev, p, p.next) >= 0) return false
    p = p.prevZ

    if (n !== ear.prev && n !== ear.next &&
      pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
      area(n.prev, n, n.next) >= 0) return false
    n = n.nextZ
  }

  // look for remaining points in decreasing z-order
  while (p && p.z >= minZ) {
    if (p !== ear.prev && p !== ear.next &&
      pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
      area(p.prev, p, p.next) >= 0) return false
    p = p.prevZ
  }

  // look for remaining points in increasing z-order
  while (n && n.z <= maxZ) {
    if (n !== ear.prev && n !== ear.next &&
      pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, n.x, n.y) &&
      area(n.prev, n, n.next) >= 0) return false
    n = n.nextZ
  }

  return true
}

/*
 * try splitting polygon into two and triangulate them independently
 */
const splitEarcut = (start, triangles, dim, minX, minY, invSize) => {
  // look for a valid diagonal that divides the polygon into two
  let a = start
  do {
    let b = a.next.next
    while (b !== a.prev) {
      if (a.i !== b.i && isValidDiagonal(a, b)) {
        // split the polygon in two by the diagonal
        let c = splitPolygon(a, b)

        // filter colinear points around the cuts
        a = filterPoints(a, a.next)
        c = filterPoints(c, c.next)

        // run earcut on each half
        earcutLinked(a, triangles, dim, minX, minY, invSize)
        earcutLinked(c, triangles, dim, minX, minY, invSize)
        return
      }

      b = b.next
    }

    a = a.next
  } while (a !== start)
}

/*
 * interlink polygon nodes in z-order
 */
const indexCurve = (start, minX, minY, invSize) => {
  let p = start
  do {
    if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, invSize)
    p.prevZ = p.prev
    p.nextZ = p.next
    p = p.next
  } while (p !== start)

  p.prevZ.nextZ = null
  p.prevZ = null

  sortLinked(p, (p) => p.z)
}

/*
 * z-order of a point given coords and inverse of the longer side of data bbox
 */
const zOrder = (x, y, minX, minY, invSize) => {
  // coords are transformed into non-negative 15-bit integer range
  x = 32767 * (x - minX) * invSize
  y = 32767 * (y - minY) * invSize

  x = (x | (x << 8)) & 0x00FF00FF
  x = (x | (x << 4)) & 0x0F0F0F0F
  x = (x | (x << 2)) & 0x33333333
  x = (x | (x << 1)) & 0x55555555

  y = (y | (y << 8)) & 0x00FF00FF
  y = (y | (y << 4)) & 0x0F0F0F0F
  y = (y | (y << 2)) & 0x33333333
  y = (y | (y << 1)) & 0x55555555

  return x | (y << 1)
}

module.exports = triangulate

},{"./eliminateHoles":316,"./linkedList":318,"./linkedPolygon":320,"./triangle":322}],318:[function(require,module,exports){
const sortLinked = require('./linkedListSort')

class Node {
  constructor (i, x, y) {
    // vertex index in coordinates array
    this.i = i

    // vertex coordinates
    this.x = x
    this.y = y

    // previous and next vertex nodes in a polygon ring
    this.prev = null
    this.next = null

    // z-order curve value
    this.z = null

    // previous and next nodes in z-order
    this.prevZ = null
    this.nextZ = null

    // indicates whether this is a steiner point
    this.steiner = false
  }
}

/*
 * create a node and optionally link it with previous one (in a circular doubly linked list)
 */
const insertNode = (i, x, y, last) => {
  const p = new Node(i, x, y)

  if (!last) {
    p.prev = p
    p.next = p
  } else {
    p.next = last.next
    p.prev = last
    last.next.prev = p
    last.next = p
  }

  return p
}

/*
 * remove a node and join prev with next nodes
 */
const removeNode = (p) => {
  p.next.prev = p.prev
  p.prev.next = p.next

  if (p.prevZ) p.prevZ.nextZ = p.nextZ
  if (p.nextZ) p.nextZ.prevZ = p.prevZ
}

module.exports = { Node, insertNode, removeNode, sortLinked }

},{"./linkedListSort":319}],319:[function(require,module,exports){

// Simon Tatham's linked list merge sort algorithm
// https://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
const sortLinked = (list, fn) => {
  let i, p, q, e, numMerges
  let inSize = 1

  do {
    p = list
    list = null
    let tail = null
    numMerges = 0

    while (p) {
      numMerges++
      q = p
      let pSize = 0
      for (i = 0; i < inSize; i++) {
        pSize++
        q = q.nextZ
        if (!q) break
      }

      let qSize = inSize

      while (pSize > 0 || (qSize > 0 && q)) {
        if (pSize !== 0 && (qSize === 0 || !q || fn(p) <= fn(q))) {
          e = p
          p = p.nextZ
          pSize--
        } else {
          e = q
          q = q.nextZ
          qSize--
        }

        if (tail) tail.nextZ = e
        else list = e

        e.prevZ = tail
        tail = e
      }

      p = q
    }

    tail.nextZ = null
    inSize *= 2
  } while (numMerges > 1)

  return list
}

module.exports = sortLinked

},{}],320:[function(require,module,exports){
const { Node, insertNode, removeNode } = require('./linkedList')
const { area } = require('./triangle')

/*
 * create a circular doubly linked list from polygon points in the specified winding order
 */
const linkedPolygon = (data, start, end, dim, clockwise) => {
  let last

  if (clockwise === (signedArea(data, start, end, dim) > 0)) {
    for (let i = start; i < end; i += dim) {
      last = insertNode(i, data[i], data[i + 1], last)
    }
  } else {
    for (let i = end - dim; i >= start; i -= dim) {
      last = insertNode(i, data[i], data[i + 1], last)
    }
  }

  if (last && equals(last, last.next)) {
    removeNode(last)
    last = last.next
  }

  return last
}

/*
 * eliminate colinear or duplicate points
 */
const filterPoints = (start, end) => {
  if (!start) return start
  if (!end) end = start

  let p = start
  let again
  do {
    again = false

    if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
      removeNode(p)
      p = end = p.prev
      if (p === p.next) break
      again = true
    } else {
      p = p.next
    }
  } while (again || p !== end)

  return end
}

/*
 * go through all polygon nodes and cure small local self-intersections
 */
const cureLocalIntersections = (start, triangles, dim) => {
  let p = start
  do {
    const a = p.prev
    const b = p.next.next

    if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {
      triangles.push(a.i / dim)
      triangles.push(p.i / dim)
      triangles.push(b.i / dim)

      // remove two nodes involved
      removeNode(p)
      removeNode(p.next)

      p = start = b
    }

    p = p.next
  } while (p !== start)

  return filterPoints(p)
}

/*
 * check if a polygon diagonal intersects any polygon segments
 */
const intersectsPolygon = (a, b) => {
  let p = a
  do {
    if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
        intersects(p, p.next, a, b)) return true
    p = p.next
  } while (p !== a)

  return false
}

/*
 * check if a polygon diagonal is locally inside the polygon
 */
const locallyInside = (a, b) => area(a.prev, a, a.next) < 0
  ? area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0
  : area(a, b, a.prev) < 0 || area(a, a.next, b) < 0

/*
 * check if the middle point of a polygon diagonal is inside the polygon
 */
const middleInside = (a, b) => {
  let p = a
  let inside = false
  const px = (a.x + b.x) / 2
  const py = (a.y + b.y) / 2
  do {
    if (((p.y > py) !== (p.next.y > py)) && p.next.y !== p.y &&
        (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x)) { inside = !inside }
    p = p.next
  } while (p !== a)

  return inside
}

/*
 * link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two
 * if one belongs to the outer ring and another to a hole, it merges it into a single ring
 */
const splitPolygon = (a, b) => {
  const a2 = new Node(a.i, a.x, a.y)
  const b2 = new Node(b.i, b.x, b.y)
  const an = a.next
  const bp = b.prev

  a.next = b
  b.prev = a

  a2.next = an
  an.prev = a2

  b2.next = a2
  a2.prev = b2

  bp.next = b2
  b2.prev = bp

  return b2
}

/*
 * check if a diagonal between two polygon nodes is valid (lies in polygon interior)
 */
const isValidDiagonal = (a, b) => a.next.i !== b.i &&
    a.prev.i !== b.i &&
    !intersectsPolygon(a, b) && // doesn't intersect other edges
    (
      locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b) && // locally visible
        (area(a.prev, a, b.prev) || area(a, b.prev, b)) || // does not create opposite-facing sectors
        equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0
    )

/*
 * check if two segments intersect
 */
const intersects = (p1, q1, p2, q2) => {
  const o1 = Math.sign(area(p1, q1, p2))
  const o2 = Math.sign(area(p1, q1, q2))
  const o3 = Math.sign(area(p2, q2, p1))
  const o4 = Math.sign(area(p2, q2, q1))

  if (o1 !== o2 && o3 !== o4) return true // general case

  if (o1 === 0 && onSegment(p1, p2, q1)) return true // p1, q1 and p2 are colinear and p2 lies on p1q1
  if (o2 === 0 && onSegment(p1, q2, q1)) return true // p1, q1 and q2 are colinear and q2 lies on p1q1
  if (o3 === 0 && onSegment(p2, p1, q2)) return true // p2, q2 and p1 are colinear and p1 lies on p2q2
  if (o4 === 0 && onSegment(p2, q1, q2)) return true // p2, q2 and q1 are colinear and q1 lies on p2q2

  return false
}

/*
 * for colinear points p, q, r, check if point q lies on segment pr
 */
const onSegment = (p, q, r) => q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)

const signedArea = (data, start, end, dim) => {
  let sum = 0
  for (let i = start, j = end - dim; i < end; i += dim) {
    sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1])
    j = i
  }

  return sum
}

/*
 * check if two points are equal
 */
const equals = (p1, p2) => p1.x === p2.x && p1.y === p2.y

module.exports = { cureLocalIntersections, filterPoints, isValidDiagonal, linkedPolygon, locallyInside, splitPolygon }

},{"./linkedList":318,"./triangle":322}],321:[function(require,module,exports){
const geom2 = require('../../../geometries/geom2')
const plane = require('../../../maths/plane')
const vec2 = require('../../../maths/vec2')
const vec3 = require('../../../maths/vec3')
const calculatePlane = require('../slice/calculatePlane')
const assignHoles = require('./assignHoles')

/*
 * Constructs a polygon hierarchy which associates holes with their outer solids.
 * This class maps a 3D polygon onto a 2D space using an orthonormal basis.
 * It tracks the mapping so that points can be reversed back to 3D losslessly.
 */
class PolygonHierarchy {
  constructor (slice) {
    this.plane = calculatePlane(slice)

    // create an orthonormal basis
    // choose an arbitrary right hand vector, making sure it is somewhat orthogonal to the plane normal
    const rightvector = vec3.orthogonal(vec3.create(), this.plane)
    const perp = vec3.cross(vec3.create(), this.plane, rightvector)
    this.v = vec3.normalize(perp, perp)
    this.u = vec3.cross(vec3.create(), this.v, this.plane)

    // map from 2D to original 3D points
    this.basisMap = new Map()

    // project slice onto 2D plane
    const projected = slice.edges.map((e) => e.map((v) => this.to2D(v)))

    // compute polygon hierarchies, assign holes to solids
    const geometry = geom2.create(projected)
    this.roots = assignHoles(geometry)
  }

  /*
   * project a 3D point onto the 2D plane
   */
  to2D (vector3) {
    const vector2 = vec2.fromValues(vec3.dot(vector3, this.u), vec3.dot(vector3, this.v))
    this.basisMap.set(vector2, vector3)
    return vector2
  }

  /*
   * un-project a 2D point back into 3D
   */
  to3D (vector2) {
    // use a map to get the original 3D, no floating point error
    const original = this.basisMap.get(vector2)
    if (original) {
      return original
    } else {
      console.log('Warning: point not in original slice')
      const v1 = vec3.scale(vec3.create(), this.u, vector2[0])
      const v2 = vec3.scale(vec3.create(), this.v, vector2[1])

      const planeOrigin = vec3.scale(vec3.create(), plane, plane[3])
      const v3 = vec3.add(v1, v1, planeOrigin)
      return vec3.add(v2, v2, v3)
    }
  }
}

module.exports = PolygonHierarchy

},{"../../../geometries/geom2":42,"../../../maths/plane":178,"../../../maths/vec2":206,"../../../maths/vec3":237,"../slice/calculatePlane":335,"./assignHoles":315}],322:[function(require,module,exports){

/*
 * check if a point lies within a convex triangle
 */
const pointInTriangle = (ax, ay, bx, by, cx, cy, px, py) => (
  (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
      (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
      (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0
)

/*
 * signed area of a triangle
 */
const area = (p, q, r) => (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)

module.exports = { area, pointInTriangle }

},{}],323:[function(require,module,exports){
const mat4 = require('../../maths/mat4')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

const slice = require('./slice')
const repairSlice = require('./slice/repair')

const extrudeWalls = require('./extrudeWalls')

const defaultCallback = (progress, index, base) => {
  let baseSlice = null
  if (geom2.isA(base)) baseSlice = slice.fromSides(geom2.toSides(base))
  if (poly3.isA(base)) baseSlice = slice.fromPoints(poly3.toPoints(base))

  return progress === 0 || progress === 1 ? slice.transform(mat4.fromTranslation(mat4.create(), [0, 0, progress]), baseSlice) : null
}

/**
 * Extrude a solid from the slices as returned by the callback function.
 * @see slice
 *
 * @param {Object} options - options for extrude
 * @param {Integer} [options.numberOfSlices=2] the number of slices to be generated by the callback
 * @param {Boolean} [options.capStart=true] the solid should have a cap at the start
 * @param {Boolean} [options.capEnd=true] the solid should have a cap at the end
 * @param {Boolean} [options.close=false] the solid should have a closing section between start and end
 * @param {Boolean} [options.repair=true] - repair gaps in the geometry
 * @param {Function} [options.callback] the callback function that generates each slice
 * @param {Object} base - the base object which is used to create slices (see the example for callback information)
 * @return {geom3} the extruded shape
 * @alias module:modeling/extrusions.extrudeFromSlices
 *
 * @example
 * // Parameters:
 * //   progress : the percent complete [0..1]
 * //   index : the index of the current slice [0..numberOfSlices - 1]
 * //   base : the base object as given
 * // Return Value:
 * //   slice or null (to skip)
 * const callback = (progress, index, base) => {
 *   ...
 *   return slice
 * }
 */
const extrudeFromSlices = (options, base) => {
  const defaults = {
    numberOfSlices: 2,
    capStart: true,
    capEnd: true,
    close: false,
    repair: true,
    callback: defaultCallback
  }
  const { numberOfSlices, capStart, capEnd, close, repair, callback: generate } = Object.assign({ }, defaults, options)

  if (numberOfSlices < 2) throw new Error('numberOfSlices must be 2 or more')

  // Repair gaps in the base slice
  if (repair) {
    // note: base must be a slice, if base is geom2 this doesn't repair
    base = repairSlice(base)
  }

  const sMax = numberOfSlices - 1

  let startSlice = null
  let endSlice = null
  let prevSlice = null
  let polygons = []
  for (let s = 0; s < numberOfSlices; s++) {
    // invoke the callback function to get the next slice
    // NOTE: callback can return null to skip the slice
    const currentSlice = generate(s / sMax, s, base)

    if (currentSlice) {
      if (!slice.isA(currentSlice)) throw new Error('the callback function must return slice objects')

      const edges = slice.toEdges(currentSlice)
      if (edges.length === 0) throw new Error('the callback function must return slices with one or more edges')

      if (prevSlice) {
        polygons = polygons.concat(extrudeWalls(prevSlice, currentSlice))
      }

      // save start and end slices for caps if necessary
      if (s === 0) startSlice = currentSlice
      if (s === (numberOfSlices - 1)) endSlice = currentSlice

      prevSlice = currentSlice
    }
  }

  if (capEnd) {
    // create a cap at the end
    const endPolygons = slice.toPolygons(endSlice)
    polygons = polygons.concat(endPolygons)
  }
  if (capStart) {
    // create a cap at the start
    const startPolygons = slice.toPolygons(startSlice).map(poly3.invert)
    polygons = polygons.concat(startPolygons)
  }
  if (!capStart && !capEnd) {
    // create walls between end and start slices
    if (close && !slice.equals(endSlice, startSlice)) {
      polygons = polygons.concat(extrudeWalls(endSlice, startSlice))
    }
  }
  return geom3.create(polygons)
}

module.exports = extrudeFromSlices

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/mat4":159,"./extrudeWalls":332,"./slice":341,"./slice/repair":343}],324:[function(require,module,exports){
const { TAU } = require('../../maths/constants')
const slice = require('./slice')
const mat4 = require('../../maths/mat4')
const extrudeFromSlices = require('./extrudeFromSlices')
const geom2 = require('../../geometries/geom2')

/**
 * Perform a helical extrude of the geometry, using the given options.
 *
 * @param {Object} options - options for extrusion
 * @param {Number} [options.angle=TAU] - angle of the extrusion (RADIANS) positive for right-hand rotation, negative for left-hand
 * @param {Number} [options.startAngle=0] - start angle of the extrusion (RADIANS)
 * @param {Number} [options.pitch=10] - elevation gain for each turn
 * @param {Number} [options.height] - total height of the helix path. Ignored if pitch is set.
 * @param {Number} [options.endOffset=0] - offset the final radius of the extrusion, allowing for tapered helix, and or spiral
 * @param {Number} [options.segmentsPerRotation=32] - number of segments per full rotation of the extrusion
 * @param {geom2} geometry - the geometry to extrude
 * @returns {geom3} the extruded geometry
 * @alias module:modeling/extrusions.extrudeHelical
 *
 * @example
 * const myshape = extrudeHelical(
 *  {
 *      angle: Math.PI * 4,
 *      pitch: 10,
 *      segmentsPerRotation: 64
 *  },
 *  circle({size: 3, center: [10, 0]})
 * )
 */
const extrudeHelical = (options, geometry) => {
  const defaults = {
    angle: TAU,
    startAngle: 0,
    pitch: 10,
    endOffset: 0,
    segmentsPerRotation: 32
  }
  const { angle, endOffset, segmentsPerRotation, startAngle } = Object.assign({}, defaults, options)

  let pitch
  // ignore height if pitch is set
  if (!options.pitch && options.height) {
    pitch = options.height / (angle / TAU)
  } else {
    pitch = options.pitch ? options.pitch : defaults.pitch
  }

  // needs at least 3 segments for each revolution
  const minNumberOfSegments = 3

  if (segmentsPerRotation < minNumberOfSegments) { throw new Error('The number of segments per rotation needs to be at least 3.') }

  const shapeSides = geom2.toSides(geometry)
  if (shapeSides.length === 0) throw new Error('the given geometry cannot be empty')

  // const pointsWithNegativeX = shapeSides.filter((s) => (s[0][0] < 0))
  const pointsWithPositiveX = shapeSides.filter((s) => (s[0][0] >= 0))

  let baseSlice = slice.fromSides(shapeSides)

  if (pointsWithPositiveX.length === 0) {
    // only points in negative x plane, reverse
    baseSlice = slice.reverse(baseSlice)
  }

  const calculatedSegments = Math.round(segmentsPerRotation / TAU * Math.abs(angle))
  const segments = calculatedSegments >= 2 ? calculatedSegments : 2
  // define transform matrix variables for performance increase
  const step1 = mat4.create()
  let matrix
  const sliceCallback = (progress, index, base) => {
    const zRotation = startAngle + angle / segments * index
    const xOffset = endOffset / segments * index
    const zOffset = (zRotation - startAngle) / TAU * pitch

    // TODO: check for valid geometry after translations
    // ie all the points have to be either x > -xOffset or x < -xOffset
    // this would have to be checked for every transform, and handled
    //
    // not implementing, as this currently doesn't break anything,
    // only creates inside-out polygons

    // create transformation matrix
    mat4.multiply(
      step1,
      // then apply offsets
      mat4.fromTranslation(mat4.create(), [xOffset, 0, zOffset * Math.sign(angle)]),
      // first rotate "flat" 2D shape from XY to XZ plane
      mat4.fromXRotation(mat4.create(), -TAU / 4 * Math.sign(angle)) // rotate the slice correctly to not create inside-out polygon
    )

    matrix = mat4.create()
    mat4.multiply(
      matrix,
      // finally rotate around Z axis
      mat4.fromZRotation(mat4.create(), zRotation),
      step1
    )
    return slice.transform(matrix, base)
  }

  return extrudeFromSlices(
    {
      // "base" slice is counted as segment, so add one for complete final rotation
      numberOfSlices: segments + 1,
      callback: sliceCallback
    },
    baseSlice
  )
}

module.exports = extrudeHelical

},{"../../geometries/geom2":42,"../../maths/constants":110,"../../maths/mat4":159,"./extrudeFromSlices":323,"./slice":341}],325:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const extrudeLinearGeom2 = require('./extrudeLinearGeom2')
const extrudeLinearPath2 = require('./extrudeLinearPath2')

/**
 * Extrude the given geometry in an upward linear direction using the given options.
 * Accepts path2 or geom2 objects as input. Paths must be closed.
 *
 * @param {Object} options - options for extrude
 * @param {Number} [options.height=1] the height of the extrusion
 * @param {Number} [options.twistAngle=0] the final rotation (RADIANS) about the origin of the shape (if any)
 * @param {Integer} [options.twistSteps=1] the resolution of the twist about the axis (if any)
 * @param {...Object} objects - the geometries to extrude
 * @return {Object|Array} the extruded geometry, or a list of extruded geometry
 * @alias module:modeling/extrusions.extrudeLinear
 *
 * @example
 * let myshape = extrudeLinear({height: 10}, rectangle({size: [20, 25]}))
 */
const extrudeLinear = (options, ...objects) => {
  const defaults = {
    height: 1,
    twistAngle: 0,
    twistSteps: 1,
    repair: true
  }
  const { height, twistAngle, twistSteps, repair } = Object.assign({ }, defaults, options)

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  options = { offset: [0, 0, height], twistAngle, twistSteps, repair }

  const results = objects.map((object) => {
    if (path2.isA(object)) return extrudeLinearPath2(options, object)
    if (geom2.isA(object)) return extrudeLinearGeom2(options, object)
    // if (geom3.isA(object)) return geom3.extrude(options, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = extrudeLinear

},{"../../geometries/geom2":42,"../../geometries/path2":78,"../../utils/flatten":412,"./extrudeLinearGeom2":326,"./extrudeLinearPath2":327}],326:[function(require,module,exports){
const mat4 = require('../../maths/mat4')
const vec3 = require('../../maths/vec3')

const geom2 = require('../../geometries/geom2')

const slice = require('./slice')

const extrudeFromSlices = require('./extrudeFromSlices')

/*
 * Extrude the given geometry using the given options.
 *
 * @param {Object} [options] - options for extrude
 * @param {Array} [options.offset] - the direction of the extrusion as a 3D vector
 * @param {Number} [options.twistAngle] - the final rotation (RADIANS) about the origin
 * @param {Integer} [options.twistSteps] - the number of steps created to produce the twist (if any)
 * @param {Boolean} [options.repair] - repair gaps in the geometry
 * @param {geom2} geometry - the geometry to extrude
 * @returns {geom3} the extruded 3D geometry
*/
const extrudeGeom2 = (options, geometry) => {
  const defaults = {
    offset: [0, 0, 1],
    twistAngle: 0,
    twistSteps: 12,
    repair: true
  }
  let { offset, twistAngle, twistSteps, repair } = Object.assign({ }, defaults, options)

  if (twistSteps < 1) throw new Error('twistSteps must be 1 or more')

  if (twistAngle === 0) {
    twistSteps = 1
  }

  // convert to vector in order to perform transforms
  const offsetv = vec3.clone(offset)

  const baseSides = geom2.toSides(geometry)
  if (baseSides.length === 0) throw new Error('the given geometry cannot be empty')

  const baseSlice = slice.fromSides(baseSides)
  if (offsetv[2] < 0) slice.reverse(baseSlice, baseSlice)

  const matrix = mat4.create()
  const createTwist = (progress, index, base) => {
    const Zrotation = index / twistSteps * twistAngle
    const Zoffset = vec3.scale(vec3.create(), offsetv, index / twistSteps)
    mat4.multiply(matrix, mat4.fromZRotation(matrix, Zrotation), mat4.fromTranslation(mat4.create(), Zoffset))

    return slice.transform(matrix, base)
  }

  options = {
    numberOfSlices: twistSteps + 1,
    capStart: true,
    capEnd: true,
    repair,
    callback: createTwist
  }
  return extrudeFromSlices(options, baseSlice)
}

module.exports = extrudeGeom2

},{"../../geometries/geom2":42,"../../maths/mat4":159,"../../maths/vec3":237,"./extrudeFromSlices":323,"./slice":341}],327:[function(require,module,exports){
const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const extrudeLinearGeom2 = require('./extrudeLinearGeom2')

/*
 * Extrude the given geometry using the given options.
 *
 * @param {Object} [options] - options for extrude
 * @param {Array} [options.offset] - the direction of the extrusion as a 3D vector
 * @param {Number} [options.twistAngle] - the final rotation (RADIANS) about the origin
 * @param {Integer} [options.twistSteps] - the number of steps created to produce the twist (if any)
 * @param {path2} geometry - the geometry to extrude
 * @returns {geom3} the extruded 3D geometry
*/
const extrudePath2 = (options, geometry) => {
  if (!geometry.isClosed) throw new Error('extruded path must be closed')
  // Convert path2 to geom2
  const points = path2.toPoints(geometry)
  const geometry2 = geom2.fromPoints(points)
  return extrudeLinearGeom2(options, geometry2)
}

module.exports = extrudePath2

},{"../../geometries/geom2":42,"../../geometries/path2":78,"./extrudeLinearGeom2":326}],328:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const extrudeRectangularPath2 = require('./extrudeRectangularPath2')
const extrudeRectangularGeom2 = require('./extrudeRectangularGeom2')

/**
 * Extrude the given geometry by following the outline(s) with a rectangle.
 * @See expand for addition options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {...Object} objects - the geometries to extrude
 * @return {Object|Array} the extruded object, or a list of extruded objects
 * @alias module:modeling/extrusions.extrudeRectangular
 *
 * @example
 * let mywalls = extrudeRectangular({size: 1, height: 3}, square({size: 20}))
 * let mywalls = extrudeRectangular({size: 1, height: 300, twistAngle: TAU / 2}, square({size: 20}))
 */
const extrudeRectangular = (options, ...objects) => {
  const defaults = {
    size: 1,
    height: 1
  }
  const { size, height } = Object.assign({}, defaults, options)

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  if (size <= 0) throw new Error('size must be positive')
  if (height <= 0) throw new Error('height must be positive')

  const results = objects.map((object) => {
    if (path2.isA(object)) return extrudeRectangularPath2(options, object)
    if (geom2.isA(object)) return extrudeRectangularGeom2(options, object)
    // if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = extrudeRectangular

},{"../../geometries/geom2":42,"../../geometries/path2":78,"../../utils/flatten":412,"./extrudeRectangularGeom2":329,"./extrudeRectangularPath2":330}],329:[function(require,module,exports){
const { area } = require('../../maths/utils')

const geom2 = require('../../geometries/geom2')
const path2 = require('../../geometries/path2')

const expand = require('../expansions/expand')

const extrudeLinearGeom2 = require('./extrudeLinearGeom2')

/*
 * Expand and extrude the given geometry (geom2).
 * @see expand for additional options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {geom2} geometry - the geometry to extrude
 * @return {geom3} the extruded geometry
 */
const extrudeRectangularGeom2 = (options, geometry) => {
  const defaults = {
    size: 1,
    height: 1
  }
  const { size, height } = Object.assign({ }, defaults, options)

  options.delta = size
  options.offset = [0, 0, height]

  // convert the geometry to outlines
  const outlines = geom2.toOutlines(geometry)
  if (outlines.length === 0) throw new Error('the given geometry cannot be empty')

  // expand the outlines
  const newparts = outlines.map((outline) => {
    if (area(outline) < 0) outline.reverse() // all outlines must wind counter clockwise
    return expand(options, path2.fromPoints({ closed: true }, outline))
  })

  // create a composite geometry
  const allsides = newparts.reduce((sides, part) => sides.concat(geom2.toSides(part)), [])
  const newgeometry = geom2.create(allsides)

  return extrudeLinearGeom2(options, newgeometry)
}

module.exports = extrudeRectangularGeom2

},{"../../geometries/geom2":42,"../../geometries/path2":78,"../../maths/utils":184,"../expansions/expand":304,"./extrudeLinearGeom2":326}],330:[function(require,module,exports){
const path2 = require('../../geometries/path2')

const expand = require('../expansions/expand')

const extrudeLinearGeom2 = require('./extrudeLinearGeom2')

/*
 * Expand and extrude the given geometry (path2).
 * @See expand for addition options
 * @param {Object} options - options for extrusion, if any
 * @param {Number} [options.size=1] - size of the rectangle
 * @param {Number} [options.height=1] - height of the extrusion
 * @param {path2} geometry - the geometry to extrude
 * @return {geom3} the extruded geometry
 */
const extrudeRectangularPath2 = (options, geometry) => {
  const defaults = {
    size: 1,
    height: 1
  }
  const { size, height } = Object.assign({ }, defaults, options)

  options.delta = size
  options.offset = [0, 0, height]

  const points = path2.toPoints(geometry)
  if (points.length === 0) throw new Error('the given geometry cannot be empty')

  const newgeometry = expand(options, geometry)
  return extrudeLinearGeom2(options, newgeometry)
}

module.exports = extrudeRectangularPath2

},{"../../geometries/path2":78,"../expansions/expand":304,"./extrudeLinearGeom2":326}],331:[function(require,module,exports){
const { TAU } = require('../../maths/constants')
const mat4 = require('../../maths/mat4')

const { mirrorX } = require('../transforms/mirror')

const geom2 = require('../../geometries/geom2')

const slice = require('./slice')

const extrudeFromSlices = require('./extrudeFromSlices')

/**
 * Rotate extrude the given geometry using the given options.
 *
 * @param {Object} options - options for extrusion
 * @param {Number} [options.angle=TAU] - angle of the extrusion (RADIANS)
 * @param {Number} [options.startAngle=0] - start angle of the extrusion (RADIANS)
 * @param {String} [options.overflow='cap'] - what to do with points outside of bounds (+ / - x) :
 * defaults to capping those points to 0 (only supported behaviour for now)
 * @param {Number} [options.segments=12] - number of segments of the extrusion
 * @param {geom2} geometry - the geometry to extrude
 * @returns {geom3} the extruded geometry
 * @alias module:modeling/extrusions.extrudeRotate
 *
 * @example
 * const myshape = extrudeRotate({segments: 8, angle: TAU / 2}, circle({size: 3, center: [4, 0]}))
 */
const extrudeRotate = (options, geometry) => {
  const defaults = {
    segments: 12,
    startAngle: 0,
    angle: TAU,
    overflow: 'cap'
  }
  let { segments, startAngle, angle, overflow } = Object.assign({}, defaults, options)

  if (segments < 3) throw new Error('segments must be greater then 3')

  startAngle = Math.abs(startAngle) > TAU ? startAngle % TAU : startAngle
  angle = Math.abs(angle) > TAU ? angle % TAU : angle

  let endAngle = startAngle + angle
  endAngle = Math.abs(endAngle) > TAU ? endAngle % TAU : endAngle

  if (endAngle < startAngle) {
    const x = startAngle
    startAngle = endAngle
    endAngle = x
  }
  let totalRotation = endAngle - startAngle
  if (totalRotation <= 0.0) totalRotation = TAU

  if (Math.abs(totalRotation) < TAU) {
    // adjust the segments to achieve the total rotation requested
    const anglePerSegment = TAU / segments
    segments = Math.floor(Math.abs(totalRotation) / anglePerSegment)
    if (Math.abs(totalRotation) > (segments * anglePerSegment)) segments++
  }

  // console.log('startAngle: '+startAngle)
  // console.log('endAngle: '+endAngle)
  // console.log(totalRotation)
  // console.log(segments)

  // convert geometry to an array of sides, easier to deal with
  let shapeSides = geom2.toSides(geometry)
  if (shapeSides.length === 0) throw new Error('the given geometry cannot be empty')

  // determine if the rotate extrude can be computed in the first place
  // ie all the points have to be either x > 0 or x < 0

  // generic solution to always have a valid solid, even if points go beyond x/ -x
  // 1. split points up between all those on the 'left' side of the axis (x<0) & those on the 'righ' (x>0)
  // 2. for each set of points do the extrusion operation IN OPOSITE DIRECTIONS
  // 3. union the two resulting solids

  // 1. alt : OR : just cap of points at the axis ?

  const pointsWithNegativeX = shapeSides.filter((s) => (s[0][0] < 0))
  const pointsWithPositiveX = shapeSides.filter((s) => (s[0][0] >= 0))
  const arePointsWithNegAndPosX = pointsWithNegativeX.length > 0 && pointsWithPositiveX.length > 0

  // FIXME actually there are cases where setting X=0 will change the basic shape
  // - Alternative #1 : don't allow shapes with both negative and positive X values
  // - Alternative #2 : remove one half of the shape (costly)
  if (arePointsWithNegAndPosX && overflow === 'cap') {
    if (pointsWithNegativeX.length > pointsWithPositiveX.length) {
      shapeSides = shapeSides.map((side) => {
        let point0 = side[0]
        let point1 = side[1]
        point0 = [Math.min(point0[0], 0), point0[1]]
        point1 = [Math.min(point1[0], 0), point1[1]]
        return [point0, point1]
      })
      // recreate the geometry from the (-) capped points
      geometry = geom2.reverse(geom2.create(shapeSides))
      geometry = mirrorX(geometry)
    } else if (pointsWithPositiveX.length >= pointsWithNegativeX.length) {
      shapeSides = shapeSides.map((side) => {
        let point0 = side[0]
        let point1 = side[1]
        point0 = [Math.max(point0[0], 0), point0[1]]
        point1 = [Math.max(point1[0], 0), point1[1]]
        return [point0, point1]
      })
      // recreate the geometry from the (+) capped points
      geometry = geom2.create(shapeSides)
    }
  }

  const rotationPerSlice = totalRotation / segments
  const isCapped = Math.abs(totalRotation) < TAU
  const baseSlice = slice.fromSides(geom2.toSides(geometry))
  slice.reverse(baseSlice, baseSlice)

  const matrix = mat4.create()
  const createSlice = (progress, index, base) => {
    let Zrotation = rotationPerSlice * index + startAngle
    // fix rounding error when rotating TAU radians
    if (totalRotation === TAU && index === segments) {
      Zrotation = startAngle
    }
    mat4.multiply(matrix, mat4.fromZRotation(matrix, Zrotation), mat4.fromXRotation(mat4.create(), TAU / 4))

    return slice.transform(matrix, base)
  }

  options = {
    numberOfSlices: segments + 1,
    capStart: isCapped,
    capEnd: isCapped,
    close: !isCapped,
    callback: createSlice
  }
  return extrudeFromSlices(options, baseSlice)
}

module.exports = extrudeRotate

},{"../../geometries/geom2":42,"../../maths/constants":110,"../../maths/mat4":159,"../transforms/mirror":377,"./extrudeFromSlices":323,"./slice":341}],332:[function(require,module,exports){
const { EPS } = require('../../maths/constants')
const vec3 = require('../../maths/vec3')

const poly3 = require('../../geometries/poly3')

const slice = require('./slice')

// https://en.wikipedia.org/wiki/Greatest_common_divisor#Using_Euclid's_algorithm
const gcd = (a, b) => {
  if (a === b) { return a }
  if (a < b) { return gcd(b, a) }
  if (b === 1) { return 1 }
  if (b === 0) { return a }
  return gcd(b, a % b)
}

const lcm = (a, b) => (a * b) / gcd(a, b)

// Return a set of edges that encloses the same area by splitting
// the given edges to have newlength total edges.
const repartitionEdges = (newlength, edges) => {
  // NOTE: This implementation splits each edge evenly.
  const multiple = newlength / edges.length
  if (multiple === 1) {
    return edges
  }

  const divisor = vec3.fromValues(multiple, multiple, multiple)

  const newEdges = []
  edges.forEach((edge) => {
    const increment = vec3.subtract(vec3.create(), edge[1], edge[0])
    vec3.divide(increment, increment, divisor)

    // repartition the edge
    let prev = edge[0]
    for (let i = 1; i <= multiple; ++i) {
      const next = vec3.add(vec3.create(), prev, increment)
      newEdges.push([prev, next])
      prev = next
    }
  })
  return newEdges
}

const EPSAREA = (EPS * EPS / 2) * Math.sin(Math.PI / 3)

/*
 * Extrude (build) walls between the given slices.
 * Each wall consists of two triangles, which may be invalid if slices are overlapping.
 */
const extrudeWalls = (slice0, slice1) => {
  let edges0 = slice.toEdges(slice0)
  let edges1 = slice.toEdges(slice1)

  if (edges0.length !== edges1.length) {
    // different shapes, so adjust one or both to the same number of edges
    const newlength = lcm(edges0.length, edges1.length)
    if (newlength !== edges0.length) edges0 = repartitionEdges(newlength, edges0)
    if (newlength !== edges1.length) edges1 = repartitionEdges(newlength, edges1)
  }

  const walls = []
  edges0.forEach((edge0, i) => {
    const edge1 = edges1[i]

    const poly0 = poly3.create([edge0[0], edge0[1], edge1[1]])
    const poly0area = poly3.measureArea(poly0)
    if (Number.isFinite(poly0area) && poly0area > EPSAREA) walls.push(poly0)

    const poly1 = poly3.create([edge0[0], edge1[1], edge1[0]])
    const poly1area = poly3.measureArea(poly1)
    if (Number.isFinite(poly1area) && poly1area > EPSAREA) walls.push(poly1)
  })
  return walls
}

module.exports = extrudeWalls

},{"../../geometries/poly3":95,"../../maths/constants":110,"../../maths/vec3":237,"./slice":341}],333:[function(require,module,exports){
/**
 * All 2D shapes (primitives or the results of operations) can be extruded in various ways.
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/extrusions
 * @example
 * const { extrudeLinear, extrudeRectangular, extrudeRotate } = require('@jscad/modeling').extrusions
 */
module.exports = {
  extrudeFromSlices: require('./extrudeFromSlices'),
  extrudeLinear: require('./extrudeLinear'),
  extrudeRectangular: require('./extrudeRectangular'),
  extrudeRotate: require('./extrudeRotate'),
  extrudeHelical: require('./extrudeHelical'),
  project: require('./project'),
  slice: require('./slice')
}

},{"./extrudeFromSlices":323,"./extrudeHelical":324,"./extrudeLinear":325,"./extrudeRectangular":328,"./extrudeRotate":331,"./project":334,"./slice":341}],334:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const aboutEqualNormals = require('../../maths/utils/aboutEqualNormals')
const plane = require('../../maths/plane')
const mat4 = require('../../maths/mat4')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

const measureEpsilon = require('../../measurements/measureEpsilon')

const unionGeom2 = require('../booleans/unionGeom2')

const projectGeom3 = (options, geometry) => {
  // create a plane from the options, and verify
  const projplane = plane.fromNormalAndPoint(plane.create(), options.axis, options.origin)
  if (Number.isNaN(projplane[0]) || Number.isNaN(projplane[1]) || Number.isNaN(projplane[2]) || Number.isNaN(projplane[3])) {
    throw new Error('project: invalid axis or origin')
  }

  const epsilon = measureEpsilon(geometry)
  const epsilonArea = (epsilon * epsilon * Math.sqrt(3) / 4)

  if (epsilon === 0) return geom2.create()

  // project the polygons to the plane
  const polygons = geom3.toPolygons(geometry)
  let projpolys = []
  for (let i = 0; i < polygons.length; i++) {
    const newpoints = polygons[i].vertices.map((v) => plane.projectionOfPoint(projplane, v))
    const newpoly = poly3.create(newpoints)
    // only keep projections that face the same direction as the plane
    const newplane = poly3.plane(newpoly)
    if (!aboutEqualNormals(projplane, newplane)) continue
    // only keep projections that have a measurable area
    if (poly3.measureArea(newpoly) < epsilonArea) continue
    projpolys.push(newpoly)
  }

  // rotate the polygons to lay on X/Y axes if necessary
  if (!aboutEqualNormals(projplane, [0, 0, 1])) {
    const rotation = mat4.fromVectorRotation(mat4.create(), projplane, [0, 0, 1])
    projpolys = projpolys.map((p) => poly3.transform(rotation, p))
  }

  // sort the polygons to allow the union to ignore small pieces efficiently
  projpolys = projpolys.sort((a, b) => poly3.measureArea(b) - poly3.measureArea(a))

  // convert polygons to geometry, and union all pieces into a single geometry
  const projgeoms = projpolys.map((p) => geom2.fromPoints(p.vertices))
  return unionGeom2(projgeoms)
}

/**
 * Project the given 3D geometry on to the given plane.
 * @param {Object} options - options for project
 * @param {Array} [options.axis=[0,0,1]] the axis of the plane (default is Z axis)
 * @param {Array} [options.origin=[0,0,0]] the origin of the plane
 * @param {...Object} objects - the list of 3D geometry to project
 * @return {geom2|Array} the projected 2D geometry, or a list of 2D projected geometry
 * @alias module:modeling/extrusions.project
 *
 * @example
 * let myshape = project({}, sphere({radius: 20, segments: 5}))
 */
const project = (options, ...objects) => {
  const defaults = {
    axis: [0, 0, 1], // Z axis
    origin: [0, 0, 0]
  }
  const { axis, origin } = Object.assign({ }, defaults, options)

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  options = { axis, origin }

  const results = objects.map((object) => {
    // if (path.isA(object)) return project(options, object)
    // if (geom2.isA(object)) return project(options, object)
    if (geom3.isA(object)) return projectGeom3(options, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = project

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/mat4":159,"../../maths/plane":178,"../../maths/utils/aboutEqualNormals":182,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"../booleans/unionGeom2":301}],335:[function(require,module,exports){
const plane = require('../../../maths/plane')
const vec3 = require('../../../maths/vec3')

/**
 * Calculate the plane of the given slice.
 * NOTE: The slice (and all points) are assumed to be planar from the beginning.
 * @param {slice} slice - the slice
 * @returns {plane} the plane of the slice
 * @alias module:modeling/extrusions/slice.calculatePlane
 *
 * @example
 * let myplane = calculatePlane(slice)
 */
const calculatePlane = (slice) => {
  const edges = slice.edges
  if (edges.length < 3) throw new Error('slices must have 3 or more edges to calculate a plane')

  // find the midpoint of the slice, which will lie on the plane by definition
  const midpoint = edges.reduce((point, edge) => vec3.add(vec3.create(), point, edge[0]), vec3.create())
  vec3.scale(midpoint, midpoint, 1 / edges.length)

  // find the farthest edge from the midpoint, which will be on an outside edge
  let farthestEdge
  let distance = 0
  edges.forEach((edge) => {
    // Make sure that the farthest edge is not a self-edge
    if (!vec3.equals(edge[0], edge[1])) {
      const d = vec3.squaredDistance(midpoint, edge[0])
      if (d > distance) {
        farthestEdge = edge
        distance = d
      }
    }
  })
  // find the before edge
  const beforeEdge = edges.find((edge) => vec3.equals(edge[1], farthestEdge[0]))

  return plane.fromPoints(plane.create(), beforeEdge[0], farthestEdge[0], farthestEdge[1])
}

module.exports = calculatePlane

},{"../../../maths/plane":178,"../../../maths/vec3":237}],336:[function(require,module,exports){
const create = require('./create')

const vec3 = require('../../../maths/vec3')

/**
 * Create a deep clone of the given slice.
 *
 * @param {slice} [out] - receiving slice
 * @param {slice} slice - slice to clone
 * @returns {slice} a new slice
 * @alias module:modeling/extrusions/slice.clone
 */
const clone = (...params) => {
  let out
  let slice
  if (params.length === 1) {
    out = create()
    slice = params[0]
  } else {
    out = params[0]
    slice = params[1]
  }
  // deep clone of edges
  out.edges = slice.edges.map((edge) => [vec3.clone(edge[0]), vec3.clone(edge[1])])
  return out
}

module.exports = clone

},{"../../../maths/vec3":237,"./create":337}],337:[function(require,module,exports){
/**
 * Represents a 3D geometry consisting of a list of edges.
 * @typedef {Object} slice
 * @property {Array} edges - list of edges, each edge containing two points (3D)
 */

/**
 * Creates a new empty slice.
 *
 * @returns {slice} a new slice
 * @alias module:modeling/extrusions/slice.create
 */
const create = (edges) => {
  if (!edges) {
    edges = []
  }
  return { edges }
}

module.exports = create

},{}],338:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

/**
 * Determine if the given slices have the same edges.
 * @param {slice} a - the first slice to compare
 * @param {slice} b - the second slice to compare
 * @returns {Boolean} true if the slices are equal
 * @alias module:modeling/extrusions/slice.equals
 */
const equals = (a, b) => {
  const aedges = a.edges
  const bedges = b.edges

  if (aedges.length !== bedges.length) {
    return false
  }

  const isEqual = aedges.reduce((acc, aedge, i) => {
    const bedge = bedges[i]
    const d = vec3.squaredDistance(aedge[0], bedge[0])
    return acc && (d < Number.EPSILON)
  }, true)

  return isEqual
}

module.exports = equals

},{"../../../maths/vec3":237}],339:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

const create = require('./create')

/**
 * Create a slice from the given points.
 *
 * @param {Array} points - list of points, where each point is either 2D or 3D
 * @returns {slice} a new slice
 * @alias module:modeling/extrusions/slice.fromPoints
 *
 * @example
 * const points = [
 *   [0,  0],
 *   [0, 10],
 *   [0, 10]
 * ]
 * const slice = fromPoints(points)
 */
const fromPoints = (points) => {
  if (!Array.isArray(points)) throw new Error('the given points must be an array')
  if (points.length < 3) throw new Error('the given points must contain THREE or more points')

  // create a list of edges from the points
  const edges = []
  let prevpoint = points[points.length - 1]
  points.forEach((point) => {
    if (point.length === 2) edges.push([vec3.fromVec2(vec3.create(), prevpoint), vec3.fromVec2(vec3.create(), point)])
    if (point.length === 3) edges.push([prevpoint, point])
    prevpoint = point
  })
  return create(edges)
}

module.exports = fromPoints

},{"../../../maths/vec3":237,"./create":337}],340:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

const create = require('./create')

/**
 * Create a slice from the given sides (see geom2).
 *
 * @param {Array} sides - list of sides from geom2
 * @returns {slice} a new slice
 * @alias module:modeling/extrusions/slice.fromSides
 *
 * @example
 * const myshape = circle({radius: 10})
 * const slice = fromSides(geom2.toSides(myshape))
 */
const fromSides = (sides) => {
  if (!Array.isArray(sides)) throw new Error('the given sides must be an array')

  // create a list of edges from the sides
  const edges = []
  sides.forEach((side) => {
    edges.push([vec3.fromVec2(vec3.create(), side[0]), vec3.fromVec2(vec3.create(), side[1])])
  })
  return create(edges)
}

module.exports = fromSides

},{"../../../maths/vec3":237,"./create":337}],341:[function(require,module,exports){
/**
 * Represents a 3D geometry consisting of a list of edges.
 * @see {@link slice} for data structure information.
 * @module modeling/extrusions/slice
 */
module.exports = {
  calculatePlane: require('./calculatePlane'),
  clone: require('./clone'),
  create: require('./create'),
  equals: require('./equals'),
  fromPoints: require('./fromPoints'),
  fromSides: require('./fromSides'),
  isA: require('./isA'),
  reverse: require('./reverse'),
  toEdges: require('./toEdges'),
  toPolygons: require('./toPolygons'),
  toString: require('./toString'),
  transform: require('./transform')
}

},{"./calculatePlane":335,"./clone":336,"./create":337,"./equals":338,"./fromPoints":339,"./fromSides":340,"./isA":342,"./reverse":344,"./toEdges":345,"./toPolygons":346,"./toString":347,"./transform":348}],342:[function(require,module,exports){
/**
 * Determine if the given object is a slice.
 * @param {slice} object - the object to interrogate
 * @returns {Boolean} true if the object matches a slice
 * @alias module:modeling/extrusions/slice.isA
 */
const isA = (object) => {
  if (object && typeof object === 'object') {
    if ('edges' in object) {
      if (Array.isArray(object.edges)) {
        return true
      }
    }
  }
  return false
}

module.exports = isA

},{}],343:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')
const create = require('./create')

/*
 * Mend gaps in a 2D slice to make it a closed polygon
 */
const repair = (slice) => {
  if (!slice.edges) return slice
  let edges = slice.edges
  const vertexMap = new Map() // string key to vertex map
  const edgeCount = new Map() // count of (in - out) edges

  // Remove self-edges
  edges = edges.filter((e) => !vec3.equals(e[0], e[1]))

  // build vertex and edge count maps
  edges.forEach((edge) => {
    const inKey = edge[0].toString()
    const outKey = edge[1].toString()
    vertexMap.set(inKey, edge[0])
    vertexMap.set(outKey, edge[1])
    edgeCount.set(inKey, (edgeCount.get(inKey) || 0) + 1) // in
    edgeCount.set(outKey, (edgeCount.get(outKey) || 0) - 1) // out
  })

  // find vertices which are missing in or out edges
  const missingIn = []
  const missingOut = []
  edgeCount.forEach((count, vertex) => {
    if (count < 0) missingIn.push(vertex)
    if (count > 0) missingOut.push(vertex)
  })

  // pairwise distance of bad vertices
  missingIn.forEach((key1) => {
    const v1 = vertexMap.get(key1)

    // find the closest vertex that is missing an out edge
    let bestDistance = Infinity
    let bestReplacement
    missingOut.forEach((key2) => {
      const v2 = vertexMap.get(key2)
      const distance = vec3.distance(v1, v2)
      if (distance < bestDistance) {
        bestDistance = distance
        bestReplacement = v2
      }
    })
    console.warn(`slice.repair: repairing vertex gap ${v1} to ${bestReplacement} distance ${bestDistance}`)

    // merge broken vertices
    edges = edges.map((edge) => {
      if (edge[0].toString() === key1) return [bestReplacement, edge[1]]
      if (edge[1].toString() === key1) return [edge[0], bestReplacement]
      return edge
    })
  })

  return create(edges)
}

module.exports = repair

},{"../../../maths/vec3":237,"./create":337}],344:[function(require,module,exports){
const create = require('./create')

/**
 * Reverse the edges of the given slice.
 *
 * @param {slice} [out] - receiving slice
 * @param {slice} slice - slice to reverse
 * @returns {slice} reverse of the slice
 * @alias module:modeling/extrusions/slice.reverse
 */
const reverse = (...params) => {
  let out
  let slice
  if (params.length === 1) {
    out = create()
    slice = params[0]
  } else {
    out = params[0]
    slice = params[1]
  }
  // reverse the edges
  out.edges = slice.edges.map((edge) => [edge[1], edge[0]])
  return out
}

module.exports = reverse

},{"./create":337}],345:[function(require,module,exports){
/**
 * Produces an array of edges from the given slice.
 * The returned array should not be modified as the data is shared with the slice.
 * @param {slice} slice - the slice
 * @returns {Array} an array of edges, each edge contains an array of two points (3D)
 * @alias module:modeling/extrusions/slice.toEdges
 *
 * @example
 * let sharededges = toEdges(slice)
 */
const toEdges = (slice) => slice.edges

module.exports = toEdges

},{}],346:[function(require,module,exports){
const poly3 = require('../../../geometries/poly3')
const earcut = require('../earcut')
const PolygonHierarchy = require('../earcut/polygonHierarchy')

/**
 * Return a list of polygons which are enclosed by the slice.
 * @param {slice} slice - the slice
 * @return {Array} a list of polygons (3D)
 * @alias module:modeling/extrusions/slice.toPolygons
 */
const toPolygons = (slice) => {
  const hierarchy = new PolygonHierarchy(slice)

  const polygons = []
  hierarchy.roots.forEach(({ solid, holes }) => {
    // hole indices
    let index = solid.length
    const holesIndex = []
    holes.forEach((hole, i) => {
      holesIndex.push(index)
      index += hole.length
    })

    // compute earcut triangulation for each solid
    const vertices = [solid, ...holes].flat()
    const data = vertices.flat()
    // Get original 3D vertex by index
    const getVertex = (i) => hierarchy.to3D(vertices[i])
    const indices = earcut(data, holesIndex)
    for (let i = 0; i < indices.length; i += 3) {
      // Map back to original vertices
      const tri = indices.slice(i, i + 3).map(getVertex)
      polygons.push(poly3.fromPointsAndPlane(tri, hierarchy.plane))
    }
  })

  return polygons
}

module.exports = toPolygons

},{"../../../geometries/poly3":95,"../earcut":317,"../earcut/polygonHierarchy":321}],347:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

const edgesToString = (edges) =>
  edges.reduce((result, edge) => (
    result += `[${vec3.toString(edge[0])}, ${vec3.toString(edge[1])}], `
  ), '')

/**
 * @param {slice} slice - the slice
 * @return {String} the string representation
 * @alias module:modeling/extrusions/slice.toString
 */
const toString = (slice) => `[${edgesToString(slice.edges)}]`

module.exports = toString

},{"../../../maths/vec3":237}],348:[function(require,module,exports){
const vec3 = require('../../../maths/vec3')

const create = require('./create')

/**
 * Transform the given slice using the given matrix.
 * @param {mat4} matrix - transform matrix
 * @param {slice} slice - slice to transform
 * @returns {slice} the transformed slice
 * @alias module:modeling/extrusions/slice.transform
 *
 * @example
 * let matrix = mat4.fromTranslation([1, 2, 3])
 * let newslice = transform(matrix, oldslice)
 */
const transform = (matrix, slice) => {
  const edges = slice.edges.map((edge) => [vec3.transform(vec3.create(), edge[0], matrix), vec3.transform(vec3.create(), edge[1], matrix)])
  return create(edges)
}

module.exports = transform

},{"../../../maths/vec3":237,"./create":337}],349:[function(require,module,exports){
const flatten = require('../../utils/flatten')
const areAllShapesTheSameType = require('../../utils/areAllShapesTheSameType')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

const hullPath2 = require('./hullPath2')
const hullGeom2 = require('./hullGeom2')
const hullGeom3 = require('./hullGeom3')

/**
 * Create a convex hull of the given geometries.
 * The given geometries should be of the same type, either geom2 or geom3 or path2.
 * @param {...Objects} geometries - list of geometries from which to create a hull
 * @returns {geom2|geom3} new geometry
 * @alias module:modeling/hulls.hull
 *
 * @example
 * let myshape = hull(rectangle({center: [-5,-5]}), ellipse({center: [5,5]}))
 *
 * @example
 * +-------+           +-------+
 * |       |           |        \
 * |   A   |           |         \
 * |       |           |          \
 * +-------+           +           \
 *                  =   \           \
 *       +-------+       \           +
 *       |       |        \          |
 *       |   B   |         \         |
 *       |       |          \        |
 *       +-------+           +-------+
 */
const hull = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  if (!areAllShapesTheSameType(geometries)) {
    throw new Error('only hulls of the same type are supported')
  }

  const geometry = geometries[0]
  if (path2.isA(geometry)) return hullPath2(geometries)
  if (geom2.isA(geometry)) return hullGeom2(geometries)
  if (geom3.isA(geometry)) return hullGeom3(geometries)

  // FIXME should this throw an error for unknown geometries?
  return geometry
}

module.exports = hull

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../utils/areAllShapesTheSameType":410,"../../utils/flatten":412,"./hullGeom2":351,"./hullGeom3":352,"./hullPath2":353}],350:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const union = require('../booleans/union')

const hull = require('./hull')

/**
 * Create a chain of hulled geometries from the given geometries.
 * Essentially hull A+B, B+C, C+D, etc., then union the results.
 * The given geometries should be of the same type, either geom2 or geom3 or path2.
 *
 * @param {...Objects} geometries - list of geometries from which to create a hull
 * @returns {geom2|geom3} new geometry
 * @alias module:modeling/hulls.hullChain
 *
 * @example
 * let newshape = hullChain(rectangle({center: [-5,-5]}), circle({center: [0,0]}), rectangle({center: [5,5]}))
 *
 * @example
 * +-------+   +-------+     +-------+   +------+
 * |       |   |       |     |        \ /       |
 * |   A   |   |   C   |     |         |        |
 * |       |   |       |     |                  |
 * +-------+   +-------+     +                  +
 *                       =   \                 /
 *       +-------+            \               /
 *       |       |             \             /
 *       |   B   |              \           /
 *       |       |               \         /
 *       +-------+                +-------+
 */
const hullChain = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length < 2) throw new Error('wrong number of arguments')

  const hulls = []
  for (let i = 1; i < geometries.length; i++) {
    hulls.push(hull(geometries[i - 1], geometries[i]))
  }
  return union(hulls)
}

module.exports = hullChain

},{"../../utils/flatten":412,"../booleans/union":300,"./hull":349}],351:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')

const hullPoints2 = require('./hullPoints2')
const toUniquePoints = require('./toUniquePoints')

/*
 * Create a convex hull of the given geom2 geometries.
 * @param {...geometries} geometries - list of geom2 geometries
 * @returns {geom2} new geometry
 */
const hullGeom2 = (...geometries) => {
  geometries = flatten(geometries)

  // extract the unique points from the geometries
  const unique = toUniquePoints(geometries)

  const hullPoints = hullPoints2(unique)

  // NOTE: more than three points are required to create a new geometry
  if (hullPoints.length < 3) return geom2.create()

  // assemble a new geometry from the list of points
  return geom2.fromPoints(hullPoints)
}

module.exports = hullGeom2

},{"../../geometries/geom2":42,"../../utils/flatten":412,"./hullPoints2":354,"./toUniquePoints":364}],352:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')

const quickhull = require('./quickhull')
const toUniquePoints = require('./toUniquePoints')

/*
 * Create a convex hull of the given geometries (geom3).
 * @param {...geometries} geometries - list of geom3 geometries
 * @returns {geom3} new geometry
 */
const hullGeom3 = (...geometries) => {
  geometries = flatten(geometries)

  if (geometries.length === 1) return geometries[0]

  // extract the unique vertices from the geometries
  const unique = toUniquePoints(geometries)

  const faces = quickhull(unique, { skipTriangulation: true })

  const polygons = faces.map((face) => {
    const vertices = face.map((index) => unique[index])
    return poly3.create(vertices)
  })

  return geom3.create(polygons)
}

module.exports = hullGeom3

},{"../../geometries/geom3":57,"../../geometries/poly3":95,"../../utils/flatten":412,"./quickhull":362,"./toUniquePoints":364}],353:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const path2 = require('../../geometries/path2')

const hullPoints2 = require('./hullPoints2')
const toUniquePoints = require('./toUniquePoints')

/*
 * Create a convex hull of the given geometries (path2).
 * @param {...geometries} geometries - list of path2 geometries
 * @returns {path2} new geometry
 */
const hullPath2 = (...geometries) => {
  geometries = flatten(geometries)

  // extract the unique points from the geometries
  const unique = toUniquePoints(geometries)

  const hullPoints = hullPoints2(unique)

  // assemble a new geometry from the list of points
  return path2.fromPoints({ closed: true }, hullPoints)
}

module.exports = hullPath2

},{"../../geometries/path2":78,"../../utils/flatten":412,"./hullPoints2":354,"./toUniquePoints":364}],354:[function(require,module,exports){
const vec2 = require('../../maths/vec2')

/*
 * Create a convex hull of the given set of points, where each point is an array of [x,y].
 * Uses https://en.wikipedia.org/wiki/Graham_scan
 * @param {Array} uniquePoints - list of UNIQUE points from which to create a hull
 * @returns {Array} a list of points that form the hull
 */
const hullPoints2 = (uniquePoints) => {
  // find min point
  let min = vec2.fromValues(Infinity, Infinity)
  uniquePoints.forEach((point) => {
    if (point[1] < min[1] || (point[1] === min[1] && point[0] < min[0])) {
      min = point
    }
  })

  // gather information for sorting by polar coordinates (point, angle, distSq)
  const points = []
  uniquePoints.forEach((point) => {
    // use faster fakeAtan2 instead of Math.atan2
    const angle = fakeAtan2(point[1] - min[1], point[0] - min[0])
    const distSq = vec2.squaredDistance(point, min)
    points.push({ point, angle, distSq })
  })

  // sort by polar coordinates
  points.sort((pt1, pt2) => pt1.angle !== pt2.angle
    ? pt1.angle - pt2.angle
    : pt1.distSq - pt2.distSq)

  const stack = [] // start with empty stack
  points.forEach((point) => {
    let cnt = stack.length
    while (cnt > 1 && ccw(stack[cnt - 2], stack[cnt - 1], point.point) <= Number.EPSILON) {
      stack.pop() // get rid of colinear and interior (clockwise) points
      cnt = stack.length
    }
    stack.push(point.point)
  })

  return stack
}

// returns: < 0 clockwise, 0 colinear, > 0 counter-clockwise
const ccw = (v1, v2, v3) => (v2[0] - v1[0]) * (v3[1] - v1[1]) - (v2[1] - v1[1]) * (v3[0] - v1[0])

// Returned "angle" is really 1/tan (inverse of slope) made negative to increase with angle.
// This function is strictly for sorting in this algorithm.
const fakeAtan2 = (y, x) => {
  // The "if" is a special case for when the minimum vector found in loop above is present.
  // We need to ensure that it sorts as the minimum point. Otherwise, this becomes NaN.
  if (y === 0 && x === 0) {
    return -Infinity
  } else {
    return -x / y
  }
}

module.exports = hullPoints2

},{"../../maths/vec2":206}],355:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be passed to hull functions
 * to determine the convex hull of all points.
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/hulls
 * @example
 * const { hull, hullChain } = require('@jscad/modeling').hulls
 */
module.exports = {
  hull: require('./hull'),
  hullChain: require('./hullChain')
}

},{"./hull":349,"./hullChain":350}],356:[function(require,module,exports){
const add = require('../../../maths/vec3/add')
const copy = require('../../../maths/vec3/copy')
const cross = require('../../../maths/vec3/cross')
const dot = require('../../../maths/vec3/dot')
const length = require('../../../maths/vec3/length')
const normalize = require('../../../maths/vec3/normalize')
const scale = require('../../../maths/vec3/scale')
const subtract = require('../../../maths/vec3/subtract')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

const HalfEdge = require('./HalfEdge')

const VISIBLE = 0
const NON_CONVEX = 1
const DELETED = 2

class Face {
  constructor () {
    this.normal = []
    this.centroid = []
    // signed distance from face to the origin
    this.offset = 0
    // pointer to the a vertex in a double linked list this face can see
    this.outside = null
    this.mark = VISIBLE
    this.edge = null
    this.nVertices = 0
  }

  getEdge (i) {
    if (typeof i !== 'number') {
      throw Error('requires a number')
    }
    let it = this.edge
    while (i > 0) {
      it = it.next
      i -= 1
    }
    while (i < 0) {
      it = it.prev
      i += 1
    }
    return it
  }

  computeNormal () {
    const e0 = this.edge
    const e1 = e0.next
    let e2 = e1.next
    const v2 = subtract([], e1.head().point, e0.head().point)
    const t = []
    const v1 = []

    this.nVertices = 2
    this.normal = [0, 0, 0]
    while (e2 !== e0) {
      copy(v1, v2)
      subtract(v2, e2.head().point, e0.head().point)
      add(this.normal, this.normal, cross(t, v1, v2))
      e2 = e2.next
      this.nVertices += 1
    }
    this.area = length(this.normal)
    // normalize the vector, since we've already calculated the area
    // it's cheaper to scale the vector using this quantity instead of
    // doing the same operation again
    this.normal = scale(this.normal, this.normal, 1 / this.area)
  }

  computeNormalMinArea (minArea) {
    this.computeNormal()
    if (this.area < minArea) {
      // compute the normal without the longest edge
      let maxEdge
      let maxSquaredLength = 0
      let edge = this.edge

      // find the longest edge (in length) in the chain of edges
      do {
        const lengthSquared = edge.lengthSquared()
        if (lengthSquared > maxSquaredLength) {
          maxEdge = edge
          maxSquaredLength = lengthSquared
        }
        edge = edge.next
      } while (edge !== this.edge)

      const p1 = maxEdge.tail().point
      const p2 = maxEdge.head().point
      const maxVector = subtract([], p2, p1)
      const maxLength = Math.sqrt(maxSquaredLength)
      // maxVector is normalized after this operation
      scale(maxVector, maxVector, 1 / maxLength)
      // compute the projection of maxVector over this face normal
      const maxProjection = dot(this.normal, maxVector)
      // subtract the quantity maxEdge adds on the normal
      scale(maxVector, maxVector, -maxProjection)
      add(this.normal, this.normal, maxVector)
      // renormalize `this.normal`
      normalize(this.normal, this.normal)
    }
  }

  computeCentroid () {
    this.centroid = [0, 0, 0]
    let edge = this.edge
    do {
      add(this.centroid, this.centroid, edge.head().point)
      edge = edge.next
    } while (edge !== this.edge)
    scale(this.centroid, this.centroid, 1 / this.nVertices)
  }

  computeNormalAndCentroid (minArea) {
    if (typeof minArea !== 'undefined') {
      this.computeNormalMinArea(minArea)
    } else {
      this.computeNormal()
    }
    this.computeCentroid()
    this.offset = dot(this.normal, this.centroid)
  }

  distanceToPlane (point) {
    return dot(this.normal, point) - this.offset
  }

  /**
   * @private
   *
   * Connects two edges assuming that prev.head().point === next.tail().point
   *
   * @param {HalfEdge} prev
   * @param {HalfEdge} next
   */
  connectHalfEdges (prev, next) {
    let discardedFace
    if (prev.opposite.face === next.opposite.face) {
      // `prev` is remove a redundant edge
      const oppositeFace = next.opposite.face
      let oppositeEdge
      if (prev === this.edge) {
        this.edge = next
      }
      if (oppositeFace.nVertices === 3) {
        // case:
        // remove the face on the right
        //
        //       /|\
        //      / | \ the face on the right
        //     /  |  \ --> opposite edge
        //    / a |   \
        //   *----*----*
        //  /     b  |  \
        //           ▾
        //      redundant edge
        //
        // Note: the opposite edge is actually in the face to the right
        // of the face to be destroyed
        oppositeEdge = next.opposite.prev.opposite
        oppositeFace.mark = DELETED
        discardedFace = oppositeFace
      } else {
        // case:
        //          t
        //        *----
        //       /| <- right face's redundant edge
        //      / | opposite edge
        //     /  |  ▴   /
        //    / a |  |  /
        //   *----*----*
        //  /     b  |  \
        //           ▾
        //      redundant edge
        oppositeEdge = next.opposite.next
        // make sure that the link `oppositeFace.edge` points correctly even
        // after the right face redundant edge is removed
        if (oppositeFace.edge === oppositeEdge.prev) {
          oppositeFace.edge = oppositeEdge
        }

        //       /|   /
        //      / | t/opposite edge
        //     /  | / ▴  /
        //    / a |/  | /
        //   *----*----*
        //  /     b     \
        oppositeEdge.prev = oppositeEdge.prev.prev
        oppositeEdge.prev.next = oppositeEdge
      }
      //       /|
      //      / |
      //     /  |
      //    / a |
      //   *----*----*
      //  /     b  ▴  \
      //           |
      //     redundant edge
      next.prev = prev.prev
      next.prev.next = next

      //       / \  \
      //      /   \->\
      //     /     \<-\ opposite edge
      //    / a     \  \
      //   *----*----*
      //  /     b  ^  \
      next.setOpposite(oppositeEdge)

      oppositeFace.computeNormalAndCentroid()
    } else {
      // trivial case
      //        *
      //       /|\
      //      / | \
      //     /  |--> next
      //    / a |   \
      //   *----*----*
      //    \ b |   /
      //     \  |--> prev
      //      \ | /
      //       \|/
      //        *
      prev.next = next
      next.prev = prev
    }
    return discardedFace
  }

  mergeAdjacentFaces (adjacentEdge, discardedFaces) {
    const oppositeEdge = adjacentEdge.opposite
    const oppositeFace = oppositeEdge.face

    discardedFaces.push(oppositeFace)
    oppositeFace.mark = DELETED

    // find the chain of edges whose opposite face is `oppositeFace`
    //
    //                ===>
    //      \         face         /
    //       * ---- * ---- * ---- *
    //      /     opposite face    \
    //                <===
    //
    let adjacentEdgePrev = adjacentEdge.prev
    let adjacentEdgeNext = adjacentEdge.next
    let oppositeEdgePrev = oppositeEdge.prev
    let oppositeEdgeNext = oppositeEdge.next

    // left edge
    while (adjacentEdgePrev.opposite.face === oppositeFace) {
      adjacentEdgePrev = adjacentEdgePrev.prev
      oppositeEdgeNext = oppositeEdgeNext.next
    }
    // right edge
    while (adjacentEdgeNext.opposite.face === oppositeFace) {
      adjacentEdgeNext = adjacentEdgeNext.next
      oppositeEdgePrev = oppositeEdgePrev.prev
    }
    // adjacentEdgePrev  \         face         / adjacentEdgeNext
    //                    * ---- * ---- * ---- *
    // oppositeEdgeNext  /     opposite face    \ oppositeEdgePrev

    // fix the face reference of all the opposite edges that are not part of
    // the edges whose opposite face is not `face` i.e. all the edges that
    // `face` and `oppositeFace` do not have in common
    let edge
    for (edge = oppositeEdgeNext; edge !== oppositeEdgePrev.next; edge = edge.next) {
      edge.face = this
    }

    // make sure that `face.edge` is not one of the edges to be destroyed
    // Note: it's important for it to be a `next` edge since `prev` edges
    // might be destroyed on `connectHalfEdges`
    this.edge = adjacentEdgeNext

    // connect the extremes
    // Note: it might be possible that after connecting the edges a triangular
    // face might be redundant
    let discardedFace
    discardedFace = this.connectHalfEdges(oppositeEdgePrev, adjacentEdgeNext)
    if (discardedFace) {
      discardedFaces.push(discardedFace)
    }
    discardedFace = this.connectHalfEdges(adjacentEdgePrev, oppositeEdgeNext)
    if (discardedFace) {
      discardedFaces.push(discardedFace)
    }

    this.computeNormalAndCentroid()
    // TODO: additional consistency checks
    return discardedFaces
  }

  collectIndices () {
    const indices = []
    let edge = this.edge
    do {
      indices.push(edge.head().index)
      edge = edge.next
    } while (edge !== this.edge)
    return indices
  }

  static createTriangle (v0, v1, v2, minArea = 0) {
    const face = new Face()
    const e0 = new HalfEdge(v0, face)
    const e1 = new HalfEdge(v1, face)
    const e2 = new HalfEdge(v2, face)

    // join edges
    e0.next = e2.prev = e1
    e1.next = e0.prev = e2
    e2.next = e1.prev = e0

    // main half edge reference
    face.edge = e0
    face.computeNormalAndCentroid(minArea)
    return face
  }
}

module.exports = {
  VISIBLE,
  NON_CONVEX,
  DELETED,
  Face
}

},{"../../../maths/vec3/add":224,"../../../maths/vec3/copy":227,"../../../maths/vec3/cross":229,"../../../maths/vec3/dot":232,"../../../maths/vec3/length":238,"../../../maths/vec3/normalize":244,"../../../maths/vec3/scale":249,"../../../maths/vec3/subtract":253,"./HalfEdge":357}],357:[function(require,module,exports){
const distance = require('../../../maths/vec3/distance')
const squaredDistance = require('../../../maths/vec3/squaredDistance')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

class HalfEdge {
  constructor (vertex, face) {
    this.vertex = vertex
    this.face = face
    this.next = null
    this.prev = null
    this.opposite = null
  }

  head () {
    return this.vertex
  }

  tail () {
    return this.prev
      ? this.prev.vertex
      : null
  }

  length () {
    if (this.tail()) {
      return distance(
        this.tail().point,
        this.head().point
      )
    }
    return -1
  }

  lengthSquared () {
    if (this.tail()) {
      return squaredDistance(
        this.tail().point,
        this.head().point
      )
    }
    return -1
  }

  setOpposite (edge) {
    this.opposite = edge
    edge.opposite = this
  }
}

module.exports = HalfEdge

},{"../../../maths/vec3/distance":230,"../../../maths/vec3/squaredDistance":251}],358:[function(require,module,exports){
const dot = require('../../../maths/vec3/dot')

const pointLineDistance = require('./point-line-distance')
const getPlaneNormal = require('./get-plane-normal')

const VertexList = require('./VertexList')
const Vertex = require('./Vertex')
const { Face, VISIBLE, NON_CONVEX, DELETED } = require('./Face')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

// merge types
// non convex with respect to the large face
const MERGE_NON_CONVEX_WRT_LARGER_FACE = 1
const MERGE_NON_CONVEX = 2

class QuickHull {
  constructor (points) {
    if (!Array.isArray(points)) {
      throw TypeError('input is not a valid array')
    }
    if (points.length < 4) {
      throw Error('cannot build a simplex out of <4 points')
    }

    this.tolerance = -1

    // buffers
    this.nFaces = 0
    this.nPoints = points.length

    this.faces = []
    this.newFaces = []
    // helpers
    //
    // let `a`, `b` be `Face` instances
    // let `v` be points wrapped as instance of `Vertex`
    //
    //     [v, v, ..., v, v, v, ...]
    //      ^             ^
    //      |             |
    //  a.outside     b.outside
    //
    this.claimed = new VertexList()
    this.unclaimed = new VertexList()

    // vertices of the hull(internal representation of points)
    this.vertices = []
    for (let i = 0; i < points.length; i += 1) {
      this.vertices.push(new Vertex(points[i], i))
    }
    this.discardedFaces = []
    this.vertexPointIndices = []
  }

  addVertexToFace (vertex, face) {
    vertex.face = face
    if (!face.outside) {
      this.claimed.add(vertex)
    } else {
      this.claimed.insertBefore(face.outside, vertex)
    }
    face.outside = vertex
  }

  /**
   * Removes `vertex` for the `claimed` list of vertices, it also makes sure
   * that the link from `face` to the first vertex it sees in `claimed` is
   * linked correctly after the removal
   *
   * @param {Vertex} vertex
   * @param {Face} face
   */
  removeVertexFromFace (vertex, face) {
    if (vertex === face.outside) {
      // fix face.outside link
      if (vertex.next && vertex.next.face === face) {
        // face has at least 2 outside vertices, move the `outside` reference
        face.outside = vertex.next
      } else {
        // vertex was the only outside vertex that face had
        face.outside = null
      }
    }
    this.claimed.remove(vertex)
  }

  /**
   * Removes all the visible vertices that `face` is able to see which are
   * stored in the `claimed` vertext list
   *
   * @param {Face} face
   * @return {Vertex|undefined} If face had visible vertices returns
   * `face.outside`, otherwise undefined
   */
  removeAllVerticesFromFace (face) {
    if (face.outside) {
      // pointer to the last vertex of this face
      // [..., outside, ..., end, outside, ...]
      //          |           |      |
      //          a           a      b
      let end = face.outside
      while (end.next && end.next.face === face) {
        end = end.next
      }
      this.claimed.removeChain(face.outside, end)
      //                            b
      //                       [ outside, ...]
      //                            |  removes this link
      //     [ outside, ..., end ] -┘
      //          |           |
      //          a           a
      end.next = null
      return face.outside
    }
  }

  /**
   * Removes all the visible vertices that `face` is able to see, additionally
   * checking the following:
   *
   * If `absorbingFace` doesn't exist then all the removed vertices will be
   * added to the `unclaimed` vertex list
   *
   * If `absorbingFace` exists then this method will assign all the vertices of
   * `face` that can see `absorbingFace`, if a vertex cannot see `absorbingFace`
   * it's added to the `unclaimed` vertex list
   *
   * @param {Face} face
   * @param {Face} [absorbingFace]
   */
  deleteFaceVertices (face, absorbingFace) {
    const faceVertices = this.removeAllVerticesFromFace(face)
    if (faceVertices) {
      if (!absorbingFace) {
        // mark the vertices to be reassigned to some other face
        this.unclaimed.addAll(faceVertices)
      } else {
        // if there's an absorbing face try to assign as many vertices
        // as possible to it

        // the reference `vertex.next` might be destroyed on
        // `this.addVertexToFace` (see VertexList#add), nextVertex is a
        // reference to it
        let nextVertex
        for (let vertex = faceVertices; vertex; vertex = nextVertex) {
          nextVertex = vertex.next
          const distance = absorbingFace.distanceToPlane(vertex.point)

          // check if `vertex` is able to see `absorbingFace`
          if (distance > this.tolerance) {
            this.addVertexToFace(vertex, absorbingFace)
          } else {
            this.unclaimed.add(vertex)
          }
        }
      }
    }
  }

  /**
   * Reassigns as many vertices as possible from the unclaimed list to the new
   * faces
   *
   * @param {Faces[]} newFaces
   */
  resolveUnclaimedPoints (newFaces) {
    // cache next vertex so that if `vertex.next` is destroyed it's still
    // recoverable
    let vertexNext = this.unclaimed.first()
    for (let vertex = vertexNext; vertex; vertex = vertexNext) {
      vertexNext = vertex.next
      let maxDistance = this.tolerance
      let maxFace
      for (let i = 0; i < newFaces.length; i += 1) {
        const face = newFaces[i]
        if (face.mark === VISIBLE) {
          const dist = face.distanceToPlane(vertex.point)
          if (dist > maxDistance) {
            maxDistance = dist
            maxFace = face
          }
          if (maxDistance > 1000 * this.tolerance) {
            break
          }
        }
      }

      if (maxFace) {
        this.addVertexToFace(vertex, maxFace)
      }
    }
  }

  /**
   * Computes the extremes of a tetrahedron which will be the initial hull
   *
   * @return {number[]} The min/max vertices in the x,y,z directions
   */
  computeExtremes () {
    const min = []
    const max = []

    // min vertex on the x,y,z directions
    const minVertices = []
    // max vertex on the x,y,z directions
    const maxVertices = []

    let i, j

    // initially assume that the first vertex is the min/max
    for (i = 0; i < 3; i += 1) {
      minVertices[i] = maxVertices[i] = this.vertices[0]
    }
    // copy the coordinates of the first vertex to min/max
    for (i = 0; i < 3; i += 1) {
      min[i] = max[i] = this.vertices[0].point[i]
    }

    // compute the min/max vertex on all 6 directions
    for (i = 1; i < this.vertices.length; i += 1) {
      const vertex = this.vertices[i]
      const point = vertex.point
      // update the min coordinates
      for (j = 0; j < 3; j += 1) {
        if (point[j] < min[j]) {
          min[j] = point[j]
          minVertices[j] = vertex
        }
      }
      // update the max coordinates
      for (j = 0; j < 3; j += 1) {
        if (point[j] > max[j]) {
          max[j] = point[j]
          maxVertices[j] = vertex
        }
      }
    }

    // compute epsilon
    this.tolerance = 3 * Number.EPSILON * (
      Math.max(Math.abs(min[0]), Math.abs(max[0])) +
      Math.max(Math.abs(min[1]), Math.abs(max[1])) +
      Math.max(Math.abs(min[2]), Math.abs(max[2]))
    )
    return [minVertices, maxVertices]
  }

  /**
   * Compues the initial tetrahedron assigning to its faces all the points that
   * are candidates to form part of the hull
   */
  createInitialSimplex () {
    const vertices = this.vertices
    const [min, max] = this.computeExtremes()
    let v2, v3
    let i, j

    // Find the two vertices with the greatest 1d separation
    // (max.x - min.x)
    // (max.y - min.y)
    // (max.z - min.z)
    let maxDistance = 0
    let indexMax = 0
    for (i = 0; i < 3; i += 1) {
      const distance = max[i].point[i] - min[i].point[i]
      if (distance > maxDistance) {
        maxDistance = distance
        indexMax = i
      }
    }
    const v0 = min[indexMax]
    const v1 = max[indexMax]

    // the next vertex is the one farthest to the line formed by `v0` and `v1`
    maxDistance = 0
    for (i = 0; i < this.vertices.length; i += 1) {
      const vertex = this.vertices[i]
      if (vertex !== v0 && vertex !== v1) {
        const distance = pointLineDistance(
          vertex.point, v0.point, v1.point
        )
        if (distance > maxDistance) {
          maxDistance = distance
          v2 = vertex
        }
      }
    }

    // the next vertes is the one farthest to the plane `v0`, `v1`, `v2`
    // normalize((v2 - v1) x (v0 - v1))
    const normal = getPlaneNormal([], v0.point, v1.point, v2.point)
    // distance from the origin to the plane
    const distPO = dot(v0.point, normal)
    maxDistance = -1
    for (i = 0; i < this.vertices.length; i += 1) {
      const vertex = this.vertices[i]
      if (vertex !== v0 && vertex !== v1 && vertex !== v2) {
        const distance = Math.abs(dot(normal, vertex.point) - distPO)
        if (distance > maxDistance) {
          maxDistance = distance
          v3 = vertex
        }
      }
    }

    // initial simplex
    // Taken from http://everything2.com/title/How+to+paint+a+tetrahedron
    //
    //                              v2
    //                             ,|,
    //                           ,7``\'VA,
    //                         ,7`   |, `'VA,
    //                       ,7`     `\    `'VA,
    //                     ,7`        |,      `'VA,
    //                   ,7`          `\         `'VA,
    //                 ,7`             |,           `'VA,
    //               ,7`               `\       ,..ooOOTK` v3
    //             ,7`                  |,.ooOOT''`    AV
    //           ,7`            ,..ooOOT`\`           /7
    //         ,7`      ,..ooOOT''`      |,          AV
    //        ,T,..ooOOT''`              `\         /7
    //     v0 `'TTs.,                     |,       AV
    //            `'TTs.,                 `\      /7
    //                 `'TTs.,             |,    AV
    //                      `'TTs.,        `\   /7
    //                           `'TTs.,    |, AV
    //                                `'TTs.,\/7
    //                                     `'T`
    //                                       v1
    //
    const faces = []
    if (dot(v3.point, normal) - distPO < 0) {
      // the face is not able to see the point so `planeNormal`
      // is pointing outside the tetrahedron
      faces.push(
        Face.createTriangle(v0, v1, v2),
        Face.createTriangle(v3, v1, v0),
        Face.createTriangle(v3, v2, v1),
        Face.createTriangle(v3, v0, v2)
      )

      // set the opposite edge
      for (i = 0; i < 3; i += 1) {
        const j = (i + 1) % 3
        // join face[i] i > 0, with the first face
        faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge(j))
        // join face[i] with face[i + 1], 1 <= i <= 3
        faces[i + 1].getEdge(1).setOpposite(faces[j + 1].getEdge(0))
      }
    } else {
      // the face is able to see the point so `planeNormal`
      // is pointing inside the tetrahedron
      faces.push(
        Face.createTriangle(v0, v2, v1),
        Face.createTriangle(v3, v0, v1),
        Face.createTriangle(v3, v1, v2),
        Face.createTriangle(v3, v2, v0)
      )

      // set the opposite edge
      for (i = 0; i < 3; i += 1) {
        const j = (i + 1) % 3
        // join face[i] i > 0, with the first face
        faces[i + 1].getEdge(2).setOpposite(faces[0].getEdge((3 - i) % 3))
        // join face[i] with face[i + 1]
        faces[i + 1].getEdge(0).setOpposite(faces[j + 1].getEdge(1))
      }
    }

    // the initial hull is the tetrahedron
    for (i = 0; i < 4; i += 1) {
      this.faces.push(faces[i])
    }

    // initial assignment of vertices to the faces of the tetrahedron
    for (i = 0; i < vertices.length; i += 1) {
      const vertex = vertices[i]
      if (vertex !== v0 && vertex !== v1 && vertex !== v2 && vertex !== v3) {
        maxDistance = this.tolerance
        let maxFace
        for (j = 0; j < 4; j += 1) {
          const distance = faces[j].distanceToPlane(vertex.point)
          if (distance > maxDistance) {
            maxDistance = distance
            maxFace = faces[j]
          }
        }

        if (maxFace) {
          this.addVertexToFace(vertex, maxFace)
        }
      }
    }
  }

  reindexFaceAndVertices () {
    // remove inactive faces
    const activeFaces = []
    for (let i = 0; i < this.faces.length; i += 1) {
      const face = this.faces[i]
      if (face.mark === VISIBLE) {
        activeFaces.push(face)
      }
    }
    this.faces = activeFaces
  }

  collectFaces (skipTriangulation) {
    const faceIndices = []
    for (let i = 0; i < this.faces.length; i += 1) {
      if (this.faces[i].mark !== VISIBLE) {
        throw Error('attempt to include a destroyed face in the hull')
      }
      const indices = this.faces[i].collectIndices()
      if (skipTriangulation) {
        faceIndices.push(indices)
      } else {
        for (let j = 0; j < indices.length - 2; j += 1) {
          faceIndices.push(
            [indices[0], indices[j + 1], indices[j + 2]]
          )
        }
      }
    }
    return faceIndices
  }

  /**
   * Finds the next vertex to make faces with the current hull
   *
   * - let `face` be the first face existing in the `claimed` vertex list
   *  - if `face` doesn't exist then return since there're no vertices left
   *  - otherwise for each `vertex` that face sees find the one furthest away
   *  from `face`
   *
   * @return {Vertex|undefined} Returns undefined when there're no more
   * visible vertices
   */
  nextVertexToAdd () {
    if (!this.claimed.isEmpty()) {
      let eyeVertex, vertex
      let maxDistance = 0
      const eyeFace = this.claimed.first().face
      for (vertex = eyeFace.outside; vertex && vertex.face === eyeFace; vertex = vertex.next) {
        const distance = eyeFace.distanceToPlane(vertex.point)
        if (distance > maxDistance) {
          maxDistance = distance
          eyeVertex = vertex
        }
      }
      return eyeVertex
    }
  }

  /**
   * Computes a chain of half edges in ccw order called the `horizon`, for an
   * edge to be part of the horizon it must join a face that can see
   * `eyePoint` and a face that cannot see `eyePoint`
   *
   * @param {number[]} eyePoint - The coordinates of a point
   * @param {HalfEdge} crossEdge - The edge used to jump to the current `face`
   * @param {Face} face - The current face being tested
   * @param {HalfEdge[]} horizon - The edges that form part of the horizon in
   * ccw order
   */
  computeHorizon (eyePoint, crossEdge, face, horizon) {
    // moves face's vertices to the `unclaimed` vertex list
    this.deleteFaceVertices(face)

    face.mark = DELETED

    let edge
    if (!crossEdge) {
      edge = crossEdge = face.getEdge(0)
    } else {
      // start from the next edge since `crossEdge` was already analyzed
      // (actually `crossEdge.opposite` was the face who called this method
      // recursively)
      edge = crossEdge.next
    }

    // All the faces that are able to see `eyeVertex` are defined as follows
    //
    //       v    /
    //           / <== visible face
    //          /
    //         |
    //         | <== not visible face
    //
    //  dot(v, visible face normal) - visible face offset > this.tolerance
    //
    do {
      const oppositeEdge = edge.opposite
      const oppositeFace = oppositeEdge.face
      if (oppositeFace.mark === VISIBLE) {
        if (oppositeFace.distanceToPlane(eyePoint) > this.tolerance) {
          this.computeHorizon(eyePoint, oppositeEdge, oppositeFace, horizon)
        } else {
          horizon.push(edge)
        }
      }
      edge = edge.next
    } while (edge !== crossEdge)
  }

  /**
   * Creates a face with the points `eyeVertex.point`, `horizonEdge.tail` and
   * `horizonEdge.tail` in ccw order
   *
   * @param {Vertex} eyeVertex
   * @param {HalfEdge} horizonEdge
   * @return {HalfEdge} The half edge whose vertex is the eyeVertex
   */
  addAdjoiningFace (eyeVertex, horizonEdge) {
    // all the half edges are created in ccw order thus the face is always
    // pointing outside the hull
    // edges:
    //
    //                  eyeVertex.point
    //                       / \
    //                      /   \
    //                  1  /     \  0
    //                    /       \
    //                   /         \
    //                  /           \
    //          horizon.tail --- horizon.head
    //                        2
    //
    const face = Face.createTriangle(
      eyeVertex,
      horizonEdge.tail(),
      horizonEdge.head()
    )
    this.faces.push(face)
    // join face.getEdge(-1) with the horizon's opposite edge
    // face.getEdge(-1) = face.getEdge(2)
    face.getEdge(-1).setOpposite(horizonEdge.opposite)
    return face.getEdge(0)
  }

  /**
   * Adds horizon.length faces to the hull, each face will be 'linked' with the
   * horizon opposite face and the face on the left/right
   *
   * @param {Vertex} eyeVertex
   * @param {HalfEdge[]} horizon - A chain of half edges in ccw order
   */
  addNewFaces (eyeVertex, horizon) {
    this.newFaces = []
    let firstSideEdge, previousSideEdge
    for (let i = 0; i < horizon.length; i += 1) {
      const horizonEdge = horizon[i]
      // returns the right side edge
      const sideEdge = this.addAdjoiningFace(eyeVertex, horizonEdge)
      if (!firstSideEdge) {
        firstSideEdge = sideEdge
      } else {
        // joins face.getEdge(1) with previousFace.getEdge(0)
        sideEdge.next.setOpposite(previousSideEdge)
      }
      this.newFaces.push(sideEdge.face)
      previousSideEdge = sideEdge
    }
    firstSideEdge.next.setOpposite(previousSideEdge)
  }

  /**
   * Computes the distance from `edge` opposite face's centroid to
   * `edge.face`
   *
   * @param {HalfEdge} edge
   * @return {number}
   * - A positive number when the centroid of the opposite face is above the
   *   face i.e. when the faces are concave
   * - A negative number when the centroid of the opposite face is below the
   *   face i.e. when the faces are convex
   */
  oppositeFaceDistance (edge) {
    return edge.face.distanceToPlane(edge.opposite.face.centroid)
  }

  /**
   * Merges a face with none/any/all its neighbors according to the strategy
   * used
   *
   * if `mergeType` is MERGE_NON_CONVEX_WRT_LARGER_FACE then the merge will be
   * decided based on the face with the larger area, the centroid of the face
   * with the smaller area will be checked against the one with the larger area
   * to see if it's in the merge range [tolerance, -tolerance] i.e.
   *
   *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
   *
   * Note that the first check (with +tolerance) was done on `computeHorizon`
   *
   * If the above is not true then the check is done with respect to the smaller
   * face i.e.
   *
   *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
   *
   * If true then it means that two faces are non convex (concave), even if the
   * dot(...) - offset value is > 0 (that's the point of doing the merge in the
   * first place)
   *
   * If two faces are concave then the check must also be done on the other face
   * but this is done in another merge pass, for this to happen the face is
   * marked in a temporal NON_CONVEX state
   *
   * if `mergeType` is MERGE_NON_CONVEX then two faces will be merged only if
   * they pass the following conditions
   *
   *    dot(centroid smaller face, larger face normal) - larger face offset > -tolerance
   *    dot(centroid larger face, smaller face normal) - smaller face offset > -tolerance
   *
   * @param {Face} face
   * @param {number} mergeType - Either MERGE_NON_CONVEX_WRT_LARGER_FACE or
   * MERGE_NON_CONVEX
   */
  doAdjacentMerge (face, mergeType) {
    let edge = face.edge
    let convex = true
    let it = 0
    do {
      if (it >= face.nVertices) {
        throw Error('merge recursion limit exceeded')
      }
      const oppositeFace = edge.opposite.face
      let merge = false

      // Important notes about the algorithm to merge faces
      //
      // - Given a vertex `eyeVertex` that will be added to the hull
      //   all the faces that cannot see `eyeVertex` are defined as follows
      //
      //      dot(v, not visible face normal) - not visible offset < tolerance
      //
      // - Two faces can be merged when the centroid of one of these faces
      // projected to the normal of the other face minus the other face offset
      // is in the range [tolerance, -tolerance]
      // - Since `face` (given in the input for this method) has passed the
      // check above we only have to check the lower bound e.g.
      //
      //      dot(v, not visible face normal) - not visible offset > -tolerance
      //
      if (mergeType === MERGE_NON_CONVEX) {
        if (this.oppositeFaceDistance(edge) > -this.tolerance ||
            this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
          merge = true
        }
      } else {
        if (face.area > oppositeFace.area) {
          if (this.oppositeFaceDistance(edge) > -this.tolerance) {
            merge = true
          } else if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
            convex = false
          }
        } else {
          if (this.oppositeFaceDistance(edge.opposite) > -this.tolerance) {
            merge = true
          } else if (this.oppositeFaceDistance(edge) > -this.tolerance) {
            convex = false
          }
        }
      }

      if (merge) {
        // when two faces are merged it might be possible that redundant faces
        // are destroyed, in that case move all the visible vertices from the
        // destroyed faces to the `unclaimed` vertex list
        const discardedFaces = face.mergeAdjacentFaces(edge, [])
        for (let i = 0; i < discardedFaces.length; i += 1) {
          this.deleteFaceVertices(discardedFaces[i], face)
        }
        return true
      }

      edge = edge.next
      it += 1
    } while (edge !== face.edge)
    if (!convex) {
      face.mark = NON_CONVEX
    }
    return false
  }

  /**
   * Adds a vertex to the hull with the following algorithm
   *
   * - Compute the `horizon` which is a chain of half edges, for an edge to
   *   belong to this group it must be the edge connecting a face that can
   *   see `eyeVertex` and a face which cannot see `eyeVertex`
   * - All the faces that can see `eyeVertex` have its visible vertices removed
   *   from the claimed VertexList
   * - A new set of faces is created with each edge of the `horizon` and
   *   `eyeVertex`, each face is connected with the opposite horizon face and
   *   the face on the left/right
   * - The new faces are merged if possible with the opposite horizon face first
   *   and then the faces on the right/left
   * - The vertices removed from all the visible faces are assigned to the new
   *   faces if possible
   *
   * @param {Vertex} eyeVertex
   */
  addVertexToHull (eyeVertex) {
    const horizon = []

    this.unclaimed.clear()

    // remove `eyeVertex` from `eyeVertex.face` so that it can't be added to the
    // `unclaimed` vertex list
    this.removeVertexFromFace(eyeVertex, eyeVertex.face)
    this.computeHorizon(eyeVertex.point, null, eyeVertex.face, horizon)
    this.addNewFaces(eyeVertex, horizon)

    // first merge pass
    // Do the merge with respect to the larger face
    for (let i = 0; i < this.newFaces.length; i += 1) {
      const face = this.newFaces[i]
      if (face.mark === VISIBLE) {
        while (this.doAdjacentMerge(face, MERGE_NON_CONVEX_WRT_LARGER_FACE)) {} // eslint-disable-line no-empty
      }
    }

    // second merge pass
    // Do the merge on non convex faces (a face is marked as non convex in the
    // first pass)
    for (let i = 0; i < this.newFaces.length; i += 1) {
      const face = this.newFaces[i]
      if (face.mark === NON_CONVEX) {
        face.mark = VISIBLE
        while (this.doAdjacentMerge(face, MERGE_NON_CONVEX)) {} // eslint-disable-line no-empty
      }
    }

    // reassign `unclaimed` vertices to the new faces
    this.resolveUnclaimedPoints(this.newFaces)
  }

  build () {
    let eyeVertex
    this.createInitialSimplex()
    while ((eyeVertex = this.nextVertexToAdd())) {
      this.addVertexToHull(eyeVertex)
    }
    this.reindexFaceAndVertices()
  }
}

module.exports = QuickHull

},{"../../../maths/vec3/dot":232,"./Face":356,"./Vertex":359,"./VertexList":360,"./get-plane-normal":361,"./point-line-distance":363}],359:[function(require,module,exports){
/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

class Vertex {
  constructor (point, index) {
    this.point = point
    // index in the input array
    this.index = index
    // vertex is a double linked list node
    this.next = null
    this.prev = null
    // the face that is able to see this point
    this.face = null
  }
}

module.exports = Vertex

},{}],360:[function(require,module,exports){
/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

class VertexList {
  constructor () {
    this.head = null
    this.tail = null
  }

  clear () {
    this.head = this.tail = null
  }

  /**
   * Inserts a `node` before `target`, it's assumed that
   * `target` belongs to this doubly linked list
   *
   * @param {*} target
   * @param {*} node
   */
  insertBefore (target, node) {
    node.prev = target.prev
    node.next = target
    if (!node.prev) {
      this.head = node
    } else {
      node.prev.next = node
    }
    target.prev = node
  }

  /**
   * Inserts a `node` after `target`, it's assumed that
   * `target` belongs to this doubly linked list
   *
   * @param {Vertex} target
   * @param {Vertex} node
   */
  insertAfter (target, node) {
    node.prev = target
    node.next = target.next
    if (!node.next) {
      this.tail = node
    } else {
      node.next.prev = node
    }
    target.next = node
  }

  /**
   * Appends a `node` to the end of this doubly linked list
   * Note: `node.next` will be unlinked from `node`
   * Note: if `node` is part of another linked list call `addAll` instead
   *
   * @param {*} node
   */
  add (node) {
    if (!this.head) {
      this.head = node
    } else {
      this.tail.next = node
    }
    node.prev = this.tail
    // since node is the new end it doesn't have a next node
    node.next = null
    this.tail = node
  }

  /**
   * Appends a chain of nodes where `node` is the head,
   * the difference with `add` is that it correctly sets the position
   * of the node list `tail` property
   *
   * @param {*} node
   */
  addAll (node) {
    if (!this.head) {
      this.head = node
    } else {
      this.tail.next = node
    }
    node.prev = this.tail

    // find the end of the list
    while (node.next) {
      node = node.next
    }
    this.tail = node
  }

  /**
   * Deletes a `node` from this linked list, it's assumed that `node` is a
   * member of this linked list
   *
   * @param {*} node
   */
  remove (node) {
    if (!node.prev) {
      this.head = node.next
    } else {
      node.prev.next = node.next
    }

    if (!node.next) {
      this.tail = node.prev
    } else {
      node.next.prev = node.prev
    }
  }

  /**
   * Removes a chain of nodes whose head is `a` and whose tail is `b`,
   * it's assumed that `a` and `b` belong to this list and also that `a`
   * comes before `b` in the linked list
   *
   * @param {*} a
   * @param {*} b
   */
  removeChain (a, b) {
    if (!a.prev) {
      this.head = b.next
    } else {
      a.prev.next = b.next
    }

    if (!b.next) {
      this.tail = a.prev
    } else {
      b.next.prev = a.prev
    }
  }

  first () {
    return this.head
  }

  isEmpty () {
    return !this.head
  }
}

module.exports = VertexList

},{}],361:[function(require,module,exports){
const cross = require('../../../maths/vec3/cross')
const normalize = require('../../../maths/vec3/normalize')
const subtract = require('../../../maths/vec3/subtract')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

const planeNormal = (out, point1, point2, point3) => {
  const tmp = [0, 0, 0]
  subtract(out, point1, point2)
  subtract(tmp, point2, point3)
  cross(out, out, tmp)
  return normalize(out, out)
}

module.exports = planeNormal

},{"../../../maths/vec3/cross":229,"../../../maths/vec3/normalize":244,"../../../maths/vec3/subtract":253}],362:[function(require,module,exports){
const QuickHull = require('./QuickHull')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

const runner = (points, options = {}) => {
  const instance = new QuickHull(points)
  instance.build()
  return instance.collectFaces(options.skipTriangulation)
}

module.exports = runner

},{"./QuickHull":358}],363:[function(require,module,exports){
const cross = require('../../../maths/vec3/cross')
const subtract = require('../../../maths/vec3/subtract')
const squaredLength = require('../../../maths/vec3/squaredLength')

/*
 * Original source from quickhull3d (https://github.com/mauriciopoppe/quickhull3d)
 * Copyright (c) 2015 Mauricio Poppe
 *
 * Adapted to JSCAD by Jeff Gay
 */

const distanceSquared = (p, a, b) => {
  // == parallelogram solution
  //
  //            s
  //      __a________b__
  //       /   |    /
  //      /   h|   /
  //     /_____|__/
  //    p
  //
  //  s = b - a
  //  area = s * h
  //  |ap x s| = s * h
  //  h = |ap x s| / s
  //
  const ab = []
  const ap = []
  const cr = []
  subtract(ab, b, a)
  subtract(ap, p, a)
  const area = squaredLength(cross(cr, ap, ab))
  const s = squaredLength(ab)
  if (s === 0) {
    throw Error('a and b are the same point')
  }
  return area / s
}

const pointLineDistance = (point, a, b) => Math.sqrt(distanceSquared(point, a, b))

module.exports = pointLineDistance

},{"../../../maths/vec3/cross":229,"../../../maths/vec3/squaredLength":252,"../../../maths/vec3/subtract":253}],364:[function(require,module,exports){
const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/*
 * Return the unique vertices of a geometry
 */
const toUniquePoints = (geometries) => {
  const found = new Set()
  const uniquePoints = []

  const addPoint = (point) => {
    const key = point.toString()
    if (!found.has(key)) {
      uniquePoints.push(point)
      found.add(key)
    }
  }

  geometries.forEach((geometry) => {
    if (geom2.isA(geometry)) {
      geom2.toPoints(geometry).forEach(addPoint)
    } else if (geom3.isA(geometry)) {
      // points are grouped by polygon
      geom3.toPoints(geometry).forEach((points) => points.forEach(addPoint))
    } else if (path2.isA(geometry)) {
      path2.toPoints(geometry).forEach(addPoint)
    }
  })

  return uniquePoints
}

module.exports = toUniquePoints

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78}],365:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const measureEpsilon = require('../../measurements/measureEpsilon')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

const snapPolygons = require('./snapPolygons')
const mergePolygons = require('./mergePolygons')
const insertTjunctions = require('./insertTjunctions')
const triangulatePolygons = require('./triangulatePolygons')

/*
 */
const generalizePath2 = (options, geometry) => geometry

/*
 */
const generalizeGeom2 = (options, geometry) => geometry

/*
 */
const generalizeGeom3 = (options, geometry) => {
  const defaults = {
    snap: false,
    simplify: false,
    triangulate: false
  }
  const { snap, simplify, triangulate } = Object.assign({}, defaults, options)

  const epsilon = measureEpsilon(geometry)
  let polygons = geom3.toPolygons(geometry)

  // snap the given geometry if requested
  if (snap) {
    polygons = snapPolygons(epsilon, polygons)
  }

  // simplify the polygons if requested
  if (simplify) {
    // TODO implement some mesh decimations
    polygons = mergePolygons(epsilon, polygons)
  }

  // triangulate the polygons if requested
  if (triangulate) {
    polygons = insertTjunctions(polygons)
    polygons = triangulatePolygons(epsilon, polygons)
  }

  // FIXME replace with geom3.cloneShallow() when available
  const clone = Object.assign({}, geometry)
  clone.polygons = polygons

  return clone
}

/**
 * Apply various modifications in proper order to produce a generalized geometry.
 * @param {Object} options - options for modifications
 * @param {Boolean} [options.snap=false] the geometries should be snapped to epsilons
 * @param {Boolean} [options.simplify=false] the geometries should be simplified
 * @param {Boolean} [options.triangulate=false] the geometries should be triangulated
 * @param {...Object} geometries - the geometries to generalize
 * @return {Object|Array} the modified geometry, or a list of modified geometries
 * @alias module:modeling/modifiers.generalize
 */
const generalize = (options, ...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return generalizePath2(options, geometry)
    if (geom2.isA(geometry)) return generalizeGeom2(options, geometry)
    if (geom3.isA(geometry)) return generalizeGeom3(options, geometry)
    throw new Error('invalid geometry')
  })
  return results.length === 1 ? results[0] : results
}

module.exports = generalize

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"./insertTjunctions":367,"./mergePolygons":368,"./snapPolygons":372,"./triangulatePolygons":373}],366:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be modified to correct issues, etc.
 * In all cases, these functions returns the results, and never changes the original geometry.
 * @module modeling/modifiers
 * @example
 * const { snap } = require('@jscad/modeling').modifiers
 */
module.exports = {
  generalize: require('./generalize'),
  snap: require('./snap'),
  retessellate: require('./retessellate')
}

},{"./generalize":365,"./retessellate":370,"./snap":371}],367:[function(require,module,exports){
const constants = require('../../maths/constants')
const vec3 = require('../../maths/vec3')
const poly3 = require('../../geometries/poly3')

const assert = false

const getTag = (vertex) => `${vertex}`

const addSide = (sidemap, vertextag2sidestart, vertextag2sideend, vertex0, vertex1, polygonindex) => {
  const starttag = getTag(vertex0)
  const endtag = getTag(vertex1)
  if (assert && starttag === endtag) throw new Error('assert failed')
  const newsidetag = `${starttag}/${endtag}`
  const reversesidetag = `${endtag}/${starttag}`
  if (sidemap.has(reversesidetag)) {
    // remove the opposing side from mappings
    deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, vertex1, vertex0, null)
    return null
  }
  // add the side to the mappings
  const newsideobj = {
    vertex0: vertex0,
    vertex1: vertex1,
    polygonindex: polygonindex
  }
  if (!(sidemap.has(newsidetag))) {
    sidemap.set(newsidetag, [newsideobj])
  } else {
    sidemap.get(newsidetag).push(newsideobj)
  }
  if (vertextag2sidestart.has(starttag)) {
    vertextag2sidestart.get(starttag).push(newsidetag)
  } else {
    vertextag2sidestart.set(starttag, [newsidetag])
  }
  if (vertextag2sideend.has(endtag)) {
    vertextag2sideend.get(endtag).push(newsidetag)
  } else {
    vertextag2sideend.set(endtag, [newsidetag])
  }
  return newsidetag
}

const deleteSide = (sidemap, vertextag2sidestart, vertextag2sideend, vertex0, vertex1, polygonindex) => {
  const starttag = getTag(vertex0)
  const endtag = getTag(vertex1)
  const sidetag = `${starttag}/${endtag}`
  if (assert && !(sidemap.has(sidetag))) throw new Error('assert failed')
  let idx = -1
  const sideobjs = sidemap.get(sidetag)
  for (let i = 0; i < sideobjs.length; i++) {
    const sideobj = sideobjs[i]
    let sidetag = getTag(sideobj.vertex0)
    if (sidetag !== starttag) continue
    sidetag = getTag(sideobj.vertex1)
    if (sidetag !== endtag) continue
    if (polygonindex !== null) {
      if (sideobj.polygonindex !== polygonindex) continue
    }
    idx = i
    break
  }
  if (assert && idx < 0) throw new Error('assert failed')
  sideobjs.splice(idx, 1)
  if (sideobjs.length === 0) {
    sidemap.delete(sidetag)
  }

  // adjust start and end lists
  idx = vertextag2sidestart.get(starttag).indexOf(sidetag)
  if (assert && idx < 0) throw new Error('assert failed')
  vertextag2sidestart.get(starttag).splice(idx, 1)
  if (vertextag2sidestart.get(starttag).length === 0) {
    vertextag2sidestart.delete(starttag)
  }

  idx = vertextag2sideend.get(endtag).indexOf(sidetag)
  if (assert && idx < 0) throw new Error('assert failed')
  vertextag2sideend.get(endtag).splice(idx, 1)
  if (vertextag2sideend.get(endtag).length === 0) {
    vertextag2sideend.delete(endtag)
  }
}

/*
  Suppose we have two polygons ACDB and EDGF:

   A-----B
   |     |
   |     E--F
   |     |  |
   C-----D--G

  Note that vertex E forms a T-junction on the side BD. In this case some STL slicers will complain
  that the solid is not watertight. This is because the watertightness check is done by checking if
  each side DE is matched by another side ED.

  This function will return a new solid with ACDB replaced by ACDEB

  Note that this can create polygons that are slightly non-convex (due to rounding errors). Therefore the result should
  not be used for further CSG operations!

  Note this function is meant to be used to preprocess geometries when triangulation is required, i.e. AMF, STL, etc.
  Do not use the results in other operations.
*/

/*
 * Insert missing vertices for T junctions, which creates polygons that can be triangulated.
 * @param {Array} polygons - the original polygons which may or may not have T junctions
 * @return original polygons (if no T junctions found) or new polygons with updated vertices
 */
const insertTjunctions = (polygons) => {
  // STEP 1 : build a map of 'unmatched' sides from the polygons
  // i.e. side AB in one polygon does not have a matching side BA in another polygon
  const sidemap = new Map()
  for (let polygonindex = 0; polygonindex < polygons.length; polygonindex++) {
    const polygon = polygons[polygonindex]
    const numvertices = polygon.vertices.length
    if (numvertices >= 3) {
      let vertex = polygon.vertices[0]
      let vertextag = getTag(vertex)
      for (let vertexindex = 0; vertexindex < numvertices; vertexindex++) {
        let nextvertexindex = vertexindex + 1
        if (nextvertexindex === numvertices) nextvertexindex = 0

        const nextvertex = polygon.vertices[nextvertexindex]
        const nextvertextag = getTag(nextvertex)

        const sidetag = `${vertextag}/${nextvertextag}`
        const reversesidetag = `${nextvertextag}/${vertextag}`
        if (sidemap.has(reversesidetag)) {
          // this side matches the same side in another polygon. Remove from sidemap
          // FIXME is this check necessary? there should only be ONE(1) opposing side
          // FIXME assert ?
          const ar = sidemap.get(reversesidetag)
          ar.splice(-1, 1)
          if (ar.length === 0) {
            sidemap.delete(reversesidetag)
          }
        } else {
          const sideobj = {
            vertex0: vertex,
            vertex1: nextvertex,
            polygonindex: polygonindex
          }
          if (!(sidemap.has(sidetag))) {
            sidemap.set(sidetag, [sideobj])
          } else {
            sidemap.get(sidetag).push(sideobj)
          }
        }
        vertex = nextvertex
        vertextag = nextvertextag
      }
    } else {
      console.warn('warning: invalid polygon found during insertTjunctions')
    }
  }

  if (sidemap.size > 0) {
    // STEP 2 : create a list of starting sides and ending sides
    const vertextag2sidestart = new Map()
    const vertextag2sideend = new Map()
    const sidesToCheck = new Map()
    for (const [sidetag, sideobjs] of sidemap) {
      sidesToCheck.set(sidetag, true)
      sideobjs.forEach((sideobj) => {
        const starttag = getTag(sideobj.vertex0)
        const endtag = getTag(sideobj.vertex1)
        if (vertextag2sidestart.has(starttag)) {
          vertextag2sidestart.get(starttag).push(sidetag)
        } else {
          vertextag2sidestart.set(starttag, [sidetag])
        }
        if (vertextag2sideend.has(endtag)) {
          vertextag2sideend.get(endtag).push(sidetag)
        } else {
          vertextag2sideend.set(endtag, [sidetag])
        }
      })
    }

    // STEP 3 : if sidemap is not empty
    const newpolygons = polygons.slice(0) // make a copy in order to replace polygons inline
    while (true) {
      if (sidemap.size === 0) break

      for (const sidetag of sidemap.keys()) {
        sidesToCheck.set(sidetag, true)
      }

      let donesomething = false
      while (true) {
        const sidetags = Array.from(sidesToCheck.keys())
        if (sidetags.length === 0) break // sidesToCheck is empty, we're done!
        const sidetagtocheck = sidetags[0]
        let donewithside = true
        if (sidemap.has(sidetagtocheck)) {
          const sideobjs = sidemap.get(sidetagtocheck)
          if (assert && sideobjs.length === 0) throw new Error('assert failed')
          const sideobj = sideobjs[0]
          for (let directionindex = 0; directionindex < 2; directionindex++) {
            const startvertex = (directionindex === 0) ? sideobj.vertex0 : sideobj.vertex1
            const endvertex = (directionindex === 0) ? sideobj.vertex1 : sideobj.vertex0
            const startvertextag = getTag(startvertex)
            const endvertextag = getTag(endvertex)
            let matchingsides = []
            if (directionindex === 0) {
              if (vertextag2sideend.has(startvertextag)) {
                matchingsides = vertextag2sideend.get(startvertextag)
              }
            } else {
              if (vertextag2sidestart.has(startvertextag)) {
                matchingsides = vertextag2sidestart.get(startvertextag)
              }
            }
            for (let matchingsideindex = 0; matchingsideindex < matchingsides.length; matchingsideindex++) {
              const matchingsidetag = matchingsides[matchingsideindex]
              const matchingside = sidemap.get(matchingsidetag)[0]
              const matchingsidestartvertex = (directionindex === 0) ? matchingside.vertex0 : matchingside.vertex1
              const matchingsideendvertex = (directionindex === 0) ? matchingside.vertex1 : matchingside.vertex0
              const matchingsidestartvertextag = getTag(matchingsidestartvertex)
              const matchingsideendvertextag = getTag(matchingsideendvertex)
              if (assert && matchingsideendvertextag !== startvertextag) throw new Error('assert failed')
              if (matchingsidestartvertextag === endvertextag) {
                // matchingside cancels sidetagtocheck
                deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, startvertex, endvertex, null)
                deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, endvertex, startvertex, null)
                donewithside = false
                directionindex = 2 // skip reverse direction check
                donesomething = true
                break
              } else {
                const startpos = startvertex
                const endpos = endvertex
                const checkpos = matchingsidestartvertex
                const direction = vec3.subtract(vec3.create(), checkpos, startpos)
                // Now we need to check if endpos is on the line startpos-checkpos:
                const t = vec3.dot(vec3.subtract(vec3.create(), endpos, startpos), direction) / vec3.dot(direction, direction)
                if ((t > 0) && (t < 1)) {
                  const closestpoint = vec3.scale(vec3.create(), direction, t)
                  vec3.add(closestpoint, closestpoint, startpos)
                  const distancesquared = vec3.squaredDistance(closestpoint, endpos)
                  if (distancesquared < (constants.EPS * constants.EPS)) {
                    // Yes it's a t-junction! We need to split matchingside in two:
                    const polygonindex = matchingside.polygonindex
                    const polygon = newpolygons[polygonindex]
                    // find the index of startvertextag in polygon:
                    const insertionvertextag = getTag(matchingside.vertex1)
                    let insertionvertextagindex = -1
                    for (let i = 0; i < polygon.vertices.length; i++) {
                      if (getTag(polygon.vertices[i]) === insertionvertextag) {
                        insertionvertextagindex = i
                        break
                      }
                    }
                    if (assert && insertionvertextagindex < 0) throw new Error('assert failed')
                    // split the side by inserting the vertex:
                    const newvertices = polygon.vertices.slice(0)
                    newvertices.splice(insertionvertextagindex, 0, endvertex)
                    const newpolygon = poly3.create(newvertices)

                    newpolygons[polygonindex] = newpolygon

                    // remove the original sides from our maps
                    deleteSide(sidemap, vertextag2sidestart, vertextag2sideend, matchingside.vertex0, matchingside.vertex1, polygonindex)
                    const newsidetag1 = addSide(sidemap, vertextag2sidestart, vertextag2sideend, matchingside.vertex0, endvertex, polygonindex)
                    const newsidetag2 = addSide(sidemap, vertextag2sidestart, vertextag2sideend, endvertex, matchingside.vertex1, polygonindex)
                    if (newsidetag1 !== null) sidesToCheck.set(newsidetag1, true)
                    if (newsidetag2 !== null) sidesToCheck.set(newsidetag2, true)
                    donewithside = false
                    directionindex = 2 // skip reverse direction check
                    donesomething = true
                    break
                  } // if(distancesquared < 1e-10)
                } // if( (t > 0) && (t < 1) )
              } // if(endingstidestartvertextag === endvertextag)
            } // for matchingsideindex
          } // for directionindex
        } // if(sidetagtocheck in sidemap)
        if (donewithside) {
          sidesToCheck.delete(sidetagtocheck)
        }
      }
      if (!donesomething) break
    }
    polygons = newpolygons
  }
  sidemap.clear()

  return polygons
}

module.exports = insertTjunctions

},{"../../geometries/poly3":95,"../../maths/constants":110,"../../maths/vec3":237}],368:[function(require,module,exports){
const aboutEqualNormals = require('../../maths/utils/aboutEqualNormals')
const vec3 = require('../../maths/vec3')

const poly3 = require('../../geometries/poly3')

// create a set of edges from the given polygon, and link the edges as well
const createEdges = (polygon) => {
  const points = poly3.toPoints(polygon)
  const edges = []
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    const edge = {
      v1: points[i],
      v2: points[j]
    }
    edges.push(edge)
  }
  // link the edges together
  for (let i = 0; i < edges.length; i++) {
    const j = (i + 1) % points.length
    edges[i].next = edges[j]
    edges[j].prev = edges[i]
  }
  return edges
}

const insertEdge = (edges, edge) => {
  const key = `${edge.v1}:${edge.v2}`
  edges.set(key, edge)
}

const deleteEdge = (edges, edge) => {
  const key = `${edge.v1}:${edge.v2}`
  edges.delete(key)
}

const findOppositeEdge = (edges, edge) => {
  const key = `${edge.v2}:${edge.v1}` // NOTE: OPPOSITE OF INSERT KEY
  return edges.get(key)
}

// calculate the two adjoining angles between the opposing edges
const calculateAnglesBetween = (current, opposite, normal) => {
  let v0 = current.prev.v1
  let v1 = current.prev.v2
  let v2 = opposite.next.v2
  const angle1 = calculateAngle(v0, v1, v2, normal)

  v0 = opposite.prev.v1
  v1 = opposite.prev.v2
  v2 = current.next.v2
  const angle2 = calculateAngle(v0, v1, v2, normal)

  return [angle1, angle2]
}

const v1 = vec3.create()
const v2 = vec3.create()

const calculateAngle = (prevpoint, point, nextpoint, normal) => {
  const d0 = vec3.subtract(v1, point, prevpoint)
  const d1 = vec3.subtract(v2, nextpoint, point)
  vec3.cross(d0, d0, d1)
  return vec3.dot(d0, normal)
}

// create a polygon starting from the given edge (if possible)
const createPolygonAnd = (edge) => {
  let polygon
  const points = []
  while (edge.next) {
    const next = edge.next

    points.push(edge.v1)

    edge.v1 = null
    edge.v2 = null
    edge.next = null
    edge.prev = null

    edge = next
  }
  if (points.length > 0) polygon = poly3.create(points)
  return polygon
}

/*
 * Merge COPLANAR polygons that share common edges.
 * @param {poly3[]} sourcepolygons - list of polygons
 * @returns {poly3[]} new set of polygons
 */
const mergeCoplanarPolygons = (sourcepolygons) => {
  if (sourcepolygons.length < 2) return sourcepolygons

  const normal = sourcepolygons[0].plane
  const polygons = sourcepolygons.slice()
  const edgeList = new Map()

  while (polygons.length > 0) { // NOTE: the length of polygons WILL change
    const polygon = polygons.shift()
    const edges = createEdges(polygon)
    for (let i = 0; i < edges.length; i++) {
      const current = edges[i]
      const opposite = findOppositeEdge(edgeList, current)
      if (opposite) {
        const angles = calculateAnglesBetween(current, opposite, normal)
        if (angles[0] >= 0 && angles[1] >= 0) {
          const edge1 = opposite.next
          const edge2 = current.next
          // adjust the edges, linking together opposing polygons
          current.prev.next = opposite.next
          current.next.prev = opposite.prev

          opposite.prev.next = current.next
          opposite.next.prev = current.prev

          // remove the opposing edges
          current.v1 = null
          current.v2 = null
          current.next = null
          current.prev = null

          deleteEdge(edgeList, opposite)

          opposite.v1 = null
          opposite.v2 = null
          opposite.next = null
          opposite.prev = null

          const mergeEdges = (list, e1, e2) => {
            const newedge = {
              v1: e2.v1,
              v2: e1.v2,
              next: e1.next,
              prev: e2.prev
            }
            // link in newedge
            e2.prev.next = newedge
            e1.next.prev = newedge
            // remove old edges
            deleteEdge(list, e1)
            e1.v1 = null
            e1.v2 = null
            e1.next = null
            e1.prev = null

            deleteEdge(list, e2)
            e2.v1 = null
            e2.v2 = null
            e2.next = null
            e2.prev = null
          }

          if (angles[0] === 0.0) {
            mergeEdges(edgeList, edge1, edge1.prev)
          }
          if (angles[1] === 0.0) {
            mergeEdges(edgeList, edge2, edge2.prev)
          }
        }
      } else {
        if (current.next) insertEdge(edgeList, current)
      }
    }
  }

  // build a set of polygons from the remaining edges
  const destpolygons = []
  edgeList.forEach((edge) => {
    const polygon = createPolygonAnd(edge)
    if (polygon) destpolygons.push(polygon)
  })

  edgeList.clear()

  return destpolygons
}

const coplanar = (plane1, plane2) => {
  // expect the same distance from the origin, within tolerance
  if (Math.abs(plane1[3] - plane2[3]) < 0.00000015) {
    return aboutEqualNormals(plane1, plane2)
  }
  return false
}

const mergePolygons = (epsilon, polygons) => {
  const polygonsPerPlane = [] // elements: [plane, [poly3...]]
  polygons.forEach((polygon) => {
    const mapping = polygonsPerPlane.find((element) => coplanar(element[0], poly3.plane(polygon)))
    if (mapping) {
      const polygons = mapping[1]
      polygons.push(polygon)
    } else {
      polygonsPerPlane.push([poly3.plane(polygon), [polygon]])
    }
  })

  let destpolygons = []
  polygonsPerPlane.forEach((mapping) => {
    const sourcepolygons = mapping[1]
    const retesselayedpolygons = mergeCoplanarPolygons(sourcepolygons)
    destpolygons = destpolygons.concat(retesselayedpolygons)
  })
  return destpolygons
}

module.exports = mergePolygons

},{"../../geometries/poly3":95,"../../maths/utils/aboutEqualNormals":182,"../../maths/vec3":237}],369:[function(require,module,exports){
const { EPS } = require('../../maths/constants')

const line2 = require('../../maths/line2')
const vec2 = require('../../maths/vec2')
const OrthoNormalBasis = require('../../maths/OrthoNormalBasis')
const interpolateBetween2DPointsForY = require('../../maths/utils/interpolateBetween2DPointsForY')

const { insertSorted, fnNumberSort } = require('../../utils')

const poly3 = require('../../geometries/poly3')

/*
 * Retesselation for a set of COPLANAR polygons.
 * @param {poly3[]} sourcepolygons - list of polygons
 * @returns {poly3[]} new set of polygons
 */
const reTesselateCoplanarPolygons = (sourcepolygons) => {
  if (sourcepolygons.length < 2) return sourcepolygons

  const destpolygons = []
  const numpolygons = sourcepolygons.length
  const plane = poly3.plane(sourcepolygons[0])
  const orthobasis = new OrthoNormalBasis(plane)
  const polygonvertices2d = [] // array of array of Vector2D
  const polygontopvertexindexes = [] // array of indexes of topmost vertex per polygon
  const topy2polygonindexes = new Map()
  const ycoordinatetopolygonindexes = new Map()

  // convert all polygon vertices to 2D
  // Make a list of all encountered y coordinates
  // And build a map of all polygons that have a vertex at a certain y coordinate:
  const ycoordinatebins = new Map()
  const ycoordinateBinningFactor = 10 / EPS
  for (let polygonindex = 0; polygonindex < numpolygons; polygonindex++) {
    const poly3d = sourcepolygons[polygonindex]
    let vertices2d = []
    let numvertices = poly3d.vertices.length
    let minindex = -1
    if (numvertices > 0) {
      let miny
      let maxy
      for (let i = 0; i < numvertices; i++) {
        let pos2d = orthobasis.to2D(poly3d.vertices[i])
        // perform binning of y coordinates: If we have multiple vertices very
        // close to each other, give them the same y coordinate:
        const ycoordinatebin = Math.floor(pos2d[1] * ycoordinateBinningFactor)
        let newy
        if (ycoordinatebins.has(ycoordinatebin)) {
          newy = ycoordinatebins.get(ycoordinatebin)
        } else if (ycoordinatebins.has(ycoordinatebin + 1)) {
          newy = ycoordinatebins.get(ycoordinatebin + 1)
        } else if (ycoordinatebins.has(ycoordinatebin - 1)) {
          newy = ycoordinatebins.get(ycoordinatebin - 1)
        } else {
          newy = pos2d[1]
          ycoordinatebins.set(ycoordinatebin, pos2d[1])
        }
        pos2d = vec2.fromValues(pos2d[0], newy)
        vertices2d.push(pos2d)
        const y = pos2d[1]
        if ((i === 0) || (y < miny)) {
          miny = y
          minindex = i
        }
        if ((i === 0) || (y > maxy)) {
          maxy = y
        }
        let polygonindexes = ycoordinatetopolygonindexes.get(y)
        if (!polygonindexes) {
          polygonindexes = {} // PERF
          ycoordinatetopolygonindexes.set(y, polygonindexes)
        }
        polygonindexes[polygonindex] = true
      }
      if (miny >= maxy) {
        // degenerate polygon, all vertices have same y coordinate. Just ignore it from now:
        vertices2d = []
        numvertices = 0
        minindex = -1
      } else {
        let polygonindexes = topy2polygonindexes.get(miny)
        if (!polygonindexes) {
          polygonindexes = []
          topy2polygonindexes.set(miny, polygonindexes)
        }
        polygonindexes.push(polygonindex)
      }
    } // if(numvertices > 0)
    // reverse the vertex order:
    vertices2d.reverse()
    minindex = numvertices - minindex - 1
    polygonvertices2d.push(vertices2d)
    polygontopvertexindexes.push(minindex)
  }

  const ycoordinates = []
  ycoordinatetopolygonindexes.forEach((polylist, y) => ycoordinates.push(y))
  ycoordinates.sort(fnNumberSort)

  // Now we will iterate over all y coordinates, from lowest to highest y coordinate
  // activepolygons: source polygons that are 'active', i.e. intersect with our y coordinate
  //   Is sorted so the polygons are in left to right order
  // Each element in activepolygons has these properties:
  //        polygonindex: the index of the source polygon (i.e. an index into the sourcepolygons
  //                      and polygonvertices2d arrays)
  //        leftvertexindex: the index of the vertex at the left side of the polygon (lowest x)
  //                         that is at or just above the current y coordinate
  //        rightvertexindex: dito at right hand side of polygon
  //        topleft, bottomleft: coordinates of the left side of the polygon crossing the current y coordinate
  //        topright, bottomright: coordinates of the right hand side of the polygon crossing the current y coordinate
  let activepolygons = []
  let prevoutpolygonrow = []
  for (let yindex = 0; yindex < ycoordinates.length; yindex++) {
    const newoutpolygonrow = []
    const ycoordinate = ycoordinates[yindex]

    // update activepolygons for this y coordinate:
    // - Remove any polygons that end at this y coordinate
    // - update leftvertexindex and rightvertexindex (which point to the current vertex index
    //   at the the left and right side of the polygon
    // Iterate over all polygons that have a corner at this y coordinate:
    const polygonindexeswithcorner = ycoordinatetopolygonindexes.get(ycoordinate)
    for (let activepolygonindex = 0; activepolygonindex < activepolygons.length; ++activepolygonindex) {
      const activepolygon = activepolygons[activepolygonindex]
      const polygonindex = activepolygon.polygonindex
      if (polygonindexeswithcorner[polygonindex]) {
        // this active polygon has a corner at this y coordinate:
        const vertices2d = polygonvertices2d[polygonindex]
        const numvertices = vertices2d.length
        let newleftvertexindex = activepolygon.leftvertexindex
        let newrightvertexindex = activepolygon.rightvertexindex
        // See if we need to increase leftvertexindex or decrease rightvertexindex:
        while (true) {
          let nextleftvertexindex = newleftvertexindex + 1
          if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0
          if (vertices2d[nextleftvertexindex][1] !== ycoordinate) break
          newleftvertexindex = nextleftvertexindex
        }
        let nextrightvertexindex = newrightvertexindex - 1
        if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1
        if (vertices2d[nextrightvertexindex][1] === ycoordinate) {
          newrightvertexindex = nextrightvertexindex
        }
        if ((newleftvertexindex !== activepolygon.leftvertexindex) && (newleftvertexindex === newrightvertexindex)) {
          // We have increased leftvertexindex or decreased rightvertexindex, and now they point to the same vertex
          // This means that this is the bottom point of the polygon. We'll remove it:
          activepolygons.splice(activepolygonindex, 1)
          --activepolygonindex
        } else {
          activepolygon.leftvertexindex = newleftvertexindex
          activepolygon.rightvertexindex = newrightvertexindex
          activepolygon.topleft = vertices2d[newleftvertexindex]
          activepolygon.topright = vertices2d[newrightvertexindex]
          let nextleftvertexindex = newleftvertexindex + 1
          if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0
          activepolygon.bottomleft = vertices2d[nextleftvertexindex]
          let nextrightvertexindex = newrightvertexindex - 1
          if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1
          activepolygon.bottomright = vertices2d[nextrightvertexindex]
        }
      } // if polygon has corner here
    } // for activepolygonindex
    let nextycoordinate
    if (yindex >= ycoordinates.length - 1) {
      // last row, all polygons must be finished here:
      activepolygons = []
      nextycoordinate = null
    } else { // yindex < ycoordinates.length-1
      nextycoordinate = Number(ycoordinates[yindex + 1])
      const middleycoordinate = 0.5 * (ycoordinate + nextycoordinate)
      // update activepolygons by adding any polygons that start here:
      const startingpolygonindexes = topy2polygonindexes.get(ycoordinate)
      for (const polygonindexKey in startingpolygonindexes) {
        const polygonindex = startingpolygonindexes[polygonindexKey]
        const vertices2d = polygonvertices2d[polygonindex]
        const numvertices = vertices2d.length
        const topvertexindex = polygontopvertexindexes[polygonindex]
        // the top of the polygon may be a horizontal line. In that case topvertexindex can point to any point on this line.
        // Find the left and right topmost vertices which have the current y coordinate:
        let topleftvertexindex = topvertexindex
        while (true) {
          let i = topleftvertexindex + 1
          if (i >= numvertices) i = 0
          if (vertices2d[i][1] !== ycoordinate) break
          if (i === topvertexindex) break // should not happen, but just to prevent endless loops
          topleftvertexindex = i
        }
        let toprightvertexindex = topvertexindex
        while (true) {
          let i = toprightvertexindex - 1
          if (i < 0) i = numvertices - 1
          if (vertices2d[i][1] !== ycoordinate) break
          if (i === topleftvertexindex) break // should not happen, but just to prevent endless loops
          toprightvertexindex = i
        }
        let nextleftvertexindex = topleftvertexindex + 1
        if (nextleftvertexindex >= numvertices) nextleftvertexindex = 0
        let nextrightvertexindex = toprightvertexindex - 1
        if (nextrightvertexindex < 0) nextrightvertexindex = numvertices - 1
        const newactivepolygon = {
          polygonindex: polygonindex,
          leftvertexindex: topleftvertexindex,
          rightvertexindex: toprightvertexindex,
          topleft: vertices2d[topleftvertexindex],
          topright: vertices2d[toprightvertexindex],
          bottomleft: vertices2d[nextleftvertexindex],
          bottomright: vertices2d[nextrightvertexindex]
        }
        insertSorted(activepolygons, newactivepolygon, (el1, el2) => {
          const x1 = interpolateBetween2DPointsForY(el1.topleft, el1.bottomleft, middleycoordinate)
          const x2 = interpolateBetween2DPointsForY(el2.topleft, el2.bottomleft, middleycoordinate)
          if (x1 > x2) return 1
          if (x1 < x2) return -1
          return 0
        })
      } // for(let polygonindex in startingpolygonindexes)
    } //  yindex < ycoordinates.length-1

    // Now activepolygons is up to date
    // Build the output polygons for the next row in newoutpolygonrow:
    for (const activepolygonKey in activepolygons) {
      const activepolygon = activepolygons[activepolygonKey]

      let x = interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, ycoordinate)
      const topleft = vec2.fromValues(x, ycoordinate)
      x = interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, ycoordinate)
      const topright = vec2.fromValues(x, ycoordinate)
      x = interpolateBetween2DPointsForY(activepolygon.topleft, activepolygon.bottomleft, nextycoordinate)
      const bottomleft = vec2.fromValues(x, nextycoordinate)
      x = interpolateBetween2DPointsForY(activepolygon.topright, activepolygon.bottomright, nextycoordinate)
      const bottomright = vec2.fromValues(x, nextycoordinate)
      const outpolygon = {
        topleft: topleft,
        topright: topright,
        bottomleft: bottomleft,
        bottomright: bottomright,
        leftline: line2.fromPoints(line2.create(), topleft, bottomleft),
        rightline: line2.fromPoints(line2.create(), bottomright, topright)
      }
      if (newoutpolygonrow.length > 0) {
        const prevoutpolygon = newoutpolygonrow[newoutpolygonrow.length - 1]
        const d1 = vec2.distance(outpolygon.topleft, prevoutpolygon.topright)
        const d2 = vec2.distance(outpolygon.bottomleft, prevoutpolygon.bottomright)
        if ((d1 < EPS) && (d2 < EPS)) {
          // we can join this polygon with the one to the left:
          outpolygon.topleft = prevoutpolygon.topleft
          outpolygon.leftline = prevoutpolygon.leftline
          outpolygon.bottomleft = prevoutpolygon.bottomleft
          newoutpolygonrow.splice(newoutpolygonrow.length - 1, 1)
        }
      }
      newoutpolygonrow.push(outpolygon)
    } // for(activepolygon in activepolygons)
    if (yindex > 0) {
      // try to match the new polygons against the previous row:
      const prevcontinuedindexes = new Set()
      const matchedindexes = new Set()
      for (let i = 0; i < newoutpolygonrow.length; i++) {
        const thispolygon = newoutpolygonrow[i]
        for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
          if (!matchedindexes.has(ii)) { // not already processed?
            // We have a match if the sidelines are equal or if the top coordinates
            // are on the sidelines of the previous polygon
            const prevpolygon = prevoutpolygonrow[ii]
            if (vec2.distance(prevpolygon.bottomleft, thispolygon.topleft) < EPS) {
              if (vec2.distance(prevpolygon.bottomright, thispolygon.topright) < EPS) {
                // Yes, the top of this polygon matches the bottom of the previous:
                matchedindexes.add(ii)
                // Now check if the joined polygon would remain convex:
                const v1 = line2.direction(thispolygon.leftline)
                const v2 = line2.direction(prevpolygon.leftline)
                const d1 = v1[0] - v2[0]

                const v3 = line2.direction(thispolygon.rightline)
                const v4 = line2.direction(prevpolygon.rightline)
                const d2 = v3[0] - v4[0]

                const leftlinecontinues = Math.abs(d1) < EPS
                const rightlinecontinues = Math.abs(d2) < EPS
                const leftlineisconvex = leftlinecontinues || (d1 >= 0)
                const rightlineisconvex = rightlinecontinues || (d2 >= 0)
                if (leftlineisconvex && rightlineisconvex) {
                  // yes, both sides have convex corners:
                  // This polygon will continue the previous polygon
                  thispolygon.outpolygon = prevpolygon.outpolygon
                  thispolygon.leftlinecontinues = leftlinecontinues
                  thispolygon.rightlinecontinues = rightlinecontinues
                  prevcontinuedindexes.add(ii)
                }
                break
              }
            }
          } // if(!prevcontinuedindexes.has(ii))
        } // for ii
      } // for i
      for (let ii = 0; ii < prevoutpolygonrow.length; ii++) {
        if (!prevcontinuedindexes.has(ii)) {
          // polygon ends here
          // Finish the polygon with the last point(s):
          const prevpolygon = prevoutpolygonrow[ii]
          prevpolygon.outpolygon.rightpoints.push(prevpolygon.bottomright)
          if (vec2.distance(prevpolygon.bottomright, prevpolygon.bottomleft) > EPS) {
            // polygon ends with a horizontal line:
            prevpolygon.outpolygon.leftpoints.push(prevpolygon.bottomleft)
          }
          // reverse the left half so we get a counterclockwise circle:
          prevpolygon.outpolygon.leftpoints.reverse()
          const points2d = prevpolygon.outpolygon.rightpoints.concat(prevpolygon.outpolygon.leftpoints)
          const vertices3d = points2d.map((point2d) => orthobasis.to3D(point2d))
          const polygon = poly3.fromPointsAndPlane(vertices3d, plane) // TODO support shared

          // if we let empty polygon out, next retesselate will crash
          if (polygon.vertices.length) destpolygons.push(polygon)
        }
      }
    } // if(yindex > 0)
    for (let i = 0; i < newoutpolygonrow.length; i++) {
      const thispolygon = newoutpolygonrow[i]
      if (!thispolygon.outpolygon) {
        // polygon starts here:
        thispolygon.outpolygon = {
          leftpoints: [],
          rightpoints: []
        }
        thispolygon.outpolygon.leftpoints.push(thispolygon.topleft)
        if (vec2.distance(thispolygon.topleft, thispolygon.topright) > EPS) {
          // we have a horizontal line at the top:
          thispolygon.outpolygon.rightpoints.push(thispolygon.topright)
        }
      } else {
        // continuation of a previous row
        if (!thispolygon.leftlinecontinues) {
          thispolygon.outpolygon.leftpoints.push(thispolygon.topleft)
        }
        if (!thispolygon.rightlinecontinues) {
          thispolygon.outpolygon.rightpoints.push(thispolygon.topright)
        }
      }
    }
    prevoutpolygonrow = newoutpolygonrow
  } // for yindex
  return destpolygons
}

module.exports = reTesselateCoplanarPolygons

},{"../../geometries/poly3":95,"../../maths/OrthoNormalBasis":109,"../../maths/constants":110,"../../maths/line2":121,"../../maths/utils/interpolateBetween2DPointsForY":185,"../../maths/vec2":206,"../../utils":414}],370:[function(require,module,exports){
const geom3 = require('../../geometries/geom3')
const poly3 = require('../../geometries/poly3')
const { NEPS } = require('../../maths/constants')
const reTesselateCoplanarPolygons = require('./reTesselateCoplanarPolygons')

/*
  After boolean operations all coplanar polygon fragments are joined by a retesselating
  operation. geom3.reTesselate(geom).
  Retesselation is done through a linear sweep over the polygon surface.
  The sweep line passes over the y coordinates of all vertices in the polygon.
  Polygons are split at each sweep line, and the fragments are joined horizontally and vertically into larger polygons
  (making sure that we will end up with convex polygons).
*/
const retessellate = (geometry) => {
  if (geometry.isRetesselated) {
    return geometry
  }

  const polygons = geom3.toPolygons(geometry).map((polygon, index) => ({ vertices: polygon.vertices, plane: poly3.plane(polygon), index: index }))
  const classified = classifyPolygons(polygons)

  const destPolygons = []
  classified.forEach((group) => {
    if (Array.isArray(group)) {
      const reTessellateCoplanarPolygons = reTesselateCoplanarPolygons(group)
      destPolygons.push(...reTessellateCoplanarPolygons)
    } else {
      destPolygons.push(group)
    }
  })

  const result = geom3.create(destPolygons)
  result.isRetesselated = true

  return result
}

const classifyPolygons = (polygons) => {
  let clusters = [polygons] // a cluster is an array of potentially coplanar polygons
  const nonCoplanar = [] // polygons that are known to be non-coplanar
  // go through each component of the plane starting with the last one (the distance from origin)
  for (let component = 3; component >= 0; component--) {
    const maybeCoplanar = []
    const tolerance = component === 3 ? 0.000000015 : NEPS
    clusters.forEach((cluster) => {
      // sort the cluster by the current component
      cluster.sort(byPlaneComponent(component, tolerance))
      // iterate through the cluster and check if there are polygons which are not coplanar with the others
      // or if there are sub-clusters of coplanar polygons
      let startIndex = 0
      for (let i = 1; i < cluster.length; i++) {
        // if there's a difference larger than the tolerance, split the cluster
        if (cluster[i].plane[component] - cluster[startIndex].plane[component] > tolerance) {
          // if there's a single polygon it's definitely not coplanar with any others
          if (i - startIndex === 1) {
            nonCoplanar.push(cluster[startIndex])
          } else { // we have a new sub cluster of potentially coplanar polygons
            maybeCoplanar.push(cluster.slice(startIndex, i))
          }
          startIndex = i
        }
      }
      // handle the last elements of the cluster
      if (cluster.length - startIndex === 1) {
        nonCoplanar.push(cluster[startIndex])
      } else {
        maybeCoplanar.push(cluster.slice(startIndex))
      }
    })
    // replace previous clusters with the new ones
    clusters = maybeCoplanar
  }
  // restore the original order of the polygons
  const result = []
  // polygons inside the cluster should already be sorted by index
  clusters.forEach((cluster) => {
    if (cluster[0]) result[cluster[0].index] = cluster
  })
  nonCoplanar.forEach((polygon) => { result[polygon.index] = polygon })

  return result
}

const byPlaneComponent = (component, tolerance) => (a, b) => {
  if (a.plane[component] - b.plane[component] > tolerance) {
    return 1
  } else if (b.plane[component] - a.plane[component] > tolerance) {
    return -1
  }
  return 0
}

module.exports = retessellate

},{"../../geometries/geom3":57,"../../geometries/poly3":95,"../../maths/constants":110,"./reTesselateCoplanarPolygons":369}],371:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const vec2 = require('../../maths/vec2')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

const measureEpsilon = require('../../measurements/measureEpsilon')

const snapPolygons = require('./snapPolygons')

const snapPath2 = (geometry) => {
  const epsilon = measureEpsilon(geometry)
  const points = path2.toPoints(geometry)
  const newpoints = points.map((point) => vec2.snap(vec2.create(), point, epsilon))
  // snap can produce duplicate points, remove those
  return path2.create(newpoints)
}

const snapGeom2 = (geometry) => {
  const epsilon = measureEpsilon(geometry)
  const sides = geom2.toSides(geometry)
  let newsides = sides.map((side) => [vec2.snap(vec2.create(), side[0], epsilon), vec2.snap(vec2.create(), side[1], epsilon)])
  // snap can produce sides with zero (0) length, remove those
  newsides = newsides.filter((side) => !vec2.equals(side[0], side[1]))
  return geom2.create(newsides)
}

const snapGeom3 = (geometry) => {
  const epsilon = measureEpsilon(geometry)
  const polygons = geom3.toPolygons(geometry)
  const newpolygons = snapPolygons(epsilon, polygons)
  return geom3.create(newpolygons)
}

/**
 * Snap the given geometries to the overall precision (epsilon) of the geometry.
 * @see measurements.measureEpsilon()
 * @param {...Object} geometries - the geometries to snap
 * @return {Object|Array} the snapped geometry, or a list of snapped geometries
 * @alias module:modeling/modifiers.snap
 */
const snap = (...geometries) => {
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('wrong number of arguments')

  const results = geometries.map((geometry) => {
    if (path2.isA(geometry)) return snapPath2(geometry)
    if (geom2.isA(geometry)) return snapGeom2(geometry)
    if (geom3.isA(geometry)) return snapGeom3(geometry)
    return geometry
  })
  return results.length === 1 ? results[0] : results
}

module.exports = snap

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../maths/vec2":206,"../../measurements/measureEpsilon":278,"../../utils/flatten":412,"./snapPolygons":372}],372:[function(require,module,exports){
const vec3 = require('../../maths/vec3')

const poly3 = require('../../geometries/poly3')

const isValidPoly3 = (epsilon, polygon) => {
  const area = Math.abs(poly3.measureArea(polygon))
  return (Number.isFinite(area) && area > epsilon)
}

/*
 * Snap the given list of polygons to the epsilon.
 */
const snapPolygons = (epsilon, polygons) => {
  let newpolygons = polygons.map((polygon) => {
    const snapvertices = polygon.vertices.map((vertice) => vec3.snap(vec3.create(), vertice, epsilon))
    // only retain unique vertices
    const newvertices = []
    for (let i = 0; i < snapvertices.length; i++) {
      const j = (i + 1) % snapvertices.length
      if (!vec3.equals(snapvertices[i], snapvertices[j])) newvertices.push(snapvertices[i])
    }
    const newpolygon = poly3.create(newvertices)
    if (polygon.color) newpolygon.color = polygon.color
    return newpolygon
  })
  // snap can produce polygons with zero (0) area, remove those
  const epsilonArea = (epsilon * epsilon * Math.sqrt(3) / 4)
  newpolygons = newpolygons.filter((polygon) => isValidPoly3(epsilonArea, polygon))
  return newpolygons
}

module.exports = snapPolygons

},{"../../geometries/poly3":95,"../../maths/vec3":237}],373:[function(require,module,exports){
const vec3 = require('../../maths/vec3')
const poly3 = require('../../geometries/poly3')

const triangulatePolygon = (epsilon, polygon, triangles) => {
  const nv = polygon.vertices.length
  if (nv > 3) {
    if (nv > 4) {
      // split the polygon using a midpoint
      const midpoint = [0, 0, 0]
      polygon.vertices.forEach((vertice) => vec3.add(midpoint, midpoint, vertice))
      vec3.snap(midpoint, vec3.divide(midpoint, midpoint, [nv, nv, nv]), epsilon)
      for (let i = 0; i < nv; i++) {
        const poly = poly3.create([midpoint, polygon.vertices[i], polygon.vertices[(i + 1) % nv]])
        if (polygon.color) poly.color = polygon.color
        triangles.push(poly)
      }
      return
    }
    // exactly 4 vertices, use simple triangulation
    const poly0 = poly3.create([polygon.vertices[0], polygon.vertices[1], polygon.vertices[2]])
    const poly1 = poly3.create([polygon.vertices[0], polygon.vertices[2], polygon.vertices[3]])
    if (polygon.color) {
      poly0.color = polygon.color
      poly1.color = polygon.color
    }
    triangles.push(poly0, poly1)
    return
  }
  // exactly 3 vertices, so return the original
  triangles.push(polygon)
}

/*
 * Convert the given polygons into a list of triangles (polygons with 3 vertices).
 * NOTE: this is possible because poly3 is CONVEX by definition
 */
const triangulatePolygons = (epsilon, polygons) => {
  const triangles = []
  polygons.forEach((polygon) => {
    triangulatePolygon(epsilon, polygon, triangles)
  })
  return triangles
}

module.exports = triangulatePolygons

},{"../../geometries/poly3":95,"../../maths/vec3":237}],374:[function(require,module,exports){
const flatten = require('../../utils/flatten')
const padArrayToLength = require('../../utils/padArrayToLength')
const measureAggregateBoundingBox = require('../../measurements/measureAggregateBoundingBox')
const { translate } = require('./translate')

const validateOptions = (options) => {
  if (!Array.isArray(options.modes) || options.modes.length > 3) throw new Error('align(): modes must be an array of length <= 3')
  options.modes = padArrayToLength(options.modes, 'none', 3)
  if (options.modes.filter((mode) => ['center', 'max', 'min', 'none'].includes(mode)).length !== 3) throw new Error('align(): all modes must be one of "center", "max" or "min"')

  if (!Array.isArray(options.relativeTo) || options.relativeTo.length > 3) throw new Error('align(): relativeTo must be an array of length <= 3')
  options.relativeTo = padArrayToLength(options.relativeTo, 0, 3)
  if (options.relativeTo.filter((alignVal) => (Number.isFinite(alignVal) || alignVal == null)).length !== 3) throw new Error('align(): all relativeTo values must be a number, or null.')

  if (typeof options.grouped !== 'boolean') throw new Error('align(): grouped must be a boolean value.')

  return options
}

const populateRelativeToFromBounds = (relativeTo, modes, bounds) => {
  for (let i = 0; i < 3; i++) {
    if (relativeTo[i] == null) {
      if (modes[i] === 'center') {
        relativeTo[i] = (bounds[0][i] + bounds[1][i]) / 2
      } else if (modes[i] === 'max') {
        relativeTo[i] = bounds[1][i]
      } else if (modes[i] === 'min') {
        relativeTo[i] = bounds[0][i]
      }
    }
  }
  return relativeTo
}

const alignGeometries = (geometry, modes, relativeTo) => {
  const bounds = measureAggregateBoundingBox(geometry)
  const translation = [0, 0, 0]
  for (let i = 0; i < 3; i++) {
    if (modes[i] === 'center') {
      translation[i] = relativeTo[i] - (bounds[0][i] + bounds[1][i]) / 2
    } else if (modes[i] === 'max') {
      translation[i] = relativeTo[i] - bounds[1][i]
    } else if (modes[i] === 'min') {
      translation[i] = relativeTo[i] - bounds[0][i]
    }
  }

  return translate(translation, geometry)
}

/**
 * Align the boundaries of the given geometries using the given options.
 * @param {Object} options - options for aligning
 * @param {Array} [options.modes = ['center', 'center', 'min']] - the point on the geometries to align to for each axis. Valid options are "center", "max", "min", and "none".
 * @param {Array} [options.relativeTo = [0,0,0]] - The point one each axis on which to align the geometries upon.  If the value is null, then the corresponding value from the group's bounding box is used.
 * @param {Boolean} [options.grouped = false] - if true, transform all geometries by the same amount, maintaining the relative positions to each other.
 * @param {...Object} geometries - the geometries to align
 * @return {Object|Array} the aligned geometry, or a list of aligned geometries
 * @alias module:modeling/transforms.align
 *
 * @example
 * let alignedGeometries = align({modes: ['min', 'center', 'none'], relativeTo: [10, null, 10], grouped: true }, geometries)
 */
const align = (options, ...geometries) => {
  const defaults = {
    modes: ['center', 'center', 'min'],
    relativeTo: [0, 0, 0],
    grouped: false
  }
  options = Object.assign({}, defaults, options)

  options = validateOptions(options)
  let { modes, relativeTo, grouped } = options
  geometries = flatten(geometries)
  if (geometries.length === 0) throw new Error('align(): No geometries were provided to act upon')

  if (relativeTo.filter((val) => val == null).length) {
    const bounds = measureAggregateBoundingBox(geometries)
    relativeTo = populateRelativeToFromBounds(relativeTo, modes, bounds)
  }
  if (grouped) {
    geometries = alignGeometries(geometries, modes, relativeTo)
  } else {
    geometries = geometries.map((geometry) => alignGeometries(geometry, modes, relativeTo))
  }
  return geometries.length === 1 ? geometries[0] : geometries
}

module.exports = align

},{"../../measurements/measureAggregateBoundingBox":269,"../../utils/flatten":412,"../../utils/padArrayToLength":416,"./translate":381}],375:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

const measureBoundingBox = require('../../measurements/measureBoundingBox')

const { translate } = require('./translate')

const centerGeometry = (options, object) => {
  const defaults = {
    axes: [true, true, true],
    relativeTo: [0, 0, 0]
  }
  const { axes, relativeTo } = Object.assign({}, defaults, options)

  const bounds = measureBoundingBox(object)
  const offset = [0, 0, 0]
  if (axes[0]) offset[0] = relativeTo[0] - (bounds[0][0] + ((bounds[1][0] - bounds[0][0]) / 2))
  if (axes[1]) offset[1] = relativeTo[1] - (bounds[0][1] + ((bounds[1][1] - bounds[0][1]) / 2))
  if (axes[2]) offset[2] = relativeTo[2] - (bounds[0][2] + ((bounds[1][2] - bounds[0][2]) / 2))
  return translate(offset, object)
}

/**
 * Center the given objects using the given options.
 * @param {Object} options - options for centering
 * @param {Array} [options.axes=[true,true,true]] - axis of which to center, true or false
 * @param {Array} [options.relativeTo=[0,0,0]] - relative point of which to center the objects
 * @param {...Object} objects - the objects to center
 * @return {Object|Array} the centered object, or a list of centered objects
 * @alias module:modeling/transforms.center
 *
 * @example
 * let myshape = center({axes: [true,false,false]}, sphere()) // center about the X axis
 */
const center = (options, ...objects) => {
  const defaults = {
    axes: [true, true, true],
    relativeTo: [0, 0, 0]
  // TODO: Add additional 'methods' of centering: midpoint, centroid
  }
  const { axes, relativeTo } = Object.assign({}, defaults, options)

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')
  if (relativeTo.length !== 3) throw new Error('relativeTo must be an array of length 3')

  options = { axes, relativeTo }

  const results = objects.map((object) => {
    if (path2.isA(object)) return centerGeometry(options, object)
    if (geom2.isA(object)) return centerGeometry(options, object)
    if (geom3.isA(object)) return centerGeometry(options, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

/**
 * Center the given objects about the X axis.
 * @param {...Object} objects - the objects to center
 * @return {Object|Array} the centered object, or a list of centered objects
 * @alias module:modeling/transforms.centerX
 */
const centerX = (...objects) => center({ axes: [true, false, false] }, objects)

/**
 * Center the given objects about the Y axis.
 * @param {...Object} objects - the objects to center
 * @return {Object|Array} the centered object, or a list of centered objects
 * @alias module:modeling/transforms.centerY
 */
const centerY = (...objects) => center({ axes: [false, true, false] }, objects)

/**
 * Center the given objects about the Z axis.
 * @param {...Object} objects - the objects to center
 * @return {Object|Array} the centered object, or a list of centered objects
 * @alias module:modeling/transforms.centerZ
 */
const centerZ = (...objects) => center({ axes: [false, false, true] }, objects)

module.exports = {
  center,
  centerX,
  centerY,
  centerZ
}

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../measurements/measureBoundingBox":273,"../../utils/flatten":412,"./translate":381}],376:[function(require,module,exports){
/**
 * All shapes (primitives or the results of operations) can be transformed, such as scaled or rotated.
 * In all cases, the function returns the results, and never changes the original shapes.
 * @module modeling/transforms
 * @example
 * const { center, rotateX, translate } = require('@jscad/modeling').transforms
 */
module.exports = {
  align: require('./align'),

  center: require('./center').center,
  centerX: require('./center').centerX,
  centerY: require('./center').centerY,
  centerZ: require('./center').centerZ,

  mirror: require('./mirror').mirror,
  mirrorX: require('./mirror').mirrorX,
  mirrorY: require('./mirror').mirrorY,
  mirrorZ: require('./mirror').mirrorZ,

  rotate: require('./rotate').rotate,
  rotateX: require('./rotate').rotateX,
  rotateY: require('./rotate').rotateY,
  rotateZ: require('./rotate').rotateZ,

  scale: require('./scale').scale,
  scaleX: require('./scale').scaleX,
  scaleY: require('./scale').scaleY,
  scaleZ: require('./scale').scaleZ,

  transform: require('./transform'),

  translate: require('./translate').translate,
  translateX: require('./translate').translateX,
  translateY: require('./translate').translateY,
  translateZ: require('./translate').translateZ
}

},{"./align":374,"./center":375,"./mirror":377,"./rotate":378,"./scale":379,"./transform":380,"./translate":381}],377:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const mat4 = require('../../maths/mat4')
const plane = require('../../maths/plane')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/**
 * Mirror the given objects using the given options.
 * @param {Object} options - options for mirror
 * @param {Array} [options.origin=[0,0,0]] - the origin of the plane
 * @param {Array} [options.normal=[0,0,1]] - the normal vector of the plane
 * @param {...Object} objects - the objects to mirror
 * @return {Object|Array} the mirrored object, or a list of mirrored objects
 * @alias module:modeling/transforms.mirror
 *
 * @example
 * let myshape = mirror({normal: [0,0,10]}, cube({center: [0,0,15], radius: [20, 25, 5]}))
 */
const mirror = (options, ...objects) => {
  const defaults = {
    origin: [0, 0, 0],
    normal: [0, 0, 1] // Z axis
  }
  const { origin, normal } = Object.assign({}, defaults, options)

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const planeOfMirror = plane.fromNormalAndPoint(plane.create(), normal, origin)
  // verify the plane, i.e. check that the given normal was valid
  if (Number.isNaN(planeOfMirror[0])) {
    throw new Error('the given origin and normal do not define a proper plane')
  }

  const matrix = mat4.mirrorByPlane(mat4.create(), planeOfMirror)

  const results = objects.map((object) => {
    if (path2.isA(object)) return path2.transform(matrix, object)
    if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

/**
 * Mirror the given objects about the X axis.
 * @param {...Object} objects - the objects to mirror
 * @return {Object|Array} the mirrored object, or a list of mirrored objects
 * @alias module:modeling/transforms.mirrorX
 */
const mirrorX = (...objects) => mirror({ normal: [1, 0, 0] }, objects)

/**
 * Mirror the given objects about the Y axis.
 * @param {...Object} objects - the geometries to mirror
 * @return {Object|Array} the mirrored object, or a list of mirrored objects
 * @alias module:modeling/transforms.mirrorY
 */
const mirrorY = (...objects) => mirror({ normal: [0, 1, 0] }, objects)

/**
 * Mirror the given objects about the Z axis.
 * @param {...Object} objects - the geometries to mirror
 * @return {Object|Array} the mirrored object, or a list of mirrored objects
 * @alias module:modeling/transforms.mirrorZ
 */
const mirrorZ = (...objects) => mirror({ normal: [0, 0, 1] }, objects)

module.exports = {
  mirror,
  mirrorX,
  mirrorY,
  mirrorZ
}

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../maths/mat4":159,"../../maths/plane":178,"../../utils/flatten":412}],378:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const mat4 = require('../../maths/mat4')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/**
 * Rotate the given objects using the given options.
 * @param {Array} angles - angle (RADIANS) of rotations about X, Y, and Z axis
 * @param {...Object} objects - the objects to rotate
 * @return {Object|Array} the rotated object, or a list of rotated objects
 * @alias module:modeling/transforms.rotate
 *
 * @example
 * const newsphere = rotate([TAU / 8, 0, 0], sphere())
 */
const rotate = (angles, ...objects) => {
  if (!Array.isArray(angles)) throw new Error('angles must be an array')

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  // adjust the angles if necessary
  angles = angles.slice() // don't modify the original
  while (angles.length < 3) angles.push(0)

  const yaw = angles[2]
  const pitch = angles[1]
  const roll = angles[0]

  const matrix = mat4.fromTaitBryanRotation(mat4.create(), yaw, pitch, roll)

  const results = objects.map((object) => {
    if (path2.isA(object)) return path2.transform(matrix, object)
    if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

/**
 * Rotate the given objects about the X axis, using the given options.
 * @param {Number} angle - angle (RADIANS) of rotations about X
 * @param {...Object} objects - the objects to rotate
 * @return {Object|Array} the rotated object, or a list of rotated objects
 * @alias module:modeling/transforms.rotateX
 */
const rotateX = (angle, ...objects) => rotate([angle, 0, 0], objects)

/**
 * Rotate the given objects about the Y axis, using the given options.
 * @param {Number} angle - angle (RADIANS) of rotations about Y
 * @param {...Object} objects - the objects to rotate
 * @return {Object|Array} the rotated object, or a list of rotated objects
 * @alias module:modeling/transforms.rotateY
 */
const rotateY = (angle, ...objects) => rotate([0, angle, 0], objects)

/**
 * Rotate the given objects about the Z axis, using the given options.
 * @param {Number} angle - angle (RADIANS) of rotations about Z
 * @param {...Object} objects - the objects to rotate
 * @return {Object|Array} the rotated object, or a list of rotated objects
 * @alias module:modeling/transforms.rotateZ
 */
const rotateZ = (angle, ...objects) => rotate([0, 0, angle], objects)

module.exports = {
  rotate,
  rotateX,
  rotateY,
  rotateZ
}

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../maths/mat4":159,"../../utils/flatten":412}],379:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const mat4 = require('../../maths/mat4')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/**
 * Scale the given objects using the given options.
 * @param {Array} factors - X, Y, Z factors by which to scale the objects
 * @param {...Object} objects - the objects to scale
 * @return {Object|Array} the scaled object, or a list of scaled objects
 * @alias module:modeling/transforms.scale
 *
 * @example
 * let myshape = scale([5, 0, 10], sphere())
 */
const scale = (factors, ...objects) => {
  if (!Array.isArray(factors)) throw new Error('factors must be an array')

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  // adjust the factors if necessary
  factors = factors.slice() // don't modify the original
  while (factors.length < 3) factors.push(1)

  if (factors[0] <= 0 || factors[1] <= 0 || factors[2] <= 0) throw new Error('factors must be positive')

  const matrix = mat4.fromScaling(mat4.create(), factors)

  const results = objects.map((object) => {
    if (path2.isA(object)) return path2.transform(matrix, object)
    if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

/**
 * Scale the given objects about the X axis using the given options.
 * @param {Number} factor - X factor by which to scale the objects
 * @param {...Object} objects - the objects to scale
 * @return {Object|Array} the scaled object, or a list of scaled objects
 * @alias module:modeling/transforms.scaleX
 */
const scaleX = (factor, ...objects) => scale([factor, 1, 1], objects)

/**
 * Scale the given objects about the Y axis using the given options.
 * @param {Number} factor - Y factor by which to scale the objects
 * @param {...Object} objects - the objects to scale
 * @return {Object|Array} the scaled object, or a list of scaled objects
 * @alias module:modeling/transforms.scaleY
 */
const scaleY = (factor, ...objects) => scale([1, factor, 1], objects)

/**
 * Scale the given objects about the Z axis using the given options.
 * @param {Number} factor - Z factor by which to scale the objects
 * @param {...Object} objects - the objects to scale
 * @return {Object|Array} the scaled object, or a list of scaled objects
 * @alias module:modeling/transforms.scaleZ
 */
const scaleZ = (factor, ...objects) => scale([1, 1, factor], objects)

module.exports = {
  scale,
  scaleX,
  scaleY,
  scaleZ
}

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../maths/mat4":159,"../../utils/flatten":412}],380:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/**
 * Transform the given objects using the given matrix.
 * @param {mat4} matrix - a transformation matrix
 * @param {...Object} objects - the objects to transform
 * @return {Object|Array} the transformed object, or a list of transformed objects
 * @alias module:modeling/transforms.transform
 *
 * @example
 * const newsphere = transform(mat4.rotateX(TAU / 8), sphere())
 */
const transform = (matrix, ...objects) => {
  // TODO how to check that the matrix is REAL?

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  const results = objects.map((object) => {
    if (path2.isA(object)) return path2.transform(matrix, object)
    if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

module.exports = transform

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../utils/flatten":412}],381:[function(require,module,exports){
const flatten = require('../../utils/flatten')

const mat4 = require('../../maths/mat4')

const geom2 = require('../../geometries/geom2')
const geom3 = require('../../geometries/geom3')
const path2 = require('../../geometries/path2')

/**
 * Translate the given objects using the given options.
 * @param {Array} offset - offset (vector) of which to translate the objects
 * @param {...Object} objects - the objects to translate
 * @return {Object|Array} the translated object, or a list of translated objects
 * @alias module:modeling/transforms.translate
 *
 * @example
 * const newsphere = translate([5, 0, 10], sphere())
 */
const translate = (offset, ...objects) => {
  if (!Array.isArray(offset)) throw new Error('offset must be an array')

  objects = flatten(objects)
  if (objects.length === 0) throw new Error('wrong number of arguments')

  // adjust the offset if necessary
  offset = offset.slice() // don't modify the original
  while (offset.length < 3) offset.push(0)

  const matrix = mat4.fromTranslation(mat4.create(), offset)

  const results = objects.map((object) => {
    if (path2.isA(object)) return path2.transform(matrix, object)
    if (geom2.isA(object)) return geom2.transform(matrix, object)
    if (geom3.isA(object)) return geom3.transform(matrix, object)
    return object
  })
  return results.length === 1 ? results[0] : results
}

/**
 * Translate the given objects along the X axis using the given options.
 * @param {Number} offset - X offset of which to translate the objects
 * @param {...Object} objects - the objects to translate
 * @return {Object|Array} the translated object, or a list of translated objects
 * @alias module:modeling/transforms.translateX
 */
const translateX = (offset, ...objects) => translate([offset, 0, 0], objects)

/**
 * Translate the given objects along the Y axis using the given options.
 * @param {Number} offset - Y offset of which to translate the geometries
 * @param {...Object} objects - the objects to translate
 * @return {Object|Array} the translated object, or a list of translated objects
 * @alias module:modeling/transforms.translateY
 */
const translateY = (offset, ...objects) => translate([0, offset, 0], objects)

/**
 * Translate the given objects along the Z axis using the given options.
 * @param {Number} offset - Z offset of which to translate the geometries
 * @param {...Object} objects - the objects to translate
 * @return {Object|Array} the translated object, or a list of translated objects
 * @alias module:modeling/transforms.translateZ
 */
const translateZ = (offset, ...objects) => translate([0, 0, offset], objects)

module.exports = {
  translate,
  translateX,
  translateY,
  translateZ
}

},{"../../geometries/geom2":42,"../../geometries/geom3":57,"../../geometries/path2":78,"../../maths/mat4":159,"../../utils/flatten":412}],382:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec2 = require('../maths/vec2')

const path2 = require('../geometries/path2')

const { isGT, isGTE, isNumberArray } = require('./commonChecks')

/**
 * Construct an arc in two dimensional space where all points are at the same distance from the center.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of arc
 * @param {Number} [options.radius=1] - radius of arc
 * @param {Number} [options.startAngle=0] - starting angle of the arc, in radians
 * @param {Number} [options.endAngle=TAU] - ending angle of the arc, in radians
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @param {Boolean} [options.makeTangent=false] - adds line segments at both ends of the arc to ensure that the gradients at the edges are tangent
 * @returns {path2} new 2D path
 * @alias module:modeling/primitives.arc
 */
const arc = (options) => {
  const defaults = {
    center: [0, 0],
    radius: 1,
    startAngle: 0,
    endAngle: TAU,
    makeTangent: false,
    segments: 32
  }
  let { center, radius, startAngle, endAngle, makeTangent, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 2)) throw new Error('center must be an array of X and Y values')
  if (!isGT(radius, 0)) throw new Error('radius must be greater than zero')
  if (!isGTE(startAngle, 0)) throw new Error('startAngle must be positive')
  if (!isGTE(endAngle, 0)) throw new Error('endAngle must be positive')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  startAngle = startAngle % TAU
  endAngle = endAngle % TAU

  let rotation = TAU
  if (startAngle < endAngle) {
    rotation = endAngle - startAngle
  }
  if (startAngle > endAngle) {
    rotation = endAngle + (TAU - startAngle)
  }

  const minangle = Math.acos(((radius * radius) + (radius * radius) - (EPS * EPS)) / (2 * radius * radius))

  const centerv = vec2.clone(center)
  let point
  const pointArray = []
  if (rotation < minangle) {
    // there is no rotation, just a single point
    point = vec2.fromAngleRadians(vec2.create(), startAngle)
    vec2.scale(point, point, radius)
    vec2.add(point, point, centerv)
    pointArray.push(point)
  } else {
    // note: add one additional step to acheive full rotation
    const numsteps = Math.max(1, Math.floor(segments * (rotation / TAU))) + 1
    let edgestepsize = numsteps * 0.5 / rotation // step size for half a degree
    if (edgestepsize > 0.25) edgestepsize = 0.25

    const totalsteps = makeTangent ? (numsteps + 2) : numsteps
    for (let i = 0; i <= totalsteps; i++) {
      let step = i
      if (makeTangent) {
        step = (i - 1) * (numsteps - 2 * edgestepsize) / numsteps + edgestepsize
        if (step < 0) step = 0
        if (step > numsteps) step = numsteps
      }
      const angle = startAngle + (step * (rotation / numsteps))
      point = vec2.fromAngleRadians(vec2.create(), angle)
      vec2.scale(point, point, radius)
      vec2.add(point, point, centerv)
      pointArray.push(point)
    }
  }
  return path2.fromPoints({ closed: false }, pointArray)
}

module.exports = arc

},{"../geometries/path2":78,"../maths/constants":110,"../maths/vec2":206,"./commonChecks":384}],383:[function(require,module,exports){
const { TAU } = require('../maths/constants')

const ellipse = require('./ellipse')

const { isGTE } = require('./commonChecks')

/**
 * Construct a circle in two dimensional space where all points are at the same distance from the center.
 * @see [ellipse]{@link module:modeling/primitives.ellipse} for more options
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of circle
 * @param {Number} [options.radius=1] - radius of circle
 * @param {Number} [options.startAngle=0] - start angle of circle, in radians
 * @param {Number} [options.endAngle=TAU] - end angle of circle, in radians
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.circle
 * @example
 * let myshape = circle({radius: 10})
 */
const circle = (options) => {
  const defaults = {
    center: [0, 0],
    radius: 1,
    startAngle: 0,
    endAngle: TAU,
    segments: 32
  }
  let { center, radius, startAngle, endAngle, segments } = Object.assign({}, defaults, options)

  if (!isGTE(radius, 0)) throw new Error('radius must be positive')

  radius = [radius, radius]

  return ellipse({ center, radius, startAngle, endAngle, segments })
}

module.exports = circle

},{"../maths/constants":110,"./commonChecks":384,"./ellipse":389}],384:[function(require,module,exports){
// verify that the array has the given dimension, and contains Number values
const isNumberArray = (array, dimension) => {
  if (Array.isArray(array) && array.length >= dimension) {
    return array.every((n) => Number.isFinite(n))
  }
  return false
}

// verify that the value is a Number greater than the constant
const isGT = (value, constant) => (Number.isFinite(value) && value > constant)

// verify that the value is a Number greater than or equal to the constant
const isGTE = (value, constant) => (Number.isFinite(value) && value >= constant)

module.exports = {
  isNumberArray,
  isGT,
  isGTE
}

},{}],385:[function(require,module,exports){
const cuboid = require('./cuboid')

const { isGTE } = require('./commonChecks')

/**
 * Construct an axis-aligned solid cube in three dimensional space with six square faces.
 * @see [cuboid]{@link module:modeling/primitives.cuboid} for more options
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cube
 * @param {Number} [options.size=2] - dimension of cube
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.cube
 * @example
 * let myshape = cube({size: 10})
 */
const cube = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: 2
  }
  let { center, size } = Object.assign({}, defaults, options)

  if (!isGTE(size, 0)) throw new Error('size must be positive')

  size = [size, size, size]

  return cuboid({ center, size })
}

module.exports = cube

},{"./commonChecks":384,"./cuboid":386}],386:[function(require,module,exports){
const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { isNumberArray } = require('./commonChecks')

/**
 * Construct an axis-aligned solid cuboid in three dimensional space.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cuboid
 * @param {Array} [options.size=[2,2,2]] - dimensions of cuboid; width, depth, height
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.cuboid
 *
 * @example
 * let myshape = cuboid({size: [5, 10, 5]})
 */
const cuboid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: [2, 2, 2]
  }
  const { center, size } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 3)) throw new Error('center must be an array of X, Y and Z values')
  if (!isNumberArray(size, 3)) throw new Error('size must be an array of width, depth and height values')
  if (!size.every((n) => n >= 0)) throw new Error('size values must be positive')

  // if any size is zero return empty geometry
  if (size[0] === 0 || size[1] === 0 || size[2] === 0) return geom3.create()

  const result = geom3.create(
    // adjust a basic shape to size
    [
      [[0, 4, 6, 2], [-1, 0, 0]],
      [[1, 3, 7, 5], [+1, 0, 0]],
      [[0, 1, 5, 4], [0, -1, 0]],
      [[2, 6, 7, 3], [0, +1, 0]],
      [[0, 2, 3, 1], [0, 0, -1]],
      [[4, 5, 7, 6], [0, 0, +1]]
    ].map((info) => {
      const points = info[0].map((i) => {
        const pos = [
          center[0] + (size[0] / 2) * (2 * !!(i & 1) - 1),
          center[1] + (size[1] / 2) * (2 * !!(i & 2) - 1),
          center[2] + (size[2] / 2) * (2 * !!(i & 4) - 1)
        ]
        return pos
      })
      return poly3.create(points)
    })
  )
  return result
}

module.exports = cuboid

},{"../geometries/geom3":57,"../geometries/poly3":95,"./commonChecks":384}],387:[function(require,module,exports){
const geom3 = require('../geometries/geom3')

const cylinderElliptic = require('./cylinderElliptic')

const { isGTE } = require('./commonChecks')

/**
 * Construct a Z axis-aligned cylinder in three dimensional space.
 * @see [cylinderElliptic]{@link module:modeling/primitives.cylinderElliptic} for more options
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cylinder
 * @param {Number} [options.height=2] - height of cylinder
 * @param {Number} [options.radius=1] - radius of cylinder (at both start and end)
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom3} new geometry
 * @alias module:modeling/primitives.cylinder
 *
 * @example
 * let myshape = cylinder({height: 2, radius: 10})
 */
const cylinder = (options) => {
  const defaults = {
    center: [0, 0, 0],
    height: 2,
    radius: 1,
    segments: 32
  }
  const { center, height, radius, segments } = Object.assign({}, defaults, options)

  if (!isGTE(radius, 0)) throw new Error('radius must be positive')

  // if size is zero return empty geometry
  if (height === 0 || radius === 0) return geom3.create()

  const newoptions = {
    center,
    height,
    startRadius: [radius, radius],
    endRadius: [radius, radius],
    segments
  }

  return cylinderElliptic(newoptions)
}

module.exports = cylinder

},{"../geometries/geom3":57,"./commonChecks":384,"./cylinderElliptic":388}],388:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec3 = require('../maths/vec3')

const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { sin, cos } = require('../maths/utils/trigonometry')

const { isGT, isGTE, isNumberArray } = require('./commonChecks')

/**
 * Construct a Z axis-aligned elliptic cylinder in three dimensional space.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cylinder
 * @param {Number} [options.height=2] - height of cylinder
 * @param {Array} [options.startRadius=[1,1]] - radius of rounded start, must be two dimensional array
 * @param {Number} [options.startAngle=0] - start angle of cylinder, in radians
 * @param {Array} [options.endRadius=[1,1]] - radius of rounded end, must be two dimensional array
 * @param {Number} [options.endAngle=TAU] - end angle of cylinder, in radians
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom3} new geometry
 * @alias module:modeling/primitives.cylinderElliptic
 *
 * @example
 * let myshape = cylinderElliptic({height: 2, startRadius: [10,5], endRadius: [8,3]})
 */
const cylinderElliptic = (options) => {
  const defaults = {
    center: [0, 0, 0],
    height: 2,
    startRadius: [1, 1],
    startAngle: 0,
    endRadius: [1, 1],
    endAngle: TAU,
    segments: 32
  }
  let { center, height, startRadius, startAngle, endRadius, endAngle, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 3)) throw new Error('center must be an array of X, Y and Z values')
  if (!isGT(height, 0)) throw new Error('height must be greater then zero')
  if (!isNumberArray(startRadius, 2)) throw new Error('startRadius must be an array of X and Y values')
  if (!startRadius.every((n) => n >= 0)) throw new Error('startRadius values must be positive')
  if (!isNumberArray(endRadius, 2)) throw new Error('endRadius must be an array of X and Y values')
  if (!endRadius.every((n) => n >= 0)) throw new Error('endRadius values must be positive')
  if (endRadius.every((n) => n === 0) && startRadius.every((n) => n === 0)) throw new Error('at least one radius must be positive')
  if (!isGTE(startAngle, 0)) throw new Error('startAngle must be positive')
  if (!isGTE(endAngle, 0)) throw new Error('endAngle must be positive')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  startAngle = startAngle % TAU
  endAngle = endAngle % TAU

  let rotation = TAU
  if (startAngle < endAngle) {
    rotation = endAngle - startAngle
  }
  if (startAngle > endAngle) {
    rotation = endAngle + (TAU - startAngle)
  }

  const minradius = Math.min(startRadius[0], startRadius[1], endRadius[0], endRadius[1])
  const minangle = Math.acos(((minradius * minradius) + (minradius * minradius) - (EPS * EPS)) /
                            (2 * minradius * minradius))
  if (rotation < minangle) throw new Error('startAngle and endAngle do not define a significant rotation')

  const slices = Math.floor(segments * (rotation / TAU))

  const start = vec3.fromValues(0, 0, -(height / 2))
  const end = vec3.fromValues(0, 0, height / 2)
  const ray = vec3.subtract(vec3.create(), end, start)

  const axisX = vec3.fromValues(1, 0, 0)
  const axisY = vec3.fromValues(0, 1, 0)

  const v1 = vec3.create()
  const v2 = vec3.create()
  const v3 = vec3.create()
  const point = (stack, slice, radius) => {
    const angle = slice * rotation + startAngle
    vec3.scale(v1, axisX, radius[0] * cos(angle))
    vec3.scale(v2, axisY, radius[1] * sin(angle))
    vec3.add(v1, v1, v2)

    vec3.scale(v3, ray, stack)
    vec3.add(v3, v3, start)
    return vec3.add(vec3.create(), v1, v3)
  }

  // adjust the points to center
  const fromPoints = (...points) => {
    const newpoints = points.map((point) => vec3.add(vec3.create(), point, center))
    return poly3.create(newpoints)
  }

  const polygons = []
  for (let i = 0; i < slices; i++) {
    const t0 = i / slices
    let t1 = (i + 1) / slices
    // fix rounding error when rotating TAU radians
    if (rotation === TAU && i === slices - 1) t1 = 0

    if (endRadius[0] === startRadius[0] && endRadius[1] === startRadius[1]) {
      polygons.push(fromPoints(start, point(0, t1, endRadius), point(0, t0, endRadius)))
      polygons.push(fromPoints(point(0, t1, endRadius), point(1, t1, endRadius), point(1, t0, endRadius), point(0, t0, endRadius)))
      polygons.push(fromPoints(end, point(1, t0, endRadius), point(1, t1, endRadius)))
    } else {
      if (startRadius[0] > 0 && startRadius[1] > 0) {
        polygons.push(fromPoints(start, point(0, t1, startRadius), point(0, t0, startRadius)))
      }
      if (startRadius[0] > 0 || startRadius[1] > 0) {
        polygons.push(fromPoints(point(0, t0, startRadius), point(0, t1, startRadius), point(1, t0, endRadius)))
      }
      if (endRadius[0] > 0 && endRadius[1] > 0) {
        polygons.push(fromPoints(end, point(1, t0, endRadius), point(1, t1, endRadius)))
      }
      if (endRadius[0] > 0 || endRadius[1] > 0) {
        polygons.push(fromPoints(point(1, t0, endRadius), point(0, t1, startRadius), point(1, t1, endRadius)))
      }
    }
  }
  if (rotation < TAU) {
    polygons.push(fromPoints(start, point(0, 0, startRadius), end))
    polygons.push(fromPoints(point(0, 0, startRadius), point(1, 0, endRadius), end))
    polygons.push(fromPoints(start, end, point(0, 1, startRadius)))
    polygons.push(fromPoints(point(0, 1, startRadius), end, point(1, 1, endRadius)))
  }
  const result = geom3.create(polygons)
  return result
}

module.exports = cylinderElliptic

},{"../geometries/geom3":57,"../geometries/poly3":95,"../maths/constants":110,"../maths/utils/trigonometry":188,"../maths/vec3":237,"./commonChecks":384}],389:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec2 = require('../maths/vec2')

const geom2 = require('../geometries/geom2')

const { sin, cos } = require('../maths/utils/trigonometry')

const { isGTE, isNumberArray } = require('./commonChecks')

/**
 * Construct an axis-aligned ellipse in two dimensional space.
 * @see https://en.wikipedia.org/wiki/Ellipse
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of ellipse
 * @param {Array} [options.radius=[1,1]] - radius of ellipse, along X and Y
 * @param {Number} [options.startAngle=0] - start angle of ellipse, in radians
 * @param {Number} [options.endAngle=TAU] - end angle of ellipse, in radians
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.ellipse
 * @example
 * let myshape = ellipse({radius: [5,10]})
 */
const ellipse = (options) => {
  const defaults = {
    center: [0, 0],
    radius: [1, 1],
    startAngle: 0,
    endAngle: TAU,
    segments: 32
  }
  let { center, radius, startAngle, endAngle, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 2)) throw new Error('center must be an array of X and Y values')
  if (!isNumberArray(radius, 2)) throw new Error('radius must be an array of X and Y values')
  if (!radius.every((n) => n >= 0)) throw new Error('radius values must be positive')
  if (!isGTE(startAngle, 0)) throw new Error('startAngle must be positive')
  if (!isGTE(endAngle, 0)) throw new Error('endAngle must be positive')
  if (!isGTE(segments, 3)) throw new Error('segments must be three or more')

  // if any radius is zero return empty geometry
  if (radius[0] === 0 || radius[1] === 0) return geom2.create()

  startAngle = startAngle % TAU
  endAngle = endAngle % TAU

  let rotation = TAU
  if (startAngle < endAngle) {
    rotation = endAngle - startAngle
  }
  if (startAngle > endAngle) {
    rotation = endAngle + (TAU - startAngle)
  }

  const minradius = Math.min(radius[0], radius[1])
  const minangle = Math.acos(((minradius * minradius) + (minradius * minradius) - (EPS * EPS)) /
                            (2 * minradius * minradius))
  if (rotation < minangle) throw new Error('startAngle and endAngle do not define a significant rotation')

  segments = Math.floor(segments * (rotation / TAU))

  const centerv = vec2.clone(center)
  const step = rotation / segments // radians per segment

  const points = []
  segments = (rotation < TAU) ? segments + 1 : segments
  for (let i = 0; i < segments; i++) {
    const angle = (step * i) + startAngle
    const point = vec2.fromValues(radius[0] * cos(angle), radius[1] * sin(angle))
    vec2.add(point, centerv, point)
    points.push(point)
  }
  if (rotation < TAU) points.push(centerv)
  return geom2.fromPoints(points)
}

module.exports = ellipse

},{"../geometries/geom2":42,"../maths/constants":110,"../maths/utils/trigonometry":188,"../maths/vec2":206,"./commonChecks":384}],390:[function(require,module,exports){
const { TAU } = require('../maths/constants')
const vec3 = require('../maths/vec3')

const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { sin, cos } = require('../maths/utils/trigonometry')

const { isGTE, isNumberArray } = require('./commonChecks')

/**
 * Construct an axis-aligned ellipsoid in three dimensional space.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of ellipsoid
 * @param {Array} [options.radius=[1,1,1]] - radius of ellipsoid, along X, Y and Z
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @param {Array} [options.axes] -  an array with three vectors for the x, y and z base vectors
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.ellipsoid
 *
 * @example
 * let myshape = ellipsoid({radius: [5, 10, 20]})
*/
const ellipsoid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    radius: [1, 1, 1],
    segments: 32,
    axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
  }
  const { center, radius, segments, axes } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 3)) throw new Error('center must be an array of X, Y and Z values')
  if (!isNumberArray(radius, 3)) throw new Error('radius must be an array of X, Y and Z values')
  if (!radius.every((n) => n >= 0)) throw new Error('radius values must be positive')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  // if any radius is zero return empty geometry
  if (radius[0] === 0 || radius[1] === 0 || radius[2] === 0) return geom3.create()

  const xvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[0]), radius[0])
  const yvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[1]), radius[1])
  const zvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), axes[2]), radius[2])

  const qsegments = Math.round(segments / 4)
  let prevcylinderpoint
  const polygons = []
  const p1 = vec3.create()
  const p2 = vec3.create()
  for (let slice1 = 0; slice1 <= segments; slice1++) {
    const angle = TAU * slice1 / segments
    const cylinderpoint = vec3.add(vec3.create(), vec3.scale(p1, xvector, cos(angle)), vec3.scale(p2, yvector, sin(angle)))
    if (slice1 > 0) {
      let prevcospitch, prevsinpitch
      for (let slice2 = 0; slice2 <= qsegments; slice2++) {
        const pitch = TAU / 4 * slice2 / qsegments
        const cospitch = cos(pitch)
        const sinpitch = sin(pitch)
        if (slice2 > 0) {
          let points = []
          let point
          point = vec3.subtract(vec3.create(), vec3.scale(p1, prevcylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch))
          points.push(vec3.add(point, point, center))
          point = vec3.subtract(vec3.create(), vec3.scale(p1, cylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch))
          points.push(vec3.add(point, point, center))
          if (slice2 < qsegments) {
            point = vec3.subtract(vec3.create(), vec3.scale(p1, cylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch))
            points.push(vec3.add(point, point, center))
          }
          point = vec3.subtract(vec3.create(), vec3.scale(p1, prevcylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch))
          points.push(vec3.add(point, point, center))

          polygons.push(poly3.create(points))

          points = []
          point = vec3.add(vec3.create(), vec3.scale(p1, prevcylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch))
          points.push(vec3.add(vec3.create(), center, point))
          point = vec3.add(point, vec3.scale(p1, cylinderpoint, prevcospitch), vec3.scale(p2, zvector, prevsinpitch))
          points.push(vec3.add(vec3.create(), center, point))
          if (slice2 < qsegments) {
            point = vec3.add(point, vec3.scale(p1, cylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch))
            points.push(vec3.add(vec3.create(), center, point))
          }
          point = vec3.add(point, vec3.scale(p1, prevcylinderpoint, cospitch), vec3.scale(p2, zvector, sinpitch))
          points.push(vec3.add(vec3.create(), center, point))
          points.reverse()

          polygons.push(poly3.create(points))
        }
        prevcospitch = cospitch
        prevsinpitch = sinpitch
      }
    }
    prevcylinderpoint = cylinderpoint
  }
  return geom3.create(polygons)
}

module.exports = ellipsoid

},{"../geometries/geom3":57,"../geometries/poly3":95,"../maths/constants":110,"../maths/utils/trigonometry":188,"../maths/vec3":237,"./commonChecks":384}],391:[function(require,module,exports){
const mat4 = require('../maths/mat4')
const vec3 = require('../maths/vec3')

const geom3 = require('../geometries/geom3')

const polyhedron = require('./polyhedron')

const { isGTE } = require('./commonChecks')

/**
 * Construct a geodesic sphere based on icosahedron symmetry.
 * @param {Object} [options] - options for construction
 * @param {Number} [options.radius=1] - target radius of sphere
 * @param {Number} [options.frequency=6] - subdivision frequency per face, multiples of 6
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.geodesicSphere
 *
 * @example
 * let myshape = geodesicSphere({radius: 15, frequency: 18})
 */
const geodesicSphere = (options) => {
  const defaults = {
    radius: 1,
    frequency: 6
  }
  let { radius, frequency } = Object.assign({}, defaults, options)

  if (!isGTE(radius, 0)) throw new Error('radius must be positive')
  if (!isGTE(frequency, 6)) throw new Error('frequency must be six or more')

  // if radius is zero return empty geometry
  if (radius === 0) return geom3.create()

  // adjust the frequency to base 6
  frequency = Math.floor(frequency / 6)

  const ci = [ // hard-coded data of icosahedron (20 faces, all triangles)
    [0.850651, 0.000000, -0.525731],
    [0.850651, -0.000000, 0.525731],
    [-0.850651, -0.000000, 0.525731],
    [-0.850651, 0.000000, -0.525731],
    [0.000000, -0.525731, 0.850651],
    [0.000000, 0.525731, 0.850651],
    [0.000000, 0.525731, -0.850651],
    [0.000000, -0.525731, -0.850651],
    [-0.525731, -0.850651, -0.000000],
    [0.525731, -0.850651, -0.000000],
    [0.525731, 0.850651, 0.000000],
    [-0.525731, 0.850651, 0.000000]]

  const ti = [[0, 9, 1], [1, 10, 0], [6, 7, 0], [10, 6, 0], [7, 9, 0], [5, 1, 4], [4, 1, 9], [5, 10, 1], [2, 8, 3], [3, 11, 2], [2, 5, 4],
    [4, 8, 2], [2, 11, 5], [3, 7, 6], [6, 11, 3], [8, 7, 3], [9, 8, 4], [11, 10, 5], [10, 11, 6], [8, 9, 7]]

  const geodesicSubDivide = (p, frequency, offset) => {
    const p1 = p[0]
    const p2 = p[1]
    const p3 = p[2]
    let n = offset
    const c = []
    const f = []

    //           p3
    //           /\
    //          /__\     frequency = 3
    //      i  /\  /\
    //        /__\/__\       total triangles = 9 (frequency*frequency)
    //       /\  /\  /\
    //     0/__\/__\/__\
    //    p1 0   j      p2

    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        const t0 = i / frequency
        const t1 = (i + 1) / frequency
        const s0 = j / (frequency - i)
        const s1 = (j + 1) / (frequency - i)
        const s2 = frequency - i - 1 ? j / (frequency - i - 1) : 1
        const q = []

        q[0] = mix3(mix3(p1, p2, s0), p3, t0)
        q[1] = mix3(mix3(p1, p2, s1), p3, t0)
        q[2] = mix3(mix3(p1, p2, s2), p3, t1)

        // -- normalize
        for (let k = 0; k < 3; k++) {
          const r = vec3.length(q[k])
          for (let l = 0; l < 3; l++) {
            q[k][l] /= r
          }
        }
        c.push(q[0], q[1], q[2])
        f.push([n, n + 1, n + 2]); n += 3

        if (j < frequency - i - 1) {
          const s3 = frequency - i - 1 ? (j + 1) / (frequency - i - 1) : 1
          q[0] = mix3(mix3(p1, p2, s1), p3, t0)
          q[1] = mix3(mix3(p1, p2, s3), p3, t1)
          q[2] = mix3(mix3(p1, p2, s2), p3, t1)

          // -- normalize
          for (let k = 0; k < 3; k++) {
            const r = vec3.length(q[k])
            for (let l = 0; l < 3; l++) {
              q[k][l] /= r
            }
          }
          c.push(q[0], q[1], q[2])
          f.push([n, n + 1, n + 2]); n += 3
        }
      }
    }
    return { points: c, triangles: f, offset: n }
  }

  const mix3 = (a, b, f) => {
    const _f = 1 - f
    const c = []
    for (let i = 0; i < 3; i++) {
      c[i] = a[i] * _f + b[i] * f
    }
    return c
  }

  let points = []
  let faces = []
  let offset = 0

  for (let i = 0; i < ti.length; i++) {
    const g = geodesicSubDivide([ci[ti[i][0]], ci[ti[i][1]], ci[ti[i][2]]], frequency, offset)
    points = points.concat(g.points)
    faces = faces.concat(g.triangles)
    offset = g.offset
  }

  let geometry = polyhedron({ points: points, faces: faces, orientation: 'inward' })
  if (radius !== 1) geometry = geom3.transform(mat4.fromScaling(mat4.create(), [radius, radius, radius]), geometry)
  return geometry
}

module.exports = geodesicSphere

},{"../geometries/geom3":57,"../maths/mat4":159,"../maths/vec3":237,"./commonChecks":384,"./polyhedron":395}],392:[function(require,module,exports){
/**
 * Primitives provide the building blocks for complex parts.
 * Each primitive is a geometrical object that can be described mathematically, and therefore precise.
 * Primitives can be logically combined, transformed, extruded, etc.
 * @module modeling/primitives
 * @example
 * const { cube, ellipse, star } = require('@jscad/modeling').primitives
 */
module.exports = {
  arc: require('./arc'),
  circle: require('./circle'),
  cube: require('./cube'),
  cuboid: require('./cuboid'),
  cylinder: require('./cylinder'),
  cylinderElliptic: require('./cylinderElliptic'),
  ellipse: require('./ellipse'),
  ellipsoid: require('./ellipsoid'),
  geodesicSphere: require('./geodesicSphere'),
  line: require('./line'),
  polygon: require('./polygon'),
  polyhedron: require('./polyhedron'),
  rectangle: require('./rectangle'),
  roundedCuboid: require('./roundedCuboid'),
  roundedCylinder: require('./roundedCylinder'),
  roundedRectangle: require('./roundedRectangle'),
  sphere: require('./sphere'),
  square: require('./square'),
  star: require('./star'),
  torus: require('./torus'),
  triangle: require('./triangle')
}

},{"./arc":382,"./circle":383,"./cube":385,"./cuboid":386,"./cylinder":387,"./cylinderElliptic":388,"./ellipse":389,"./ellipsoid":390,"./geodesicSphere":391,"./line":393,"./polygon":394,"./polyhedron":395,"./rectangle":396,"./roundedCuboid":397,"./roundedCylinder":398,"./roundedRectangle":399,"./sphere":400,"./square":401,"./star":402,"./torus":403,"./triangle":404}],393:[function(require,module,exports){
const path2 = require('../geometries/path2')

/**
 * Construct a new line in two dimensional space from the given points.
 * The points must be provided as an array, where each element is a 2D point.
 * @param {Array} points - array of points from which to create the path
 * @returns {path2} new 2D path
 * @alias module:modeling/primitives.line
 *
 * @example
 * let myshape = line([[10, 10], [-10, 10]])
 */
const line = (points) => {
  if (!Array.isArray(points)) throw new Error('points must be an array')

  return path2.fromPoints({}, points)
}

module.exports = line

},{"../geometries/path2":78}],394:[function(require,module,exports){
const geom2 = require('../geometries/geom2')

/**
 * Construct a polygon in two dimensional space from a list of points, or a list of points and paths.
 * NOTE: The ordering of points is VERY IMPORTANT.
 * @param {Object} options - options for construction
 * @param {Array} options.points - points of the polygon : either flat or nested array of 2D points
 * @param {Array} [options.paths] - paths of the polygon : either flat or nested array of point indexes
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.polygon
 *
 * @example
 * let roof = [[10,11], [0,11], [5,20]]
 * let wall = [[0,0], [10,0], [10,10], [0,10]]
 *
 * let poly = polygon({ points: roof })
 * or
 * let poly = polygon({ points: [roof, wall] })
 * or
 * let poly = polygon({ points: roof, paths: [0, 1, 2] })
 * or
 * let poly = polygon({ points: [roof, wall], paths: [[0, 1, 2], [3, 4, 5, 6]] })
 */
const polygon = (options) => {
  const defaults = {
    points: [],
    paths: []
  }
  const { points, paths } = Object.assign({}, defaults, options)

  if (!(Array.isArray(points) && Array.isArray(paths))) throw new Error('points and paths must be arrays')

  let listofpolys = points
  if (Array.isArray(points[0])) {
    if (!Array.isArray(points[0][0])) {
      // points is an array of something... convert to list
      listofpolys = [points]
    }
  }

  listofpolys.forEach((list, i) => {
    if (!Array.isArray(list)) throw new Error('list of points ' + i + ' must be an array')
    if (list.length < 3) throw new Error('list of points ' + i + ' must contain three or more points')
    list.forEach((point, j) => {
      if (!Array.isArray(point)) throw new Error('list of points ' + i + ', point ' + j + ' must be an array')
      if (point.length < 2) throw new Error('list of points ' + i + ', point ' + j + ' must contain by X and Y values')
    })
  })

  let listofpaths = paths
  if (paths.length === 0) {
    // create a list of paths based on the points
    let count = 0
    listofpaths = listofpolys.map((list) => list.map((point) => count++))
  }

  // flatten the listofpoints for indexed access
  const allpoints = []
  listofpolys.forEach((list) => list.forEach((point) => allpoints.push(point)))

  let sides = []
  listofpaths.forEach((path) => {
    const setofpoints = path.map((index) => allpoints[index])
    const geometry = geom2.fromPoints(setofpoints)
    sides = sides.concat(geom2.toSides(geometry))
  })
  return geom2.create(sides)
}

module.exports = polygon

},{"../geometries/geom2":42}],395:[function(require,module,exports){
const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { isNumberArray } = require('./commonChecks')

/**
 * Construct a polyhedron in three dimensional space from the given set of 3D points and faces.
 * The faces can define outward or inward facing polygons (orientation).
 * However, each face must define a counter clockwise rotation of points which follows the right hand rule.
 * @param {Object} options - options for construction
 * @param {Array} options.points - list of points in 3D space
 * @param {Array} options.faces - list of faces, where each face is a set of indexes into the points
 * @param {Array} [options.colors=undefined] - list of RGBA colors to apply to each face
 * @param {String} [options.orientation='outward'] - orientation of faces
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.polyhedron
 *
 * @example
 * let mypoints = [ [10, 10, 0], [10, -10, 0], [-10, -10, 0], [-10, 10, 0], [0, 0, 10] ]
 * let myfaces = [ [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4], [1, 0, 3], [2, 1, 3] ]
 * let myshape = polyhedron({points: mypoint, faces: myfaces, orientation: 'inward'})
 */
const polyhedron = (options) => {
  const defaults = {
    points: [],
    faces: [],
    colors: undefined,
    orientation: 'outward'
  }
  const { points, faces, colors, orientation } = Object.assign({}, defaults, options)

  if (!(Array.isArray(points) && Array.isArray(faces))) {
    throw new Error('points and faces must be arrays')
  }
  if (points.length < 3) {
    throw new Error('three or more points are required')
  }
  if (faces.length < 1) {
    throw new Error('one or more faces are required')
  }
  if (colors) {
    if (!Array.isArray(colors)) {
      throw new Error('colors must be an array')
    }
    if (colors.length !== faces.length) {
      throw new Error('faces and colors must have the same length')
    }
  }
  points.forEach((point, i) => {
    if (!isNumberArray(point, 3)) throw new Error(`point ${i} must be an array of X, Y, Z values`)
  })
  faces.forEach((face, i) => {
    if (face.length < 3) throw new Error(`face ${i} must contain 3 or more indexes`)
    if (!isNumberArray(face, face.length)) throw new Error(`face ${i} must be an array of numbers`)
  })

  // invert the faces if orientation is inwards, as all internals expect outwarding facing polygons
  if (orientation !== 'outward') {
    faces.forEach((face) => face.reverse())
  }

  const polygons = faces.map((face, findex) => {
    const polygon = poly3.create(face.map((pindex) => points[pindex]))
    if (colors && colors[findex]) polygon.color = colors[findex]
    return polygon
  })

  return geom3.create(polygons)
}

module.exports = polyhedron

},{"../geometries/geom3":57,"../geometries/poly3":95,"./commonChecks":384}],396:[function(require,module,exports){
const vec2 = require('../maths/vec2')

const geom2 = require('../geometries/geom2')

const { isNumberArray } = require('./commonChecks')

/**
 * Construct an axis-aligned rectangle in two dimensional space with four sides at right angles.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of rectangle
 * @param {Array} [options.size=[2,2]] - dimension of rectangle, width and length
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.rectangle
 *
 * @example
 * let myshape = rectangle({size: [10, 20]})
 */
const rectangle = (options) => {
  const defaults = {
    center: [0, 0],
    size: [2, 2]
  }
  const { center, size } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 2)) throw new Error('center must be an array of X and Y values')
  if (!isNumberArray(size, 2)) throw new Error('size must be an array of X and Y values')
  if (!size.every((n) => n >= 0)) throw new Error('size values must be positive')

  // if any size is zero return empty geometry
  if (size[0] === 0 || size[1] === 0) return geom2.create()

  const point = [size[0] / 2, size[1] / 2]
  const pswap = [point[0], -point[1]]

  const points = [
    vec2.subtract(vec2.create(), center, point),
    vec2.add(vec2.create(), center, pswap),
    vec2.add(vec2.create(), center, point),
    vec2.subtract(vec2.create(), center, pswap)
  ]
  return geom2.fromPoints(points)
}

module.exports = rectangle

},{"../geometries/geom2":42,"../maths/vec2":206,"./commonChecks":384}],397:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec2 = require('../maths/vec2')
const vec3 = require('../maths/vec3')

const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { sin, cos } = require('../maths/utils/trigonometry')

const { isGTE, isNumberArray } = require('./commonChecks')
const cuboid = require('./cuboid')

const createCorners = (center, size, radius, segments, slice, positive) => {
  const pitch = (TAU / 4) * slice / segments
  const cospitch = cos(pitch)
  const sinpitch = sin(pitch)

  const layersegments = segments - slice
  let layerradius = radius * cospitch
  let layeroffset = size[2] - (radius - (radius * sinpitch))
  if (!positive) layeroffset = (radius - (radius * sinpitch)) - size[2]

  layerradius = layerradius > EPS ? layerradius : 0

  const corner0 = vec3.add(vec3.create(), center, [size[0] - radius, size[1] - radius, layeroffset])
  const corner1 = vec3.add(vec3.create(), center, [radius - size[0], size[1] - radius, layeroffset])
  const corner2 = vec3.add(vec3.create(), center, [radius - size[0], radius - size[1], layeroffset])
  const corner3 = vec3.add(vec3.create(), center, [size[0] - radius, radius - size[1], layeroffset])
  const corner0Points = []
  const corner1Points = []
  const corner2Points = []
  const corner3Points = []
  for (let i = 0; i <= layersegments; i++) {
    const radians = layersegments > 0 ? TAU / 4 * i / layersegments : 0
    const point2d = vec2.fromAngleRadians(vec2.create(), radians)
    vec2.scale(point2d, point2d, layerradius)
    const point3d = vec3.fromVec2(vec3.create(), point2d)
    corner0Points.push(vec3.add(vec3.create(), corner0, point3d))
    vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4)
    corner1Points.push(vec3.add(vec3.create(), corner1, point3d))
    vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4)
    corner2Points.push(vec3.add(vec3.create(), corner2, point3d))
    vec3.rotateZ(point3d, point3d, [0, 0, 0], TAU / 4)
    corner3Points.push(vec3.add(vec3.create(), corner3, point3d))
  }
  if (!positive) {
    corner0Points.reverse()
    corner1Points.reverse()
    corner2Points.reverse()
    corner3Points.reverse()
    return [corner3Points, corner2Points, corner1Points, corner0Points]
  }
  return [corner0Points, corner1Points, corner2Points, corner3Points]
}

const stitchCorners = (previousCorners, currentCorners) => {
  const polygons = []
  for (let i = 0; i < previousCorners.length; i++) {
    const previous = previousCorners[i]
    const current = currentCorners[i]
    for (let j = 0; j < (previous.length - 1); j++) {
      polygons.push(poly3.create([previous[j], previous[j + 1], current[j]]))

      if (j < (current.length - 1)) {
        polygons.push(poly3.create([current[j], previous[j + 1], current[j + 1]]))
      }
    }
  }
  return polygons
}

const stitchWalls = (previousCorners, currentCorners) => {
  const polygons = []
  for (let i = 0; i < previousCorners.length; i++) {
    let previous = previousCorners[i]
    let current = currentCorners[i]
    const p0 = previous[previous.length - 1]
    const c0 = current[current.length - 1]

    const j = (i + 1) % previousCorners.length
    previous = previousCorners[j]
    current = currentCorners[j]
    const p1 = previous[0]
    const c1 = current[0]

    polygons.push(poly3.create([p0, p1, c1, c0]))
  }
  return polygons
}

const stitchSides = (bottomCorners, topCorners) => {
  // make a copy and reverse the bottom corners
  bottomCorners = [bottomCorners[3], bottomCorners[2], bottomCorners[1], bottomCorners[0]]
  bottomCorners = bottomCorners.map((corner) => corner.slice().reverse())

  const bottomPoints = []
  bottomCorners.forEach((corner) => {
    corner.forEach((point) => bottomPoints.push(point))
  })

  const topPoints = []
  topCorners.forEach((corner) => {
    corner.forEach((point) => topPoints.push(point))
  })

  const polygons = []
  for (let i = 0; i < topPoints.length; i++) {
    const j = (i + 1) % topPoints.length
    polygons.push(poly3.create([bottomPoints[i], bottomPoints[j], topPoints[j], topPoints[i]]))
  }
  return polygons
}

/**
 * Construct an axis-aligned solid cuboid in three dimensional space with rounded corners.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of rounded cube
 * @param {Array} [options.size=[2,2,2]] - dimension of rounded cube; width, depth, height
 * @param {Number} [options.roundRadius=0.2] - radius of rounded edges
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.roundedCuboid
 *
 * @example
 * let mycube = roundedCuboid({size: [10, 20, 10], roundRadius: 2, segments: 16})
 */
const roundedCuboid = (options) => {
  const defaults = {
    center: [0, 0, 0],
    size: [2, 2, 2],
    roundRadius: 0.2,
    segments: 32
  }
  let { center, size, roundRadius, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 3)) throw new Error('center must be an array of X, Y and Z values')
  if (!isNumberArray(size, 3)) throw new Error('size must be an array of X, Y and Z values')
  if (!size.every((n) => n >= 0)) throw new Error('size values must be positive')
  if (!isGTE(roundRadius, 0)) throw new Error('roundRadius must be positive')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  // if any size is zero return empty geometry
  if (size[0] === 0 || size[1] === 0 || size[2] === 0) return geom3.create()

  // if roundRadius is zero, return cuboid
  if (roundRadius === 0) return cuboid({ center, size })

  size = size.map((v) => v / 2) // convert to radius

  if (roundRadius > (size[0] - EPS) ||
      roundRadius > (size[1] - EPS) ||
      roundRadius > (size[2] - EPS)) throw new Error('roundRadius must be smaller then the radius of all dimensions')

  segments = Math.floor(segments / 4)

  let prevCornersPos = null
  let prevCornersNeg = null
  let polygons = []
  for (let slice = 0; slice <= segments; slice++) {
    const cornersPos = createCorners(center, size, roundRadius, segments, slice, true)
    const cornersNeg = createCorners(center, size, roundRadius, segments, slice, false)

    if (slice === 0) {
      polygons = polygons.concat(stitchSides(cornersNeg, cornersPos))
    }

    if (prevCornersPos) {
      polygons = polygons.concat(stitchCorners(prevCornersPos, cornersPos),
        stitchWalls(prevCornersPos, cornersPos))
    }
    if (prevCornersNeg) {
      polygons = polygons.concat(stitchCorners(prevCornersNeg, cornersNeg),
        stitchWalls(prevCornersNeg, cornersNeg))
    }

    if (slice === segments) {
      // add the top
      let points = cornersPos.map((corner) => corner[0])
      polygons.push(poly3.create(points))
      // add the bottom
      points = cornersNeg.map((corner) => corner[0])
      polygons.push(poly3.create(points))
    }

    prevCornersPos = cornersPos
    prevCornersNeg = cornersNeg
  }

  return geom3.create(polygons)
}

module.exports = roundedCuboid

},{"../geometries/geom3":57,"../geometries/poly3":95,"../maths/constants":110,"../maths/utils/trigonometry":188,"../maths/vec2":206,"../maths/vec3":237,"./commonChecks":384,"./cuboid":386}],398:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec3 = require('../maths/vec3')

const geom3 = require('../geometries/geom3')
const poly3 = require('../geometries/poly3')

const { sin, cos } = require('../maths/utils/trigonometry')

const { isGTE, isNumberArray } = require('./commonChecks')
const cylinder = require('./cylinder')

/**
 * Construct a Z axis-aligned solid cylinder in three dimensional space with rounded ends.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of cylinder
 * @param {Number} [options.height=2] - height of cylinder
 * @param {Number} [options.radius=1] - radius of cylinder
 * @param {Number} [options.roundRadius=0.2] - radius of rounded edges
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.roundedCylinder
 *
 * @example
 * let myshape = roundedCylinder({ height: 10, radius: 2, roundRadius: 0.5 })
 */
const roundedCylinder = (options) => {
  const defaults = {
    center: [0, 0, 0],
    height: 2,
    radius: 1,
    roundRadius: 0.2,
    segments: 32
  }
  const { center, height, radius, roundRadius, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 3)) throw new Error('center must be an array of X, Y and Z values')
  if (!isGTE(height, 0)) throw new Error('height must be positive')
  if (!isGTE(radius, 0)) throw new Error('radius must be positive')
  if (!isGTE(roundRadius, 0)) throw new Error('roundRadius must be positive')
  if (roundRadius > radius) throw new Error('roundRadius must be smaller then the radius')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  // if size is zero return empty geometry
  if (height === 0 || radius === 0) return geom3.create()

  // if roundRadius is zero, return cylinder
  if (roundRadius === 0) return cylinder({ center, height, radius })

  const start = [0, 0, -(height / 2)]
  const end = [0, 0, height / 2]
  const direction = vec3.subtract(vec3.create(), end, start)
  const length = vec3.length(direction)

  if ((2 * roundRadius) > (length - EPS)) throw new Error('height must be larger than twice roundRadius')

  let defaultnormal
  if (Math.abs(direction[0]) > Math.abs(direction[1])) {
    defaultnormal = vec3.fromValues(0, 1, 0)
  } else {
    defaultnormal = vec3.fromValues(1, 0, 0)
  }

  const zvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), direction), roundRadius)
  const xvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), zvector, defaultnormal)), radius)
  const yvector = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), vec3.cross(vec3.create(), xvector, zvector)), radius)

  vec3.add(start, start, zvector)
  vec3.subtract(end, end, zvector)

  const qsegments = Math.floor(0.25 * segments)

  const fromPoints = (points) => {
    // adjust the points to center
    const newpoints = points.map((point) => vec3.add(point, point, center))
    return poly3.create(newpoints)
  }

  const polygons = []
  const v1 = vec3.create()
  const v2 = vec3.create()
  let prevcylinderpoint
  for (let slice1 = 0; slice1 <= segments; slice1++) {
    const angle = TAU * slice1 / segments
    const cylinderpoint = vec3.add(vec3.create(), vec3.scale(v1, xvector, cos(angle)), vec3.scale(v2, yvector, sin(angle)))
    if (slice1 > 0) {
      // cylinder wall
      let points = []
      points.push(vec3.add(vec3.create(), start, cylinderpoint))
      points.push(vec3.add(vec3.create(), start, prevcylinderpoint))
      points.push(vec3.add(vec3.create(), end, prevcylinderpoint))
      points.push(vec3.add(vec3.create(), end, cylinderpoint))
      polygons.push(fromPoints(points))

      let prevcospitch, prevsinpitch
      for (let slice2 = 0; slice2 <= qsegments; slice2++) {
        const pitch = TAU / 4 * slice2 / qsegments
        const cospitch = cos(pitch)
        const sinpitch = sin(pitch)
        if (slice2 > 0) {
          // cylinder rounding, start
          points = []
          let point
          point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, prevcylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch)))
          points.push(point)
          point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, cylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch)))
          points.push(point)
          if (slice2 < qsegments) {
            point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, cylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch)))
            points.push(point)
          }
          point = vec3.add(vec3.create(), start, vec3.subtract(v1, vec3.scale(v1, prevcylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch)))
          points.push(point)

          polygons.push(fromPoints(points))

          // cylinder rounding, end
          points = []
          point = vec3.add(vec3.create(), vec3.scale(v1, prevcylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch))
          vec3.add(point, point, end)
          points.push(point)
          point = vec3.add(vec3.create(), vec3.scale(v1, cylinderpoint, prevcospitch), vec3.scale(v2, zvector, prevsinpitch))
          vec3.add(point, point, end)
          points.push(point)
          if (slice2 < qsegments) {
            point = vec3.add(vec3.create(), vec3.scale(v1, cylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch))
            vec3.add(point, point, end)
            points.push(point)
          }
          point = vec3.add(vec3.create(), vec3.scale(v1, prevcylinderpoint, cospitch), vec3.scale(v2, zvector, sinpitch))
          vec3.add(point, point, end)
          points.push(point)
          points.reverse()

          polygons.push(fromPoints(points))
        }
        prevcospitch = cospitch
        prevsinpitch = sinpitch
      }
    }
    prevcylinderpoint = cylinderpoint
  }
  const result = geom3.create(polygons)
  return result
}

module.exports = roundedCylinder

},{"../geometries/geom3":57,"../geometries/poly3":95,"../maths/constants":110,"../maths/utils/trigonometry":188,"../maths/vec3":237,"./commonChecks":384,"./cylinder":387}],399:[function(require,module,exports){
const { EPS, TAU } = require('../maths/constants')

const vec2 = require('../maths/vec2')

const geom2 = require('../geometries/geom2')

const { isGTE, isNumberArray } = require('./commonChecks')
const rectangle = require('./rectangle')

/**
 * Construct an axis-aligned rectangle in two dimensional space with rounded corners.
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of rounded rectangle
 * @param {Array} [options.size=[2,2]] - dimension of rounded rectangle; width and length
 * @param {Number} [options.roundRadius=0.2] - round radius of corners
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.roundedRectangle
 *
 * @example
 * let myshape = roundedRectangle({size: [10, 20], roundRadius: 2})
 */
const roundedRectangle = (options) => {
  const defaults = {
    center: [0, 0],
    size: [2, 2],
    roundRadius: 0.2,
    segments: 32
  }
  let { center, size, roundRadius, segments } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 2)) throw new Error('center must be an array of X and Y values')
  if (!isNumberArray(size, 2)) throw new Error('size must be an array of X and Y values')
  if (!size.every((n) => n >= 0)) throw new Error('size values must be positive')
  if (!isGTE(roundRadius, 0)) throw new Error('roundRadius must be positive')
  if (!isGTE(segments, 4)) throw new Error('segments must be four or more')

  // if any size is zero return empty geometry
  if (size[0] === 0 || size[1] === 0) return geom2.create()

  // if roundRadius is zero, return rectangle
  if (roundRadius === 0) return rectangle({ center, size })

  size = size.map((v) => v / 2) // convert to radius

  if (roundRadius > (size[0] - EPS) ||
      roundRadius > (size[1] - EPS)) throw new Error('roundRadius must be smaller then the radius of all dimensions')

  const cornersegments = Math.floor(segments / 4)

  // create sets of points that define the corners
  const corner0 = vec2.add(vec2.create(), center, [size[0] - roundRadius, size[1] - roundRadius])
  const corner1 = vec2.add(vec2.create(), center, [roundRadius - size[0], size[1] - roundRadius])
  const corner2 = vec2.add(vec2.create(), center, [roundRadius - size[0], roundRadius - size[1]])
  const corner3 = vec2.add(vec2.create(), center, [size[0] - roundRadius, roundRadius - size[1]])
  const corner0Points = []
  const corner1Points = []
  const corner2Points = []
  const corner3Points = []
  for (let i = 0; i <= cornersegments; i++) {
    const radians = TAU / 4 * i / cornersegments
    const point = vec2.fromAngleRadians(vec2.create(), radians)
    vec2.scale(point, point, roundRadius)
    corner0Points.push(vec2.add(vec2.create(), corner0, point))
    vec2.rotate(point, point, vec2.create(), TAU / 4)
    corner1Points.push(vec2.add(vec2.create(), corner1, point))
    vec2.rotate(point, point, vec2.create(), TAU / 4)
    corner2Points.push(vec2.add(vec2.create(), corner2, point))
    vec2.rotate(point, point, vec2.create(), TAU / 4)
    corner3Points.push(vec2.add(vec2.create(), corner3, point))
  }

  return geom2.fromPoints(corner0Points.concat(corner1Points, corner2Points, corner3Points))
}

module.exports = roundedRectangle

},{"../geometries/geom2":42,"../maths/constants":110,"../maths/vec2":206,"./commonChecks":384,"./rectangle":396}],400:[function(require,module,exports){
const ellipsoid = require('./ellipsoid')

const { isGTE } = require('./commonChecks')

/**
 * Construct a sphere in three dimensional space where all points are at the same distance from the center.
 * @see [ellipsoid]{@link module:modeling/primitives.ellipsoid} for more options
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0,0]] - center of sphere
 * @param {Number} [options.radius=1] - radius of sphere
 * @param {Number} [options.segments=32] - number of segments to create per full rotation
 * @param {Array} [options.axes] -  an array with three vectors for the x, y and z base vectors
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.sphere
 *
 * @example
 * let myshape = sphere({radius: 5})
 */
const sphere = (options) => {
  const defaults = {
    center: [0, 0, 0],
    radius: 1,
    segments: 32,
    axes: [[1, 0, 0], [0, -1, 0], [0, 0, 1]]
  }
  let { center, radius, segments, axes } = Object.assign({}, defaults, options)

  if (!isGTE(radius, 0)) throw new Error('radius must be positive')

  radius = [radius, radius, radius]

  return ellipsoid({ center, radius, segments, axes })
}

module.exports = sphere

},{"./commonChecks":384,"./ellipsoid":390}],401:[function(require,module,exports){
const rectangle = require('./rectangle')

const { isGTE } = require('./commonChecks')

/**
 * Construct an axis-aligned square in two dimensional space with four equal sides at right angles.
 * @see [rectangle]{@link module:modeling/primitives.rectangle} for more options
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of square
 * @param {Number} [options.size=2] - dimension of square
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.square
 *
 * @example
 * let myshape = square({size: 10})
 */
const square = (options) => {
  const defaults = {
    center: [0, 0],
    size: 2
  }
  let { center, size } = Object.assign({}, defaults, options)

  if (!isGTE(size, 0)) throw new Error('size must be positive')

  size = [size, size]

  return rectangle({ center, size })
}

module.exports = square

},{"./commonChecks":384,"./rectangle":396}],402:[function(require,module,exports){
const { TAU } = require('../maths/constants')
const vec2 = require('../maths/vec2')

const geom2 = require('../geometries/geom2')

const { isGT, isGTE, isNumberArray } = require('./commonChecks')

// @see http://www.jdawiseman.com/papers/easymath/surds_star_inner_radius.html
const getRadiusRatio = (vertices, density) => {
  if (vertices > 0 && density > 1 && density < vertices / 2) {
    return Math.cos(Math.PI * density / vertices) / Math.cos(Math.PI * (density - 1) / vertices)
  }
  return 0
}

const getPoints = (vertices, radius, startAngle, center) => {
  const a = TAU / vertices

  const points = []
  for (let i = 0; i < vertices; i++) {
    const point = vec2.fromAngleRadians(vec2.create(), a * i + startAngle)
    vec2.scale(point, point, radius)
    vec2.add(point, center, point)
    points.push(point)
  }
  return points
}

/**
 * Construct a star in two dimensional space.
 * @see https://en.wikipedia.org/wiki/Star_polygon
 * @param {Object} [options] - options for construction
 * @param {Array} [options.center=[0,0]] - center of star
 * @param {Number} [options.vertices=5] - number of vertices (P) on the star
 * @param {Number} [options.density=2] - density (Q) of star
 * @param {Number} [options.outerRadius=1] - outer radius of vertices
 * @param {Number} [options.innerRadius=0] - inner radius of vertices, or zero to calculate
 * @param {Number} [options.startAngle=0] - starting angle for first vertice, in radians
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.star
 *
 * @example
 * let star1 = star({vertices: 8, outerRadius: 10}) // star with 8/2 density
 * let star2 = star({vertices: 12, outerRadius: 40, innerRadius: 20}) // star with given radius
 */
const star = (options) => {
  const defaults = {
    center: [0, 0],
    vertices: 5,
    outerRadius: 1,
    innerRadius: 0,
    density: 2,
    startAngle: 0
  }
  let { center, vertices, outerRadius, innerRadius, density, startAngle } = Object.assign({}, defaults, options)

  if (!isNumberArray(center, 2)) throw new Error('center must be an array of X and Y values')
  if (!isGTE(vertices, 2)) throw new Error('vertices must be two or more')
  if (!isGT(outerRadius, 0)) throw new Error('outerRadius must be greater than zero')
  if (!isGTE(innerRadius, 0)) throw new Error('innerRadius must be greater than zero')
  if (!isGTE(startAngle, 0)) throw new Error('startAngle must be greater than zero')

  // force integers
  vertices = Math.floor(vertices)
  density = Math.floor(density)

  startAngle = startAngle % TAU

  if (innerRadius === 0) {
    if (!isGTE(density, 2)) throw new Error('density must be two or more')
    innerRadius = outerRadius * getRadiusRatio(vertices, density)
  }

  const centerv = vec2.clone(center)

  const outerPoints = getPoints(vertices, outerRadius, startAngle, centerv)
  const innerPoints = getPoints(vertices, innerRadius, startAngle + Math.PI / vertices, centerv)

  const allPoints = []
  for (let i = 0; i < vertices; i++) {
    allPoints.push(outerPoints[i])
    allPoints.push(innerPoints[i])
  }

  return geom2.fromPoints(allPoints)
}

module.exports = star

},{"../geometries/geom2":42,"../maths/constants":110,"../maths/vec2":206,"./commonChecks":384}],403:[function(require,module,exports){
const { TAU } = require('../maths/constants')

const extrudeRotate = require('../operations/extrusions/extrudeRotate')
const { rotate } = require('../operations/transforms/rotate')
const { translate } = require('../operations/transforms/translate')

const circle = require('./circle')

const { isGT, isGTE } = require('./commonChecks')

/**
 * Construct a torus by revolving a small circle (inner) about the circumference of a large (outer) circle.
 * @param {Object} [options] - options for construction
 * @param {Number} [options.innerRadius=1] - radius of small (inner) circle
 * @param {Number} [options.outerRadius=4] - radius of large (outer) circle
 * @param {Integer} [options.innerSegments=32] - number of segments to create per rotation
 * @param {Integer} [options.outerSegments=32] - number of segments to create per rotation
 * @param {Integer} [options.innerRotation=0] - rotation of small (inner) circle in radians
 * @param {Number} [options.outerRotation=TAU] - rotation (outer) of the torus (RADIANS)
 * @param {Number} [options.startAngle=0] - start angle of the torus (RADIANS)
 * @returns {geom3} new 3D geometry
 * @alias module:modeling/primitives.torus
 *
 * @example
 * let myshape = torus({ innerRadius: 10, outerRadius: 100 })
 */
const torus = (options) => {
  const defaults = {
    innerRadius: 1,
    innerSegments: 32,
    outerRadius: 4,
    outerSegments: 32,
    innerRotation: 0,
    startAngle: 0,
    outerRotation: TAU
  }
  const { innerRadius, innerSegments, outerRadius, outerSegments, innerRotation, startAngle, outerRotation } = Object.assign({}, defaults, options)

  if (!isGT(innerRadius, 0)) throw new Error('innerRadius must be greater than zero')
  if (!isGTE(innerSegments, 3)) throw new Error('innerSegments must be three or more')
  if (!isGT(outerRadius, 0)) throw new Error('outerRadius must be greater than zero')
  if (!isGTE(outerSegments, 3)) throw new Error('outerSegments must be three or more')
  if (!isGTE(startAngle, 0)) throw new Error('startAngle must be positive')
  if (!isGT(outerRotation, 0)) throw new Error('outerRotation must be greater than zero')

  if (innerRadius >= outerRadius) throw new Error('inner circle is two large to rotate about the outer circle')

  let innerCircle = circle({ radius: innerRadius, segments: innerSegments })

  if (innerRotation !== 0) {
    innerCircle = rotate([0, 0, innerRotation], innerCircle)
  }

  innerCircle = translate([outerRadius, 0], innerCircle)

  const extrudeOptions = {
    startAngle: startAngle,
    angle: outerRotation,
    segments: outerSegments
  }
  return extrudeRotate(extrudeOptions, innerCircle)
}

module.exports = torus

},{"../maths/constants":110,"../operations/extrusions/extrudeRotate":331,"../operations/transforms/rotate":378,"../operations/transforms/translate":381,"./circle":383,"./commonChecks":384}],404:[function(require,module,exports){
const { NEPS } = require('../maths/constants')
const vec2 = require('../maths/vec2')

const geom2 = require('../geometries/geom2')

const { isNumberArray } = require('./commonChecks')

// returns angle C
const solveAngleFromSSS = (a, b, c) => Math.acos(((a * a) + (b * b) - (c * c)) / (2 * a * b))

// returns side c
const solveSideFromSAS = (a, C, b) => {
  if (C > NEPS) {
    return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C))
  }

  // Explained in https://www.nayuki.io/page/numerically-stable-law-of-cosines
  return Math.sqrt((a - b) * (a - b) + a * b * C * C * (1 - C * C / 12))
}

// AAA is when three angles of a triangle, but no sides
const solveAAA = (angles) => {
  const eps = Math.abs(angles[0] + angles[1] + angles[2] - Math.PI)
  if (eps > NEPS) throw new Error('AAA triangles require angles that sum to PI')

  const A = angles[0]
  const B = angles[1]
  const C = Math.PI - A - B

  // Note: This is not 100% proper but...
  // default the side c length to 1
  // solve the other lengths
  const c = 1
  const a = (c / Math.sin(C)) * Math.sin(A)
  const b = (c / Math.sin(C)) * Math.sin(B)
  return createTriangle(A, B, C, a, b, c)
}

// AAS is when two angles and one side are known, and the side is not between the angles
const solveAAS = (values) => {
  const A = values[0]
  const B = values[1]
  const C = Math.PI + NEPS - A - B

  if (C < NEPS) throw new Error('AAS triangles require angles that sum to PI')

  const a = values[2]
  const b = (a / Math.sin(A)) * Math.sin(B)
  const c = (a / Math.sin(A)) * Math.sin(C)
  return createTriangle(A, B, C, a, b, c)
}

// ASA is when two angles and the side between the angles are known
const solveASA = (values) => {
  const A = values[0]
  const B = values[2]
  const C = Math.PI + NEPS - A - B

  if (C < NEPS) throw new Error('ASA triangles require angles that sum to PI')

  const c = values[1]
  const a = (c / Math.sin(C)) * Math.sin(A)
  const b = (c / Math.sin(C)) * Math.sin(B)
  return createTriangle(A, B, C, a, b, c)
}

// SAS is when two sides and the angle between them are known
const solveSAS = (values) => {
  const c = values[0]
  const B = values[1]
  const a = values[2]

  const b = solveSideFromSAS(c, B, a)

  const A = solveAngleFromSSS(b, c, a) // solve for A
  const C = Math.PI - A - B
  return createTriangle(A, B, C, a, b, c)
}

// SSA is when two sides and an angle that is not the angle between the sides are known
const solveSSA = (values) => {
  const c = values[0]
  const a = values[1]
  const C = values[2]

  const A = Math.asin(a * Math.sin(C) / c)
  const B = Math.PI - A - C

  const b = (c / Math.sin(C)) * Math.sin(B)
  return createTriangle(A, B, C, a, b, c)
}

// SSS is when we know three sides of the triangle
const solveSSS = (lengths) => {
  const a = lengths[1]
  const b = lengths[2]
  const c = lengths[0]
  if (((a + b) <= c) || ((b + c) <= a) || ((c + a) <= b)) {
    throw new Error('SSS triangle is incorrect, as the longest side is longer than the sum of the other sides')
  }

  const A = solveAngleFromSSS(b, c, a) // solve for A
  const B = solveAngleFromSSS(c, a, b) // solve for B
  const C = Math.PI - A - B
  return createTriangle(A, B, C, a, b, c)
}

const createTriangle = (A, B, C, a, b, c) => {
  const p0 = vec2.fromValues(0, 0) // everything starts from 0, 0
  const p1 = vec2.fromValues(c, 0)
  const p2 = vec2.fromValues(a, 0)
  vec2.add(p2, vec2.rotate(p2, p2, [0, 0], Math.PI - B), p1)
  return geom2.fromPoints([p0, p1, p2])
}

/**
 * Construct a triangle in two dimensional space from the given options.
 * The triangle is always constructed CCW from the origin, [0, 0, 0].
 * @see https://www.mathsisfun.com/algebra/trig-solving-triangles.html
 * @param {Object} [options] - options for construction
 * @param {String} [options.type='SSS'] - type of triangle to construct; A ~ angle, S ~ side
 * @param {Array} [options.values=[1,1,1]] - angle (radians) of corners or length of sides
 * @returns {geom2} new 2D geometry
 * @alias module:modeling/primitives.triangle
 *
 * @example
 * let myshape = triangle({type: 'AAS', values: [degToRad(62), degToRad(35), 7]})
 */
const triangle = (options) => {
  const defaults = {
    type: 'SSS',
    values: [1, 1, 1]
  }
  let { type, values } = Object.assign({}, defaults, options)

  if (typeof (type) !== 'string') throw new Error('triangle type must be a string')
  type = type.toUpperCase()
  if (!((type[0] === 'A' || type[0] === 'S') &&
        (type[1] === 'A' || type[1] === 'S') &&
        (type[2] === 'A' || type[2] === 'S'))) throw new Error('triangle type must contain three letters; A or S')

  if (!isNumberArray(values, 3)) throw new Error('triangle values must contain three values')
  if (!values.every((n) => n > 0)) throw new Error('triangle values must be greater than zero')

  switch (type) {
    case 'AAA':
      return solveAAA(values)
    case 'AAS':
      return solveAAS(values)
    case 'ASA':
      return solveASA(values)
    case 'SAS':
      return solveSAS(values)
    case 'SSA':
      return solveSSA(values)
    case 'SSS':
      return solveSSS(values)
    default:
      throw new Error('invalid triangle type, try again')
  }
}

module.exports = triangle

},{"../geometries/geom2":42,"../maths/constants":110,"../maths/vec2":206,"./commonChecks":384}],405:[function(require,module,exports){
// -- data source from from http://paulbourke.net/dataformats/hershey/
// -- reduced to save some bytes...
// { [ascii code]: [width, x, y, ...] } - undefined value as path separator
module.exports = {
  height: 14,
  32: [16],
  33: [10, 5, 21, 5, 7, undefined, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
  34: [16, 4, 21, 4, 14, undefined, 12, 21, 12, 14],
  35: [21, 11, 25, 4, -7, undefined, 17, 25, 10, -7, undefined, 4, 12, 18, 12, undefined, 3, 6, 17, 6],
  36: [20, 8, 25, 8, -4, undefined, 12, 25, 12, -4, undefined, 17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3],
  37: [24, 21, 21, 3, 0, undefined, 8, 21, 10, 19, 10, 17, 9, 15, 7, 14, 5, 14, 3, 16, 3, 18, 4, 20, 6, 21, 8, 21, 10, 20, 13, 19, 16, 19, 19, 20, 21, 21, undefined, 17, 7, 15, 6, 14, 4, 14, 2, 16, 0, 18, 0, 20, 1, 21, 3, 21, 5, 19, 7, 17, 7],
  38: [26, 23, 12, 23, 13, 22, 14, 21, 14, 20, 13, 19, 11, 17, 6, 15, 3, 13, 1, 11, 0, 7, 0, 5, 1, 4, 2, 3, 4, 3, 6, 4, 8, 5, 9, 12, 13, 13, 14, 14, 16, 14, 18, 13, 20, 11, 21, 9, 20, 8, 18, 8, 16, 9, 13, 11, 10, 16, 3, 18, 1, 20, 0, 22, 0, 23, 1, 23, 2],
  39: [10, 5, 19, 4, 20, 5, 21, 6, 20, 6, 18, 5, 16, 4, 15],
  40: [14, 11, 25, 9, 23, 7, 20, 5, 16, 4, 11, 4, 7, 5, 2, 7, -2, 9, -5, 11, -7],
  41: [14, 3, 25, 5, 23, 7, 20, 9, 16, 10, 11, 10, 7, 9, 2, 7, -2, 5, -5, 3, -7],
  42: [16, 8, 21, 8, 9, undefined, 3, 18, 13, 12, undefined, 13, 18, 3, 12],
  43: [26, 13, 18, 13, 0, undefined, 4, 9, 22, 9],
  44: [10, 6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4],
  45: [26, 4, 9, 22, 9],
  46: [10, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
  47: [22, 20, 25, 2, -7],
  48: [20, 9, 21, 6, 20, 4, 17, 3, 12, 3, 9, 4, 4, 6, 1, 9, 0, 11, 0, 14, 1, 16, 4, 17, 9, 17, 12, 16, 17, 14, 20, 11, 21, 9, 21],
  49: [20, 6, 17, 8, 18, 11, 21, 11, 0],
  50: [20, 4, 16, 4, 17, 5, 19, 6, 20, 8, 21, 12, 21, 14, 20, 15, 19, 16, 17, 16, 15, 15, 13, 13, 10, 3, 0, 17, 0],
  51: [20, 5, 21, 16, 21, 10, 13, 13, 13, 15, 12, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4],
  52: [20, 13, 21, 3, 7, 18, 7, undefined, 13, 21, 13, 0],
  53: [20, 15, 21, 5, 21, 4, 12, 5, 13, 8, 14, 11, 14, 14, 13, 16, 11, 17, 8, 17, 6, 16, 3, 14, 1, 11, 0, 8, 0, 5, 1, 4, 2, 3, 4],
  54: [20, 16, 18, 15, 20, 12, 21, 10, 21, 7, 20, 5, 17, 4, 12, 4, 7, 5, 3, 7, 1, 10, 0, 11, 0, 14, 1, 16, 3, 17, 6, 17, 7, 16, 10, 14, 12, 11, 13, 10, 13, 7, 12, 5, 10, 4, 7],
  55: [20, 17, 21, 7, 0, undefined, 3, 21, 17, 21],
  56: [20, 8, 21, 5, 20, 4, 18, 4, 16, 5, 14, 7, 13, 11, 12, 14, 11, 16, 9, 17, 7, 17, 4, 16, 2, 15, 1, 12, 0, 8, 0, 5, 1, 4, 2, 3, 4, 3, 7, 4, 9, 6, 11, 9, 12, 13, 13, 15, 14, 16, 16, 16, 18, 15, 20, 12, 21, 8, 21],
  57: [20, 16, 14, 15, 11, 13, 9, 10, 8, 9, 8, 6, 9, 4, 11, 3, 14, 3, 15, 4, 18, 6, 20, 9, 21, 10, 21, 13, 20, 15, 18, 16, 14, 16, 9, 15, 4, 13, 1, 10, 0, 8, 0, 5, 1, 4, 3],
  58: [10, 5, 14, 4, 13, 5, 12, 6, 13, 5, 14, undefined, 5, 2, 4, 1, 5, 0, 6, 1, 5, 2],
  59: [10, 5, 14, 4, 13, 5, 12, 6, 13, 5, 14, undefined, 6, 1, 5, 0, 4, 1, 5, 2, 6, 1, 6, -1, 5, -3, 4, -4],
  60: [24, 20, 18, 4, 9, 20, 0],
  61: [26, 4, 12, 22, 12, undefined, 4, 6, 22, 6],
  62: [24, 4, 18, 20, 9, 4, 0],
  63: [18, 3, 16, 3, 17, 4, 19, 5, 20, 7, 21, 11, 21, 13, 20, 14, 19, 15, 17, 15, 15, 14, 13, 13, 12, 9, 10, 9, 7, undefined, 9, 2, 8, 1, 9, 0, 10, 1, 9, 2],
  64: [27, 18, 13, 17, 15, 15, 16, 12, 16, 10, 15, 9, 14, 8, 11, 8, 8, 9, 6, 11, 5, 14, 5, 16, 6, 17, 8, undefined, 12, 16, 10, 14, 9, 11, 9, 8, 10, 6, 11, 5, undefined, 18, 16, 17, 8, 17, 6, 19, 5, 21, 5, 23, 7, 24, 10, 24, 12, 23, 15, 22, 17, 20, 19, 18, 20, 15, 21, 12, 21, 9, 20, 7, 19, 5, 17, 4, 15, 3, 12, 3, 9, 4, 6, 5, 4, 7, 2, 9, 1, 12, 0, 15, 0, 18, 1, 20, 2, 21, 3, undefined, 19, 16, 18, 8, 18, 6, 19, 5],
  65: [18, 9, 21, 1, 0, undefined, 9, 21, 17, 0, undefined, 4, 7, 14, 7],
  66: [21, 4, 21, 4, 0, undefined, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, undefined, 4, 11, 13, 11, 16, 10, 17, 9, 18, 7, 18, 4, 17, 2, 16, 1, 13, 0, 4, 0],
  67: [21, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5],
  68: [21, 4, 21, 4, 0, undefined, 4, 21, 11, 21, 14, 20, 16, 18, 17, 16, 18, 13, 18, 8, 17, 5, 16, 3, 14, 1, 11, 0, 4, 0],
  69: [19, 4, 21, 4, 0, undefined, 4, 21, 17, 21, undefined, 4, 11, 12, 11, undefined, 4, 0, 17, 0],
  70: [18, 4, 21, 4, 0, undefined, 4, 21, 17, 21, undefined, 4, 11, 12, 11],
  71: [21, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 18, 8, undefined, 13, 8, 18, 8],
  72: [22, 4, 21, 4, 0, undefined, 18, 21, 18, 0, undefined, 4, 11, 18, 11],
  73: [8, 4, 21, 4, 0],
  74: [16, 12, 21, 12, 5, 11, 2, 10, 1, 8, 0, 6, 0, 4, 1, 3, 2, 2, 5, 2, 7],
  75: [21, 4, 21, 4, 0, undefined, 18, 21, 4, 7, undefined, 9, 12, 18, 0],
  76: [17, 4, 21, 4, 0, undefined, 4, 0, 16, 0],
  77: [24, 4, 21, 4, 0, undefined, 4, 21, 12, 0, undefined, 20, 21, 12, 0, undefined, 20, 21, 20, 0],
  78: [22, 4, 21, 4, 0, undefined, 4, 21, 18, 0, undefined, 18, 21, 18, 0],
  79: [22, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21],
  80: [21, 4, 21, 4, 0, undefined, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 14, 17, 12, 16, 11, 13, 10, 4, 10],
  81: [22, 9, 21, 7, 20, 5, 18, 4, 16, 3, 13, 3, 8, 4, 5, 5, 3, 7, 1, 9, 0, 13, 0, 15, 1, 17, 3, 18, 5, 19, 8, 19, 13, 18, 16, 17, 18, 15, 20, 13, 21, 9, 21, undefined, 12, 4, 18, -2],
  82: [21, 4, 21, 4, 0, undefined, 4, 21, 13, 21, 16, 20, 17, 19, 18, 17, 18, 15, 17, 13, 16, 12, 13, 11, 4, 11, undefined, 11, 11, 18, 0],
  83: [20, 17, 18, 15, 20, 12, 21, 8, 21, 5, 20, 3, 18, 3, 16, 4, 14, 5, 13, 7, 12, 13, 10, 15, 9, 16, 8, 17, 6, 17, 3, 15, 1, 12, 0, 8, 0, 5, 1, 3, 3],
  84: [16, 8, 21, 8, 0, undefined, 1, 21, 15, 21],
  85: [22, 4, 21, 4, 6, 5, 3, 7, 1, 10, 0, 12, 0, 15, 1, 17, 3, 18, 6, 18, 21],
  86: [18, 1, 21, 9, 0, undefined, 17, 21, 9, 0],
  87: [24, 2, 21, 7, 0, undefined, 12, 21, 7, 0, undefined, 12, 21, 17, 0, undefined, 22, 21, 17, 0],
  88: [20, 3, 21, 17, 0, undefined, 17, 21, 3, 0],
  89: [18, 1, 21, 9, 11, 9, 0, undefined, 17, 21, 9, 11],
  90: [20, 17, 21, 3, 0, undefined, 3, 21, 17, 21, undefined, 3, 0, 17, 0],
  91: [14, 4, 25, 4, -7, undefined, 5, 25, 5, -7, undefined, 4, 25, 11, 25, undefined, 4, -7, 11, -7],
  92: [14, 0, 21, 14, -3],
  93: [14, 9, 25, 9, -7, undefined, 10, 25, 10, -7, undefined, 3, 25, 10, 25, undefined, 3, -7, 10, -7],
  94: [16, 6, 15, 8, 18, 10, 15, undefined, 3, 12, 8, 17, 13, 12, undefined, 8, 17, 8, 0],
  95: [16, 0, -2, 16, -2],
  96: [10, 6, 21, 5, 20, 4, 18, 4, 16, 5, 15, 6, 16, 5, 17],
  97: [19, 15, 14, 15, 0, undefined, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  98: [19, 4, 21, 4, 0, undefined, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3],
  99: [18, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  100: [19, 15, 21, 15, 0, undefined, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  101: [18, 3, 8, 15, 8, 15, 10, 14, 12, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  102: [12, 10, 21, 8, 21, 6, 20, 5, 17, 5, 0, undefined, 2, 14, 9, 14],
  103: [19, 15, 14, 15, -2, 14, -5, 13, -6, 11, -7, 8, -7, 6, -6, undefined, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  104: [19, 4, 21, 4, 0, undefined, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0],
  105: [8, 3, 21, 4, 20, 5, 21, 4, 22, 3, 21, undefined, 4, 14, 4, 0],
  106: [10, 5, 21, 6, 20, 7, 21, 6, 22, 5, 21, undefined, 6, 14, 6, -3, 5, -6, 3, -7, 1, -7],
  107: [17, 4, 21, 4, 0, undefined, 14, 14, 4, 4, undefined, 8, 8, 15, 0],
  108: [8, 4, 21, 4, 0],
  109: [30, 4, 14, 4, 0, undefined, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0, undefined, 15, 10, 18, 13, 20, 14, 23, 14, 25, 13, 26, 10, 26, 0],
  110: [19, 4, 14, 4, 0, undefined, 4, 10, 7, 13, 9, 14, 12, 14, 14, 13, 15, 10, 15, 0],
  111: [19, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3, 16, 6, 16, 8, 15, 11, 13, 13, 11, 14, 8, 14],
  112: [19, 4, 14, 4, -7, undefined, 4, 11, 6, 13, 8, 14, 11, 14, 13, 13, 15, 11, 16, 8, 16, 6, 15, 3, 13, 1, 11, 0, 8, 0, 6, 1, 4, 3],
  113: [19, 15, 14, 15, -7, undefined, 15, 11, 13, 13, 11, 14, 8, 14, 6, 13, 4, 11, 3, 8, 3, 6, 4, 3, 6, 1, 8, 0, 11, 0, 13, 1, 15, 3],
  114: [13, 4, 14, 4, 0, undefined, 4, 8, 5, 11, 7, 13, 9, 14, 12, 14],
  115: [17, 14, 11, 13, 13, 10, 14, 7, 14, 4, 13, 3, 11, 4, 9, 6, 8, 11, 7, 13, 6, 14, 4, 14, 3, 13, 1, 10, 0, 7, 0, 4, 1, 3, 3],
  116: [12, 5, 21, 5, 4, 6, 1, 8, 0, 10, 0, undefined, 2, 14, 9, 14],
  117: [19, 4, 14, 4, 4, 5, 1, 7, 0, 10, 0, 12, 1, 15, 4, undefined, 15, 14, 15, 0],
  118: [16, 2, 14, 8, 0, undefined, 14, 14, 8, 0],
  119: [22, 3, 14, 7, 0, undefined, 11, 14, 7, 0, undefined, 11, 14, 15, 0, undefined, 19, 14, 15, 0],
  120: [17, 3, 14, 14, 0, undefined, 14, 14, 3, 0],
  121: [16, 2, 14, 8, 0, undefined, 14, 14, 8, 0, 6, -4, 4, -6, 2, -7, 1, -7],
  122: [17, 14, 14, 3, 0, undefined, 3, 14, 14, 14, undefined, 3, 0, 14, 0],
  123: [14, 9, 25, 7, 24, 6, 23, 5, 21, 5, 19, 6, 17, 7, 16, 8, 14, 8, 12, 6, 10, undefined, 7, 24, 6, 22, 6, 20, 7, 18, 8, 17, 9, 15, 9, 13, 8, 11, 4, 9, 8, 7, 9, 5, 9, 3, 8, 1, 7, 0, 6, -2, 6, -4, 7, -6, undefined, 6, 8, 8, 6, 8, 4, 7, 2, 6, 1, 5, -1, 5, -3, 6, -5, 7, -6, 9, -7],
  124: [8, 4, 25, 4, -7],
  125: [14, 5, 25, 7, 24, 8, 23, 9, 21, 9, 19, 8, 17, 7, 16, 6, 14, 6, 12, 8, 10, undefined, 7, 24, 8, 22, 8, 20, 7, 18, 6, 17, 5, 15, 5, 13, 6, 11, 10, 9, 6, 7, 5, 5, 5, 3, 6, 1, 7, 0, 8, -2, 8, -4, 7, -6, undefined, 8, 8, 6, 6, 6, 4, 7, 2, 8, 1, 9, -1, 9, -3, 8, -5, 7, -6, 5, -7],
  126: [24, 3, 6, 3, 8, 4, 11, 6, 12, 8, 12, 10, 11, 14, 8, 16, 7, 18, 7, 20, 8, 21, 10, undefined, 3, 8, 4, 10, 6, 11, 8, 11, 10, 10, 14, 7, 16, 6, 18, 6, 20, 7, 21, 10, 21, 12]
}

},{}],406:[function(require,module,exports){
/**
 * Texts provide sets of segments for each character or text strings.
 * The segments can be used to create outlines for both 2D and 3D geometry.
 * Note: Only ASCII characters are supported.
 * @module modeling/text
 * @example
 * const { vectorChar, vectorText } = require('@jscad/modeling').text
 */
module.exports = {
  vectorChar: require('./vectorChar'),
  vectorText: require('./vectorText')
}

},{"./vectorChar":407,"./vectorText":409}],407:[function(require,module,exports){
const vectorParams = require('./vectorParams')

/**
 * Represents a character as a list of segments
 * @typedef {Object} VectorCharObject
 * @property {Float} width - character width
 * @property {Float} height - character height (uppercase)
 * @property {Array} segments - character segments [[[x, y], ...], ...]
 */

/** Construct a {@link VectorCharObject} from a ascii character whose code is between 31 and 127,
* if the character is not supported it is replaced by a question mark.
* @param {Object|String} [options] - options for construction or ascii character
* @param {Float} [options.xOffset=0] - x offset
* @param {Float} [options.yOffset=0] - y offset
* @param {Float} [options.height=21] - font size (uppercase height)
* @param {Float} [options.extrudeOffset=0] - width of the extrusion that will be applied (manually) after the creation of the character
* @param {String} [options.input='?'] - ascii character (ignored/overwrited if provided as seconds parameter)
* @param {String} [char='?'] - ascii character
* @returns {VectorCharObject}
* @alias module:modeling/text.vectorChar
*
* @example
* let vectorCharObject = vectorChar()
* or
* let vectorCharObject = vectorChar('A')
* or
* let vectorCharObject = vectorChar({ xOffset: 57 }, 'C')
* or
* let vectorCharObject = vectorChar({ xOffset: 78, input: '!' })
*/
const vectorChar = (options, char) => {
  const {
    xOffset, yOffset, input, font, height, extrudeOffset
  } = vectorParams(options, char)
  let code = input.charCodeAt(0)
  if (!code || !font[code]) {
    code = 63 // 63 => ?
  }
  const glyph = [].concat(font[code])
  const ratio = (height - extrudeOffset) / font.height
  const extrudeYOffset = (extrudeOffset / 2)
  const width = glyph.shift() * ratio
  const segments = []
  let polyline = []
  for (let i = 0, il = glyph.length; i < il; i += 2) {
    const gx = ratio * glyph[i] + xOffset
    const gy = ratio * glyph[i + 1] + yOffset + extrudeYOffset
    if (glyph[i] !== undefined) {
      polyline.push([gx, gy])
      continue
    }
    segments.push(polyline)
    polyline = []
    i--
  }
  if (polyline.length) {
    segments.push(polyline)
  }
  return { width, height, segments }
}

module.exports = vectorChar

},{"./vectorParams":408}],408:[function(require,module,exports){
const defaultFont = require('./fonts/single-line/hershey/simplex.js')

const defaultsVectorParams = {
  xOffset: 0,
  yOffset: 0,
  input: '?',
  align: 'left',
  font: defaultFont,
  height: 14, // == old vector_xxx simplex font height
  lineSpacing: 2.142857142857143, // == 30/14 == old vector_xxx ratio
  letterSpacing: 1,
  extrudeOffset: 0
}

// vectorsXXX parameters handler
const vectorParams = (options, input) => {
  if (!input && typeof options === 'string') {
    options = { input: options }
  }
  options = options || {}
  const params = Object.assign({}, defaultsVectorParams, options)
  params.input = input || params.input
  return params
}

module.exports = vectorParams

},{"./fonts/single-line/hershey/simplex.js":405}],409:[function(require,module,exports){
const vectorChar = require('./vectorChar')
const vectorParams = require('./vectorParams')

// translate text line
const translateLine = (options, line) => {
  const { x, y } = Object.assign({ x: 0, y: 0 }, options || {})
  const segments = line.segments
  let segment = null
  let point = null
  for (let i = 0, il = segments.length; i < il; i++) {
    segment = segments[i]
    for (let j = 0, jl = segment.length; j < jl; j++) {
      point = segment[j]
      segment[j] = [point[0] + x, point[1] + y]
    }
  }
  return line
}

/**
 * Construct an array of character segments from a ascii string whose characters code is between 31 and 127,
 * if one character is not supported it is replaced by a question mark.
 * @param {Object|String} [options] - options for construction or ascii string
 * @param {Float} [options.xOffset=0] - x offset
 * @param {Float} [options.yOffset=0] - y offset
 * @param {Float} [options.height=21] - font size (uppercase height)
 * @param {Float} [options.lineSpacing=1.4] - line spacing expressed as a percentage of font size
 * @param {Float} [options.letterSpacing=1] - extra letter spacing expressed as a percentage of font size
 * @param {String} [options.align='left'] - multi-line text alignment: left, center, right
 * @param {Float} [options.extrudeOffset=0] - width of the extrusion that will be applied (manually) after the creation of the character
 * @param {String} [options.input='?'] - ascii string (ignored/overwrited if provided as seconds parameter)
 * @param {String} [text='?'] - ascii string
 * @returns {Array} characters segments [[[x, y], ...], ...]
 * @alias module:modeling/text.vectorText
 *
 * @example
 * let textSegments = vectorText()
 * or
 * let textSegments = vectorText('OpenJSCAD')
 * or
 * let textSegments = vectorText({ yOffset: -50 }, 'OpenJSCAD')
 * or
 * let textSegments = vectorText({ yOffset: -80, input: 'OpenJSCAD' })
 */
const vectorText = (options, text) => {
  const {
    xOffset, yOffset, input, font, height, align, extrudeOffset, lineSpacing, letterSpacing
  } = vectorParams(options, text)
  let [x, y] = [xOffset, yOffset]
  let i, il, char, vect, width, diff
  let line = { width: 0, segments: [] }
  const lines = []
  let output = []
  let maxWidth = 0
  const lineStart = x
  const pushLine = () => {
    lines.push(line)
    maxWidth = Math.max(maxWidth, line.width)
    line = { width: 0, segments: [] }
  }
  for (i = 0, il = input.length; i < il; i++) {
    char = input[i]
    vect = vectorChar({ xOffset: x, yOffset: y, font, height, extrudeOffset }, char)
    if (char === '\n') {
      x = lineStart
      y -= vect.height * lineSpacing
      pushLine()
      continue
    }
    width = vect.width * letterSpacing
    line.width += width
    x += width
    if (char !== ' ') {
      line.segments = line.segments.concat(vect.segments)
    }
  }
  if (line.segments.length) {
    pushLine()
  }
  for (i = 0, il = lines.length; i < il; i++) {
    line = lines[i]
    if (maxWidth > line.width) {
      diff = maxWidth - line.width
      if (align === 'right') {
        line = translateLine({ x: diff }, line)
      } else if (align === 'center') {
        line = translateLine({ x: diff / 2 }, line)
      }
    }
    output = output.concat(line.segments)
  }
  return output
}

module.exports = vectorText

},{"./vectorChar":407,"./vectorParams":408}],410:[function(require,module,exports){
// list of supported geometries
const geom2 = require('../geometries/geom2')
const geom3 = require('../geometries/geom3')
const path2 = require('../geometries/path2')

/**
 * @param {Array} shapes - list of shapes to compare
 * @returns {Boolean} true if the given shapes are of the same type
 * @alias module:modeling/utils.areAllShapesTheSameType
 */
const areAllShapesTheSameType = (shapes) => {
  let previousType
  for (const shape of shapes) {
    let currentType = 0
    if (geom2.isA(shape)) currentType = 1
    if (geom3.isA(shape)) currentType = 2
    if (path2.isA(shape)) currentType = 3

    if (previousType && currentType !== previousType) return false
    previousType = currentType
  }
  return true
}

module.exports = areAllShapesTheSameType

},{"../geometries/geom2":42,"../geometries/geom3":57,"../geometries/path2":78}],411:[function(require,module,exports){
/**
 * Convert the given angle (degrees) to radians.
 * @param {Number} degrees - angle in degrees
 * @returns {Number} angle in radians
 * @alias module:modeling/utils.degToRad
 */
const degToRad = (degrees) => degrees * 0.017453292519943295

module.exports = degToRad

},{}],412:[function(require,module,exports){
/**
 * Flatten the given list of arguments into a single flat array.
 * The arguments can be composed of multiple depths of objects and arrays.
 * @param {Array} arr - list of arguments
 * @returns {Array} a flat list of arguments
 * @alias module:modeling/utils.flatten
 */
const flatten = (arr) => arr.reduce((acc, val) => Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), [])

module.exports = flatten

},{}],413:[function(require,module,exports){
/**
 * @alias module:modeling/utils.fnNumberSort
 */
const fnNumberSort = (a, b) => a - b

module.exports = fnNumberSort

},{}],414:[function(require,module,exports){
/**
 * Utility functions of various sorts.
 * @module modeling/utils
 * @example
 * const { flatten, insertSorted } = require('@jscad/modeling').utils
 */
module.exports = {
  areAllShapesTheSameType: require('./areAllShapesTheSameType'),
  degToRad: require('./degToRad'),
  flatten: require('./flatten'),
  fnNumberSort: require('./fnNumberSort'),
  insertSorted: require('./insertSorted'),
  radiusToSegments: require('./radiusToSegments'),
  radToDeg: require('./radToDeg')
}

},{"./areAllShapesTheSameType":410,"./degToRad":411,"./flatten":412,"./fnNumberSort":413,"./insertSorted":415,"./radToDeg":417,"./radiusToSegments":418}],415:[function(require,module,exports){
/**
 * Insert the given element into the given array using the compareFunction.
 * @alias module:modeling/utils.insertSorted
 */
const insertSorted = (array, element, comparefunc) => {
  let leftbound = 0
  let rightbound = array.length
  while (rightbound > leftbound) {
    const testindex = Math.floor((leftbound + rightbound) / 2)
    const testelement = array[testindex]
    const compareresult = comparefunc(element, testelement)
    if (compareresult > 0) { // element > testelement
      leftbound = testindex + 1
    } else {
      rightbound = testindex
    }
  }
  array.splice(leftbound, 0, element)
}

module.exports = insertSorted

},{}],416:[function(require,module,exports){
/**
 * Build an array of at minimum a specified length from an existing array and a padding value. IF the array is already larger than the target length, it will not be shortened.
 * @param {Array} anArray - the source array to copy into the result.
 * @param {*} padding - the value to add to the new array to reach the desired length.
 * @param {Number} targetLength - The desired length of the return array.
 * @returns {Array} an array of at least 'targetLength' length
 * @alias module:modeling/utils.padArrayToLength
 */
const padArrayToLength = (anArray, padding, targetLength) => {
  anArray = anArray.slice()
  while (anArray.length < targetLength) {
    anArray.push(padding)
  }
  return anArray
}

module.exports = padArrayToLength

},{}],417:[function(require,module,exports){
/**
 * Convert the given angle (radians) to degrees.
 * @param {Number} radians - angle in radians
 * @returns {Number} angle in degrees
 * @alias module:modeling/utils.radToDeg
 */
const radToDeg = (radians) => radians * 57.29577951308232

module.exports = radToDeg

},{}],418:[function(require,module,exports){
const { TAU } = require('../maths/constants')

/**
 * Calculate the number of segments from the given radius based on minimum length or angle.
 * @param {Number} radius - radius of the requested shape
 * @param {Number} minimumLength - minimum length of segments; length > 0
 * @param {Number} minimumAngle - minimum angle (radians) between segments; 0 > angle < TAU
 * @returns {Number} number of segments to complete the radius
 * @alias module:modeling/utils.radiusToSegments
 */
const radiusToSegments = (radius, minimumLength, minimumAngle) => {
  const ss = minimumLength > 0 ? radius * TAU / minimumLength : 0
  const as = minimumAngle > 0 ? TAU / minimumAngle : 0
  // minimum segments is four(4) for round primitives
  return Math.ceil(Math.max(ss, as, 4))
}

module.exports = radiusToSegments

},{"../maths/constants":110}],419:[function(require,module,exports){
const { geometries } = require('@jscad/modeling')

// objects must be an array of 3D geomertries (with polygons)
const serializeText = (objects, options) => {
  options.statusCallback && options.statusCallback({ progress: 0 })

  const result = `solid JSCAD
${convertToStl(objects, options)}
endsolid JSCAD
`
  options.statusCallback && options.statusCallback({ progress: 100 })
  return [result]
}

const convertToStl = (objects, options) => {
  const result = []
  objects.forEach((object, i) => {
    result.push(convertToFacets(object, options))
    options.statusCallback && options.statusCallback({ progress: 100 * i / objects.length })
  })
  return result.join('\n')
}

const convertToFacets = (object, options) => {
  const result = []
  const polygons = geometries.geom3.toPolygons(object)
  polygons.forEach((polygon, i) => {
    result.push(convertToFacet(polygon))
  })
  return result.join('\n')
}

const vector3DtoStlString = (v) => `${v[0]} ${v[1]} ${v[2]}`

const vertextoStlString = (vertex) => `vertex ${vector3DtoStlString(vertex)}`

const convertToFacet = (polygon) => {
  const result = []
  if (polygon.vertices.length >= 3) {
    // STL requires triangular polygons. If our polygon has more vertices, create multiple triangles:
    const firstVertexStl = vertextoStlString(polygon.vertices[0])
    for (let i = 0; i < polygon.vertices.length - 2; i++) {
      const facet = `facet normal ${vector3DtoStlString(geometries.poly3.plane(polygon))}
outer loop
${firstVertexStl}
${vertextoStlString(polygon.vertices[i + 1])}
${vertextoStlString(polygon.vertices[i + 2])}
endloop
endfacet`
      result.push(facet)
    }
  }
  return result.join('\n')
}

module.exports = {
  serializeText
}

},{"@jscad/modeling":108}],420:[function(require,module,exports){
const { geometries } = require('@jscad/modeling')

// see http://en.wikipedia.org/wiki/STL_%28file_format%29#Binary_STL

// objects must be an array of 3D geometries
const serializeBinary = (objects, options) => {
  options.statusCallback && options.statusCallback({ progress: 0 })

  // first check if the host is little-endian:
  const buffer = new ArrayBuffer(4)
  const int32buffer = new Int32Array(buffer, 0, 1)
  const int8buffer = new Int8Array(buffer, 0, 4)
  int32buffer[0] = 0x11223344
  if (int8buffer[0] !== 0x44) {
    throw new Error('Binary STL output is currently only supported on little-endian (Intel) processors')
  }

  let numtriangles = 0
  let numpolygons = 0
  objects.forEach((object, i) => {
    const polygons = geometries.geom3.toPolygons(object)
    polygons.forEach((polygon) => {
      const numvertices = polygon.vertices.length
      const thisnumtriangles = (numvertices >= 3) ? numvertices - 2 : 0
      numtriangles += thisnumtriangles
      numpolygons += 1
    })
  })

  const headerarray = new Uint8Array(80)
  for (let i = 0; i < 80; i++) {
    headerarray[i] = 65
  }

  const ar1 = new Uint32Array(1)
  ar1[0] = numtriangles

  // write the triangles to allTrianglesBuffer:
  const allTrianglesBuffer = new ArrayBuffer(50 * numtriangles)
  const allTrianglesBufferAsInt8 = new Int8Array(allTrianglesBuffer)

  // a tricky problem is that a Float32Array must be aligned at 4-byte boundaries (at least in certain browsers)
  // while each triangle takes 50 bytes. Therefore we write each triangle to a temporary buffer, and copy that
  // into allTrianglesBuffer:
  const triangleBuffer = new ArrayBuffer(50)
  const triangleBufferAsInt8 = new Int8Array(triangleBuffer)

  // each triangle consists of 12 floats:
  const triangleFloat32array = new Float32Array(triangleBuffer, 0, 12)
  // and one uint16:
  const triangleUint16array = new Uint16Array(triangleBuffer, 48, 1)

  let byteoffset = 0

  objects.forEach((object) => {
    const polygons = geometries.geom3.toPolygons(object)
    polygons.forEach((polygon, index) => {
      const vertices = polygon.vertices
      const numvertices = vertices.length
      const plane = geometries.poly3.plane(polygon)
      for (let i = 0; i < numvertices - 2; i++) {
        triangleFloat32array[0] = plane[0]
        triangleFloat32array[1] = plane[1]
        triangleFloat32array[2] = plane[2]
        let arindex = 3
        for (let v = 0; v < 3; v++) {
          const vv = v + ((v > 0) ? i : 0)
          const vertex = vertices[vv]
          triangleFloat32array[arindex++] = vertex[0]
          triangleFloat32array[arindex++] = vertex[1]
          triangleFloat32array[arindex++] = vertex[2]
        }
        triangleUint16array[0] = 0
        // copy the triangle into allTrianglesBuffer:
        allTrianglesBufferAsInt8.set(triangleBufferAsInt8, byteoffset)
        byteoffset += 50
      }

      options.statusCallback && options.statusCallback({ progress: 100 * index / numpolygons })
    })
  })
  options.statusCallback && options.statusCallback({ progress: 100 })
  return [headerarray.buffer, ar1.buffer, allTrianglesBuffer] // 'blobable array'
}

module.exports = {
  serializeBinary
}

},{"@jscad/modeling":108}],421:[function(require,module,exports){
/*
JSCAD Geometry to STL Format Serialization

## License

Copyright (c) 2018-2019 JSCAD Organization https://github.com/jscad

All code released under MIT license

Notes:
1) geom2 conversion to:
     none
2) geom3 conversion to:
     STL mesh
3) path2 conversion to:
     none
*/

/**
 * Serializer of JSCAD geometries to STL mesh.
 * @module io/stl-serializer
 * @example
 * const { serializer, mimeType } = require('@jscad/stl-serializer')
 */

const { geometries, modifiers } = require('@jscad/modeling')

const { flatten, toArray } = require('@jscad/array-utils')

const { serializeBinary } = require('./CSGToStlb')
const { serializeText } = require('./CSGToStla')

const mimeType = 'application/sla'

/**
 * Serialize the give objects to STL mesh.
 * @param {Object} options - options for serialization
 * @param {String} [options.binary='true'] - target format for data
 * @param {Function} [options.statusCallback] - call back function for progress ({ progress: 0-100 })
 * @param {...Object} objects - objects to serialize as STL
 * @returns {Array} serialized contents with one STL mesh (either string or binary data)
 * @alias module:io/stl-serializer.serialize
 * @example
 * const geometry = primitives.cube()
 * const stlData = serializer({binary: false}, geometry)
 */
const serialize = (options, ...objects) => {
  const defaults = {
    binary: true,
    statusCallback: null
  }
  options = Object.assign({}, defaults, options)

  objects = flatten(objects)

  // convert only 3D geometries
  let objects3d = objects.filter((object) => geometries.geom3.isA(object))

  if (objects3d.length === 0) throw new Error('only 3D geometries can be serialized to STL')
  if (objects.length !== objects3d.length) console.warn('some objects could not be serialized to STL')

  // convert to triangles
  objects3d = toArray(modifiers.generalize({ snap: true, triangulate: true }, objects3d))

  return options.binary ? serializeBinary(objects3d, options) : serializeText(objects3d, options)
}

module.exports = {
  mimeType,
  serialize
}

},{"./CSGToStla":419,"./CSGToStlb":420,"@jscad/array-utils":5,"@jscad/modeling":108}],422:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],423:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":422,"buffer":423,"ieee754":424}],424:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}]},{},[1]);


export default function initJSCAD(){
    return CSG
}
