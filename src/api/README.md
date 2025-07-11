# API 模块使用指南

## 模块结构

项目的API模块已经统一组织在 `src/api/` 目录下，包含以下文件：

- `index.js` - 主入口文件，配置axios实例和统一的拦截器
- `auth.js` - 认证相关API（登录、登出、检查状态等）
- `user.js` - 用户相关API（获取头像、用户资料、游戏历史等）
- `game.js` - 对弈游戏相关API（创建对局、提交走法、认输等）
- `teaching.js` - 教学相关API（获取课程、教学模式下的走法等）
- `replay.js` - 复盘相关API（获取复盘数据等）

## 统一导入方式

### 推荐做法
在组件中统一使用模块化导入：

```javascript
// 导入特定模块
import { auth, user, game, teaching, replay } from '@/api';

// 使用方式
const handleLogin = async () => {
  const response = await auth.login(credentials);
};

const fetchUserProfile = async () => {
  const profile = await user.getProfile();
};

const createGame = async () => {
  const newGame = await game.createMatch({ color: 'white', difficulty: 'medium' });
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
2. **模块化组织**: 按功能分类（auth、user、game、teaching、replay）
3. **错误处理**: 利用统一的拦截器，减少重复代码
4. **Token管理**: 自动在请求头中添加认证token
5. **类型注释**: 每个API函数都有详细的JSDoc注释
6. **API规范**: 严格按照README文档中的API规范实现

## 使用方法

### 1. 导入方式

```javascript
// 导入特定模块
import { auth, user, game, teaching, replay } from '@/api';

// 或者导入默认的 axios 实例
import apiClient from '@/api';
```

### 2. 认证相关 API

```javascript
import { auth } from '@/api';

// 检查登录状态
const response = await auth.checkStatus();

// 用户登录
const response = await auth.login({
  username: 'username',      // 3-20字符，支持字母数字下划线
  password: 'password123'    // 6-128字符
});

// 用户登出
await auth.logout();
  username: 'newuser',
  email: 'user@example.com',
  password: 'password123'
});

```

### 3. 用户相关 API

```javascript
import { user } from '@/api';

// 获取用户头像（Base64编码）
const avatarUrl = await user.getAvatar();

// 获取用户个人信息和统计数据
const profile = await user.getProfile();
// 返回: { id, username, email, createdAt, stats: { totalGames, wins, losses, draws, winRate } }

// 获取用户历史对局列表，支持分页和排序
const history = await user.getHistory({
  page: 1,          // 页码（默认1，最小1）
  limit: 20,        // 每页数量（默认20，范围1-100）
  sort: 'date_desc' // 排序方式：date_desc, date_asc, result_win, result_loss, result_draw
});

// 获取单局详细复盘数据
const gameDetails = await user.getGameDetails('game_id_123');
// 返回: { gameId, moves, boardStates, timestamps, comments }
```

### 4. 对弈游戏相关 API

```javascript
import { game } from '@/api';

// 创建新的对弈游戏，与AI对局
const newGame = await game.createMatch({
  color: 'white',        // 用户执棋颜色 (white|black)
  difficulty: 'medium'   // AI难度 (easy|medium|hard)
});

// 获取对局当前状态
const gameState = await game.getGameState('game_id_123');

// 提交用户走法，返回AI应对
const moveResult = await game.makeMove('game_id_123', 'e2e4');
// 走法格式：{from}{to}，如"e2e4"，特殊走法见API文档

// 用户认输，结束对局
await game.resign('game_id_123');
```

### 5. 教学相关 API

```javascript
import { teaching } from '@/api';

// 获取所有可用的教学课程列表
const lessons = await teaching.getLessons();
// 返回: { lessons, categories }

// 获取特定教学课程的详细信息和初始状态
const lesson = await teaching.getLesson('lesson_id_123');

// 在教学模式下提交走法，获得详细的AI指导
const teachingResult = await teaching.makeMove('lesson_id_123', 'e2e4');
// 返回: { userMove, aiMove, result, boardState, userComment, aiComment, moveRating, ... }
```

### 6. 复盘相关 API

```javascript
import { replay } from '@/api';

// 获取单局完整复盘数据，包含所有走法和棋盘状态
const replayData = await replay.getReplay('game_id_123');
// 返回: { gameId, moves, boardStates, timestamps, gameInfo }
```

## 数据格式说明

### 走法格式 (Move Format)
- 格式：`{from}{to}` (例如: `e2e4`, `g1f3`)
- 特殊走法：
  - 王车易位：`e1g1`(白王短易位), `e1c1`(白王长易位)
  - 兵升变：`e7e8q`(升后), `e7e8r`(升车), `e7e8b`(升象), `e7e8n`(升马)
  - 吃过路兵：`e5d6`(正常格式，系统自动识别)

### 棋盘状态格式 (Board State Format)
使用FEN(Forsyth-Edwards Notation)表示：
- 示例：`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`

### 对局结果 (Game Result)
- `ongoing`: 对局进行中
- `win`: 用户获胜
- `loss`: 用户失败
- `draw`: 平局
- `lesson_complete`: 教学完成

## 错误处理

API已配置统一的错误状态码处理：
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `422`: Validation Error
- `500`: Internal Server Error

## 配置

API 基础 URL 根据 API 文档设置为：

```javascript
const apiClient = axios.create({
  baseURL: 'https://api.deepchess.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

如需在开发环境使用其他 URL，可以通过环境变量设置：

```javascript
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'https://api.deepchess.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});
```
