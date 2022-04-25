/*
 * @Author: openrhc 
 * @Date: 2022-04-17 19:56:52 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-17 22:20:34
 */

import Router from 'koa-router'

import Banner from '../../controllers/banner.js'

const router = new Router()

router.get('banner获取', '/', async ctx => await Banner.find(ctx))
router.post('banner创建', '/', async ctx => await Banner.create(ctx))
router.put('banner更新', '/:id', async ctx => await Banner.update(ctx))
router.delete('banner删除', '/:id', async ctx => await Banner.delete(ctx))

export default router
