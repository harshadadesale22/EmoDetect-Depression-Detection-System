/**
 * EmoDetect — script.js
 * Handles input validation, Flask API integration, and result rendering
 */

'use strict';

/* ============================================================
   DOM References
   ============================================================ */
const themeToggle     = document.getElementById('themeToggle');
const toggleIcon      = themeToggle.querySelector('.toggle-icon');
const statusDot       = document.getElementById('statusDot');
const statusLabel     = document.getElementById('statusLabel');
const userInput       = document.getElementById('userInput');
const charCounter     = document.getElementById('charCounter');
const inputError      = document.getElementById('inputError');
const analyzeBtn      = document.getElementById('analyzeBtn');
const clearBtn        = document.getElementById('clearBtn');
const loadingSection  = document.getElementById('loadingSection');
const resultSection   = document.getElementById('resultSection');
const errorSection    = document.getElementById('errorSection');
const closeResult     = document.getElementById('closeResult');
const retryBtn        = document.getElementById('retryBtn');

// Result elements
const resultBadge     = document.getElementById('resultBadge');
const predictionValue = document.getElementById('predictionValue');
const emotionBadge    = document.getElementById('emotionBadge');
const confidencePct   = document.getElementById('confidencePct');
const progressFill    = document.getElementById('progressFill');
const progressGlow    = document.getElementById('progressGlow');
const progressBar     = document.getElementById('progressBar');
const wordsChips      = document.getElementById('wordsChips');
const wordsBlock      = document.getElementById('wordsBlock');
const shapImage       = document.getElementById('shapImage');
const shapBlock       = document.getElementById('shapBlock');
const errorBody       = document.getElementById('errorBody');

const BACKEND_URL     = 'https://harshadadesale22-emodetect.hf.space/predict';
const HEALTH_URL      = 'https://harshadadesale22-emodetect.hf.space/';
const MAX_CHARS       = 600;

/* ============================================================
   Theme Toggle
   ============================================================ */
const savedTheme = localStorage.getItem('emodetect-theme') || 'dark';
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem('emodetect-theme', next);
});

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  toggleIcon.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
}

/* ============================================================
   Server Health Check
   ============================================================ */
checkServerHealth();

async function checkServerHealth() {
  try {
    const res = await fetch(HEALTH_URL, { method: 'GET', signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      setStatus('online', 'API online');
    } else {
      setStatus('offline', 'API error');
    }
  } catch {
    setStatus('offline', 'API offline');
  }
}

function setStatus(state, label) {
  statusDot.className = 'status-dot ' + state;
  statusLabel.textContent = label;
}

/* ============================================================
   Character Counter
   ============================================================ */
userInput.addEventListener('input', handleInput);

function handleInput() {
  const len = userInput.value.length;
  charCounter.textContent = `${len} / ${MAX_CHARS}`;

  charCounter.classList.remove('near-limit', 'at-limit');
  if (len >= MAX_CHARS) {
    charCounter.classList.add('at-limit');
  } else if (len >= MAX_CHARS * 0.85) {
    charCounter.classList.add('near-limit');
  }

  // Clear number error on re-input
  if (inputError.classList.contains('visible')) {
    clearError();
  }
}

/* ============================================================
   Input Validation
   ============================================================ */
function validateInput(text) {
  if (!text.trim()) {
    showError('Please enter your thoughts before analyzing.');
    return false;
  }
  if (/\d/.test(text)) {
    showError('Numbers are not allowed. Please use only text.');
    return false;
  }
  return true;
}

function showError(msg) {
  inputError.textContent = msg;
  inputError.classList.add('visible');
  userInput.setAttribute('aria-invalid', 'true');
  userInput.focus();
}

function clearError() {
  inputError.textContent = '';
  inputError.classList.remove('visible');
  userInput.removeAttribute('aria-invalid');
}

/* ============================================================
   Enter Key → Analyze
   ============================================================ */
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    runAnalysis();
  }
});

/* ============================================================
   Buttons
   ============================================================ */
analyzeBtn.addEventListener('click', (e) => {
  e.preventDefault();
  runAnalysis();
});

clearBtn.addEventListener('click', () => {
  userInput.value = '';
  charCounter.textContent = `0 / ${MAX_CHARS}`;
  charCounter.classList.remove('near-limit', 'at-limit');
  clearError();
  hideSection(resultSection);
  hideSection(errorSection);
  hideSection(loadingSection);
  analyzeBtn.disabled = false;
  userInput.focus();
});

closeResult.addEventListener('click', () => {
  hideSection(resultSection);
});

