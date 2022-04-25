<script setup>
import { debounce } from "lodash";
import { useStore } from "vuex";
import { reactive, ref, onMounted, onUnmounted } from "vue";

import {
  getUsers,
  deleteUser,
  deleteUsers,
  updateUser,
} from "@/request/api.js";
import SchoolSelect from "@/components/SchoolSelect.vue";
import school from "@/assets/school.json";

// 定义prop
const prop = defineProps({
  role: Number,
});

// 接收role
const role = ref(prop.role);

const user = useStore().state.user;

// 搜索过滤器
const filter = reactive({
  keywords: "",
  page: 1,
  role: role.value,
  ban: "",
  gender: "",
});
// 用户总数量
const total = ref(0);
// 用户列表
const users = reactive([]);
// 加载中
const loading = ref(true);
// 显示编辑用户界面
const showEditView = ref(false);
// 正在编辑的用户信息
const editUserInfo = reactive({
  index: -1,
  _id: "",
  username: "",
  nickname: "",
  school: 0,
  ban: false,
  role: 0,
});
// 多选 选中的用户
const multipleSelection = ref([]);

// 获取用户列表
const handleGetUsers = async () => {
  loading.value = true;
  const res = await getUsers(filter);
  loading.value = false;
  if (res.code !== 0) {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
    });
    return;
  }
  users.splice(0);
  users.push(...res.data.users);
  total.value = res.data.total;
};

// 翻页事件
const handleChange = (page) => {
  filter.page = page;
  handleGetUsers();
};

// 搜索事件
const handleSearch = debounce(() => {
  handleGetUsers();
}, 500);

// 重置搜索条件
const handleResetFilter = () => {
  filter.keywords = "";
  filter.ban = "";
  filter.gender = "";
  handleGetUsers();
};

// 确认删除用户事件
const handleDeleteUser = async (index, _user) => {
  const { _id } = _user;
  const res = await deleteUser(_id);
  if (res.code === 0) {
    users.splice(index, 1);
    ElNotification({
      title: "Success",
      message: "已删除用户：" + _user.nickname,
      type: "success",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "删除失败：" + res.msg,
      type: "warning",
    });
  }
};

// 封禁、解封用户事件
const handleBanUser = async (index, _user) => {
  const { _id: id, ban } = _user;
  if (id === user._id) {
    ElNotification({
      title: "Warning",
      message: "无法封禁自己",
      type: "warning",
    });
    return;
  }
  const data = {
    ban: !ban,
  };
  const res = await updateUser({ id, data });
  if (res.code === 0) {
    users[index].ban = res.data.ban;
    ElNotification({
      title: "Success",
      message: `已${ban ? "解封" : "封禁"}用户：` + user.nickname,
      type: "success",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
    });
  }
};

// 编辑用户事件
const handleEditUser = async (index, user) => {
  showEditView.value = true;
  const { _id, nickname, ban, school, username, role } = user;
  editUserInfo.index = index;
  editUserInfo._id = _id;
  editUserInfo.username = username;
  editUserInfo.nickname = nickname;
  editUserInfo.ban = ban;
  editUserInfo.school = school;
  editUserInfo.role = role;
};

// 更新用户事件
const handleUpdateUser = async () => {
  showEditView.value = false;
  const id = editUserInfo._id;
  const data = {
    username: editUserInfo.username,
    nickname: editUserInfo.nickname,
    ban: editUserInfo.ban,
    school: editUserInfo.school,
    role: editUserInfo.role,
  };
  const res = await updateUser({ id, data });
  if (res.code === 0) {
    users[editUserInfo.index] = res.data;
    ElNotification({
      title: "Success",
      message: `更新用户成功: ${editUserInfo.nickname}`,
      type: "success",
    });
  } else {
    ElNotification({
      title: "Warning",
      message: "出错：" + res.msg,
      type: "warning",
    });
  }
};
// 响应SchoolSelect组件的传值
const handleSchoolChange = (v) => {
  editUserInfo.school = v;
};

// 表格多选事件
const handleSelectionChange = (arr) => {
  multipleSelection.value = arr;
};

// 删除多选
const handleDeleteSelection = async () => {
  const count = multipleSelection.value.length;
  const res = await deleteUsers(multipleSelection.value.map((v) => v._id));
  const failedCount = count - res.data.deletedCount;
  ElNotification({
    title: "Success",
    message:
      `已删除: ${res.data.deletedCount}个用户` +
      (failedCount ? `, ${failedCount}个删除失败` : ""),
    type: "success",
  });
  handleSearch();
};

