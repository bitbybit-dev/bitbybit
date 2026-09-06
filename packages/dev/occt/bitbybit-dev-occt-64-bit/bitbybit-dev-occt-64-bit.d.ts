// ==============================================================================
// GENERATED FILE - DO NOT EDIT BY HAND.
// Produced from the embind registrations by emscripten --emit-tsd, then post-processed by
// src/BitbybitOcct/scripts/bitbybit_dts_compose.sh. The module type is MainModule; module.FS.* is
// the emscripten filesystem API.
// Post-processed: (1) embind enum values de-branded (<Enum>Value<N> -> <Enum>Value<number>) so a
// runtime-chosen enum value is usable where the enum type is expected - cross-enum safety is kept
// because the interface names stay distinct; (2) FS.readFile widened to string|Uint8Array (its real
// return when an encoding is passed).
// ==============================================================================
// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    namespace FS {
        export const root: any;
        export const mounts: any[];
        export const devices: {};
        export const streams: any[];
        export const nextInode: number;
        export const nameTable: any;
        export const currentPath: string;
        export const initialized: boolean;
        export const ignorePermissions: boolean;
        export const filesystems: any;
        export const syncFSRequests: number;
        export const readFiles: {};
        export { ErrnoError };
        export { FSStream };
        export { FSNode };
        export function lookupPath(path: any, opts?: {}): {
            path: string;
            node?: undefined;
        } | {
            path: string;
            node: any;
        };
        export function lookupPath(path: any, opts?: {}): {
            path: string;
            node?: undefined;
        } | {
            path: string;
            node: any;
        };
        export function getPath(node: any): any;
        export function getPath(node: any): any;
        export function hashName(parentid: any, name: any): number;
        export function hashName(parentid: any, name: any): number;
        export function hashAddNode(node: any): void;
        export function hashAddNode(node: any): void;
        export function hashRemoveNode(node: any): void;
        export function hashRemoveNode(node: any): void;
        export function lookupNode(parent: any, name: any): any;
        export function lookupNode(parent: any, name: any): any;
        export function createNode(parent: any, name: any, mode: any, rdev: any): any;
        export function createNode(parent: any, name: any, mode: any, rdev: any): any;
        export function destroyNode(node: any): void;
        export function destroyNode(node: any): void;
        export function isRoot(node: any): boolean;
        export function isRoot(node: any): boolean;
        export function isMountpoint(node: any): boolean;
        export function isMountpoint(node: any): boolean;
        export function isFile(mode: any): boolean;
        export function isFile(mode: any): boolean;
        export function isDir(mode: any): boolean;
        export function isDir(mode: any): boolean;
        export function isLink(mode: any): boolean;
        export function isLink(mode: any): boolean;
        export function isChrdev(mode: any): boolean;
        export function isChrdev(mode: any): boolean;
        export function isBlkdev(mode: any): boolean;
        export function isBlkdev(mode: any): boolean;
        export function isFIFO(mode: any): boolean;
        export function isFIFO(mode: any): boolean;
        export function isSocket(mode: any): boolean;
        export function isSocket(mode: any): boolean;
        export function flagsToPermissionString(flag: any): string;
        export function flagsToPermissionString(flag: any): string;
        export function nodePermissions(node: any, perms: any): 0 | 2;
        export function nodePermissions(node: any, perms: any): 0 | 2;
        export function mayLookup(dir: any): any;
        export function mayLookup(dir: any): any;
        export function mayCreate(dir: any, name: any): any;
        export function mayCreate(dir: any, name: any): any;
        export function mayDelete(dir: any, name: any, isdir: any): any;
        export function mayDelete(dir: any, name: any, isdir: any): any;
        export function mayOpen(node: any, flags: any): any;
        export function mayOpen(node: any, flags: any): any;
        export function checkOpExists(op: any, err: any): any;
        export function checkOpExists(op: any, err: any): any;
        export const MAX_OPEN_FDS: number;
        export function nextfd(): number;
        export function nextfd(): number;
        export function getStreamChecked(fd: any): any;
        export function getStreamChecked(fd: any): any;
        export function getStream(fd: any): any;
        export function createStream(stream: any, fd?: number): any;
        export function createStream(stream: any, fd?: number): any;
        export function closeStream(fd: any): void;
        export function closeStream(fd: any): void;
        export function dupStream(origStream: any, fd?: number): any;
        export function dupStream(origStream: any, fd?: number): any;
        export function doSetAttr(stream: any, node: any, attr: any): void;
        export function doSetAttr(stream: any, node: any, attr: any): void;
        export namespace chrdev_stream_ops {
            function open(stream: any): void;
            function open(stream: any): void;
            function llseek(): never;
            function llseek(): never;
        }
        export function major(dev: any): number;
        export function minor(dev: any): number;
        export function makedev(ma: any, mi: any): number;
        export function registerDevice(dev: any, ops: any): void;
        export function registerDevice(dev: any, ops: any): void;
        export function getDevice(dev: any): any;
        export function getMounts(mount: any): any[];
        export function getMounts(mount: any): any[];
        export function syncfs(populate: any, callback: any): void;
        export function syncfs(populate: any, callback: any): void;
        export function mount(type: any, opts: any, mountpoint: any): any;
        export function mount(type: any, opts: any, mountpoint: any): any;
        export function unmount(mountpoint: any): void;
        export function unmount(mountpoint: any): void;
        export function lookup(parent: any, name: any): any;
        export function lookup(parent: any, name: any): any;
        export function mknod(path: any, mode: any, dev: any): any;
        export function mknod(path: any, mode: any, dev: any): any;
        export function statfs(path: any): any;
        export function statfs(path: any): any;
        export function statfsStream(stream: any): any;
        export function statfsStream(stream: any): any;
        export function statfsNode(node: any): {
            bsize: number;
            frsize: number;
            blocks: number;
            bfree: number;
            bavail: number;
            files: any;
            ffree: number;
            fsid: number;
            flags: number;
            namelen: number;
        };
        export function statfsNode(node: any): {
            bsize: number;
            frsize: number;
            blocks: number;
            bfree: number;
            bavail: number;
            files: any;
            ffree: number;
            fsid: number;
            flags: number;
            namelen: number;
        };
        export function create(path: any, mode?: number): any;
        export function create(path: any, mode?: number): any;
        export function mkdir(path: any, mode?: number): any;
        export function mkdir(path: any, mode?: number): any;
        export function mkdirTree(path: any, mode: any): void;
        export function mkdirTree(path: any, mode: any): void;
        export function mkdev(path: any, mode: any, dev: any): any;
        export function mkdev(path: any, mode: any, dev: any): any;
        export function symlink(oldpath: any, newpath: any): any;
        export function symlink(oldpath: any, newpath: any): any;
        export function rename(old_path: any, new_path: any): void;
        export function rename(old_path: any, new_path: any): void;
        export function rmdir(path: any): void;
        export function rmdir(path: any): void;
        export function readdir(path: any): any;
        export function readdir(path: any): any;
        export function unlink(path: any): void;
        export function unlink(path: any): void;
        export function readlink(path: any): any;
        export function readlink(path: any): any;
        export function stat(path: any, dontFollow: any): any;
        export function stat(path: any, dontFollow: any): any;
        export function fstat(fd: any): any;
        export function fstat(fd: any): any;
        export function lstat(path: any): any;
        export function lstat(path: any): any;
        export function doChmod(stream: any, node: any, mode: any, dontFollow: any): void;
        export function doChmod(stream: any, node: any, mode: any, dontFollow: any): void;
        export function chmod(path: any, mode: any, dontFollow: any): void;
        export function chmod(path: any, mode: any, dontFollow: any): void;
        export function lchmod(path: any, mode: any): void;
        export function lchmod(path: any, mode: any): void;
        export function fchmod(fd: any, mode: any): void;
        export function fchmod(fd: any, mode: any): void;
        export function doChown(stream: any, node: any, dontFollow: any): void;
        export function doChown(stream: any, node: any, dontFollow: any): void;
        export function chown(path: any, uid: any, gid: any, dontFollow: any): void;
        export function chown(path: any, uid: any, gid: any, dontFollow: any): void;
        export function lchown(path: any, uid: any, gid: any): void;
        export function lchown(path: any, uid: any, gid: any): void;
        export function fchown(fd: any, uid: any, gid: any): void;
        export function fchown(fd: any, uid: any, gid: any): void;
        export function doTruncate(stream: any, node: any, len: any): void;
        export function doTruncate(stream: any, node: any, len: any): void;
        export function truncate(path: any, len: any): void;
        export function truncate(path: any, len: any): void;
        export function ftruncate(fd: any, len: any): void;
        export function ftruncate(fd: any, len: any): void;
        export function utime(path: any, atime: any, mtime: any): void;
        export function utime(path: any, atime: any, mtime: any): void;
        export function open(path: any, flags: any, mode?: number): any;
        export function open(path: any, flags: any, mode?: number): any;
        export function close(stream: any): void;
        export function close(stream: any): void;
        export function isClosed(stream: any): boolean;
        export function isClosed(stream: any): boolean;
        export function llseek(stream: any, offset: any, whence: any): any;
        export function llseek(stream: any, offset: any, whence: any): any;
        export function read(stream: any, buffer: any, offset: any, length: any, position: any): any;
        export function read(stream: any, buffer: any, offset: any, length: any, position: any): any;
        export function write(stream: any, buffer: any, offset: any, length: any, position: any, canOwn: any): any;
        export function write(stream: any, buffer: any, offset: any, length: any, position: any, canOwn: any): any;
        export function mmap(stream: any, length: any, position: any, prot: any, flags: any): any;
        export function mmap(stream: any, length: any, position: any, prot: any, flags: any): any;
        export function msync(stream: any, buffer: any, offset: any, length: any, mmapFlags: any): any;
        export function msync(stream: any, buffer: any, offset: any, length: any, mmapFlags: any): any;
        export function ioctl(stream: any, cmd: any, arg: any): any;
        export function ioctl(stream: any, cmd: any, arg: any): any;
        export function readFile(path: any, opts?: {}): string | Uint8Array;
        export function readFile(path: any, opts?: {}): string | Uint8Array;
        export function writeFile(path: any, data: any, opts?: {}): void;
        export function writeFile(path: any, data: any, opts?: {}): void;
        export function cwd(): any;
        export function chdir(path: any): void;
        export function chdir(path: any): void;
        export function createDefaultDirectories(): void;
        export function createDefaultDirectories(): void;
        export function createDefaultDevices(): void;
        export function createDefaultDevices(): void;
        export function createSpecialDirectories(): void;
        export function createSpecialDirectories(): void;
        export function createStandardStreams(input: any, output: any, error: any): void;
        export function createStandardStreams(input: any, output: any, error: any): void;
        export function staticInit(): void;
        export function staticInit(): void;
        export function init(input: any, output: any, error: any): void;
        export function init(input: any, output: any, error: any): void;
        export function quit(): void;
        export function quit(): void;
        export function findObject(path: any, dontResolveLastLink: any): any;
        export function findObject(path: any, dontResolveLastLink: any): any;
        export function analyzePath(path: any, dontResolveLastLink: any): {
            isRoot: boolean;
            exists: boolean;
            error: number;
            name: any;
            path: any;
            object: any;
            parentExists: boolean;
            parentPath: any;
            parentObject: any;
        };
        export function analyzePath(path: any, dontResolveLastLink: any): {
            isRoot: boolean;
            exists: boolean;
            error: number;
            name: any;
            path: any;
            object: any;
            parentExists: boolean;
            parentPath: any;
            parentObject: any;
        };
        export function createPath(parent: any, path: any, canRead: any, canWrite: any): any;
        export function createPath(parent: any, path: any, canRead: any, canWrite: any): any;
        export function createFile(parent: any, name: any, properties: any, canRead: any, canWrite: any): any;
        export function createFile(parent: any, name: any, properties: any, canRead: any, canWrite: any): any;
        export function createDataFile(parent: any, name: any, data: any, canRead: any, canWrite: any, canOwn: any): void;
        export function createDataFile(parent: any, name: any, data: any, canRead: any, canWrite: any, canOwn: any): void;
        export function createDevice(parent: any, name: any, input: any, output: any): any;
        export function createDevice(parent: any, name: any, input: any, output: any): any;
        export function forceLoadFile(obj: any): boolean;
        export function forceLoadFile(obj: any): boolean;
        export function createLazyFile(parent: any, name: any, url: any, canRead: any, canWrite: any): any;
        export function createLazyFile(parent: any, name: any, url: any, canRead: any, canWrite: any): any;
    }
    function FS_createPath(...args: any[]): any;
    function FS_createDataFile(...args: any[]): any;
    function FS_preloadFile(parent: any, name: any, url: any, canRead: any, canWrite: any, dontCreateFile: any, canOwn: any, preFinish: any): Promise<void>;
    function FS_unlink(...args: any[]): any;
    function FS_createLazyFile(...args: any[]): any;
    function FS_createDevice(...args: any[]): any;
    function addRunDependency(id: any): void;
    function removeRunDependency(id: any): void;
}
declare class ErrnoError {
    constructor(errno: any);
    name: string;
    errno: any;
}
declare class FSStream {
    shared: {};
    set object(arg: any);
    get object(): any;
    node: any;
    get isRead(): boolean;
    get isWrite(): boolean;
    get isAppend(): number;
    set flags(arg: any);
    get flags(): any;
    set position(arg: any);
    get position(): any;
}
declare class FSNode {
    constructor(parent: any, name: any, mode: any, rdev: any);
    node_ops: {};
    stream_ops: {};
    readMode: number;
    writeMode: number;
    mounted: any;
    parent: any;
    mount: any;
    id: number;
    name: any;
    mode: any;
    rdev: any;
    atime: number;
    mtime: number;
    ctime: number;
    set read(arg: boolean);
    get read(): boolean;
    set write(arg: boolean);
    get write(): boolean;
    get isFolder(): any;
    get isDevice(): any;
}
interface WasmModule {
  _BitbybitOcct_Init(): number;
}

