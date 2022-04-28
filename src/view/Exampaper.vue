<script setup>
import {
  Edit,
  Share,
  Refresh,
  Delete,
  UserFilled,
} from "@element-plus/icons-vue";

import CommentItem from "@/components/CommentItem.vue";
import {
  getPaperInfo,
  getComments,
  getAnswers,
  postComment,
  deleteComment,
} from "@/api/index.js";
import { id2time } from "@/utils/index.js";

const route = useRoute();
const user = useStore().state.user;

const exampaper = reactive({
  // 考卷基本信息
  info: {
    title: "试卷载入中",
    questions: [],
    type: 3,
    allow_comments: null,
    time: [Date.now(), Date.now()],
    from: {
      nickname: "",
    },
  },
  comments: [], // 考卷评论
  answers: [],
});

// 评论总数
const total = ref(0);

// 加载试卷loading
const loading = ref(true);

// 加载评论loading
const loading_comments = ref(true);

// 评论loading
const loading_post_comment = ref(false);

// 评论内容
const comment = ref("");

// 是否有更多评论
const hasMoreComment = ref(true);

// 当前评论页数
const page = ref(1);

// 通过URL获取id
const { id } = route.params;

// 查询考卷评论
const handleMoreComments = async () => {
  loading_comments.value = true;
  const res = await getComments({ id, page: page.value });
  exampaper.comments.push(...res.data.comments);
  total.value = res.data.total;
  page.value++;
  loading_comments.value = false;
  if (exampaper.comments.length >= total.value) {
    hasMoreComment.value = false;
  }
};

// 刷新评论
const refreshComments = () => {
  page.value = 1;
  exampaper.comments.splice(0);
  handleMoreComments();
};

// 评论
const handlePostComment = async () => {
  loading_post_comment.value = true;
  const res = await postComment({
    user: user._id,
    content: comment.value,
    exampaperid: id,
  });
  loading_post_comment.value = false;
  if (res.code === 0) {
    ElNotification({
      title: "评论成功",
      message: `已提交评论：${comment.value}`,
      type: "success",
    });
    const { _id } = res.data;
    // 将评论放到comments中
    const data = {
      _id,
      user,
      content: comment.value,
      exampaperid: id,
    };
    exampaper.comments.unshift(data);
    comment.value = "";
  }
};
// 删除评论
const handleDeleteComment = async (comment, index) => {
  const res = await deleteComment(comment._id);
  if (res.code === 0) {
    ElNotification({
      title: "删除评论成功",
      message: `已删除评论：${comment.content}`,
      type: "success",
    });
    exampaper.comments.splice(index, 1);
  } else {
    ElNotification({
      title: "删除评论失败",
      message: `原因：${res.msg}`,
      type: "warning",
    });
  }
};

(async () => {
  // 查询考卷详情
  const res = await getPaperInfo(id);
  loading.value = false;
  exampaper.info = res.data;
  // 获取评论
  if (exampaper.info.allow_comments) {
    handleMoreComments();
  }
  // 获取答卷记录
  if (user) {
    const res = await getAnswers({ exampaper: id });
    exampaper.answers = res.data.answers;
  }
})();
</script>

