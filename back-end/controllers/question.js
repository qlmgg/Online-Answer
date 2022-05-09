/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:17:30 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-08 15:34:22
 */

import Question from '../models/question.js'
import Exampaper from '../models/exampaper.js'
import message from '../message/index.js'

class QuestionCtl {

    // 获取题目列表
    async find(ctx) {
        // 分页查询
        const {
            page = 1,
            limit = 8,
            keywords = "",
            type = "",
            ban = "",
            public: _public,
            exampaper = "",
            selfid = ''
        } = ctx.query
        // 如果传入试卷ID，则返回试卷包含的试题
        if (exampaper) {
            const paper = await Exampaper.findById(exampaper)
            if (!paper) {
                ctx.body = { code: -1, msg: message.PaperNotFound }
                return
            }
            // 查询试卷中包含的题目，同时不查询answer字段
            const data = await Question.find({ _id: { $in: paper.questions } }, { answer: 0 })
            ctx.body = { code: 0, msg: message.QuerySuccess, data }
            return
        }
        const skip = (page - 1) * limit
        const filter = {}
        if (ban) { filter.ban = ban }
        if (_public) { filter.public = _public }
        if (type) { filter.type = type }
        if (keywords) {
            const reg = new RegExp(keywords, 'i')
            filter.$or = [
                { title: { $regex: reg } }
            ]
        }
        let questions = await Question
            .find(filter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author')
        questions.forEach(v => {
            v.author = v.author || message.DeletedUsers
            if (!v.public) {
                v.answer = ''
            }
        })
        // 角色为教师过滤出属于自己的题目
        if (selfid) {
            questions = questions.filter(v => {
                return v.author._id.toString() === selfid
            })
        }
        // 查询题目总数
        const total = await Question.find(filter).count()
        ctx.body = { code: 0, msg: message.QuerySuccess, data: { questions, total } }
    }

    // 查询题目详情
    async findById(ctx) {
        const { id } = ctx.params
        const data = await Question
            .findById(id)
            .populate('author')
        if (!data) {
            ctx.body = { code: -1, msg: message.QuestionNotFound }
            return
        }
        // 题目不公开则删除正确答案字段
        if (!data.public) {
            data.answer = ''
        }
        ctx.body = { code: 0, msg: message.QuerySuccess, data }
    }

    // 创建题目
    async create(ctx) {
        // 校验参数
        ctx.verifyParams({
            title: { type: 'string', required: true, },
            option: { type: 'array', required: true },
            answer: { type: 'string', required: true },
            type: { type: 'number', required: true },
            author: { type: 'string', required: true },
            public: { type: 'boolean', required: true },
        })
        const { title } = ctx.request.body
        const exist = await Question.findOne({ title })
        if (exist) {
            ctx.body = { code: -1, msg: message.QuestionExisted }
            return
        }
        const exampaper = await new Question(ctx.request.body).save()
        ctx.body = { code: 0, msg: message.CreateSuccess, data: exampaper }
    }

    // 更新题目信息
    async update(ctx) {
        const ctxUser = ctx.request.user
        const id = ctx.params.id
        const question = await Question.findById(id).populate('author')
        if (!question) {
            ctx.body = { code: -1, msg: message.QuestionNotFound }
            return
        }
        question.author = question.author || message.DeletedUsers
        if (ctxUser._id !== question.author._id.toString() && ctxUser.role <= question.author.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        const newQuestion = await Question.findByIdAndUpdate(id, ctx.request.body, { new: 1 })
        ctx.body = { code: 0, msg: message.UpdateSuccess, data: newQuestion }
    }

    // 删除题目
    async deleteById(ctx) {
        const ctxUser = ctx.request.user
        const question = await Question.findById(ctx.params.id).populate('author')
        if (!question) {
            ctx.body = { code: -1, msg: message.QuestionNotFound }
            return
        }
        question.author = question.author || message.DeletedUsers
        if (ctxUser._id !== question.author._id.toString() && ctxUser.role <= question.author.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        await Question.findByIdAndRemove(ctx.params.id)
        ctx.body = { code: 0, msg: message.DeleteSuccess, data: question }
    }

}

export default new QuestionCtl()
