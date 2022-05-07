/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:15:50 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-07 18:09:54
 */

import Exampaper from '../models/exampaper.js'
import Question from '../models/question.js'
import message from '../message/index.js'

class ExampaperCtl {
    // 获取试卷列表
    async find(ctx) {
        const {
            page = 1,
            limit = 8,
            from = '',
            selfid = '',
            keywords = '',
            state = '',
        } = ctx.query
        const skip = (page - 1) * limit
        const filter = {}
        if (keywords) {
            filter.$or = [
                { title: { $regex: new RegExp(keywords, 'i') } }
            ]
        }
        let exampaper = await Exampaper
            .find(filter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            // 查询中的from字段用User表替换
            .populate('from')

        exampaper.forEach(v => {
            v.from = v.from ? v.from : message.DeletedUsers
        })
        // 过滤试卷状态
        if (state) {
            const time = Date.now()
            exampaper = exampaper.filter(v => {
                return (
                    state === '1'
                        ? time < v.time[0]
                        : state === '2'
                            ? time > v.time[1]
                            : state === '3'
                                ? time > v.time[0] && time < v.time[1]
                                : false
                )
            })
        }
        // 过滤试卷所属人
        if (from) {
            exampaper = exampaper.filter(v => {
                return (
                    from === 'own'
                        ? v.from._id.toString() === selfid
                        : v.from._id.toString() !== selfid
                )
            })
        }
        // 查询试卷总数
        let total = 0
        if (!state) {
            total = await Exampaper.find(filter).count()
        } else {
            total = exampaper.length
        }
        // 计算总页数
        const pageCount = Math.ceil(total / limit)
        ctx.body = {
            code: 0, msg: message.QuerySuccess, data: { exampaper, pageCount }
        }
    }

    // 根据ID查找试卷
    async findById(ctx) {
        const exampaper = await Exampaper.findById(ctx.params.id).populate('from')
        if (!exampaper) {
            ctx.body = { code: -1, msg: message.PaperNotFound }
            return
        }
        exampaper.from = exampaper.from || message.DeletedUsers
        ctx.body = { code: 0, msg: message.QuerySuccess, data: exampaper }
    }

    // 创建试卷
    async create(ctx) {
        // 校验参数
        ctx.verifyParams({
            baseinfo: { type: 'object', required: true },
            questions: { type: 'object', required: true }
        })
        const { baseinfo, questions } = ctx.request.body
        if (questions.length === 0) {
            ctx.body = { code: -1, msg: message.QuestionsCannotBeEmpty }
            return
        }
        // 1. 创建题目，获取题目的真实ID
        const questions_id = []
        for (let i = 0, len = questions.length; i < len; i++) {
            // 从云端添加的题目，跳过创建，直接添加
            if (questions[i].fromCloud) {
                questions_id.push(questions[i]._id)
                continue
            }
            // 删除客户端生成的临时ID
            delete questions[i]._id
            const { _id } = await new Question(questions[i]).save()
            questions_id.push(_id)
        }
        // 2. 提交试卷
        baseinfo.questions = questions_id
        const exampaper = await new Exampaper(baseinfo).save()
        ctx.body = { code: 0, msg: message.CreateSuccess, data: exampaper }
    }

    // 更新试卷信息
    async update(ctx) {
        const exampaper = await Exampaper.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if (!exampaper) {
            ctx.body = { code: -1, msg: message.PaperNotFound }
            return
        }
        ctx.body = { code: 0, msg: message.UpdateSuccess, data: exampaper }
    }

    // 删除试卷
    async deleteById(ctx) {
        const id = ctx.params.id
        const ctxUser = ctx.request.user
        const exampaper = await Exampaper.findById(id).populate('from')
        exampaper.from = exampaper.from || { _id: 0, role: 0 }
        if (!exampaper) {
            ctx.body = { code: -1, msg: message.PaperNotFound }
            return
        }
        // 删除的是他人试卷，且权限不足
        if (ctxUser._id !== exampaper.from._id.toString() && ctxUser.role <= exampaper.from.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        await Exampaper.findByIdAndRemove(id)
        ctx.body = { code: 0, msg: message.DeleteSuccess, data: exampaper }
    }
}

export default new ExampaperCtl()
