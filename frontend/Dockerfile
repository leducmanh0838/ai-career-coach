FROM node:24-slim

# Cài đặt chứng chỉ CA để fix lỗi TLS của Miniflare/workerd
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy các file cấu hình package
COPY package.json package-lock.json* ./

# Cài đặt bằng npm
RUN npm install --include=optional

# Copy toàn bộ mã nguồn
COPY . .

EXPOSE 5174

# Chạy dev server bằng npm
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]