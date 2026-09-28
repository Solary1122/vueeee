<script setup>
import { ref } from 'vue';

const props = defineProps({
  baseHtml: {
    type: String,
    default: '',
  },
});

const domainInput = ref('');
const activeTab = ref('generator');
const presetDomains = ref([
  'facebook.com',
  'stripe.com',
  'airbnb.com',
  'github.com',
  'spotify.com',
  'netflix.com',
]);

const handleGenerate = () => {
  if (!domainInput.value.trim()) return;
  const cleanDomain = domainInput.value
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
  window.location.href = `/?company=${encodeURIComponent(cleanDomain)}`;
};

const handlePresetClick = (domain) => {
  window.location.href = `/?company=${encodeURIComponent(domain)}`;
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            ⚡
          </div>
          <div>
            <span class="font-bold text-lg tracking-tight text-white">LandingCreator</span>
            <span class="ml-2 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Metadata Engine
            </span>
          </div>
        </div>

        <div class="flex space-x-2">
          <button
            @click="activeTab = 'generator'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer',
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            ]"
          >
            Generator Dashboard
          </button>
          <button
            @click="activeTab = 'template'"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer',
              activeTab === 'template'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            ]"
          >
            View Base Template
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div v-if="activeTab === 'generator'" class="space-y-12">
        <!-- Hero Banner -->
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Dynamic Landing Page Generator
          </h1>
          <p class="text-slate-400 text-lg leading-relaxed">
            Enter any company URL parameter to extract domain metadata (logos, branding, colors) and generate a customized landing page using a <span class="text-indigo-400 font-semibold">fast metadata customization engine</span> without requiring external AI API keys.
          </p>

          <!-- URL Generator Form -->
          <form @submit.prevent="handleGenerate" class="mt-8 max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                /?company=
              </div>
              <input
                v-model="domainInput"
                type="text"
                placeholder="facebook.com"
                class="w-full pl-28 pr-4 py-3.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm shadow-inner"
                required
              />
            </div>
            <button
              type="submit"
              class="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Test Page</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>

        <!-- Quick Test Presets -->
        <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <h2 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Quick Test Presets
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <button
              v-for="domain in presetDomains"
              :key="domain"
              @click="handlePresetClick(domain)"
              class="p-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 rounded-xl text-left transition group cursor-pointer"
            >
              <div class="text-xs text-slate-500 font-mono mb-1">?company=</div>
              <div class="text-sm font-medium text-slate-200 group-hover:text-indigo-400 truncate">
                {{ domain }}
              </div>
            </button>
          </div>
        </div>

        <!-- Architecture Highlights -->
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div class="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg">
              🔍
            </div>
            <h3 class="text-lg font-semibold text-white">1. Domain Metadata Scraper</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Fetches brand favicon via Google Favicon API, parses OpenGraph tags (<code class="text-indigo-300">og:image</code>, <code class="text-indigo-300">og:title</code>), meta theme color, and target domain metadata using Cheerio.
            </p>
          </div>

          <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div class="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
              ⚙️
            </div>
            <h3 class="text-lg font-semibold text-white">2. Metadata Customization Engine</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Uses deterministic HTML pattern replacement to update logos, titles, colors, backgrounds, and redirect configurations while preserving CSS/JS structural integrity.
            </p>
          </div>

          <div class="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
            <div class="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold text-lg">
              ⚡
            </div>
            <h3 class="text-lg font-semibold text-white">3. Edge Caching & Delivery</h3>
            <p class="text-slate-400 text-sm leading-relaxed">
              Serves customized HTML directly via Nitro Engine with Vercel KV cache layer (24h TTL) and HTTP cache control headers (<code class="text-emerald-300">s-maxage=86400</code>).
            </p>
          </div>
        </div>
      </div>

      <!-- Base Template Preview Tab -->
      <div v-else class="space-y-4">
        <div class="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <h2 class="text-base font-semibold text-white">Active Base Template</h2>
            <p class="text-xs text-slate-400">Stored in <code class="text-indigo-300">public/templates/default.vue</code></p>
          </div>
          <a
            href="?company=facebook.com"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition"
          >
            Test Customization (?company=facebook.com)
          </a>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div class="bg-slate-800/80 px-4 py-2 border-b border-slate-700 flex items-center space-x-2">
            <div class="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-500/80"></div>
            <div class="w-3 h-3 rounded-full bg-green-500/80"></div>
            <span class="text-xs text-slate-400 font-mono ml-2">Base Template Preview</span>
          </div>
          <iframe
            :srcdoc="props.baseHtml"
            title="Base Template Preview"
            class="w-full h-[650px] bg-white border-0"
          />
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
      LandingCreator &bull; Powered by Vue 3 & Nuxt Engine
    </footer>
  </div>
</template>
