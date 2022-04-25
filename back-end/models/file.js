/*
 * @Author: openrhc 
 * @Date: 2022-04-14 20:38:35 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-14 21:42:14
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// File表结构
const fileSchema = new Schema({
    url: {
        type: String,
        required: true
    },
    type: {
        type: Number,
        enum: [
            0, // Avatar
            1, // Banner
        ],
        required: true
    }
})

// 导出模型
export default model('File', fileSchema)
