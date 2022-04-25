/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:28 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-09 18:05:39
 */

// api统计信息，一段时间后同步到数据库里
export const api_status = []
// 用户增长信息，同上
export const user_status = []

// 统计每个接口请求的次数
export default function (router) {
    return async (ctx, next) => {
        // 获取请求的URL、方法
        const { url, method } = ctx.request
        // 调用router的match方法进行路由匹配
        const match = router.match(url, method)
        // 统计API调用次数
        if (match.route) {
            const s = match.pathAndMethod[0]
            const item = api_status.find(v => v.name === s.name)
            if (item) {
                item.today += 1
            } else {
                api_status.push({ name: s.name, today: 1 })
            }
        }
        // 统计今日注册人数
        if (url === '/users/register') {
            const date = new Date()
            const Y = date.getFullYear()
            const M = date.getMonth() + 1
            const D = date.getDate()
            const item = user_status.find(v => v.date === `${Y}/${M}/${D}`)
            if (item) {
                item.count += 1
            } else {
                user_status.push({ date: `${Y}/${M}/${D}`, count: 1 })
            }
        }
        await next()
    }
}
