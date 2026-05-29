#!/usr/bin/env bash
# Deploy baja-client-auth-demo: build the new image, then swap the running container.
#
# Usage:
#   ./deploy.sh
#
# Safe to re-run. If the build fails, the currently running container is
# untouched and the script exits non-zero.
set -euo pipefail

cd "$(dirname "$0")"

GIT_COMMIT=$(git rev-parse --short HEAD)
export GIT_COMMIT

echo "==> Building baja-client-auth-demo from commit ${GIT_COMMIT}"
docker compose build

echo "==> Swapping container"
docker compose up -d

echo "==> Pruning dangling images"
docker image prune -f

echo "==> Done. Running:"
docker compose ps
