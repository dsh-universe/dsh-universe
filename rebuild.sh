#!/usr/bin/env bash
# DSH 本地重构（安全版）：停 preview → build → 起 preview
# 注：本地 node 进程会锁文件，无法原子切换（Windows）；零停机发布
#     需等生产环境 NGINX 直接 root dist + Linux 目录切换（见 dsh-deploy）
set -e
cd "$(dirname "$0")"

echo "==> [1/3] 停 preview (4322)..."
npx astro preview stop 2>/dev/null || echo "    (无运行中的 preview)"

echo "==> [2/3] build..."
npm run build

echo "==> [3/3] 启动 preview (4322)..."
(npx astro preview --port 4322 > /tmp/dsh-preview.log 2>&1 &)
sleep 8

echo "==> 验证..."
curl -s -o /dev/null -w "    preview(4322): %{http_code}\n" http://localhost:4322/
curl -s -o /dev/null -w "    dev(4321):     %{http_code}\n" http://localhost:4321/
echo "==> 完成"
