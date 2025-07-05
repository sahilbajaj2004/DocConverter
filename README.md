# 📄 DocuConvert — Multi-Format File Converter

A web app to convert files between PDF, Word, Excel, Images, and HTML formats using a Python + Flask backend and a modern frontend built with Next.js and Tailwind CSS.

---

## ✅ Features

- 📃 PDF → Word (.pdf → .docx)
- 📝 Word → PDF (.docx → .pdf)
- 📷 Image → PDF (.jpg, .png, .bmp → .pdf)
- 📄 PDF → Images (.pdf → .png)
- 📊 Excel → PDF (.xlsx → .pdf)
- 🌐 HTML → PDF *(internally used in Word/Excel to PDF)*

---

## ⚙️ Tech Stack

| Layer     | Tech                       |
|-----------|----------------------------|
| Backend   | Flask (Python)             |
| Frontend  | Next.js, Tailwind CSS      |
| Conversion Libraries | pdf2docx, pdfkit, Pillow, PyPDF2, docx, pandas, pdf2image |
| Other     | Poppler (required for PDF to image), CORS enabled |

---

## 🗂 Project Structure

project-root/
│
├── app.py # Flask backend
├── /uploads # Uploaded files
├── /converted # Output files
├── frontend/ # Next.js frontend
│ ├── page.tsx # UI & logic
│ └── ...
├── README.md
└── requirements.txt
## 🚀 Getting Started

### 1. Clone the Repo
git clone https://github.com/your-username/docuconvert.git
cd DocConvert
2. Set Up Backend (Flask)
Make sure you have Python 3.9+ and poppler-utils installed.

🛠️ Install dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
🏃 Run Flask server
bash
Copy
Edit
python app.py
Server will start at: http://localhost:5000

⚠️ Make sure Poppler is installed and available in PATH for pdf2image to work
Mac: brew install poppler
Ubuntu: sudo apt install poppler-utils
Windows: https://github.com/oschwartz10612/poppler-windows

3. Set Up Frontend (Next.js + Tailwind)
bash
Copy
Edit
cd frontend
npm install
npm run dev
App will run at: http://localhost:3000
Frontend connects to backend at http://localhost:5000 — update the API_BASE_URL in page.tsx if needed.

📦 API Endpoints (Backend)
Endpoint	Method	Purpose
/convert/pdf-to-word	POST	Convert PDF → DOCX
/convert/word-to-pdf	POST	Convert DOCX → PDF
/convert/excel-to-pdf	POST	Convert Excel → PDF
/convert/image-to-pdf	POST	Convert Image → PDF
/convert/pdf-to-image	POST	Convert PDF → PNGs
/download/<path>	GET	Download converted files
/health	GET	Backend health check

🖼 UI Preview
Add screenshots of your UI here if needed.

✅ To Do / Ideas
 Drag & drop file upload

 Batch file conversion

 Merge / split PDFs

 Upload from Google Drive / Dropbox

 Dark mode toggle

📄 License
MIT License — free to use, modify, and contribute.

🙌 Author
Made with ❤️ by Sahil Bajaj
Frontend: Next.js + Tailwind
Backend: Flask (Python)