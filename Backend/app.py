from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import shap
import numpy as np
import matplotlib

matplotlib.use('Agg')
import matplotlib.pyplot as plt
import os
import uuid

app = Flask(__name__, static_folder="static")
CORS(app)

# ===== MODEL =====
MODEL_NAME = "harshadadesale22/bert-depression-model"

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)

device = torch.device("cpu")
model.to(device)
model.eval()

# ===== SHAP =====
# masker = shap.maskers.Text(tokenizer)

def shap_predict(texts):
    inputs = tokenizer(
        list(texts),
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=128
    )

    if "token_type_ids" in inputs:
        del inputs["token_type_ids"]

    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)

    return probs.cpu().numpy()

# explainer = shap.Explainer(shap_predict, masker)

# ===== STATIC FOLDER =====
if not os.path.exists("static"):
    os.makedirs("static")

# ===== SHAP GRAPH (NO BLINK) =====
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS

def generate_shap_graph(text):

    shap_values = explainer([text])

    tokens = shap_values[0].data
    values = shap_values[0].values[:, 1]

    clean_tokens = []
    clean_values = []

    for t, v in zip(tokens, values):

        t_clean = t.lower().strip()

        # 🚀 REMOVE USELESS WORDS
        if (
            t not in ["[CLS]", "[SEP]", "[PAD]"]
            and t_clean not in ENGLISH_STOP_WORDS
            and len(t_clean) > 2
            and t_clean.isalpha()
        ):
            clean_tokens.append(t_clean)
            clean_values.append(v)

    if len(clean_tokens) == 0:
        return None

    # 🔥 SORT ALL WORDS BY IMPORTANCE
    idx = np.argsort(np.abs(clean_values))[::-1]

    # 👉 Limit for readability (IMPORTANT)
    idx = idx[:15]

    top_tokens = np.array(clean_tokens)[idx]
    top_values = np.array(clean_values)[idx]

    # Reverse for horizontal bar display
    top_tokens = top_tokens[::-1]
    top_values = top_values[::-1]

    # Colors
    colors = ["red" if v > 0 else "blue" for v in top_values]

    # 🔥 UNIQUE FILE (NO BLINK)
    filename = f"shap_{uuid.uuid4().hex}.png"
    path = os.path.join("static", filename)

    # 🔥 DELETE OLD FILES
    for file in os.listdir("static"):
        if file.startswith("shap_"):
            try:
                os.remove(os.path.join("static", file))
            except:
                pass

    # ===== PLOT =====
    plt.figure(figsize=(9, 5))
    plt.barh(top_tokens, top_values, color=colors)

    plt.axvline(0, color="black", linestyle="--")

    plt.title(f'Top Words Influencing Prediction\n("{text}")')
    plt.xlabel("SHAP Value (Impact)")

    # Add values on bars
    for i, v in enumerate(top_values):
        plt.text(v, i, f"{v:.3f}")

    plt.tight_layout()
    plt.savefig(path)
    plt.close()

    return path

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

@app.route("/")
def home():
    return jsonify({
        "status": "API Running"
    })

# ===== API =====
@app.route("/predict", methods=["POST"])
def predict_api():
    try:
        data = request.json
        text = data["text"]

        pred, conf = predict(text)
        label = "Depressed" if pred == 1 else "Not Depressed"

        # graph_path = generate_shap_graph(text)

        graph_url = None

        # if graph_path:
            # graph_url = request.host_url.rstrip("/") + "/" + graph_path

        return jsonify({
            "prediction": label,
            "confidence": round(conf * 100, 2),
            "emotion": "sadness" if pred == 1 else "neutral",
            "graph_url": graph_url
        })

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
