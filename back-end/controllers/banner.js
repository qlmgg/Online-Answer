/*
 * @Author: openrhc 
 * @Date: 2022-04-17 19:57:09 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-17 22:21:27
 */

import Banner from '../models/banner.js'
import message from '../message/index.js'

class BannerCtl {
    async find(ctx) {
        const data = await Banner.find({}).sort({ _id: -1 })
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }

    async create(ctx) {
        ctx.verifyParams({
            cover: { type: 'string', required: true },
            url: { type: 'string', required: true },
        })
        delete ctx.request.body._id
        const data = await new Banner(ctx.request.body).save()
        ctx.body = { code: 0, msg: message.CreateSuccess, data }
    }

    async update(ctx) {
        ctx.verifyParams({
            cover: { type: 'string', required: true },
            url: { type: 'string', required: true },
        })
        const id = ctx.params.id
        const exist = await Banner.findById(id)
        if (!exist) {
            ctx.body = { code: -1, msg: message.BannerNotFound }
            return
        }
        delete ctx.request.body._id
        const data = await Banner.findByIdAndUpdate(id, ctx.request.body)
        ctx.body = { code: 0, msg: message.UpdateSuccess, data }
    }

    async delete(ctx) {
        const id = ctx.params.id
        const exist = await Banner.findById(id)
        if (!exist) {
            ctx.body = { code: -1, msg: message.BannerNotFound }
            return
        }
        await Banner.findByIdAndDelete(id)
        ctx.body = { code: 0, msg: message.DeleteSuccess }
    }
}

export default new BannerCtl()
