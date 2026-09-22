# FitDaily PWA

移动端优先的个人健身记录 Web App / PWA。当前阶段用于快速迭代界面和功能，后续稳定后再迁移到更适合中国大陆访问的部署方案。

## 在线预览

GitHub Pages：

https://19904504462-arch.github.io/fitdaily-pwa/

> 第一次部署后，如果网页暂时打不开，请到仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。

## 本地最快预览

Windows 用户直接双击：

- `一键预览.bat`：启动本地开发服务器并打开浏览器。
- `更新并预览.bat`：先从 GitHub 拉取最新代码，再启动浏览器。
- `打开在线预览.bat`：直接打开 GitHub Pages 在线版本。

首次运行脚本会自动执行 `npm.cmd install`，以后通常不需要重复安装依赖。

## 手动运行

```bash
npm.cmd install
npm.cmd run dev
```

浏览器访问：http://localhost:3000

## 当前功能

- 首页训练摘要
- 训练部位多选
- 今日训练打卡
- 月度训练日历
- 饮食热量记录
- 器械使用提示
- 浏览器本地数据持久化
- PWA manifest + Service Worker
- GitHub Pages 自动部署

## 当前数据策略

V1 使用 `localStorage`，不需要登录，打开即可使用。适合原型测试。

限制：换设备不会同步，清除浏览器数据后记录会丢失。正式版再接登录和云数据库。
