/*
 * @Author: openrhc 
 * @Date: 2022-04-11 13:27:55 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-11 13:38:48
 */

import Logger from '../utils/logger.js'

export default function (options) {
    return async (ctx, next) => {
        const startTime = Date.now()
        await next()
        const ms = Date.now() - startTime
        Logger.info(`${ctx.method} ${ctx.url} ${ms} ms`)
    }
}
