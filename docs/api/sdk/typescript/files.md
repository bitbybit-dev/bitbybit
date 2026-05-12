---
sidebar_position: 6
title: Files
sidebar_label: Files
description: "Upload, confirm, list, and delete files with the Bitbybit SDK - includes a convenience method for end-to-end upload."
tags: [sdk, typescript, files]
---

# Files

The `client.files` endpoint manages file uploads. Files are required for STEP → glTF conversion - upload first, then convert.

## Upload a file (easy way)

`uploadBytes()` handles the entire upload flow - request a pre-signed URL, PUT the bytes, confirm:

```ts
import { readFile } from "node:fs/promises";

const data = await readFile("model.step");
const confirmed = await client.files.uploadBytes("model.step", data);

console.log(confirmed.fileId);     // use this with convert endpoints
console.log(confirmed.status);     // "confirmed"
console.log(confirmed.bytes);      // file size
console.log(confirmed.contentType); // MIME type
```

## Upload manually (step by step)

For more control over the upload process:

```ts
// 1. Request a pre-signed upload URL
const upload = await client.files.upload({
    filename: "part.step",
    contentType: "application/octet-stream",
    bytes: data.byteLength,
    sha256: "abc123...", // optional - enables deduplication
});

console.log(upload.fileId);    // assigned file ID
console.log(upload.uploadUrl); // pre-signed PUT URL
console.log(upload.expiresIn); // seconds until URL expires
console.log(upload.maxBytes);  // max allowed size (plan-dependent)

// 2. PUT the file bytes to the pre-signed URL
await fetch(upload.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/octet-stream" },
    body: data,
});

// 3. Confirm the upload
const confirmed = await client.files.confirm(upload.fileId);
```

## List files

```ts
const list = await client.files.list({
    status: "confirmed", // "pending" | "confirmed" | "expired"
    page: 1,
    limit: 20,
});

for (const file of list.files) {
    console.log(`${file.filename} - ${file.status} - ${file.bytes} bytes`);
}
```

## Get file details

```ts
const file = await client.files.get(fileId);

console.log(file.filename);
console.log(file.status);
console.log(file.downloadUrl); // only for confirmed files, expires after 1 hour
```

## Delete a file

```ts
const { deleted } = await client.files.delete(fileId);
```
