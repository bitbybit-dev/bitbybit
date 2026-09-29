import { createApp } from "./app.js";
import { sdkGateway } from "./cloud.js";

const apiKey = process.env["BITBYBIT_API_KEY"] ?? "";
const baseUrl = process.env["BITBYBIT_API_URL"] ?? "https://api.bitbybit.dev";
const port = Number(process.env["PORT"] ?? 3000);

const gateway = apiKey ? sdkGateway(apiKey, baseUrl) : null;
if (!gateway) console.warn("BITBYBIT_API_KEY is empty: the part builds in the browser, the unfold will answer 503 until a key is in backend/.env");

createApp(gateway).listen(port, () => {
    console.log(`sheet-metal unfold backend on http://localhost:${port} (${gateway ? "CAD Cloud configured" : "no key"})`);
});
