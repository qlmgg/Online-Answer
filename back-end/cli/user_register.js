import { readFileSync } from 'fs'
import { faker } from '@faker-js/faker'
import { basename } from 'path'
import axios from 'axios'
import minimist from 'minimist'

if (process.argv.length === 2) {
    const fileName = basename(process.argv[1])
    console.log(`
Usage:
    node ${fileName} [options]
Parameter:
    --count   注册用户数量 max: 30 min: 0
        1
        2
        3
        ...
    --role    注册用户角色 enum: 0 1 2
        0     学生
        1     教师
        2     管理员
Examples:
    node ${fileName} --role=0 --count=20
    node ${fileName} --role=1 --count=10
    node ${fileName} --role=2 --count=1
    `);
    process.exit(0)
}

const args = minimist(process.argv.slice(2))

let count = Number.parseInt(args.count) || 0
let role = [0, 1, 2][args.role] || 0

if (count > 30) {
    count = 30
}

const school = JSON.parse(readFileSync('../data/school.json', 'utf-8'))
const length = school.length

faker.locale = 'zh_CN'

for (let i = 0; i < count; i++) {

    const firstName = faker.name.firstName()
    const lastName = faker.name.lastName()
    const avatar = faker.image.avatar()
    const gender = faker.name.gender(true)
    const username = faker.internet.email(lastName, firstName)

    const user = {
        nickname: `${lastName}${firstName}`,
        username: username,
        password: username,
        gender: gender === 'Male' ? 1 : 0,
        avatar,
        role,
        school: Number(school[Math.floor(Math.random() * length)].univ_id)
    }

    axios.post('http://localhost:4000/users/register', user)
        .then(res => {
            console.log(res.data);
        }).catch(err => {
            console.log(err.message);
        })
}
