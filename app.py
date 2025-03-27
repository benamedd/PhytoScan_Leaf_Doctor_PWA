import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from leaf_analysis import analyze_leaf
import os

print("Starting Flask app...")

app = Flask(__name__, static_folder='static')
CORS(app, origins=["*"])  # Autoriser toutes les requêtes (peut être restreint si besoin)

print("Flask app initialized...")

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')

@app.route('/uploadManual', methods=['POST'])
def upload_manual_file():
    try:
        data = request.get_json()
        image_dataURL = data.get('imagePath')
        threshold = int(data.get("threshold", 0))  # Valeur par défaut à 0 si non fournie

        if not image_dataURL:
            return jsonify({'error': 'Missing image data'}), 400

        # Extraction des données base64
        image_data = image_dataURL.split(",")[1]
        decoded_data = base64.b64decode(image_data)

        # Conversion en image
        image_file = BytesIO(decoded_data)
        img = Image.open(image_file)

        # Conversion en format OpenCV
        image_np = np.array(img)
        image_opencv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        # Création du dossier uploads s'il n'existe pas
        os.makedirs('uploads', exist_ok=True)

        filepath = os.path.join('uploads', "canvasImage.png")
        cv2.imwrite(filepath, image_opencv)

        severity_data = analyze_leaf(filepath, threshold)
        return jsonify({
            'severity': f"{severity_data['percentage']:.2f}% ({severity_data['level']})"
        })
    except Exception as e:
        print(f"Error in /uploadManual: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    try:
        if
