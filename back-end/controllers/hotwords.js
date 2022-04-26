import Exampaper from '../models/exampaper.js'
import Question from '../models/question.js'
import HotWords from '../models/hotwords.js'
import message from '../message/index.js'

const searchExampaper = async (reg, skip, limit) => {
    const papers = await Exampaper
        .find({ $or: [{ title: { $regex: reg } }] })
        .skip(skip)
        .limit(limit)
    return papers
}

const searchQuestion = async (reg, skip, limit) => {
    const questions = await Question
        .find({ $or: [{ title: { $regex: reg } }] })
        .skip(skip)
        .limit(limit)
    return questions
}

class HotWordsCtl {

    // 查询热词
    async find(ctx) {
        const { keywords = '' } = ctx.query
        const filter = {}
        if (keywords) {
            const reg = new RegExp(keywords)
            filter.$or = [
                { keywords: { $regex: reg } }
            ]
        }
        const data = await HotWords.find(filter).limit(30).sort({ count: -1 })
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }

    // 全局搜索试卷、题目
    async findByKeywords(ctx) {
        const { keywords = '', page = 1, limit = 10, type = '0' } = ctx.query
        const skip = (page - 1) * limit
        const reg = new RegExp(keywords)
        const hotwords = await HotWords.findOne({ keywords })
        if (hotwords) {
            await HotWords.findByIdAndUpdate(hotwords._id, { count: hotwords.count + 1 })
        } else {
            await new HotWords({ keywords, count: 1 }).save()
        }
        if (type === '0') {
            const papers = await searchExampaper(reg, skip, limit)
            const questions = await searchQuestion(reg, skip, limit)
            ctx.body = { code: 0, msg: message.QuerySuccess, data: [...papers, ...questions] }
            return
        }
        if (type === '1') {
            const data = await searchExampaper(reg, skip, limit)
            ctx.body = { code: 0, msg: message.QuerySuccess, data }
            return
        }
        if (type === '2') {
            const data = await searchQuestion(reg, skip, limit)
            ctx.body = { code: 0, msg: message.QuerySuccess, data }
            return
        }
    }
}

export default new HotWordsCtl()
