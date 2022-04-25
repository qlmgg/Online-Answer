/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:21:41 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-22 16:46:24
 */

import { readFileSync } from 'fs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import message from '../message/index.js'

const school = JSON.parse(
    readFileSync('./data/school.json', 'utf-8')
)

class UserCtl {

    // 获取用户列表
    async find(ctx) {
        // 分页查询
        const page = ctx.query.page || 1
        const keywords = ctx.query.keywords || ''
        const role = ctx.query.role || 0
        const ban = ctx.query.ban
        const gender = ctx.query.gender
        const skip = (page - 1) * 10
        // 基本查询条件
        const filter = { role }
        // 添加ban查询条件
        if (ban) {
            filter.ban = ban
        }
        // 添加gender查询条件
        if (gender) {
            filter.gender = gender
        }
        // 添加school查询条件
        if (keywords) {
            let schoolFilter = school
                // 学校名中包含关键字
                .filter(v => v.univ_name.includes(keywords))
                // 提取学校ID
                .map(v => v.univ_id)
            const reg = new RegExp(keywords, 'i')
            filter.$or = [
                { nickname: { $regex: reg } },
                { username: { $regex: reg } },
                { school: { $in: schoolFilter } }
            ]
        }
        const users = await User
            .find(filter)
            .sort({ _id: -1 })
            .skip(skip)
            .limit(10)
        // 查询符合keywords的用户总数
        const total = await User.count(filter)
        ctx.body = { code: 0, msg: message.QuerySuccess, data: { users, total } }
    }

    // 根据ID查找用户
    async findById(ctx) {
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.body = { code: -1, msg: message.UserNotFound }
            return
        }
        ctx.body = { code: 0, msg: message.QuerySuccess, data: user }
    }

    // 创建用户
    async create(ctx) {
        // 校验参数
        ctx.verifyParams({
            username: { type: 'string', required: true },
            password: { type: 'string', required: true },
            nickname: { type: 'string', required: true },
            school: { type: 'number', required: true },
        })
        const { username } = ctx.request.body
        const user = await User.findOne({ username })
        if (user) {
            ctx.body = { code: -1, msg: message.UserExisted }
            return
        }
        const _user = await new User(ctx.request.body).save()
        ctx.body = { code: 0, msg: message.CreateSuccess, data: _user }
    }

    // 更新用户信息
    async update(ctx) {
        const ctxUser = ctx.request.user
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.body = { code: -1, msg: message.UserNotFound }
            return
        }
        // 更新的是自己的数据
        if (ctxUser._id === ctx.params.id) {
            // 移除role，以防止用户提升权限
            delete ctx.request.body.role
            // 移除用户名，以防止更改用户名
            delete ctx.request.body.username
            // 移除ban，以防止用户禁掉自己
            delete ctx.request.body.ban
        }
        // 更新的是他人的数据，且权限不足
        else if (ctxUser.role <= user.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        // 更新的是他人的数据，且权限足够，但存在权限提升
        else if (ctx.request.body.role > ctxUser.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        const _user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: 1 })
        ctx.body = { code: 0, msg: message.UpdateSuccess, data: _user }
    }

    // 删除用户
    async deleteById(ctx) {
        const ctxUser = ctx.request.user
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.body = { code: -1, msg: message.UserNotFound }
            return
        }
        // 禁止删除高于自己权限的账户
        if (ctxUser.role <= user.role) {
            ctx.body = { code: -1, msg: message.PermissionDenied }
            return
        }
        await User.findByIdAndRemove(ctx.params.id)
        ctx.body = { code: 0, msg: message.DeleteSuccess, data: user }
    }

    // 删除多个用户
    async delete(ctx) {
        const ctxUser = ctx.request.user
        ctx.verifyParams({
            ids: { type: 'array', required: true }
        })
        const users = await User.deleteMany({
            $and: [
                { _id: { $in: ctx.request.body.ids } },
                { role: { $lt: ctxUser.role } }
            ]
        })
        ctx.body = { code: 0, msg: message.DeleteSuccess, data: users }
    }

    // 用户登录
    async login(ctx) {
        ctx.verifyParams({
            username: { type: 'string', required: true },
            password: { type: 'string', required: true }
        })
        const { username, password } = ctx.request.body
        const user = await User.findOne({ username, password })
        if (!user) {
            ctx.body = { code: -1, msg: message.LoginFailed }
            return
        }
        if (user.ban) {
            ctx.body = { code: -1, msg: message.UserBanned }
            return
        }
        ctx.request.body.userid = user._id.toString()
        const payload = {
            _id: user._id,
            username,
            role: user.role,
            ban: user.ban,
            nickname: user.nickname
        }
        // 生成token
        const token = jwt.sign(
            payload,
            process.env.TOKEN_SECRET,
            { expiresIn: process.env.EXPIRES_IN }
        )
        // 将token放到响应头
        ctx.set('Authorization', token)
        ctx.body = { code: 0, msg: message.LoginSuccess, data: user }
    }

    // 退出登录
    async logout(ctx) {
        ctx.body = { code: 0, msg: message.LogoutSuccess }
    }

    // 重置密码
    async resetpwd(ctx) {
        ctx.verifyParams({
            pwd: { type: 'string', required: true },
            new: { type: 'string', required: true }
        })
        const { id } = ctx.request.params
        const { pwd, new: password } = ctx.request.body
        const user = await User.findById(id).select('+password')
        if (!user) {
            ctx.body = { code: -1, msg: message.UserNotFound }
            return
        }
        if (user.password !== pwd) {
            ctx.body = { code: -1, msg: message.IncorrectPassword }
            return
        }
        await User.findByIdAndUpdate(id, { password })
        ctx.body = { code: 0, msg: message.UpdateSuccess }
    }
}

export default new UserCtl()
