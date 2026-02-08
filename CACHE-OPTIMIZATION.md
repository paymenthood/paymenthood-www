# Cache Optimization Guide for PaymentHood

This document explains the caching configuration for optimal performance.

## Overview

We've implemented long-term caching for static assets to improve repeat visit performance and reduce load times. The audit showed 4-hour cache lifetimes, which we've increased to 1 year for static assets.

## Cache Configuration Files

### 1. `.htaccess` (Apache Servers)
- Located at root directory
- Sets cache headers using `mod_expires` and `mod_headers`
- Automatically applied if hosted on Apache

### 2. `_headers` (Netlify/Similar Platforms)
- Located at root directory
- Used by Netlify, Cloudflare Pages, and similar platforms
- Simple format for cache-control headers

### 3. `netlify.toml` (Netlify Specific)
- Comprehensive Netlify configuration
- Includes build settings and cache headers
- Use this if deploying to Netlify

## Cache Lifetimes

| Asset Type | Cache Duration | Reason |
|------------|---------------|---------|
| HTML pages | 1 hour | Content may update frequently |
| CSS/JS files | 1 year | Versioned via query strings |
| Images | 1 year | Rarely change |
| Fonts | 1 year | Static resources |
| Sitemap/robots.txt | 1 day | May update but not critical |

## Cloudflare Configuration

Since you're using Cloudflare, configure Page Rules for optimal caching:

### Step 1: Create Page Rules

Go to Cloudflare Dashboard → Your Domain → Rules → Page Rules

#### Rule 1: Static Assets (Highest Priority)
- **URL Pattern**: `*paymenthood.com/assets/*`
- **Settings**:
  - Browser Cache TTL: 1 year
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

#### Rule 2: Images
- **URL Pattern**: `*paymenthood.com/*.{jpg,jpeg,png,gif,webp,svg,ico}`
- **Settings**:
  - Browser Cache TTL: 1 year
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

#### Rule 3: Fonts
- **URL Pattern**: `*paymenthood.com/assets/fonts/*`
- **Settings**:
  - Browser Cache TTL: 1 year
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month

#### Rule 4: HTML Pages
- **URL Pattern**: `*paymenthood.com/*.html`
- **Settings**:
  - Browser Cache TTL: 4 hours
  - Cache Level: Cache Everything
  - Edge Cache TTL: 2 hours

### Step 2: Cloudflare Caching Settings

Go to Cloudflare Dashboard → Your Domain → Caching

1. **Caching Level**: Standard
2. **Browser Cache TTL**: Respect Existing Headers
3. **Always Online**: Enabled

### Step 3: Performance Optimizations

Go to Speed → Optimization

Enable:
- ✅ Auto Minify (JavaScript, CSS, HTML)
- ✅ Brotli compression
- ✅ Early Hints
- ✅ HTTP/2 to Origin
- ✅ HTTP/3 (with QUIC)

## Cache Busting Strategy

To ensure users get updated files when you deploy changes:

### Method 1: Query String Versioning (Current)
```html
<link rel="stylesheet" href="/assets/css/style.css?ver=210">
<script src="/assets/js/scripts.js?ver=210"></script>
```

Increment the version number when deploying updates.

### Method 2: File Hash Naming (Recommended)
Rename files with content hashes:
```
style.abc123.css
scripts.def456.js
```

This automatically cache-busts when content changes.

## Testing Cache Headers

After deployment, verify cache headers are working:

```bash
curl -I https://www.paymenthood.com/assets/css/style.css
```

Look for:
```
Cache-Control: public, max-age=31536000, immutable
```

Or use online tools:
- [GTmetrix](https://gtmetrix.com/)
- [WebPageTest](https://www.webpagetest.org/)
- [KeyCDN Cache Checker](https://tools.keycdn.com/cache-checker)

## Expected Performance Improvements

With proper caching:
- **First Visit**: Same load time
- **Repeat Visits**: 50-80% faster
- **Bandwidth Savings**: Significant reduction
- **Server Load**: Reduced by cached assets
- **Lighthouse Score**: Improved caching audit

## Deployment Checklist

- [ ] Commit `.htaccess`, `_headers`, and `netlify.toml` files
- [ ] Update `_config.yml` to include cache files
- [ ] Deploy to hosting platform
- [ ] Configure Cloudflare Page Rules (if using Cloudflare)
- [ ] Test cache headers with curl or online tools
- [ ] Run Lighthouse audit to verify improvements
- [ ] Monitor performance metrics

## Troubleshooting

### Headers Not Applied?

1. **Check hosting platform**: Ensure it supports `.htaccess` or `_headers`
2. **Verify file inclusion**: Confirm files are in deployed `_site` folder
3. **Cloudflare override**: Cloudflare Page Rules take precedence
4. **Clear cache**: Purge Cloudflare cache after changes

### Users Seeing Old Content?

1. **Increment version numbers** in HTML files
2. **Purge Cloudflare cache** in Dashboard
3. **Set HTML cache** to shorter duration (1 hour)
4. **Use immutable flag** only for assets that never change

## Resources

- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Cloudflare Caching Guide](https://developers.cloudflare.com/cache/)
- [Web.dev: Cache Best Practices](https://web.dev/http-cache/)
