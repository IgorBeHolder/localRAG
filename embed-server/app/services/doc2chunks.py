from docx import Document
from docx.enum.text import WD_PARAGRAPH_ALIGNMENT
from docx.oxml.ns import qn
from docx.shared import Pt
import json

def is_heading(paragraph):
    if paragraph.style.name.startswith('Heading'):
        return True
    return False

def convert_table_to_csv(table):
    csv_data = []
    for row in table.rows:
        row_data = [cell.text.replace('\n', ' ').strip() for cell in row.cells]
        csv_data.append(";".join(row_data))
    return "\n".join(csv_data)

def summarize_text(text):
    # This function would need an actual NLP model to perform summarization in a real-world scenario
    return "Summarized text: " + text[:100]

def process_word_document(doc_path):
    doc = Document(doc_path)
    json_structure = []

    section_title = None
    subsection_title = None
    current_chunk = None

    for element in doc.element.body:
        if isinstance(element, CT_P):
            paragraph = Paragraph(element, doc)
            if is_heading(paragraph):
                if current_chunk:
                    json_structure.append(current_chunk)
                
                section_title = paragraph.text.strip()
                subsection_title = None
                current_chunk = {
                    'document_title': os.path.basename(doc_path),
                    'section_title': section_title,
                    'subsection_title': subsection_title,
                    'content': [],
                    'tables': [],
                    'images': []
                }
            elif current_chunk:
                current_chunk['content'].append(paragraph.text.strip())
        
        elif isinstance(element, CT_Tbl):
            table = Table(element, doc)
            if current_chunk:
                current_chunk['tables'].append(convert_table_to_csv(table))

        elif "graphicData" in element.tag:
            if current_chunk:
                current_chunk['images'].append('Image_placeholder')

    if current_chunk:
        json_structure.append(current_chunk)

    return json_structure

def save_to_json(json_structure, output_filename):
    json_output = json.dumps(json_structure, ensure_ascii=False, indent=2)
    with open(output_filename, 'w', encoding='utf-8') as json_file:
        json_file.write(json_output)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python script.py input.docx output.json")
    else:
        input_docx = sys.argv[1]
        output_json = sys.argv[2]
        json_structure = process_word_document(input_docx)
        save_to_json(json_structure, output_json)
        print(f"Processed document {input_docx} and saved the output to {output_json}")
