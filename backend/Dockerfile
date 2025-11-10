# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# 先複製 package.json（這樣可利用 Docker cache）
COPY package*.json ./

# 安裝所有依賴（不要加 --production）
RUN npm install

# 再複製程式碼
COPY . .

# 暴露 port
EXPOSE 3000

# 啟動指令
CMD ["node", "backend.js"]
