/*
 * @Author: openrhc 
 * @Date: 2022-04-17 19:54:42 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-17 19:56:22
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose

// Banner表结构
const bannerSchema = new Schema({
    // 封面URL
    cover: {
        type: String,
        required: true
    },
    // 链接
    url: {
        type: String,
        required: true
    }
})

// 导出模型
export default model('Banner', bannerSchema)
