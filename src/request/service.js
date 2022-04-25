import axios from 'axios'
import store from '@/store/index.js'

import { sleep } from '@/utils/index.js'

export const HOST = 'http://192.168.0.20:4000'

const service = axios.create({
    baseURL: HOST,
    timeout: 5000
})


let startTime

// 请求拦截器
service.interceptors.request.use(config => {
    // 获取token
    const token = store.state.token
    // 将token添加到请求头
    token && (config.headers.Authorization = `Bearer ${token}`)
    startTime = Date.now()
    return config
}, error => {
    console.log(error);
    return Promise.reject(error)
})

// 响应拦截器
service.interceptors.response.use(async response => {
    //获取最新的token
    const { authorization } = response.headers;
    //如果token存在则更新
    authorization && store.commit('updateToken', authorization)
    // 如果TOKEN失效
    if (response.data.code === 401) {
        ElMessage.error('您的登录已过期，请重新登录!')
        store.commit('updateUser', undefined)
        store.commit('updateToken', undefined)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }
    // 接口响应时间小于200ms则延迟返回数据，以保证不会出现界面抖动
    if (Date.now() - startTime < 200) {
        await sleep(200)
        return response.data
    } else {
        return response.data
    }
}, error => {
    console.log(error);
    ElMessage.error(error.message)
    return Promise.reject(error)
})

export default service
