/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:06:58 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-08 16:38:12
 */

import Comment from '../models/comment.js'
import Exampaper from '../models/exampaper.js'
import message from '../message/index.js'

class CommentCtl {

    // 查询评论
    async find(ctx) {
        const id = ctx.params.id
        // 分页获取评论
        const page = ctx.query.page || 1
        const skip = (page - 1) * 8
        const comments = await Comment
            .find({ exampaperid: id })
            .sort({ _id: -1 })
            .skip(skip)
            .limit(8)
            .populate('user')
        // 查询评论总数
        const total = await Comment.count({ exampaperid: id })
        ctx.body = { code: 0, msg: message.QuerySuccess, data: { comments, total } }
    }

    // 创建评论
    async create(ctx) {
        ctx.verifyParams({
            user: { type: 'string', required: true },
            content: { type: 'string', required: true },
            exampaperid: { type: 'string', required: true }
        })
        const { exampaperid } = ctx.request.body
        const paper = await Exampaper.findById(exampaperid)
        if (!paper) {
            ctx.body = { code: -1, msg: message.PaperNotFound }
            return
        }
        const comment = await new Comment(ctx.request.body).save()
        ctx.body = { code: 0, msg: message.CommentSuccess, data: comment }
    }

    // 删除评论
    async deleteById(ctx) {
        const { id: _id } = ctx.params
        const comment = await Comment.findOne({ _id }).populate('user')
        if (!comment) {
            ctx.body = { code: -1, msg: message.CommentNotFound }
            return
        }
        comment.user = comment.user || message.DeletedUsers
        const ctxUser = ctx.request.user
        // 删除的不是自己的评论，且操作用户不是管理员
        if (ctxUser._id !== comment.user._id.toString() && ctxUser.role < comment.user.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        await Comment.findOneAndDelete({ _id })
        ctx.body = { code: 0, msg: message.DeleteSuccess }
    }
}

export default new CommentCtl()
