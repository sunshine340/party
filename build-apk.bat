@echo off
chcp 65001 >nul
echo ========================================
echo    聚会游戏助手 - Android APK 打包脚本
echo ========================================
echo.

REM 检查Java版本
echo [1/4] 检查Java环境...
java -version 2>&1 | findstr /i "version" >nul
if errorlevel 1 (
    echo [错误] 未找到Java，请安装JDK 11或更高版本
    echo 下载地址: https://adoptium.net/
    pause
    exit /b 1
)

REM 检查JAVA_HOME
if not defined JAVA_HOME (
    echo [警告] JAVA_HOME未设置，可能会影响编译
)

echo [2/4] 同步Web资源到Android项目...
call npx cap sync android
if errorlevel 1 (
    echo [错误] 同步失败
    pause
    exit /b 1
)

echo [3/4] 编译生成APK（首次编译可能需要10-20分钟）...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    echo.
    echo [错误] 编译失败！
    echo.
    echo 常见问题：
    echo 1. 需要Java 11或更高版本（当前可能是Java 8）
    echo    解决：安装JDK 11+ 并设置JAVA_HOME
    echo    下载：https://adoptium.net/
    echo.
    echo 2. 需要Android SDK
    echo    解决：安装Android Studio
    echo    下载：https://developer.android.com/studio
    echo.
    pause
    exit /b 1
)
cd ..

echo [4/4] 完成！
echo.
echo ========================================
echo APK文件位置:
echo android\app\build\outputs\apk\debug\app-debug.apk
echo ========================================
echo.
echo 将此APK文件传输到手机并安装即可！
echo.
pause
