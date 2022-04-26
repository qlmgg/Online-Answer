<script setup>
import { onMounted, ref } from "vue";

const props = defineProps({
  banners: Array,
  autoplay: {
    type: Boolean,
    default: true,
  },
});
const emits = defineEmits(["change", "setActiveItem"]);
const { banners, autoplay } = props;
const bannerElement = ref(null);
// banner切换时，通知父组件
const handleChange = (newIndex, oldIndex) => {
  emits("change", newIndex, oldIndex);
};
// 暴露给父组件的方法：用于触发切换
const setActiveItem = (index) => {
  if (bannerElement.value) {
    bannerElement.value.setActiveItem(index);
  }
};
// 将方法暴露给父组件
defineExpose({ setActiveItem });
</script>


<template>
  <el-carousel
    indicator-position="outside"
    ref="bannerElement"
    height="300px"
    :autoplay="autoplay"
    @change="handleChange"
  >
    <el-carousel-item v-for="banner in banners" :key="banner._id">
      <router-link :to="banner.url">
        <el-image
          style="width: 100%; height: 100%"
          :src="banner.cover"
          fit="fill"
        />
      </router-link>
    </el-carousel-item>
  </el-carousel>
</template>

<style scoped>
.el-carousel {
  margin-bottom: 20px;
}
.el-carousel__item {
  background-color: #99a9bf;
}
</style>