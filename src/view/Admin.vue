<script setup>
import {
  Menu as IconMenu,
  User as IconUser,
  Paperclip,
  ToiletPaper,
} from "@element-plus/icons-vue";
const user = useStore().state.user;
</script>

<template>
  <el-container>
    <el-aside width="200px">
      <el-scrollbar>
        <el-menu :default-openeds="['0']" router :unique-opened="true">
          <el-sub-menu index="0">
            <template #title>
              <el-icon><icon-menu /></el-icon>平台概览
            </template>
            <el-menu-item-group>
              <el-menu-item index="/Admin">概览</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <el-menu-item index="/Admin/Banner">Banner</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="1">
            <template #title>
              <el-icon><icon-user /></el-icon>用户管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="/Admin/Students">学生列表</el-menu-item>
              <el-menu-item v-if="user.role > -1" index="/Admin/Teachers">
                教师列表
              </el-menu-item>
              <el-menu-item v-if="user.role > -1" index="/Admin/Administrators">
                管理员列表
              </el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template #title>
              <el-icon><paperclip /></el-icon>试卷管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="/Admin/Papers">试卷列表</el-menu-item>
              <el-menu-item index="/Admin/AddPaper">添加试卷</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <el-sub-menu index="3">
            <template #title>
              <el-icon><toiletPaper /></el-icon>题库管理
            </template>
            <el-menu-item-group>
              <el-menu-item index="/Admin/Questions">题目列表</el-menu-item>
              <el-menu-item index="/Admin/AddQuestion">添加题目</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <router-view></router-view>
  </el-container>
</template>

<style scoped>
.el-menu {
  min-height: calc(100vh - 180px);
}
</style>