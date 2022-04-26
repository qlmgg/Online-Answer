// MongoDB _id转时间
export const id2time = (id) => {
    return new Date(parseInt(id.toString().substring(0, 8), 16) * 1000);
}

// 时间友好显示
export const friendlyTime = (date) => {
    const today = new Date()
    if (today.toLocaleDateString() === date.toLocaleDateString()) {
        return '今天 ' + date.toLocaleTimeString()
    }
    return date.toLocaleString()
}

// 获取用户摄像头
export const getCamera = () => {
    const errorMap = {
        'NotAllowedError': '摄像头已被禁用，请在系统设置或者浏览器设置中开启后重试',
        'AbortError': '硬件问题，导致无法访问摄像头',
        'NotFoundError': '未检测到可用摄像头',
        'NotReadableError': '操作系统上某个硬件、浏览器或者网页层面发生错误，导致无法访问摄像头',
        'OverConstrainedError': '未检测到可用摄像头',
        'SecurityError': '摄像头已被禁用，请在系统设置或者浏览器设置中开启后重试',
        'TypeError': '类型错误，未检测到可用摄像头',
        'default': '你的浏览器不支持!'
    };
    return new Promise((resolve, reject) => {
        const getUserMedia = (constrains, success, error) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // 最新标准 API
                navigator.mediaDevices.getUserMedia(constrains).then(success).catch(error)
            } else if (navigator.webkitGetUserMedia) {
                // webkit 内核浏览器
                navigator.webkitGetUserMedia(constrains).then(success).catch(error)
            } else if (navigator.mozGetUserMedia) {
                // Firefox 浏览器
                navigator.mozGetUserMedia(constrains).then(success).catch(error)
            } else if (navigator.getUserMedia) {
                // 旧版 API
                navigator.getUserMedia(constrains).then(success).catch(error)
            } else {
                error('default')
            }
        }
        getUserMedia(
            { video: { width: 800, height: 640 } },
            (stream) => resolve(stream),
            (error) => reject(errorMap[error])
        );
    })
}

// sleep函数
export const sleep = (ms) => new Promise(r => setTimeout(r, ms))