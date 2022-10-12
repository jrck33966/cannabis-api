const winston = require('winston');
const path = require('path');

const createLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.label({ label: path.basename(process.mainModule.filename) }),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.printf(info => `${info.timestamp} [${info.label}] ${info.level} : ${info.message}`)
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/access.log', level: 'info' }),
  ],
});

module.exports = createLogger