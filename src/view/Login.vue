<script setup>
import { login } from "@/api/index.js";

const store = useStore();
const router = useRouter();

const loading = ref(false);
const form = reactive({
  username: "admin",
  password: "admin",
});

// 登录事件
const onSubmit = () => {
  if (!form.username.trim() || !form.password.trim()) {
    return;
  }
  loading.value = true;
  login({
    username: form.username.trim(),
    password: form.password.trim(),
  })
    .then((res) => {
      loading.value = false;
      if (res.code === 0) {
        store.dispatch("updateUser", res.data);
        ElMessage({
          message: `登录成功，${res.data.nickname}！`,
          type: "success",
        });
        // 跳转界面
        router.push("/");
        return;
      }
      ElMessage.error(res.msg);
    })
    .catch((e) => {
      loading.value = false;
    });
};
</script>

<template>
  <el-form ref="formRef" :model="form" label-width="120px">
    <el-form-item label=" " justify="center">
      <el-image
        style="width: 100px; height: 100px"
        src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
        fit="cover"
      ></el-image>
    </el-form-item>
    <el-form-item label="用户名">
      <el-input v-model="form.username" maxlength="20"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input v-model="form.password" type="password" show-password maxlength="50"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit" :loading="loading" :disabled="loading"
        >登录</el-button
      >
    </el-form-item>
    <el-form-item>
      <router-link to="/Register" class="link"> 没有账户？点击注册！ </router-link>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-form {
  padding: 32px;
  width: 600px;
  box-sizing: border-box;
}
</style>
