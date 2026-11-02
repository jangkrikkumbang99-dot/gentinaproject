@echo off
title Push Gentina Jaya Textile to GitHub
echo ==============================================================================
echo PUSH KODE GENTINA JAYA TEXTILE KE GITHUB (gentinaproject)
echo ==============================================================================
echo.
echo Menghubungkan ke https://github.com/jangkrikkumbang99-dot/gentinaproject.git ...
echo.
"C:\Users\HP 14S\.gemini\antigravity\scratch\mingit\cmd\git.exe" push -u origin main
echo.
if %errorlevel% equ 0 (
    echo [BERHASIL] Seluruh kode Gentina Jaya Textile berhasil terunggah ke GitHub!
) else (
    echo [INFO] Jika diminta login, silakan masukkan Personal Access Token atau ikuti petunjuk browser.
)
echo.
pause
