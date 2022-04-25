/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:26:54 
 * @Last Modified by:   openrhc 
 * @Last Modified time: 2022-04-08 22:26:54 
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Status表结构
const statusSchema = new Schema({
    // 接口名
    name: {
        type: String,
        required: true
    },
    // 接口今日请求次数
    today: {
        type: Number,
        required: true
    },
    // 接口请求总次数
    total: {
        type: Number,
        required: true
    }
})

// 导出模型
export default model('Status', statusSchema)
