import * as cheerio from 'cheerio';

export function normalizeDomain(input) {
  let clean = input.trim();
  clean = clean.replace(/^https?:\/\//i, '');
  clean = clean.replace(/\/.*$/, '');
  const domain = clean.toLowerCase();
  const url = `https://${domain}`;
  return { domain, url };
}

export async function scrapeDomainMetadata(inputDomain) {
  const { domain, url } = normalizeDomain(inputDomain);

  // Default fallback values
  const companyName = domain.split('.')[0].toUpperCase();
  const defaultFavicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
  const defaultRedirect = `https://${domain}/`;

  const fallbackResult = {
    domain,
    companyName,
    faviconUrl: defaultFavicon,
    ogImage: null,
    accentColor: '#0b1e36',
    redirectURL: defaultRedirect,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return fallbackResult;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract Title / Company Name
    const ogSiteName = $('meta[property="og:site_name"]').attr('content');
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const pageTitle = $('title').text();

    let extractedName = ogSiteName || ogTitle || pageTitle || companyName;
    extractedName = extractedName.trim().split(/[-|_|:]/)[0].trim();
    if (!extractedName) extractedName = companyName;

    // Extract Favicon
    let faviconUrl =
      $('link[rel*="icon"]').attr('href') ||
      $('link[rel="shortcut icon"]').attr('href') ||
      defaultFavicon;

    if (faviconUrl && !faviconUrl.startsWith('http')) {
      if (faviconUrl.startsWith('//')) {
        faviconUrl = `https:${faviconUrl}`;
      } else if (faviconUrl.startsWith('/')) {
        faviconUrl = `https://${domain}${faviconUrl}`;
      } else {
        faviconUrl = `https://${domain}/${faviconUrl}`;
      }
    }

    // Extract OG Image
    let ogImage = $('meta[property="og:image"]').attr('content') || null;
    if (ogImage && !ogImage.startsWith('http')) {
      if (ogImage.startsWith('//')) {
        ogImage = `https:${ogImage}`;
      } else if (ogImage.startsWith('/')) {
        ogImage = `https://${domain}${ogImage}`;
      } else {
        ogImage = `https://${domain}/${ogImage}`;
      }
    }

    // Extract Meta Theme Color
    const themeColor = $('meta[name="theme-color"]').attr('content') || '#0b1e36';

    return {
      domain,
      companyName: extractedName,
      faviconUrl,
      ogImage,
      accentColor: themeColor,
      redirectURL: defaultRedirect,
    };
  } catch (error) {
    console.warn(`Scraping failed for ${domain}, returning default fallback metadata.`, error);
    return fallbackResult;
  }
}
