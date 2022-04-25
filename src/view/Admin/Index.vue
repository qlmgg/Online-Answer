<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import * as echarts from "echarts";

import { getStatus } from "@/request/api.js";

// 图表的ref
const myChartsRefs = {
  user: ref(null),
  growth: ref(null),
  question: ref(null),
  api: ref(null),
};
// 图表实例
const myChartsInstance = [];

onMounted(async () => {
  // 用户性别比例
  const userChart = echarts.init(myChartsRefs.user.value);
  // 用户增长趋势
  const growthChart = echarts.init(myChartsRefs.growth.value);
  // 题目类型比例
  const questionChart = echarts.init(myChartsRefs.question.value);
  // api请求统计
  const apiChart = echarts.init(myChartsRefs.api.value);

  const userOption = {
    title: { text: "用户性别比例", subtext: "用户总数: ", left: "center" },
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", left: "left" },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: "50%",
        data: [
          { value: 0, name: "男" },
          { value: 0, name: "女" },
          { value: 0, name: "保密" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };
  const growthOption = {
    title: { text: "用户增长趋势", subtext: "今日新增: 0", left: "center" },
    xAxis: { type: "category", data: ["前天", "昨天", "今天"] },
    yAxis: { type: "value" },
    series: [{ data: [0, 0, 0], type: "line" }],
  };
  const questionOption = {
    title: { text: "题目类型", subtext: "题目总数: ", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "category", data: ["单选题", "多选题", "简答题"] },
    yAxis: { type: "value" },
    series: [{ data: [0, 0, 0], type: "bar" }],
  };
  const apiOption = {
    title: { text: "API请求统计", subtext: "总请求量: ", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", boundaryGap: [0, 0.01] },
    yAxis: { type: "category", data: [] },
    series: [
      { name: "今日请求", type: "bar", data: [] },
      { name: "总计", type: "bar", data: [] },
    ],
  };

  userChart.setOption(userOption);
  growthChart.setOption(growthOption);
  questionChart.setOption(questionOption);
  apiChart.setOption(apiOption);

  myChartsInstance.push(userChart);
  myChartsInstance.push(growthChart);
  myChartsInstance.push(questionChart);
  myChartsInstance.push(apiChart);

  // 获取统计数据
  try {
    const { code, data } = await getStatus();
    if (code === 0) {
      const { user, question, api, user_growth } = data;
      // 更新用户统计表数据
      userOption.title.subtext =
        "用户总数: " + Object.values(user).reduce((p, c) => p + c);
      userOption.series[0].data[0].value = user.male;
      userOption.series[0].data[1].value = user.female;
      userOption.series[0].data[2].value = user.secret;
      userChart.setOption(userOption);
      // 更新用户增长表数据
      const date = new Date();
      const Y = date.getFullYear();
      const M = date.getMonth() + 1;
      const D = date.getDate();
      const today = user_growth.find((v) => v.date === `${Y}/${M}/${D}`);
      if (today) {
        growthOption.title.subtext = "今日新增: " + today.count;
      }
      if (user_growth.length) {
        growthOption.xAxis.data = user_growth.map((v) => v.date);
        growthOption.series[0].data = user_growth.map((v) => v.count);
        growthChart.setOption(growthOption);
      }
      // 更新题目表统计数据
      questionOption.title.subtext =
        "题目总数: " + Object.values(question).reduce((p, c) => p + c);
      questionOption.series[0].data[0] = question.single;
      questionOption.series[0].data[1] = question.multi;
      questionOption.series[0].data[2] = question.short;
      questionChart.setOption(questionOption);
      // 更新API表统计数据
      apiOption.title.subtext =
        "总请求量: " + api.reduce((p, c) => p + c.today, api[0].today);
      apiOption.yAxis.data = api.map((v) => v.name);
      apiOption.series[0].data = api.map((v) => v.today);
      apiChart.setOption(apiOption);
    }
  } catch (e) {
    console.log(e);
  }
});

onUnmounted(() => {
  myChartsInstance.forEach((c) => {
    c.dispose();
  });
});
</script>


<template>
  <div class="echarts-box">
    <el-row>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div
            class="text item"
            :ref="myChartsRefs.user"
            :style="{ width: '400px', height: '200px' }"
          ></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div
            class="text item"
            :ref="myChartsRefs.growth"
            :style="{ width: '400px', height: '200px' }"
          ></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div
            class="text item"
            :ref="myChartsRefs.question"
            :style="{ width: '400px', height: '200px' }"
          ></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card" shadow="hover">
          <div
            class="text item"
            :ref="myChartsRefs.api"
            :style="{ width: '400px', height: '200px' }"
          ></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less" scoped>
.echarts-box {
  width: 100%;
  padding: 10px;
}
.box-card {
  margin: 10px;
}
</style>