import Router from 'koa-router'
import HotWordsCtl from '../../controllers/hotwords.js'

const router = new Router()

router.get('全局搜索', '/search', async (ctx) => HotWordsCtl.findByKeywords(ctx))
router.get('热词获取', '/', async (ctx) => HotWordsCtl.find(ctx))

export default router
