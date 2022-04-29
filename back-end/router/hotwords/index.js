import Router from 'koa-router'
import HotWordsCtl from '../../controllers/hotwords.js'

const router = new Router()

router.get('全局搜索', '/search', async (ctx) => HotWordsCtl.findByKeywords(ctx))
router.get('热词获取', '/', async (ctx) => HotWordsCtl.find(ctx))
router.delete('热词删除', '/:id', async (ctx) => HotWordsCtl.delete(ctx))
router.post('热词增加', '/', async (ctx) => HotWordsCtl.create(ctx))

export default router
