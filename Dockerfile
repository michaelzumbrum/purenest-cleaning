# Python API image
FROM python:3.11-slim

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends build-essential curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements first (better caching)
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY lead_api.py /app/lead_api.py
COPY partner_map.json /app/partner_map.json

EXPOSE 8000

# Run with uvicorn (Render-compatible style using $PORT if provided)
ENV PORT=8000
CMD ["sh", "-c", "uvicorn lead_api:app --host 0.0.0.0 --port ${PORT}"]
