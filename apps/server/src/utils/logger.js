/* Minimal dependency-free logger with level + timestamp.
 * Swap for winston/pino in a larger production deployment if desired. */
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = levels[process.env.LOG_LEVEL] ?? levels.info;

function log(level, message) {
  if (levels[level] > currentLevel) return;
  const time = new Date().toISOString();
  const line = `[${time}] [${level.toUpperCase()}] ${message}`;
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  error: (msg) => log("error", msg),
  warn: (msg) => log("warn", msg),
  info: (msg) => log("info", msg),
  debug: (msg) => log("debug", msg),
};
