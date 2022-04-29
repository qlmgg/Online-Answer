<script setup>
import { Male, Female, UserFilled } from "@element-plus/icons-vue";
import { id2time, friendlyTime } from "@/utils/index.js";
import School from "@/assets/school.json";

// 通过defineProps指定当前 props 类型，获得上下文的props对象
const props = defineProps({
  comment: Object,
});

const comment = reactive(props.comment);
const showMore = ref(false);
const contentElm = ref(null);

onMounted(() => {
  if (contentElm.value) {
    showMore.value = contentElm.value.offsetHeight > 200;
  }
});
</script>

<template>
  <el-row>
    <el-col :span="1">
      <el-avatar :size="40" :src="comment.user.avatar" :icon="UserFilled" />
    </el-col>
    <el-col :span="23">
      <el-row class="head">
        <span class="nickname">{{ comment.user.nickname }}</span>
        <el-icon>
          <female v-if="comment.user.gender === 0" color="pink" />
          <male v-else-if="comment.user.gender === 1" color="skyblue" />
        </el-icon>
        <el-tag size="small" effect="plain">
          {{ School.find((v) => v.univ_id == comment.user.school).univ_name }}
        </el-tag>
        <span class="time">{{ friendlyTime(id2time(comment._id)) }}</span>
        <div class="action">
          <slot name="action" />
        </div>
      </el-row>
      <el-row class="content">
        <pre ref="contentElm" :class="{ showMore }">{{ comment.content }}</pre>
      </el-row>
      <el-row v-if="showMore">
        <el-button size="small" @click="showMore = false">展开更多</el-button>
      </el-row>
    </el-col>
  </el-row>
</template>

<style lang="less" scoped>
.head {
  display: flex;
  align-items: center;
}
.el-avatar {
  border: 1px solid var(--body-color);
}
.el-tag {
  margin: 0 2px;
}
.nickname {
  font-size: 14px;
  margin-right: 4px;
  font-weight: bold;
  color: #030303;
}
.time {
  margin-left: 8px;
  font-size: 14px;
  color: #606060;
}
.content {
  padding: 16px 0 0 0;
  color: #030303;
  font-size: 16px;
  line-height: 1.4;
  pre {
    word-break: break-all;
    white-space: break-spaces;
  }
}
.action {
  margin-left: auto;
}
.showMore {
  height: 200px;
  overflow: hidden;
}
</style>