/* ================================================
   Swiftora Demo — AI Listing Generator
   Calls the Anthropic Claude API via proxy.
   Production: replace x-use-proxy with a backend
   proxy that injects the API key server-side.
================================================ */

const SYSTEM_PROMPT = `You are Swiftora, an AI assistant for vintage and resale sellers. When given an item description, respond ONLY with a JSON object with these exact keys: title (string, eBay-optimized, under 80 chars), description (string, 3-4 sentences, buyer-focused), price_low (number), price_high (number), price_rationale (string, one sentence explaining the range), condition_notes (string, what to mention about condition), tags (array of 8 strings, no # symbol), category (string), era (string). Base pricing on realistic eBay sold comps for the item type. Return only valid JSON, no markdown.`;

const MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

// ---- DOM refs ----
const generateBtn   = document.getElementById('generate-btn');
const itemInput     = document.getElementById('item-input');
const outputSection = document.getElementById('output-section');
const outputCard    = document.getElementById('output-card');
const photoInput    = document.getElementById('photo-input');
const thumbGrid     = document.getElementById('thumb-grid');
const uploadArea    = document.getElementById('upload-area');

// ---- State ----
let lastTitle = '';
let lastDescription = '';

// ---- Photo upload thumbnails ----
if (photoInput) {
  photoInput.addEventListener('change', () => {
    thumbGrid.innerHTML = '';
    Array.from(photoInput.files).forEach(file => {
      const url = URL.createObjectURL(file);
      const img = document.createElement('img');
      img.src = url;
      img.alt = file.name;
      img.className = 'thumb-img';
      img.loading = 'lazy';
      thumbGrid.appendChild(img);
    });
  });
}
if (uploadArea) {
  uploadArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); photoInput.click(); }
  });
}

// ---- Generate button + Enter key ----
if (generateBtn) {
  generateBtn.addEventListener('click', runDemo);
}
if (itemInput) {
  itemInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) runDemo();
  });
}

async function runDemo() {
  const description = itemInput ? itemInput.value.trim() : '';
  if (!description) {
    if (itemInput) {
      itemInput.focus();
      itemInput.style.borderColor = '#ef4444';
      setTimeout(() => itemInput.style.borderColor = '', 2000);
    }
    return;
  }

  showLoading();

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'anthropic-version': '2023-06-01',
        'x-use-proxy':       'true',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: 1000,
        system:     SYSTEM_PROMPT,
        messages:   [{ role: 'user', content: description }],
      }),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.content?.[0]?.text || '';

    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleaned);

    showResult(result, description);
  } catch (err) {
    console.warn('Swiftora demo error:', err);
    showError();
  }
}

function showLoading() {
  outputSection.hidden = false;
  outputCard.innerHTML = `
    <div class="output-loading">
      <div class="spinner" aria-hidden="true"></div>
      <span>Swiftora is analyzing your item…</span>
    </div>
  `;
  outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showResult(r, rawInput) {
  lastTitle       = r.title       || '';
  lastDescription = r.description || '';

  const tagsHtml = Array.isArray(r.tags)
    ? r.tags.map(t => `<span class="tag-chip">${esc(t)}</span>`).join('')
    : '';

  outputCard.innerHTML = `
    <div class="output-result">
      <div>
        <div class="output-row-label">Generated title</div>
        <div class="output-title-text">${esc(r.title)}</div>
      </div>

      <div>
        <div class="output-row-label">Suggested price</div>
        <div class="output-price-row">
          <span class="price-badge">$${r.price_low} — $${r.price_high}</span>
          <span class="price-rationale-text">${esc(r.price_rationale)}</span>
        </div>
      </div>

      <div>
        <div class="output-row-label">Description</div>
        <div class="output-desc-text">${esc(r.description)}</div>
      </div>

      <div>
        <div class="output-row-label">Condition notes</div>
        <div class="output-condition-text">${esc(r.condition_notes)}</div>
      </div>

      <div>
        <div class="output-row-label">Tags</div>
        <div class="tags-flex">${tagsHtml}</div>
      </div>

      <div class="output-meta-row">
        ${r.category ? `<span class="meta-chip">Category: ${esc(r.category)}</span>` : ''}
        ${r.era      ? `<span class="meta-chip">Era: ${esc(r.era)}</span>`           : ''}
      </div>

      <div class="output-actions">
        <button class="btn btn-primary" id="copy-listing-btn" type="button">Copy Listing</button>
        <button class="btn btn-secondary" id="try-again-btn" type="button">Try Another Item</button>
        <span class="copy-confirm" id="copy-confirm" aria-live="polite">✓ Copied to clipboard</span>
      </div>
    </div>
  `;

  document.getElementById('copy-listing-btn').addEventListener('click', copyListing);
  document.getElementById('try-again-btn').addEventListener('click', () => {
    outputSection.hidden = true;
    if (itemInput) { itemInput.value = ''; itemInput.focus(); }
  });
}

function showError() {
  outputCard.innerHTML = `
    <div class="output-error">
      <h3>Demo temporarily unavailable</h3>
      <p>
        The live AI demo isn't available right now.<br />
        <a href="index.html#waitlist">Join the waitlist</a> to get notified when Swiftora launches.
      </p>
    </div>
  `;
}

function copyListing() {
  const text = `${lastTitle}\n\n${lastDescription}`;
  navigator.clipboard.writeText(text).then(() => {
    const confirm = document.getElementById('copy-confirm');
    if (confirm) {
      confirm.classList.add('is-visible');
      setTimeout(() => confirm.classList.remove('is-visible'), 3000);
    }
  }).catch(() => {
    // Fallback for environments without clipboard API
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const confirm = document.getElementById('copy-confirm');
    if (confirm) {
      confirm.classList.add('is-visible');
      setTimeout(() => confirm.classList.remove('is-visible'), 3000);
    }
  });
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}
