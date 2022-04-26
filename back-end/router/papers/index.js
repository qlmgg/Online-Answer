/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:19 
 * @Last Modified by:   openrhc 
 * @Last Modified time: 2022-04-08 22:27:19 
 */

import Router from 'koa-router'
import ExampaperCtl from '../../controllers/exampaper.js'

const router = new Router()

router.get('考卷获取', '/', async ctx => await ExampaperCtl.find(ctx))
router.get('考卷获取详情', '/:id', async ctx => await ExampaperCtl.findById(ctx))
router.post('考卷创建', '/', async ctx => await ExampaperCtl.create(ctx))
router.put('考卷更新', '/:id', async ctx => await ExampaperCtl.update(ctx))
router.delete('考卷删除', '/:id', async ctx => await ExampaperCtl.deleteById(ctx))
router.delete('考卷全部删除', '/', async ctx => await ExampaperCtl.delete(ctx))

export default router
