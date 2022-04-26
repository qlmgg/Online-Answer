import request from './service.js'

// 获取考卷
export const getPapers = ({ page = 1, from = '', limit = 8, keywords = '' }) => request.get(`/papers?page=${page}&from=${from}&limit=${limit}&keywords=${keywords}`)

// 删除考卷
export const deletePaper = (id = '') => request.delete(`/papers/${id}`)

// 更新考卷
export const updatePaper = (data = {}) => request.put(`/papers/${id}`, data)

// 添加考卷
export const addPaper = (data = {}) => request.post(`/papers`, data)

// 试卷详情
export const getPaperInfo = (id = '') => request.get(`/papers/${id}`)

// 获取评论
export const getComments = ({ id, page = 1 }) => request.get(`/comments/${id}?page=${page}`)

// 添加评论
export const postComment = (data = {}) => request.post(`/comments`, data)

// 删除评论
export const deleteComment = (id = '') => request.delete(`/comments/${id}`)

// 获取题目详情
export const getQuestionsById = (id) => request.get(`/questions/${id}`)

// 获取所有题目
export const getQuestions = ({ keywords = '', _public = true, ban = false, page = 1, limit = 10, type = "", exampaper = "" }) => request.get(`/questions?keywords=${keywords}&ban=${ban}&public=${_public}&page=${page}&limit=${limit}&type=${type}&exampaper=${exampaper}`)

// 添加题目
export const postQuestion = (data = {}) => request.post(`/questions`, data)

// 删除题目
export const deleteQuestion = (id = '') => request.delete(`/questions/${id}`)

// 更新题目
export const updateQuestion = ({ id = '', data = {} }) => request.put(`/questions/${id}`, data)

// 用户登录
export const login = (data = {}) => request.post('/users/login', data)

// 退出登录
export const logout = () => request.delete('/users/logout')

// 用户注册
export const register = (data = {}) => request.post('/users/register', data)

// 获取答卷记录
export const getAnswers = ({ exampaper = '', page = 1, limit = 10 }) => request.get(`/answers?exampaper=${exampaper}&page=${page}&limit=${limit}`)

// 获取错题
export const getWrongs = ({ page = 1, limit = 10 }) => request.get(`/answers/wrongs?page=${page}&limit=${limit}`)

// 获取答卷详情
export const getAnswer = (id = '') => request.get(`/answers/${id}`)

// 提交试卷
export const postAnswer = (data = {}) => request.post('/answers', data)

// 获取所有用户
export const getUsers = ({ page = 1, keywords = '', role = 0, ban = false, gender = '' }) => request.get(`/users?page=${page}&keywords=${keywords}&role=${role}&ban=${ban}&gender=${gender}`)

// 删除用户
export const deleteUser = (id = '') => request.delete(`/users/${id}`)

// 批量删除用户
export const deleteUsers = (ids = []) => request.post('/users/delete', { ids })

// 更新用户
export const updateUser = ({ id = '', data = {} }) => request.put(`/users/${id}`, data)

// 更新密码
export const updatePwd = ({ id = '', data = {} }) => request.put(`/users/password/${id}`, data)

// 状态统计
export const getStatus = () => request.get('/status')

// 获取Banner
export const getBanner = () => request.get('/banners')

// 创建Banner
export const postBanner = (data) => request.post('/banners', data)

// 更新Banner
export const updateBanner = ({ id = '', data = {} }) => request.put(`/banners/${id}`, data)

// 删除Banner
export const deleteBanner = (id = '') => request.delete(`/banners/${id}`)

// 热词
export const getHotWords = () => request.get('/hotwords')

// 搜索
export const search = ({ keywords = '', type = 0, limit = 10, page = 1 } = {}) => request.get(`/hotwords/search?keywords=${keywords}&type=${type}&page=${page}&limit=${limit}`)