// 键盘翻页事件
const prevPage = () => {
  filter.page = filter.page > 1 ? filter.page - 1 : 1;
  handleSearch();
};
const nextPage = () => {
  const pageCount = Math.ceil(total.value / 10);
  filter.page = filter.page < pageCount ? filter.page + 1 : pageCount;
  handleSearch();
};
const handleKeyUp = (e) => {
  if (e.key === "ArrowRight") {
    nextPage();
  } else if (e.key === "ArrowLeft") {
    prevPage();
  }
};
onMounted(() => {
  window.addEventListener("keyup", handleKeyUp);
});
onUnmounted(() => {
  window.removeEventListener("keyup", handleKeyUp);
});

handleGetUsers();
</script>

<template>
  <el-container>
    <el-header style="padding: 16px">
      <el-row>
        <el-col :span="7">
          用户状态:
          <el-select
            v-model="filter.ban"
            placeholder="Select"
            @change="handleGetUsers"
          >
            <el-option label="全部" value="" />
            <el-option label="封禁" :value="true" />
            <el-option label="正常" :value="false" />
          </el-select>
        </el-col>
        <el-col :span="7">
          用户性别:
          <el-select
            v-model="filter.gender"
            placeholder="Select"
            @change="handleGetUsers"
          >
            <el-option label="全部" value="" />
            <el-option label="男性" :value="1" />
            <el-option label="女性" :value="0" />
            <el-option label="保密" :value="2" />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-input
            v-model="filter.keywords"
            placeholder="搜索：用户名、昵称、学校"
            clearable
            @input="handleSearch"
          />
        </el-col>
        <el-col :span="2">
          <el-button style="margin-left: 4px" @click="handleResetFilter"
            >重置</el-button
          >
        </el-col>
      </el-row>
    </el-header>
    <el-main>
      <el-scrollbar>
        <div>
          <el-popconfirm
            title="你确定要删除这些用户吗？"
            @confirm="handleDeleteSelection"
          >
            <template #reference>
              <el-button
                type="danger"
                size="small"
                :disabled="!multipleSelection.length"
              >
                删除所选
              </el-button>
            </template>
          </el-popconfirm>
        </div>
        <el-table
          stripe
          :data="users"
          v-loading="loading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="nickname" label="昵称" />
          <el-table-column prop="ban" label="性别" width="80px">
            <template #default="scope">
              {{ ["女", "男", "保密"][scope.row.gender] }}
            </template>
          </el-table-column>
          <el-table-column prop="ban" label="状态" width="80px">
            <template #default="scope">
              <el-tag :type="scope.row.ban ? 'danger' : 'success'">
                {{ scope.row.ban ? "封禁" : "正常" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="school" label="学校">
            <template #default="scope">
              {{ school.find((v) => v.univ_id == scope.row.school).univ_name }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                @click="handleEditUser(scope.$index, scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                @click="handleBanUser(scope.$index, scope.row)"
              >
                {{ scope.row.ban ? "解封" : "封禁" }}
              </el-button>
              <el-popconfirm
                title="你确定要删除这个用户吗？"
                @confirm="handleDeleteUser(scope.$index, scope.row)"
              >
                <template #reference>
                  <el-button size="small" type="danger"> 删除 </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
    </el-main>

    <el-pagination
      :page-size="10"
      :total="total"
      v-model:current-page="filter.page"
      layout="prev, pager, next, jumper"
      background
      @current-change="handleChange"
    />
  </el-container>
  <el-dialog v-model="showEditView" title="编辑用户信息">
    <el-form>
      <el-form-item label="用户ID">
        <el-tooltip
          class="box-item"
          effect="dark"
          content="此项不可更改"
          placement="top"
        >
          <el-input autocomplete="off" v-model="editUserInfo._id" disabled />
        </el-tooltip>
      </el-form-item>
      <el-form-item label="用户名">
        <el-input autocomplete="off" v-model="editUserInfo.username" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input autocomplete="off" v-model="editUserInfo.nickname" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="editUserInfo.role">
          <el-option :value="0" label="学生"></el-option>
          <el-option :value="1" label="教师"></el-option>
          <el-option :value="2" label="管理员"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="学校">
        <SchoolSelect
          :value="editUserInfo.school"
          @schoolChange="handleSchoolChange"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showEditView = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateUser">更新</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style lang="less" scoped>
.el-pagination {
  margin: 20px 0;
}
</style>