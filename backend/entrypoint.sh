#!/bin/sh

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