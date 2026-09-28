import { getQuery, send, setHeader, defineEventHandler, getRequestURL } from 'h3';
import { normalizeDomain, scrapeDomainMetadata } from '../utils/scraper';
import { getBaseTemplate, transformTemplate } from '../utils/transformer';
import { getCachedTemplate, setCachedTemplate } from '../utils/cache';

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event);
  if (url.pathname === '/') {
    const query = getQuery(event);
    const company = query.company;

    if (company && company.trim()) {
      const { domain } = normalizeDomain(company);

      // 1. Check Cache
      const cachedHtml = await getCachedTemplate(domain);
      if (cachedHtml) {
        setHeader(event, 'content-type', 'text/html; charset=utf-8');
        setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate');
        return send(event, cachedHtml);
      }

      // 2. Scrape + Customization Pipeline
      const metadata = await scrapeDomainMetadata(company);
      const baseHtml = await getBaseTemplate();
      const customizedHtml = await transformTemplate(baseHtml, metadata);

      // 3. Cache result (24h TTL)
      await setCachedTemplate(domain, customizedHtml, 86400);

      // 4. Return customized HTML
      setHeader(event, 'content-type', 'text/html; charset=utf-8');
      setHeader(event, 'cache-control', 'public, max-age=0, s-maxage=86400, stale-while-revalidate');
      return send(event, customizedHtml);
    }
  }
});
