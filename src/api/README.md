# API 模块使用指南

## 模块结构

项目的API模块已经统一组织在 `src/api/` 目录下，包含以下文件：

- `index.js` - 主入口文件，配置axios实例和统一的拦截器
- `auth.js` - 认证相关API（登录、注册、登出等）
- `user.js` - 用户相关API（获取头像、用户资料、游戏历史等）
- `game.js` - 游戏相关API（创建游戏、移动棋子等）

## 统一导入方式

### 推荐做法
在组件中统一使用模块化导入：

```javascript
// 导入特定模块
import { auth, user, game } from '@/api';

// 使用方式
const handleLogin = async () => {
  const response = await auth.login(credentials);
};

const fetchUserProfile = async () => {
  const profile = await user.getProfile();
};
```

### 避免的做法
❌ 不要在组件中直接使用fetch或axios：
```javascript
// 不推荐
const response = await fetch('/api/user/avatar');
const profile = await axios.get('/api/user/profile');
```

## 错误处理

API模块已经配置了统一的错误处理拦截器，会自动处理常见的HTTP错误状态码。在组件中只需要使用try-catch捕获错误：

```javascript
try {
  const avatar = await user.getAvatar();
  this.avatar = avatar;
} catch (error) {
  // 错误已经在拦截器中统一处理和打印
  // 这里只需要处理组件特定的错误逻辑
  this.avatar = '/default-avatar.jpg';
}
```

## 最佳实践

1. **统一导入**: 所有API调用都通过 `src/api/` 模块进行
2. **模块化组织**: 按功能分类（auth、user、game）
3. **错误处理**: 利用统一的拦截器，减少重复代码
4. **Token管理**: 自动在请求头中添加认证token
5. **类型注释**: 每个API函数都有详细的JSDoc注释

## 当前已统一的组件

- ✅ `Login/index.vue` - 使用 `auth.login()` 和 `auth.register()`
- ✅ `Main/topbar.vue` - 使用 `user.getAvatar()`
- ✅ `Profile/topbar.vue` - 使用 `user.getAvatar()`
- ✅ `Profile/index.vue` - 使用多个 `user.*` API
- ✅ `comment/index.vue` - 使用 `user.getAIAnalysis()`

## 使用方法

### 1. 导入方式

```javascript
// 导入特定模块
import { auth, user, game } from '@/api';

// 或者导入默认的 axios 实例
import apiClient from '@/api';
```

### 2. 认证相关 API

```javascript
import { auth } from '@/api';

// 用户登录
const response = await auth.login({
  username: 'user@example.com',
  password: 'password123'
});

// 用户注册
const response = await auth.register({
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123'
});

// 用户登出
await auth.logout();

// 刷新 token
await auth.refreshToken();
```

### 3. 用户相关 API

```javascript
import { user } from '@/api';

// 获取用户头像
const avatarUrl = await user.getAvatar();

// 获取用户资料
const profile = await user.getProfile();

// 更新用户资料
await user.updateProfile({
  username: 'newusername',
  email: 'newemail@example.com'
});

// 上传头像
await user.uploadAvatar(avatarFile);

// 获取游戏历史
const history = await user.getHistory({
  page: 1,
  limit: 20,
  sort: 'date_desc'
});

// 获取游戏详情
const gameDetails = await user.getGameDetails('game_id_123');

// 保存游戏分析
await user.saveGameAnalysis('game_id_123', 'This was a great game!');

// 获取 AI 分析
const aiAnalysis = await user.getAIAnalysis('game_id_123', moves);
```

### 4. 游戏相关 API

```javascript
import { game } from '@/api';

// 创建新游戏
const newGame = await game.createGame({
  opponent: 'AI',
  difficulty: 'medium',
  timeControl: '10+5'
});

// 加入游戏
await game.joinGame('game_id_123');

// 进行移动
await game.makeMove('game_id_123', {
  from: 'e2',
  to: 'e4'
});

// 获取游戏状态
const gameState = await game.getGameState('game_id_123');

// 认输
await game.resign('game_id_123');

// 提议和棋
await game.offerDraw('game_id_123');

// 响应和棋提议
await game.respondToDraw('game_id_123', true); // true 表示接受，false 表示拒绝
```

## 配置

API 基础 URL 和其他配置在 `index.js` 中设置：

```javascript
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

可以根据环境变量动态设置 baseURL：

```javascript
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## 错误处理

```javascript
try {
  const response = await user.getProfile();
  // 处理成功响应
} catch (error) {
  if (error.response) {
    // 服务器返回了错误状态码
    console.error('API Error:', error.response.status, error.response.data);
  } else if (error.request) {
    // 请求发送了但没有收到响应
    console.error('Network Error:', error.request);
  } else {
    // 其他错误
    console.error('Error:', error.message);
  }
}
```
