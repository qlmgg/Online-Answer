/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:31 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-25 16:54:25
 */

import Router from 'koa-router'
import QuestionCtl from '../../controllers/question.js'

const router = new Router()

router.get('题目详情查询', '/:id', async (ctx) => await QuestionCtl.findById(ctx))
router.get('题目查询', '/', async (ctx) => await QuestionCtl.find(ctx))
router.delete('题目删除', '/:id', async (ctx) => await QuestionCtl.deleteById(ctx))
router.post('题目创建', '/', async (ctx) => await QuestionCtl.create(ctx))
router.put('题目更新', '/:id', async (ctx) => await QuestionCtl.update(ctx))

export default router

