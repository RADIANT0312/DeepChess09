import { createRouter, createWebHistory } from "vue-router";
const Start = () => import("@/components/Start/index.vue");
const Main = () => import("@/components/Main/index.vue");
const Game = () => import("@/components/Game/index.vue");
const Profile = () => import("@/components/Profile/index.vue");
const Login = () => import("@/components/Login/index.vue");
const SelectMode = () => import("@/components/SelectMode/index.vue");

const routes = [
  {
    path: "/",
    name: "Start",
    component: Start,
  },
  {
    path: "/main",
    name: "Main",
    component: Main,
    meta: { requiresAuth: true }, // Requires authentication
  },
  {
    path: "/start",
    name: "StartRedirect",
    redirect: "/",
  },
  {
    path: "/game",
    name: "Game",
    component: Game,
    meta: { requiresAuth: true }, // Requires authentication
  },
  {
    path: "/game/:mode/:gameId",
    name: "GameWithParams",
    component: Game,
    props: true,
    meta: { requiresAuth: true }, // Requires authentication
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true }, // Requires authentication
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresGuest: true }, // Only accessible to unauthenticated users
  },
  {
    path: "/select-mode",
    name: "SelectMode",
    component: SelectMode,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const loggedIn = localStorage.getItem("token");

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!loggedIn) {
      next({ name: "Login" });
    } else {
      // 如果有token，可以选择性地验证token有效性
      // 但考虑到性能，我们依赖API调用时的401拦截器来处理token过期
      next();
    }
  } else if (to.matched.some((record) => record.meta.requiresGuest)) {
    if (loggedIn) {
      next({ name: "Main" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
