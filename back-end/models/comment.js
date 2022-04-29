/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:38 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-29 12:54:41
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Comment表结构
const commentSchema = new Schema({
    // 用户
    user: {
        type: String,
        required: true,
        ref: 'User'
    },
    // 评论内容
    content: {
        type: String,
        required: true,
        maxlength: 500
    },
    // 试卷ID
    exampaperid: {
        type: String,
        required: true
    },
})

// 导出模型
export default model('Comment', commentSchema)
