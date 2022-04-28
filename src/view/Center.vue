<script setup>
const route = useRoute();
const router = useRouter();
const tabsUrl = [
  "/Center",
  "/Center/Papers",
  "/Center/Questions",
  "/Center/Collects",
];
const tabsActive = ref(tabsUrl.indexOf(route.path));

watch(tabsActive, (index) => {
  router.push(tabsUrl[index]);
});
</script>
<template>
  <el-affix :offset="63">
    <el-tabs v-model="tabsActive" tab-position="top">
      <el-tab-pane label="个人资料" :name="0"></el-tab-pane>
      <el-tab-pane label="答卷记录" :name="1"></el-tab-pane>
      <el-tab-pane label="错题本" :name="2"></el-tab-pane>
      <el-tab-pane label="题目收藏" :name="3"></el-tab-pane>
    </el-tabs>
  </el-affix>
  <div class="wrap">
    <router-view></router-view>
  </div>
</template>
<style scoped>
.el-tabs {
  padding: 0 16px;
  background: white;
}
.wrap {
  padding: 16px;
}
</style>
