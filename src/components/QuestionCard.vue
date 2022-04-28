<script setup>
import { cloneDeep, debounce } from "lodash";
import { Delete, Plus } from "@element-plus/icons-vue";
import md5 from "js-md5";
import { computeAnswerIndex } from "@/utils/compute.js";

const emits = defineEmits(["answer"]);
const props = defineProps({
  question: Object,
  editable: Boolean, // 添加试卷时使用，表示是否可编辑
  disabled: {
    type: Boolean,
    default: false,
  }, // 查看答题结果时使用，表示禁用
  result: String, // 查看答题结果时使用，表示用户的答案
});
const { question: _question, editable, disabled, result } = props;
// 深拷贝一份question对象，以免修改时对父组件数据造成影响
const question = reactive(cloneDeep(_question));
const user = useStore().state.user;
// 正确答案索引 单选题:0 多选题: [0, 1] 简答题: "..."
const _answer = question.type === 0 ? -1 : question.type === 1 ? [] : "";
const answer = ref(
  disabled
    ? computeAnswerIndex({ ...question, answer: result })
    : editable
    ? computeAnswerIndex(question)
    : _answer
); // 当disabled时，计算出用户选择的答案，当editable时，计算出正确答案
// 计算正确答案,用于设置class
const correct = computeAnswerIndex(question);
// 是否来自题库
const isCloud = user._id !== question.author;
// 增加选项
const addOption = () => {
  question.option.push("");
};
// 删除选项
const delOption = (i) => {
  question.option.splice(i, 1);
};

// 监听题目属性的变化，将修改后的值传回父组件
watch(
  [question, answer],
  // 使用防抖函数，减少计算频率
  debounce(() => {
    let _answer = null;
    // 计算单选题answer
    if (question.type === 0) {
      _answer = md5(question.option[answer.value]);
    }
    // 计算多选题answer
    else if (question.type === 1) {
      _answer = question.option.filter((v, i) => answer.value.includes(i));
      _answer = md5(_answer.sort().join(""));
    }
    // 计算简答题题answer
    else if (question.type === 2) {
      _answer = answer.value;
    }
    emits("answer", {
      question,
      answer: _answer,
    });
  }, 200),
  {
    deep: true,
  }
);
</script>

<template>
  <el-card class="box-card">
    <template #header>
      <div class="card-header">
        <el-row>
          <el-col :span="18">
            <slot name="index" />
            <el-input
              v-model="question.title"
              v-if="editable && !isCloud"
              maxlength="200"
              placeholder="题目"
            />
            <span style="font-weight: bold; margin-left: 16px" v-else>
              {{ question.title }}
            </span>
          </el-col>
          <el-col :span="6" style="text-align: right">
            <el-tag>
              {{ ["单选题", "多选题", "简答题"][question.type] }}
            </el-tag>
            <el-tag
              type="success"
              style="margin-left: 8px"
              v-if="editable && isCloud"
            >
              云题目
            </el-tag>
            <slot name="action" />
          </el-col>
        </el-row>
      </div>
    </template>
    <!-- 单选题 -->
    <template v-if="question.type === 0">
      <div
        class="text item"
        v-for="(o, i) in question.option"
        :key="i"
        :class="{ correct: disabled && i === correct }"
      >
        <el-radio
          v-model="answer"
          :label="i"
          size="large"
          :disabled="(editable && isCloud) || disabled"
        >
          <el-input
            v-model="question.option[i]"
            v-if="editable && !isCloud"
            :placeholder="'选项' + (i + 1)"
            maxlength="200"
          >
            <template #append>
              <el-button
                :icon="Delete"
                @click="delOption(i)"
                :disabled="question.option.length <= 2"
              />
            </template>
          </el-input>
          <template v-else>{{ o }}</template>
        </el-radio>
      </div>
    </template>
    <!-- 多选题 -->
    <template v-else-if="question.type === 1">
      <el-checkbox-group
        v-model="answer"
        :disabled="(editable && isCloud) || disabled"
      >
        <div
          class="text item"
          v-for="(o, i) in question.option"
          :key="i"
          :class="{ correct: disabled && correct.includes(i) }"
        >
          <el-checkbox :label="i" size="large">
            <el-input
              v-model="question.option[i]"
              v-if="editable && !isCloud"
              :placeholder="'选项' + (i + 1)"
              maxlength="200"
            >
              <template #append>
                <el-button
                  :icon="Delete"
                  @click="delOption(i)"
                  :disabled="question.option.length <= 2"
                />
              </template>
            </el-input>
            <template v-else>{{ o }}</template>
          </el-checkbox>
        </div>
      </el-checkbox-group>
    </template>
    <!-- 简答题 -->
    <template v-else-if="question.type === 2">
      <el-input
        class="item"
        v-model="answer"
        :placeholder="editable ? '请输入参考答案(最大长度500个字符)' : '请作答'"
        :disabled="(editable && isCloud) || disabled"
        maxlength="500"
        type="textarea"
      ></el-input>
      <br />
      <el-input
        v-if="disabled"
        disabled
        class="correct"
        :modelValue="question.answer"
      >
        <template #prepend>参考答案</template>
      </el-input>
    </template>
    <el-button
      v-if="
        editable &&
        !isCloud &&
        question.option.length < 4 &&
        question.type !== 2
      "
      @click="addOption"
      :icon="Plus"
    >
      增加选项
    </el-button>
    <slot name="footer"></slot>
  </el-card>
</template>

<style lang="less" scoped>
.el-radio,
.el-checkbox {
  width: 100%;
}
.text {
  font-size: 14px;
}
.el-input {
  width: 600px;
  margin-left: 16px;
}
.correct {
  background-color: #f0f9eb;
  border-radius: 8px;
}
.item {
  margin: 8px;
  padding: 0 8px;
}
</style>
