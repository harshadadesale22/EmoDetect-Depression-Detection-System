from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import numpy as np
import os

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# ===== MODEL =====
MODEL_NAME = "harshadadesale22/bert-depression-model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

device = torch.device("cpu")
model.to(device)
model.eval()

# ===== PREDICT =====
def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)

    if "token_type_ids" in inputs:
        del inputs["token_type_ids"]

    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    pred = torch.argmax(probs, dim=1).item()
    conf = probs[0][pred].item()

    return pred, conf

# ===== ROUTES =====
@app.route("/")
def home():
    return app.send_static_file("index.html")

@app.route("/predict", methods=["POST"])
def predict_api():
    try:
        data = request.json
        text = data["text"]

        pred, conf = predict(text)
        label = "Depressed" if pred == 1 else "Not Depressed"

        return jsonify({
            "prediction": label,
            "confidence": round(conf * 100, 2),
            "emotion": "sadness" if pred == 1 else "neutral",
            "graph_url": None
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port)