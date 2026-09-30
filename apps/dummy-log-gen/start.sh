#!/bin/sh
set -e

# Ensure log directory and files exist before Fluent Bit tries to tail them
mkdir -p /app/logs
touch /app/logs/combined.log /app/logs/error.log

echo "[start.sh] Starting Fluent Bit..."
/opt/fluent-bit/bin/fluent-bit \
    -c /fluent-bit/etc/fluent-bit.conf \
    &

FLUENT_PID=$!
echo "[start.sh] Fluent Bit running (PID ${FLUENT_PID})"

echo "[start.sh] Starting Node.js app..."
exec node /app/index.js
