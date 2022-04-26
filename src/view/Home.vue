<script setup>
import { reactive, ref } from "vue";
import { getPapers } from "@/request/api.js";

import ExamCard from "@/components/ExamCard.vue";
import Banner from "@/components/Banner.vue";
import { getBanner } from "@/request/api.js";

// 是否正在加载数据
const loading = ref(true);
// 正在加载数据时显示的数据
const exam = reactive({
  _id: "622ebf8e3f642d307bca8854",
  title: "Loading...",
  type: "Loading...",
  count: "Loading...",
  closing_date: "Loading...",
  from: "Loading...",
});
// 考卷列表
const exams = reactive([]);
// 考卷总页数
const pageCount = ref(0);
// 每页显示的考卷数量
const pageSize = ref(0);

// 获取考卷数据
const getExampaper = async (page = 1) => {
  loading.value = true;
  const res = await getPapers(page);
  pageSize.value = res.data.pageSize;
  pageCount.value = res.data.pageCount;
  exams.splice(0);
  exams.push(...res.data.exampaper);
  loading.value = false;
};

const banners = reactive([]);

getExampaper();

(async () => {
  const res = await getBanner();
  banners.splice(0);
  banners.push(...res.data);
})();
</script>

<template>
  <!-- banner -->
  <Banner :banners="banners" :key="banners.length" />

  <!-- 骨架屏 -->
  <el-skeleton :loading="loading">
    <template #template>
      <el-row :gutter="20" v-for="i in 2" :key="i">
        <el-col :span="6" v-for="j in 4" :key="j">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <el-button class="button text" type="text"></el-button>
              </div>
            </template>
            <div class="text item"></div>
            <div class="text item"></div>
            <div class="text item"></div>
            <div class="text item"></div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </el-skeleton>

  <!-- 试卷列表 -->
  <el-row
    v-if="!loading"
    :gutter="20"
    v-for="i in Math.ceil(exams.length / 4)"
    :key="i"
  >
    <el-col
      :span="6"
      v-for="exam in exams.slice((i - 1) * 4, (i - 1) * 4 + 4)"
      :key="exam.id"
    >
      <ExamCard :exam="exam" :key="exam" />
    </el-col>
  </el-row>

  <!-- 分页器 -->
  <el-pagination
    background
    layout="prev, pager, next, jumper"
    :page-size="pageSize"
    :page-count="pageCount"
    @current-change="getExampaper"
  >
  </el-pagination>
</template>

<style scoped>
/* 骨架屏 */
.text {
  font-size: 14px;
  min-width: 120px;
  min-height: 20px;
  background: var(--el-skeleton-color);
}
.item {
  margin-bottom: 8px;
}

.el-row {
  padding: 0 20px;
  margin-bottom: 20px;
}

.el-pagination {
  margin: 20px;
  justify-content: center;
}
</style>