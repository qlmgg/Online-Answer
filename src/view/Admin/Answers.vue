<script setup>
import { getAnswers, deleteAnswer, updateAnswer } from "@/api/index.js";
import { debounce } from "lodash";
import { onBeforeUnmount } from "vue";

const user = useStore().state.user;

// 搜索过滤器
const filter = reactive({
  keywords: "",
  page: 1,
  limit: 10,
  state: "",
  score: "",
});
// 答卷总数
const total = ref(0);
// 答卷列表
const answers = reactive([]);
// 加载中
const loading = ref(true);
// 显示编辑答卷界面
const showEditView = ref(false);
// 正在批阅的试卷信息
const editAnswerInfo = reactive({
  info: null,
});

// 获取答卷列表
const handleGetAnswers = async () => {
  loading.value = true;
  const res = await getAnswers(filter);
  loading.value = false;
  if (res.code !== 0) {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
      position: "top-left",
    });
    return;
  }
  answers.splice(0);
  answers.push(...res.data.answers);
  total.value = res.data.total;
};

// 确认删除答卷事件
const handleDeletePaper = async (index, { _id }) => {
  const res = await deleteAnswer(_id);
  if (res.code === 0) {
    answers.splice(index, 1);
  }
  ElNotification({
    title: "提示",
    message: res.msg,
    type: res.code === 0 ? "success" : "warning",
    position: "top-left",
  });
};

// 编辑答卷事件
const handleCorrecting = async (index, answer) => {
  showEditView.value = true;
  editAnswerInfo.info = answer;
  // 过滤出简答题
  editAnswerInfo.info.shortAnswers = answer.answers
    .filter((v) => v.question.type === 2 && !v.done)
    .map((v) => {
      return {
        ...v,
        correct: false, // 是否回答正确
      };
    });
  // 计算简答题得分
  editAnswerInfo.info.shortScore = computed(() => {
    const answersLength = editAnswerInfo.info.answers.length;
    const correntLength = editAnswerInfo.info.shortAnswers.filter((v) => v.correct).length;
    return (100 / answersLength) * correntLength;
  });
};

// 保存答卷修改
const handleUpdateAnswer = async () => {
  const { _id, shortAnswers, shortScore } = editAnswerInfo.info;
  const shortResult = shortAnswers.map((v) => {
    return {
      _id: v._id,
      correct: v.correct,
    };
  });
  const res = await updateAnswer(_id, { shortResult, shortScore });
  if (res.code === 0) {
    const { answers, correctRate, score, state } = res.data;
    editAnswerInfo.info.answers = answers;
    editAnswerInfo.info.score = score;
    editAnswerInfo.info.correctRate = correctRate;
    editAnswerInfo.info.state = state;
    showEditView.value = false;
  }
  ElNotification({
    title: "提示",
    message: res.msg,
    type: res.code === 0 ? "success" : "warning",
    position: "top-left",
  });
};

// 重置搜索条件
const handleResetFilter = () => {
  filter.keywords = "";
  filter.page = 1;
  filter.limit = 10;
  filter.state = "";
  filter.score = "";
  handleGetAnswers();
};

// 搜索事件
const handleSearch = debounce(() => {
  handleGetAnswers();
}, 1000);

// 点击翻页事件
const handleChange = (page) => {
  filter.page = page;
  handleGetAnswers();
};

// 键盘翻页事件
const handleKeyUp = (e) => {
  if (e.key === "ArrowRight") {
    filter.page = filter.page < pageCount.value ? filter.page + 1 : pageCount.value;
    handleSearch();
  } else if (e.key === "ArrowLeft") {
    filter.page = filter.page > 1 ? filter.page - 1 : 1;
    handleSearch();
  }
};
onMounted(() => {
  window.addEventListener("keyup", handleKeyUp);
});
onBeforeUnmount(() => {
  window.removeEventListener("keyup", handleKeyUp);
});

