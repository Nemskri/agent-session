# MCP — The Basics

One line: MCP (Model Context Protocol) is a standard way to expose tools to an LLM, so a tool built once works with any MCP agent. "USB-C for AI tools."

**Two sides:**
- **Server** — exposes tools. You write it.
- **Client** — inside the agent; discovers and calls them.

**A tool = name + input schema + handler.**

**Example — `create_ticket`**

Schema:
```json
{
  "name": "create_ticket",
  "inputSchema": {
    "type": "object",
    "properties": { "issue": { "type": "string" } },
    "required": ["issue"]
  }
}
```

Model sends (input):
```json
{ "issue": "Login button does nothing" }
```

Server returns (output):
```json
{ "content": [{ "type": "text", "text": "Ticket #482 created, status: open" }] }
```

**Example 2 — `get_weather`**

Schema:
```json
{
  "name": "get_weather",
  "inputSchema": {
    "type": "object",
    "properties": { "location": { "type": "string" } },
    "required": ["location"]
  }
}
```

Model sends (input):
```json
{ "location": "San Francisco" }
```

Server returns (output):
```json
{ "content": [{ "type": "text", "text": "72°F and sunny" }] }
```

*Note: MCP results come back as a `content` array of typed blocks, not a bare string.*

One-line close: Same tool-calling loop you know — MCP just standardizes where the tool lives and how it's described.
