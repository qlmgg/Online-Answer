/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:14 
 * @Last Modified by:   openrhc 
 * @Last Modified time: 2022-04-08 22:27:14 
 */

import Router from 'koa-router'
import CommentCtl from '../../controllers/comment.js'

const router = new Router()

router.get('评论获取', '/:id', async ctx => await CommentCtl.find(ctx))
router.post('评论创建', '/', async ctx => await CommentCtl.create(ctx))
router.delete('评论删除', '/:id', async ctx => await CommentCtl.deleteById(ctx))

export default router
