# 日日小屋 · Little Warm Home

React + Three.js 的互動式溫馨小屋，格局分為一間獨立寢室及一間包含開放式廚房、餐桌的客廳。兩間房皆加大，以 2.7 公尺高的隔牆與木門分隔。寢室保留窗外山景，另設電腦書桌及椅子；客廳電視正對沙發。

## 開發

需要 Node.js 22.12+ 或 24。

```sh
npm ci
npm run dev
```

拖曳旋轉、滾輪縮放；下方按鈕切換空間視角。右上切換日夜，右側切換房間標籤或重設視角。

## 建置

```sh
npm run build
npm run preview
```

所有模型皆以 Three.js 幾何圖形產生，不需要模型檔或 API 金鑰。
