FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2, gcc for C DSA engine
RUN apt-get update && apt-get install -y \
    gcc \
    make \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Compile the DSA engine if it exists
RUN if [ -d "/dsa-engine" ]; then cd /dsa-engine && make lib; fi

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
