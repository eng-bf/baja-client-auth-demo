#!/usr/bin/env bash
#
# Build and (re)deploy the Baja Client auth demo as a Docker container.
# Usage:  sudo ./deploy.sh
#         sudo PORT=8080 ./deploy.sh   # override the host port (default 5180)
#
set -euo pipefail

IMAGE_NAME="baja-client-auth-demo"
CONTAINER_NAME="baja-client-auth-demo"
HOST_PORT="${PORT:-5180}"

# Always run from the script's directory so relative paths are stable.
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker is not installed or not on PATH." >&2
  exit 1
fi

if [ ! -f .env ]; then
  echo "ERROR: .env not found." >&2
  echo "       Copy .env.example to .env and set VITE_CLIENT_ID before deploying." >&2
  echo "       (VITE_* vars are baked into the build, so .env must exist now.)" >&2
  exit 1
fi

echo "==> Building image '${IMAGE_NAME}' ..."
docker build -t "${IMAGE_NAME}" .

echo "==> Removing existing container (if any) ..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "==> Starting container on host port ${HOST_PORT} ..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:80" \
  "${IMAGE_NAME}" >/dev/null

echo ""
echo "==> Deployed. App is live at http://localhost:${HOST_PORT}"
echo "    OAuth redirect URI in use: http://localhost:5180/callback"
if [ "${HOST_PORT}" != "5180" ]; then
  echo "    WARNING: serving on ${HOST_PORT} but redirect URI expects 5180 — auth may break." >&2
fi
echo "    Logs:  docker logs -f ${CONTAINER_NAME}"
echo "    Stop:  docker rm -f ${CONTAINER_NAME}"
