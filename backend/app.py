from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
from pdf2docx import Converter
from docx import Document
from PyPDF2 import PdfReader, PdfWriter
from PIL import Image
import pdfkit
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# Use the folders you created
UPLOAD_FOLDER = 'uploads'
CONVERTED_FOLDER = 'converted'

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CONVERTED_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return jsonify({
        "message": "Welcome to the Document Converter API",
        "endpoints": [
            "/convert/pdf-to-word",
            "/convert/word-to-pdf", 
            "/convert/excel-to-pdf",
            "/convert/image-to-pdf",
            "/convert/pdf-to-image"
        ]
    })

@app.route('/convert/pdf-to-word', methods=['POST'])
def pdf_to_word():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        output_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.pdf', '.docx'))

        cv = Converter(filepath)
        cv.convert(output_path, start=0, end=None)
        cv.close()

        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert/word-to-pdf', methods=['POST'])
def word_to_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        output_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.docx', '.pdf'))
        
        # Convert DOCX to HTML first, then to PDF
        doc = Document(filepath)
        html_content = "<html><body>"
        for paragraph in doc.paragraphs:
            html_content += f"<p>{paragraph.text}</p>"
        html_content += "</body></html>"
        
        html_path = filepath.replace('.docx', '.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
            
        pdfkit.from_file(html_path, output_path)
        
        # Clean up HTML file
        os.remove(html_path)

        return send_file(output_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert/excel-to-pdf', methods=['POST'])
def excel_to_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        df = pd.read_excel(filepath)
        html = df.to_html(table_id="excel-table")
        
        # Add some basic styling
        styled_html = f"""
        <html>
        <head>
            <style>
                #excel-table {{ border-collapse: collapse; width: 100%; }}
                #excel-table th, #excel-table td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
                #excel-table th {{ background-color: #f2f2f2; }}
            </style>
        </head>
        <body>
            {html}
        </body>
        </html>
        """
        
        html_path = filepath.replace('.xlsx', '.html')
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(styled_html)

        pdf_path = os.path.join(CONVERTED_FOLDER, file.filename.replace('.xlsx', '.pdf'))
        pdfkit.from_file(html_path, pdf_path)
        
        # Clean up HTML file
        os.remove(html_path)

        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert/image-to-pdf', methods=['POST'])
def image_to_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        image = Image.open(filepath).convert('RGB')
        pdf_path = os.path.join(CONVERTED_FOLDER, file.filename.rsplit('.', 1)[0] + '.pdf')
        image.save(pdf_path)

        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/convert/pdf-to-image', methods=['POST'])
def pdf_to_image():
    try:
        from pdf2image import convert_from_path
        
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        images = convert_from_path(filepath)
        image_paths = []

        for i, image in enumerate(images):
            output_path = os.path.join(CONVERTED_FOLDER, f"{file.filename.rsplit('.', 1)[0]}_page_{i + 1}.png")
            image.save(output_path, 'PNG')
            image_paths.append(output_path)

        return jsonify({
            "message": f"PDF converted to {len(image_paths)} images",
            "converted_images": image_paths,
            "total_pages": len(image_paths)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New endpoint to download individual files
@app.route('/download/<path:filename>')
def download_file(filename):
    try:
        return send_file(filename, as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Health check endpoint
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "upload_folder": UPLOAD_FOLDER,
        "converted_folder": CONVERTED_FOLDER,
        "folders_exist": {
            "uploads": os.path.exists(UPLOAD_FOLDER),
            "converted": os.path.exists(CONVERTED_FOLDER)
        }
    })

if __name__ == '__main__':
    print("Starting Document Converter API...")
    print(f"Upload folder: {os.path.abspath(UPLOAD_FOLDER)}")
    print(f"Converted folder: {os.path.abspath(CONVERTED_FOLDER)}")
    app.run(debug=True, host='0.0.0.0', port=5000)