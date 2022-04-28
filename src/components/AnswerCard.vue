<script setup>
import { id2time } from "@/utils/index.js";
const props = defineProps({
  answer: Object,
});
const answer = reactive(props.answer)
</script>

<template>
  <el-card shadow="hover" border="null">
    <template #header>
      <div class="card-header">
        <el-row>
          <el-col :span="18">
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
            <router-link
              :to="`/exampaper/${answer.exampaper._id}`"
              class="link"
            >
              {{ answer.exampaper.title }}
            </router-link>
          </el-col>
          <el-col
            :span="6"
            class="score"
            style="display: flex; justify-content: space-between"
          >
            得分：{{ answer.score.toFixed(2) }} 分
            <router-link
              v-if="answer.exampaper.allow_view"
              :to="`/result/${answer._id}`"
              class="link"
            >
              查看解析
            </router-link>
          </el-col>
        </el-row>
      </div>
    </template>
    <div class="text item">
      <el-tag :type="answer.correctRate < 60 ? 'danger' : 'success'">
        正确率: {{ answer.correctRate.toFixed(2) }} %
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