<template>
  <!-- 试卷信息 -->
  <div v-loading="loading" class="wrap">
    <h1>{{ exampaper.info.title }}</h1>
    <p style="text-align: center; padding: 16px 0">
      {{ exampaper.info.description }}
    </p>
    <div class="tag">
      <el-tag size="small">
        {{ exampaper.info.multi_answer ? "多次答卷" : "单次答卷" }}
      </el-tag>
      <el-tag size="small">
        考试时长：{{ exampaper.info.total_time }} 分钟
      </el-tag>
      <el-tag size="small" type="danger" v-if="exampaper.info.strict">
        严格卷
      </el-tag>
    </div>
    <el-descriptions :column="4">
      <el-descriptions-item align="center" label="题目数量：">
        {{ exampaper.info.questions.length }}
      </el-descriptions-item>
      <el-descriptions-item align="center" label="题目类型：">
        {{ ["单选题", "多选题", "简答题", "综合题"][exampaper.info.type] }}
      </el-descriptions-item>
      <el-descriptions-item align="center" label="截止日期：">
        <el-tooltip
          class="box-item"
          effect="light"
          :content="
            new Date(exampaper.info.time[0]).toLocaleString() +
            '-' +
            new Date(exampaper.info.time[1]).toLocaleString()
          "
          placement="top"
        >
          {{ new Date(exampaper.info.time[0]).toLocaleDateString() }}
          -
          {{ new Date(exampaper.info.time[1]).toLocaleDateString() }}
        </el-tooltip>
      </el-descriptions-item>
      <el-descriptions-item align="center" label="出卷人：">
        {{ exampaper.info.from.nickname }}
      </el-descriptions-item>
    </el-descriptions>
    <el-row justify="center" style="padding: 32px 0">
      <router-link
        :to="`/answer/${id}`"
        class="link"
        v-if="
          exampaper.info.multi_answer ||
          (!exampaper.info.multi_answer && !exampaper.answers.length)
        "
      >
        <el-button type="primary" size="large" :icon="Edit">开始答题</el-button>
      </router-link>
      <el-button v-else type="primary" size="large" :icon="Edit" disabled
        >您已完成答题</el-button
      >
    </el-row>
  </div>

  <div class="blank"></div>
  <!-- 答题记录 -->
  <div class="score">
    <el-row style="font-size: 22px; padding: 20px 0; font-weight: bold">
      <el-col :span="12">我的答题记录</el-col>
    </el-row>
    <el-table :data="exampaper.answers" stripe style="width: 100%">
      <el-table-column prop="_id" label="时间">
        <template #default="scope">
          <span>{{ id2time(scope.row._id).toLocaleString() }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="分数">
        <template #default="scope">
          {{ scope.row.score.toFixed(2) }} 分
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small">
            <router-link class="link" :to="`/result/${scope.row._id}`">
              查看
            </router-link>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <div class="blank"></div>
  <!-- 评论 -->
  <div class="comments" v-if="exampaper.info.allow_comments">
    <el-row style="font-size: 22px; padding: 20px 0; font-weight: bold">
      <el-col :span="12">评论</el-col>
      <el-col :span="12" align="end">
        <el-button
          type="primary"
          :icon="Refresh"
          @click="refreshComments"
          :loading="loading_comments"
          :disabled="loading_comments"
        ></el-button>
      </el-col>
    </el-row>
    <!-- 评论组件 -->
    <el-row class="comment-wrap" align="middle" v-if="user">
      <el-col :span="1">
        <el-avatar size="large" :src="user.avatar">
          <el-icon :size="32"> <UserFilled /> </el-icon>
        </el-avatar>
      </el-col>
      <el-col :span="22" style="padding-left: 8px">
        <el-input placeholder="请输入评论" v-model="comment" />
      </el-col>
      <el-col :span="1">
        <el-button
          type="primary"
          style="margin-left: 4px"
          :loading="loading_post_comment"
          :disabled="loading_post_comment || !comment.length"
          @click="handlePostComment"
          >评论</el-button
        >
      </el-col>
    </el-row>

    <!-- 评论列表 -->
    <el-space fill wrap>
      <CommentItem
        v-for="(c, i) in exampaper.comments"
        :key="c._id"
        :comment="c"
      >
        <!-- 自己的评论 或 自己的试卷 或 自己是管理员 则 显示删除按钮 -->
        <template
          #action
          v-if="
            user &&
            (c.user._id === user._id ||
              exampaper.info.from._id === user._id ||
              user.role > 0)
          "
        >
          <el-button
            type="danger"
            :icon="Delete"
            size="small"
            @click="handleDeleteComment(c, i)"
          />
        </template>
      </CommentItem>
      <el-empty description="暂时没有评论" v-if="!exampaper.comments.length" />
    </el-space>

    <!-- 更多评论按钮 -->
    <el-button
      style="margin-top: 20px"
      v-if="hasMoreComment"
      @click="handleMoreComments"
    >
      加载更多评论
    </el-button>
  </div>
  <el-empty
    :description="
      exampaper.info.allow_comments === null ? '评论加载中...' : '试卷禁止评论'
    "
    v-else
  />
</template>

<style lang="less" scoped>
.el-avatar {
  border: 1px solid var(--body-color);
}
.wrap {
  position: relative;
  padding: 20px;
  h1 {
    text-align: center;
  }
  .tag {
    padding-bottom: 32px;
    text-align: center;
    .el-tag {
      margin-left: 8px;
    }
  }
}
.blank {
  height: 20px;
  background: var(--body-color);
}
.score {
  display: flex;
  padding: 20px;
  flex-direction: column;
  .item {
    display: flex;
    align-items: center;
    padding: 20px;
    .el-icon {
      // margin-left: 8px;
    }
    span {
      margin: 0 16px;
    }
  }
}
.comments {
  display: flex;
  flex-direction: column;
  padding: 20px;
}
.comment-wrap {
  padding: 20px 0;
  margin-bottom: 40px;
}
</style>