# 前端代码规范（calculator-frontend）

> 本规范参考并遵循 **[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)** 与
> **[Vue 3 官方风格指南](https://cn.vuejs.org/style-guide/)**（优先级 A/B 规则为强制项）。
> 凡本文档未特别说明之处，一律以上述两份规范为准。

## 1. 规范来源

| 来源 | 适用范围 |
| --- | --- |
| Airbnb JavaScript Style Guide | 变量、函数、模块、错误处理等 JS 约定 |
| Vue 3 官方风格指南（优先级 A、B） | 组件命名、props 定义、模板语法 |
| Prettier（配置见 `.prettierrc.json`） | 统一的代码格式化 |

## 2. 文件与目录

```
src/
├── api/            # 接口封装，一个模块对应一组后端接口
├── components/     # 可复用展示组件
├── composables/    # 可复用逻辑（组合式函数，命名 useXxx）
├── views/          # 页面级组件
├── styles/         # 全局样式与主题变量
├── App.vue
└── main.js
```

- 组件文件使用 **PascalCase**：`HistoryPanel.vue`。
- 页面级组件放在 `views/`，可复用组件放在 `components/`。
- 组合式函数文件名以 `use` 开头，导出同名函数：`useTheme.js`。

## 3. 命名

| 元素 | 规则 | 示例 |
| --- | --- | --- |
| 组件文件 | PascalCase | `DisplayPanel.vue` |
| 组件标签 | 模板中使用 PascalCase | `<DisplayPanel />` |
| 变量 / 函数 | camelCase | `errorMessage`、`loadHistory` |
| 常量 | UPPER_SNAKE_CASE | `STORAGE_KEY` |
| 事件名 | kebab-case | `change-page`、`clear-all` |
| CSS 类名 | kebab-case | `.history-item`、`.key-equals` |

## 4. 编码约定

- 使用 ES Module（`import` / `export`），禁止 `require`。
- 使用 `<script setup>` 组合式 API，不使用 Options API。
- 缩进 2 个空格，单引号，**不写分号**（与 Prettier 配置一致）。
- `props` 必须声明类型与默认值；`emits` 必须显式声明。
- 组件内部不使用 `var`，优先 `const`，需要重新赋值时用 `let`。
- 模板中的表达式保持简单，复杂逻辑放到 `computed` 或函数中。
- 属性绑定顺序统一为：`v-if` → `v-for` → `:prop` → `@event`。

## 5. 与后端交互

- 所有 HTTP 请求统一走 `src/api/http.js` 中的 axios 实例，不在组件里直接 `axios.get`。
- 接口地址从 `import.meta.env.VITE_API_BASE_URL` 读取，禁止把域名硬编码到组件。
- 错误统一在响应拦截器中归一化为 `{ success, code, message }`，界面直接展示 `message`。
- **前端不做任何计算逻辑**：只负责拼接表达式字符串、发送请求、展示后端返回的结果。

## 6. 注释

- 组件顶部的 `<script setup>` 中用块注释说明组件职责。
- 复杂交互（键盘快捷键、正负号切换、删除后的分页回退）必须写注释说明意图。
- 禁止保留被注释掉的死代码。

## 7. 提交前自检

```bash
npm run build   # 必须构建成功
```

- [ ] 无 `console.log` 调试残留
- [ ] 无未使用的变量与 import
- [ ] 已按 Prettier 格式化
- [ ] 所有接口调用都经过 `src/api/` 封装
