/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:39 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-14 20:31:59
 */

import Router from 'koa-router'

import File from '../../controllers/file.js'

const router = new Router()

router.post('上传头像', '/avatar', async ctx => await File.saveAvatar(ctx))
router.post('上传Banner', '/banner', async ctx => await File.saveBanner(ctx))

export default router
