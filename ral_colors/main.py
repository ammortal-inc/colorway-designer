
import re
import csv
from bs4 import BeautifulSoup

def extract_colors_from_html(html_path, csv_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    color_entries = []
    for a in soup.find_all('a', class_='farbe'):
        # Extract hex color (remove #)
        style = a.get('style', '')
        hex_match = re.search(r'background-color:\s*#([0-9A-Fa-f]{6})', style)
        hex_color = hex_match.group(1) if hex_match else ''

        # Extract RAL number
        number_span = a.find('span', class_='number')
        ral_number = number_span.get_text(strip=True) if number_span else ''

        # Extract English color name (if present)
        subtext_div = a.find('div', class_='subtext')
        english_name = ''
        if subtext_div:
            # English name is after <br>
            parts = subtext_div.decode_contents().split('<br/>')
            if len(parts) > 1:
                english_name = BeautifulSoup(parts[1], 'html.parser').get_text(strip=True)
            else:
                english_name = ''

        color_entries.append({
            'number': ral_number,
            'hex': hex_color,
            'name': english_name
        })

    # Write to CSV
    with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=['number', 'hex', 'name'])
        writer.writeheader()
        for entry in color_entries:
            writer.writerow(entry)

if __name__ == '__main__':
    extract_colors_from_html('ral_colors.html', 'ral_colors.csv')
