import json
import os

from docx import Document

# Define the path to the document
doc_path = '/Users/velo1/Downloads/Инструкция Focal SW 700(800)V (RUS).txt'

# Load the document
doc = Document(doc_path)

# Function to check if a paragraph is a heading
def is_heading(paragraph):
    if paragraph.style.name.startswith('Heading'):
        return True
    return False

# Function to get the text of a paragraph
def get_paragraph_text(paragraph):
    return paragraph.text.strip()

# List to hold chunks of text
chunks = []

# Variables to keep track of the document, section, subsection and page number
document_title = os.path.basename(doc_path)
current_section = ""
current_subsection = ""
page_number = 1

# Process the document
for paragraph in doc.paragraphs:
    if is_heading(paragraph):
        # Check if it's a new section or subsection
        if 'Heading 1' in paragraph.style.name:
            current_section = get_paragraph_text(paragraph)
            current_subsection = ""  # Reset subsection when a new section starts
        elif 'Heading 2' in paragraph.style.name:
            current_subsection = get_paragraph_text(paragraph)
    else:
        # If it's not a heading, it's part of a section or subsection
        if current_section or current_subsection:
            # Get the text and append it to the chunks list with the document and section info
            text = get_paragraph_text(paragraph)
            if text:  # Avoid adding empty paragraphs
                chunks.append({
                    "document_title": document_title,
                    "section": current_section,
                    "subsection": current_subsection,
                    "page_number": page_number,
                    "text": text
                })
        # Increase page number if 'page break' is encountered
        if 'page break' in paragraph.text.lower():
            page_number += 1

# Construct the output JSON file name based on the input file name
base_name = os.path.splitext(os.path.basename(doc_path))[0]
output_json_path = f'/Users/velo1/my_projects/localRAG/embed-server/app/data/{base_name}.json'

# Save the chunks to a JSON file
with open(output_json_path, 'w', encoding='utf-8') as json_file:
    json.dump(chunks, json_file, ensure_ascii=False, indent=4)
