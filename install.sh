#!/bin/bash
set -e

REPO="wudilaoliu/laolliuvps"
BRANCH="main"
MCP_DIR="$HOME/.local/share/local-terminal-mcp"

echo "==> 检查 Node.js..."
if ! command -v node &>/dev/null; then
  echo "❌ 需要 Node.js (https://nodejs.org)"
  exit 1
fi
echo "    Node $(node -v) ✓"

echo "==> 安装 MCP 服务到 $MCP_DIR..."
mkdir -p "$MCP_DIR"

BASE="https://raw.githubusercontent.com/$REPO/$BRANCH/mcp-server"
curl -fsSL "$BASE/package.json" -o "$MCP_DIR/package.json"
curl -fsSL "$BASE/index.js"     -o "$MCP_DIR/index.js"

cd "$MCP_DIR"
npm install --silent
echo "    依赖安装完成 ✓"

echo "==> 配置 Claude Desktop..."

# 检测系统
if [[ "$OSTYPE" == "darwin"* ]]; then
  CONFIG_DIR="$HOME/Library/Application Support/Claude"
elif [[ "$OSTYPE" == "linux"* ]]; then
  CONFIG_DIR="$HOME/.config/Claude"
elif [[ "$OSTYPE" == "msys"* || "$OSTYPE" == "cygwin"* ]]; then
  CONFIG_DIR="$APPDATA/Claude"
else
  echo "⚠️  未知系统，请手动配置 Claude Desktop:"
  echo ""
  echo '  {"mcpServers":{"local-terminal":{"command":"node","args":["'"$MCP_DIR/index.js"'"]}}}'
  exit 0
fi

mkdir -p "$CONFIG_DIR"
CONFIG="$CONFIG_DIR/claude_desktop_config.json"

if [[ -f "$CONFIG" ]]; then
  # 已有配置则合并
  python3 - <<PYEOF
import json
with open('$CONFIG') as f:
    cfg = json.load(f)
cfg.setdefault('mcpServers', {})['local-terminal'] = {
    'command': 'node',
    'args': ['$MCP_DIR/index.js']
}
with open('$CONFIG', 'w') as f:
    json.dump(cfg, f, indent=2)
print("    已合并到现有配置 ✓")
PYEOF
else
  cat > "$CONFIG" <<EOF
{
  "mcpServers": {
    "local-terminal": {
      "command": "node",
      "args": ["$MCP_DIR/index.js"]
    }
  }
}
EOF
  echo "    已创建新配置 ✓"
fi

echo ""
echo "✅ 安装完成！"
echo ""
echo "   配置文件: $CONFIG"
echo "   MCP 目录:  $MCP_DIR"
echo ""
echo "   提供工具:"
echo "     run_command  — 执行终端命令"
echo "     read_file    — 读取文件"
echo "     write_file   — 写入文件"
echo "     list_dir     — 列出目录"
echo "     system_info  — 系统信息"
echo ""
echo "   重启 Claude Desktop 即可使用 🎉"
