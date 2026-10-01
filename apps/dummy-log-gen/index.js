import express from "express";
import winston from "winston";

// ─────────────────────────────────────────────
//  Logger setup
// ─────────────────────────────────────────────
// Shared JSON format for file transports — one JSON object per line (NDJSON)
const jsonFileFormat = winston.format.combine(
  winston.format.timestamp(),        // ISO-8601 by default
  winston.format.errors({ stack: true }),
  winston.format.json()              // { level, message, timestamp, ...meta }
);

// Human-readable colourised format for the console
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return stack
      ? `[${timestamp}] ${level}: ${message}\n${stack}${metaStr}`
      : `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: "silly",
  transports: [
    // Console — stays readable for local dev
    new winston.transports.Console({ format: consoleFormat }),
    // Files — NDJSON so Fluent Bit (and any log collector) can parse them easily
    new winston.transports.File({ filename: "logs/error.log",    level: "error", format: jsonFileFormat }),
    new winston.transports.File({ filename: "logs/combined.log",                 format: jsonFileFormat }),
  ],
});

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}
function randUserId() {
  return `usr_${Math.random().toString(36).slice(2, 10)}`;
}
function randId() {
  return Math.random().toString(36).slice(2, 12);
}
function randIp() {
  return `${rand(1, 254)}.${rand(0, 255)}.${rand(0, 255)}.${rand(1, 254)}`;
}

// ─────────────────────────────────────────────
//  Log message pools  (NO errors in the scheduler pool)
// ─────────────────────────────────────────────
function buildNonErrorEntries() {
  return {
    info: [
      { message: "Server health check passed",          meta: { uptime: process.uptime().toFixed(2) + "s" } },
      { message: "Request processed successfully",      meta: { method: "GET", path: "/api/data", statusCode: 200, latencyMs: rand(10, 80) } },
      { message: "Cache hit",                           meta: { key: "user:session:abc123", ttl: rand(300, 3600) + "s" } },
      { message: "User authenticated",                  meta: { userId: randUserId(), provider: "jwt" } },
      { message: "Database query completed",            meta: { table: "orders", rows: rand(1, 500), durationMs: rand(5, 40) } },
      { message: "Background job scheduled",            meta: { job: "cleanup-expired-tokens", delay: "30s" } },
      { message: "File uploaded successfully",          meta: { filename: "report.pdf", sizeKB: rand(50, 2000) } },
      { message: "Email sent",                          meta: { to: "user@example.com", subject: "Welcome!", provider: "sendgrid" } },
    ],
    warn: [
      { message: "High memory usage detected",          meta: { usedMB: rand(700, 950), limitMB: 1024 } },
      { message: "Slow database query",                 meta: { table: "events", durationMs: rand(500, 2000), threshold: 500 } },
      { message: "Deprecated API endpoint called",      meta: { path: "/v1/users", suggestion: "/v2/users" } },
      { message: "Rate limit approaching for user",     meta: { userId: randUserId(), requests: rand(90, 99), limit: 100 } },
      { message: "Disk usage above 80%",                meta: { disk: "/", usedPercent: rand(80, 90) } },
      { message: "Third-party service response slow",   meta: { service: "stripe", latencyMs: rand(1500, 4000) } },
      { message: "Retry attempt for failed request",    meta: { url: "/api/payment", attempt: rand(1, 3), maxRetries: 3 } },
      { message: "JWT token expiring soon",             meta: { userId: randUserId(), expiresIn: rand(60, 300) + "s" } },
    ],
    debug: [
      { message: "Middleware chain executed",           meta: { middlewares: ["cors", "auth", "rateLimit"], durationMs: rand(1, 10) } },
      { message: "Resolving user permissions",          meta: { userId: randUserId(), roles: ["viewer", "editor"] } },
      { message: "Cache miss — fetching from database", meta: { key: "product:42" } },
      { message: "WebSocket ping sent",                 meta: { connectionId: randId(), latencyMs: rand(1, 5) } },
      { message: "Config reloaded from environment",   meta: { env: "production" } },
    ],
    http: [
      { message: "Incoming request",                    meta: { method: pick(["GET", "POST", "PUT", "DELETE"]), path: pick(["/api/users", "/api/orders", "/api/products", "/api/auth"]), ip: randIp() } },
      { message: "Response sent",                       meta: { statusCode: pick([200, 201, 204, 204, 200, 200]), durationMs: rand(5, 300) } },
    ],
  };
}

/** Error scenarios keyed by type */
const ERROR_SCENARIOS = {
  db: {
    message: "Database connection failed",
    meta: () => ({ host: "db.internal", port: 5432, error: "ECONNREFUSED", retries: rand(1, 3) }),
    stack: (msg) => [
      `Error: ${msg}`,
      `    at Pool.connect (node_modules/pg/lib/pool.js:${rand(50, 120)}:${rand(5, 20)})`,
      `    at Handler.process (src/db/client.js:${rand(10, 60)}:${rand(5, 25)})`,
      `    at Layer.handle (node_modules/express/lib/router/layer.js:95:5)`,
    ].join("\n"),
  },
  auth: {
    message: "Authentication failed",
    meta: () => ({ userId: randUserId(), reason: "Invalid token signature", ip: randIp() }),
    stack: null,
  },
  payment: {
    message: "Payment processing failed",
    meta: () => ({ userId: randUserId(), amount: rand(10, 500), error: "Card declined", provider: "stripe" }),
    stack: null,
  },
  crash: {
    message: "FATAL: Unrecoverable state — heap corruption detected",
    meta: () => ({ heapUsedMB: rand(1020, 1280), limitMB: 1024, pid: process.pid, signal: "SIGABRT" }),
    stack: (msg) => [
      `Error: ${msg}`,
      `    at GarbageCollector.collect (src/runtime/gc.js:88:3)`,
      `    at EventLoop.tick (v8/src/heap/mark-compact.cc:1024)`,
      `    at process.nextTick`,
    ].join("\n"),
  },
  memory: {
    message: "Memory limit exceeded — process restarting",
    meta: () => ({ heapUsedMB: rand(1024, 1280), limitMB: 1024, rss: rand(800, 1100) + " MB" }),
    stack: null,
  },
  queue: {
    message: "Queue consumer crashed",
    meta: () => ({ queue: pick(["email-notifications", "sms-alerts", "webhook-dispatch"]), error: "Connection reset by peer" }),
    stack: (msg) => [
      `Error: ${msg}`,
      `    at Consumer.poll (src/queue/consumer.js:${rand(30, 90)}:${rand(5, 20)})`,
      `    at Timeout._onTimeout (node_modules/amqplib/lib/channel.js:${rand(100, 200)}:12)`,
    ].join("\n"),
  },
};

const ERROR_TYPES = Object.keys(ERROR_SCENARIOS);

/** Emit one error log of the given type (or random) */
function emitError(type) {
  const scenario = ERROR_SCENARIOS[type] ?? ERROR_SCENARIOS[pick(ERROR_TYPES)];
  const meta = scenario.meta();
  const stack = scenario.stack ? scenario.stack(scenario.message) : null;
  if (stack) {
    logger.error(scenario.message, { stack, ...meta });
  } else {
    logger.error(scenario.message, meta);
  }
}

/** Scheduler-level random level — errors excluded */
function randomNonErrorLevel() {
  const roll = Math.random();
  if (roll < 0.50) return "info";
  if (roll < 0.75) return "warn";
  if (roll < 0.90) return "debug";
  return "http";
}

/** Emit one random non-error log */
function emitScheduledLog() {
  const level = randomNonErrorLevel();
  const entries = buildNonErrorEntries();
  const pool = entries[level];
  const entry = pick(pool);
  logger.log({ level, message: entry.message, ...entry.meta });
}

// ─────────────────────────────────────────────
//  Generator state
// ─────────────────────────────────────────────
const state = {
  running: false,
  startedAt: null,
  stoppedAt: null,
  totalLogsEmitted: 0,
  errorsTriggered: 0,
  schedulerHandle: null,
};

function scheduleNextLog() {
  if (!state.running) return;
  const delay = rand(300, 3000);
  state.schedulerHandle = setTimeout(() => {
    emitScheduledLog();
    state.totalLogsEmitted++;
    scheduleNextLog();
  }, delay);
}

function startGenerator() {
  if (state.running) return false; // already running
  state.running = true;
  state.startedAt = new Date().toISOString();
  state.stoppedAt = null;
  scheduleNextLog();
  logger.info("Log generator STARTED", { intervalRange: "300ms – 3s" });
  return true;
}

function stopGenerator() {
  if (!state.running) return false; // already stopped
  state.running = false;
  state.stoppedAt = new Date().toISOString();
  clearTimeout(state.schedulerHandle);
  state.schedulerHandle = null;
  logger.info("Log generator STOPPED", { totalLogsEmitted: state.totalLogsEmitted });
  return true;
}


// ─────────────────────────────────────────────
//  Express app
// ─────────────────────────────────────────────
const app = express();
app.use(express.json());

// HTTP request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const lvl = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "http";
    logger.log(lvl, `${req.method} ${req.path} -> ${res.statusCode}`, {
      ip: req.ip,
      durationMs: Date.now() - start,
    });
  });
  next();
});

// ── GET /  ──────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    service: "dummy-log-gen",
    generatorRunning: state.running,
    endpoints: {
      "GET  /status":            "Server health, memory usage, and generator snapshot",
      "GET  /generator/start":   "Start random log generation (info/warn/debug/http only)",
      "GET  /generator/stop":    "Stop random log generation",
      "GET  /generator/status":  "Detailed generator state and counters",
      "POST /trigger/error":     "Emit one error log — body: { type?: 'db|auth|payment|crash|memory|queue' }",
      "POST /trigger/log":       "Emit one non-error log — body: { level?: 'info|warn|debug|http', message? }",
    },
  });
});

// ── GET /status  ────────────────────────────────────────────────────────────
app.get("/status", (_req, res) => {
  const mem = process.memoryUsage();
  res.json({
    status: "ok",
    service: "dummy-log-gen",
    uptime: process.uptime().toFixed(2) + "s",
    pid: process.pid,
    memory: {
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
      rssMB: (mem.rss / 1024 / 1024).toFixed(2),
    },
    generator: {
      running: state.running,
      startedAt: state.startedAt,
      stoppedAt: state.stoppedAt,
      totalLogsEmitted: state.totalLogsEmitted,
      errorsTriggered: state.errorsTriggered,
    },
    timestamp: new Date().toISOString(),
  });
});

// ── GET /generator/start  ────────────────────────────────────────────────────
app.get("/generator/start", (_req, res) => {
  const started = startGenerator();
  res.json({
    generator: "started",
    alreadyRunning: !started,
    startedAt: state.startedAt,
  });
});

// ── GET /generator/stop  ─────────────────────────────────────────────────────
app.get("/generator/stop", (_req, res) => {
  const stopped = stopGenerator();
  res.json({
    generator: "stopped",
    alreadyStopped: !stopped,
    stoppedAt: state.stoppedAt,
    totalLogsEmitted: state.totalLogsEmitted,
  });
});

// ── GET /generator/status  ───────────────────────────────────────────────────
app.get("/generator/status", (_req, res) => {
  res.json({
    running: state.running,
    startedAt: state.startedAt,
    stoppedAt: state.stoppedAt,
    totalLogsEmitted: state.totalLogsEmitted,
    errorsTriggered: state.errorsTriggered,
    uptime: process.uptime().toFixed(2) + "s",
    availableErrorTypes: ERROR_TYPES,
  });
});

// ── POST /trigger/error  ─────────────────────────────────────────────────────
// Body (all optional): { type: "db" | "auth" | "payment" | "crash" | "memory" | "queue" }
app.post("/trigger/error", (req, res) => {
  const { type } = req.body ?? {};
  const resolvedType = ERROR_TYPES.includes(type) ? type : pick(ERROR_TYPES);
  emitError(resolvedType);
  state.errorsTriggered++;
  res.json({
    triggered: "error",
    type: resolvedType,
    availableTypes: ERROR_TYPES,
  });
});

// ── POST /trigger/log  ───────────────────────────────────────────────────────
// Body (all optional): { level: "info" | "warn" | "debug" | "http", message?: string }
app.post("/trigger/log", (req, res) => {
  const validLevels = ["info", "warn", "debug", "http"];
  const { level, message } = req.body ?? {};
  const resolvedLevel = validLevels.includes(level) ? level : randomNonErrorLevel();

  if (message) {
    logger.log({ level: resolvedLevel, message, triggeredBy: "api" });
  } else {
    const entries = buildNonErrorEntries();
    const entry = pick(entries[resolvedLevel]);
    logger.log({ level: resolvedLevel, message: entry.message, ...entry.meta, triggeredBy: "api" });
  }

  state.totalLogsEmitted++;
  res.json({ triggered: "log", level: resolvedLevel });
});

// ── 404 fallback  ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  logger.warn("Unknown route accessed", { method: req.method, path: req.path, ip: req.ip });
  res.status(404).json({ error: "Not found", hint: "GET / for available endpoints" });
});

// ── Global error handler  ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error("Unhandled Express error", { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: "Internal server error" });
});

// ─────────────────────────────────────────────
//  Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  logger.info(`dummy-log-gen listening on http://localhost:${PORT}`);
});

// ── Graceful shutdown  ───────────────────────────────────────────────────────
process.on("SIGINT", () => {
  logger.info("SIGINT received — shutting down gracefully");
  stopGenerator();
  process.exit(0);
});
process.on("SIGTERM", () => {
  logger.info("SIGTERM received — shutting down gracefully");
  stopGenerator();
  process.exit(0);
});