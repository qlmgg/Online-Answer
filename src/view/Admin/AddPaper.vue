<script setup>
import { ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { VueDraggableNext } from "vue-draggable-next";
import { InfoFilled, Delete, MostlyCloudy } from "@element-plus/icons-vue";
import { debounce } from "lodash";
import QuestionCard from "@/components/QuestionCard.vue";
import { getQuestions, addPaper } from "@/request/api.js";

const user = useStore().state.user;
const router = useRouter();

const step = ref(0);

// 搜索题目关键词
const keywords = ref("");
// 展示搜索界面
const showSearchQuestion = ref(false);
// 搜索题目loading
const searchLoading = ref(false);
// 搜索题目结果
const searchResults = reactive([]);

// 搜索事件
const handleSearch = debounce(async () => {
  if (!keywords.value.trim()) {
    return;
  }
  searchLoading.value = true;
  const res = await getQuestions({
    keywords: keywords.value.trim(),
    ban: false,
    _public: true,
  });
  searchLoading.value = false;
  searchResults.splice(0);
  searchResults.push(...res.data.questions);
}, 500);

// step1: 试卷基本信息
const baseinfo = reactive({
  title: "测试卷",
  description: "这是一张测试卷。",
  subject: "0",
  time: [Date.now(), Date.now() + 7 * 86400 * 1000],
  strict: false,
  allow_view: false,
  allow_comments: false,
  total_time: 3600,
  strict: false,
  multi_answer: false,
  disorder: false,
  from: user._id,
  type: 3,
});

// step2: 试卷试题
const questions = reactive([]);

// 处理子组件QuestionCard的事件
const handleAnswer = ({ question, answer }) => {
  const { _id, title, author, option, type } = question;
  const index = questions.findIndex((v) => v._id === _id);
  // 仅更改部分值
  questions[index].title = title;
  questions[index].author = author;
  questions[index].option = option;
  questions[index].type = type;
  questions[index].answer = answer;
};
// 删除试题
const handleDeleteQuestion = (i) => {
  questions.splice(i, 1);
};
// 添加试题
const handleAddQuestion = (questionOrType) => {
  if (typeof questionOrType === "object") {
    // 增加fromCloud字段，以避免后端重复创建已存在的题目
    questionOrType.fromCloud = true;
    questions.push(questionOrType);
    ElNotification({
      title: "添加成功",
      message: questionOrType.title,
      type: "success",
    });
    return;
  }
  questions.push({
    _id: Date.now(),
    title: "",
    option: ["", ""],
    answer: "",
    type: questionOrType,
    author: user._id,
  });
};
// 试题排序
const handleSort = ({ oldIndex, newIndex }) => {
  ElNotification({
    title: "排序成功",
    message: `已交换题目${oldIndex + 1}、${newIndex + 1}的顺序`,
    type: "success",
  });
};
// 提交
const handleAddPaper = async () => {
  if (questions.every((v) => v.type === 0)) {
    baseinfo.type = 0;
  } else if (questions.every((v) => v.type === 1)) {
    baseinfo.type = 1;
  } else if (questions.every((v) => v.type === 2)) {
    baseinfo.type = 2;
  }
  const res = await addPaper({ baseinfo, questions });
  if (res.code === 0) {
    ElNotification({
      title: "成功",
      message: `成功创建：${baseinfo.title}`,
      type: "success",
    });
    step.value = 3;
  } else {
    ElNotification({
      title: "失败",
      message: `创建失败：${res.msg}`,
      type: "warning",
    });
  }
};

// 下一步
const next = () => {
  if (step.value++ > 2) step.value = 3;
};
// 上一步
const prev = () => {
  if (step.value-- < 1) step.value = 0;
};
// 重置表单
const resetAll = () => {
  baseinfo.title = "";
  baseinfo.description = "";
  baseinfo.subject = "0";
  baseinfo.time = [Date.now(), Date.now() + 7 * 86400 * 1000];
  baseinfo.strict = false;
  baseinfo.allow_view = false;
  baseinfo.allow_comments = false;
  baseinfo.multi_answer = true;
  baseinfo.total_time = 3600;
  baseinfo.strict = false;
  baseinfo.disorder = false;
  baseinfo.from = user._id;
  baseinfo.type = 3;
  questions.splice(0);
  step.value = 0;
};
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-steps :active="step" finish-status="success" align-center>
        <el-step title="基本信息" />
        <el-step title="添加试题" />
        <el-step title="发布试卷" />
      </el-steps>
    </el-header>
    <el-main>
      <el-form v-show="step === 0" :model="baseinfo" label-width="120px">
        <el-space fill wrap :size="20">
          <el-card>
            <el-form-item label="试卷名称">
              <el-input v-model="baseinfo.title" />
            </el-form-item>
            <el-form-item label="试卷描述">
              <el-input v-model="baseinfo.description" />
            </el-form-item>
            <!-- <el-form-item label="学科分类">
              <el-select v-model="baseinfo.subject">
                <el-option label="计算机题" value="0" />
                <el-option label="英语题" value="1" />
              </el-select>
            </el-form-item> -->
            <el-form-item label="考试时间">
              <el-date-picker
                v-model="baseinfo.time"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              />
            </el-form-item>
            <el-form-item label="总时长(分钟)">
              <el-input-number
                v-model="baseinfo.total_time"
                :min="1"
                :max="120"
              />
            </el-form-item>
            <el-form-item label="严格模式">
              <el-switch v-model="baseinfo.strict" />
              <el-tooltip
                class="box-item"
                effect="dark"
                content="将开启摄像头、禁止切换窗口"
                placement="right-start"
              >
                <el-icon><info-filled /></el-icon>
              </el-tooltip>
            </el-form-item>
            <el-form-item label="其他">
              <el-checkbox
                label="允许多次答卷"
                v-model="baseinfo.multi_answer"
              />
              <el-checkbox
                label="乱序题目顺序与选项"
                v-model="baseinfo.disorder"
              />
              <el-checkbox label="允许查看结果" v-model="baseinfo.allow_view" />
              <el-checkbox
                label="允许评论试卷"
                v-model="baseinfo.allow_comments"
              />
            </el-form-item>
          </el-card>
          <el-card>
            <el-button
              @click="next"
              :disabled="
                !baseinfo.title ||
                !baseinfo.description ||
                !baseinfo.subject ||
                !baseinfo.time
              "
            >
              下一步
            </el-button>
          </el-card>
        </el-space>
      </el-form>
      <div v-show="step === 1">
        <el-card v-if="questions.length === 0">
          <el-empty description="题目为空，立即添加！" />
        </el-card>
        <vue-draggable-next
          ghostClass="ghost"
          :list="questions"
          handle=".index"
          @update="handleSort"
          v-bind="{
            animation: 200,
            disabled: false,
          }"
        >
          <QuestionCard
            v-for="(q, i) in questions"
            editable
            @answer="handleAnswer"
            :question="q"
            :key="q._id"
          >
            <template #index>
              <el-tag class="index">
                {{ i + 1 }}
              </el-tag>
            </template>
            <template #action>
              <el-popconfirm
                title="确定删除此题吗？"
                @confirm="handleDeleteQuestion(i)"
              >
                <template #reference>
                  <el-button
                    style="margin-left: 20px"
                    type="danger"
                    :icon="Delete"
                    circle
                  />
                </template>
              </el-popconfirm>
            </template>
          </QuestionCard>
        </vue-draggable-next>
        <el-card width="100%" class="box-card">
          <el-button @click="handleAddQuestion(0)">添加单选题</el-button>
          <el-button @click="handleAddQuestion(1)">添加多选题</el-button>
          <el-button @click="handleAddQuestion(2)">添加简答题</el-button>
          <el-button :icon="MostlyCloudy" @click="showSearchQuestion = true"
            >从题库添加</el-button
          >
        </el-card>
        <el-card>
          <el-button @click="prev">上一步</el-button>
          <el-button @click="next" :disabled="!questions.length"
            >下一步</el-button
          >
        </el-card>
      </div>
      <div v-show="step === 2">
        <el-button @click="handleAddPaper" type="primary">提交</el-button>

        <el-card>
          <el-button @click="prev">上一步</el-button>
        </el-card>
      </div>
      <div v-show="step === 3">
        <el-result icon="success" title="试卷发布成功">
          <template #extra>
            <el-button @click="resetAll" type="primary">确定</el-button>
          </template>
        </el-result>
      </div>
    </el-main>
  </el-container>
  <el-drawer
    v-model="showSearchQuestion"
    title="添加云题目"
    direction="rtl"
    size="50%"
  >
    <el-input
      v-model="keywords"
      placeholder="输入题目关键词进行搜索"
      @input="handleSearch"
    />
    <el-space fill wrap>
      <el-empty
        v-if="searchLoading || !searchResults.length"
        :description="searchLoading ? 'Loading...' : '搜索结果为空'"
      />
      <template v-else>
        <el-card
          v-for="q in searchResults"
          :key="q._id"
          @click="handleAddQuestion(q)"
        >
          <h3>{{ q.title }}</h3>
        </el-card>
      </template>
    </el-space>
  </el-drawer>
</template>

<style scoped>
.el-space {
  width: 100%;
}
.el-card {
  margin-top: 20px;
}
.ghost {
  background: var(--body-color);
}
.index {
  cursor: grab;
}
</style>