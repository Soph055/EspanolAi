"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston")); //logging library
const path_1 = __importDefault(require("path")); //helps build proper file paths that work on any OS
const logger = winston_1.default.createLogger({
    // minimum level to log
    // levels (from most to least severe): error, warn, info, http, verbose, debug, silly
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    //how each log entry should be formatted
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), //adds timestamp to every log
    winston_1.default.format.errors({ stack: true }), //includes full error stack traces when logging error object
    winston_1.default.format.json() //outputs logs at JSON
    ),
    //where logs get sent
    transports: [
        //log to terminal to see while developing
        new winston_1.default.transports.Console({
            //format console output as readble text instead of JSON
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple()),
        }),
        //logs errors only to a seperate file so it's easy to find
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5242880, // rotate file when it hits 5MB
            maxFiles: 5, //keep only 5 most recent log files
        }),
        //logs everything to a combined file
        new winston_1.default.transports.File({
            filename: path_1.default.join('logs', 'combined.log'),
            maxsize: 5242880,
            maxFiles: 5,
        }),
    ],
    //catches uncaught exceptions
    exceptionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join('logs', 'exceptions.log') }),
    ],
    //catches unhandled promise rejections
    rejectionHandlers: [
        new winston_1.default.transports.File({ filename: path_1.default.join('logs', 'rejections.log') }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map