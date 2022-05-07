<script setup>
import { Search } from "@element-plus/icons-vue";
import { getHotWords, search } from "@/api/index.js";
import { id2time } from "@/utils/index.js";
import { onBeforeRouteLeave } from "vue-router";

// 搜索类型
const searchType = ref(0);
// 搜索关键词
const keywords = ref("");
// 搜索结果
const searchResult = reactive([]);
// 热搜列表
const searchList = reactive([]);
// 搜索中
const loading = ref(false);
// 加载热搜中
const hotLoading = ref(true);
// 无结果
const noresult = ref(false);
const store = useStore();

watch(keywords, () => {
  if (!keywords.value.length) {
    searchResult.splice(0);
    noresult.value = false;
  }
});

// 搜索事件
const handleSearch = async (_keywords) => {
  if (_keywords && typeof _keywords === "string") {
    keywords.value = _keywords;
  }
  if (keywords.value.trim().length === 0) {
    return;
  }
  loading.value = true;
  noresult.value = false;
  searchResult.splice(0);
  const res = await search({
    keywords: keywords.value,
    type: searchType.value,
  });
  loading.value = false;
  noresult.value = res.data.length === 0;
  searchResult.push(...res.data);
};

// 增加路由守卫
onBeforeRouteLeave((to) => {
  const path = to.path.toLowerCase();
  // 跳转到查看试卷、题目详情界面
  if (path.startsWith("/question") || path.startsWith("/exampaper")) {
    // 临时保存搜索结果
    store.commit("updatesearchState", {
      _keywords: keywords.value,
      _searchResult: searchResult,
    });
  } else {
    store.commit("updatesearchState", undefined);
  }
  return true;
});

(async () => {
  const res = await getHotWords();
  hotLoading.value = false;
  searchList.push(...res.data);

  // 从store中获取搜索结果
  if (store.state.searchState) {
    const { _searchResult, _keywords } = store.state.searchState;
    keywords.value = _keywords;
    searchResult.push(..._searchResult);
  }
})();
</script>

<template>
  <!-- logo -->
  <el-row justify="center" style="padding: 32px 0 0 0">
    <img src="../assets/logo.png" alt="" />
  </el-row>

  <!-- 搜索框 -->
  <el-row justify="center" style="padding: 32px 0">
    <el-col :span="16">
      <el-card>
        <el-input
          placeholder="请输入关键词以搜索"
          v-model="keywords"
          maxlength="200"
          @keyup.enter="handleSearch"
        >
          <template #prepend>
            <el-select
              v-model="searchType"
              placeholder="类型"
              style="width: 80px"
            >
              <el-option label="全部" :value="0" />
              <el-option label="试卷" :value="1" />
              <el-option label="题目" :value="2" />
            </el-select>
          </template>
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </el-card>
    </el-col>
  </el-row>

  <!-- 热搜词 -->
  <div v-show="!keywords.length" v-loading="hotLoading">
    <el-row justify="center" style="margin-bottom: 16px">
      <el-col :span="16">
        <h2># 搜索榜</h2>
      </el-col>
    </el-row>
    <!-- {{ searchList }} -->
    <el-row justify="center" style="margin-bottom: 16px">
      <el-col :span="16" class="keywords">
        <el-row
          class="keywords-row"
          v-for="i in Math.ceil(searchList.length / 2)"
          :key="i"
        >
          <el-col
            :span="12"
            v-for="(s, j) in searchList.slice((i - 1) * 2, (i - 1) * 2 + 2)"
            :key="j"
          >
            <span class="index">
              {{ j === 1 ? i + i : i + i - 1 }}
            </span>
            <span @click="handleSearch(s.keywords)">
              {{ s.keywords }}
            </span>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>

  <!-- 搜索结果 -->
  <el-row justify="center">
    <el-col :span="16">
      <el-space fill wrap :size="16">
        <!-- 搜索结果 -->
        <template v-for="r in searchResult" :key="r._id">
          <!-- 试卷 -->
          <el-card shadow="hover" v-if="r.hasOwnProperty('questions')">
            <template #header>
              <div class="card-header">
                <div>
                  <el-tag style="margin-right: 8px" size="small">试卷</el-tag>
                  <router-link class="link" :to="`/Exampaper/${r._id}`">
                    {{ r.title }}
                  </router-link>
                </div>
              </div>
            </template>
            <div class="item">{{ r.description }}</div>
            <div class="item">{{ id2time(r._id).toLocaleString(0) }}</div>
          </el-card>
          <!-- 题目 -->
          <el-card shadow="hover" v-else>
            <template #header>
              <div class="card-header">
                <div>
                  <el-tag style="margin-right: 8px" size="small">题目</el-tag>
                  <router-link class="link" :to="`/Question/${r._id}`">
                    {{ r.title }}
                  </router-link>
                </div>
                <el-tag style="margin-right: 8px" size="small">
                  {{ ["单选题", "多选题", "简答题"][r.type] }}
                </el-tag>
              </div>
            </template>
            <ul :style="{ listStyle: r.type === 1 ? 'square' : '' }">
              <li v-for="o in r.option" :key="o">
                {{ o }}
              </li>
            </ul>
          </el-card>
        </template>
      </el-space>
    </el-col>
  </el-row>

  <!-- 搜索中 -->
  <el-row justify="center" v-show="loading" v-loading="loading">
    <el-col :span="16"></el-col>
  </el-row>

  <el-empty v-show="noresult" description="请换个关键词试试~">
    <el-button type="primary" @click="keywords = ''">确定</el-button>
  </el-empty>
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
.index {
  display: inline-block;
  font-weight: bold;
  width: 30px;
}

.keywords {
  cursor: pointer;
  line-height: 28px;
  font-size: 12px;
}
.keywords-row:nth-of-type(1) {
  .el-col:nth-of-type(1) {
    color: #fe2d46;
  }
}
.keywords-row:nth-of-type(1) {
  .el-col:nth-of-type(2) {
    color: #f60;
  }
}
.keywords-row:nth-of-type(2) {
  .el-col:nth-of-type(1) {
    color: #faa90e;
  }
}
</style>