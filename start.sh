#!/usr/bin/env bash
set -e

echo "Creating virtual environment..."
python -m venv .venv

source .venv/Scripts/activate

echo "Upgrading pip..."
pip install --upgrade pip wheel setuptools

echo "Installing PyTorch (CPU)..."
pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

echo "Installing dependencies..."
pip install -r requirements.txt

echo "✅ Setup complete"
echo "Activate with: source .venv/Scripts/activate"
