<script setup>
import { onBeforeRouteLeave } from "vue-router";
import { shuffle } from "lodash";
import * as faceapi from "face-api.js";

import { getCamera, sleep } from "@/utils/index.js";
import { getPaperInfo, getQuestions, postAnswer } from "@/api/index.js";

import QuestionCard from "@/components/QuestionCard.vue";

const route = useRoute();
const store = useStore();

const paper = reactive({
  info: null, // 试卷信息
  questions: null, // 试卷问题
  answers: [], // 考生答案
  score: null, // 得分
  answerId: 0, // 答卷ID
});
// 通过URL获取id
const { id } = route.params;
// 交卷loading
const loading = ref(false);
// 计时器
let timer = null;
let cameraTimer = null;
// 剩余时间
const remaining_time = ref(120);
// 是否包含客观题
const hasObjectiveQuestion = ref(false);
// 人脸检测相关dom
const video = ref(null);
const canvas = ref(null);
// 禁止答题
const disabled = ref(false);

// 交卷
const submit = async () => {
  for (let i = 0, len = paper.questions.length; i < len; i++) {
    if (
      !paper.answers[i] ||
      paper.answers[i].answer === "" ||
      paper.answers[i].answer === "d41d8cd98f00b204e9800998ecf8427e"
    ) {
      ElMessage({
        message: "您还有未作答的题目！",
        type: "warning",
      });
      return;
    }
  }
  loading.value = true;
  // 交卷
  try {
    const res = await postAnswer({
      exampaper: id,
      user: store.state.user._id,
      answers: paper.answers,
    });
    ElMessage({
      message: res.msg,
      type: res.code === 0 ? "success" : "error",
    });
    loading.value = false;
    paper.score = res.data.score;
    paper.answerId = res.data.id;
  } catch (e) {
    loading.value = false;
  }
  // 关闭摄像头
  releaseCamera();
  clearInterval(cameraTimer);
};

// 处理子组件QuestionCard的事件
const handleAnswer = ({ question, answer }) => {
  const { _id } = question;
  const index = paper.questions.findIndex((v) => v._id === _id);
  paper.answers[index] = { _id, answer };
};

// 格式化显示剩余时间
const formatTime = (s) => {
  const H = Math.floor(s / 3600);
  s = s - H * 3600;
  const M = Math.floor(s / 60);
  s = s - M * 60;
  const S = s;
  return `${H}h : ${M}m : ${S}s`;
};

// 关闭摄像头
const releaseCamera = () => {
  if (video.value && video.value.srcObject) {
    const tracks = video.value.srcObject.getTracks();
    tracks.forEach((v) => v.stop());
  }
};

// 路由守卫
onBeforeRouteLeave((to, from) => {
  if (paper.score !== null) {
    return true;
  }
  const msg = paper.info.multi_answer
    ? "当前答题未提交，本试卷属于【多次答题卷】，你可以随时再次答题😊！"
    : "当前答题未提交，本试卷属于【单次答题卷】，离开将无法再次答题😟！";
  // 记录当前时间戳，当用户取消后，减少相应的时间，因为confirm会阻止定时器的执行
  const s1 = Date.now();
  const answer = window.confirm(msg);
  if (!answer) {
    const s = Math.floor((Date.now() - s1) / 1000);
    remaining_time.value -= s;
    return false;
  }
});

// 离开当前页面时
onBeforeUnmount(() => {
  // 停止倒计时
  clearInterval(timer);
  clearInterval(cameraTimer);
  // 释放摄像头资源
  releaseCamera();
});

