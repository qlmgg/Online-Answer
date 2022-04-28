<script setup>
import Banner from "@/components/Banner.vue";
import {
  getBanner,
  postBanner,
  updateBanner,
  deleteBanner,
} from "@/api/index.js";

const index = ref(0);
const bannerElement = ref(null);
const banners = reactive([]);

// 增加Banner
const addBanner = () => {
  banners.push({
    _id: banners.length,
    cover: "",
    url: "",
  });
  index.value = banners.length - 1;
};

// 删除Banner
const handleDelete = async () => {
  const res = await deleteBanner(banners[index.value]._id);
  banners.splice(index.value, 1);
  ElNotification({
    title: "提示",
    message: res.msg,
    type: "success",
  });
};

// 保存Banner
const handleSave = async () => {
  if (typeof banners[index.value]._id === "number") {
    const res = await postBanner(banners[index.value]);
    banners[index.value]._id = res.data._id;
    ElNotification({
      title: "提示",
      message: res.msg,
      type: "success",
    });
  } else {
    const res = await updateBanner({
      id: banners[index.value]._id,
      data: banners[index.value],
    });
    ElNotification({
      title: "提示",
      message: res.msg,
      type: "success",
    });
  }
};

// 调用子组件的setActiveItem方法
const handleChangeBanner = (index) => {
  if (bannerElement.value) {
    bannerElement.value.setActiveItem(index);
  }
};

(async () => {
  const res = await getBanner();
  banners.splice(0);
  banners.push(...res.data);
})();
</script>

<template>
  <el-container>
    <el-main>
      <h2>预览</h2>
      <Banner
        ref="bannerElement"
        :key="banners.length"
        :banners="banners"
        :autoplay="false"
        @change="(newIndex) => (index = newIndex)"
      />
      <el-button
        size="small"
        v-for="(b, i) in banners"
        @click="handleChangeBanner(i)"
        :type="index === i ? 'primary' : ''"
      >
        {{ i + 1 }}
      </el-button>
      <el-form style="margin-top: 16px">
        <el-form-item v-if="banners[index]" label="封面图片">
          <el-input placeholder="/uploads/example.jpg" v-model="banners[index].cover"></el-input>
        </el-form-item>
        <el-form-item v-if="banners[index]" label="跳转链接">
          <el-input placeholder="/exampaper/:id" v-model="banners[index].url"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="addBanner"> 新增 </el-button>
          <el-button type="danger" @click="handleDelete"> 删除当前 </el-button>
          <el-button type="primary" @click="handleSave">保存当前修改</el-button>
        </el-form-item>
      </el-form>
    </el-main>
  </el-container>
</template>