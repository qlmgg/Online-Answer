/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:05:23 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-07 18:56:35
 */

import Answer from '../models/answer.js'
import Exampaper from '../models/exampaper.js'
import Question from '../models/question.js'
import RankingList from '../models/rankinglist.js'
import message from '../message/index.js'

class AnswerCtl {

    // 获取回答列表
    async find(ctx) {
        const ctxUser = ctx.request.user
        const { page = 1, exampaper, limit = 10, state = '' } = ctx.query
        const skip = (page - 1) * limit
        const filter = {}
        if (state) {
            filter.state = state
        }
        // 角色为学生仅查询自己的答卷
        if (ctxUser.role === 0) {
            filter.user = ctxUser._id
        }
        // 如果有exampaper，则仅查询关于某个试卷的答卷
        if (exampaper) {
            filter.exampaper = exampaper
        }
        // 查询所有答卷
        let answers = await Answer
            .find(filter)
            .populate(['user', 'exampaper'])
            .sort({ _id: -1 })
        answers.forEach(v => {
            v.user = v.user || message.DeletedUsers
            v.exampaper = v.exampaper || message.DeletedExampapers
        })
        // 角色为教师过滤出属于自己试卷的答卷
        if (ctxUser.role === 1) {
            answers = answers.filter(v => {
                return v.exampaper.from === ctxUser._id
            })
        }
        // 平均分
        const avgScore = answers.reduce((p, c) => p + c.score, 0) / answers.length || 0
        // 及格试卷数量
        const passingCount = answers.filter(v => v.score >= 60).length
        // 总答题数量
        const questionCount = answers.reduce((p, c) => p + c.answers.length, 0)
        // 答对题数量
        const correctCount = answers.reduce((p, c) => {
            let count = 0
            c.answers.forEach(v => {
                if (v.answer === v.question.answer) {
                    count += 1
                }
            })
            return p + count
        }, 0)
        answers.forEach(v => {
            if (!v.exampaper) {
                v.exampaper = message.DeletedExampapers
            }
            // 如果不可查看结果，则删除answers字段
            if (!v.exampaper.allow_view) {
                v.answers = []
            }
        })
        const total = answers.length // 总数
        const _answers = answers.slice(skip, skip + limit * 1) // 分页

        ctx.body = {
            code: 0,
            msg: message.QuerySuccess,
            data: {
                answers: _answers,
                total,
                avgScore,
                passingCount,
                questionCount,
                correctCount
            }
        }
    }

    // 获取错题
    async findWrong(ctx) {
        const ctxUser = ctx.request.user
        const { page = 1, limit = 10 } = ctx.query
        const skip = (page - 1) * limit
        const filter = {
            user: ctxUser._id
        }
        // 查询所有答卷
        const answers = await Answer
            .find(filter)
            .populate(['user', 'exampaper'])
            .sort({ _id: -1 })
        // 查找答错的题
        const wrongs = []
        let singleCount = 0
        let mutltiCount = 0
        answers.forEach(v => {
            if (!v.exampaper) {
                v.exampaper = message.DeletedExampapers
            }
            v.answers.forEach(vv => {
                if (vv.question.type !== 2 && vv.answer !== vv.question.answer) {
                    // 试卷可查看结果时，将错题放入wrongs
                    if (v.exampaper.allow_view) {
                        wrongs.push({
                            ...vv.question,
                            result: vv.answer, // 将用户的答题放入题目
                            exampaper: v.exampaper, // 将试卷信息放入题目
                        })
                    }
                    if (vv.question.type === 0) {
                        singleCount += 1
                    } else {
                        mutltiCount += 1
                    }
                }
            })
        })
        const _wrongs = wrongs.slice(skip, skip + limit * 1) // 分页
        // 处理exampaper为null的情况
        _wrongs.forEach((v, i) => {
            if (!v.exampaper) {
                v.exampaper = message.DeletedExampapers
            }
        })
        ctx.body = {
            code: 0,
            msg: message.QuerySuccess,
            data: { wrongs: _wrongs, total: wrongs.length, singleCount, mutltiCount }
        }
    }

