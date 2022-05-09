import { createRouter, createWebHistory, createWebHashHistory } from "vue-router";

import Home from "@/view/Home.vue";

const routes = [
  // 主页路由
  { path: "/", name: "Home", component: Home },
  // 关于页面路由
  { path: "/about", name: "About", component: () => import("@/view/About.vue") },
  // 登录页面路由
  { path: "/login", name: "Login", component: () => import("@/view/Login.vue") },
  // 注册页面路由
  { path: "/register", name: "Register", component: () => import("@/view/Register.vue") },
  // 试卷详情页面路由
  { path: "/exampaper/:id", name: "Exampaper", component: () => import("@/view/Exampaper.vue") },
  // 答题页面路由
  { path: "/answer/:id", name: "Anwser", component: () => import("@/view/Anwser.vue") },
  // 答题结果页面路由
  { path: "/result/:id", name: "Result", component: () => import("@/view/Result.vue") },
  // 搜索页面路由
  { path: "/search", name: "Search", component: () => import("@/view/Search.vue") },
  // 题目详情页面路由
  { path: "/question/:id", name: "Question", component: () => import("@/view/Question.vue") },
  // 排行榜页面路由
  { path: "/rankinglist", name: "RankingList", component: () => import("@/view/RankingList.vue") },

  // 个人中心页面路由
  {
    path: "/center",
    name: "Center",
    component: () => import("@/view/Center.vue"),
    children: [
      { path: "", component: () => import("@/view/Center/Info.vue") },
      { path: "papers", component: () => import("@/view/Center/Papers.vue") },
      { path: "questions", component: () => import("@/view/Center/Questions.vue") },
      { path: "collects", component: () => import("@/view/Center/Collects.vue") },
    ],
  },

  // 后台路由
  {
    path: "/admin",
    name: "Admin",
    component: () => import("@/view/Admin.vue"),
    children: [
      { path: "", component: () => import("@/view/Admin/Index.vue") },
      // Banner管理
      { path: "banner", component: () => import("@/view/Admin/Banner.vue") },
      // 热词管理
      { path: "Trending", component: () => import("@/view/Admin/Trending.vue") },
      // 学生管理
      { path: "students", component: () => import("@/view/Admin/Students.vue") },
      // 教师管理
      { path: "teachers", component: () => import("@/view/Admin/Teachers.vue") },
      // 管理员管理
      { path: "administrators", component: () => import("@/view/Admin/Administrators.vue") },
      // 试卷管理
      { path: "papers", component: () => import("@/view/Admin/Papers.vue") },
      // 添加试卷
      { path: "addpaper", component: () => import("@/view/Admin/AddPaper.vue") },
      // 添加试题
      { path: "addquestion", component: () => import("@/view/Admin/AddQuestion.vue") },
      // 试题管理
      { path: "questions", component: () => import("@/view/Admin/Questions.vue") },
      // 回答管理
      { path: "answers", component: () => import("@/view/Admin/Answers.vue") },
    ],
  },
];

const router = createRouter({
  // history: createWebHistory(),
  history: createWebHashHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  // 对需要登录才能操作的页面进行判断，如果用户没有登录，则跳转到登录页面
  const path = to.path.toLocaleLowerCase();
  if (
    path.startsWith("/answer") ||
    path.startsWith("/admin") ||
    path.startsWith("/center") ||
    path.startsWith("/question") ||
    path.startsWith("/result")
  ) {
    let user = undefined;
    try {
      user = JSON.parse(localStorage.getItem("user"));
    } catch (e) {
      next({ path: "/Login" });
      return;
    }
    if (path.startsWith("/admin") && user.role < 1) {
      next({ path: "/" });
      return;
    }
  }
  next();
});

export default router;
