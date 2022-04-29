<script setup>
import { getHotWords, deleteHotWords, postHotWords } from "@/api/index.js";

// 热搜列表
const hostList = reactive([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
const loading = ref(true);
const keywords = ref("");
const count = ref(1);

// 获取热搜
const handleGetHotWords = async () => {
  loading.value = true;
  const res = await getHotWords();
  loading.value = false;
  hostList.splice(0);
  hostList.push(...res.data);
};

// 删除热搜
const handleDelete = async (index, { _id, keywords }) => {
  const res = await deleteHotWords(_id);
  if (res.code === 0) {
    handleGetHotWords();
  }
  ElNotification({
    title: "提示",
    message: res.msg + ":" + keywords,
    type: res.code === 0 ? "success" : "warning",
    position: "top-left",
  });
};

// 增加热搜
const handleAdd = async () => {
  if (keywords.value.trim().length === 0 || Number(count.value) < 1) {
    ElMessage("填写错误");
    return;
  }
  const res = await postHotWords({
    keywords: keywords.value,
    count: Number(count.value),
  });
  if (res.code === 0) {
    keywords.value = "";
    count.value = 1;
    handleGetHotWords();
  }
  ElNotification({
    title: "提示",
    message: res.msg,
    type: res.code === 0 ? "success" : "warning",
    position: "top-left",
  });
};

handleGetHotWords();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <h2>搜索词前十</h2>
    </el-header>
    <el-scrollbar>
      <el-main>
        <div class="list" v-loading="loading">
          <div class="item" v-for="(w, index) in hostList" :key="w._id">
            <div class="index">{{ index + 1 }}</div>
            <div class="keywords">{{ w.keywords }}</div>
            <div class="count">{{ w.count }} 次</div>
            <el-popconfirm
              title="删除这条搜索吗?"
              @confirm="handleDelete(index, w)"
            >
              <template #reference>
                <el-button size="small" type="danger"> 删除 </el-button>
              </template>
            </el-popconfirm>
          </div>
        </div>
      </el-main>
    </el-scrollbar>
    <div style="padding: 16px">
      <el-row>
        <el-col :span="16">
          <el-input
            placeholder="最大12个字符"
            maxlength="12"
            v-model="keywords"
          >
            <template #prepend> 搜索词 </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input
            type="number"
            min="1"
            v-model="count"
            placeholder="最小为 1"
          >
            <template #prepend> 搜索次数 </template>
          </el-input>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="handleAdd">增加</el-button>
        </el-col>
      </el-row>
      <p style="font-size: 12px; color: gray">
        注：仅当*搜索次数*大于最后一条时才会显示。
      </p>
    </div>
  </el-container>
</template>

<style scoped>
.list {
}
.item {
  padding: 8px 0;
  display: flex;
  align-items: center;
  color: #222;
}
.item:nth-of-type(2n) {
  background: var(--el-bg-color);
}
.index {
  text-align: center;
  font-size: 12px;
  width: 20px;
  margin-right: 8px;
  line-height: 20px;
  background-color: #dedede;
}

.item:nth-of-type(1) .index {
  color: white;
  background-color: #fe2d46;
}
.item:nth-of-type(2) .index {
  color: white;
  background-color: #f60;
}
.item:nth-of-type(3) .index {
  color: white;
  background-color: #faa90e;
}
.keywords {
  flex: 1;
}
.count {
  margin-right: 32px;
}
</style>