retryBtn.addEventListener('click', () => {
  hideSection(errorSection);
  runAnalysis();
});

/* ============================================================
   Core: Run Analysis
   ============================================================ */
async function runAnalysis() {
  const text = userInput.value;

  clearError();
  if (!validateInput(text)) return;

  // UI: loading state
  hideSection(resultSection);
  hideSection(errorSection);
  showSection(loadingSection);
  setAnalyzeDisabled(true);

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.trim() }),
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();
    hideSection(loadingSection);
    renderResults(data);
    setStatus('online', 'API online');

  } catch (err) {
  hideSection(loadingSection);

  if (err.name === 'TimeoutError') {
    setStatus('online', 'Processing...');
    showNetworkError('Analysis is taking longer than expected because the SHAP explanation is being generated. Please try again in a few moments.');
  } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
    setStatus('offline', 'API offline');
    showNetworkError('Could not reach the backend. Please ensure the Flask server is running at <code>http://127.0.0.1:5000</code>.');
  } else {
    setStatus('offline', 'API error');
    showNetworkError(`Error: ${err.message}`);
  }
} finally {
  setAnalyzeDisabled(false);
}
}

/* ============================================================
   Render Results
   ============================================================ */
function renderResults(data) {
  const { prediction, confidence, emotion, important_words, graph_url } = data;
  const isDepressed = prediction?.toLowerCase().includes('depressed') &&
                      !prediction?.toLowerCase().includes('not');

  /* -- Badge & Prediction -- */
  const badgeClass = isDepressed ? 'depressed' : 'not-depressed';
  resultBadge.className = 'result-badge ' + badgeClass;
  resultBadge.textContent = isDepressed ? 'Analysis Complete' : 'Analysis Complete';

  predictionValue.textContent = prediction || '—';
  predictionValue.className = 'metric-value prediction-value ' + badgeClass;

  /* -- Emotion -- */
  const emotionMap = {
    sadness: '😔', joy: '😊', anger: '😠', fear: '😨',
    surprise: '😲', disgust: '🤢', neutral: '😐', anxiety: '😰',
    love: '💙', hopelessness: '😞',
  };
  const emo = (emotion || 'neutral').toLowerCase();
  const emoji = emotionMap[emo] || '🎭';
  emotionBadge.textContent = `${emoji} ${emo}`;

  /* -- Confidence bar (animated) -- */
  const pct = parseFloat(confidence) || 0;
  confidencePct.textContent = '0%';
  progressFill.style.width = '0%';
  progressGlow.style.width = '0%';
  progressBar.setAttribute('aria-valuenow', pct);

  // Animate after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressFill.style.width = pct + '%';
      progressGlow.style.width = pct + '%';
      animateCounter(confidencePct, 0, pct, 1200, (v) => `${v.toFixed(1)}%`);
    });
  });

  /* -- Important words -- */
  wordsChips.innerHTML = '';
  const words = Array.isArray(important_words) ? important_words : [];
  if (words.length > 0) {
    words.forEach((word, i) => {
      const chip = document.createElement('span');
      chip.className = 'word-chip';
      chip.textContent = word;
      chip.style.animationDelay = `${i * 60}ms`;
      wordsChips.appendChild(chip);
    });
    showInline(wordsBlock);
  } else {
    hideSection(wordsBlock);
  }

  /* -- SHAP Graph -- */
  if (graph_url) {
    shapImage.classList.remove('loaded');
    shapImage.src = '';

    const img = new Image();
    img.onload = () => {
      shapImage.src = graph_url;
      requestAnimationFrame(() => shapImage.classList.add('loaded'));
    };
    img.onerror = () => {
      hideSection(shapBlock);
    };
    img.src = graph_url;
    showInline(shapBlock);
  } else {
    hideSection(shapBlock);
  }

  /* -- Show result section -- */
  showSection(resultSection);

  // Smooth scroll
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

/* ============================================================
   Animated Counter
   ============================================================ */
function animateCounter(el, from, to, duration, formatter) {
  const start = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = formatter(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============================================================
   Network Error Display
   ============================================================ */
function showNetworkError(message) {
  errorBody.innerHTML = message;
  showSection(errorSection);
  errorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ============================================================
   Helpers
   ============================================================ */
function showSection(el) {
  el.removeAttribute('hidden');
}

function hideSection(el) {
  el.setAttribute('hidden', '');
}

function showInline(el) {
  el.removeAttribute('hidden');
}

function setAnalyzeDisabled(state) {
  analyzeBtn.disabled = state;
}