/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:35 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-25 20:32:33
 */

import Router from 'koa-router'
import User from '../../models/user.js'
import Question from '../../models/question.js'
import { api_status, user_status } from '../../middleware/Status.js'

const router = new Router()

router.get('API查询', '/', async (ctx) => {
    const male = await User.find({ gender: 1 }).count()
    const female = await User.find({ gender: 0 }).count()
    const secret = await User.find({ gender: 2 }).count()
    const single = await Question.find({ type: 0 }).count()
    const multi = await Question.find({ type: 1 }).count()
    const short = await Question.find({ type: 2 }).count()
    ctx.body = {
        code: 0,
        data: {
            user: { male, female, secret },
            question: { single, multi, short },
            api: api_status,
            user_growth: user_status
        }
    }
})

export default router
