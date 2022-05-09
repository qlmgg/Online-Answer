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
        .find({
            ban: false,
            $or: [{ title: { $regex: reg } }]
        })
        .skip(skip)
        .limit(limit)
    questions.forEach(v => {
        if (!v.public) {
            v.answer = ''
        }
    })
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
        const data = await HotWords.find(filter).limit(10).sort({ count: -1 })
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }

    // 全局搜索试卷、题目
    async findByKeywords(ctx) {
        const { keywords = '', page = 1, limit = 10, type = '0' } = ctx.query
        const skip = (page - 1) * limit
        const reg = new RegExp(keywords)
        const hotwords = await HotWords.findOne({ keywords })
        if (hotwords) {
            // 搜索次数 + 1
            await HotWords.findByIdAndUpdate(hotwords._id, { count: hotwords.count + 1 })
        } else if (keywords.length <= 12) {
            // 保存关键词
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

    async delete(ctx) {
        const { id } = ctx.params
        const hotwords = await HotWords.findByIdAndDelete(id)
        if (!hotwords) {
            ctx.body = { code: -1, msg: message.HotWordsNotFound }
            return
        }
        ctx.body = { code: 0, msg: message.DeleteSuccess }
    }

    async create(ctx) {
        ctx.verifyParams({
            keywords: { type: 'string', required: true },
            count: { type: 'number', required: true },
        })
        const { keywords, count } = ctx.request.body
        const hotwords = await HotWords.findOne({ keywords })
        if (hotwords) {
            ctx.body = { code: -1, msg: message.HotWordsExisted }
            return
        }
        await new HotWords({ keywords, count }).save()
        ctx.body = { code: 0, msg: message.CreateSuccess }
    }
}

export default new HotWordsCtl()
