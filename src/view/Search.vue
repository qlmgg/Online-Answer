<script setup>
import { reactive, ref, watch } from "vue";
import { Search } from "@element-plus/icons-vue";

import { getQuestions, getPapers } from "@/request/api.js";
import { id2time } from "@/utils/index.js";

const searchType = ref(-1);
const keywords = ref("");
const msg = ref("共搜索到N条结果");
const total = ref(null);
const papers = reactive([]);
const questions = reactive([]);

watch(total, (value) => {
  if (total.value) {
    if (total.value === 0) {
      msg.value = "没有搜索到结果！";
    } else {
      msg.value = "共搜索到" + value + "条结果";
    }
  }
});

// 搜索事件
const handleSearch = async () => {
  if (keywords.value.trim().length === 0) {
    return;
  }
  papers.splice(0);
  questions.splice(0);
  switch (searchType.value) {
    case -1:
      const res1 = await getPapers({ keywords: keywords.value });
      const res2 = await getQuestions({ keywords: keywords.value });
      total.value = res1.data.pageCount + res2.data.total;
      papers.push(...res1.data.exampaper);
      questions.push(...res2.data.questions);
      break;
    case 0:
      const res3 = await getPapers({ keywords: keywords.value });
      total.value = res3.data.pageCount;
      papers.push(...res3.data.exampaper);
      break;
    case 1:
      const res4 = await getQuestions({ keywords: keywords.value });
      total.value = res4.data.total;
      questions.push(...res4.data.questions);
      break;
  }
};
</script>

<template>
  <!-- logo -->
  <!-- <el-row justify="center" style="padding: 32px 0 0 0">
    <img src="../assets/logo.png" alt="" />
  </el-row> -->

  <!-- 搜索框 -->
  <el-row justify="center" style="padding: 32px 0">
    <el-col :span="16">
      <el-card>
        <el-input
          placeholder="请输入关键词以搜索"
          v-model="keywords"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select
              v-model="searchType"
              placeholder="类型"
              style="width: 80px"
            >
              <el-option label="全部" :value="-1" />
              <el-option label="试卷" :value="0" />
              <el-option label="题目" :value="1" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </el-card>
    </el-col>
  </el-row>

  <!-- 结果提示 -->
  <el-row v-if="total" justify="center" style="margin-bottom: 16px">
    <el-col :span="16">
      <el-alert :title="msg" type="success" />
    </el-col>
  </el-row>

  <!-- 搜索结果 -->
  <el-row justify="center">
    <el-col :span="16">
      <el-space fill wrap :size="16">
        <!-- 试卷搜索结果 -->
        <el-card v-for="p in papers" :key="p._id" shadow="hover">
          <template #header>
            <div class="card-header">
              <div>
                <el-tag style="margin-right: 8px" size="small">试卷</el-tag>
                <router-link class="link" :to="`/exampaper/${p._id}`">
                  {{ p.title }}
                </router-link>
              </div>
            </div>
          </template>
          <div class="item">{{ p.description }}</div>
          <div class="item">{{ id2time(p._id).toLocaleString(0) }}</div>
        </el-card>
        <!-- 题目搜索结果 -->
        <el-card v-for="q in questions" :key="q._id" shadow="hover">
          <template #header>
            <div class="card-header">
              <div>
                <el-tag style="margin-right: 8px" size="small">题目</el-tag>
                <router-link class="link" :to="`/Question/${q._id}`">
                  {{ q.title }}
                </router-link>
              </div>
              <el-tag style="margin-right: 8px" size="small">
                {{ ["单选题", "多选题", "简答题"][q.type] }}
              </el-tag>
            </div>
          </template>
          <ul :style="{ listStyle: q.type === 1 ? 'square' : '' }">
            <li v-for="o in q.option" :key="o">
              {{ o }}
            </li>
          </ul>
        </el-card>
      </el-space>
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.el-space {
  width: 100%;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item {
  margin-bottom: 8px;
  font-size: 12px;
}
</style>