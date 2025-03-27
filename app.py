import base64
from io import BytesIO
from PIL import Image
import cv2
import numpy as np
from flask import Flask, request, jsonify 
from flask_cors import CORS  # Import CORS
from leaf_analysis import analyze_leaf
import os
print("Starting Flask app...")
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes, or specific ones
app = Flask(__name__, static_folder='static')

print("Flask app initialized...")

@app.route('/')
def serve_index():
    return app.send_static_file('index.html')


@app.route('/uploadManual', methods=['POST'])
def upload_manual_file():
    try:
        data = request.get_json()
        image_dataURL = data['imagePath']
        threshold = int(data["threshold"])

        # Strip "data:image/png;base64," from the data URL
        image_data = image_dataURL.split(",")[1]
        decoded_data = base64.b64decode(image_data)

        # Convert to an image object
        image_file = BytesIO(decoded_data)
        img = Image.open(image_file)

        # Convert to a NumPy array
        image_np = np.array(img)
        image_opencv = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)

        filepath = os.path.join('uploads', "canvasImage.png")
        cv2.imwrite(filepath, image_opencv)

        severity_data = analyze_leaf(filepath, threshold)
        return jsonify({
            'severity': f"{severity_data['percentage']:.2f}% ({severity_data['level']})"
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filepath = os.path.join('uploads', file.filename)
    os.makedirs('uploads', exist_ok=True)
    file.save(filepath)

    try:
        severity_data = analyze_leaf(filepath)
        return jsonify({
            'severity': f"{severity_data['percentage']:.2f}% ({severity_data['level']})",
            'image_url': f'/uploads/{file.filename}'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    print("Running app in debug mode...")
    app.run(debug=True)