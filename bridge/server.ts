import express, { Request, Response, NextFunction } from "express";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const PORT = parseInt(process.env.PORT || "3001");
const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN || "";
const SESSION_DIR = process.env.SESSION_DIR || "/home/nuc/.linkedin-mcp-server";

if (!BRIDGE_TOKEN) {
  console.error("BRIDGE_TOKEN env var required");
  process.exit(1);
}

const app = express();
app.use(express.json());

// Auth
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/health") return next();
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (token !== BRIDGE_TOKEN) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
});

let mcpClient: Client | null = null;
let connecting = false;

async function getClient(): Promise<Client> {
  if (mcpClient) return mcpClient;
  if (connecting) {
    await new Promise((r) => setTimeout(r, 2000));
    return getClient();
  }
  connecting = true;
  try {
    const client = new Client({ name: "linkedin-bridge", version: "1.0.0" });
    const transport = new StdioClientTransport({
      command: "docker",
      args: [
        "run", "--rm", "-i",
        "-v", `${SESSION_DIR}:/root/.linkedin-mcp-server`,
        "--name", "linkedin-mcp",
        "linkedin-mcp-server",
      ],
    });
    await client.connect(transport);
    mcpClient = client;

    client.onclose = () => {
      console.log("MCP disconnected — will reconnect on next request");
      mcpClient = null;
    };

    console.log("LinkedIn MCP connected");
    return client;
  } finally {
    connecting = false;
  }
}

async function callTool(name: string, args: Record<string, unknown>) {
  const client = await getClient();
  const result = await client.callTool({ name, arguments: args });
  return result;
}

app.get("/health", async (_req: Request, res: Response) => {
  try {
    await getClient();
    res.json({ status: "ok", mcp: "connected" });
  } catch (e) {
    res.status(503).json({ status: "error", error: String(e) });
  }
});

app.post("/jobs/search", async (req: Request, res: Response) => {
  try {
    const result = await callTool("search_jobs", req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/jobs/details", async (req: Request, res: Response) => {
  try {
    const result = await callTool("get_job_details", req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/people/search", async (req: Request, res: Response) => {
  try {
    const result = await callTool("search_people", req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/company/profile", async (req: Request, res: Response) => {
  try {
    const result = await callTool("get_company_profile", req.body);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`LinkedIn bridge running on :${PORT}`);
});
