<script setup>
import { getAnswers, updatePaper, deleteAnswer } from "@/api/index.js";
import { debounce } from "lodash";
import { computePaperState } from "@/utils/compute.js";

// 搜索过滤器
const filter = reactive({
  keywords: "",
  page: 1,
  limit: 10,
  from: "",
  state: "",
});
// 答卷总数
const total = ref(0);
// 答卷列表
const answers = reactive([]);
// 加载中
const loading = ref(true);
// 显示编辑答卷界面
const showEditView = ref(!false);
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
  editAnswerInfo.info = answers[0];
  editAnswerInfo.info.sortAnswers = answers[0].answers.filter(
    (v) => v.question.type === 2
  );
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
  editAnswerInfo.info.sortAnswers = answer.answers.filter(
    (v) => v.question.type === 2
  );
};

// 更新答卷事件
const handleUpdatPaper = async () => {
  showEditView.value = false;
  const id = editUserInfo._id;
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
    filter.page =
      filter.page < pageCount.value ? filter.page + 1 : pageCount.value;
    handleSearch();
  } else if (e.key === "ArrowLeft") {
    filter.page = filter.page > 1 ? filter.page - 1 : 1;
    handleSearch();
  }
};
onMounted(() => {
  window.addEventListener("keyup", handleKeyUp);
});
onUnmounted(() => {
  window.removeEventListener("keyup", handleKeyUp);
});

handleGetAnswers();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-row>
        <el-col :span="8">
          答卷状态:
          <el-select v-model="filter.state" @change="handleGetAnswers">
            <el-option label="全部" value="" />
            <el-option label="已批改" :value="0" />
            <el-option label="未批改" :value="1" />
          </el-select>
        </el-col>
        <el-col :span="16">
          <el-input
            v-model="filter.keywords"
            placeholder="键入关键词以搜索答卷，例如：答卷名、答卷人"
            clearable
            @input="handleSearch"
          />
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
          <el-table-column prop="user.nickname" label="用户" />
          <el-table-column prop="score" label="分数" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.score >= 60 ? 'success' : 'danger'">
                {{ scope.row.score }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="correctRate" label="正确率" width="80">
            <template #default="scope">
              <el-tag
                :type="scope.row.correctRate >= 60 ? 'success' : 'danger'"
              >
                {{ scope.row.correctRate }} %
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
              <el-button size="small"> 查看 </el-button>
              <el-button
                size="small"
                type="primary"
                @click="handleCorrecting(scope.$index, scope.row)"
              >
                批卷
              </el-button>
              <el-popconfirm
                title="你确定要删除这个答卷吗？"
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
  <el-dialog v-model="showEditView" title="批改试卷">
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
        客观题得分：
        <el-tag size="small">
          {{ editAnswerInfo.info.score.toFixed(2) }} 分
        </el-tag>
      </div>
      <ul>
        <li v-for="s in editAnswerInfo.info.sortAnswers" :key="s._id">
          <div>{{ s.question.title }}</div>
          <div>回答：{{ s.answer }}</div>
          <div>参考答案：{{ s.question.answer }}</div>
        </li>
      </ul>
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
</style>