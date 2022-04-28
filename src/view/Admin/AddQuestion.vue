<script setup>
import { QuestionFilled } from "@element-plus/icons-vue";
import QuestionCard from "@/components/QuestionCard.vue";
import { postQuestion } from "@/api/index.js";

const user = useStore().state.user;

// 题型
const type = ref(0);
// Question组件的key值，每次更改+1，以重新渲染组件
const index = ref(0);

const question = reactive({
  _id: Date.now(),
  title: "",
  option: ["", "", "", ""],
  answer: "",
  type: 0,
  author: user._id,
  ban: false,
  public: true,
});

// 切换题型事件
const handleChange = () => {
  question.type = type.value;
  index.value += 1;
  console.log("change");
};

// 处理子组件QuestionCard的事件
const handleAnswer = ({ question: _question, answer }) => {
  const { _id, title, author, option, type } = _question;
  // 仅更改部分值
  question.title = title;
  question.option = option;
  question.answer = answer;
};

// 重置表单
const resetForm = () => {
  question._id = Date.now();
  question.title = "";
  question.option = ["", "", "", ""];
  question.answer = "";
  // question.type = 0;
  index.value += 1;
};

// 提交
const submit = async () => {
  if (type.value === 0 || type.value === 1) {
    const empty = question.option.some((v) => v.trim().length === 0);
    if (empty) {
      ElNotification({
        title: "提示",
        message: "请完整填写选项",
        type: "warning",
      });
      return;
    }
  }
  if (
    question.answer === "d41d8cd98f00b204e9800998ecf8427e" ||
    question.answer === ""
  ) {
    ElNotification({
      title: "提示",
      message: "请填写正确答案",
      type: "warning",
    });
    return;
  }
  const res = await postQuestion({
    title: question.title,
    answer: question.answer,
    option: question.option,
    type: question.type,
    author: question.author,
    public: question.public,
  });
  if (res.code === 0) {
    resetForm();
    ElNotification({
      title: "创建成功",
      message: "题目创建成功",
      type: "success",
    });
  } else {
    ElNotification({
      title: "创建失败",
      message: "原因：" + res.msg,
      type: "warning",
    });
  }
};
</script>

<template>
  <el-container>
    <el-main>
      <el-space fill wrap :size="20">
        <el-card class="base">
          <el-row>
            <h2>题目属性</h2>
          </el-row>
          <el-row>
            <el-col :span="12">
              <span>题目类型</span>
              <el-radio-group
                v-model="type"
                size="large"
                @change="handleChange"
              >
                <el-radio :label="0" size="large">单选题</el-radio>
                <el-radio :label="1" size="large">多选题</el-radio>
                <el-radio :label="2" size="large">简答题</el-radio>
              </el-radio-group>
            </el-col>
            <el-col :span="12">
              <span>公开题目</span>
              <el-switch v-model="question.public"></el-switch>
              <el-tooltip
                effect="light"
                content="能够被搜索并查看题目解析，若此试题被用作考试，请勿打开此项！"
                placement="top"
              >
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-card>
        <QuestionCard
          editable
          @answer="handleAnswer"
          :question="question"
          :key="index"
        >
        </QuestionCard>
        <el-card>
          <el-button type="primary" @click="submit" :disabled="!question.title">
            添加
          </el-button>
        </el-card>
      </el-space>
    </el-main>
  </el-container>
</template>

<style scoped lang="less">
.base {
  .el-col {
    display: flex;
    align-items: center;
    .el-switch,
    .el-radio-group {
      margin: 0 16px;
    }
  }
}
</style>