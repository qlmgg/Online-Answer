module.exports = {
    root: true,
    // 设置我们的运行环境为浏览器 + es2021 + node ,否则eslint在遇到 Promise，window等全局对象时会报错
    env: {
        browser: true,
        es2021: true,
        node: true,
        // 开启setup语法糖环境
        "vue/setup-compiler-macros": true
    },
    // 继承
    extends: [
        // vue基本的规则集
        'plugin:vue/vue3-essential',
        // eslint推荐的规则集
        'eslint:recommended',
        // 自动导入规则集
        './.eslintrc-auto-import.json'
    ],
    // 添加vue插件，增强eslint的能力
    plugins: [
        'vue'
    ],
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: "module"
    },
    rules: {
    },
    overrides: [
    ],
    globals: {
    }
};