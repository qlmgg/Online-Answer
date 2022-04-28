<script setup>
import { getAnswers } from "@/api/index.js";
import { reactive, ref } from "vue";
import { useStore } from "vuex";

import AnswerCard from "@/components/AnswerCard.vue";

const user = useStore().state.user;
const answers = reactive([]);
const total = ref(0);
// 平均分
const avgScore = ref(0);
// 及格试卷数
const passingCount = ref(0);
// 答题总数
const questionCount = ref(0);
// 正确数
const correctCount = ref(0);

const handlePageChange = async (page = 1) => {
  console.log(page);
  const res = await getAnswers({ page, limit: 3 });
  answers.splice(0);
  answers.push(...res.data.answers);
  total.value = res.data.total;
  avgScore.value = res.data.avgScore;
  passingCount.value = res.data.passingCount;
  questionCount.value = res.data.questionCount;
  correctCount.value = res.data.correctCount;
};

handlePageChange();
</script>

<template>
  <el-row>
    <el-col :span="6" style="padding-right: 16px">
      <el-space :size="16" wrap fill>
        <el-card shadow="hover">
          答卷及格率：
          <el-progress
            style="margin-top: 8px"
            :percentage="Number(((passingCount / total) * 100).toFixed(2)) || 0"
          />
        </el-card>
        <el-card shadow="hover">
          答题正确率：
          <el-progress
            style="margin-top: 8px"
            :percentage="
              Number(((correctCount / questionCount) * 100).toFixed(2)) || 0
            "
          />
        </el-card>
        <el-card shadow="hover">
          平均得分：
          <el-tag> {{ avgScore.toFixed(2) }} 分 </el-tag>
        </el-card>
        <el-card shadow="hover">
          答题数量：
          <el-tag> {{ questionCount }} 题 </el-tag>
        </el-card>
        <el-card shadow="hover">
          答卷数量：
          <el-tag> {{ total }} 张 </el-tag>
        </el-card>
      </el-space>
    </el-col>
    <el-col :span="18">
      <el-space fill wrap :size="32">
        <AnswerCard v-for="(a, i) in answers" :key="a._id" :answer="a">
          <template #index>
            <el-tag style="margin-right: 8px" size="small" effect="plain">
              {{ i + 1 }}
            </el-tag>
          </template>
        </AnswerCard>
      </el-space>
      <el-empty v-if="!answers.length" description="暂时没有答卷记录!" />
      <el-pagination
        layout="prev, pager, next"
        @current-change="handlePageChange"
        :total="total"
        :page-size="3"
      />
    </el-col>
  </el-row>
</template>
<style scoped>
.el-space {
  width: 100%;
}
.el-pagination {
  margin-top: 16px;
}
</style>