    // 获取回答详情
    async findById(ctx) {
        const answer = await Answer
            .findById(ctx.params.id)
            .populate(['user', 'exampaper'])
        if (!answer) {
            ctx.body = { code: -1, msg: message.AnswerNotFound }
            return
        }
        if (!answer.exampaper) {
            answer.exampaper = message.DeletedExampapers
        }
        const exampaper = await Exampaper.findById(answer.exampaper._id)
        if (exampaper && !exampaper.allow_view) {
            ctx.body = { code: -1, msg: message.ResultForbidden }
            return
        }
        ctx.body = { code: 0, msg: message.QuerySuccess, data: answer }
    }

    // 创建回答
    async create(ctx) {
        // 校验参数
        ctx.verifyParams({
            exampaper: { type: 'string', required: true },
            answers: { type: 'array', required: true },
            user: { type: 'string', required: true }
        })
        const { user, exampaper, answers } = ctx.request.body
        const paper = await Exampaper.findById({ _id: exampaper })
        // 试卷不存在
        if (!paper) {
            ctx.body = { code: -1, msg: message.PaperNotFound }
            return
        }
        // 试卷不能重复作答
        if (!paper.multi_answer) {
            // 查询答卷记录
            const answer = await Answer.findOne({ exampaper, user })
            if (answer) {
                ctx.body = { code: -1, msg: message.AnswerExisted }
                return
            }
        }
        // 得分
        let score = 0
        // 查找试卷中的题目
        const questions = await Question.find({ _id: { $in: paper.questions } })
        for (let i = 0, len = questions.length; i < len; i++) {
            // 查找用户答案
            let answer = answers.find(v => v._id === questions[i]._id.toString())
            // 跳过简答题的判断
            if (questions[i].type !== 2) {
                // 如果题目的答案与回答相同，则加分
                if (questions[i].answer === answer.answer) {
                    score += 1
                }
                // 添加标志位，说明本题目已批改完毕
                answer.done = true
            }
            // 将题目保存到回答记录里，以便查看答题结果时使用
            answer.question = questions[i]
        }
        // 正确率
        const correctRate = (score / questions.length) * 100 || 0;
        // 按100分比例转换得分
        score = score * (100 / answers.length) || 0
        // 答卷批改状态
        const state = questions.some(v => v.type === 2) ? 1 : 0
        const data = {
            user,
            exampaper,
            answers,
            score,
            correctRate,
            state
        }
        const { _id } = await new Answer(data).save()
        // 统计答卷到排行榜
        await new RankingList({
            user,
            type: 'paper',
            date: Date.now(),
            count: 1
        }).save()
        // 统计答题到排行榜
        await new RankingList({
            user,
            type: 'question',
            date: Date.now(),
            count: answers.length
        }).save()
        // 返回结果
        const result = {
            score,
            id: paper.allow_view && _id || 0 // 允许查看考试结果，则返回真实ID，否则返回假的ID
        }
        ctx.body = { code: 0, msg: message.CreateSuccess, data: result }
    }

    // 删除答卷
    async delete(ctx) {
        const ctxUser = ctx.request.user
        const id = ctx.params.id
        const answer = await Answer.findById(id).populate(['user', 'exampaper'])
        console.log(answer);
        if (!answer) {
            ctx.body = { code: -1, msg: message.AnswerNotFound }
            return
        }
        answer.user = answer.user || message.DeletedUsers
        answer.exampaper = answer.exampaper || message.DeletedExampapers
        if (ctxUser._id !== answer.user._id.toString() && ctxUser.role <= answer.user.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        await Answer.findByIdAndDelete(id)
        ctx.body = { code: 0, msg: message.DeleteSuccess }
    }
}

export default new AnswerCtl()
