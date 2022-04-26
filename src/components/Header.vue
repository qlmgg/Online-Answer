<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Male, Female, Search } from "@element-plus/icons-vue";

import { logout } from "@/request/api.js";

const store = useStore();
const router = useRouter();

// 显示阴影
const shadow = ref(false);

// 退出登录
const handleLogout = () => {
  console.log(store.state.user);
  logout().then((res) => {
    ElMessage({
      message: "已退出",
      type: "success",
    });
    store.commit("updateUser", undefined);
    store.commit("updateToken", undefined);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.push("/");
  });
};
</script>

<template>
  <el-affix @change="(v) => (shadow = v)">
    <div class="header-wrap" :class="{ shadow }">
      <header>
        <div class="logo">
          <router-link to="/">
            <img src="../assets/logo.png" alt="" />
          </router-link>
        </div>
        <el-menu
          default-active="/"
          class="el-menu-demo"
          mode="horizontal"
          router
          :ellipsis="false"
        >
          <el-menu-item index="/">主页</el-menu-item>
          <el-menu-item index="/rank">排行榜</el-menu-item>
          <el-menu-item index="/Search">
            <el-icon>
              <search />
            </el-icon>
            搜索
          </el-menu-item>
          <el-sub-menu index="2" v-if="store.state.user">
            <template #title>
              <el-avatar
                icon="UserFilled"
                :src="store.state.user.avatar || './imgs/default-avatar.png'"
              ></el-avatar>
              <el-divider direction="vertical"></el-divider>
              <el-icon v-if="store.state.user.gender === 0">
                <female color="pink" />
              </el-icon>
              <el-icon v-else-if="store.state.user.gender === 1">
                <male color="skyblue" />
              </el-icon>
              {{ store.state.user.nickname }}
            </template>
            <el-menu-item index="/Center">个人中心</el-menu-item>
            <el-menu-item v-if="store.state.user.role > -1" index="/Admin">
              后台管理
            </el-menu-item>
            <el-menu-item index="#" @click="handleLogout"
              >退出登录</el-menu-item
            >
          </el-sub-menu>
          <el-menu-item index="/login" v-else>
            <template #title>
              <el-avatar icon="UserFilled"></el-avatar>
              <el-divider direction="vertical"></el-divider>
              未登录
            </template>
          </el-menu-item>
        </el-menu>
      </header>
    </div>
  </el-affix>
</template>

<style lang="less" scoped>
.header-wrap {
  background: #fff;
}
.shadow {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
header {
  margin: 0 auto;
  display: flex;
  width: 1300px;
  background: #fff;
  .logo {
    flex: 1;
    padding-left: 16px;
    img {
      height: 59px;
    }
  }
}
.el-menu {
  border-bottom: none;
}
</style>