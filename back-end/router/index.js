/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:48 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-26 18:09:57
 */

import Router from 'koa-router'

import UsersRouter from './users/index.js'
import PapersRouter from './papers/index.js'
import CommentsRouter from './comments/index.js'
import QuestionsRouter from './questions/index.js'
import AnswersRouter from './answers/index.js'
import FilesRouter from './files/index.js'
import StatusRouter from './status/index.js'
import BannersRouter from './banners/index.js'
import HotWordsRouter from './hotwords/index.js'

const router = new Router()

router.use('/users', UsersRouter.routes())
router.use('/papers', PapersRouter.routes())
router.use('/comments', CommentsRouter.routes())
router.use('/questions', QuestionsRouter.routes())
router.use('/answers', AnswersRouter.routes())
router.use('/files', FilesRouter.routes())
router.use('/status', StatusRouter.routes())
router.use('/banners', BannersRouter.routes())
router.use('/hotwords', HotWordsRouter.routes())

export default router
