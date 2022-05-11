/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:28:06 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-11 15:18:04
 */

import { join } from 'path'

import Koa from 'koa'
import cors from 'koa2-cors'
import koaBody from 'koa-body'
import koaStatic from 'koa-static'
import koaParameter from 'koa-parameter'
import koaJwt from 'koa-jwt'

import router from './router/index.js'

import Status from './middleware/Status.js'
import MiddlewareLogger from './middleware/Logger.js'
import RequestUser from './middleware/RequestUser.js'

// eslint-disable-next-line
import db from './db.js'
import Logger from './utils/logger.js'

const app = new Koa()

// 使用 日志 中间件
app.use(MiddlewareLogger())

// 使用 跨域 中间件
app.use(cors({
    // 让浏览器能访问到自定义响应头
    exposeHeaders: ["Authorization"]
}))

// 使用 请求体解析器 中间件
app.use(koaBody({
    // 设置支持文件上传
    multipart: true,
    formidable: {
        // 设置文件上传目录
        uploadDir: join(process.cwd(), 'public/uploads'),
        // 设置文件后缀名保留
        keepExtensions: true
    }
}))

// 使用 静态资源 中间件
app.use(koaStatic(
    // 指定静态资源目录
    join(process.cwd(), 'public')
))

// 使用 参数校验 中间件
app.use(koaParameter(app))

// 使用 接口认证 中间件
app.use(
    koaJwt({ secret: process.env.TOKEN_SECRET }).unless({
        path: [/\/users\/login/, /\/users\/logout/, /\/users\/register/, /\/banners/, /\/imgs/, /\/papers/]
    })
)

// 使用 请求用户 中间件
app.use(RequestUser())

// 使用 接口调用统计 中间件
app.use(Status(router.routes().router))

// 使用 路由 中间件
app.use(router.routes())

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
    Logger.info(`Server running @ http://localhost:${PORT}`)
})

// 导出app 供单元测试使用
export default app
