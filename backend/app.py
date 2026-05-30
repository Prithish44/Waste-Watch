from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from datetime import datetime
from werkzeug.utils import secure_filename
from ultralytics import YOLO
from main import get_severity
import glob
import shutil
import json

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = './images'
RESULT_FOLDER = './runs/detect'
SAVE_FOLDER = './server/save'
DATA_FILE = './server/data.json'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)
os.makedirs(SAVE_FOLDER, exist_ok=True)
os.makedirs('./server', exist_ok=True)

# Create empty data.json if not present
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        f.write('[]')

model = YOLO("best.pt")

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    # Clean up old predict folders
    for folder in glob.glob('./runs/detect/predict*'):
        try:
            shutil.rmtree(folder)
        except Exception as e:
            print(f"Failed to delete {folder}: {e}")

    file = request.files['image']
    filename = secure_filename(file.filename)
    timestamped = datetime.now().strftime("%Y%m%d%H%M%S") + "_" + filename
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], timestamped)
    file.save(image_path)

    # Run YOLO prediction (creates ./runs/detect/predict)
    model(image_path, save=True, save_crop=True)

    # Find latest predict folder
    predict_folders = sorted(
        glob.glob('./runs/detect/predict*'),
        key=os.path.getmtime,
        reverse=True
    )
    if not predict_folders:
        return jsonify({'error': 'No predict folder found'}), 500

    latest_predict = predict_folders[0]

    # Get result image
    result_images = [
        f for f in os.listdir(latest_predict)
        if f.lower().endswith((".jpg", ".png"))
    ]
    if not result_images:
        return jsonify({'error': 'No output image found'}), 500

    result_image_path = os.path.join(latest_predict, result_images[0]).replace("\\", "/")

    # Save a copy of result image
    result_filename = os.path.basename(result_image_path)
    saved_result_path = os.path.join(SAVE_FOLDER, result_filename)
    shutil.copyfile(result_image_path, saved_result_path)

    # Get lat/lon from form (optional)
    latitude = request.form.get('latitude', '')
    longitude = request.form.get('longitude', '')
    timestamp = datetime.now().isoformat()

    # Save metadata
    image_url = '/server/save/' + result_filename
    new_entry = {
        'timestamp': timestamp,
        'latitude': latitude,
        'longitude': longitude,
        'image_url': image_url
    }

    try:
        with open(DATA_FILE, 'r+') as f:
            data = json.load(f)
            data.append(new_entry)
            f.seek(0)
            json.dump(data, f, indent=4)
    except Exception as e:
        print(f"Error writing to data.json: {e}")

    # Get cropped patch images
    crop_dir = os.path.join(latest_predict, 'crops', 'garbage')
    crop_images = []
    if os.path.exists(crop_dir):
        crop_images = [
            os.path.join(crop_dir, f).replace("\\", "/")
            for f in os.listdir(crop_dir)
            if f.lower().endswith((".jpg", ".png"))
        ]

    # Severity from patch directory if it exists
    severity = get_severity("best.pt", image_path, patch_save_dir=crop_dir) if os.path.exists(crop_dir) else "Unknown"
    print("Returned severity:", severity)

    return jsonify({
        'result_image_path': '/' + result_image_path,
        'crop_images': crop_images,
        'severity': severity
    })


@app.route('/runs/detect/<path:filename>')
def serve_detected_files(filename):
    return send_from_directory(RESULT_FOLDER, filename)

@app.route('/server/save/<path:filename>')
def serve_saved_images(filename):
    return send_from_directory(SAVE_FOLDER, filename)

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5001, debug=True)
