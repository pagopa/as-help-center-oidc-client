import helmet from 'helmet';

/**
 * Security headers middleware using Helmet
 * Configures various HTTP security headers to protect against common vulnerabilities
 */
export const securityHeaders = helmet({
  // HSTS: it force HTTPS for 1 year (including subdomains)
  // Protects against downgrade attacks and cookie hijacking
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true, // for inclusion in the HSTS preload list of browsers
  },

  // Content Security Policy: controls from where resources (script, style, img, etc.) can be loaded
  // allows 'unsafe-inline' because the Zendesk auto-submit form uses inline script/style
  // Protects against XSS attacks and code injection
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // only load resources from the same origin
      scriptSrc: ["'self'", "'unsafe-inline'"], // necessary for the Zendesk auto-submit form script
      styleSrc: ["'self'", "'unsafe-inline'"], // necessary for inline spinner styles
      imgSrc: ["'self'", 'data:'], // images only from self or data URIs
      fontSrc: ["'self'", 'data:'], // fonts only from self or data URIs
      connectSrc: ["'self'"], // fetch/XHR only to self
      frameSrc: ["'none'"], // no iframes
      frameAncestors: ["'none'"], // cannot be embedded in iframes (equivalent to X-Frame-Options: DENY)
      objectSrc: ["'none'"], // no plugins (Flash, Java, etc.)
      baseUri: ["'self'"], // <base> tag only with URLs from the same domain
      formAction: ["'self'", 'https://*.zendesk.com'], // form submit only to self or Zendesk
    },
  },

  // X-Frame-Options: prevents the page from being loaded in an iframe
  // Protects against clickjacking attacks
  frameguard: { action: 'deny' },

  // Referrer-Policy: controls how much referrer information is included with requests
  // strict-origin-when-cross-origin: sends full referrer for same-origin, only origin for cross-origin HTTPS
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

  // X-DNS-Prefetch-Control: disables DNS prefetching
  // Improves privacy by preventing browsers from performing proactive DNS lookups
  dnsPrefetchControl: { allow: false },

  // X-Download-Options: prevents IE from executing downloads in the site's context
  ieNoOpen: true,

  // Disabled for compatibility with Zendesk redirects and auto-submit form
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: false,
});
