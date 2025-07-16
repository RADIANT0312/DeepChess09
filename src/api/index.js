import axios from "axios";

// 防止重复跳转的标志
let isRedirecting = false;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", // 使用环境变量或默认值
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for unified error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授权，token过期或无效，需要重新登录
          console.warn("未授权访问，token已过期，正在跳转到登录页面");
          
          // 防止重复跳转
          if (!isRedirecting) {
            isRedirecting = true;
            
            // 清除无效的token和用户信息
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            
            // 动态导入router来避免循环依赖
            import("@/router/index.js").then((routerModule) => {
              const router = routerModule.default;
              // 跳转到登录页面
              router.push({ name: "Login" }).finally(() => {
                // 跳转完成后重置标志
                setTimeout(() => {
                  isRedirecting = false;
                }, 1000);
              });
            }).catch((routerError) => {
              console.error("无法导入路由模块:", routerError);
              // 备用方案：直接使用window.location
              window.location.href = "/login";
              setTimeout(() => {
                isRedirecting = false;
              }, 1000);
            });
          }
          break;
        case 403:
          console.warn("访问被禁止");
          break;
        case 404:
          console.warn("请求的资源不存在");
          break;
        case 500:
          console.error("服务器内部错误");
          break;
        default:
          console.error(`请求失败: ${error.response.status}`);
      }
    } else if (error.request) {
      console.error("网络错误，请检查您的网络连接");
    } else {
      console.error("请求配置错误:", error.message);
    }
    return Promise.reject(error);
  }
);

// 导入各个模块
export { auth } from "./auth.js";
export { user } from "./user.js";
export { game } from "./game.js";
export { teaching } from "./teaching.js";
export { replay } from "./replay.js";

// 导出 axios 实例供直接使用
export default apiClient;
