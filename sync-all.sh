#!/usr/bin/env bash
# DSH 每日数据同步：拉取 GitHub 最新插件 → 重建趋势图 → 重建站点
# 无 GITHUB_TOKEN 时 GitHub 匿名限流（10次/分），脚本内置等待重试
set -e
cd "$(dirname "$0")"
LOG=/tmp/dsh-sync-$(date +%Y%m%d).log

# node fetch 不走系统代理，必须显式带代理环境变量（否则 raw.githubusercontent.com 全超时）
# 从 Windows 注册表读系统代理端口，读不到就用默认 9567（VPN 客户端）
PROXY_PORT=$(powershell -NoProfile -Command "(Get-ItemProperty 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings').ProxyServer" 2>/dev/null | tr -d '\r')
if [ -z "$PROXY_PORT" ]; then PROXY_PORT="127.0.0.1:9567"; fi
# ProxyServer 可能带 http:// 前缀（如 "http://127.0.0.1:9567"），去重避免 http://http://
case "$PROXY_PORT" in
  http://*|https://*) PROXY_URL="$PROXY_PORT" ;;
  *) PROXY_URL="http://$PROXY_PORT" ;;
esac
export HTTPS_PROXY="$PROXY_URL" HTTP_PROXY="$PROXY_URL" NODE_USE_ENV_PROXY=1
echo "==> 代理: $HTTPS_PROXY (node fetch 必需)"

echo "==> [1/3] 同步 GitHub 插件数据 (npm run sync)..."
npm run sync >> "$LOG" 2>&1 || { echo "sync 失败，见 $LOG"; exit 1; }

echo "==> [2/4] 重建趋势图..."
node scripts/build-trend.mjs >> "$LOG" 2>&1 || echo "build-trend 跳过（可能缺数据）"

echo "==> [3/4] 重建 AI 情报数据 (Horizon 日报 → news-data.json)..."
node scripts/build-news.mjs >> "$LOG" 2>&1 || echo "build-news 跳过（Horizon 数据缺失）"

echo "==> [4/4] 重建站点 (build)..."
bash rebuild.sh >> "$LOG" 2>&1 || true

echo "==> 完成。日志: $LOG"
