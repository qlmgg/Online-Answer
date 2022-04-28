<script setup>
import { Check, Minus, Close } from "@element-plus/icons-vue";
import QuestionCard from "@/components/QuestionCard.vue";
import { getAnswer, getPaperInfo } from "@/api/index.js";

const route = useRoute();
const router = useRouter();
const { id } = route.params;
const data = reactive({
  result: null,
});
const forbidden = ref(false);

(async () => {
  const res = await getAnswer(id);
  if (res.code !== 0) {
    forbidden.value = true;
    return;
  }
  data.result = res.data;
})();
</script>

<template>
  <el-space fill wrap v-if="data.result">
    <QuestionCard
      v-for="q in data.result.answers"
      :key="q._id"
      :question="q.question"
      :result="q.answer"
      :disabled="true"
    >
      <template #index>
        <template v-if="q.question.type !== 2">
          <el-tag v-if="q.answer === q.question.answer" type="success">
            <el-icon><check /></el-icon>
          </el-tag>
          <el-tag v-else type="danger">
            <el-icon><close /></el-icon>
          </el-tag>
        </template>
        <el-tag v-else type="warning">
          <el-icon><minus /></el-icon>
        </el-tag>
      </template>
    </QuestionCard>
  </el-space>
  <el-result
    v-if="forbidden"
    icon="error"
    title="禁止查看"
    sub-title="当前试卷禁止查看结果"
  >
    <template #extra>
      <el-button type="primary" @click="router.go(-1)">返回</el-button>
    </template>
  </el-result>
</template>