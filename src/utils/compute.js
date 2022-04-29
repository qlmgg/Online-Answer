import md5 from "js-md5";

// 通过md5的值计算出正确答案的索引
export const computeAnswerIndex = (question) => {
    const { type, answer: str, option: arr } = question
    const len = arr.length
    if (type === 0) {
        for (let i = 0; i < len; i++) {
            if (md5(arr[i]) === str) {
                return i;
            }
        }
        return 0
    }
    else if (type === 1) {
        const res = [];
        for (let i = 0; i < len; i++) {
            const a = [arr[i]];
            res.push(a);
            for (let j = i + 1; j < len; j++) {
                const b = [...a, arr[j]];
                res.push(b);
                for (let y = j + 1; y < len; y++) {
                    const c = [...b, arr[y]];
                    res.push(c);
                    for (let z = y + 1; z < len; z++) {
                        const d = [...c, arr[z]];
                        res.push(d);
                    }
                }
            }
        }
        const len2 = res.length
        for (let i = 0; i < len2; i++) {
            if (md5(res[i].sort().join("")) === str) {
                return res[i].map(v => arr.indexOf(v))
            }
        }
        return [0, 1]
    }
    else if (type === 2) {
        return question.answer
    }
};

/**
 * 计算试卷状态
 * @param {array} time [开始时间，结束时间]
 * @returns 试卷状态：0 未开始 1 已结束 2 进行中
 */
export const computePaperState = (time = [0, 0]) => {
    const now = Date.now();
    if (now < time[0]) {
        return 0;
    } else if (now > time[1]) {
        return 1
    }
    return 2
}