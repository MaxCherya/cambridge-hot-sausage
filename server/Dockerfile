FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# Install system deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

COPY . .

RUN python manage.py collectstatic --noinput 2>/dev/null || true

EXPOSE 8000

# Run migrations + ensure superuser exists on every deploy
CMD python manage.py migrate --noinput && \
    python manage.py shell -c "\
from django.contrib.auth import get_user_model; \
User = get_user_model(); \
import os; \
u = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'); \
e = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com'); \
p = os.environ.get('DJANGO_SUPERUSER_PASSWORD', ''); \
User.objects.filter(username=u).exists() or (p and User.objects.create_superuser(u, e, p)); \
" && \
    gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --timeout 120
