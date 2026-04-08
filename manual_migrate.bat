@echo off
echo ==========================================
echo DernekteBugun - Veritabani Guncelleme
echo ==========================================
echo.
echo 1. Adim: Migration dosyalari olusturuluyor...
echo (Eger soru sorulursa ENTER tusuna basarak 'create column' secin)
echo.
call npx drizzle-kit generate
if %errorlevel% neq 0 (
    echo HATA: Generate islemi basarisiz oldu.
    pause
    exit /b %errorlevel%
)

echo.
echo 2. Adim: Veritabanina uygulaniyor...
echo.
call npx drizzle-kit migrate
if %errorlevel% neq 0 (
    echo HATA: Migrate islemi basarisiz oldu.
    pause
    exit /b %errorlevel%
)

echo.
echo ==========================================
echo ISLEM BASARIYLA TAMAMLANDI!
echo ==========================================
pause
