<script setup>
import { ref, reactive } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { Plus, Edit } from "@element-plus/icons-vue";
import md5 from "js-md5";

import SchoolSelect from "@/components/SchoolSelect.vue";
import { register } from "@/request/api.js";
import { HOST } from "@/request/service.js";

const store = useStore();
const router = useRouter();

const loading = ref(false);
// 上传头像的URL
const imageUrl = ref("");
const uploadRef = ref(null)
// 注册表单
const form = reactive({
  username: "",
  password1: "",
  password2: "",
  school: "",
  nickname: "管理员",
  avatar: "",
  gender: 2,
});

// 注册事件
const onSubmit = async () => {
  if (
    !form.username ||
    !form.password1 ||
    !form.password2 ||
    !form.nickname ||
    !form.school
  ) {
    ElMessage({
      message: "请填写完整",
      type: "info",
    });
    return;
  }
  if (form.password1 !== form.password2) {
    ElMessage({
      message: "两次密码不一致",
      type: "info",
    });
    return;
  }
  loading.value = true;
  let res;
  try {
    // 上传头像
    uploadRef.value.submit()
    res = await register({
      username: form.username,
      password: md5(form.password1),
      nickname: form.nickname,
      school: Number(form.school),
      gender: form.gender,
      avatar: form.avatar,
    });
  } finally {
    loading.value = false;
  }
  if (!res || res.code !== 0) {
    ElMessage.error(res.msg);
    return;
  }
  ElMessage({
    message: `注册成功，${res.data.nickname}！`,
    type: "success",
  });
  // 跳转界面
  router.push("/login");
};

// 头像文件上传成功事件
const handleAvatarSuccess = (res, file) => {
  imageUrl.value = URL.createObjectURL(file.raw);
  form.avatar = res.data.url;
};

// 头像上传之前事件
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith("image/");
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) {
    ElMessage.error("头像必须是一个图片格式");
  }
  if (!isLt2M) {
    ElMessage.error("头像尺寸不能超过2MB");
  }
  console.log(file.raw);
  return isImage && isLt2M;
};

// 响应SchoolSelect组件的传值
const handleSchoolChange = (v) => {
  form.school = v;
};
</script>

<template>
  <el-form ref="formRef" :model="form" label-width="120px">
    <el-form-item label=" " justify="center">
      <el-upload
        ref="uploadRef"
        class="avatar-uploader"
        :action="`${HOST}/files/avatar`"
        :show-file-list="false"
        :auto-upload="true"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
      </el-upload>
    </el-form-item>
    <el-form-item label="用户名">
      <el-input v-model="form.username"></el-input>
    </el-form-item>
    <el-form-item label="密码">
      <el-input
        v-model="form.password1"
        type="password"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item label="确认密码">
      <el-input
        v-model="form.password2"
        type="password"
        show-password
      ></el-input>
    </el-form-item>
    <el-form-item label="昵称">
      <el-input v-model="form.nickname"></el-input>
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="form.gender">
        <el-radio :label="2">保密</el-radio>
        <el-radio :label="1">男</el-radio>
        <el-radio :label="0">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="学校">
      <SchoolSelect @schoolChange="handleSchoolChange" />
    </el-form-item>
    <el-form-item>
      <el-button
        type="primary"
        @click="onSubmit"
        :loading="loading"
        :disabled="loading"
        >注册</el-button
      >
    </el-form-item>
    <el-form-item>
      <el-link href="#/login">已有账户，去登录</el-link>
    </el-form-item>
  </el-form>
</template>

<style scoped>
.el-form {
  padding: 32px;
  width: 600px;
  box-sizing: border-box;
  background-color: #fff;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>