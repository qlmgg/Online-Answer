<script setup>
import TheHeader from "@/components/TheHeader.vue";
import TheFooter from "@/components/TheFooter.vue";

const store = useStore();

// 读取本地token
const token = localStorage.getItem("token");
if (token) {
  store.commit("updateToken", token);
}
// 监听token变化，并存到本地
watch(
  () => store.state.token,
  (val) => {
    localStorage.setItem("token", val);
  }
);

// 读取本地user
const user = localStorage.getItem("user");
if (user) {
  try {
    const n = JSON.parse(user);
    store.commit("updateUser", n);
    ElMessage({
      message: `欢迎你，${n.nickname}！`,
      type: "success",
    });
  } catch (e) {
    console.log(e);
  }
}
// 监听user变化，并存到本地
watch(
  () => store.state.user,
  (val) => {
    localStorage.setItem("user", JSON.stringify(val));
  },
  {
    deep: true,
  }
);
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
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
.container {
  min-height: calc(100vh - 180px);
  margin: 16px auto;
  width: 1300px;
  background: white;
  display: flex;
  flex-direction: column;
}
</style>>