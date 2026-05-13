#!/bin/bash
set -e

# Create venv if not exists
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt -q

# Install Playwright browsers (first time only)
playwright install chromium

# Copy .env if not exists
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp .env.example .env
    echo ".env oluşturuldu — Firebase credentials ekle"
fi

uvicorn app.main:app --reload --port 8000
