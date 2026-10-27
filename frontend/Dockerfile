# Copyright (c) 2026 AURA FARMING 20 PRO MAX
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

FROM node:24-slim

# Cài đặt chứng chỉ CA nếu cần
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy các file cấu hình package
COPY package.json package-lock.json* ./

# Cài đặt toàn bộ dependencies (bao gồm devDependencies để phục vụ cho việc build)
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Tiến hành Build ứng dụng ra thư mục dist (hoặc thư mục build của vinext)
RUN npm run build

EXPOSE 5174

# Chạy ứng dụng ở chế độ production (dùng lệnh preview hoặc start tùy theo package.json của vinext)
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5174"]