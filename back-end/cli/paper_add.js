import { basename } from 'path'
import axios from 'axios'
import md5 from 'js-md5'
import minimist from 'minimist'

if (process.argv.length === 2) {
    const fileName = basename(process.argv[1])
    console.log(`
Usage:
    node ${fileName} [options]
Parameter:
    --count   添加试卷数量 range: 0 30
        1
        2
        3
        ...
    --strict  设置为严格卷
    --max     题目最大数量 max: 30
    --min     题目最小数量 min: 1
Examples:
    node ${fileName} --count=1 --max=10 --min=5
    node ${fileName} --strict --count=1 --max=10 --min=5
    `);
    process.exit(0)
}

const args = minimist(process.argv.slice(2))

let count = Number.parseInt(args.count) || 0
const strict = args.strict && true || false
let max = Number.parseInt(args.max) || 30
let min = Number.parseInt(args.min) || 1


if (count > 30) {
    count = 30
}
if (max > 30) {
    max = 30
}
if (min < 1) {
    min = 1
}
if (max < 1) {
    max = 1
}
if (min > max) {
    min = max
}

const area = [
    "河北省", "山西省", "辽宁省", "吉林省", "黑龙江省", "江苏省", "浙江省", "安徽省", "福建省", "江西省", "山东省", "河南省", "湖北省", "湖南省", "广东省", "海南省", "四川省", "贵州省", "云南省", "陕西省", "甘肃省", "青海省", "台湾省", "内蒙古自治区", "广西壮族自治区", "西藏自治区", "宁夏回族自治区", "新疆维吾尔自治区", "北京市", "天津市", "上海市", "重庆市", "香港特别行政区", "澳门特别行政区"
]
const len = area.length;
// 登录admin账户
const r1 = await axios.post('http://localhost:4000/users/login', { username: 'admin', password: md5('admin') })
const token = r1.headers.authorization
// 获取教师列表
const r2 = await axios.get('http://localhost:4000/users?role=1', { headers: { Authorization: 'Bearer ' + token } })
const teachers = r2.data.data.users
const teachers_len = teachers.length
// 获取题目集合
const res = await axios.get('http://localhost:4000/questions?limit=' + count * max, { headers: { Authorization: 'Bearer ' + token } })
const questions = res.data.data.questions
const questions_len = questions.length
for (let i = 0; i < count; i++) {
    // 试卷随机属性
    const data = {
        description: '随机生成的试卷',
        allow_view: Math.random() >= 0.5,
        allow_comments: Math.random() >= 0.5,
        multi_answer: Math.random() >= 0.5,
        disorder: Math.random() >= 0.5,
        total_time: Math.floor(Math.random() * (120 - 5 + 1) + 5),
        strict,
        time: [Date.now(), Date.now() + 7 * 86400 * 1000],
        type: 3,
    }
    // 取试卷名
    data.title = area[Math.round(Math.random() * len)] + Math.floor(Math.random() * 24 + 1999) + '年考卷'
    // 取出卷人
    data.from = teachers[Math.floor(Math.random() * teachers_len)]._id

    // 取试卷题目数量
    const paper_questions_len = parseInt(Math.random() * (max - min + 1) + min)
    // 添加题目到试卷
    const _questions = []
    for (let j = 0; j < paper_questions_len; j++) {
        const t = questions[
            Math.floor(
                Math.random() * questions_len
            )
        ]
        // 已添加过
        if (_questions.find(v => v._id === t._id)) {
            continue
        }
        _questions.push(
            {
                fromCloud: true,
                ...t
            }
        )
    }
    // 判断试卷类型
    if (_questions.every((v) => v.type === 0)) {
        data.type = 0;
    } else if (_questions.every((v) => v.type === 1)) {
        data.type = 1;
    } else if (_questions.every((v) => v.type === 2)) {
        data.type = 2;
    }

    const res = await axios.post('http://localhost:4000/papers', {
        baseinfo: data,
        questions: _questions
    }, { headers: { Authorization: 'Bearer ' + token } })
    console.log(res.data);
}
