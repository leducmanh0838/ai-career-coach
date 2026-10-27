# Copyright (c) 2026 AURA FARMING 20 PRO MAX
#
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.

# app/services/analyze_skill_service/utils.py
import json
import re
import unicodedata
from pathlib import Path
from typing import Optional
import pdfplumber
from pydantic import BaseModel

def extract_document_text(pdf_path: str) -> str:
    path = Path(pdf_path)
    if not path.is_file():
        raise FileNotFoundError(f"Không tìm thấy file tài liệu: {path}")

    pages = []
    with pdfplumber.open(path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text(layout=True)
            if text and text.strip():
                pages.append(f"--- Page {page_number} ---\n{text.strip()}")

    result = "\n\n".join(pages).strip()
    if not result:
        raise ValueError("Không trích xuất được văn bản từ PDF.")
    return result

def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFC", text or "")
    return re.sub(r"\s+", " ", text).strip()

def is_evidence_in_doc(evidence: str, doc_text: str) -> bool:
    return bool(normalize_text(evidence) and normalize_text(evidence) in normalize_text(doc_text))

def save_debug_artifact(debug_dir: Optional[str], filename: str, data):
    if not debug_dir:
        return
    debug_path = Path(debug_dir)
    debug_path.mkdir(parents=True, exist_ok=True)
    file_path = debug_path / filename

    if isinstance(data, str):
        file_path.write_text(data, encoding="utf-8")
    elif isinstance(data, BaseModel):
        file_path.write_text(data.model_dump_json(indent=2), encoding="utf-8")
    else:
        file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")