type EmbindString = ArrayBuffer|Uint8Array|Uint8ClampedArray|Int8Array|string;
export interface ClassHandle {
  isAliasOf(other: ClassHandle): boolean;
  delete(): void;
  deleteLater(): this;
  isDeleted(): boolean;
  // @ts-ignore - If targeting lower than ESNext, this symbol might not exist.
  [Symbol.dispose](): void;
  clone(): this;
}
export interface gp_XYZ extends ClassHandle {
  Added(_0: gp_XYZ): gp_XYZ;
  Subtracted(_0: gp_XYZ): gp_XYZ;
  Crossed(_0: gp_XYZ): gp_XYZ;
  Add(_0: gp_XYZ): void;
  Subtract(_0: gp_XYZ): void;
  Cross(_0: gp_XYZ): void;
  X(): number;
  Y(): number;
  Z(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetZ(_0: number): void;
  SetCoord(_0: number, _1: number, _2: number): void;
  Multiply(_0: number): void;
  Multiplied(_0: number): gp_XYZ;
  Divide(_0: number): void;
  Divided(_0: number): gp_XYZ;
  Dot(_0: gp_XYZ): number;
  Modulus(): number;
  SquareModulus(): number;
}

export interface gp_Pnt extends ClassHandle {
  Translated(_0: gp_Vec): gp_Pnt;
  Transformed(_0: gp_Trsf): gp_Pnt;
  Translate(_0: gp_Vec): void;
  Transform(_0: gp_Trsf): void;
  X(): number;
  Y(): number;
  Z(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetZ(_0: number): void;
  SetCoord(_0: number, _1: number, _2: number): void;
  Distance(_0: gp_Pnt): number;
  SquareDistance(_0: gp_Pnt): number;
  IsEqual(_0: gp_Pnt, _1: number): boolean;
}

export interface gp_Vec extends ClassHandle {
  Added(_0: gp_Vec): gp_Vec;
  Subtracted(_0: gp_Vec): gp_Vec;
  Crossed(_0: gp_Vec): gp_Vec;
  Normalized(): gp_Vec;
  Reversed(): gp_Vec;
  Add(_0: gp_Vec): void;
  Subtract(_0: gp_Vec): void;
  Cross(_0: gp_Vec): void;
  Normalize(): void;
  Reverse(): void;
  X(): number;
  Y(): number;
  Z(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetZ(_0: number): void;
  SetCoord(_0: number, _1: number, _2: number): void;
  Magnitude(): number;
  SquareMagnitude(): number;
  IsEqual(_0: gp_Vec, _1: number, _2: number): boolean;
  IsNormal(_0: gp_Vec, _1: number): boolean;
  IsParallel(_0: gp_Vec, _1: number): boolean;
  Angle(_0: gp_Vec): number;
  Multiply(_0: number): void;
  Multiplied(_0: number): gp_Vec;
  Divide(_0: number): void;
  Divided(_0: number): gp_Vec;
  Dot(_0: gp_Vec): number;
}

export interface gp_Dir extends ClassHandle {
  Crossed(_0: gp_Dir): gp_Dir;
  Reversed(): gp_Dir;
  Cross(_0: gp_Dir): void;
  Reverse(): void;
  X(): number;
  Y(): number;
  Z(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetZ(_0: number): void;
  SetCoord(_0: number, _1: number, _2: number): void;
  IsEqual(_0: gp_Dir, _1: number): boolean;
  IsNormal(_0: gp_Dir, _1: number): boolean;
  IsParallel(_0: gp_Dir, _1: number): boolean;
  Angle(_0: gp_Dir): number;
  Dot(_0: gp_Dir): number;
}

export interface gp_Ax1 extends ClassHandle {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  Reversed(): gp_Ax1;
  SetLocation(_0: gp_Pnt): void;
  SetDirection(_0: gp_Dir): void;
  Reverse(): void;
  IsCoaxial(_0: gp_Ax1, _1: number, _2: number): boolean;
  IsNormal(_0: gp_Ax1, _1: number): boolean;
  IsParallel(_0: gp_Ax1, _1: number): boolean;
  Angle(_0: gp_Ax1): number;
}

export interface gp_Ax2 extends ClassHandle {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  Axis(): gp_Ax1;
  SetLocation(_0: gp_Pnt): void;
  SetDirection(_0: gp_Dir): void;
  SetXDirection(_0: gp_Dir): void;
  SetYDirection(_0: gp_Dir): void;
  SetAxis(_0: gp_Ax1): void;
  IsCoplanar(_0: gp_Ax2, _1: number, _2: number): boolean;
}

export interface gp_Ax3 extends ClassHandle {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  XDirection(): gp_Dir;
  YDirection(): gp_Dir;
  Axis(): gp_Ax1;
  Ax2(): gp_Ax2;
  SetLocation(_0: gp_Pnt): void;
  SetDirection(_0: gp_Dir): void;
  SetXDirection(_0: gp_Dir): void;
  SetYDirection(_0: gp_Dir): void;
  SetAxis(_0: gp_Ax1): void;
  Direct(): boolean;
}

export interface gp_Trsf extends ClassHandle {
  TranslationPart(): gp_XYZ;
  Inverted(): gp_Trsf;
  Multiplied(_0: gp_Trsf): gp_Trsf;
  SetMirror(_0: gp_Pnt): void;
  SetMirrorAx1(_0: gp_Ax1): void;
  SetMirrorAx2(_0: gp_Ax2): void;
  SetMirrorOnPlane(_0: gp_Ax2): void;
  SetTranslation(_0: gp_Vec): void;
  SetTranslationPart(_0: gp_Vec): void;
  SetDisplacement(_0: gp_Ax3, _1: gp_Ax3): void;
  Invert(): void;
  Multiply(_0: gp_Trsf): void;
  PreMultiply(_0: gp_Trsf): void;
  Transforms(_0: gp_XYZ): void;
  IsNegative(): boolean;
  SetRotation(_0: gp_Ax1, _1: number): void;
  SetScale(_0: gp_Pnt, _1: number): void;
  SetValues(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number, _10: number, _11: number): void;
  ScaleFactor(): number;
  Value(_0: number, _1: number): number;
}

export interface gp_Pln extends ClassHandle {
  Location(): gp_Pnt;
  Position(): gp_Ax3;
  Axis(): gp_Ax1;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  SetLocation(_0: gp_Pnt): void;
  SetPosition(_0: gp_Ax3): void;
  SetAxis(_0: gp_Ax1): void;
  Distance(_0: gp_Pnt): number;
  Contains(_0: gp_Pnt, _1: number): boolean;
}

export interface gp_Lin extends ClassHandle {
  Location(): gp_Pnt;
  Direction(): gp_Dir;
  Position(): gp_Ax1;
  SetLocation(_0: gp_Pnt): void;
  SetDirection(_0: gp_Dir): void;
  SetPosition(_0: gp_Ax1): void;
  Angle(_0: gp_Lin): number;
  Distance(_0: gp_Pnt): number;
  SquareDistance(_0: gp_Pnt): number;
  Contains(_0: gp_Pnt, _1: number): boolean;
}

export interface gp_Circ extends ClassHandle {
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Axis(): gp_Ax1;
  XAxis(): gp_Ax1;
  YAxis(): gp_Ax1;
  SetLocation(_0: gp_Pnt): void;
  SetPosition(_0: gp_Ax2): void;
  SetAxis(_0: gp_Ax1): void;
  Radius(): number;
  Area(): number;
  Length(): number;
  SetRadius(_0: number): void;
  Distance(_0: gp_Pnt): number;
  SquareDistance(_0: gp_Pnt): number;
  Contains(_0: gp_Pnt, _1: number): boolean;
}

export interface gp_XY extends ClassHandle {
  Added(_0: gp_XY): gp_XY;
  Subtracted(_0: gp_XY): gp_XY;
  Add(_0: gp_XY): void;
  Subtract(_0: gp_XY): void;
  X(): number;
  Y(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetCoord(_0: number, _1: number): void;
  Multiply(_0: number): void;
  Multiplied(_0: number): gp_XY;
  Modulus(): number;
  SquareModulus(): number;
  Dot(_0: gp_XY): number;
  Crossed(_0: gp_XY): number;
}

export interface gp_Pnt2d extends ClassHandle {
  Translated(_0: gp_Vec2d): gp_Pnt2d;
  Translate(_0: gp_Vec2d): void;
  X(): number;
  Y(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetCoord(_0: number, _1: number): void;
  Distance(_0: gp_Pnt2d): number;
  SquareDistance(_0: gp_Pnt2d): number;
  IsEqual(_0: gp_Pnt2d, _1: number): boolean;
}

export interface gp_Vec2d extends ClassHandle {
  Added(_0: gp_Vec2d): gp_Vec2d;
  Subtracted(_0: gp_Vec2d): gp_Vec2d;
  Normalized(): gp_Vec2d;
  Reversed(): gp_Vec2d;
  Add(_0: gp_Vec2d): void;
  Subtract(_0: gp_Vec2d): void;
  Normalize(): void;
  Reverse(): void;
  X(): number;
  Y(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetCoord(_0: number, _1: number): void;
  Magnitude(): number;
  SquareMagnitude(): number;
  Angle(_0: gp_Vec2d): number;
  Multiply(_0: number): void;
  Multiplied(_0: number): gp_Vec2d;
  Dot(_0: gp_Vec2d): number;
  Crossed(_0: gp_Vec2d): number;
}

export interface gp_Dir2d extends ClassHandle {
  Reversed(): gp_Dir2d;
  Reverse(): void;
  X(): number;
  Y(): number;
  SetX(_0: number): void;
  SetY(_0: number): void;
  SetCoord(_0: number, _1: number): void;
  Angle(_0: gp_Dir2d): number;
  Dot(_0: gp_Dir2d): number;
  Crossed(_0: gp_Dir2d): number;
}

export interface gp_Ax2d extends ClassHandle {
  Location(): gp_Pnt2d;
  Direction(): gp_Dir2d;
  Reversed(): gp_Ax2d;
  SetLocation(_0: gp_Pnt2d): void;
  SetDirection(_0: gp_Dir2d): void;
  Reverse(): void;
  Angle(_0: gp_Ax2d): number;
}

export interface gp_Ax22d extends ClassHandle {
  Location(): gp_Pnt2d;
  XDirection(): gp_Dir2d;
  YDirection(): gp_Dir2d;
  XAxis(): gp_Ax2d;
  YAxis(): gp_Ax2d;
  SetLocation(_0: gp_Pnt2d): void;
  SetXDirection(_0: gp_Dir2d): void;
  SetYDirection(_0: gp_Dir2d): void;
}

export interface gp_Lin2d extends ClassHandle {
  Location(): gp_Pnt2d;
  Direction(): gp_Dir2d;
  Position(): gp_Ax2d;
  SetLocation(_0: gp_Pnt2d): void;
  SetDirection(_0: gp_Dir2d): void;
  Angle(_0: gp_Lin2d): number;
  Distance(_0: gp_Pnt2d): number;
  Contains(_0: gp_Pnt2d, _1: number): boolean;
}

export interface gp_Circ2d extends ClassHandle {
  Location(): gp_Pnt2d;
  SetLocation(_0: gp_Pnt2d): void;
  Radius(): number;
  Area(): number;
  SetRadius(_0: number): void;
  Contains(_0: gp_Pnt2d, _1: number): boolean;
  Distance(_0: gp_Pnt2d): number;
}

export interface gp_Elips2d extends ClassHandle {
  Location(): gp_Pnt2d;
  MajorRadius(): number;
  MinorRadius(): number;
  Area(): number;
  SetMajorRadius(_0: number): void;
  SetMinorRadius(_0: number): void;
}

export interface gp_Trsf2d extends ClassHandle {
  TranslationPart(): gp_XY;
  Inverted(): gp_Trsf2d;
  Multiplied(_0: gp_Trsf2d): gp_Trsf2d;
  SetMirror(_0: gp_Pnt2d): void;
  SetMirrorAx2d(_0: gp_Ax2d): void;
  SetTranslation(_0: gp_Vec2d): void;
  SetTranslationPart(_0: gp_Vec2d): void;
  Invert(): void;
  Multiply(_0: gp_Trsf2d): void;
  IsNegative(): boolean;
  SetRotation(_0: gp_Pnt2d, _1: number): void;
  SetScale(_0: gp_Pnt2d, _1: number): void;
  ScaleFactor(): number;
}

export interface gp_Elips extends ClassHandle {
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  SetLocation(_0: gp_Pnt): void;
  SetPosition(_0: gp_Ax2): void;
  MajorRadius(): number;
  MinorRadius(): number;
  Area(): number;
  SetMajorRadius(_0: number): void;
  SetMinorRadius(_0: number): void;
}

export interface gp_Hypr extends ClassHandle {
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  MajorRadius(): number;
  MinorRadius(): number;
  Focal(): number;
  Eccentricity(): number;
}

export interface gp_Parab extends ClassHandle {
  Location(): gp_Pnt;
  Position(): gp_Ax2;
  Focal(): number;
  Parameter(): number;
}

export interface gp_GTrsf extends ClassHandle {
  Inverted(): gp_GTrsf;
  Multiplied(_0: gp_GTrsf): gp_GTrsf;
  Trsf(): gp_Trsf;
  SetTranslationPart(_0: gp_XYZ): void;
  Invert(): void;
  Multiply(_0: gp_GTrsf): void;
  SetAffinity(_0: gp_Ax1, _1: number): void;
  SetValue(_0: number, _1: number, _2: number): void;
  Value(_0: number, _1: number): number;
  SetVectorialPart(_0: gp_Mat): void;
}

export interface Geom_Surface extends ClassHandle {
  Value(_0: number, _1: number): gp_Pnt;
  IsUClosed(): boolean;
  IsVClosed(): boolean;
  IsUPeriodic(): boolean;
  IsVPeriodic(): boolean;
  UPeriod(): number;
  VPeriod(): number;
}

export interface Geom_CylindricalSurface extends Geom_Surface {
  Radius(): number;
  SetRadius(_0: number): void;
}

export interface Geom_Curve extends ClassHandle {
  Value(_0: number): gp_Pnt;
  FirstParameter(): number;
  LastParameter(): number;
  D0(_0: number, _1: gp_Pnt): void;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
}

export interface Geom2d_Curve extends ClassHandle {
  Value(_0: number): gp_Pnt2d;
  FirstParameter(): number;
  LastParameter(): number;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
}

export interface Geom2d_Circle extends Geom2d_Curve {
  Radius(): number;
  SetRadius(_0: number): void;
}

export interface Geom2d_Ellipse extends Geom2d_Curve {
  MajorRadius(): number;
  MinorRadius(): number;
  SetMajorRadius(_0: number): void;
  SetMinorRadius(_0: number): void;
}

export interface Geom2d_TrimmedCurve extends Geom2d_Curve {
}

export interface Handle_Geom_Surface extends ClassHandle {
  IsNull(): boolean;
  get(): Geom_Surface | null;
  delete(): void;
}

export interface Handle_Geom_Curve extends ClassHandle {
  IsNull(): boolean;
  get(): Geom_Curve | null;
  delete(): void;
  FirstParameter(): number;
  LastParameter(): number;
  Value(_0: number): gp_Pnt;
  D0(_0: number, _1: gp_Pnt): void;
  DN(_0: number, _1: number): gp_Vec;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
}

export interface Handle_Geom2d_Curve extends ClassHandle {
  IsNull(): boolean;
  get(): Geom2d_Curve | null;
  delete(): void;
  Value(_0: number): gp_Pnt2d;
  FirstParameter(): number;
  LastParameter(): number;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
}

export interface TopoDS_Shape extends ClassHandle {
  IsNull(): boolean;
  Nullify(): void;
  Free(): boolean;
  SetFree(_0: boolean): void;
  Locked(): boolean;
  SetLocked(_0: boolean): void;
  Modified(): boolean;
  SetModified(_0: boolean): void;
  Checked(): boolean;
  SetChecked(_0: boolean): void;
  Orientable(): boolean;
  SetOrientable(_0: boolean): void;
  Closed(): boolean;
  SetClosed(_0: boolean): void;
  Infinite(): boolean;
  SetInfinite(_0: boolean): void;
  Convex(): boolean;
  SetConvex(_0: boolean): void;
  Reverse(): void;
  Reversed(): TopoDS_Shape;
  Complement(): void;
  Complemented(): TopoDS_Shape;
  NbChildren(): number;
  IsEqual(_0: TopoDS_Shape): boolean;
  IsSame(_0: TopoDS_Shape): boolean;
  IsPartner(_0: TopoDS_Shape): boolean;
  IsNotEqual(_0: TopoDS_Shape): boolean;
  Location(): TopLoc_Location;
  SetLocation(_0: TopLoc_Location, _1: boolean): void;
  Located(_0: TopLoc_Location): TopoDS_Shape;
  Moved(_0: TopLoc_Location): TopoDS_Shape;
  Move(_0: TopLoc_Location): void;
  ShapeType(): TopAbs_ShapeEnum;
  Orientation(): TopAbs_Orientation;
  SetOrientation(_0: TopAbs_Orientation): void;
  Oriented(_0: TopAbs_Orientation): TopoDS_Shape;
  Compose(_0: TopAbs_Orientation): void;
  Composed(_0: TopAbs_Orientation): TopoDS_Shape;
}

export interface TopoDS_Vertex extends TopoDS_Shape {
}

export interface TopoDS_Edge extends TopoDS_Shape {
}

export interface TopoDS_Wire extends TopoDS_Shape {
}

export interface TopoDS_Face extends TopoDS_Shape {
}

export interface TopoDS_Shell extends TopoDS_Shape {
}

export interface TopoDS_Solid extends TopoDS_Shape {
}

export interface TopoDS_Compound extends TopoDS_Shape {
}

export interface TopoDS_CompSolid extends TopoDS_Shape {
}

export interface TopExp_Explorer extends ClassHandle {
  More(): boolean;
  Next(): void;
  Current(): TopoDS_Shape;
  ReInit(): void;
  ExploredShape(): TopoDS_Shape;
  Depth(): number;
  Clear(): void;
  Init(_0: TopoDS_Shape, _1: TopAbs_ShapeEnum, _2: TopAbs_ShapeEnum): void;
}

export interface TopLoc_Location extends ClassHandle {
  IsIdentity(): boolean;
  Identity(): void;
  Transformation(): gp_Trsf;
  Inverted(): TopLoc_Location;
  Multiplied(_0: TopLoc_Location): TopLoc_Location;
  Divided(_0: TopLoc_Location): TopLoc_Location;
  Predivided(_0: TopLoc_Location): TopLoc_Location;
  Powered(_0: number): TopLoc_Location;
  IsEqual(_0: TopLoc_Location): boolean;
  IsDifferent(_0: TopLoc_Location): boolean;
  Clear(): void;
}

export interface TopoDS_Iterator extends ClassHandle {
  Initialize(_0: TopoDS_Shape, _1: boolean, _2: boolean): void;
  More(): boolean;
  Next(): void;
  Value(): TopoDS_Shape;
}

export interface BRepPrimAPI_MakeBox extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
  BottomFace(): TopoDS_Face;
  TopFace(): TopoDS_Face;
  FrontFace(): TopoDS_Face;
  BackFace(): TopoDS_Face;
  LeftFace(): TopoDS_Face;
  RightFace(): TopoDS_Face;
}

export interface BRepPrimAPI_MakeCylinder extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepPrimAPI_MakeSphere extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepPrimAPI_MakeCone extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepPrimAPI_MakeTorus extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepPrimAPI_MakeWedge extends ClassHandle {
  Shape(): TopoDS_Shape;
  Solid(): TopoDS_Solid;
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepPrimAPI_MakePrism extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
}

export interface BRepPrimAPI_MakeRevol extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
}

export interface BRepAlgoAPI_Fuse extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
}

export interface BRepAlgoAPI_Cut extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
}

export interface BRepAlgoAPI_Common extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  HasGenerated(): boolean;
  Build(): void;
}

export interface BRepAlgoAPI_Section extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  Build(): void;
}

export interface BRepAlgoAPI_Splitter extends ClassHandle {
  Build(): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  HasErrors(): boolean;
  HasWarnings(): boolean;
  SetArguments(_0: TopTools_ListOfShape): void;
  SetTools(_0: TopTools_ListOfShape): void;
}

export interface BRepBuilderAPI_MakeVertex extends ClassHandle {
  Vertex(): TopoDS_Vertex;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_MakeEdge extends ClassHandle {
  Edge(): TopoDS_Edge;
  IsDone(): boolean;
  Vertex1(): TopoDS_Vertex;
  Vertex2(): TopoDS_Vertex;
}

export interface BRepBuilderAPI_MakeWire extends ClassHandle {
  AddEdge(_0: TopoDS_Edge): void;
  AddWire(_0: TopoDS_Wire): void;
  Wire(): TopoDS_Wire;
  IsDone(): boolean;
  Error(): BRepBuilderAPI_WireError;
}

export interface BRepBuilderAPI_MakeFace extends ClassHandle {
  AddWire(_0: TopoDS_Wire): void;
  Face(): TopoDS_Face;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_MakePolygon extends ClassHandle {
  Add(_0: gp_Pnt): void;
  Close(): void;
  Wire(): TopoDS_Wire;
  Edge(): TopoDS_Edge;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_Transform extends ClassHandle {
  Perform(_0: TopoDS_Shape, _1: boolean, _2: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  ModifiedShape(_0: TopoDS_Shape): TopoDS_Shape;
}

export interface BRep_Builder extends ClassHandle {
  MakeCompound(): TopoDS_Compound;
  MakeCompSolid(): TopoDS_CompSolid;
  MakeSolid(): TopoDS_Solid;
  MakeShell(): TopoDS_Shell;
  MakeWire(): TopoDS_Wire;
  Add(_0: TopoDS_Shape, _1: TopoDS_Shape): void;
  Remove(_0: TopoDS_Shape, _1: TopoDS_Shape): void;
}

export interface BRepBuilderAPI_MakeShell extends ClassHandle {
  Shell(): TopoDS_Shell;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_MakeSolid extends ClassHandle {
  Add(_0: TopoDS_Shell): void;
  Solid(): TopoDS_Solid;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_Sewing extends ClassHandle {
  Init(_0: number, _1: boolean, _2: boolean, _3: boolean, _4: boolean): void;
  Add(_0: TopoDS_Shape): void;
  Perform(): void;
  SewedShape(): TopoDS_Shape;
  NbFreeEdges(): number;
  NbMultipleEdges(): number;
  NbDegeneratedShapes(): number;
}

export interface BRepBuilderAPI_Copy extends ClassHandle {
  Perform(_0: TopoDS_Shape, _1: boolean, _2: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
}

export interface BRepBuilderAPI_GTransform extends ClassHandle {
  Perform(_0: TopoDS_Shape, _1: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
}

export interface BRepFilletAPI_MakeFillet extends ClassHandle {
  Add(_0: number, _1: TopoDS_Edge): void;
  AddVariable(_0: number, _1: number, _2: TopoDS_Edge): void;
  SetRadius(_0: number, _1: number, _2: number): void;
  NbEdges(_0: number): number;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  AddWithLaw(_0: TColgp_Array1OfPnt2d, _1: TopoDS_Edge): void;
}

export interface BRepFilletAPI_MakeChamfer extends ClassHandle {
  Add(_0: number, _1: TopoDS_Edge): void;
  AddTwoDistances(_0: number, _1: number, _2: TopoDS_Edge, _3: TopoDS_Face): void;
  AddDA(_0: number, _1: number, _2: TopoDS_Edge, _3: TopoDS_Face): void;
  NbEdges(_0: number): number;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
}

export interface BRepFilletAPI_MakeFillet2d extends ClassHandle {
  Init(_0: TopoDS_Face): void;
  AddFillet(_0: TopoDS_Vertex, _1: number): TopoDS_Edge;
  AddChamfer(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: number, _3: number): TopoDS_Edge;
  AddChamferVertex(_0: TopoDS_Edge, _1: TopoDS_Vertex, _2: number, _3: number): TopoDS_Edge;
  Build(): void;
  IsDone(): boolean;
  Shape(): TopoDS_Shape;
  NbFillet(): number;
  NbChamfer(): number;
}

export interface ChFi2d_FilletAlgo extends ClassHandle {
  Init(_0: TopoDS_Wire, _1: gp_Pln): void;
  Perform(_0: number): boolean;
  NbResults(_0: gp_Pnt): number;
  Result(_0: gp_Pnt, _1: TopoDS_Edge, _2: TopoDS_Edge, _3: number): TopoDS_Edge;
}

export interface BRepOffsetAPI_MakeOffset extends ClassHandle {
  AddWire(_0: TopoDS_Wire): void;
  Perform(_0: number, _1: number): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  Init(_0: TopoDS_Face, _1: GeomAbs_JoinType, _2: boolean): void;
  InitJoin(_0: GeomAbs_JoinType, _1: boolean): void;
}

export interface BRepOffsetAPI_ThruSections extends ClassHandle {
  AddWire(_0: TopoDS_Wire): void;
  AddVertex(_0: TopoDS_Vertex): void;
  SetSmoothing(_0: boolean): void;
  SetMaxDegree(_0: number): void;
  CheckCompatibility(_0: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  SetParType(_0: Approx_ParametrizationType): void;
}

export interface BRepOffsetAPI_MakePipe extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
}

export interface BRepOffsetAPI_MakePipeShell extends ClassHandle {
  SetMode(_0: boolean): void;
  SetModeDir(_0: gp_Dir): void;
  Add(_0: TopoDS_Shape, _1: boolean, _2: boolean): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  MakeSolid(): boolean;
  FirstShape(): TopoDS_Shape;
  LastShape(): TopoDS_Shape;
  SetModeWithAuxSpine(_0: TopoDS_Wire, _1: boolean, _2: BRepFill_TypeOfContact): void;
}

export interface BRepOffsetAPI_MakeOffsetShape extends ClassHandle {
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  PerformByJoin(_0: TopoDS_Shape, _1: number, _2: number, _3: BRepOffset_Mode, _4: boolean, _5: boolean, _6: GeomAbs_JoinType, _7: boolean): void;
}

export interface BRepOffsetAPI_MakeThickSolid extends ClassHandle {
  MakeThickSolidBySimple(_0: TopoDS_Shape, _1: number): void;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
  Build(): void;
  MakeThickSolidByJoin(_0: TopoDS_Shape, _1: TopTools_ListOfShape, _2: number, _3: number, _4: BRepOffset_Mode, _5: boolean, _6: boolean, _7: GeomAbs_JoinType, _8: boolean): void;
}

export interface BRepProj_Projection extends ClassHandle {
  IsDone(): boolean;
  Shape(): TopoDS_Compound;
  Current(): TopoDS_Wire;
  More(): boolean;
  Next(): void;
}

export interface BOPAlgo_Builder extends ClassHandle {
  AddArgument(_0: TopoDS_Shape): void;
  SetNonDestructive(_0: boolean): void;
  SetFuzzyValue(_0: number): void;
  Perform(): void;
  HasErrors(): boolean;
  Shape(): TopoDS_Shape;
  Modified(_0: TopoDS_Shape): TopTools_ListOfShape;
}

export interface BRepOffsetAPI_DraftAngle extends ClassHandle {
  Init(_0: TopoDS_Shape): void;
  Add(_0: TopoDS_Face, _1: gp_Dir, _2: number, _3: gp_Pln, _4: boolean): void;
  AddDone(): boolean;
  Build(): void;
  IsDone(): boolean;
  Shape(): TopoDS_Shape;
}

export interface BRepOffsetAPI_MakeDraft extends ClassHandle {
  SetDraft(_0: boolean): void;
  Perform(_0: number): void;
  PerformToShape(_0: TopoDS_Shape, _1: boolean): void;
  Shell(): TopoDS_Shell;
  Shape(): TopoDS_Shape;
  IsDone(): boolean;
}

export interface GProp_GProps extends ClassHandle {
  Mass(): number;
  CentreOfMass(): gp_Pnt;
}

export interface BRepBndLib extends ClassHandle {
}

export interface BRepTools extends ClassHandle {
}

export interface BRep_Tool extends ClassHandle {
}

export interface Poly_Triangle extends ClassHandle {
  Set(_0: number, _1: number, _2: number): void;
  Value(_0: number): number;
  ChangeValue(_0: number): number;
}

export interface Poly_Triangulation extends ClassHandle {
  IsNull(): boolean;
  NbNodes(): number;
  NbTriangles(): number;
  HasNormals(): boolean;
  HasUVNodes(): boolean;
  Node(_0: number): gp_Pnt;
  Triangle(_0: number): Poly_Triangle;
  Normal(_0: number): gp_Dir;
  UVNode(_0: number): gp_Pnt2d;
}

export interface Poly_Connect extends ClassHandle {
  Triangle(_0: number): number;
  Initialize(_0: number): void;
  More(): boolean;
  Next(): void;
  Value(): number;
}

export interface StdPrs_ToolTriangulatedShape extends ClassHandle {
}

export interface BRepMesh_IncrementalMesh extends ClassHandle {
  Perform(): void;
  IsDone(): boolean;
}

export interface STEPControl_Reader extends ClassHandle {
  NbRootsForTransfer(): number;
  TransferRoot(_0: number): boolean;
  TransferRoots(): number;
  NbShapes(): number;
  Shape(_0: number): TopoDS_Shape;
  OneShape(): TopoDS_Shape;
  ClearShapes(): void;
  ReadFile(_0: EmbindString): IFSelect_ReturnStatus;
}

export interface STEPControl_Writer extends ClassHandle {
  Transfer(_0: TopoDS_Shape, _1: STEPControl_StepModelType): IFSelect_ReturnStatus;
  Write(_0: EmbindString): IFSelect_ReturnStatus;
}

export interface STEPControl_StepModelTypeValue<T extends number> {
  value: T;
}
export type STEPControl_StepModelType = STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>|STEPControl_StepModelTypeValue<number>;

export interface IGESControl_Reader extends ClassHandle {
  NbRootsForTransfer(): number;
  TransferRoots(): number;
  NbShapes(): number;
  Shape(_0: number): TopoDS_Shape;
  OneShape(): TopoDS_Shape;
  ClearShapes(): void;
  ReadFile(_0: EmbindString): IFSelect_ReturnStatus;
}

export interface IGESControl_Writer extends ClassHandle {
  AddShape(_0: TopoDS_Shape): boolean;
  ComputeModel(): void;
  Write(_0: EmbindString): boolean;
}

export interface StlAPI_Writer extends ClassHandle {
  SetASCIIMode(_0: boolean): void;
  GetASCIIMode(): boolean;
  Write(_0: TopoDS_Shape, _1: EmbindString): boolean;
}

export interface TopTools_ListOfShape extends ClassHandle {
  Size(): number;
  IsEmpty(): boolean;
  Clear(): void;
  Append(_0: TopoDS_Shape): void;
  First(): TopoDS_Shape;
}

export interface TColgp_Array1OfPnt2d extends ClassHandle {
  Lower(): number;
  Upper(): number;
  Length(): number;
  Value(_0: number): gp_Pnt2d;
  SetValue(_0: number, _1: gp_Pnt2d): void;
}

export interface TColgp_Array1OfDir extends ClassHandle {
  Lower(): number;
  Upper(): number;
  Length(): number;
  Value(_0: number): gp_Dir;
  SetValue(_0: number, _1: gp_Dir): void;
}

export interface VectorDouble extends ClassHandle {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export interface VectorInt extends ClassHandle {
  push_back(_0: number): void;
  resize(_0: number, _1: number): void;
  size(): number;
  get(_0: number): number | undefined;
  set(_0: number, _1: number): boolean;
}

export type CoordResult = {
  X: number,
  Y: number,
  Z: number,
  IsValid: boolean
};

export type UVResult = {
  U: number,
  V: number,
  IsValid: boolean
};

export type EdgeCurveResult = {
  First: number,
  Last: number,
  IsValid: boolean
};

export interface CurvePointResult extends ClassHandle {
  Point: gp_Pnt;
  Tangent: gp_Vec;
  param: number;
  IsValid: boolean;
}

export type BoundingBoxResult = {
  XMin: number,
  YMin: number,
  ZMin: number,
  XMax: number,
  YMax: number,
  ZMax: number,
  IsValid: boolean
};

export interface PropertiesResult extends ClassHandle {
  Mass: number;
  CentreOfMass: gp_Pnt;
  IsValid: boolean;
}

export type UVBoundsResult = {
  UMin: number,
  UMax: number,
  VMin: number,
  VMax: number,
  IsValid: boolean
};

export type CurvePropertiesResult = {
  FirstParam: number,
  LastParam: number,
  IsClosed: boolean,
  IsPeriodic: boolean,
  Period: number,
  IsValid: boolean
};

export type DerivativesResult = {
  d1x: number,
  d1y: number,
  d1z: number,
  d2x: number,
  d2y: number,
  d2z: number,
  d3x: number,
  d3y: number,
  d3z: number,
  isValid: boolean
};

export interface Bnd_Box extends ClassHandle {
  SetVoid(): void;
  IsVoid(): boolean;
  Add(_0: gp_Pnt): void;
  AddBox(_0: Bnd_Box): void;
  IsOut(_0: gp_Pnt): boolean;
  IsOutBox(_0: Bnd_Box): boolean;
  Enlarge(_0: number): void;
  GetGap(): number;
  SetGap(_0: number): void;
  OpenXmin(): void;
  OpenXmax(): void;
  OpenYmin(): void;
  OpenYmax(): void;
  OpenZmin(): void;
  OpenZmax(): void;
  SquareExtent(): number;
  CornerMin(): gp_Pnt;
  CornerMax(): gp_Pnt;
}

export interface BRepTools_WireExplorer extends ClassHandle {
  Init(_0: TopoDS_Wire): void;
  InitWithFace(_0: TopoDS_Wire, _1: TopoDS_Face): void;
  More(): boolean;
  Next(): void;
  Current(): TopoDS_Edge;
  CurrentVertex(): TopoDS_Vertex;
  Clear(): void;
  Orientation(): TopAbs_Orientation;
}

export interface BRepAdaptor_Curve extends ClassHandle {
  Initialize(_0: TopoDS_Edge): void;
  FirstParameter(): number;
  LastParameter(): number;
  Value(_0: number): gp_Pnt;
  D0(_0: number, _1: gp_Pnt): void;
  D1(_0: number, _1: gp_Pnt, _2: gp_Vec): void;
  D2(_0: number, _1: gp_Pnt, _2: gp_Vec, _3: gp_Vec): void;
  D3(_0: number, _1: gp_Pnt, _2: gp_Vec, _3: gp_Vec, _4: gp_Vec): void;
  Line(): gp_Lin;
  Circle(): gp_Circ;
  Ellipse(): gp_Elips;
  Hyperbola(): gp_Hypr;
  Parabola(): gp_Parab;
  Degree(): number;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
  GetType(): GeomAbs_CurveType;
}

export interface BRepAdaptor_CompCurve extends ClassHandle {
  Initialize(_0: TopoDS_Wire, _1: boolean): void;
  FirstParameter(): number;
  LastParameter(): number;
  Value(_0: number): gp_Pnt;
  D0(_0: number, _1: gp_Pnt): void;
  D1(_0: number, _1: gp_Pnt, _2: gp_Vec): void;
  D2(_0: number, _1: gp_Pnt, _2: gp_Vec, _3: gp_Vec): void;
  D3(_0: number, _1: gp_Pnt, _2: gp_Vec, _3: gp_Vec, _4: gp_Vec): void;
  IsClosed(): boolean;
  IsPeriodic(): boolean;
  Period(): number;
  NbIntervals(_0: GeomAbs_Shape): number;
  GetType(): GeomAbs_CurveType;
}

export interface GCPnts_TangentialDeflection extends ClassHandle {
  NbPoints(): number;
  Parameter(_0: number): number;
  Value(_0: number): gp_Pnt;
}

export interface GCPnts_AbscissaPoint extends ClassHandle {
  IsDone(): boolean;
  Parameter(): number;
}

export interface ShapeFix_Shape extends ClassHandle {
  Init(_0: TopoDS_Shape): void;
  Perform(): boolean;
  Shape(): TopoDS_Shape;
  SetPrecision(_0: number): void;
  SetMinTolerance(_0: number): void;
  SetMaxTolerance(_0: number): void;
  FixSolidMode(): number;
  FixFreeShellMode(): number;
  FixFreeFaceMode(): number;
  FixFreeWireMode(): number;
  FixSameParameterMode(): number;
}

export interface ShapeFix_Wire extends ClassHandle {
  Init(_0: TopoDS_Wire, _1: TopoDS_Face, _2: number): void;
  Load(_0: TopoDS_Wire): void;
  Perform(): boolean;
  Wire(): TopoDS_Wire;
  WireAPIMake(): TopoDS_Wire;
  FixReorder(_0: boolean): boolean;
  FixConnected(_0: number): boolean;
  FixClosed(_0: number): boolean;
  FixDegenerated(): boolean;
  FixSmall(_0: boolean, _1: number): number;
}

export interface GccEnt_QualifiedCirc extends ClassHandle {
  Qualified(): gp_Circ2d;
  IsUnqualified(): boolean;
  IsEnclosing(): boolean;
  IsEnclosed(): boolean;
  IsOutside(): boolean;
  Qualifier(): GccEnt_Position;
}

export interface GccEnt_QualifiedLin extends ClassHandle {
  Qualified(): gp_Lin2d;
  IsUnqualified(): boolean;
  IsEnclosed(): boolean;
  IsOutside(): boolean;
  Qualifier(): GccEnt_Position;
}

export interface GccAna_Lin2d2Tan extends ClassHandle {
  IsDone(): boolean;
  NbSolutions(): number;
  ThisSolution(_0: number): gp_Lin2d;
}

export interface GccAna_Circ2d2TanRad extends ClassHandle {
  IsDone(): boolean;
  NbSolutions(): number;
  ThisSolution(_0: number): gp_Circ2d;
}

export interface BRepFill_Filling extends ClassHandle {
}

export interface BRepClass_FaceClassifier extends ClassHandle {
  State(): TopAbs_State;
}

export interface gp_Mat extends ClassHandle {
  Value(_0: number, _1: number): number;
  SetValue(_0: number, _1: number, _2: number): void;
  SetRow(_0: number, _1: gp_XYZ): void;
  SetCol(_0: number, _1: gp_XYZ): void;
  Row(_0: number): gp_XYZ;
  Column(_0: number): gp_XYZ;
  Determinant(): number;
  Invert(): void;
  Inverted(): gp_Mat;
  Multiply(_0: gp_Mat): void;
  Multiplied(_0: gp_Mat): gp_Mat;
  Transpose(): void;
  Transposed(): gp_Mat;
}

export interface IFSelect_ReturnStatusValue<T extends number> {
  value: T;
}
export type IFSelect_ReturnStatus = IFSelect_ReturnStatusValue<number>|IFSelect_ReturnStatusValue<number>|IFSelect_ReturnStatusValue<number>|IFSelect_ReturnStatusValue<number>|IFSelect_ReturnStatusValue<number>;

export interface BRepBuilderAPI_WireErrorValue<T extends number> {
  value: T;
}
export type BRepBuilderAPI_WireError = BRepBuilderAPI_WireErrorValue<number>|BRepBuilderAPI_WireErrorValue<number>|BRepBuilderAPI_WireErrorValue<number>|BRepBuilderAPI_WireErrorValue<number>;

export interface BRepBuilderAPI_FaceErrorValue<T extends number> {
  value: T;
}
export type BRepBuilderAPI_FaceError = BRepBuilderAPI_FaceErrorValue<number>|BRepBuilderAPI_FaceErrorValue<number>|BRepBuilderAPI_FaceErrorValue<number>|BRepBuilderAPI_FaceErrorValue<number>|BRepBuilderAPI_FaceErrorValue<number>;

export interface BRepBuilderAPI_EdgeErrorValue<T extends number> {
  value: T;
}
export type BRepBuilderAPI_EdgeError = BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>|BRepBuilderAPI_EdgeErrorValue<number>;

export interface TopAbs_StateValue<T extends number> {
  value: T;
}
export type TopAbs_State = TopAbs_StateValue<number>|TopAbs_StateValue<number>|TopAbs_StateValue<number>|TopAbs_StateValue<number>;

export interface GeomAbs_ShapeValue<T extends number> {
  value: T;
}
export type GeomAbs_Shape = GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>|GeomAbs_ShapeValue<number>;

export interface GeomAbs_JoinTypeValue<T extends number> {
  value: T;
}
export type GeomAbs_JoinType = GeomAbs_JoinTypeValue<number>|GeomAbs_JoinTypeValue<number>|GeomAbs_JoinTypeValue<number>;

export interface BRepFill_TypeOfContactValue<T extends number> {
  value: T;
}
export type BRepFill_TypeOfContact = BRepFill_TypeOfContactValue<number>|BRepFill_TypeOfContactValue<number>|BRepFill_TypeOfContactValue<number>;

export interface GeomAbs_CurveTypeValue<T extends number> {
  value: T;
}
export type GeomAbs_CurveType = GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>|GeomAbs_CurveTypeValue<number>;

export interface GeomAbs_SurfaceTypeValue<T extends number> {
  value: T;
}
export type GeomAbs_SurfaceType = GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>|GeomAbs_SurfaceTypeValue<number>;

export interface GeomFill_TrihedronValue<T extends number> {
  value: T;
}
export type GeomFill_Trihedron = GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>|GeomFill_TrihedronValue<number>;

export interface GccEnt_PositionValue<T extends number> {
  value: T;
}
export type GccEnt_Position = GccEnt_PositionValue<number>|GccEnt_PositionValue<number>|GccEnt_PositionValue<number>|GccEnt_PositionValue<number>|GccEnt_PositionValue<number>;

export interface ChFi3d_FilletShapeValue<T extends number> {
  value: T;
}
export type ChFi3d_FilletShape = ChFi3d_FilletShapeValue<number>|ChFi3d_FilletShapeValue<number>|ChFi3d_FilletShapeValue<number>;

export interface BRepOffset_ModeValue<T extends number> {
  value: T;
}
export type BRepOffset_Mode = BRepOffset_ModeValue<number>|BRepOffset_ModeValue<number>|BRepOffset_ModeValue<number>;

export interface Approx_ParametrizationTypeValue<T extends number> {
  value: T;
}
export type Approx_ParametrizationType = Approx_ParametrizationTypeValue<number>|Approx_ParametrizationTypeValue<number>|Approx_ParametrizationTypeValue<number>;

export interface Quantity_TypeOfColorValue<T extends number> {
  value: T;
}
export type Quantity_TypeOfColor = Quantity_TypeOfColorValue<number>|Quantity_TypeOfColorValue<number>|Quantity_TypeOfColorValue<number>|Quantity_TypeOfColorValue<number>|Quantity_TypeOfColorValue<number>;

export interface XCAFDoc_ColorTypeValue<T extends number> {
  value: T;
}
export type XCAFDoc_ColorType = XCAFDoc_ColorTypeValue<number>|XCAFDoc_ColorTypeValue<number>|XCAFDoc_ColorTypeValue<number>;

export interface TopAbs_ShapeEnumValue<T extends number> {
  value: T;
}
export type TopAbs_ShapeEnum = TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>|TopAbs_ShapeEnumValue<number>;

export interface TopAbs_OrientationValue<T extends number> {
  value: T;
}
export type TopAbs_Orientation = TopAbs_OrientationValue<number>|TopAbs_OrientationValue<number>|TopAbs_OrientationValue<number>|TopAbs_OrientationValue<number>;

export interface TDF_Label extends ClassHandle {
  IsNull(): boolean;
  IsRoot(): boolean;
  Tag(): number;
  Father(): TDF_Label;
}

export interface TDF_LabelSequence extends ClassHandle {
  Length(): number;
  Value(_0: number): TDF_Label;
}

export interface Standard_GUID extends ClassHandle {
}

export interface Quantity_Color extends ClassHandle {
  Red(): number;
  Green(): number;
  Blue(): number;
  Hue(): number;
  Light(): number;
  Saturation(): number;
}

export interface Quantity_ColorRGBA extends ClassHandle {
  GetRGB(): Quantity_Color;
  Alpha(): number;
  SetAlpha(_0: number): void;
}

export interface TCollection_ExtendedString extends ClassHandle {
  Length(): number;
  IsEmpty(): boolean;
  IsAscii(): boolean;
}

export interface TCollection_AsciiString extends ClassHandle {
  ToCString(): string;
  Length(): number;
  IsEmpty(): boolean;
}

export interface TDF_Attribute extends ClassHandle {
}

export interface Handle_TDF_Attribute extends ClassHandle {
  IsNull(): boolean;
  get(): TDF_Attribute | null;
  delete(): void;
}

export interface Handle_TDocStd_Document extends ClassHandle {
  IsNull(): boolean;
  delete(): void;
  Main(): TDF_Label;
  get(): TDocStd_Document | null;
}

export interface TDocStd_Document extends ClassHandle {
  Main(): TDF_Label;
}

export interface TDataStd_Name extends ClassHandle {
}

export interface TDataStd_Real extends ClassHandle {
  Get(): number;
  ID(): Standard_GUID;
}

export interface TDataStd_Integer extends ClassHandle {
  Get(): number;
  ID(): Standard_GUID;
}

export interface Handle_XCAFDoc_ShapeTool extends ClassHandle {
  IsNull(): boolean;
  delete(): void;
  get(): XCAFDoc_ShapeTool | null;
}

export interface Handle_XCAFDoc_ColorTool extends ClassHandle {
  IsNull(): boolean;
  delete(): void;
  get(): XCAFDoc_ColorTool | null;
}

export interface Handle_XCAFDoc_MaterialTool extends ClassHandle {
  IsNull(): boolean;
  delete(): void;
  get(): XCAFDoc_MaterialTool | null;
}

export interface XCAFDoc_ShapeTool extends ClassHandle {
  GetFreeShapes(_0: TDF_LabelSequence): void;
  GetShapes(_0: TDF_LabelSequence): void;
  IsTopLevel(_0: TDF_Label): boolean;
  FindShape(_0: TopoDS_Shape, _1: boolean): TDF_Label;
}

export interface XCAFDoc_ColorTool extends ClassHandle {
  IsColor(_0: TDF_Label): boolean;
  GetColors(_0: TDF_LabelSequence): void;
  GetColor_1(_0: TDF_Label, _1: Quantity_Color): boolean;
  GetColor_2(_0: TDF_Label, _1: Quantity_ColorRGBA): boolean;
  GetColor_7(_0: TopoDS_Shape, _1: XCAFDoc_ColorType, _2: Quantity_Color): boolean;
  GetColor_8(_0: TopoDS_Shape, _1: XCAFDoc_ColorType, _2: Quantity_ColorRGBA): boolean;
}

export interface XCAFDoc_MaterialTool extends ClassHandle {
}

export type FaceTriangulationInfo = {
  faceIndex: number,
  triangleStartIndex: number,
  triangleCount: number,
  nodeStartIndex: number,
  nodeCount: number
};

export interface VectorFaceTriangulationInfo extends ClassHandle {
  push_back(_0: FaceTriangulationInfo): void;
  resize(_0: number, _1: FaceTriangulationInfo): void;
  size(): number;
  get(_0: number): FaceTriangulationInfo | undefined;
  set(_0: number, _1: FaceTriangulationInfo): boolean;
}

export type SubShapeInfo = {
  index: number,
  labelTag: number,
  shapeType: EmbindString,
  hasColor: boolean,
  colorR: number,
  colorG: number,
  colorB: number,
  colorA: number
};

export interface VectorSubShapeInfo extends ClassHandle {
  push_back(_0: SubShapeInfo): void;
  resize(_0: number, _1: SubShapeInfo): void;
  size(): number;
  get(_0: number): SubShapeInfo | undefined;
  set(_0: number, _1: SubShapeInfo): boolean;
}

export type PartDefinitionInfo = {
  labelTag: number,
  name: EmbindString,
  isAssembly: boolean,
  isReference: boolean,
  isSimpleShape: boolean,
  isCompound: boolean,
  nbComponents: number
};

interface EmbindModule {
  gp_XYZ: {
    new(): gp_XYZ;
    new(_0: number, _1: number, _2: number): gp_XYZ;
  };
  gp_Pnt: {
    new(): gp_Pnt;
    new(_0: gp_XYZ): gp_Pnt;
    new(_0: number, _1: number, _2: number): gp_Pnt;
  };
  gp_Pnt_fromXYZ(_0: gp_XYZ): gp_Pnt;
  gp_Vec: {
    new(): gp_Vec;
    new(_0: gp_XYZ): gp_Vec;
    new(_0: gp_Pnt, _1: gp_Pnt): gp_Vec;
    new(_0: number, _1: number, _2: number): gp_Vec;
  };
  gp_Vec_fromXYZ(_0: gp_XYZ): gp_Vec;
  gp_Vec_fromPoints(_0: gp_Pnt, _1: gp_Pnt): gp_Vec;
  gp_Dir: {
    new(): gp_Dir;
    new(_0: gp_XYZ): gp_Dir;
    new(_0: number, _1: number, _2: number): gp_Dir;
  };
  gp_Dir_fromVec(_0: gp_Vec): gp_Dir;
  gp_Ax1: {
    new(): gp_Ax1;
    new(_0: gp_Pnt, _1: gp_Dir): gp_Ax1;
  };
  gp_Ax2: {
    new(): gp_Ax2;
    new(_0: gp_Pnt, _1: gp_Dir): gp_Ax2;
    new(_0: gp_Pnt, _1: gp_Dir, _2: gp_Dir): gp_Ax2;
  };
  gp_Ax3: {
    new(): gp_Ax3;
    new(_0: gp_Ax2): gp_Ax3;
    new(_0: gp_Pnt, _1: gp_Dir): gp_Ax3;
    new(_0: gp_Pnt, _1: gp_Dir, _2: gp_Dir): gp_Ax3;
  };
  gp_Trsf: {
    new(): gp_Trsf;
  };
  gp_Pln: {
    new(): gp_Pln;
    new(_0: gp_Ax3): gp_Pln;
    new(_0: gp_Pnt, _1: gp_Dir): gp_Pln;
    new(_0: number, _1: number, _2: number, _3: number): gp_Pln;
  };
  gp_Lin: {
    new(): gp_Lin;
    new(_0: gp_Ax1): gp_Lin;
    new(_0: gp_Pnt, _1: gp_Dir): gp_Lin;
  };
  gp_Circ: {
    new(): gp_Circ;
    new(_0: gp_Ax2, _1: number): gp_Circ;
  };
  gp_XY: {
    new(): gp_XY;
    new(_0: number, _1: number): gp_XY;
  };
  gp_Pnt2d: {
    new(): gp_Pnt2d;
    new(_0: gp_XY): gp_Pnt2d;
    new(_0: number, _1: number): gp_Pnt2d;
  };
  gp_Vec2d: {
    new(): gp_Vec2d;
    new(_0: gp_XY): gp_Vec2d;
    new(_0: number, _1: number): gp_Vec2d;
  };
  gp_Dir2d: {
    new(): gp_Dir2d;
    new(_0: gp_Vec2d): gp_Dir2d;
    new(_0: number, _1: number): gp_Dir2d;
  };
  gp_Ax2d: {
    new(): gp_Ax2d;
    new(_0: gp_Pnt2d, _1: gp_Dir2d): gp_Ax2d;
  };
  gp_Ax22d: {
    new(): gp_Ax22d;
    new(_0: gp_Pnt2d, _1: gp_Dir2d, _2: gp_Dir2d): gp_Ax22d;
  };
  gp_Lin2d: {
    new(): gp_Lin2d;
    new(_0: gp_Ax2d): gp_Lin2d;
    new(_0: gp_Pnt2d, _1: gp_Dir2d): gp_Lin2d;
  };
  gp_Circ2d: {
    new(): gp_Circ2d;
    new(_0: gp_Ax2d, _1: number): gp_Circ2d;
  };
  gp_Elips2d: {
    new(): gp_Elips2d;
    new(_0: gp_Ax2d, _1: number, _2: number): gp_Elips2d;
  };
  gp_Trsf2d: {
    new(): gp_Trsf2d;
  };
  gp_Elips: {
    new(): gp_Elips;
    new(_0: gp_Ax2, _1: number, _2: number): gp_Elips;
  };
  gp_Hypr: {
    new(): gp_Hypr;
    new(_0: gp_Ax2, _1: number, _2: number): gp_Hypr;
  };
  gp_Parab: {
    new(): gp_Parab;
    new(_0: gp_Ax2, _1: number): gp_Parab;
  };
  gp_GTrsf: {
    new(): gp_GTrsf;
    new(_0: gp_Trsf): gp_GTrsf;
  };
  Geom_Surface: {};
  GeomLib_NormEstim(_0: Geom_Surface | null, _1: gp_Pnt2d, _2: number): gp_Dir;
  Geom_Surface_Value(_0: Geom_Surface | null, _1: number, _2: number): gp_Pnt;
  Geom_CylindricalSurface: {
    new(_0: gp_Ax3, _1: number): Geom_CylindricalSurface;
  };
  Geom_Curve: {};
  Geom2d_Curve: {};
  Geom2d_Circle: {};
  Geom2d_Ellipse: {};
  Geom2d_TrimmedCurve: {};
  Handle_Geom_Surface: {
    new(): Handle_Geom_Surface;
  };
  Handle_Geom_Curve: {
    new(): Handle_Geom_Curve;
  };
  Handle_Geom2d_Curve: {
    new(): Handle_Geom2d_Curve;
  };
  GeomAPI_To2d(_0: Handle_Geom_Curve, _1: gp_Pln): Handle_Geom2d_Curve;
  TopoDS_Shape: {
    new(): TopoDS_Shape;
  };
  TopoDS_Vertex: {
    new(): TopoDS_Vertex;
  };
  TopoDS_Edge: {
    new(): TopoDS_Edge;
  };
  IsEdgeCircular(_0: TopoDS_Edge): boolean;
  IsEdgeLinear(_0: TopoDS_Edge): boolean;
  MakeEdgeFromGeom2dCurveAndSurfaceBounded(_0: Handle_Geom2d_Curve, _1: Geom_Surface | null, _2: number, _3: number): TopoDS_Edge;
  MakeEdgeFromGeom2dCurveAndSurface(_0: Handle_Geom2d_Curve, _1: Geom_Surface | null): TopoDS_Edge;
  GetEdgeCurve(_0: TopoDS_Edge): Handle_Geom_Curve;
  GetEdgeLength(_0: TopoDS_Edge): number;
  RebuildEdgeDegree(_0: TopoDS_Edge, _1: number, _2: number): TopoDS_Edge;
  MoveSeamByParameter(_0: TopoDS_Edge, _1: number): TopoDS_Edge;
  MoveSeamByLength(_0: TopoDS_Edge, _1: number): TopoDS_Edge;
  EdgeDebugInfoJson(_0: TopoDS_Edge): string;
  TopoDS_Wire: {
    new(): TopoDS_Wire;
  };
  TopoDS_Face: {
    new(): TopoDS_Face;
  };
  BRep_Tool_Surface(_0: TopoDS_Face): Handle_Geom_Surface;
  MakeFaceFromSurface(_0: Geom_Surface | null, _1: number): TopoDS_Face;
  MakeFaceFromSurfaceAndWire(_0: Geom_Surface | null, _1: TopoDS_Wire, _2: boolean): TopoDS_Face;
  RebuildFaceDegree(_0: TopoDS_Face, _1: number, _2: number, _3: number, _4: boolean): TopoDS_Face;
  FlipFaceUV(_0: TopoDS_Face, _1: boolean, _2: boolean, _3: boolean): TopoDS_Face;
  NormalizeFaceParametrization(_0: TopoDS_Face, _1: boolean, _2: boolean, _3: number, _4: number): TopoDS_Face;
  FaceDebugInfoJson(_0: TopoDS_Face): string;
  TopoDS_Shell: {
    new(): TopoDS_Shell;
  };
  TopoDS_Solid: {
    new(): TopoDS_Solid;
  };
  TopoDS_Compound: {
    new(): TopoDS_Compound;
  };
  TopoDS_CompSolid: {
    new(): TopoDS_CompSolid;
  };
  CastToVertex(_0: TopoDS_Shape): TopoDS_Vertex;
  CastToEdge(_0: TopoDS_Shape): TopoDS_Edge;
  CastToWire(_0: TopoDS_Shape): TopoDS_Wire;
  CastToFace(_0: TopoDS_Shape): TopoDS_Face;
  CastToShell(_0: TopoDS_Shape): TopoDS_Shell;
  CastToSolid(_0: TopoDS_Shape): TopoDS_Solid;
  CastToCompSolid(_0: TopoDS_Shape): TopoDS_CompSolid;
  CastToCompound(_0: TopoDS_Shape): TopoDS_Compound;
  TopExp_Explorer: {
    new(): TopExp_Explorer;
    new(_0: TopoDS_Shape, _1: TopAbs_ShapeEnum): TopExp_Explorer;
    new(_0: TopoDS_Shape, _1: TopAbs_ShapeEnum, _2: TopAbs_ShapeEnum): TopExp_Explorer;
  };
  TopLoc_Location: {
    new(): TopLoc_Location;
    new(_0: gp_Trsf): TopLoc_Location;
  };
  TopoDS_Iterator: {
    new(): TopoDS_Iterator;
    new(_0: TopoDS_Shape): TopoDS_Iterator;
    new(_0: TopoDS_Shape, _1: boolean): TopoDS_Iterator;
    new(_0: TopoDS_Shape, _1: boolean, _2: boolean): TopoDS_Iterator;
  };
  BRepPrimAPI_MakeBox: {
    new(_0: number, _1: number, _2: number): BRepPrimAPI_MakeBox;
    new(_0: gp_Pnt, _1: gp_Pnt): BRepPrimAPI_MakeBox;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number): BRepPrimAPI_MakeBox;
  };
  BRepPrimAPI_MakeCylinder: {
    new(_0: number, _1: number): BRepPrimAPI_MakeCylinder;
    new(_0: gp_Ax2, _1: number, _2: number): BRepPrimAPI_MakeCylinder;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number): BRepPrimAPI_MakeCylinder;
  };
  BRepPrimAPI_MakeSphere: {
    new(_0: number): BRepPrimAPI_MakeSphere;
    new(_0: gp_Pnt, _1: number): BRepPrimAPI_MakeSphere;
  };
  BRepPrimAPI_MakeCone: {
    new(_0: number, _1: number, _2: number): BRepPrimAPI_MakeCone;
    new(_0: number, _1: number, _2: number, _3: number): BRepPrimAPI_MakeCone;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number, _4: number): BRepPrimAPI_MakeCone;
  };
  BRepPrimAPI_MakeTorus: {
    new(_0: number, _1: number): BRepPrimAPI_MakeTorus;
    new(_0: gp_Ax2, _1: number, _2: number): BRepPrimAPI_MakeTorus;
    new(_0: number, _1: number, _2: number, _3: number): BRepPrimAPI_MakeTorus;
    new(_0: number, _1: number, _2: number, _3: number, _4: number): BRepPrimAPI_MakeTorus;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number, _4: number, _5: number): BRepPrimAPI_MakeTorus;
  };
  BRepPrimAPI_MakeWedge: {
    new(_0: number, _1: number, _2: number, _3: number): BRepPrimAPI_MakeWedge;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number, _4: number): BRepPrimAPI_MakeWedge;
    new(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): BRepPrimAPI_MakeWedge;
    new(_0: gp_Ax2, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number): BRepPrimAPI_MakeWedge;
  };
  BRepPrimAPI_MakePrism: {
    new(_0: TopoDS_Shape, _1: gp_Vec): BRepPrimAPI_MakePrism;
    new(_0: TopoDS_Shape, _1: gp_Vec, _2: boolean): BRepPrimAPI_MakePrism;
    new(_0: TopoDS_Shape, _1: gp_Vec, _2: boolean, _3: boolean): BRepPrimAPI_MakePrism;
  };
  BRepPrimAPI_MakeRevol: {
    new(_0: TopoDS_Shape, _1: gp_Ax1): BRepPrimAPI_MakeRevol;
    new(_0: TopoDS_Shape, _1: gp_Ax1, _2: number): BRepPrimAPI_MakeRevol;
    new(_0: TopoDS_Shape, _1: gp_Ax1, _2: number, _3: boolean): BRepPrimAPI_MakeRevol;
  };
  MakeBoxFromPntAndDims(_0: gp_Pnt, _1: number, _2: number, _3: number): TopoDS_Shape;
  MakeSphereFromAx2(_0: gp_Ax2, _1: number): BRepPrimAPI_MakeSphere | null;
  MakeConeFromAx2(_0: gp_Ax2, _1: number, _2: number, _3: number): BRepPrimAPI_MakeCone | null;
  BRepAlgoAPI_Fuse: {
    new(): BRepAlgoAPI_Fuse;
    new(_0: TopoDS_Shape, _1: TopoDS_Shape): BRepAlgoAPI_Fuse;
  };
  BRepAlgoAPI_Cut: {
    new(): BRepAlgoAPI_Cut;
    new(_0: TopoDS_Shape, _1: TopoDS_Shape): BRepAlgoAPI_Cut;
  };
  BRepAlgoAPI_Common: {
    new(): BRepAlgoAPI_Common;
    new(_0: TopoDS_Shape, _1: TopoDS_Shape): BRepAlgoAPI_Common;
  };
  BRepAlgoAPI_Section: {
    new(): BRepAlgoAPI_Section;
    new(_0: TopoDS_Shape, _1: TopoDS_Shape): BRepAlgoAPI_Section;
  };
  BRepAlgoAPI_Splitter: {
    new(): BRepAlgoAPI_Splitter;
  };
  BRepBuilderAPI_MakeVertex: {
    new(_0: gp_Pnt): BRepBuilderAPI_MakeVertex;
  };
  BRepBuilderAPI_MakeEdge: {
    new(): BRepBuilderAPI_MakeEdge;
    new(_0: gp_Pnt, _1: gp_Pnt): BRepBuilderAPI_MakeEdge;
  };
  BRepBuilderAPI_MakeWire: {
    new(): BRepBuilderAPI_MakeWire;
    new(_0: TopoDS_Edge): BRepBuilderAPI_MakeWire;
    new(_0: TopoDS_Edge, _1: TopoDS_Edge): BRepBuilderAPI_MakeWire;
    new(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: TopoDS_Edge): BRepBuilderAPI_MakeWire;
  };
  BRepBuilderAPI_MakeFace: {
    new(): BRepBuilderAPI_MakeFace;
    new(_0: TopoDS_Wire): BRepBuilderAPI_MakeFace;
    new(_0: TopoDS_Face, _1: TopoDS_Wire): BRepBuilderAPI_MakeFace;
  };
  MakeFaceFromFaceSurfaceAndWire(_0: TopoDS_Face, _1: TopoDS_Wire, _2: boolean): TopoDS_Face;
  MakeFaceFromFaceSurface(_0: TopoDS_Face, _1: number): TopoDS_Face;
  MakeFaceFromWireOnlyPlane(_0: TopoDS_Wire, _1: boolean): TopoDS_Face;
  BRepBuilderAPI_MakePolygon: {
    new(): BRepBuilderAPI_MakePolygon;
    new(_0: gp_Pnt, _1: gp_Pnt): BRepBuilderAPI_MakePolygon;
    new(_0: gp_Pnt, _1: gp_Pnt, _2: gp_Pnt): BRepBuilderAPI_MakePolygon;
    new(_0: gp_Pnt, _1: gp_Pnt, _2: gp_Pnt, _3: gp_Pnt): BRepBuilderAPI_MakePolygon;
  };
  BRepBuilderAPI_Transform: {
    new(_0: gp_Trsf): BRepBuilderAPI_Transform;
    new(_0: TopoDS_Shape, _1: gp_Trsf): BRepBuilderAPI_Transform;
    new(_0: TopoDS_Shape, _1: gp_Trsf, _2: boolean): BRepBuilderAPI_Transform;
  };
  BRep_Builder: {
    new(): BRep_Builder;
  };
  BRepBuilderAPI_MakeShell: {
    new(): BRepBuilderAPI_MakeShell;
  };
  BRepBuilderAPI_MakeSolid: {
    new(): BRepBuilderAPI_MakeSolid;
    new(_0: TopoDS_Shell): BRepBuilderAPI_MakeSolid;
  };
  BRepBuilderAPI_Sewing: {
    new(): BRepBuilderAPI_Sewing;
    new(_0: number): BRepBuilderAPI_Sewing;
  };
  BRepBuilderAPI_Copy: {
    new(): BRepBuilderAPI_Copy;
    new(_0: TopoDS_Shape): BRepBuilderAPI_Copy;
  };
  BRepBuilderAPI_GTransform: {
    new(_0: gp_GTrsf): BRepBuilderAPI_GTransform;
    new(_0: TopoDS_Shape, _1: gp_GTrsf): BRepBuilderAPI_GTransform;
  };
  BRep_Builder_MakeCompound(_0: BRep_Builder): TopoDS_Compound;
  BRep_Builder_MakeWire(_0: BRep_Builder): TopoDS_Wire;
  BRep_Builder_MakeShell(_0: BRep_Builder): TopoDS_Shell;
  BRep_Builder_MakeSolid(_0: BRep_Builder): TopoDS_Solid;
  BRep_Builder_MakeCompSolid(_0: BRep_Builder): TopoDS_CompSolid;
  BRepFilletAPI_MakeFillet: {
    new(_0: TopoDS_Shape): BRepFilletAPI_MakeFillet;
    new(_0: TopoDS_Shape, _1: ChFi3d_FilletShape): BRepFilletAPI_MakeFillet;
  };
  BRepFilletAPI_MakeChamfer: {
    new(_0: TopoDS_Shape): BRepFilletAPI_MakeChamfer;
  };
  BRepFilletAPI_MakeFillet2d: {
    new(): BRepFilletAPI_MakeFillet2d;
    new(_0: TopoDS_Face): BRepFilletAPI_MakeFillet2d;
  };
  ChFi2d_FilletAlgo: {
    new(): ChFi2d_FilletAlgo;
    new(_0: TopoDS_Wire, _1: gp_Pln): ChFi2d_FilletAlgo;
    new(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: gp_Pln): ChFi2d_FilletAlgo;
  };
  BRepOffsetAPI_MakeOffset: {
    new(): BRepOffsetAPI_MakeOffset;
    new(_0: TopoDS_Face): BRepOffsetAPI_MakeOffset;
  };
  BRepOffsetAPI_ThruSections: {
    new(_0: boolean): BRepOffsetAPI_ThruSections;
    new(_0: boolean, _1: boolean, _2: number): BRepOffsetAPI_ThruSections;
  };
  BRepOffsetAPI_MakePipe: {
    new(_0: TopoDS_Wire, _1: TopoDS_Shape): BRepOffsetAPI_MakePipe;
    new(_0: TopoDS_Wire, _1: TopoDS_Shape, _2: GeomFill_Trihedron, _3: boolean): BRepOffsetAPI_MakePipe;
  };
  BRepOffsetAPI_MakePipeShell: {
    new(_0: TopoDS_Wire): BRepOffsetAPI_MakePipeShell;
  };
  BRepOffsetAPI_MakeOffsetShape: {
    new(): BRepOffsetAPI_MakeOffsetShape;
  };
  BRepOffsetAPI_MakeThickSolid: {
    new(): BRepOffsetAPI_MakeThickSolid;
  };
  BRepProj_Projection: {
    new(_0: TopoDS_Wire, _1: TopoDS_Shape, _2: gp_Dir): BRepProj_Projection;
  };
  BOPAlgo_Builder: {
    new(): BOPAlgo_Builder;
  };
  BRepOffsetAPI_DraftAngle: {
    new(): BRepOffsetAPI_DraftAngle;
    new(_0: TopoDS_Shape): BRepOffsetAPI_DraftAngle;
  };
  BRepOffsetAPI_MakeDraft: {
    new(_0: TopoDS_Shape, _1: gp_Dir, _2: number): BRepOffsetAPI_MakeDraft;
  };
  GProp_GProps: {
    new(): GProp_GProps;
    new(_0: gp_Pnt): GProp_GProps;
  };
  BRep_Tool_Pnt(_0: TopoDS_Vertex): gp_Pnt;
  BRep_Tool_Tolerance_Vertex(_0: TopoDS_Vertex): number;
  BRep_Tool_Tolerance_Edge(_0: TopoDS_Edge): number;
  BRep_Tool_Tolerance_Face(_0: TopoDS_Face): number;
  BRep_Tool_IsGeometric(_0: TopoDS_Edge): boolean;
  BRep_Tool_Degenerated(_0: TopoDS_Edge): boolean;
  BRepGProp_LinearProperties(_0: TopoDS_Shape, _1: GProp_GProps): void;
  BRepGProp_SurfaceProperties(_0: TopoDS_Shape, _1: GProp_GProps): void;
  BRepGProp_VolumeProperties(_0: TopoDS_Shape, _1: GProp_GProps): void;
  BRepBndLib: {
    Add(_0: TopoDS_Shape, _1: Bnd_Box, _2: boolean): void;
  };
  BRepTools: {
    Clean(_0: TopoDS_Shape): void;
    Write(_0: TopoDS_Shape, _1: EmbindString): boolean;
    Read(_0: TopoDS_Shape, _1: EmbindString, _2: BRep_Builder): boolean;
  };
  BRep_Tool: {
    Pnt(_0: TopoDS_Vertex): gp_Pnt;
    Tolerance_Vertex(_0: TopoDS_Vertex): number;
    Tolerance_Edge(_0: TopoDS_Edge): number;
    Tolerance_Face(_0: TopoDS_Face): number;
    Degenerated(_0: TopoDS_Edge): boolean;
    IsClosed(_0: TopoDS_Edge): boolean;
  };
  Poly_Triangle: {
    new(): Poly_Triangle;
    new(_0: number, _1: number, _2: number): Poly_Triangle;
  };
  Poly_Triangulation: {
    new(): Poly_Triangulation;
  };
  Poly_Connect: {
    new(): Poly_Connect;
    new(_0: Poly_Triangulation): Poly_Connect;
  };
  StdPrs_ToolTriangulatedShape: {
    Normal(_0: TopoDS_Face, _1: Poly_Connect, _2: TColgp_Array1OfDir): void;
  };
  BRepMesh_IncrementalMesh: {
    new(): BRepMesh_IncrementalMesh;
    new(_0: TopoDS_Shape, _1: number): BRepMesh_IncrementalMesh;
    new(_0: TopoDS_Shape, _1: number, _2: boolean): BRepMesh_IncrementalMesh;
    new(_0: TopoDS_Shape, _1: number, _2: boolean, _3: number): BRepMesh_IncrementalMesh;
    new(_0: TopoDS_Shape, _1: number, _2: boolean, _3: number, _4: boolean): BRepMesh_IncrementalMesh;
  };
  GetFaceTriangulation(_0: TopoDS_Face): Poly_Triangulation;
  GetFaceLocation(_0: TopoDS_Face): TopLoc_Location;
  ShapeToMeshJson(_0: TopoDS_Shape, _1: number, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: boolean): string;
  STEPControl_Reader: {
    new(): STEPControl_Reader;
  };
  STEPControl_Writer: {
    new(): STEPControl_Writer;
  };
  STEPControl_StepModelType: {AsIs: STEPControl_StepModelTypeValue<number>, ManifoldSolidBrep: STEPControl_StepModelTypeValue<number>, BrepWithVoids: STEPControl_StepModelTypeValue<number>, FacetedBrep: STEPControl_StepModelTypeValue<number>, FacetedBrepAndBrepWithVoids: STEPControl_StepModelTypeValue<number>, ShellBasedSurfaceModel: STEPControl_StepModelTypeValue<number>, GeometricCurveSet: STEPControl_StepModelTypeValue<number>, Hybrid: STEPControl_StepModelTypeValue<number>};
  IGESControl_Reader: {
    new(): IGESControl_Reader;
  };
  IGESControl_Writer: {
    new(): IGESControl_Writer;
  };
  StlAPI_Writer: {
    new(): StlAPI_Writer;
  };
  MakeEdge_fromLine(_0: gp_Lin): TopoDS_Edge;
  MakeEdge_fromLineParams(_0: gp_Lin, _1: number, _2: number): TopoDS_Edge;
  MakeEdge_fromCircle(_0: gp_Circ): TopoDS_Edge;
  MakeEdge_fromCircleParams(_0: gp_Circ, _1: number, _2: number): TopoDS_Edge;
  TopTools_ListOfShape: {
    new(): TopTools_ListOfShape;
  };
  TColgp_Array1OfPnt2d: {
    new(_0: number, _1: number): TColgp_Array1OfPnt2d;
  };
  TColgp_Array1OfDir: {
    new(_0: number, _1: number): TColgp_Array1OfDir;
  };
  VectorDouble: {
    new(): VectorDouble;
  };
  MakeBSplineEdgeFromPoles(_0: VectorDouble, _1: number): TopoDS_Edge;
  MakeBSplineEdgeFromPolesPeriodic(_0: VectorDouble, _1: number): TopoDS_Edge;
  MakeWeightedBSplineEdgeFromPolesPeriodic(_0: VectorDouble, _1: VectorDouble, _2: number): TopoDS_Edge;
  MakeSymmetricInterpolatedBSplineEdge(_0: VectorDouble, _1: number): TopoDS_Edge;
  VectorInt: {
    new(): VectorInt;
  };
  MakeInterpolatedBSplineEdge(_0: VectorDouble, _1: boolean, _2: number, _3: number, _4: VectorDouble, _5: VectorInt): TopoDS_Edge;
  gp_Pnt_GetCoord(_0: gp_Pnt): CoordResult;
  gp_Vec_GetCoord(_0: gp_Vec): CoordResult;
  gp_Dir_GetCoord(_0: gp_Dir): CoordResult;
  gp_XYZ_GetCoord(_0: gp_XYZ): CoordResult;
  BRep_Tool_GetEdgeParameters(_0: TopoDS_Edge): EdgeCurveResult;
  CurvePointResult: {
    new(): CurvePointResult;
  };
  EvaluateEdgeCurve(_0: TopoDS_Edge, _1: number): CurvePointResult;
  GetBoundingBox(_0: TopoDS_Shape): BoundingBoxResult;
  PropertiesResult: {
    new(): PropertiesResult;
  };
  ComputeVolumeProperties(_0: TopoDS_Shape): PropertiesResult;
  ComputeSurfaceProperties(_0: TopoDS_Shape): PropertiesResult;
  ComputeLinearProperties(_0: TopoDS_Shape): PropertiesResult;
  GetEdgeCurveProperties(_0: TopoDS_Edge): CurvePropertiesResult;
  GetWireLength(_0: TopoDS_Wire): number;
  EvaluateWireAtParam(_0: TopoDS_Wire, _1: number): CurvePointResult;
  EvaluateWireAtActualParam(_0: TopoDS_Wire, _1: number): CurvePointResult;
  GetPointAtLengthOnWire(_0: TopoDS_Wire, _1: number): gp_Pnt;
  GetPointAtLengthOnEdge(_0: TopoDS_Edge, _1: number): gp_Pnt;
  GetWireParameterBounds(_0: TopoDS_Wire): UVBoundsResult;
  GetTransformationValue(_0: gp_Trsf, _1: number, _2: number): number;
  ComputeShapeBoundingBox(_0: TopoDS_Shape): BoundingBoxResult;
  BRepTools_Clean(_0: TopoDS_Shape): void;
  BRepTools_Clean_Force(_0: TopoDS_Shape, _1: boolean): void;
  BRepTools_CleanGeometry(_0: TopoDS_Shape): void;
  BRep_Tool_IsClosed(_0: TopoDS_Shape): boolean;
  GetDerivativesOnWireAtLength(_0: TopoDS_Wire, _1: number): DerivativesResult;
  GetDerivativesOnWireAtParam(_0: TopoDS_Wire, _1: number): DerivativesResult;
  GetDerivativesOnEdgeAtParam(_0: TopoDS_Edge, _1: number): DerivativesResult;
  MakeEdgeFromCurve(_0: Handle_Geom_Curve): TopoDS_Edge;
  MakeEdgeFromCurveWithBounds(_0: Handle_Geom_Curve, _1: number, _2: number): TopoDS_Edge;
  MakeEdgeFromTrimmedCurve(_0: Handle_Geom_Curve): TopoDS_Edge;
  TrimEdgeToParams(_0: TopoDS_Edge, _1: number, _2: number): TopoDS_Edge;
  BRep_Tool_GetUVAtVertex(_0: TopoDS_Vertex, _1: TopoDS_Face): UVResult;
  ShapeFix_Shape_Perform(_0: TopoDS_Shape): TopoDS_Shape;
  ShapeUpgrade_UnifySameDomain_Perform(_0: TopoDS_Shape, _1: boolean, _2: boolean, _3: boolean): TopoDS_Shape;
  BRepBuilderAPI_Sewing_Perform(_0: TopoDS_Shape, _1: number): TopoDS_Shape;
  BRepBuilderAPI_Copy_Shape(_0: TopoDS_Shape, _1: boolean): TopoDS_Shape;
  ReadSTEPFromString(_0: EmbindString): TopoDS_Shape;
  WriteSTEPToString(_0: TopoDS_Shape): string;
  ReadIGESFromString(_0: EmbindString): TopoDS_Shape;
  WriteIGESToString(_0: TopoDS_Shape): string;
  ReadBREPFromString(_0: EmbindString): TopoDS_Shape;
  WriteBREPToString(_0: TopoDS_Shape): string;
  MakeBSplineEdge(_0: VectorDouble): TopoDS_Edge;
  MakePeriodicBSplineEdge(_0: VectorDouble): TopoDS_Edge;
  MakeSymmetricPeriodicBSplineEdge(_0: VectorDouble): TopoDS_Edge;
  MakeBSplineEdgeWithTangents(_0: VectorDouble, _1: VectorDouble, _2: VectorDouble): TopoDS_Edge;
  MakeApproxBSplineEdge(_0: VectorDouble, _1: number, _2: number, _3: number): TopoDS_Edge;
  MakePeriodicBSplineWire(_0: VectorDouble): TopoDS_Wire;
  MakeSymmetricPeriodicBSplineWire(_0: VectorDouble): TopoDS_Wire;
  MakeClosedBSplineWire(_0: VectorDouble): TopoDS_Wire;
  MakeBezierEdge(_0: VectorDouble): TopoDS_Edge;
  MakeBezierWire(_0: VectorDouble): TopoDS_Wire;
  MakeWeightedBezierWire(_0: VectorDouble, _1: VectorDouble): TopoDS_Wire;
  MakeFillet2d(_0: TopoDS_Wire, _1: number): TopoDS_Wire;
  MakeArcThrough3Points(_0: gp_Pnt, _1: gp_Pnt, _2: gp_Pnt): TopoDS_Edge;
  MakeArcWithTangent(_0: gp_Pnt, _1: gp_Vec, _2: gp_Pnt): TopoDS_Edge;
  MakeArcOnCircle(_0: gp_Circ, _1: gp_Pnt, _2: gp_Pnt, _3: boolean): TopoDS_Edge;
  MakeArcOnCircleByAngle(_0: gp_Circ, _1: gp_Pnt, _2: number, _3: boolean): TopoDS_Edge;
  MakeArcOnCircleByAngles(_0: gp_Circ, _1: number, _2: number, _3: boolean): TopoDS_Edge;
  MakeCircleThrough3Points(_0: gp_Pnt, _1: gp_Pnt, _2: gp_Pnt): TopoDS_Edge;
  MakeCircleEdge(_0: gp_Ax2, _1: number): TopoDS_Edge;
  MakeCircleWire(_0: gp_Ax2, _1: number): TopoDS_Wire;
  MakeEllipseEdge(_0: gp_Ax2, _1: number, _2: number): TopoDS_Edge;
  MakeEllipseWire(_0: gp_Ax2, _1: number, _2: number): TopoDS_Wire;
  MakeLineEdge(_0: gp_Pnt, _1: gp_Dir, _2: number): TopoDS_Edge;
  MakeLineEdgeBetweenPoints(_0: gp_Pnt, _1: gp_Pnt): TopoDS_Edge;
  MakeTangentToCircle(_0: gp_Circ, _1: number, _2: number): TopoDS_Edge;
  MakeG1ContinuousEdge(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: boolean, _3: boolean): TopoDS_Edge;
  MakeBlendEdge(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: number): TopoDS_Edge;
  MakeArc2dThrough3Points(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): TopoDS_Edge;
  MakeArc2dWithTangent(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number): TopoDS_Edge;
  ClosestPointsBetweenShapes(_0: TopoDS_Shape, _1: TopoDS_Shape): VectorDouble;
  MakeHelixWire(_0: gp_Ax3, _1: number, _2: number, _3: number, _4: boolean, _5: number): TopoDS_Wire;
  MakeHelixWireByTurns(_0: gp_Ax3, _1: number, _2: number, _3: number, _4: boolean, _5: number): TopoDS_Wire;
  MakeTaperedHelixWire(_0: gp_Ax3, _1: number, _2: number, _3: number, _4: number, _5: boolean, _6: number): TopoDS_Wire;
  MakeFlatSpiralWire(_0: gp_Ax3, _1: number, _2: number, _3: number, _4: boolean, _5: number): TopoDS_Wire;
  MakeSimpleHelixWire(_0: number, _1: number, _2: number, _3: boolean): TopoDS_Wire;
  MakeSimpleSpiralWire(_0: number, _1: number, _2: number, _3: boolean): TopoDS_Wire;
  SubdivideEdgeToPoints(_0: TopoDS_Edge, _1: number): any;
  SubdivideEdgeByLength(_0: TopoDS_Edge, _1: number): any;
  SubdivideEdgeByDeflection(_0: TopoDS_Edge, _1: number): any;
  SubdivideEdgeTangential(_0: TopoDS_Edge, _1: number, _2: number): any;
  SubdivideWireToPoints(_0: TopoDS_Wire, _1: number): any;
  SubdivideFaceToPointsUV(_0: TopoDS_Face, _1: number, _2: number): any;
  SubdivideFaceToPointsWithUV(_0: TopoDS_Face, _1: number, _2: number): any;
  SubdivideEdgeToPointsWithParams(_0: TopoDS_Edge, _1: number): any;
  GetFaceUVBounds(_0: TopoDS_Face): UVBoundsResult;
  EvaluateFaceAtUV(_0: TopoDS_Face, _1: number, _2: number): gp_Pnt;
  EvaluateFaceAtNormalizedUV(_0: TopoDS_Face, _1: number, _2: number): gp_Pnt;
  EvaluateFaceAtVU(_0: TopoDS_Face, _1: number, _2: number): gp_Pnt;
  SubdivideFaceRemappedUV(_0: TopoDS_Face, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number): any;
  SubdivideFaceFlippedVU(_0: TopoDS_Face, _1: number, _2: number): any;
  RotatePeriodicEdgeSeam(_0: TopoDS_Edge, _1: number): TopoDS_Edge;
  ShiftPeriodicEdgeSeam(_0: TopoDS_Edge, _1: number): TopoDS_Edge;
  RotatePeriodicEdgeSeamToPoint(_0: TopoDS_Edge, _1: gp_Pnt): TopoDS_Edge;
  Bnd_Box: {
    new(): Bnd_Box;
  };
  GetBndBoxCornerMin(_0: Bnd_Box): gp_Pnt;
  GetBndBoxCornerMax(_0: Bnd_Box): gp_Pnt;
  BRepBndLib_AddToBox(_0: TopoDS_Shape, _1: Bnd_Box): void;
  BRepTools_WireExplorer: {
    new(): BRepTools_WireExplorer;
    new(_0: TopoDS_Wire): BRepTools_WireExplorer;
    new(_0: TopoDS_Wire, _1: TopoDS_Face): BRepTools_WireExplorer;
  };
  BRepAdaptor_Curve: {
    new(): BRepAdaptor_Curve;
    new(_0: TopoDS_Edge): BRepAdaptor_Curve;
  };
  MakeBRepAdaptorCurve(_0: TopoDS_Edge): BRepAdaptor_Curve;
  BRepAdaptor_CompCurve: {
    new(): BRepAdaptor_CompCurve;
    new(_0: TopoDS_Wire): BRepAdaptor_CompCurve;
    new(_0: TopoDS_Wire, _1: boolean): BRepAdaptor_CompCurve;
  };
  GCPnts_TangentialDeflection: {
    new(_0: BRepAdaptor_Curve, _1: number, _2: number, _3: number, _4: number, _5: number): GCPnts_TangentialDeflection;
  };
  GCPnts_AbscissaPoint: {
    new(_0: BRepAdaptor_Curve, _1: number, _2: number): GCPnts_AbscissaPoint;
  };
  GCPnts_AbscissaPoint_FromCompCurve(_0: BRepAdaptor_CompCurve, _1: number, _2: number): GCPnts_AbscissaPoint;
  GCPnts_AbscissaPoint_Length_Curve(_0: BRepAdaptor_Curve): number;
  GCPnts_AbscissaPoint_Length_CompCurve(_0: BRepAdaptor_CompCurve): number;
  ShapeFix_Shape: {
    new(): ShapeFix_Shape;
    new(_0: TopoDS_Shape): ShapeFix_Shape;
  };
  ShapeFix_Wire: {
    new(): ShapeFix_Wire;
    new(_0: TopoDS_Wire, _1: TopoDS_Face, _2: number): ShapeFix_Wire;
  };
  BRepLib_BuildCurves3d(_0: TopoDS_Shape): boolean;
  BRepLib_BuildCurves3d_WithTolerance(_0: TopoDS_Shape, _1: number): boolean;
  GccEnt_QualifiedCirc: {
    new(_0: gp_Circ2d, _1: GccEnt_Position): GccEnt_QualifiedCirc;
  };
  GccEnt_QualifiedLin: {
    new(_0: gp_Lin2d, _1: GccEnt_Position): GccEnt_QualifiedLin;
  };
  GccAna_Lin2d2Tan: {
    new(_0: gp_Pnt2d, _1: gp_Pnt2d, _2: number): GccAna_Lin2d2Tan;
  };
  GccAna_Lin2d2Tan_fromQualifiedCircAndPoint(_0: GccEnt_QualifiedCirc, _1: gp_Pnt2d, _2: number): GccAna_Lin2d2Tan;
  GccAna_Lin2d2Tan_fromTwoQualifiedCirc(_0: GccEnt_QualifiedCirc, _1: GccEnt_QualifiedCirc, _2: number): GccAna_Lin2d2Tan;
  GccAna_Circ2d2TanRad: {
    new(_0: gp_Pnt2d, _1: gp_Pnt2d, _2: number, _3: number): GccAna_Circ2d2TanRad;
  };
  GccAna_Circ2d2TanRad_fromTwoQualifiedCirc(_0: GccEnt_QualifiedCirc, _1: GccEnt_QualifiedCirc, _2: number, _3: number): GccAna_Circ2d2TanRad;
  GccAna_Circ2d2TanRad_fromQualifiedCircAndLin(_0: GccEnt_QualifiedCirc, _1: GccEnt_QualifiedLin, _2: number, _3: number): GccAna_Circ2d2TanRad;
  GccAna_Circ2d2TanRad_fromQualifiedCircAndPoint(_0: GccEnt_QualifiedCirc, _1: gp_Pnt2d, _2: number, _3: number): GccAna_Circ2d2TanRad;
  GccAna_Circ2d2TanRad_fromQualifiedLinAndPoint(_0: GccEnt_QualifiedLin, _1: gp_Pnt2d, _2: number, _3: number): GccAna_Circ2d2TanRad;
  GccAna_Circ2d2TanRad_fromTwoQualifiedLin(_0: GccEnt_QualifiedLin, _1: GccEnt_QualifiedLin, _2: number, _3: number): GccAna_Circ2d2TanRad;
  BRepLib_BuildCurves3d_Simple(_0: TopoDS_Shape): boolean;
  GCPnts_AbscissaPoint_Length(_0: BRepAdaptor_Curve): number;
  GCPnts_AbscissaPoint_LengthParams(_0: BRepAdaptor_Curve, _1: number, _2: number): number;
  TopoDS_Shape_HashCode(_0: TopoDS_Shape, _1: number): number;
  BRepFill_Filling: {
    new(): BRepFill_Filling;
    new(_0: number, _1: number, _2: number, _3: boolean, _4: number, _5: number, _6: number, _7: number, _8: number, _9: number): BRepFill_Filling;
  };
  BRepFill_Filling_AddEdge(_0: BRepFill_Filling, _1: TopoDS_Edge, _2: number, _3: boolean): number;
  BRepFill_Filling_AddPoint(_0: BRepFill_Filling, _1: gp_Pnt): number;
  BRepFill_Filling_Build(_0: BRepFill_Filling): void;
  BRepFill_Filling_IsDone(_0: BRepFill_Filling): boolean;
  BRepFill_Filling_Face(_0: BRepFill_Filling): TopoDS_Face;
  BRepClass_FaceClassifier: {
    new(): BRepClass_FaceClassifier;
    new(_0: TopoDS_Face, _1: gp_Pnt, _2: number): BRepClass_FaceClassifier;
  };
  gp_Mat: {
    new(): gp_Mat;
    new(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number): gp_Mat;
  };
  Bnd_Box_IsThin(_0: Bnd_Box, _1: number): boolean;
  ClassifyPointInSolid(_0: TopoDS_Shape, _1: gp_Pnt, _2: number): number;
  GCPnts_AbscissaPoint_CurveLength(_0: BRepAdaptor_Curve): number;
  GCPnts_AbscissaPoint_CurveLengthBetween(_0: BRepAdaptor_Curve, _1: number, _2: number): number;
  GCPnts_AbscissaPoint_CompCurveLength(_0: BRepAdaptor_CompCurve): number;
  GCPnts_AbscissaPoint_CompCurveLengthBetween(_0: BRepAdaptor_CompCurve, _1: number, _2: number): number;
  CreateGpMat(_0: number, _1: number, _2: number, _3: number, _4: number, _5: number, _6: number, _7: number, _8: number): gp_Mat;
  gp_Trsf_VectorialPart(_0: gp_Trsf): gp_Mat;
  gp_Trsf_HVectorialPart(_0: gp_Trsf): gp_Mat;
  ProjectWireOnShape(_0: TopoDS_Wire, _1: TopoDS_Shape, _2: gp_Dir): TopoDS_Compound;
  BRepOffsetAPI_MakePipeShell_SetModeWithContact(_0: BRepOffsetAPI_MakePipeShell, _1: boolean, _2: boolean): void;
  BRepAdaptor_Curve_DN(_0: BRepAdaptor_Curve, _1: number, _2: number): gp_Vec;
  BRepAdaptor_CompCurve_DN(_0: BRepAdaptor_CompCurve, _1: number, _2: number): gp_Vec;
  CreateGeom2d_Ellipse(_0: gp_Ax22d, _1: number, _2: number): Handle_Geom2d_Curve;
  CreateGeom2d_Circle(_0: gp_Ax22d, _1: number): Handle_Geom2d_Curve;
  CreateGeom2d_Segment(_0: gp_Pnt2d, _1: gp_Pnt2d): Handle_Geom2d_Curve;
  CreateGeom2d_TrimmedCurve(_0: Handle_Geom2d_Curve, _1: number, _2: number): Handle_Geom2d_Curve;
  ProjectPointOnCurve(_0: gp_Pnt, _1: TopoDS_Edge): CurvePointResult;
  CreateFillet2d(_0: TopoDS_Edge, _1: TopoDS_Edge, _2: number): TopoDS_Edge;
  BitListOfShapesToCompound(_0: TopTools_ListOfShape): TopoDS_Compound;
  IFSelect_ReturnStatus: {RetVoid: IFSelect_ReturnStatusValue<number>, RetDone: IFSelect_ReturnStatusValue<number>, RetError: IFSelect_ReturnStatusValue<number>, RetFail: IFSelect_ReturnStatusValue<number>, RetStop: IFSelect_ReturnStatusValue<number>};
  BRepBuilderAPI_MakeWire_Error(_0: BRepBuilderAPI_MakeWire): BRepBuilderAPI_WireError;
  BRepBuilderAPI_WireError: {WireDone: BRepBuilderAPI_WireErrorValue<number>, EmptyWire: BRepBuilderAPI_WireErrorValue<number>, DisconnectedWire: BRepBuilderAPI_WireErrorValue<number>, NonManifoldWire: BRepBuilderAPI_WireErrorValue<number>};
  BRepBuilderAPI_FaceError: {FaceDone: BRepBuilderAPI_FaceErrorValue<number>, NoFace: BRepBuilderAPI_FaceErrorValue<number>, NotPlanar: BRepBuilderAPI_FaceErrorValue<number>, CurveProjectionFailed: BRepBuilderAPI_FaceErrorValue<number>, ParametersOutOfRange: BRepBuilderAPI_FaceErrorValue<number>};
  BRepBuilderAPI_EdgeError: {EdgeDone: BRepBuilderAPI_EdgeErrorValue<number>, PointProjectionFailed: BRepBuilderAPI_EdgeErrorValue<number>, ParameterOutOfRange: BRepBuilderAPI_EdgeErrorValue<number>, DifferentPointsOnClosedCurve: BRepBuilderAPI_EdgeErrorValue<number>, PointWithInfiniteParameter: BRepBuilderAPI_EdgeErrorValue<number>, DifferentsPointAndParameter: BRepBuilderAPI_EdgeErrorValue<number>, LineThroughIdenticPoints: BRepBuilderAPI_EdgeErrorValue<number>};
  ClassifyPointOnFace2d(_0: TopoDS_Face, _1: gp_Pnt2d, _2: number): TopAbs_State;
  TopAbs_State: {IN: TopAbs_StateValue<number>, OUT: TopAbs_StateValue<number>, ON: TopAbs_StateValue<number>, UNKNOWN: TopAbs_StateValue<number>};
  BRepLib_BuildCurves3d_Full(_0: TopoDS_Shape, _1: number, _2: GeomAbs_Shape, _3: number, _4: number): boolean;
  GeomAbs_Shape: {C0: GeomAbs_ShapeValue<number>, G1: GeomAbs_ShapeValue<number>, C1: GeomAbs_ShapeValue<number>, G2: GeomAbs_ShapeValue<number>, C2: GeomAbs_ShapeValue<number>, C3: GeomAbs_ShapeValue<number>, CN: GeomAbs_ShapeValue<number>};
  GeomAbs_JoinType: {Arc: GeomAbs_JoinTypeValue<number>, Tangent: GeomAbs_JoinTypeValue<number>, Intersection: GeomAbs_JoinTypeValue<number>};
  BRepFill_TypeOfContact: {NoContact: BRepFill_TypeOfContactValue<number>, Contact: BRepFill_TypeOfContactValue<number>, ContactOnBorder: BRepFill_TypeOfContactValue<number>};
  GetEdgeCurveType(_0: TopoDS_Edge): GeomAbs_CurveType;
  GeomAbs_CurveType: {Line: GeomAbs_CurveTypeValue<number>, Circle: GeomAbs_CurveTypeValue<number>, Ellipse: GeomAbs_CurveTypeValue<number>, Hyperbola: GeomAbs_CurveTypeValue<number>, Parabola: GeomAbs_CurveTypeValue<number>, BezierCurve: GeomAbs_CurveTypeValue<number>, BSplineCurve: GeomAbs_CurveTypeValue<number>, OffsetCurve: GeomAbs_CurveTypeValue<number>, OtherCurve: GeomAbs_CurveTypeValue<number>};
  GeomAbs_SurfaceType: {Plane: GeomAbs_SurfaceTypeValue<number>, Cylinder: GeomAbs_SurfaceTypeValue<number>, Cone: GeomAbs_SurfaceTypeValue<number>, Sphere: GeomAbs_SurfaceTypeValue<number>, Torus: GeomAbs_SurfaceTypeValue<number>, BezierSurface: GeomAbs_SurfaceTypeValue<number>, BSplineSurface: GeomAbs_SurfaceTypeValue<number>, SurfaceOfRevolution: GeomAbs_SurfaceTypeValue<number>, SurfaceOfExtrusion: GeomAbs_SurfaceTypeValue<number>, OffsetSurface: GeomAbs_SurfaceTypeValue<number>, OtherSurface: GeomAbs_SurfaceTypeValue<number>};
  GeomFill_Trihedron: {IsCorrectedFrenet: GeomFill_TrihedronValue<number>, IsFixed: GeomFill_TrihedronValue<number>, IsFrenet: GeomFill_TrihedronValue<number>, IsConstantNormal: GeomFill_TrihedronValue<number>, IsDarboux: GeomFill_TrihedronValue<number>, IsGuideAC: GeomFill_TrihedronValue<number>, IsGuidePlan: GeomFill_TrihedronValue<number>, IsGuideACWithContact: GeomFill_TrihedronValue<number>, IsGuidePlanWithContact: GeomFill_TrihedronValue<number>, IsDiscreteTrihedron: GeomFill_TrihedronValue<number>};
  GccEnt_Position: {unqualified: GccEnt_PositionValue<number>, enclosing: GccEnt_PositionValue<number>, enclosed: GccEnt_PositionValue<number>, outside: GccEnt_PositionValue<number>, noqualifier: GccEnt_PositionValue<number>};
  ChFi3d_FilletShape: {Rational: ChFi3d_FilletShapeValue<number>, QuasiAngular: ChFi3d_FilletShapeValue<number>, Polynomial: ChFi3d_FilletShapeValue<number>};
  BRepOffset_Mode: {Skin: BRepOffset_ModeValue<number>, Pipe: BRepOffset_ModeValue<number>, RectoVerso: BRepOffset_ModeValue<number>};
  Approx_ParametrizationType: {ChordLength: Approx_ParametrizationTypeValue<number>, Centripetal: Approx_ParametrizationTypeValue<number>, IsoParametric: Approx_ParametrizationTypeValue<number>};
  Quantity_TypeOfColor: {Quantity_TOC_RGB: Quantity_TypeOfColorValue<number>, Quantity_TOC_sRGB: Quantity_TypeOfColorValue<number>, Quantity_TOC_HLS: Quantity_TypeOfColorValue<number>, Quantity_TOC_CIELab: Quantity_TypeOfColorValue<number>, Quantity_TOC_CIELch: Quantity_TypeOfColorValue<number>};
  XCAFDoc_ColorType: {XCAFDoc_ColorGen: XCAFDoc_ColorTypeValue<number>, XCAFDoc_ColorSurf: XCAFDoc_ColorTypeValue<number>, XCAFDoc_ColorCurv: XCAFDoc_ColorTypeValue<number>};
  TopAbs_ShapeEnum: {COMPOUND: TopAbs_ShapeEnumValue<number>, COMPSOLID: TopAbs_ShapeEnumValue<number>, SOLID: TopAbs_ShapeEnumValue<number>, SHELL: TopAbs_ShapeEnumValue<number>, FACE: TopAbs_ShapeEnumValue<number>, WIRE: TopAbs_ShapeEnumValue<number>, EDGE: TopAbs_ShapeEnumValue<number>, VERTEX: TopAbs_ShapeEnumValue<number>, SHAPE: TopAbs_ShapeEnumValue<number>};
  TopAbs_Orientation: {FORWARD: TopAbs_OrientationValue<number>, REVERSED: TopAbs_OrientationValue<number>, INTERNAL: TopAbs_OrientationValue<number>, EXTERNAL: TopAbs_OrientationValue<number>};
  TDF_Label: {
    new(): TDF_Label;
  };
  TDF_LabelSequence: {
    new(): TDF_LabelSequence;
  };
  Standard_GUID: {
    new(): Standard_GUID;
  };
  Quantity_Color: {
    new(): Quantity_Color;
    new(_0: number, _1: number, _2: number, _3: Quantity_TypeOfColor): Quantity_Color;
  };
  Quantity_ColorRGBA: {
    new(): Quantity_ColorRGBA;
    new(_0: Quantity_Color): Quantity_ColorRGBA;
    new(_0: Quantity_Color, _1: number): Quantity_ColorRGBA;
  };
  TCollection_ExtendedString: {
    new(): TCollection_ExtendedString;
    new(_0: EmbindString): TCollection_ExtendedString;
  };
  TCollection_AsciiString: {
    new(): TCollection_AsciiString;
    new(_0: EmbindString): TCollection_AsciiString;
    new(_0: TCollection_ExtendedString, _1: number): TCollection_AsciiString;
  };
  TDF_Attribute: {};
  Handle_TDF_Attribute: {
    new(): Handle_TDF_Attribute;
  };
  Handle_TDocStd_Document: {
    new(): Handle_TDocStd_Document;
  };
  TDocStd_Document: {};
  DocumentToMeshJson(_0: TDocStd_Document | null, _1: number, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: boolean): string;
  DocumentToMeshesJson(_0: TDocStd_Document | null, _1: number, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: boolean): string;
  TDataStd_Name: {
    GetID(): Standard_GUID;
  };
  TDataStd_Name_GetID(): Standard_GUID;
  TDataStd_Real: {
    new(): TDataStd_Real;
  };
  TDataStd_Integer: {
    new(): TDataStd_Integer;
  };
  Handle_XCAFDoc_ShapeTool: {
    new(): Handle_XCAFDoc_ShapeTool;
  };
  XCAFDoc_DocumentTool_ShapeTool(_0: TDF_Label): Handle_XCAFDoc_ShapeTool;
  Handle_XCAFDoc_ColorTool: {
    new(): Handle_XCAFDoc_ColorTool;
  };
  XCAFDoc_DocumentTool_ColorTool(_0: TDF_Label): Handle_XCAFDoc_ColorTool;
  Handle_XCAFDoc_MaterialTool: {
    new(): Handle_XCAFDoc_MaterialTool;
  };
  XCAFDoc_DocumentTool_MaterialTool(_0: TDF_Label): Handle_XCAFDoc_MaterialTool;
  XCAFDoc_ShapeTool: {};
  XCAFDoc_ShapeTool_IsAssembly(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsReference(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsSimpleShape(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsComponent(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsShape(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_GetLocation(_0: TDF_Label): TopLoc_Location;
  XCAFDoc_ShapeTool_GetShape_1(_0: TDF_Label, _1: TopoDS_Shape): boolean;
  XCAFDoc_ShapeTool_GetShape_2(_0: TDF_Label): TopoDS_Shape;
  XCAFDoc_ShapeTool_GetReferredShape(_0: TDF_Label, _1: TDF_Label): boolean;
  XCAFDoc_ShapeTool_GetComponents(_0: TDF_Label, _1: TDF_LabelSequence, _2: boolean): boolean;
  XCAFDoc_ShapeTool_NbComponents(_0: TDF_Label, _1: boolean): number;
  XCAFDoc_ColorTool: {};
  XCAFDoc_ColorTool_GetColor_1(_0: XCAFDoc_ColorTool | null, _1: TDF_Label, _2: Quantity_Color): boolean;
  XCAFDoc_ColorTool_GetColor_7(_0: XCAFDoc_ColorTool | null, _1: TopoDS_Shape, _2: XCAFDoc_ColorType, _3: Quantity_Color): boolean;
  XCAFDoc_ColorTool_GetColors(_0: XCAFDoc_ColorTool | null, _1: TDF_LabelSequence): void;
  XCAFDoc_MaterialTool: {};
  XCAFDoc_ShapeTool_GetSubShapes(_0: TDF_Label, _1: TDF_LabelSequence): boolean;
  XCAFDoc_ShapeTool_IsSubShape(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsCompound(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_IsFree(_0: TDF_Label): boolean;
  XCAFDoc_ShapeTool_GetUsers(_0: TDF_Label, _1: TDF_LabelSequence, _2: boolean): number;
  XCAFDoc_ShapeTool_FindSubShape(_0: XCAFDoc_ShapeTool | null, _1: TDF_Label, _2: TopoDS_Shape, _3: TDF_Label): boolean;
  XCAFDoc_ShapeTool_AddSubShape(_0: XCAFDoc_ShapeTool | null, _1: TDF_Label, _2: TopoDS_Shape): TDF_Label;
  XCAFDoc_ShapeTool_FindMainShape(_0: XCAFDoc_ShapeTool | null, _1: TopoDS_Shape): TDF_Label;
  STEPCAFControl_Reader_ReadFile(_0: EmbindString, _1: EmbindString): Handle_TDocStd_Document;
  ConvertStepToGltf(_0: EmbindString, _1: EmbindString, _2: number, _3: number, _4: boolean, _5: boolean, _6: boolean, _7: boolean, _8: number): boolean;
  ConvertStepToGltfAdvanced(_0: EmbindString, _1: EmbindString, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: boolean, _7: number, _8: number, _9: boolean, _10: boolean, _11: boolean, _12: boolean, _13: number, _14: boolean, _15: boolean, _16: boolean, _17: boolean, _18: boolean, _19: boolean, _20: number, _21: number, _22: number, _23: boolean, _24: number): boolean;
  ParseStepAssemblyToJson(_0: EmbindString): string;
  ConvertStepToGltfFromMemory(_0: EmbindString, _1: number, _2: number, _3: boolean, _4: boolean, _5: boolean, _6: number): any;
  ParseStepAssemblyToJsonFromMemory(_0: EmbindString): string;
  ConvertStepToGltfFromBinary(_0: any, _1: number, _2: number, _3: boolean, _4: boolean, _5: boolean, _6: number): any;
  ConvertStepToGltfFromBinaryAdvanced(_0: any, _1: boolean, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: number, _7: number, _8: boolean, _9: boolean, _10: boolean, _11: boolean, _12: number, _13: boolean, _14: boolean, _15: boolean, _16: boolean, _17: boolean, _18: number, _19: number, _20: number, _21: boolean, _22: number): any;
  ParseStepAssemblyToJsonFromBinary(_0: any): string;
  ReadSTEPFromBinary(_0: any): TopoDS_Shape;
  ReadIGESFromBinary(_0: any): TopoDS_Shape;
  ConvertStepToGltfWithDraco(_0: EmbindString, _1: EmbindString, _2: number, _3: number, _4: boolean, _5: boolean, _6: boolean, _7: boolean, _8: number, _9: boolean, _10: number, _11: number, _12: number, _13: number, _14: number, _15: number, _16: boolean): boolean;
  ConvertStepToGltfAdvancedWithDraco(_0: EmbindString, _1: EmbindString, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: boolean, _7: number, _8: number, _9: boolean, _10: boolean, _11: boolean, _12: boolean, _13: number, _14: boolean, _15: boolean, _16: boolean, _17: boolean, _18: boolean, _19: boolean, _20: number, _21: number, _22: number, _23: boolean, _24: number, _25: boolean, _26: number, _27: number, _28: number, _29: number, _30: number, _31: number, _32: boolean): boolean;
  ConvertStepToGltfFromBinaryWithDraco(_0: any, _1: number, _2: number, _3: boolean, _4: boolean, _5: boolean, _6: number, _7: boolean, _8: number, _9: number, _10: number, _11: number, _12: number, _13: number, _14: boolean): any;
  ConvertStepToGltfFromBinaryAdvancedWithDraco(_0: any, _1: boolean, _2: boolean, _3: boolean, _4: boolean, _5: boolean, _6: number, _7: number, _8: boolean, _9: boolean, _10: boolean, _11: boolean, _12: number, _13: boolean, _14: boolean, _15: boolean, _16: boolean, _17: boolean, _18: number, _19: number, _20: number, _21: boolean, _22: number, _23: boolean, _24: number, _25: number, _26: number, _27: number, _28: number, _29: number, _30: boolean): any;
  BuildAssemblyDocument(_0: EmbindString, _1: any, _2: any, _3: any): Handle_TDocStd_Document;
  ExportDocumentToStep(_0: Handle_TDocStd_Document, _1: EmbindString, _2: EmbindString, _3: EmbindString): any;
  ExportDocumentToStepZ(_0: Handle_TDocStd_Document, _1: EmbindString, _2: EmbindString, _3: EmbindString): any;
  ExportDocumentToGltf(_0: Handle_TDocStd_Document, _1: number, _2: number, _3: boolean, _4: boolean, _5: boolean, _6: boolean): any;
  ExportDocumentToGltfWithDraco(_0: Handle_TDocStd_Document, _1: number, _2: number, _3: boolean, _4: boolean, _5: boolean, _6: boolean, _7: boolean, _8: number, _9: number, _10: number, _11: number, _12: number, _13: number, _14: boolean): any;
  GetDocumentPartsFromDoc(_0: Handle_TDocStd_Document): string;
  GetShapeFromDocLabel(_0: Handle_TDocStd_Document, _1: EmbindString): TopoDS_Shape;
  GetDocLabelColor(_0: Handle_TDocStd_Document, _1: EmbindString): string;
  GetDocLabelTransform(_0: Handle_TDocStd_Document, _1: EmbindString): string;
  GetDocLabelInfo(_0: Handle_TDocStd_Document, _1: EmbindString): string;
  GetDocAssemblyHierarchy(_0: Handle_TDocStd_Document): string;
  SetDocLabelColor(_0: Handle_TDocStd_Document, _1: EmbindString, _2: number, _3: number, _4: number, _5: number): boolean;
  SetDocLabelName(_0: Handle_TDocStd_Document, _1: EmbindString, _2: EmbindString): boolean;
  LoadStepToDoc(_0: any): Handle_TDocStd_Document;
  VectorFaceTriangulationInfo: {
    new(): VectorFaceTriangulationInfo;
  };
  VectorSubShapeInfo: {
    new(): VectorSubShapeInfo;
  };
  GetPartDefinitionInfo(_0: TDF_Label): PartDefinitionInfo;
  GetFaceTriangulationMapping(_0: TopoDS_Shape): VectorFaceTriangulationInfo;
  GetLabeledSubShapes(_0: TDF_Label, _1: XCAFDoc_ShapeTool | null, _2: XCAFDoc_ColorTool | null): VectorSubShapeInfo;
  GetFaceSurfaceType(_0: TopoDS_Face): string;
  CountFaces(_0: TopoDS_Shape): number;
  CountEdges(_0: TopoDS_Shape): number;
  CountVertices(_0: TopoDS_Shape): number;
  CountSolids(_0: TopoDS_Shape): number;
  GetLabelEntry(_0: TDF_Label): string;
  BRepGraphAnalyze(_0: TopoDS_Shape): string;
  BRepGraphFaceAdjacency(_0: TopoDS_Shape): string;
  BRepGraphEdgeFaceMap(_0: TopoDS_Shape): string;
  BRepGraphVertexEdgeMap(_0: TopoDS_Shape): string;
  BRepGraphFaceInfo(_0: TopoDS_Shape): string;
  BRepGraphEdgeInfo(_0: TopoDS_Shape): string;
  BRepGraphContainment(_0: TopoDS_Shape): string;
  BRepGraphWireInfo(_0: TopoDS_Shape): string;
  BRepGraphAssembly(_0: TopoDS_Shape): string;
  BRepGraphValidate(_0: TopoDS_Shape): string;
  BRepGraphDump(_0: TopoDS_Shape): string;
  BRepGraphReconstruct(_0: TopoDS_Shape, _1: EmbindString, _2: number): TopoDS_Shape;
  BRepGraphNodeOfShape(_0: TopoDS_Shape, _1: TopoDS_Shape): string;
  FilletCornerByPoint(_0: TopoDS_Shape, _1: VectorDouble, _2: number, _3: number, _4: number, _5: number): TopoDS_Shape;
  ChamferCornerByPoint(_0: TopoDS_Shape, _1: VectorDouble, _2: number, _3: number, _4: number, _5: number): TopoDS_Shape;
  ClassifyCornerByPoint(_0: TopoDS_Shape, _1: VectorDouble, _2: number): string;
  CornerByPointReport(_0: TopoDS_Shape, _1: VectorDouble, _2: number, _3: number, _4: number, _5: number): string;
  BuildShapesFromSegments(_0: VectorInt, _1: VectorDouble, _2: VectorDouble, _3: VectorInt, _4: VectorInt, _5: VectorInt, _6: VectorInt, _7: number, _8: boolean, _9: number): TopoDS_Compound;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;

// ---- Backward-compatible aliases (kept stable for downstream consumers) ----
export type BitbybitOcctModule = MainModule;
export type EmscriptenFS = MainModule['FS'];
// Generic embind enum-value shape; type enum-holding variables as EmbindEnumValue<number> to accept
// any value of an enum.
export interface EmbindEnumValue<T extends number = number> { value: T; }
