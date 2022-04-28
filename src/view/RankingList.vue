<script setup>
import { getRankingList } from "@/api/index.js";

// 排行榜类别
const rankType = ref("paper");
// 排行榜日期
const rankDate = ref("today");
const list = reactive([]);

const handleChange = async (v) => {
  const res = await getRankingList({
    rankType: rankType.value,
    rankDate: rankDate.value,
  });
  list.splice(0);
  list.push(...res.data);
};

handleChange();
</script>

<template>
  <!-- 头部 -->
  <div class="bg">
    <el-select class="rank-type" v-model="rankType" @change="handleChange">
      <el-option value="paper" label="答卷榜"></el-option>
      <el-option value="question" label="答题榜"></el-option>
    </el-select>
    <el-row justify="center">
      <el-radio-group
        v-model="rankDate"
        style="margin: 16px 0"
        @change="handleChange"
      >
        <el-radio-button label="today">今日榜</el-radio-button>
        <el-radio-button label="week">周榜</el-radio-button>
        <el-radio-button label="month">月榜</el-radio-button>
        <el-radio-button label="overall">总榜</el-radio-button>
      </el-radio-group>
    </el-row>
    <!-- 前三名 -->
    <el-row justify="center" class="top-three">
      <el-col :span="3" v-if="list[1]" class="no-2">
        <el-avatar :size="70" :src="list[1].user.avatar"></el-avatar>
        <span class="nickname">{{ list[1].user.nickname }}</span>
        <span class="count">{{ list[1].count }}</span>
      </el-col>
      <el-col :span="3" v-else class="no-2">
        <el-avatar :size="70"></el-avatar>
        <span class="nickname">虚位以待</span>
        <span class="count">-</span>
      </el-col>
      <el-col :span="3" v-if="list[0]" class="no-1">
        <el-avatar :size="80" :src="list[0].user.avatar"></el-avatar>
        <span class="nickname">{{ list[0].user.nickname }}</span>
        <span class="count">{{ list[0].count }}</span>
      </el-col>
      <el-col :span="3" v-else class="no-1">
        <el-avatar :size="80"></el-avatar>
        <span class="nickname">虚位以待</span>
        <span class="count">-</span>
      </el-col>
      <el-col :span="3" v-if="list[2]" class="no-3">
        <el-avatar :size="60" :src="list[2].user.avatar"></el-avatar>
        <span class="nickname">{{ list[2].user.nickname }}</span>
        <span class="count">{{ list[2].count }}</span>
      </el-col>
      <el-col :span="3" v-else class="no-3">
        <el-avatar :size="60"></el-avatar>
        <span class="nickname">虚位以待</span>
        <span class="count">-</span>
      </el-col>
    </el-row>
  </div>
  <!-- 其他排名 -->
  <el-space fill wrap>
    <el-card v-for="(l, i) in list.slice(3)" :key="l._id" shadow="hover">
      <div class="item">
        <span class="index">{{ i + 4 }}</span>
        <el-avatar :src="l.user.avatar"></el-avatar>
        <span class="nickname">{{ l.user.nickname }}</span>
        <span class="count">{{ l.count }}</span>
      </div>
    </el-card>
  </el-space>
  <!-- 排名为空 -->
  <el-empty
    v-if="list.slice(3).length === 0"
    description="快来答题，下一个上榜的就是你！"
  >
    <router-link to="/" class="link">
      <el-button type="primary">去答题</el-button>
    </router-link>
  </el-empty>
</template>

<style lang="less" scoped>
.bg {
  position: relative;
  background-color: #8ec5fc;
  background-image: linear-gradient(62deg, #8ec5fc 0%, #e0c3fc 100%);
}
.rank-type {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 100px;
}
.top-three {
  .el-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 8px;
  }
  .nickname {
    margin: 8px 0;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.532);
  }
  .count {
    font-size: 22px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.532);
  }
  .no-1 {
    border-bottom: 64px solid #fbe781;
    .el-avatar {
      border: 4px solid #fbe781;
    }
    .nickname {
      font-size: 18px;
    }
    .count {
      color: #fbe781;
    }
  }
  .no-2 {
    border-bottom: 42px solid #d6d7e4;
    .el-avatar {
      border: 4px solid #d6d7e4;
    }
    .nickname {
      font-size: 16px;
    }
    .count {
      color: #d6d7e4;
    }
  }
  .no-3 {
    border-bottom: 24px solid #f7c58d;
    .el-avatar {
      border: 4px solid #f7c58d;
    }
    .nickname {
      font-size: 14px;
    }
    .count {
      color: #f7c58d;
    }
  }
}

.el-space {
  padding: 32px;
}
.item {
  display: flex;
  align-items: center;
  .index {
    width: 40px;
    margin-left: 8px;
    font-size: 24px;
    color: gray;
  }
  .nickname {
    font-weight: bold;
    margin-left: 16px;
  }
  .count {
    margin-left: auto;
    margin-right: 32px;
    font-size: 24px;
    color: gray;
  }
}
</style>