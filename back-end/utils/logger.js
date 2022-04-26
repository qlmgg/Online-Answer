/*
 * @Author: openrhc 
 * @Date: 2022-04-11 13:32:13 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-11 15:10:22
 */

import log4js from "log4js";

// log4j配置
log4js.configure({
    appenders: {
        console: {
            type: "console"
        },
        info: {
            type: "dateFile",
            filename: "./logs/info",
            encoding: "utf-8",
            pattern: "yyyy-MM-dd.log",
            maxLogSize: 10485760,
            alwaysIncludePattern: true,
            layout: {
                type: "pattern",
                pattern: "[%d{ISO8601}][%5p  %z  %c] %m"
            },
            compress: true,
            keepFileExt: true,
            numBackups: 20
        },
        maxError: {
            type: "logLevelFilter",
            appender: "info",
            level: "debug",
            maxLevel: "error"
        },
        error: {
            type: "dateFile",
            filename: "./logs/error",
            pattern: "yyyy-MM-dd.log",
            maxLogSize: 10485760,
            encoding: "utf-8",
            alwaysIncludePattern: true,
            layout: {
                type: "pattern",
                pattern: "[%d{ISO8601}][%5p  %z  %c] %m"
            },
            compress: true,
            keepFileExt: true,
            numBackups: 20
        },
        minError: {
            type: "logLevelFilter",
            appender: "error",
            level: "error"
        }
    },
    categories: {
        default: {
            appenders: ["console", "maxError", "minError"],
            level: "trace"
        }
    }
});

export default {
    info: (message) => {
        let logger = log4js.getLogger('info')
        logger.level = log4js.levels.INFO
        logger.info(message)
    },

    error: (message) => {
        let logger = log4js.getLogger('error')
        logger.level = log4js.levels.ERROR
        logger.error(message)
    },
}

