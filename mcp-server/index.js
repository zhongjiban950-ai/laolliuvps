import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, readdir } from "fs/promises";
import { resolve } from "path";
import os from "os";

const execAsync = promisify(exec);

const server = new Server(
  { name: "local-terminal-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "run_command",
      description: "在本地终端执行 shell 命令",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "要执行的命令" },
          cwd: { type: "string", description: "工作目录（可选）" },
          timeout: { type: "number", description: "超时毫秒数（默认30000）" }
        },
        required: ["command"]
      }
    },
    {
      name: "read_file",
      description: "读取本地文件内容",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "文件路径" }
        },
        required: ["path"]
      }
    },
    {
      name: "write_file",
      description: "写入内容到本地文件",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "文件路径" },
          content: { type: "string", description: "写入内容" }
        },
        required: ["path", "content"]
      }
    },
    {
      name: "list_dir",
      description: "列出目录内容",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "目录路径（默认: home）" }
        }
      }
    },
    {
      name: "system_info",
      description: "获取本地系统信息",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "run_command": {
        const { command, cwd, timeout = 30000 } = args;
        const { stdout, stderr } = await execAsync(command, {
          cwd: cwd || os.homedir(),
          timeout
        });
        const output = [
          stdout ? `stdout:\n${stdout}` : "",
          stderr ? `stderr:\n${stderr}` : ""
        ].filter(Boolean).join("\n");
        return { content: [{ type: "text", text: output || "(no output)" }] };
      }

      case "read_file": {
        const content = await readFile(resolve(args.path), "utf-8");
        return { content: [{ type: "text", text: content }] };
      }

      case "write_file": {
        await writeFile(resolve(args.path), args.content, "utf-8");
        return { content: [{ type: "text", text: `已写入: ${args.path}` }] };
      }

      case "list_dir": {
        const dir = args.path ? resolve(args.path) : os.homedir();
        const entries = await readdir(dir, { withFileTypes: true });
        const list = entries
          .map(e => `${e.isDirectory() ? "[d]" : "[f]"} ${e.name}`)
          .join("\n");
        return { content: [{ type: "text", text: `${dir}:\n${list}` }] };
      }

      case "system_info": {
        const info = {
          platform: os.platform(),
          arch: os.arch(),
          hostname: os.hostname(),
          homedir: os.homedir(),
          username: os.userInfo().username,
          shell: process.env.SHELL || "unknown",
          node: process.version,
          cwd: process.cwd()
        };
        return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
