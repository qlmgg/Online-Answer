/*
 * @Author: openrhc 
 * @Date: 2022-04-26 22:48:18 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-27 15:30:44
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// RankingList表结构
const rankinglistSchema = new Schema({
    // 日期
    date: {
        type: Number,
        default: Date.now
    },
    // 类型
    type: {
        type: String,
        required: true,
        enum: [
            'paper', // 回答试卷
            'question', // 回答题目
        ],
    },
    // 用户
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    // 次数
    count: {
        type: Number,
        required: true,
        default: 1
    }
})

// 导出模型
export default model('RankingList', rankinglistSchema)
