# 🧠 EmoDetect: Depression Detection System

## 🚀 Live Demo
👉 [Try EmoDetect Live](https://huggingface.co/spaces/harshadadesale22/EmoDetect)

An AI-powered **Natural Language Processing (NLP)** web application that detects signs of depression from user-entered text using **DistilBERT** and provides **SHAP (SHapley Additive Explanations)** visualizations for transparent and explainable predictions.

---

# 📖 Overview
EmoDetect is an AI-powered depression detection system developed using **DistilBERT**, **Flask**, and **HTML/CSS/JavaScript**. The application analyzes textual input to classify it as **Depressed** or **Not Depressed**, along with a confidence score and SHAP-based explainability graph that highlights the words influencing the prediction.

---

# ✨ Features
* 🧠 Depression Detection using DistilBERT
* 📊 SHAP Explainability Graph
* 📈 Confidence Score
* ⚡ Real-time Prediction
* 🌐 User-friendly Web Interface
* 🔥 Flask REST API Backend
* 📱 Responsive Design

---

# 🛠️ Tech Stack

## Frontend
* HTML5
* CSS3
* JavaScript

## Backend
* Python
* Flask
* Flask-CORS

## Machine Learning
* DistilBERT
* Hugging Face Transformers
* SHAP
* NumPy
* Scikit-learn
* Matplotlib

---

# 📂 Project Structure
```text
EmoDetect-Depression-Detection-System
│
├── Backend
│   ├── app.py
│   ├── requirements.txt
│   └── static/
│
├── Frontend
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── screenshots
│   ├── home-page.png
│   ├── depression-prediction.png
│   └── not-depressed-prediction.png
│
├── .gitignore
├── README.md
└── report.pdf
```

---

# 📸 Screenshots

## 🏠 Home Page
![Home Page](screenshots/home-page.png)

---

## 📉 Depression Prediction
![Depression Prediction](screenshots/depression-prediction.png)

---

## 😊 Not Depressed Prediction
![Not Depressed Prediction](screenshots/not-depressed-prediction.png)

---

# ⚙️ Installation

> 💡 Want to try it without installing anything? Use the [Live Demo](https://huggingface.co/spaces/harshadadesale22/EmoDetect) above.

## Clone Repository
```bash
git clone https://github.com/harshadadesale22/EmoDetect-Depression-Detection-System.git
```

### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup
Open the `Frontend` folder and launch the application using a local web server (for example, VS Code Live Server) or your preferred static file server.

---

# 🚀 Workflow
1. User enters text into the web interface.
2. The frontend sends the input to the Flask backend.
3. DistilBERT processes the text.
4. The model predicts whether the text indicates **Depressed** or **Not Depressed**.
5. SHAP generates an explainability graph showing the most influential words.
6. The prediction, confidence score, detected emotion, and SHAP visualization are displayed.

---

# 📊 Output
The application provides:
* Depression Prediction
* Detected Emotion
* Confidence Score
* SHAP Explainability Graph
* Important Influential Words

---

# 🔮 Future Enhancements
* User Authentication
* Prediction History
* Multi-language Support
* Emotion Classification
* Cloud Deployment
* Mobile Application

---

# 👥 Project Team
* Harshada Desale
* Nayan Khalane
* Darshana Khairnar
* Raj Jadhav

---

# 🎓 Academic Information
**Degree:** Master of Computer Applications (MCA)
**Institute:** SVKM's Institute of Technology, Dhule
**Academic Year:** 2025–2026
**Project Guide:** Prof. Madhuri Patil

---

# 📄 License
This project was developed for academic and educational purposes.
