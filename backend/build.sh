#!/usr/bin/env bash
set -o errexit

# Install wkhtmltopdf for pdfkit
apt-get update && apt-get install -y wkhtmltopdf

# Install poppler-utils for pdf2image
apt-get install -y poppler-utils

# Optionally, set WKHTMLTOPDF_PATH for pdfkit
export WKHTMLTOPDF_PATH=/usr/bin/wkhtmltopdf
