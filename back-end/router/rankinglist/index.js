/*
 * @Author: openrhc 
 * @Date: 2022-04-26 22:43:39 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-27 14:26:16
 */

import Router from 'koa-router'
import RankingListCtl from '../../controllers/rankinglist.js'

const router = new Router()

router.get('排行榜获取', '/', async (ctx) => RankingListCtl.find(ctx))

export default router
