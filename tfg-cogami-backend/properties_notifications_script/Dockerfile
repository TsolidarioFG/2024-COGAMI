FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .
COPY config.json .

# Instalar cron
RUN apt-get update && apt-get -y install cron

# Crear el archivo de cron
RUN echo "*/5 * * * * /usr/local/bin/python /app/main.py >> /var/log/cron.log 2>&1" > /etc/cron.d/notification-script-cron

# Dar permisos de ejecución al archivo de cron
RUN chmod 0644 /etc/cron.d/notification-script-cron

# Crear el archivo de log
RUN touch /var/log/cron.log

# Ejecutar cron en primer plano
CMD cron && tail -f /var/log/cron.log