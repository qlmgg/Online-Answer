<script setup>
import { getQuestions, deleteQuestion, updateQuestion } from "@/api/index.js";
import { debounce } from "lodash";
import QuestionCaed from "@/components/QuestionCard.vue";
import { computeAnswerIndex } from "@/utils/compute.js";

const user = useStore().state.user;

// 搜索过滤器
const filter = reactive({
  keywords: "",
  page: 1,
  ban: "",
  type: "",
  _public: "",
  selfid: user.role === 1 ? user._id : "",
});
// 题目总数量
const total = ref(0);
// 题目列表
const questions = reactive([]);
// 加载中
const loading = ref(true);
// 显示编辑题目界面
const showEditView = ref(false);
// 正在编辑的题目信息
const editQuestion = reactive({
  index: 0,
  _id: "",
  title: "",
  option: [],
  answer: "",
  type: 0,
  author: {},
  ban: false,
  public: true,
});

// 获取题目列表
const handleGetQuestions = async () => {
  loading.value = true;
  const res = await getQuestions(filter);
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
  questions.splice(0);
  questions.push(...res.data.questions);
  total.value = res.data.total;
};

// 翻页事件
const handleChange = (page) => {
  filter.page = page;
  handleGetQuestions();
};

// 搜索事件
const handleSearch = debounce(() => {
  handleGetQuestions();
}, 500);

// 重置搜索条件
const handleResetFilter = () => {
  filter.keywords = "";
  filter.ban = "";
  filter._public = "";
  filter.type = "";
  handleGetQuestions();
};

// 确认删除题目事件
const handleDeleteQuestion = async (index, question) => {
  const { _id } = question;
  const res = await deleteQuestion(_id);
  if (res.code === 0) {
    questions.splice(index, 1);
    ElNotification({
      title: "Success",
      message: "已删除题目：" + question.title,
      type: "success",
      position: "top-left",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "删除失败：" + res.msg,
      type: "warning",
      position: "top-left",
    });
  }
};

// 封禁、解封题目事件
const handleBanQuestion = async (index, question) => {
  const { _id: id, ban } = question;
  const data = {
    ban: !ban,
  };
  const res = await updateQuestion({ id, data });
  if (res.code === 0) {
    questions[index].ban = !ban;
    ElNotification({
      title: "Success",
      message: `已${ban ? "解封" : "封禁"}题目：` + question.title,
      type: "success",
      position: "top-left",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
      position: "top-left",
    });
  }
};

// 公开、隐藏题目事件
const handlePublicQuestion = async (index, question) => {
  const { _id: id, public: _public } = question;
  const data = {
    public: !_public,
  };
  const res = await updateQuestion({ id, data });
  if (res.code === 0) {
    questions[index].public = !_public;
    ElNotification({
      title: "Success",
      message: `已${_public ? "公开" : "隐藏"}题目：` + question.title,
      type: "success",
      position: "top-left",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
      position: "top-left",
    });
  }
};
// 编辑题目事件
const handleEditQuestion = async (index, question) => {
  editQuestion.index = index;
  showEditView.value = true;
  const { _id, title, option, answer, type, author, ban } = question;
  editQuestion._id = _id;
  editQuestion.title = title;
  editQuestion.option = option;
  editQuestion.answer = answer;
  editQuestion.type = type;
  editQuestion.author = author._id;
  editQuestion.ban = ban;
  editQuestion.public = question.public;
};

// 处理子组件QuestionCard的事件
const handleAnswer = ({ question, answer }) => {
  const { title, option, type, ban } = question;
  editQuestion.title = title;
  editQuestion.option = option;
  editQuestion.type = type;
  editQuestion.ban = ban;
  console.log(answer);
  editQuestion.answer = answer;
  editQuestion.public = question.public;
};

// 更新题目事件
const handleUpdateQuestion = async () => {
  showEditView.value = false;
  const id = editQuestion._id;
  const data = {
    title: editQuestion.title,
    option: editQuestion.option,
    answer: editQuestion.answer,
    type: editQuestion.type,
    author: editQuestion.author,
    ban: editQuestion.ban,
    public: editQuestion.public,
  };
  const res = await updateQuestion({ id, data });
  if (res.code === 0) {
    const author = questions[editQuestion.index].author;
    questions[editQuestion.index] = res.data;
    questions[editQuestion.index].author = author;
    ElNotification({
      title: "Success",
      message: `更新题目成功: ${editQuestion.title}`,
      type: "success",
      position: "top-left",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
      position: "top-left",
    });
  }
};

