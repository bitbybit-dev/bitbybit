---
sidebar_position: 1
title: Files and Assets in Scripts
sidebar_label: Assets
description: How a Bitbybit script loads files and sends them out - project assets in the cloud or in this browser, files fetched from a URL, downloads, and the conversions between File, Blob and byte arrays - with a table of every function.
topic: code.base.asset
type: explanation
tags: [code, assets]
---

# Files and assets in scripts

`bitbybit.asset` brings files into a script and sends files out of it. A STEP model to import, a font for 3D text, a texture, a table of sizes: each starts as a file, and the functions here turn it into what the next function asks for.

## The assets of a project

On bitbybit.dev, a project keeps its files as **assets**, either in the cloud or in this browser, and the editor also has a browser asset catalog for quick tests ([Assets](/learn/getting-started/basics/assets/intro)). A script loads them by file name or by title:

- `getFile` loads a file of the project as a File, and `getTextFile` reads it as text. In a project kept in this browser, its own files are looked up first, then the cloud project's.
- `getLocalFile` and `getLocalTextFile` look in the browser asset catalog first and then in the project, and give every file under one title as a list.

A name that is not there stops the script with an error. [Files of a project](/learn/getting-started/basics/assets/project-files) is the recommended way to keep them. The pages on [using cloud assets](/learn/getting-started/basics/assets/cloud/using) and on local [STEP](/learn/getting-started/basics/assets/local/step) and [glTF](/learn/getting-started/basics/assets/local/gltf) files show these calls at work.

Outside bitbybit.dev, in a runner or your own app built on the npm packages, the application decides what an asset name means: it supplies the lookup the functions call. A script that loads assets by name therefore runs wherever its host provides them.

## Files from the web

`fetchFile`, `fetchBlob`, `fetchText` and `fetchJSON` download what is at a URL as a File, raw bytes, text or parsed JSON. The server must allow cross-origin requests, as public file hosts and CDNs usually do. A File fetched this way is named after the last part of the URL.

## Downloads

`download` starts a browser download of text or bytes, with a file name, an extension and a content type. Pair it with `bitbybit.csv.arrayToCsv` for a table, `bitbybit.json.stringify` for data, or with the exporters of the kernels, which give their files as text or bytes.

## Between forms of a file

Loaders and exporters want files in different forms, and these functions convert between them:

- `toArrayBuffer` and `toUint8Array` read a File or Blob into bytes, the form binary loaders and the STEP converters take;
- `arrayBufferToUint8Array` and `uint8ArrayToArrayBuffer` move between the two kinds of byte array;
- `blobToFile` gives a Blob a name, which loaders that read the file extension need, and `fileToBlob` drops it;
- `createObjectURL` makes a temporary URL for a File or Blob in memory, for anything that loads from a URL, such as a texture.

## Every function

{/* api:asset:start - generated from the API index; edits between these markers are overwritten */}

| Function | What it does |
|---|---|
| [`arrayBufferToUint8Array`](https://docs.bitbybit.dev/classes/Bit.Asset#arrayBufferToUint8Array) | Views the bytes of an ArrayBuffer as a Uint8Array; no bytes are copied, both share the same memory. |
| [`blobToFile`](https://docs.bitbybit.dev/classes/Bit.Asset#blobToFile) | Wraps a Blob in a File with a name and a MIME type, which loaders that want a file name need; the Blob's own type is kept when `mimeType` is left out. |
| [`createObjectURL`](https://docs.bitbybit.dev/classes/Bit.Asset#createObjectURL) | Makes a temporary URL for a File or Blob held in memory, so it can be handed to anything that loads from a URL, such as a texture or a model loader. |
| [`createObjectURLs`](https://docs.bitbybit.dev/classes/Bit.Asset#createObjectURLs) | Makes a temporary URL for each File or Blob in a list, in the same order, as `createObjectURL` does for one. |
| [`download`](https://docs.bitbybit.dev/classes/Bit.Asset#download) | Starts a browser download of the given content as a file named `fileName` plus the `extension`. |
| [`fetchBlob`](https://docs.bitbybit.dev/classes/Bit.Asset#fetchBlob) | Downloads the content at a URL as a Blob, raw bytes without a file name; the server must allow cross-origin requests. |
| [`fetchFile`](https://docs.bitbybit.dev/classes/Bit.Asset#fetchFile) | Downloads the content at a URL as a File named after the last part of the URL, without its query string; the server must allow cross-origin requests. |
| [`fetchJSON`](https://docs.bitbybit.dev/classes/Bit.Asset#fetchJSON) | Downloads the content at a URL and parses it as JSON; the server must allow cross-origin requests and the body must be valid JSON. |
| [`fetchText`](https://docs.bitbybit.dev/classes/Bit.Asset#fetchText) | Downloads the content at a URL as plain text; the server must allow cross-origin requests. |
| [`fileToBlob`](https://docs.bitbybit.dev/classes/Bit.Asset#fileToBlob) | Copies the bytes of a File into a plain Blob of the same type, dropping the name; a Blob given in comes back as a copy. |
| [`getFile`](https://docs.bitbybit.dev/classes/Bit.Asset#getFile) | Loads a named asset of the running application as a File, through the lookup the application supplies in `assetManager.getAsset`. |
| [`getLocalFile`](https://docs.bitbybit.dev/classes/Bit.Asset#getLocalFile) | Loads a named local asset, one kept in the browser rather than on a server, through the lookup the application supplies in `assetManager.getLocalAsset`. |
| [`getLocalTextFile`](https://docs.bitbybit.dev/classes/Bit.Asset#getLocalTextFile) | Loads a named local asset, one kept in the browser rather than on a server, and reads it as text; a name that resolves to several files gives a list of texts. |
| [`getTextFile`](https://docs.bitbybit.dev/classes/Bit.Asset#getTextFile) | Loads a named asset of the running application and reads it as text, for JSON, CSV or other text files stored as assets. |
| [`toArrayBuffer`](https://docs.bitbybit.dev/classes/Bit.Asset#toArrayBuffer) | Reads all the bytes of a File or Blob into an ArrayBuffer, the form binary loaders and the STEP converters take. |
| [`toUint8Array`](https://docs.bitbybit.dev/classes/Bit.Asset#toUint8Array) | Reads all the bytes of a File or Blob into a Uint8Array, a byte array that can be indexed and sliced. |
| [`uint8ArrayToArrayBuffer`](https://docs.bitbybit.dev/classes/Bit.Asset#uint8ArrayToArrayBuffer) | Copies exactly the bytes a Uint8Array covers into a new ArrayBuffer, so a view over part of a larger buffer gives only its own part. |

{/* api:asset:end */}
