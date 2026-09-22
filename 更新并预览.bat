@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo [FitDaily] 正在获取 GitHub 最新版本...
git pull
if errorlevel 1 (
  echo Git 更新失败，请检查网络或 Git 配置。
  pause
  exit /b 1
)
if not exist node_modules (
  echo [FitDaily] 首次运行，正在安装依赖...
  call npm.cmd install
)
start "FitDaily Dev" cmd /k "cd /d %~dp0 && npm.cmd run dev"
timeout /t 3 /nobreak >nul
start http://localhost:3000
