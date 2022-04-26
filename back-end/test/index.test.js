import supertest from 'supertest'
import chai from 'chai'
import app from '../index.js'

const expect = chai.expect
const request = supertest(app.listen())

// TODO: 若干测试
