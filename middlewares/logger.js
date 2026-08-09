const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const normalizeMeta = (meta = {}) => {
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    return meta;
  }

  return { detail: meta };
};

const writeLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const payload = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...normalizeMeta(meta),
  };

  const line = `${timestamp} [${payload.level}] ${typeof message === 'string' ? message : JSON.stringify(message)} ${JSON.stringify(payload, null, 2)}\n`;

  fs.appendFileSync(LOG_FILE, line, 'utf8');
  console.log(line.trim());
};

const info = (message, meta) => writeLog('info', message, meta);
const warn = (message, meta) => writeLog('warn', message, meta);
const error = (message, meta) => writeLog('error', message, meta);

const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMeta = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
    };

    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode}`;

    if (res.statusCode >= 400) {
      error(message, logMeta);
      return;
    }

    info(message, logMeta);
  });

  next();
};

module.exports = {
  info,
  warn,
  error,
  requestLogger,
};
