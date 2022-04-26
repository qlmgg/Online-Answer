<script setup>
import { reactive, ref } from "vue";
import _school from "@/assets/school.json";

// defineProps和defineEmits是编译器宏，不需要从vue中导入
const props = defineProps(["value"]);
const emits = defineEmits(["schoolChange"]);
// select初始值，如果是学校代码转成学校名
const initValue = ref(
  typeof props.value === "number"
    ? _school.find((v) => v.univ_id == props.value).univ_name
    : props.value
);
// 过滤后的学校数组
const school = reactive([]);
// 通过输入过滤学校
const schoolFilter = (query = "") => {
  let res = _school.filter((v) => v.univ_name.includes(query));
  if (res.length > 50) {
    res = res.splice(0, 50);
  }
  school.splice(0);
  school.push(...res);
};

// 选择器值改变事件
const handleChange = (v) => {
  // 触发schoolChange事件
  emits("schoolChange", Number(v));
};
</script>

<template>
  <el-select
    filterable
    v-model="initValue"
    @change="handleChange"
    :filter-method="schoolFilter"
    placeholder="请搜索"
    clearable
  >
    <el-option
      v-for="s in school"
      :key="s.univ_id"
      :label="s.univ_name"
      :value="s.univ_id"
    ></el-option>
  </el-select>
</template>