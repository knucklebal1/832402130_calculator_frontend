# calculator-frontend —— 前后端分离计算器系统（前端）

基于 **Vue 3 + Vite** 的计算器 Web 客户端。
本前端**只负责界面交互与展示**：拼接表达式字符串、调用后端接口、显示后端返回的结果与历史记录，
不做任何算术运算。

配套后端仓库：`calculator-backend`（见博客中的仓库链接）

---

## 一、技术栈

| 项目 | 版本 / 说明 |
| --- | --- |
| 框架 | Vue 3.4（组合式 API + `<script setup>`） |
| 构建工具 | Vite 5 |
| HTTP 客户端 | Axios 1.6 |
| 样式 | 原生 CSS + CSS 变量（支持浅色 / 深色主题） |
| 运行环境 | Node.js 18 及以上 |

---

## 二、运行环境

- Node.js 18+（推荐 20 LTS 及以上）
- npm 9+（或 pnpm / yarn，命令自行替换）
- 需要先启动后端服务（默认 <http://localhost:8080>）

---

## 三、快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置后端地址

配置文件已提供，一般**无需修改**：

| 文件 | 内容 | 说明 |
| --- | --- | --- |
| `.env.development` | `VITE_API_BASE_URL=/api` | 开发环境由 Vite 代理转发到后端 |
| `.env.production` | `VITE_API_BASE_URL=/api` | 生产环境由 Nginx 反向代理 |

开发环境的代理配置在 `vite.config.js`：

```js
server: {
  port: 5173,
  proxy: {
    '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true }
  }
}
```

> 这里必须写 `127.0.0.1` 而不是 `localhost`：Windows 上 `localhost` 会优先解析成 IPv6 的
> `::1`，而 Spring Boot 内置 Tomcat 默认只监听 IPv4 的 `0.0.0.0`，用 `localhost` 会报
> `ECONNREFUSED`（浏览器里表现为"无法连接后端服务"）。

如果不想用代理、想直接请求后端域名，把 `.env.development` 改成
`VITE_API_BASE_URL=http://127.0.0.1:8080/api` 即可。
此时后端需要放行跨域（后端 `app.cors.allowed-origins` 已默认允许 `http://localhost:5173`）。

### 3. 启动开发服务器

```bash
npm run dev
```

浏览器打开 <http://localhost:5173>。

### 4. 构建生产版本

```bash
npm run build     # 产物输出到 dist/
npm run preview   # 本地预览构建产物
```

---

## 四、功能说明

| 功能 | 说明 |
| --- | --- |
| 表达式输入 | 按钮点击 + 键盘直接输入 |
| 基础计算 | 加、减、乘、除，结果由后端计算 |
| 复合表达式 | 支持括号、运算优先级、小数、一元正负号 |
| 错误提示 | 直接展示后端返回的 `message`（非法表达式、除零等） |
| 计算历史 | 从后端数据库分页读取并展示 |
| 删除记录 | 按 id 调用后端删除接口，删除后重新查询最新数据 |
| 清空历史 | 一键删除全部记录（加分项） |
| 历史搜索 | 按表达式关键字模糊搜索（加分项） |
| 计算统计 | 计算次数、最常用运算符、平均结果（加分项） |
| 主题切换 | 浅色 / 深色，偏好保存在 localStorage（加分项） |
| 键盘快捷键 | 数字与运算符直接输入，Enter 计算，Backspace 退格，Esc 清空（加分项） |

> 说明：localStorage 只保存**界面主题偏好**，不保存任何计算历史。
> 计算历史始终从后端数据库读取，刷新或更换浏览器后依然存在。

---

## 五、目录结构

```
calculator-frontend/
├── src/
│   ├── api/
│   │   ├── http.js              # axios 实例与统一错误处理
│   │   └── calculator.js        # 计算 / 历史 / 统计接口封装
│   ├── components/
│   │   ├── DisplayPanel.vue     # 表达式、结果与错误提示
│   │   ├── Keypad.vue           # 计算器键盘
│   │   ├── HistoryPanel.vue     # 历史列表、搜索、分页、删除
│   │   └── StatsCard.vue        # 统计卡片
│   ├── composables/
│   │   └── useTheme.js          # 主题切换
│   ├── views/
│   │   └── CalculatorView.vue   # 主页面（状态与业务编排）
│   ├── styles/main.css          # 全局样式与主题变量
│   ├── App.vue
│   └── main.js
├── index.html
├── vite.config.js
├── .env.development
├── .env.production
├── codestyle.md
└── README.md
```

---

## 六、与后端对接

| 界面操作 | 调用的后端接口 |
| --- | --- |
| 点击 `=` 或 Enter | `POST /api/calculate` |
| 打开页面 / 点刷新 | `GET /api/history?page=1&size=10` |
| 搜索框回车 | `GET /api/history?keyword=...` |
| 点击某条记录的"删除" | `DELETE /api/history/{id}` |
| 点击"清空" | `DELETE /api/history` |
| 页面加载 / 计算成功后 | `GET /api/history/stats` |

**验证前后端分离**：关闭后端服务后，界面仍可点击交互，但无法得到任何新的计算结果，
并会提示"网络异常，请确认后端服务已启动"。

---

## 七、部署

```bash
npm run build
# 把 dist/ 目录交给 Nginx 托管，并把 /api 反向代理到后端服务
```

Nginx 参考配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/calculator-frontend/dist;
    index index.html;

    # 单页应用：找不到的路径回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端接口反向代理，前后端同源，无需 CORS
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
