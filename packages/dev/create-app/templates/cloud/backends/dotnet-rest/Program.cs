using dotnet_rest;

var builder = WebApplication.CreateBuilder(args);

// Register HttpClient + BitbybitClient for DI
builder.Services.AddHttpClient<BitbybitClient>();

var app = builder.Build();

// Backend endpoint — calls bitbybit API with server-side API key
app.MapPost("/api/generate", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.CreateDragonCupAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Batch generation — creates 3 dragon cup variations in parallel
app.MapPost("/api/generate-batch", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.CreateDragonCupBatchAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Fetch result for an existing task
app.MapGet("/api/task/{id}", async (string id, BitbybitClient client) =>
{
    try
    {
        var result = await client.GetTaskResultAsync(id);
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Pipeline: translate → union → fillet
app.MapPost("/api/pipeline/translate-union-fillet", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.RunTranslateUnionFilletPipelineAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Pipeline: map cylinders at positions
app.MapPost("/api/pipeline/map-cylinders", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.RunMapCylindersPipelineAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Pipeline: map spheres at different radii
app.MapPost("/api/pipeline/map-spheres", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.RunMapSpheresPipelineAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Pipeline: choice conditional
app.MapPost("/api/pipeline/choice", async (BitbybitClient client) =>
{
    try
    {
        var result = await client.RunChoicePipelineAsync();
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

// Pipeline: file input (upload STEP → fillet)
app.MapPost("/api/pipeline/file-input", async (IFormFile file, BitbybitClient client) =>
{
    try
    {
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        var fileId = await client.UploadFileAsync(ms.ToArray(), file.FileName);
        var result = await client.RunFileInputPipelineAsync(fileId);
        return Results.Ok(result);
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
}).DisableAntiforgery();

// Proxy download — fetches a remote file through the backend to avoid CORS issues with GLTFLoader
app.MapGet("/api/proxy-download", async (string? url, IHttpClientFactory httpFactory) =>
{
    if (string.IsNullOrEmpty(url))
        return Results.Json(new { error = "Missing url parameter" }, statusCode: 400);

    try
    {
        var httpClient = httpFactory.CreateClient();
        var response = await httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode)
            return Results.Json(new { error = $"Upstream error: {(int)response.StatusCode}" }, statusCode: 502);

        var bytes = await response.Content.ReadAsByteArrayAsync();
        return Results.File(bytes, "model/gltf-binary");
    }
    catch (Exception e)
    {
        return Results.Json(new { error = e.Message }, statusCode: 500);
    }
});

app.Run();
