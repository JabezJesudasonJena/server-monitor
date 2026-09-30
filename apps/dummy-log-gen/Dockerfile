# ─────────────────────────────────────────────────────────────
#  Stage: base — Node.js + Fluent Bit in a single image
# ─────────────────────────────────────────────────────────────
FROM node:20-slim

# Install prerequisites and Fluent Bit from the official repo
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
        ca-certificates \
        gnupg2 \
    && curl -fsSL https://packages.fluentbit.io/fluentbit.key \
       | gpg --dearmor -o /usr/share/keyrings/fluentbit-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/fluentbit-keyring.gpg] \
        https://packages.fluentbit.io/debian/bookworm bookworm main" \
       > /etc/apt/sources.list.d/fluentbit.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends fluent-bit \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies (standalone — no pnpm workspace needed inside Docker)
COPY package.json ./
RUN npm install --omit=dev

# Copy application source
COPY index.js ./

# Copy Fluent Bit config
COPY fluent-bit.conf /fluent-bit/etc/fluent-bit.conf
COPY parsers.conf    /fluent-bit/etc/parsers.conf

# Copy and make startup script executable
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Winston writes logs here; declare as a volume so they survive restarts
RUN mkdir -p /app/logs
VOLUME ["/app/logs"]

EXPOSE 4000

CMD ["/start.sh"]
