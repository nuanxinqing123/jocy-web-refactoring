# Jocy动漫前端重构版

> 🌸 新一代高清动漫在线播放站点前端，支持多端自适应，体验流畅，界面美观。

> 后端开源地址: [https://github.com/nuanxinqing123/go-jocy](https://github.com/nuanxinqing123/go-jocy)
---

## 项目简介

Jocy动漫前端项目基于 Vue3 + Vite + Pinia + Arco Design，致力于为用户提供高清、迅速、无广告打扰的优质动漫观赏体验。项目支持移动端与PC端自适应，拥有丰富的分类、收藏、历史、弹幕等功能，界面风格现代，交互友好。

## 主要特性

- 🎬 高清动漫在线播放，支持多清晰度切换
- 📱 响应式布局，移动端/PC端自适应
- 📝 用户登录、注册、收藏、历史记录
- 💬 实时弹幕互动，弹幕速度/透明度可调
- 🔍 强大的搜索与筛选功能
- 🏷️ 分类、推荐、追番排期等丰富内容
- 🌈 现代化UI，主题色彩柔和，交互动画流畅
- 🛡️ 代码结构清晰，注释详细，易于二次开发

## 目录结构

```text
jocy-web-refactoring/
├── public/                # 静态资源
├── src/
│   ├── api/               # 所有后端API接口
│   ├── assets/            # 图片、样式等静态资源
│   ├── components/        # 通用组件（轮播、播放器、登录卡片等）
│   ├── layout/            # 布局相关组件
│   ├── pages/             # 页面组件（首页、详情、历史、收藏等）
│   ├── stores/            # Pinia 状态管理
│   ├── utils/             # 工具函数
│   ├── main.js            # 入口文件
│   └── style.css          # 全局样式
├── package.json           # 依赖与脚本
├── vite.config.js         # Vite 配置
├── change_log.md          # 更新日志
└── README.md              # 项目说明
```

## 安装与启动

1. **克隆项目**

   ```bash
   git clone https://github.com/yourname/jocy-web-refactoring.git
   cd jocy-web-refactoring
   ```

2. **安装依赖**

   ```bash
   npm install
   # 或
   yarn install
   ```

3. **配置后端API地址**

   修改 `src/utils/request.js` 中的 `baseURL` 为你自己的后端服务地址：

   ```js
   export const baseURL = 'https://你的后端地址/app/';
   ```

4. **启动开发环境**

   ```bash
   npm run dev
   # 或
   yarn dev
   ```

5. **打包构建**

   ```bash
   npm run build
   # 或
   yarn build
   ```

6. **预览生产环境**

   ```bash
   npm run preview
   # 或
   yarn preview
   ```

## API/后端依赖

- 本项目为前后端分离架构，需配合后端API服务使用。
- 主要API接口包括：用户登录/注册、视频列表、视频详情、弹幕、评论、收藏、历史等。
- 需后端支持跨域（CORS）。
- 详细API接口请参考 `src/api/` 目录下各文件。

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/)
- [Pinia](https://pinia.vuejs.org/) 状态管理
- [Arco Design Vue](https://arco.design/vue)
- [Less](https://lesscss.org/) 主题与样式
- [ArtPlayer](https://artplayer.org/) 高级弹幕播放器
- [Axios](https://axios-http.com/) 网络请求
- 其他：hls.js、mpegts.js、crypto-js、vconsole 等

## 开发与贡献

1. 遵循 [Vue3 组件开发规范](https://vuejs.org/)
2. 组件和页面组件请放入 `components/` 或页面目录下的 `components/`
3. CSS 默认使用 Less
4. 逻辑性代码请尽量补充中文注释，便于团队协作
5. 欢迎 issue/PR 反馈与贡献

## 更新日志

详见 [change_log.md](./change_log.md)
