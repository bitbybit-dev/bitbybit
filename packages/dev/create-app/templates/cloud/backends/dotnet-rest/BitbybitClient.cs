using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace dotnet_rest;

public class BitbybitClient
{
    private const int PollIntervalMs = 2_000;
    private const int MaxPollAttempts = 120; // 4 minutes max

    private readonly HttpClient _http;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    public BitbybitClient(HttpClient http, IConfiguration config)
    {
        _http = http;
        _apiKey = config["Bitbybit:ApiKey"] ?? throw new InvalidOperationException(
            "Bitbybit:ApiKey is not configured. " +
            "You need a Bitbybit API key to run this server. " +
            "Create an account on https://bitbybit.dev and purchase an API key plan at " +
            "https://bitbybit.dev/auth/pick-plan?api-keys=true to get access to managed CAD cloud servers. " +
            "Then add your key to appsettings.Development.json under Bitbybit:ApiKey.");
        _apiUrl = config["Bitbybit:ApiUrl"] ?? "https://api.bitbybit.dev";
    }

    // -----------------------------------------------------------------------
    // Dragon cup — single model
    // -----------------------------------------------------------------------

    public async Task<DownloadResult> CreateDragonCupAsync()
    {
        var body = new
        {
            @params = new
            {
                height = 8,
                radiusBottom = 4,
                radiusTopOffset = 2,
                radiusMidOffset = 2,
                rotationTopAngle = 20,
                rotationMidAngle = 20,
                nrSkinCellsVertical = 5,
                nrSkinCellsHorizontal = 10,
                thickness = 0.6,
                bottomThickness = 1,
                scale = 1,
                origin = new[] { 0, 0, 0 },
                direction = new[] { 0, 1, 0 },
            },
            outputs = new { formats = new[] { "gltf" } },
        };

        var taskId = await SubmitAndGetTaskIdAsync("/api/v1/models/dragon-cup", body);
        var downloads = await PollAndGetResultAsync(taskId);
        return new DownloadResult(taskId, downloads);
    }

    // -----------------------------------------------------------------------
    // Dragon cup — batch
    // -----------------------------------------------------------------------

    public async Task<BatchResult> CreateDragonCupBatchAsync()
    {
        var body = new
        {
            items = new object[]
            {
                new
                {
                    @params = new
                    {
                        height = 4, radiusBottom = 4, radiusTopOffset = 2, radiusMidOffset = 2,
                        rotationTopAngle = 20, rotationMidAngle = 20,
                        nrSkinCellsVertical = 2, nrSkinCellsHorizontal = 6,
                        nrSkinCellDivisionsTop = 2, nrSkinCellDivisionsBottom = 3,
                        skinCellOuterHeight = 1, skinCellInnerHeight = 0.3,
                        skinCellBottomHeight = 1, skinCellTopHeight = 1,
                        thickness = 2,
                    },
                },
                new
                {
                    @params = new
                    {
                        height = 7, radiusBottom = 4, radiusTopOffset = 2, radiusMidOffset = 2,
                        rotationTopAngle = 20, rotationMidAngle = 20,
                        nrSkinCellsVertical = 1, nrSkinCellsHorizontal = 12,
                        nrSkinCellDivisionsTop = 1, nrSkinCellDivisionsBottom = 1,
                        skinCellOuterHeight = 2, skinCellInnerHeight = 1,
                        skinCellBottomHeight = 1, skinCellTopHeight = 1,
                        thickness = 0.5,
                    },
                },
                new
                {
                    @params = new
                    {
                        height = 9, radiusBottom = 2, radiusTopOffset = 1, radiusMidOffset = 1,
                        rotationTopAngle = -30, rotationMidAngle = -30,
                        nrSkinCellsVertical = 1, nrSkinCellsHorizontal = 5,
                        nrSkinCellDivisionsTop = 1, nrSkinCellDivisionsBottom = 1,
                        skinCellOuterHeight = 4, skinCellInnerHeight = -0.3,
                        skinCellBottomHeight = 0.5, skinCellTopHeight = 0.3,
                        thickness = 0.5,
                    },
                },
            },
            outputs = new { formats = new[] { "gltf" } },
        };

        var json = await ApiPostAsync("/api/v1/models/dragon-cup/batch", body);
        var taskId = json["data"]?["taskId"]?.GetValue<string>() ?? throw new Exception("No taskId in response");
        var subTasks = json["data"]?["subTasks"]?.AsArray() ?? throw new Exception("No subTasks in response");

        await PollUntilDoneAsync(taskId);

        var downloadUrls = new List<string>();
        foreach (var sub in subTasks)
        {
            var subId = sub?["taskId"]?.GetValue<string>() ?? throw new Exception("No sub taskId");
            var resultJson = await ApiGetAsync($"/api/v1/tasks/{subId}/result/glb");
            var url = resultJson["data"]?["downloadUrl"]?.GetValue<string>() ?? throw new Exception("No downloadUrl");
            downloadUrls.Add(url);
        }

        return new BatchResult(taskId, downloadUrls);
    }

