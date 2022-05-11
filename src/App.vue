<script setup>
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";
import { UPDATE_USER_MUTATION, UPDATE_TOKEN_MUTATION } from "./types/mutation.js";
const store = useStore();

// 读取本地token
const token = localStorage.getItem("onlineanswer_token");
token && store.commit(UPDATE_TOKEN_MUTATION, token);

// 读取本地user
const user = localStorage.getItem("onlineanswer_user");
if (user) {
  try {
    const n = JSON.parse(user);
    store.commit(UPDATE_USER_MUTATION, n);
    ElMessage({
      message: `欢迎你，${n.nickname}！`,
      type: "success",
    });
  } catch (e) {
    console.log(e);
  }
}
</script>

<template>
  <TheHeader />
  <div class="container">
    <router-view></router-view>
  </div>
  <TheFooter />
</template>

<style lang="less">
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei",
    "微软雅黑", Arial, sans-serif;
}
.container {
  min-height: calc(100vh - 180px);
  margin: 16px auto;
  width: 1400px;
  background: white;
  display: flex;
  flex-direction: column;
}
</style>
>
