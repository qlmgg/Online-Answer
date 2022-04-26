/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:21:20 
 * @Last Modified by:   openrhc 
 * @Last Modified time: 2022-04-08 22:21:20 
 */

import Status from '../models/status.js'
import message from '../message/index.js'

class StatusCtl {
    async find(ctx) {
        const data = await Status.find({})
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }
}

export default new StatusCtl()
