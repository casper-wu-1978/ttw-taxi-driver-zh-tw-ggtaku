
# TTW-TAXI 司機端應用程式部署指南

## 前置準備

### 1. 安裝 EAS CLI
```bash
npm install -g eas-cli
```

### 2. 登入 Expo 帳戶
```bash
eas login
```

## iOS 部署

### 前置需求
- Apple Developer 帳戶 ($99/年)
- 在 App Store Connect 中創建應用程式

### 步驟
1. **配置 iOS 憑證**
   ```bash
   eas build:configure
   ```

2. **建置 iOS 應用程式**
   ```bash
   # 開發版本
   eas build -p ios --profile development
   
   # 預覽版本
   eas build -p ios --profile preview
   
   # 正式版本
   eas build -p ios --profile production
   ```

3. **提交到 App Store**
   ```bash
   eas submit -p ios --profile production
   ```

## Android 部署

### 前置需求
- Google Play Console 帳戶 ($25 一次性費用)
- 在 Google Play Console 中創建應用程式

### 步驟
1. **建置 Android 應用程式**
   ```bash
   # 開發版本 (APK)
   eas build -p android --profile development
   
   # 預覽版本 (APK)
   eas build -p android --profile preview
   
   # 正式版本 (AAB)
   eas build -p android --profile production
   ```

2. **提交到 Google Play Store**
   ```bash
   eas submit -p android --profile production
   ```

## 本地測試

### iOS 模擬器
```bash
eas build -p ios --profile development --local
```

### Android 模擬器
```bash
eas build -p android --profile development --local
```

## 重要注意事項

### iOS
- 需要更新 `eas.json` 中的 Apple ID 和團隊 ID
- 確保應用程式圖示符合 Apple 的規範
- 需要提供隱私政策和使用條款

### Android
- 需要生成簽名金鑰並上傳到 Google Play Console
- 確保應用程式權限設定正確
- 需要提供應用程式截圖和描述

### 共同需求
- 應用程式圖示 (1024x1024 PNG)
- 應用程式截圖
- 應用程式描述（繁體中文）
- 隱私政策
- 使用條款

## 建置狀態檢查
```bash
eas build:list
```

## 故障排除

### 常見問題
1. **憑證問題**: 使用 `eas credentials` 管理憑證
2. **建置失敗**: 檢查 `eas build:list` 中的錯誤日誌
3. **權限問題**: 確保 `app.json` 中的權限設定正確

### 有用的命令
```bash
# 檢查專案配置
eas config

# 清除快取
eas build:cancel --all

# 檢查憑證
eas credentials
```

## 自動化部署

您可以設定 GitHub Actions 來自動化建置和部署流程：

```yaml
name: EAS Build
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: eas build --platform all --non-interactive
```

## 聯絡支援
如果遇到問題，請參考 [Expo 文檔](https://docs.expo.dev/) 或聯絡 Expo 支援團隊。
