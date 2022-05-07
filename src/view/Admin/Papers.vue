<script setup>
import { getPapers, deletePaper, updatePaper } from "@/api/index.js";
import { debounce } from "lodash";
import SchoolSelect from "@/components/SchoolSelect.vue";
import school from "@/assets/school.json";
import { computePaperState } from "@/utils/compute.js";

const user = useStore().state.user;

// 搜索过滤器
const filter = reactive({
  keywords: "",
  page: 1,
  limit: 10,
  from: user.role === 1 ? "own" : "other",
  state: "",
  selfid: user._id,
});
// 试卷总页数
const pageCount = ref(0);
// 试卷列表
const papers = reactive([]);
// 加载中
const loading = ref(true);
// 显示编辑试卷界面
const showEditView = ref(false);
// 正在编辑的试卷信息
const editUserInfo = reactive({
  index: -1,
  _id: "",
});

// 重置搜索条件
const handleResetFilter = () => {
  filter.keywords = "";
  filter.page = 1;
  filter.limit = 10;
  filter.from = user.role === 1 ? "own" : "other";
  filter.state = "";
  handleGetPapers();
};

// 获取试卷列表
const handleGetPapers = async () => {
  loading.value = true;
  const res = await getPapers(filter);
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
  papers.splice(0);
  // 计算试卷状态
  res.data.exampaper.forEach((v) => {
    v.state = computePaperState(v.time);
  });
  papers.push(...res.data.exampaper);
  pageCount.value = res.data.pageCount;
};

// 确认删除试卷事件
const handleDeletePaper = async (index, paper) => {
  const { _id } = paper;
  const res = await deletePaper(_id);
  if (res.code === 0) {
    papers.splice(index, 1);
    ElNotification({
      title: "Success",
      message: "已删除试卷：" + paper.title,
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

// 编辑试卷事件
const handleEditPaper = async (index, paper) => {
  showEditView.value = true;
};

// 更新试卷事件
const handleUpdatPaper = async () => {
  showEditView.value = false;
  const id = editUserInfo._id;
};

// 搜索事件
const handleSearch = debounce(() => {
  handleGetPapers();
}, 1000);

// 点击翻页事件
const handleChange = (page) => {
  filter.page = page;
  handleGetPapers();
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

handleGetPapers();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-row>
        <el-col :span="7">
          试卷状态:
          <el-select v-model="filter.state" @change="handleGetPapers">
            <el-option label="全部" value="" />
            <el-option label="未开始" value="1" />
            <el-option label="已结束" value="2" />
            <el-option label="进行中" value="3" />
          </el-select>
        </el-col>
        <el-col :span="7">
          出卷人:
          <el-select v-model="filter.from" @change="handleGetPapers">
            <el-option label="全部" value="" />
            <el-option label="自己" value="own" />
            <el-option label="其他人" value="other" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="filter.keywords"
            placeholder="键入关键词以搜索试卷，例如：试卷名"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="2">
          <el-button style="margin-left: 4px" @click="handleResetFilter">
            重置
          </el-button>
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-scrollbar>
        <el-table stripe :data="papers" v-loading="loading">
          <el-table-column prop="title" label="试卷名">
            <template #default="scope">
              <router-link :to="`/exampaper/${scope.row._id}`" class="link">
                {{ scope.row.title }}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="100px">
            <template #default="scope">
              <el-tag>
                {{ ["单选题", "多选题", "简答题", "综合题"][scope.row.type] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="状态" width="100px">
            <template #default="scope">
              <el-tag type="info" v-if="scope.row.state === 0"> 未开始 </el-tag>
              <el-tag type="danger" v-else-if="scope.row.state === 1">
                已结束
              </el-tag>
              <el-tag type="success" v-else> 进行中 </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="questions.length"
            label="题目数量"
            width="100px"
          />
          <el-table-column prop="time" label="截止日期">
            <template #default="scope">
              <el-tooltip
                class="box-item"
                effect="light"
                :content="
                  new Date(scope.row.time[0]).toLocaleString() +
                  '-' +
                  new Date(scope.row.time[1]).toLocaleString()
                "
                placement="top"
              >
                {{ new Date(scope.row.time[0]).toLocaleDateString() }}
                -
                {{ new Date(scope.row.time[1]).toLocaleDateString() }}
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="from.nickname" label="出卷人" width="100px" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small"> 分析 </el-button>
              <el-button
                size="small"
                v-if="scope.row.from._id === user._id || user.role > 1"
                @click="handleEditPaper(scope.$index, scope.row)"
              >
                编辑
              </el-button>
              <el-popconfirm
                v-if="scope.row.from._id === user._id || user.role > 1"
                title="你确定要删除这个试卷吗？"
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
      :page-count="pageCount"
      v-model:current-page="filter.page"
      layout="prev, pager, next, jumper"
      background
      @current-change="handleChange"
    />
  </el-container>
  <el-dialog v-model="showEditView" title="编辑试卷信息"> 123 </el-dialog>
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