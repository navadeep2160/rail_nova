import zipfile
import os

def zip_project(output_filename):
    print(f"Zipping project to {output_filename}...")
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk('.'):
            # Exclude directories
            dirs[:] = [d for d in dirs if d not in ['node_modules', '__pycache__', '.git', '.venv', 'venv', 'dist', 'build']]
            
            for file in files:
                if file.endswith('.zip') or file.endswith('.pyc'):
                    continue
                
                file_path = os.path.join(root, file)
                zipf.write(file_path, arcname=os.path.relpath(file_path, '.'))
    print("Bundle created successfully!")

if __name__ == "__main__":
    zip_project('Rail_Nova_Submission.zip')
