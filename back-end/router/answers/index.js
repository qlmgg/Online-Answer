/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:11 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-07 15:21:03
 */

import Router from 'koa-router'
import AnswerCtl from '../../controllers/answer.js'

const router = new Router()

router.get('错题获取', '/wrongs', async ctx => await AnswerCtl.findWrong(ctx))
router.get('答卷获取', '/', async ctx => await AnswerCtl.find(ctx))
router.get('答卷详情获取', '/:id', async ctx => await AnswerCtl.findById(ctx))
router.delete('答卷删除', '/:id', async ctx => await AnswerCtl.delete(ctx))
router.post('答卷创建', '/', async ctx => await AnswerCtl.create(ctx))


export default router
