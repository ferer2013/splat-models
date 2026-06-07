@echo off
chcp 65001 >nul
title 3DGS 格式转换工具

echo ========================================
echo   3DGS 格式转换工具
echo   把 .ply 拖到这个文件上即可转换
echo ========================================
echo.

if "%~1"=="" (
    echo [错误] 请把 .ply 文件拖到这个 BAT 文件上！
    echo.
    pause
    exit /b 1
)

set "INPUT=%~1"
set "OUTPUT=%~dpn1.spz"

echo 输入: %INPUT%
echo 输出: %OUTPUT%
echo.
echo 正在转换中，大文件需要等待...
echo.

splat-transform create "%INPUT%" "%OUTPUT%"

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   转换成功！
    echo   输出文件: %OUTPUT%
    echo ========================================
) else (
    echo.
    echo [失败] 转换出错，请检查文件是否完整
)

echo.
pause
