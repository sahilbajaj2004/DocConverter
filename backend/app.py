from flask import Flask, request, send_file, jsonify
import os
from pdf2docx import Converter
from docx import Document
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image
import pdfkit
import pandas as pd

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return "Welcome to the Document Converter API"

@app.route('/convert/pdf-to-word', methods=['POST'])
def pdf_to_word():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    output_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.pdf', '.docx'))

    cv = Converter(filepath)
    cv.convert(output_path, start=0, end=None)
    cv.close()

    return send_file(output_path, as_attachment=True)

@app.route('/convert/word-to-pdf', methods=['POST'])
def word_to_pdf():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    output_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.docx', '.pdf'))
    pdfkit.from_file(filepath, output_path)

    return send_file(output_path, as_attachment=True)

@app.route('/convert/excel-to-pdf', methods=['POST'])
def excel_to_pdf():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    df = pd.read_excel(filepath)
    html = df.to_html()
    html_path = filepath.replace('.xlsx', '.html')

    with open(html_path, 'w') as f:
        f.write(html)

    pdf_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.xlsx', '.pdf'))
    pdfkit.from_file(html_path, pdf_path)

    return send_file(pdf_path, as_attachment=True)

@app.route('/convert/image-to-pdf', methods=['POST'])
def image_to_pdf():
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    image = Image.open(filepath).convert('RGB')
    pdf_path = os.path.join(CONVERTED_FOLDER, file.filename.rsplit('.', 1)[0] + '.pdf')
    image.save(pdf_path)

    return send_file(pdf_path, as_attachment=True)

@app.route('/convert/pdf-to-image', methods=['POST'])
def pdf_to_image():
    from pdf2image import convert_from_path
    file = request.files['file']
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    images = convert_from_path(filepath)
    image_paths = []

    for i, image in enumerate(images):
        output_path = os.path.join(CONVERTED_FOLDER, f"{file.filename}_page_{i + 1}.png")
        image.save(output_path, 'PNG')
        image_paths.append(output_path)

    return jsonify({"converted_images": image_paths})

if __name__ == '__main__':
    app.run(debug=True)
