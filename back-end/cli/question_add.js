import { basename } from 'path'
import axios from 'axios'
import fs, { readFileSync } from 'fs'
import md5 from 'js-md5'
import minimist from 'minimist'

if (process.argv.length === 2) {
    const fileName = basename(process.argv[1])
    console.log(`
Usage:
    node ${fileName} [option]
Parameter:
    --file  添加来自文件的题目
Examples:
    node ${fileName} --file=./data/questions_danxuan.json
    node ${fileName} --file=./data/questions_duoxuan.json
    `);
    process.exit(0)
}

const args = minimist(process.argv.slice(2))

let file = args.file
let fileContent = ''
try {
    fileContent = JSON.parse(readFileSync(file, 'utf-8'))
} catch (e) {
    console.log('\n题目文件解析错误：');
    console.log(e.message);
    console.log('\n解决办法：\n  1. 确保文件存在\n  2. 确保文件格式为json');
    process.exit(-1)
}

// 处理题目
fileContent.forEach(v => {
    const type = typeof v.answer === 'string'
        ? 2 : typeof v.answer === 'number' ? 0 : 1
    if (type === 0) {
        v.answer = md5(v.option[v.answer])
    } else if (type === 1) {
        const arr = v.option.filter((vv, i) => v.answer.includes(i))
        v.answer = md5(arr.sort().join(''))
    }
    v.public = true
    v.type = type
})

// 登录admin账户
const r1 = await axios.post('http://localhost:4000/users/login', { username: 'admin', password: 'admin' })
const token = r1.headers.authorization
// 获取教师列表
const r2 = await axios.get('http://localhost:4000/users?role=1', { headers: { Authorization: 'Bearer ' + token } })
const teachers = r2.data.data.users
const teachers_len = teachers.length

const count = fileContent.length
try {
    for (let i = 0; i < count; i++) {
        fileContent[i].author = teachers[Math.floor(Math.random() * teachers_len)]._id
        const res = await axios.post('http://localhost:4000/questions', {
            ...fileContent[i]
        }, { headers: { Authorization: 'Bearer ' + token } })
        console.log(res.data);
    }

} catch (e) {
    console.log(e.message);
}
