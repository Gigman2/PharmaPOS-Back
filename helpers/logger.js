const { createLogger, format, transports } = require('winston');
const path = require('path')

const logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		format.errors({ stack: true }),
		format.splat(),
		format.json()
	),
	transports: [
		//
		// - Write to all logs with level `info` and below to `quick-start-combined.log`.
		// - Write all logs error (and below) to `quick-start-error.log`.
		new transports.File({ filename: path.join(__basedir, '/logs/combined.log')}),
		new transports.File({ filename: path.join(__basedir, '/logs/error.log') , level: 'error' }),
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new transports.Console({
		format: format.combine(
			format.colorize(),
			format.simple()
		)
	}));
}

module.exports = logger
