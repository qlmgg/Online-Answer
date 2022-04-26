/*
 * @Author: openrhc 
 * @Date: 2022-04-26 18:10:28 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-26 18:11:54
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

const hotwordsSchema = new Schema({
    // 关键词
    keywords: {
        type: String,
        required: true
    },
    // 被搜索次数
    count: {
        type: Number,
        default: 1
    }
})

// 导出模型
export default model('HotWords', hotwordsSchema)
