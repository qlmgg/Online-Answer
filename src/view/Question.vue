<script setup>
import { getQuestionsById } from "@/api/index.js";
import { computeAnswerIndex } from "@/utils/compute.js";

const route = useRoute();
const { id } = route.params;
const data = reactive({
  info: {
    author: {
      nickname: "",
    },
  },
});
// 多选题正确答案列表
const correctList = reactive([]);
// 单选题、简答题正确答案
const corectAnswer = ref(0);
const questionType = ref(0);

(async () => {
  const res = await getQuestionsById(id);
  if (res.code !== 0) {
    ElMessage.error(res.msg);
    return;
  }
  data.info = res.data;
  questionType.value = data.info.type;
  // 计算正确答案
  if (data.info.public) {
    const arr = computeAnswerIndex(data.info);
    if (questionType.value === 1) {
      correctList.push(...arr);
    } else {
      corectAnswer.value = arr;
    }
  }
})();
</script>

<template>
  <div class="info">
    <h1>{{ data.info.title }}</h1>
    <ul v-if="questionType === 0">
      <li
        v-for="(o, i) in data.info.option"
        :key="o"
        class="item"
        :class="{ correct: i === corectAnswer }"
      >
        {{ o }}
      </li>
    </ul>
    <ul
      v-else-if="questionType === 1"
      style="margin-top: 32px; list-style: square"
    >
      <li
        v-for="(o, i) in data.info.option"
        :key="o"
        class="item"
        :class="{ correct: i in correctList }"
      >
        {{ o }}
      </li>
    </ul>
    <textarea v-else>
      {{ corectAnswer }}
    </textarea>
    <div class="descrption">题目解析：暂无。</div>
    <div class="from">
      本题目来自用户《
      {{ data.info.author.nickname }}
      》
    </div>
  </div>
</template>

<style scoped>
.info {
  padding: 32px;
}
.item {
  font-size: 18px;
  padding: 8px;
  color: #595959;
  margin: 8px 0;
  border-radius: 8px;
}
.correct {
  color: #59c220;
}
.from {
  margin-top: 32px;
  color: #737373;
  font-size: 14px;
  text-align: right;
}
.descrption {
  padding: 32px;
  margin-top: 32px;
  color: #737373;
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>