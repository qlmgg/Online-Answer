<script setup>
import { id2time } from "@/utils/index.js";
const props = defineProps({
  answer: Object,
});
const { answer } = props;
// 正确数量
const correctCount = answer.answers.filter(
  (v) => v.answer === v.question.answer
).length;
// 正确率
const correctRate = (correctCount / answer.answers.length) * 100;
</script>

<template>
  <el-card shadow="hover" border="null">
    <template #header>
      <div class="card-header">
        <el-row>
          <el-col :span="20">
            <slot name="index" />
            <el-tag
              size="small"
              type="danger"
              effect="plain"
              v-if="answer.exampaper.strict"
              style="margin-right: 8px"
            >
              严格卷
            </el-tag>
            <router-link :to="`/result/${answer._id}`" class="link">
              {{ answer.exampaper.title }}
            </router-link>
          </el-col>
          <el-col :span="4" class="score">
            得分：{{ answer.score.toFixed(2) }} 分
          </el-col>
        </el-row>
      </div>
    </template>
    <div class="text item">
      <el-tag :type="correctRate < 60 ? 'danger' : 'success'">
        正确率: {{ correctRate.toFixed(2) }} %
      </el-tag>
      <el-tag size="small" type="warning" effect="plain">
        题量：{{ answer.answers.length }} 题
      </el-tag>
      <el-tag size="small" type="info" effect="plain">
        交卷时间：{{ id2time(answer._id).toLocaleString() }}
      </el-tag>
    </div>
  </el-card>
</template>

<style lang="less" scoped>
.text {
  font-size: 14px;
}
.item {
  padding: 8px;
  // margin: 8px;
  .el-tag {
    margin-right: 4px;
  }
}
.score {
  text-align: right;
  font-weight: bold;
}
</style>