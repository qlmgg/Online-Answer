<script setup>
import { UserFilled } from "@element-plus/icons-vue";
import SchoolSelect from "@/components/SchoolSelect.vue";
import { updateUser, updatePwd } from "@/api/index.js";
import { HOST } from "@/utils/request.js";

const store = useStore();
const user = store.state.user;

// 编辑基本信息
const showEditUser = ref(!true);
const editUser = reactive({
  avatar: user.avatar,
  gender: user.gender,
  role: user.role,
  profile: user.profile,
  nickname: user.nickname,
  school: user.school,
});
const schoolChange = (v) => {
  editUser.school = v;
};
// 编辑密码
const showEditPwd = ref(!true);
const editPwd = reactive({
  pwd: "",
  pwd1: "",
  pwd2: "",
});
// 更新用户
const handleUpdateUser = async () => {
  await updateUser({ id: user._id, data: editUser });
  showEditUser.value = false;
  user.avatar = editUser.avatar;
  user.gender = editUser.gender;
  user.role = editUser.role;
  user.profile = editUser.profile;
  user.nickname = editUser.nickname;
  user.school = editUser.school;
  store.commit("updateUser", user);
  ElNotification({
    title: "Success",
    message: "更新成功",
    type: "success",
    position: "top-left",
  });
};
// 头像文件上传成功事件
const handleAvatarSuccess = (res, file) => {
  // imageUrl.value = URL.createObjectURL(file.raw);
  editUser.avatar = res.data.url;
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
  return isImage && isLt2M;
};

// 更新密码
const handleUpdatePwd = async () => {
  if (!editPwd.pwd || !editPwd.pwd1 || !editPwd.pwd2) {
    ElMessage({
      showClose: true,
      message: "请输入完整",
      type: "warning",
    });
    return;
  }
  if (editPwd.pwd1 !== editPwd.pwd2) {
    ElMessage({
      showClose: true,
      message: "两次密码不一致",
      type: "warning",
    });
    return;
  }
  const res = await updatePwd({
    id: user._id,
    data: {
      pwd: editPwd.pwd,
      new: editPwd.pwd1,
    },
  });
  if (res.code === 0) {
    ElNotification({
      title: "Success",
      message: "更新成功",
      type: "success",
      position: "top-left",
    });
    showEditPwd.value = false;
    editPwd.pwd = "";
    editPwd.pwd1 = "";
    editPwd.pwd2 = "";
  } else {
    ElNotification({
      title: "Success",
      message: "更新失败：" + res.msg,
      type: "error",
      position: "top-left",
    });
  }
};
</script>
<template>
  <el-avatar :size="120" :src="user.avatar">
    <el-icon :size="100"> <UserFilled /> </el-icon>
  </el-avatar>
  <el-descriptions title="个人资料" direction="vertical" :column="5" border>
    <el-descriptions-item label="用户ID">
      {{ user._id }}
    </el-descriptions-item>
    <el-descriptions-item label="用户名">
      {{ user.username }}
    </el-descriptions-item>
    <el-descriptions-item label="昵称">
      {{ user.nickname }}
    </el-descriptions-item>
    <el-descriptions-item label="性别">
      {{ ["女", "男", "保密"][user.gender] }}
    </el-descriptions-item>
    <el-descriptions-item label="角色">
      {{ ["学生", "教师", "管理员"][user.role] }}
    </el-descriptions-item>
    <el-descriptions-item label="个人简介" :span="5">
      {{ user.profile }}
    </el-descriptions-item>
  </el-descriptions>
  <el-button @click="showEditUser = true">编辑资料</el-button>
  <el-button @click="showEditPwd = true" type="danger">修改密码</el-button>

  <!-- 编辑用户信息 -->
  <el-dialog v-model="showEditUser" title="编辑个人资料">
    <el-form :model="editUser">
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
          <el-avatar :src="editUser.avatar" :size="100" class="avatar">
            <el-icon :size="80"><UserFilled /></el-icon>
          </el-avatar>
        </el-upload>
      </el-form-item>
      <el-form-item label="昵称" label-width="80px">
        <el-input
          v-model="editUser.nickname"
          maxlength="12"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="性别" label-width="80px">
        <el-select v-model="editUser.gender">
          <el-option label="女性" :value="0" />
          <el-option label="男性" :value="1" />
          <el-option label="保密" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="学校" label-width="80px">
        <SchoolSelect :value="editUser.school" @schoolChange="schoolChange" />
      </el-form-item>
      <el-form-item label="个人简介" label-width="80px">
        <el-input
          v-model="editUser.profile"
          autocomplete="off"
          type="textarea"
          :rows="4"
          maxlength="500"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditUser = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdateUser"> 更新 </el-button>
      </span>
    </template>
  </el-dialog>
  <!-- 修改密码 -->
  <el-dialog v-model="showEditPwd" title="修改密码">
    <el-form>
      <el-form-item label="原密码" label-width="80px">
        <el-input
          v-model="editPwd.pwd"
          type="password"
          show-password
          maxlength="50"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="新密码" label-width="80px">
        <el-input
          v-model="editPwd.pwd1"
          type="password"
          show-password
          maxlength="50"
          autocomplete="off"
        />
      </el-form-item>
      <el-form-item label="再次输入" label-width="80px">
        <el-input
          v-model="editPwd.pwd2"
          type="password"
          show-password
          maxlength="50"
          autocomplete="off"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditPwd = false">Cancel</el-button>
        <el-button type="primary" @click="handleUpdatePwd"> 更改 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<style scoped>
.el-descriptions {
  margin: 16px 0;
}
</style>
