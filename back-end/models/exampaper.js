/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:43 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-15 01:07:33
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Exampaper表结构
const exampaperSchema = new Schema({
    // 标题
    title: {
        type: String,
        required: true,
        maxlength: 100,
        trim: true
    },
    // 描述
    description: {
        type: String,
        required: true,
        maxlength: 500,
        trim: true
    },
    // 题型
    type: {
        type: Number,
        required: true,
        enum: [
            0,  // 纯单选题
            1,  // 纯多选题
            2,  // 纯简答题
            3,  // 综合题
        ]
    },
    // 题目集合
    questions: {
        type: Array,
        required: false,
        default: []
    },
    // 时间
    time: {
        type: Array,
        required: false
    },
    // 出卷人
    from: {
        type: String,
        required: true,
        ref: 'User' // 关联User表的ID
    },
    // 允许查看考试详情
    allow_view: {
        type: Boolean,
        required: true
    },
    // 允许评论
    allow_comments: {
        type: Boolean,
        required: true
    },
    // 多次答卷
    multi_answer: {
        type: Boolean,
        required: true
    },
    // 题目乱序
    disorder: {
        type: Boolean,
        required: true
    },
    // 答题时间
    total_time: {
        type: Number,
        required: true
    },
    // 严格模式
    strict: {
        type: Boolean,
        required: true,
        default: false
    }
})

// 导出模型
export default model('Exampaper', exampaperSchema)
