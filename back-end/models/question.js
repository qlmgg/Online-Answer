/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:50 
 * @Last Modified by:   openrhc 
 * @Last Modified time: 2022-04-08 22:26:50 
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Question表结构
const questionSchema = new Schema({
    // 问题
    title: {
        type: String,
        required: true,
        maxlength: 200
    },
    // 选项
    option: {
        type: Array,
        required: true
    },
    // 答案
    answer: {
        type: String,
        maxlength: 32
    },
    // 题型
    type: {
        type: Number,
        required: true,
        enum: [
            0,  // 单选题
            1,  // 多选题
            2,  // 简答题
        ]
    },
    // 作者
    author: {
        type: String,
        required: true,
        maxlength: 24,
        ref: 'User'
    },
    // 封禁
    ban: {
        type: Boolean,
        default: false
    },
    // 公开
    public: {
        type: Boolean,
        default: true
    }
})

// 导出模型
export default model('Question', questionSchema)
