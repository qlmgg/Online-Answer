/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:33 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-05-07 18:17:57
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Answer表结构
const answerSchema = new Schema({
    // 所属用户
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    // 试卷ID
    exampaper: {
        type: String,
        required: true,
        ref: 'Exampaper'
    },
    // 答案
    answers: {
        type: Array,
        required: true
    },
    // 得分
    score: {
        type: Number,
        required: true
    },
    // 正确率
    correctRate: {
        type: Number,
        required: true
    },
    // 试卷状态
    state: {
        type: Number,
        required: false,
        enum: [
            0, // 批改完毕
            1, // 未批改简答题
        ]
    }
})

// 导出模型
export default model('Answer', answerSchema)
