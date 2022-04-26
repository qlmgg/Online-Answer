/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:23 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-26 21:22:03
 */

import jwt from 'jsonwebtoken'
import message from '../message/index.js'

const authList = [
    { pattern: /\/users/, method: 'GET', role: 1 },         // 获取用户
    { pattern: /\/users/, method: 'DELETE', role: 1 },      // 删除用户
    { pattern: /\/users\/delete/, method: 'POST', role: 1 },// 批量删除用户
    { pattern: /\/users\/password/, method: 'PUT', role: 0 }, // 重置密码
    { pattern: /\/users/, method: 'PUT', role: 0 },         // 更新用户
    { pattern: /\/questions/, method: 'GET', role: 0 },     // 获取试卷题目
    { pattern: /\/paper/, method: 'DELETE', role: 1 },      // 删除试卷
    { pattern: /\/comments/, method: 'DELETE', role: 0 },   // 删除评论
    { pattern: /\/questions/, method: 'GET', role: 1 },     // 获取题目列表
    { pattern: /\/questions/, method: 'DELETE', role: 1 },  // 删除题目
    { pattern: /\/answer/, method: 'GET', role: 0 },        // 获取答卷列表
    { pattern: /\/banners/, method: 'POST', role: 2 },      // 增加Banner
    { pattern: /\/banners/, method: 'PUT', role: 2 },       // 更新Banner
    { pattern: /\/banners/, method: 'DELETE', role: 2 },    // 删除Banner
]
const length = authList.length

export default function () {
    return async (ctx, next) => {
        for (let i = 0; i < length; i++) {
            const o = authList[i]
            // 请求需要认证
            if (o.method === ctx.method && o.pattern.test(ctx.request.url)) {
                const token = ctx.request.headers.authorization
                if (!token) {
                    ctx.body = { code: -1, msg: message.LackToken }
                    return
                }
                try {
                    const user = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET)
                    // 将user放入ctx中，方便后面使用
                    ctx.request.user = user
                    if (user.role < o.role) {
                        ctx.body = { code: -1, msg: message.PermissionDenied }
                        return
                    }
                } catch (e) {
                    ctx.body = { code: 401, msg: message.TokenInvalid }
                    return
                }
                await next()
                return
            }
        }
        await next()
    }
}
