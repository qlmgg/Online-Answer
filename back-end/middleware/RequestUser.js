/*
 * @Author: openrhc 
 * @Date: 2022-05-11 14:56:29 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-11 15:38:27
 */

import jwt from 'jsonwebtoken'

export default function () {
    return async (ctx, next) => {
        const token = ctx.request.headers.authorization
        // 将用户信息放入请求，方便后续使用
        token && (ctx.request.user = jwt.decode(token.split(' ')[1]))
        await next()
    }
}
