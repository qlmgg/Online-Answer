/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:15:59 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-14 21:42:52
 */

import { basename } from 'path'
import File from '../models/file.js'
import message from '../message/index.js'

class FileCtl {
    // 保存上传的头像
    async saveAvatar(ctx) {
        const file = ctx.request.files.file
        const name = basename(file.path)
        const avatar = await new File({ type: 1, url: `/uploads/${name}` }).save()
        ctx.body = { code: 0, msg: message.UploadSuccess, data: avatar }
    }

    // 保存上传的Banner
    async saveBanner(ctx) {
        const file = ctx.request.files.file
        const name = basename(file.path)
        const banner = await new File({ type: 1, url: `/uploads/${name}` }).save()
        ctx.body = { code: 0, msg: message.UploadSuccess, data: banner }
    }
}

export default new FileCtl()
