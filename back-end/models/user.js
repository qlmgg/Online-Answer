/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:27:02 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-27 12:42:59
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// User表结构
const userSchema = new Schema({
    // 用户名
    username: {
        type: String,
        required: true,
        maxlength: 20
    },
    // 密码（bcrypt算法）
    password: {
        type: String,
        required: true,
        select: false // 查询时不会返回此字段
    },
    // 昵称
    nickname: {
        type: String,
        required: true,
        maxlength: 12
    },
    // 头像
    avatar: {
        type: String,
        required: false,
        default: '',
        maxlength: 150
    },
    gender: {
        type: Number,
        required: false,
        enum: [
            0,  // 女
            1,  // 男
            2,  // 保密
        ],
        default: 2
    },
    // 用户角色
    role: {
        type: Number,
        required: false,
        enum: [
            0,  // 学生
            1,  // 教师
            2,  // 管理员
            9,  // 超级用户
        ],
        default: 0
    },
    // 封禁
    ban: {
        type: Boolean,
        required: false,
        default: false
    },
    // 学校代码
    school: {
        type: Number,
        required: true,
        maxlength: 5
    },
    // 简介
    profile: {
        type: String,
        required: false,
        default: '',
        maxlength: 500
    }
})

// 导出模型
export default model('User', userSchema)