    // -----------------------------------------------------------------------
    // Get task result
    // -----------------------------------------------------------------------

    public async Task<TaskStatusResult> GetTaskResultAsync(string taskId)
    {
        var json = await ApiGetAsync($"/api/v1/tasks/{taskId}");
        var status = json["data"]?["status"]?.GetValue<string>() ?? throw new Exception("No status");

        if (status is "failed" or "cancelled" or "expired")
        {
            var error = json["data"]?["error"]?.GetValue<string>() ?? "no details";
            throw new Exception($"Task {status}: {error}");
        }

        if (status != "completed")
            return new TaskStatusResult(status, null);

        var resultJson = await ApiGetAsync($"/api/v1/tasks/{taskId}/results");
        var downloads = ParseDownloads(resultJson);
        return new TaskStatusResult("completed", downloads);
    }

    // -----------------------------------------------------------------------
    // Pipelines
    // -----------------------------------------------------------------------

    public Task<DownloadResult> RunTranslateUnionFilletPipelineAsync()
    {
        var body = new
        {
            steps = new object[]
            {
                new { operation = "occt.shapes.solid.createBox", @params = new { width = 8, length = 6, height = 4, center = new[] { 0, 0, 0 } } },
                new { operation = "occt.transforms.translate", @params = new { shape = "$ref:0", translation = new[] { 4, 2, 3 } } },
                new { operation = "occt.booleans.union", @params = new { shapes = new[] { "$ref:0", "$ref:1" } } },
                new { operation = "occt.fillets.filletEdges", @params = new { shape = "$ref:2", radius = 0.5 } },
            },
            outputs = new { formats = new[] { "stpz", "gltf" } },
        };
        return SubmitPipelineAsync(body);
    }

    public Task<DownloadResult> RunMapCylindersPipelineAsync()
    {
        var body = new
        {
            steps = new object[]
            {
                new { operation = "json.parse", @params = new { text = "[[0,0,0],[1.5,0,0],[3,0,0],[4.5,0,0]]" } },
                new { type = "map", items = "$ref:0", steps = new object[] { new { operation = "occt.shapes.solid.createCylinder", @params = new { radius = 1, height = 5, center = "$item" } } } },
                new { operation = "occt.booleans.union", @params = new { shapes = "$ref:5" } },
            },
            outputs = new { formats = new[] { "stpz", "gltf" } },
        };
        return SubmitPipelineAsync(body);
    }

    public Task<DownloadResult> RunMapSpheresPipelineAsync()
    {
        var body = new
        {
            steps = new object[]
            {
                new { operation = "json.parse", @params = new { text = "[[0,0,0],[4,0,0],[10,0,0],[18,0,0],[28,0,0]]" } },
                new
                {
                    type = "map", items = "$ref:0", steps = new object[]
                    {
                        new { operation = "math.twoNrOperation", @params = new { first = "$index", second = 1, operation = "add" } },
                        new { operation = "occt.shapes.solid.createSphere", @params = new { radius = "$prev", center = "$item" } },
                    },
                },
                new { operation = "occt.shapes.compound.makeCompound", @params = new { shapes = "$ref:11" } },
            },
            outputs = new { formats = new[] { "stpz", "gltf" } },
        };
        return SubmitPipelineAsync(body);
    }

    public Task<DownloadResult> RunChoicePipelineAsync()
    {
        var body = new
        {
            steps = new object[]
            {
                new { operation = "json.parse", @params = new { text = "10" } },
                new { operation = "math.twoNrOperation", @params = new { first = "$ref:0", second = 1, operation = "add" } },
                new
                {
                    type = "choice", value = "$ref:1", @operator = "gt", compareTo = 5,
                    then = new object[] { new { operation = "occt.shapes.solid.createBox", @params = new { width = 10, length = 10, height = 10, center = new[] { 0, 0, 0 } } } },
                    @else = new object[] { new { operation = "occt.shapes.solid.createSphere", @params = new { radius = 2, center = new[] { 0, 0, 0 } } } },
                },
            },
            outputs = new { formats = new[] { "stpz", "gltf" } },
        };
        return SubmitPipelineAsync(body);
    }

    public Task<DownloadResult> RunFileInputPipelineAsync(string fileId)
    {
        var body = new
        {
            steps = new object[]
            {
                new { operation = "occt.io.loadSTEPorIGES", @params = new { filetext = "$file:0", fileName = "shape.step", adjustZtoY = true } },
                new { operation = "occt.fillets.filletEdges", @params = new { shape = "$ref:0", radius = 0.1 } },
            },
            inputFiles = new[] { new { fileId, role = "input" } },
            outputs = new { formats = new[] { "stpz", "gltf" }, meshPrecision = 0.001 },
        };
        return SubmitPipelineAsync(body);
    }

