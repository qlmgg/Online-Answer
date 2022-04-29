<script setup>
import { computePaperState } from "@/utils/compute.js";
// 通过defineProps指定当前 props 类型，获得上下文的props对象
const props = defineProps({
  exam: Object,
});
const exam = reactive(props.exam);
const state = computePaperState(exam.time);
</script>

<template>
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <el-tag v-if="state === 0" size="small" type="warning"> 未开始 </el-tag>
        <el-tag v-else-if="state === 1" size="small" type="danger">
          已结束
        </el-tag>
        <el-tag v-else size="small" type="success"> 进行中 </el-tag>
        <router-link
          class="link"
          :to="`/exampaper/${exam._id}`"
          :title="exam.description"
          style="margin-left: 8px"
        >
          {{ exam.title }}
        </router-link>
      </div>
    </template>
    <div class="text item">
      <el-tag size="small" type="success" effect="plain">
        {{ ["单选题", "多选题", "简答题", "综合题"][exam.type] }}
      </el-tag>
      <el-tag size="small" type="warning" effect="plain">
        共 {{ exam.questions.length }} 题
      </el-tag>
      <el-tag size="small" type="danger" v-if="exam.strict"> 严格卷 </el-tag>
    </div>
    <div class="text item">出卷人: {{ exam.from.nickname }}</div>
    <div class="text item">
      截止日期:
      {{ new Date(exam.time[0]).toLocaleDateString() }}
      -
      {{ new Date(exam.time[1]).toLocaleDateString() }}
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
</style>