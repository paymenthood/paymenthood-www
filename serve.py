#!/usr/bin/env python3
"""
Simple static file server with Jekyll include processing
"""
import http.server
import socketserver
import os
import re
from pathlib import Path

PORT = 4000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class JekyllHTMLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def do_GET(self):
        # Handle root path
        if self.path == '/':
            self.path = '/index.html'
        
        # Get the file path
        file_path = self.translate_path(self.path)
        
        # Check if it's an HTML file and exists
        if file_path.endswith('.html') and os.path.exists(file_path):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Process Jekyll includes
                content = self.process_includes(content)
                
                # Send response
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', len(content.encode('utf-8')))
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
                return
            except Exception as e:
                print(f"Error processing {file_path}: {e}")
        
        # For non-HTML files or if processing failed, use default handler
        return super().do_GET()
    
    def process_includes(self, content):
        """Process Jekyll include tags"""
        # Pattern to match {% include filename.html %}
        pattern = r'\{%\s*include\s+([^\s%]+)\s*%\}'
        
        def replace_include(match):
            include_file = match.group(1)
            include_path = os.path.join(DIRECTORY, '_includes', include_file)
            
            try:
                with open(include_path, 'r', encoding='utf-8') as f:
                    return f.read()
            except FileNotFoundError:
                print(f"Warning: Include file not found: {include_path}")
                return f"<!-- Include not found: {include_file} -->"
            except Exception as e:
                print(f"Error reading include {include_file}: {e}")
                return f"<!-- Error loading include: {include_file} -->"
        
        # Replace all include tags
        content = re.sub(pattern, replace_include, content)
        
        # Remove other Jekyll tags for now (like layout front matter)
        content = re.sub(r'---\s*\n.*?\n---\s*\n', '', content, flags=re.DOTALL)
        
        return content

def run_server():
    with socketserver.TCPServer(("", PORT), JekyllHTMLHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}/")
        print(f"Serving directory: {DIRECTORY}")
        print("Press Ctrl+C to stop the server")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    run_server()
