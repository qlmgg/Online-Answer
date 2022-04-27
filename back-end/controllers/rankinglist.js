/*
 * @Author: openrhc 
 * @Date: 2022-04-27 14:05:41 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-27 17:22:29
 */

import RankingList from '../models/rankinglist.js'
import message from '../message/index.js'

class RankingListCtl {

    // 查询排行榜
    async find(ctx) {
        const { rankDate = 'today', rankType = 'paper' } = ctx.query
        const date = {
            // today: Date.now() + 1,
            today: new Date(new Date().toLocaleDateString()).getTime(),
            week: new Date(new Date(Date.now() - 86400 * 7 * 1000).toLocaleDateString()).getTime(),
            month: new Date(new Date(Date.now() - 86400 * 30 * 1000).toLocaleDateString()).getTime(),
            overall: 0
        }
        const filter = {
            type: rankType,
            $and: [
                { date: { $gt: date[rankDate] } }
            ]
        }
        const list = await RankingList.find(filter).populate('user')
        // 统计
        const data = []
        list.forEach(v => {
            const user = data.find(vv => vv.user._id === v.user._id)
            if (user) {
                user.count += v.count
            } else {
                data.push(v)
            }
        })
        // 排序
        data.sort((a, b) => b.count - a.count)
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }
}

export default new RankingListCtl()