onMounted(() => {
  (async () => {
    // 查询考卷详情
    const _paper = await getPaperInfo(id);
    paper.info = _paper.data;
    remaining_time.value = paper.info.total_time * 60;
    // 如果启用严格模式
    if (paper.info.strict) {
      // 加载人脸检测 models
      await Promise.all([
        // 人脸检测
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        // 关键点检测
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        // 面部表情检测
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);
      // 等待用户开启摄像头
      while (true) {
        try {
          // 开启摄像头
          const stream = await getCamera();
          // 把摄像头的流引入video显示
          video.value.srcObject = stream;
          break;
        } catch (e) {
          ElMessage.error("本试卷启用了严格模式，请开启摄像头！" + e);
        }
        await sleep(3000);
      }
      // 口罩图片
      const mask = new Image();
      mask.src = "/imgs/mask.png";
      let maskPosition = null; // 检测到得到人脸位置
      let detectedCount = 0; // 检测到人脸的次数
      let notDetectedCount = 0; // 未检测到人脸的次数
      video.value.addEventListener("play", () => {
        // 配置显示尺寸
        const displaySize = {
          width: video.value.width,
          height: video.value.height,
        };
        faceapi.matchDimensions(canvas.value, displaySize);
        // 每 100ms 刷新一次
        cameraTimer = setInterval(async () => {
          // 识别位置, 轮廓，表情
          const detections = await faceapi
            .detectAllFaces(video.value, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks();
          // .withFaceExpressions();
          // 调整尺寸
          const resizedDetections = faceapi.resizeResults(
            detections,
            displaySize
          );
          const ctx = canvas.value.getContext("2d");
          // 清空画布
          ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
          // 将位置信息存放到maskPosition
          if (resizedDetections.length) {
            maskPosition = resizedDetections[0].landmarks.positions;
          }
          // 没有检测到人或检测到超过1个人
          if (resizedDetections.length !== 1) {
            notDetectedCount += 1;
            // 超过3S未检测到
            if (notDetectedCount > 30) {
              disabled.value = true;
              detectedCount = 0;
            }
          } else {
            detectedCount += 1;
            // 超过1S检测到
            if (detectedCount > 10) {
              disabled.value = false;
              notDetectedCount = 0;
            }
          }
          // 绘制口罩
          if (maskPosition) {
            ctx.drawImage(
              mask,
              maskPosition[2].x,
              maskPosition[28].y,
              maskPosition[14].x - maskPosition[2].x,
              maskPosition[8].y - maskPosition[28].y
            );
          }
          // faceapi.draw.drawDetections(canvas.value, resizedDetections); // 位置
          // faceapi.draw.drawFaceLandmarks(canvas.value, resizedDetections); // 轮廓
          // faceapi.draw.drawFaceExpressions(canvas.value, resizedDetections); // 表情
        }, 100);
      });
    }
    // 查询考卷题目
    const _questions = await getQuestions({ exampaper: id });
    // 判断是否需要乱序
    if (paper.info.disorder) {
      // 调用shuffle洗牌算法，将题目打乱
      _questions.data = shuffle(_questions.data);
      _questions.data.forEach((v) => {
        // 对单选题，多选题进行处理
        if (v.type === 0 || v.type === 1) {
          // 调用shuffle洗牌算法，将选项打乱
          v.option = shuffle(v.option);
        }
      });
    }
    paper.questions = _questions.data;
    // 判断是否有主观题
    hasObjectiveQuestion.value = paper.questions.some((v) => v.type === 2);
    // 开始倒计时
    timer = setInterval(() => {
      remaining_time.value -= 1;
      // 倒计时结束？
      const timeout = remaining_time.value <= 0;
      if (timeout) {
        clearInterval(timer);
        // 处理未作答题目
        for (let i = 0, len = paper.questions.length; i < len; i++) {
          if (!paper.answers[i]) {
            paper.answers[i] = { _id: paper.questions[i]._id, answer: " " };
          }
        }
        // 交卷
        submit();
      }
    }, 1000);
  })();
});
</script>

<template>
  <div class="disabled" v-show="disabled">
    <p>认真答题，请勿出屏！</p>
    <ul>
      <li>请保持光线充足，并正对摄像头</li>
    </ul>
  </div>
  <el-row
    :style="{
      filter: `blur(${disabled ? '10px' : '0px'})`,
    }"
    v-if="paper.info && paper.score === null"
  >
    <el-col :span="16" class="question">
      <div class="wrap">
        <h1>{{ paper.info.title }}</h1>
        <p>
          <span>
            题目类型：
            {{ ["单选题", "多选题", "简答题", "综合题"][paper.info.type] }}
          </span>
          <span> 题目数量：{{ paper.info.questions.length }} </span>
        </p>
        <el-alert
          v-if="
            paper.info &&
            paper.questions &&
            paper.info.questions.length !== paper.questions.length
          "
          title="当前试卷部分题目已丢失！"
          type="error"
        />
        <el-space fill wrap>
          <QuestionCard
            v-for="(q, i) in paper.questions"
            @answer="handleAnswer"
            :question="q"
            :key="q._id"
          >
            <template #index>
              <el-tag class="index">
                {{ i + 1 }}
              </el-tag>
            </template>
          </QuestionCard>
        </el-space>
      </div>
    </el-col>
    <el-col :span="8" class="overview">
      <el-affix>
        <div class="wrap">
          <el-row class="time">
            <el-col :span="12">剩余时间：</el-col>
            <el-col :span="12">{{ formatTime(remaining_time) }}</el-col>
          </el-row>
          <el-row :gutter="20" justify="start">
            <el-col :span="3" v-for="(q, i) in paper.info.questions" :key="i">
              <el-tag
                :effect="
                  paper.answers[i] &&
                  paper.answers[i].answer !== '' &&
                  paper.answers[i].answer !== 'd41d8cd98f00b204e9800998ecf8427e'
                    ? 'light'
                    : 'plain'
                "
              >
                <el-link type="primary" :href="`#${route.path}#${i}`">
                  {{ i + 1 }}
                </el-link>
              </el-tag>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-button
                :loading="loading"
                :disabled="loading"
                type="primary"
                size="large"
                style="width: 100%; margin-top: 20px"
                @click="submit"
              >
                交 卷
              </el-button>
            </el-col>
          </el-row>
        </div>
        <div
          v-if="paper.info.strict"
          class="wrap camera"
          style="margin-top: 32px"
        >
          <h3>图像采集</h3>
          <div style="position: relative">
            <video ref="video" width="320" height="256" autoplay></video>
            <canvas ref="canvas" width="320" height="256"></canvas>
          </div>
        </div>
      </el-affix>
    </el-col>
  </el-row>
  <!-- 显示答题得分 -->
  <el-row v-if="paper.score !== null">
    <el-col>
      <el-result
        icon="success"
        :title="'得分：' + paper.score.toFixed(2) + ' 分'"
        :sub-title="hasObjectiveQuestion ? '* 仅包含客观题得分' : ''"
      >
        <template #extra>
          <el-button type="primary" v-if="paper.info.allow_view">
            <router-link
              style="color: white"
              class="link"
              :to="`/result/${paper.answerId}`"
            >
              查看试卷详情
            </router-link>
          </el-button>
          <el-button type="primary" v-else disabled>
            当前试卷不可查看详情
          </el-button>
        </template>
      </el-result>
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.el-radio,
.el-checkbox {
  width: 100%;
}
.wrap {
  padding: 20px;
  background-color: var(--body-color);
  .time {
    margin-bottom: 20px;
    background-color: #fff;
    .el-col {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      color: white;
      font-size: 18px;
    }
    .el-col:nth-of-type(1) {
      font-weight: bold;
      background-color: var(--el-color-primary);
    }
    .el-col:nth-of-type(2) {
      font-weight: bold;
      color: black;
    }
  }
}
.question {
  padding: 20px;
  // background-color: red;
}
.overview {
  padding: 20px;
}
.el-space {
  margin-top: 20px;
  width: 100%;
}
.camera {
  position: relative;
  video,
  canvas {
    position: absolute;
  }
}
.disabled {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999999999999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: red;
  text-shadow: 4px 4px 4px black;
  font-size: 40px;
  background: rgba(0, 0, 0, 0.8);
  li {
    font-size: 30px;
    color: white;
  }
}
</style>