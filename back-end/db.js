/*
 * @Author: openrhc 
 * @Date: 2022-04-08 22:28:00 
 * @Last Modified by: openrhc
 * @Last Modified time: 2022-04-11 14:43:50
 */

import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Logger from './utils/logger.js'

dotenv.config('.env')

// 连接MongoDB数据库
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true })

const db = mongoose.connection;

db.on('error', err => {
    Logger.error('数据库连接失败')
    Logger.error(err)
})

db.once('open', () => {
    Logger.info('数据库连接成功')
})

export default db
