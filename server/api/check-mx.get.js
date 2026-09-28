import dns from 'node:dns/promises';
import { getQuery, createError, defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = (query.email || query.domain) || '';

  if (!email || !email.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing email or domain parameter',
    });
  }

  const cleanInput = email.trim().toLowerCase();
  const domain = cleanInput.includes('@') ? cleanInput.split('@').pop() || '' : cleanInput;

  if (!domain) {
    return { isGoogle: false, isMicrosoft: false, domain: '', mx: [] };
  }

  // Quick check for direct domains
  let isGoogle = domain === 'gmail.com' || domain === 'googlemail.com' || domain.endsWith('.google.com');
  let isMicrosoft = ['outlook.com', 'hotmail.com', 'live.com', 'msn.com', 'passport.com'].includes(domain) || domain.endsWith('.outlook.com');

  let mxRecords = [];

  try {
    const addresses = await dns.resolveMx(domain);
    mxRecords = addresses.map((record) => record.exchange.toLowerCase());

    if (!isGoogle) {
      isGoogle = mxRecords.some((exchange) =>
        exchange.includes('google.com') ||
        exchange.includes('googlemail.com') ||
        exchange.includes('aspmx.l.google.com') ||
        exchange.includes('smtp.google.com')
      );
    }

    if (!isMicrosoft) {
      isMicrosoft = mxRecords.some((exchange) =>
        exchange.includes('outlook.com') ||
        exchange.includes('microsoft.com') ||
        exchange.includes('mail.protection.outlook.com') ||
        exchange.includes('hotmail.com')
      );
    }
  } catch (err) {
    console.warn(`MX resolution failed for domain ${domain}:`, err);
  }

  return {
    isGoogle,
    isMicrosoft,
    domain,
    mx: mxRecords,
  };
});
