<script setup>
import { getWrongs } from "@/request/api.js";
import { Close } from "@element-plus/icons-vue";

import { reactive, ref } from "vue";
const wrongs = reactive([]);
const total = ref(0);
const singleCount = ref(0);
const mutltiCount = ref(0);

const handlePageChange = async (page = 1) => {
  const res = await getWrongs({ page, limit: 3 });
  wrongs.splice(0);
  wrongs.push(...res.data.wrongs);
  total.value = res.data.total;
  singleCount.value = res.data.singleCount;
  mutltiCount.value = res.data.mutltiCount;
};

handlePageChange();
</script>

<template>
  <el-row>
    <el-col :span="6" style="padding-right: 16px">
      <el-space :size="16" wrap fill>
        <el-card shadow="hover">
          <el-tag size="large"> 错题数量： {{ total }} 题 </el-tag>
        </el-card>
        <el-card shadow="hover">
          <el-tag style="margin-bottom: 8px">
            单选题： {{ singleCount }} 题
          </el-tag>
          <el-progress
            :percentage="Number(((singleCount / total) * 100).toFixed(2)) || 0"
          />
        </el-card>
        <el-card shadow="hover">
          <el-tag style="margin-bottom: 8px">
            多选题： {{ mutltiCount }} 题
          </el-tag>
          <el-progress
            :percentage="Number(((mutltiCount / total) * 100).toFixed(2)) || 0"
          />
        </el-card>
      </el-space>
    </el-col>
    <el-col :span="18">
      <el-space fill wrap>
        <QuestionCard
          v-for="q in wrongs"
          :key="q._id"
          :question="q"
          :result="q.result"
          :disabled="true"
        >
          <template #index>
            <template v-if="q.type !== 2">
              <el-tag type="danger">
                <el-icon><close /></el-icon>
              </el-tag>
            </template>
          </template>
          <template #footer>
            <div class="footer">
              <span class="title">此题来自考卷</span>
              <router-link
                :to="`/Exampaper/${q.exampaper._id}`"
                class="link footer"
              >
                《{{ q.exampaper.title }}》
              </router-link>
            </div>
          </template>
        </QuestionCard>
      </el-space>
      <el-pagination
        layout="prev, pager, next"
        @current-change="handlePageChange"
        :total="total"
        :page-size="3"
      />
    </el-col>
  </el-row>
</template>
<style scoped lang="less">
.el-space {
  width: 100%;
}
.el-pagination {
  margin-top: 16px;
}
.footer {
  margin-top: 16px;
  font-size: 12px;
  text-align: right;
  .title {
    color: #999999;
  }
}
</style>