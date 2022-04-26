/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:43 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-22 16:36:22
 */

import Router from 'koa-router'
import UserCtl from '../../controllers/user.js'

const router = new Router()

router.post('用户登录', '/login', async ctx => await UserCtl.login(ctx))
router.delete('用户登出', '/logout', async ctx => await UserCtl.logout(ctx))
router.post('用户注册', '/register', async ctx => await UserCtl.create(ctx))
router.put('用户重置密码', '/password/:id', async ctx => await UserCtl.resetpwd(ctx))

router.get('用户查询', '/', async ctx => await UserCtl.find(ctx))
router.get('用户详情查询', '/:id', async ctx => await UserCtl.findById(ctx))
router.post('用户创建', '/', async ctx => await UserCtl.create(ctx))
router.put('用户更新', '/:id', async ctx => await UserCtl.update(ctx))
router.delete('用户删除', '/:id', async ctx => await UserCtl.deleteById(ctx))
router.post('用户批量删除', '/delete', async ctx => await UserCtl.delete(ctx))

export default router