handleGetAnswers();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-row>
        <el-col :span="6">
          状态:
          <el-select v-model="filter.state" @change="handleGetAnswers">
            <el-option label="全部" value="" />
            <el-option label="已批改" :value="0" />
            <el-option label="未批改" :value="1" />
          </el-select>
        </el-col>
        <el-col :span="6">
          分数:
          <el-select v-model="filter.score" @change="handleGetAnswers">
            <el-option label="全部" value="" />
            <el-option label="及格" value="1" />
            <el-option label="未及格" value="2" />
          </el-select>
        </el-col>
        <el-col :span="10">
          <el-input
            v-model="filter.keywords"
            placeholder="键入关键词以搜索答卷，例如：答卷名、答卷人"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="2">
          <el-button style="margin-left: 4px" @click="handleResetFilter"> 重置 </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-scrollbar>
        <el-table stripe :data="answers" v-loading="loading">
          <el-table-column prop="exampaper" label="试卷">
            <template #default="scope">
              <router-link :to="`/exampaper/${scope.row.exampaper._id}`" class="link">
                {{ scope.row.exampaper.title }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="user.nickname" label="答卷人" />
          <el-table-column prop="score" label="分数" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.score >= 60 ? 'success' : 'danger'">
                {{ scope.row.score.toFixed(2) }} 分
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="correctRate" label="正确率" width="90">
            <template #default="scope">
              <el-tag :type="scope.row.correctRate >= 60 ? 'success' : 'danger'">
                {{ scope.row.correctRate.toFixed(2) }} %
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="state" label="答卷状态" width="120">
            <template #default="scope">
              <el-tag :type="['success', 'warning'][scope.row.state]">
                {{ ["已批改", "待批改"][scope.row.state] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small">
                <router-link :to="`/Result/${scope.row._id}`" class="link"> 查看 </router-link>
              </el-button>
              <el-button
                size="small"
                type="primary"
                :disabled="scope.row.state === 0"
                @click="handleCorrecting(scope.$index, scope.row)"
              >
                批卷
              </el-button>
              <el-popconfirm
                title="你确定要删除这个答卷吗？"
                v-if="scope.row.user.role < user.role || scope.row.user._id === user._id"
                @confirm="handleDeletePaper(scope.$index, scope.row)"
              >
                <template #reference>
                  <el-button size="small" type="danger"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-main>

    <el-pagination
      :page-size="10"
      :total="total"
      v-model:current-page="filter.page"
      layout="prev, pager, next, jumper"
      background
      @current-change="handleChange"
    />
  </el-container>
  <el-dialog v-model="showEditView" title="批改试卷" :close-on-click-modal="false">
    <template v-if="editAnswerInfo.info">
      <div>
        答题人：
        <el-tag size="small">
          {{ editAnswerInfo.info.user.nickname }}
        </el-tag>
        试卷：
        <el-tag size="small">
          {{ editAnswerInfo.info.exampaper.title }}
        </el-tag>
        选择题得分：
        <el-tag size="small"> {{ editAnswerInfo.info.score.toFixed(2) }} 分 </el-tag>
        简答题得分：
        <el-tag size="small"> {{ editAnswerInfo.info.shortScore }} 分 </el-tag>
      </div>
      <ul class="short">
        <li v-for="(s, i) in editAnswerInfo.info.shortAnswers" :key="s._id">
          <div class="title">{{ s.question.title }}</div>
          <div class="answer">回答：{{ s.answer }}</div>
          <div class="correct">参考答案：{{ s.question.answer }}</div>
          <el-row class="action" justify="end">
            <el-col align="middle" :span="6">
              请批阅：
              <el-switch
                v-model="s.correct"
                class="ml-2"
                inline-prompt
                active-color="#13ce66"
                inactive-color="#ff4949"
                active-text="对"
                inactive-text="错"
              />
            </el-col>
          </el-row>
        </li>
      </ul>
    </template>
    <template #footer>
      <el-button @click="showEditView = false">取消</el-button>
      <el-button type="primary" @click="handleUpdateAnswer">保存</el-button>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.el-container {
  min-height: 630px;
}
.el-pagination {
  margin: 20px 0;
  justify-content: center;
}

.short {
  li {
    margin: 8px 0;
  }
  .title {
    font-weight: bold;
  }
  .answer {
    padding: 8px;
    margin: 8px 0;
    border-left: 4px solid gray;
  }
  .correct {
    padding: 8px;
    background: #f0f9eb;
  }
  .action {
    margin-top: 8px;
  }
}
</style>
