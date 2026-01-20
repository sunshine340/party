# 📱 聚会游戏助手 - 手机使用完整指南

## 🚀 一键生成Android APK（推荐）

### 环境要求
- **JDK 11+**：[下载地址](https://adoptium.net/)
- **Android SDK**：安装 [Android Studio](https://developer.android.com/studio)

### 打包步骤
```bash
# 1. 双击运行打包脚本
build-apk.bat

# 2. 等待编译完成（首次约10-20分钟）

# 3. APK生成位置
android\app\build\outputs\apk\debug\app-debug.apk
```

### 安装到手机
1. 将 `app-debug.apk` 传到手机（微信/QQ/数据线）
2. 打开APK文件
3. 允许"安装未知来源应用"
4. 完成安装！

---

## 方案一：PWA方式（最简单，推荐）

### 步骤1：启动本地服务器
在电脑上打开命令行，进入项目目录后运行：

```bash
# Windows用户（需要Python）
cd d:\work\YANG\Coding\party
python -m http.server 8080

# 或者使用Node.js
npx http-server -p 8080
```

### 步骤2：获取电脑IP地址
在命令行中输入：
```bash
ipconfig
```
找到 **IPv4地址**，例如：`192.168.1.100`

### 步骤3：手机访问
1. 确保手机和电脑连接**同一WiFi**
2. 手机浏览器打开：`http://192.168.1.100:8080`
3. 点击浏览器菜单 → **"添加到主屏幕"**

### 步骤4：像App一样使用
- 主屏幕会出现"聚会游戏"图标
- 点击即可全屏运行
- **支持离线使用**（首次联网加载后）

---

## 方案二：生成Android APK（一键安装）

### 使用 PWABuilder 在线打包（免费）

#### 步骤1：部署到公网
由于PWABuilder需要公网URL，可选择：

**选项A：使用GitHub Pages（免费）**
1. 在GitHub创建仓库
2. 上传所有项目文件
3. 设置 → Pages → 启用
4. 获得类似 `https://你的用户名.github.io/party` 的地址

**选项B：使用Vercel（免费）**
1. 访问 [vercel.com](https://vercel.com)
2. 导入GitHub仓库或直接拖拽文件夹
3. 自动获得公网地址

#### 步骤2：访问PWABuilder
1. 打开 [pwabuilder.com](https://www.pwabuilder.com/)
2. 输入你的公网URL
3. 点击 **"Start"** 分析

#### 步骤3：生成APK
1. 点击 **"Package for stores"**
2. 选择 **"Android"**
3. 选择 **"APK download"**（免费）
4. 下载APK文件

#### 步骤4：安装到手机
1. 将APK传输到手机
2. 打开文件管理器，点击APK
3. 允许安装未知来源应用
4. 完成安装！

---

## 方案三：单机使用（无需网络）

### 方法：使用HBuilderX打包

#### 步骤1：下载HBuilderX
访问 [dcloud.io](https://www.dcloud.io/hbuilderx.html) 下载

#### 步骤2：创建项目
1. 文件 → 导入 → 从本地目录导入
2. 选择 `d:\work\YANG\Coding\party`

#### 步骤3：打包APK
1. 发行 → 原生App-云打包
2. 配置应用名称和图标
3. 生成Android APK

---

## 📁 项目文件说明

确保以下文件完整：
```
party/
├── index.html        # 主页
├── manifest.json     # PWA配置
├── sw.js            # 离线缓存
├── css/style.css    # 样式
└── js/
    ├── app.js       # 主逻辑
    ├── data.js      # 词语库
    ├── werewolf.js  # 狼人杀
    ├── undercover.js # 谁是卧底
    └── charades.js  # 你画我猜
```

---

## ❓ 常见问题

### Q: 为什么添加到主屏幕后打开是网页？
**A:** 需要使用HTTPS或localhost才能启用PWA全屏模式。部署到GitHub Pages后可解决。

### Q: 手机无法访问电脑IP？
**A:** 检查：
1. 是否连接同一WiFi
2. 电脑防火墙是否阻止8080端口
3. IP地址是否正确

### Q: 离线模式不生效？
**A:** 首次需要在线访问完整加载一次，之后才能离线使用。

---

## 🚀 快速开始清单

- [ ] 确认所有文件已保存
- [ ] 启动本地服务器
- [ ] 获取电脑IP地址
- [ ] 手机与电脑连接同一WiFi
- [ ] 手机浏览器访问 `http://电脑IP:8080`
- [ ] 添加到手机主屏幕
- [ ] 开始游戏！
