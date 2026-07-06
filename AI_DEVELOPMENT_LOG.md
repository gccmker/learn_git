# 学生周报生成器 - AI开发记录 / AI Development Log

## 项目概览 / Project Overview
- **Purpose**: 学生周报生成器，输入姓名/考勤/作业数 → 生成带煽动性评价的周报
- **Tech Stack**: 纯原生 HTML + CSS + JS（无构建工具，无依赖）
- **Style**: 复古霓虹 / Retro Neon（CRT扫描线、霓虹发光、像素风装饰）
- **Data Storage**: localStorage + JSON 导入/导出

---

## 演进路径 / Evolution Path

### V1 - 基础功能
- 三个输入框：姓名、考勤天数、作业完成数
- 生成按钮 → 拼接周报文字
- 一键复制到剪贴板（Clipboard API + execCommand 降级）

### V2 - 文案优化
- 格式固定为：`【学生周报】{姓名}同学本周表现：出勤{考勤}天，完成作业{作业}份。{评价}`
- 评价改为5条网感煽动文案，随机抽取
- 目标："激起慵懒家长沉睡的心灵"

### V3 - 复古霓虹 UI
- 深色背景 + CRT扫描线（`repeating-linear-gradient`）
- 暗角效果（`radial-gradient`）
- 品红色霓虹容器边框（多层 box-shadow）
- 青色霓虹标题 + 闪烁动画（`@keyframes flicker`）
- 绿色输入框 / 绿色复制按钮 / 品红生成按钮 / 黄色结果区
- 四角装饰边框
- 按钮悬停光扫效果

### V4 - 历史记录
- localStorage 持久化，最多50条
- 历史列表：点击加载、悬停显示删除按钮、一键清空
- 容器滚动（max-height: 90vh + overflow-y: auto）

### V5 - 代码拆分
- 单文件 → 三文件：index.html / style.css / script.js
- 全量中文注释，分区标题

### V6 - 导出/导入
- 导出：Blob + URL.createObjectURL 下载 JSON
- 导入：FileReader 读取 + 去重合并
- 文件名格式：`weekly-report-history-YYYY-MM-DD.json`

---

## 关键技术决策 / Key Decisions

| 决策 | 选择 | 原因 |
|------|------|------|
| 存储方案 | localStorage + JSON导入导出 | 最轻量，无需后端。纯前端无法直接写本地文件 |
| 字体方案 | 中文用系统字体（YaHei/PingFang），英文用等宽 | 像素字体中文可读性差，系统字体保证阅读 |
| 动画实现 | CSS @keyframes | 纯CSS动画性能最好，无需JS驱动 |
| 代码组织 | 三文件分离 | 单文件超过500行后可读性差，分离后各司其职 |
| 历史去重 | 按 id（时间戳）去重 | 导入时防止重复记录 |

---

## 代码结构 / Code Structure

```
index.html   — 结构层：表单 + 按钮 + 结果区 + 历史列表 + Toast
style.css    — 表现层：复古霓虹主题（约400行，分区注释）
script.js    — 逻辑层：生成/复制/历史/导入导出（约250行）
```

### 核心函数
- `generateReport()` — 主流程
- `saveToHistory()` / `renderHistory()` / `loadHistory()` / `deleteHistory()` / `clearHistory()` — 历史记录 CRUD
- `exportHistory()` / `importHistory()` / `handleImport()` — 导入导出
- `copyReport()` — 复制到剪贴板（现代API + 降级）
- `showToast()` — 提示框

---

## 已知约束 / Known Constraints

1. **纯前端限制**：无法自动写入本地文件，需手动导出
2. **存储上限**：localStorage 约 5MB，已限制50条记录
3. **浏览器兼容**：已考虑旧浏览器降级（execCommand）
4. **文件打开方式**：直接双击HTML可运行，无需服务器

---

## 未来扩展建议 / Future Extension Ideas

- 按学生姓名筛选历史记录
- 周报模板自定义 / 多套文案切换
- 批量生成周报
- 导出为 Word / PDF
- 学生档案管理（每人独立统计）
