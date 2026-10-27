#!/bin/sh
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


# Đợi PostgreSQL khởi động hoàn toàn bằng Python (không cần dùng nc)
echo "Waiting for PostgreSQL to start..."
python -c "
import socket, time
while True:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(1)
        s.connect(('$DB_HOST', int($DB_PORT)))
        s.close()
        break
    except socket.error:
        time.sleep(1)
"
echo "PostgreSQL started successfully!"

# Tạo các file migration nếu có model mới
echo "Generating migrations..."
python manage.py makemigrations

# Đồng bộ dữ liệu vào PostgreSQL
echo "Applying migrations..."
python manage.py migrate

echo "Import data..."
python manage.py import_esco_json

# Tự động tạo tài khoản Superuser nếu chưa tồn tại
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@gmail.com', '12345')
    print('Superuser created successfully.')
else:
    print('Superuser already exists.')
"

echo "Collecting static files..."
python manage.py collectstatic --noinput

# Khởi động Django Server ở cổng 8001
exec python manage.py runserver 0.0.0.0:8001