// 键盘翻页事件
const prevPage = () => {
  filter.page = filter.page > 1 ? filter.page - 1 : 1;
  handleSearch();
};
const nextPage = () => {
  const pageCount = Math.ceil(total.value / 10);
  filter.page = filter.page < pageCount ? filter.page + 1 : pageCount;
  handleSearch();
};
const handleKeyUp = (e) => {
  if (e.key === "ArrowRight") {
    nextPage();
  } else if (e.key === "ArrowLeft") {
    prevPage();
  }
};
onMounted(() => {
  window.addEventListener("keyup", handleKeyUp);
});
onUnmounted(() => {
  window.removeEventListener("keyup", handleKeyUp);
});

handleGetQuestions();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-row>
        <el-col :span="5">
          状态:
          <el-select v-model="filter.ban" placeholder="Select" @change="handleGetQuestions">
            <el-option label="全部" value="" />
            <el-option label="禁用" :value="true" />
            <el-option label="启用" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="5">
          属性:
          <el-select v-model="filter._public" placeholder="Select" @change="handleGetQuestions">
            <el-option label="全部" value="" />
            <el-option label="公开" :value="true" />
            <el-option label="隐藏" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="5">
          题型:
          <el-select v-model="filter.type" placeholder="Select" @change="handleGetQuestions">
            <el-option label="全部" value="" />
            <el-option label="单选题" :value="0" />
            <el-option label="多选题" :value="1" />
            <el-option label="简答题" :value="2" />
          </el-select>
        </el-col>
        <el-col :span="7">
          <el-input
            v-model="filter.keywords"
            placeholder="搜索：题目名"
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
        <el-table stripe :data="questions" v-loading="loading">
          <el-table-column prop="option" type="expand">
            <template #default="scope">
              <div class="title">{{ scope.row.title }}</div>
              <!-- 单选题 -->
              <ul v-if="scope.row.type === 0">
                <li
                  v-for="(o, i) in scope.row.option"
                  :key="i"
                  :class="{ correct: i === computeAnswerIndex(scope.row) }"
                >
                  {{ o }}
                </li>
              </ul>
              <!-- 多选题 -->
              <ul v-else-if="scope.row.type === 1" style="list-style: square">
                <li
                  v-for="(o, i) in scope.row.option"
                  :key="i"
                  :class="{
                    correct: computeAnswerIndex(scope.row).includes(i),
                  }"
                >
                  {{ o }}
                </li>
              </ul>
              <!-- 简答题 -->
              <div v-else-if="scope.row.type === 2">
                <ul style="list-style: none">
                  <li class="correct">{{ scope.row.answer }}</li>
                </ul>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="题目">
            <template #default="scope">
              <div class="line" :title="scope.row.title">
                {{ scope.row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="题型" width="80">
            <template #default="scope">
              <el-tag size="small">
                {{ ["单选题", "多选题", "简答题"][scope.row.type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="出题人">
            <template #default="scope">
              {{ scope.row.author.nickname }}
            </template>
          </el-table-column>
          <el-table-column prop="title" label="状态" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.ban ? 'danger' : 'success'">
                {{ scope.row.ban ? "禁用" : "启用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="答案" width="80">
            <template #default="scope">
              <el-tag :type="scope.row.public ? 'success' : 'danger'">
                {{ scope.row.public ? "公开" : "隐藏" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                v-if="scope.row.author._id === user._id || user.role > scope.row.author.role"
                @click="handleEditQuestion(scope.$index, scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                v-if="scope.row.author._id === user._id || user.role > scope.row.author.role"
                @click="handleBanQuestion(scope.$index, scope.row)"
              >
                {{ scope.row.ban ? "启用" : "禁用" }}
              </el-button>
              <el-button
                size="small"
                v-if="scope.row.author._id === user._id || user.role > scope.row.author.role"
                @click="handlePublicQuestion(scope.$index, scope.row)"
              >
                {{ scope.row.public ? "隐藏" : "公开" }}
              </el-button>
              <el-popconfirm
                title="你确定要删除这个题目吗？"
                v-if="scope.row.author._id === user._id || user.role > scope.row.author.role"
                @confirm="handleDeleteQuestion(scope.$index, scope.row)"
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
  <el-dialog v-model="showEditView" title="编辑题目信息" width="60%">
    <QuestionCaed
      :question="editQuestion"
      :editable="true"
      :key="editQuestion._id"
      @answer="handleAnswer"
    />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditView = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateQuestion">更新</el-button>
      </span>
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
li {
  padding: 8px;
  margin: 8px 0;
}
.correct {
  background-color: #f0f9eb;
  border-radius: 8px;
}
.el-select {
  width: 100px;
}
.line {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.title {
  padding: 8px 32px;
  font-weight: bold;
}
</style>
