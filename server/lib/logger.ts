import winston from 'winston';//logging library
import path from 'path'; //helps build proper file paths that work on any OS


const logger = winston.createLogger({
    // minimum level to log
    // levels (from most to least severe): error, warn, info, http, verbose, debug, silly
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',

    //how each log entry should be formatted
    format: winston.format.combine(
        winston.format.timestamp(),    //adds timestamp to every log
        winston.format.errors({ stack: true }),     //includes full error stack traces when logging error object
        winston.format.json()    //outputs logs at JSON
    ),

    //where logs get sent
    transports: [
        //log to terminal to see while developing
        new winston.transports.Console({
            //format console output as readble text instead of JSON
            format : winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        //logs errors only to a seperate file so it's easy to find
        new winston.transports.File({
            filename: path.join('logs', 'error.log'),
            level : 'error',
            maxsize: 5242880, // rotate file when it hits 5MB
            maxFiles: 5, //keep only 5 most recent log files
        }),

        //logs everything to a combined file
        new winston.transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],

    //catches uncaught exceptions
    exceptionHandlers: [
        new winston.transports.File({ filename: path.join('logs', 'exceptions.log')}),
    ],

    //catches unhandled promise rejections
    rejectionHandlers: [
        new winston.transports.File({ filename: path.join('logs', 'rejections.log')}),

    ],
});

export default logger;