    // -----------------------------------------------------------------------
    // File upload (3-step presigned URL flow)
    // -----------------------------------------------------------------------

    public async Task<string> UploadFileAsync(byte[] fileBytes, string filename)
    {
        // 1. Request presigned upload URL
        var uploadJson = await ApiPostAsync("/api/v1/files/upload", new
        {
            filename,
            contentType = "application/octet-stream",
            bytes = fileBytes.Length,
        });

        var fileId = uploadJson["data"]?["fileId"]?.GetValue<string>() ?? throw new Exception("No fileId");
        var uploadUrl = uploadJson["data"]?["uploadUrl"]?.GetValue<string>() ?? throw new Exception("No uploadUrl");

        // 2. PUT raw bytes to presigned URL
        using var putContent = new ByteArrayContent(fileBytes);
        putContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        var putRes = await _http.PutAsync(uploadUrl, putContent);
        putRes.EnsureSuccessStatusCode();

        // 3. Confirm
        await ApiPostAsync($"/api/v1/files/{Uri.EscapeDataString(fileId)}/confirm", null);

        return fileId;
    }

    // -----------------------------------------------------------------------
    // Internals
    // -----------------------------------------------------------------------

    private async Task<DownloadResult> SubmitPipelineAsync(object body)
    {
        var taskId = await SubmitAndGetTaskIdAsync("/api/v1/cad/pipeline", body);
        var downloads = await PollAndGetResultAsync(taskId);
        return new DownloadResult(taskId, downloads);
    }

    private async Task<string> SubmitAndGetTaskIdAsync(string path, object body)
    {
        var json = await ApiPostAsync(path, body);
        return json["data"]?["taskId"]?.GetValue<string>() ?? throw new Exception("No taskId in response");
    }

    private async Task<List<FileDownload>> PollAndGetResultAsync(string taskId)
    {
        await PollUntilDoneAsync(taskId);

        var resultJson = await ApiGetAsync($"/api/v1/tasks/{taskId}/results");
        return ParseDownloads(resultJson);
    }

    private async Task PollUntilDoneAsync(string taskId)
    {
        for (var attempt = 0; attempt < MaxPollAttempts; attempt++)
        {
            await Task.Delay(PollIntervalMs);

            var json = await ApiGetAsync($"/api/v1/tasks/{taskId}");
            var status = json["data"]?["status"]?.GetValue<string>() ?? throw new Exception("No status");

            if (status == "completed") return;
            if (status is "failed" or "cancelled" or "expired")
            {
                var error = json["data"]?["error"]?.GetValue<string>() ?? "no details";
                throw new Exception($"Task {status}: {error}");
            }
        }

        throw new TimeoutException("Polling timed out");
    }

    private async Task<JsonNode> ApiGetAsync(string path)
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"{_apiUrl}{path}");
        req.Headers.Add("x-api-key", _apiKey);
        var res = await _http.SendAsync(req);
        var body = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode && (int)res.StatusCode != 202)
            throw new Exception($"API error {(int)res.StatusCode}: {body}");
        return JsonNode.Parse(body) ?? throw new Exception("Empty response");
    }

    private async Task<JsonNode> ApiPostAsync(string path, object? body)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}{path}");
        req.Headers.Add("x-api-key", _apiKey);
        if (body != null)
        {
            var jsonStr = JsonSerializer.Serialize(body, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
            req.Content = new StringContent(jsonStr, Encoding.UTF8, "application/json");
        }
        var res = await _http.SendAsync(req);
        var responseBody = await res.Content.ReadAsStringAsync();
        if (!res.IsSuccessStatusCode && (int)res.StatusCode != 202)
            throw new Exception($"API error {(int)res.StatusCode}: {responseBody}");
        return JsonNode.Parse(responseBody) ?? throw new Exception("Empty response");
    }

    private static List<FileDownload> ParseDownloads(JsonNode json)
    {
        var arr = json["data"]?["downloads"]?.AsArray() ?? throw new Exception("No downloads");
        var downloads = new List<FileDownload>();
        foreach (var item in arr)
        {
            downloads.Add(new FileDownload(
                item?["format"]?.GetValue<string>() ?? "",
                item?["downloadUrl"]?.GetValue<string>() ?? "",
                item?["filename"]?.GetValue<string>() ?? ""
            ));
        }
        return downloads;
    }
}

// -----------------------------------------------------------------------
// DTOs
// -----------------------------------------------------------------------

public record FileDownload(string Format, string DownloadUrl, string Filename);
public record DownloadResult(string TaskId, List<FileDownload> Downloads);
public record BatchResult(string TaskId, List<string> DownloadUrls);
public record TaskStatusResult(string Status, List<FileDownload>? Downloads);
