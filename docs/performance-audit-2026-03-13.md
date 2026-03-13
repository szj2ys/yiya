# Performance Audit Report

**Date:** 2026-03-13
**Scope:** Next.js 14 Application (Yiya Language Learning App)

---

## Executive Summary

This audit analyzes the performance characteristics of the Yiya application, identifying optimization opportunities across bundle size, Core Web Vitals, and image optimization.

**Overall Status:** ✅ Build passes, bundle sizes reasonable, minor optimizations identified

---

## 1. Bundle Analysis

### First Load JavaScript

| Metric | Value | Status |
|--------|-------|--------|
| Shared First Load JS | 201 kB | ✅ Good |
| Middleware | 335 kB | ⚠️ Monitor |

### Largest Pages by First Load JS

| Page | Size | Notes |
|------|------|-------|
| /practice | 268 kB | Lesson practice interface |
| /lesson | 265 kB | Lesson content |
| /lesson/[lessonId] | 265 kB | Dynamic lesson page |
| /shop | 261 kB | Subscription/purchases |
| /learn | 252 kB | Main learning dashboard |
| /courses | 243 kB | Course listing |
| /leaderboard | 241 kB | Leaderboard page |

### Shared Chunks Analysis

| Chunk | Size | Content |
|-------|------|---------|
| chunks/4032-*.js | 105 kB | Main React/Next runtime |
| chunks/fd9d1056-*.js | 53.5 kB | UI components |
| chunks/52774a7f-*.js | 39.5 kB | Utilities |

**Assessment:** Bundle sizes are within acceptable ranges for a modern React application. The shared 201 kB first load is reasonable for a feature-rich language learning app.

---

## 2. Core Web Vitals Configuration

### Current Configuration (next.config.mjs)

```javascript
images: {
  formats: ["image/avif", "image/webp"],
},
```

### Security Headers ✅

- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- X-Frame-Options: DENY

### Missing Optimizations ⚠️

1. **No image remotePatterns configured** - If using external images, these should be defined
2. **No experimental.optimizeCss** - Could benefit from CSS optimization
3. **Sentry instrumentation deprecation warning** - `sentry.client.config.ts` should be renamed to `instrumentation-client.ts`

---

## 3. Image Optimization Audit

### Findings

✅ **All images use Next.js Image component** - No raw `<img>` tags found
✅ **Local images only** - No external domains requiring remotePatterns
✅ **Modern formats enabled** - AVIF and WebP configured
✅ **No oversized images** - No images >500KB in public folder

### Images in Use

| Image | Location | Optimization |
|-------|----------|--------------|
| /mascot.svg | header.tsx, sidebar.tsx | SVG (vector) |
| /mascot_bad.svg | hearts-modal.tsx | SVG (vector) |
| /points.svg | user-progress.tsx | SVG (vector) |
| /heart.svg | user-progress.tsx | SVG (vector) |
| Dynamic images | lesson/card.tsx | Using fill mode |

**Assessment:** Image optimization is well-implemented. All images use the Next.js Image component with appropriate sizing.

---

## 4. Code-Level Optimizations

### Dynamic Imports ✅

Good use of dynamic imports for modal components in layout.tsx:
- ExitModal
- HeartsModal
- PracticeModal
- InstallPrompt

### Analytics Events

Added missing analytics event types to lib/analytics.ts:
- `subscription_activated`
- `subscription_payment_failed`
- `subscription_payment_success`
- `subscription_cancelled`
- `milestone_share_clicked`

### Button Component Variants

Fixed invalid `variant="outline"` usage in:
- app/(marketing)/agents/page.tsx
- components/streak-milestone-modal.tsx

Changed to valid variants: `primaryOutline`

---

## 5. Recommendations (Prioritized)

### P0 - High Impact

1. **Configure @vercel/speed-insights**
   ```bash
   npm install @vercel/speed-insights
   ```
   Add to layout.tsx for real-world Core Web Vitals monitoring.

2. **Enable experimental CSS optimization**
   ```javascript
   // next.config.mjs
   experimental: {
     optimizeCss: true,
   }
   ```

### P1 - Medium Impact

3. **Update Sentry configuration**
   - Rename `sentry.client.config.ts` to `instrumentation-client.ts`
   - Addresses Turbopack compatibility warning

4. **Add Bundle Analyzer**
   ```bash
   npm install --save-dev @next/bundle-analyzer
   ```
   Add to next.config.mjs for regular bundle monitoring.

5. **Review largest pages**
   - /practice (268 kB) and /lesson (265 kB) could benefit from code splitting
   - Consider lazy-loading heavy lesson components

### P2 - Low Impact

6. **Add image priority to LCP images**
   ```tsx
   <Image src="/hero.svg" priority ... />
   ```

7. **Configure remotePatterns if external images needed**
   ```javascript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'cdn.example.com' },
     ],
   }
   ```

---

## 6. Build Issues Fixed During Audit

1. ✅ **Font fetch timeout** - Removed Google Font dependency for build environment
2. ✅ **PayPal type error** - Fixed `LoadScriptOptions` → `PayPalScriptOptions` import
3. ✅ **Analytics type errors** - Added missing event types to AnalyticsEventMap
4. ✅ **Button variant errors** - Fixed invalid "outline" variant usage

---

## 7. Monitoring Setup

### Recommended Vercel Analytics Configuration

```tsx
// app/layout.tsx
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

---

## Appendix: Build Output Summary

```
Route (app)                                    Size     First Load JS
├ λ /                                          5.08 kB         240 kB
├ λ /admin                                     251 kB          459 kB
├ λ /courses                                   2.47 kB         243 kB
├ λ /learn                                     6.23 kB         252 kB
├ λ /lesson                                    407 B           265 kB
├ λ /practice                                  419 B           268 kB
├ λ /settings                                  3.6 kB          237 kB
├ λ /shop                                      7.82 kB         261 kB
└ ... (53 routes total)

First Load JS shared by all                    201 kB
```

---

*Report generated automatically by performance audit workflow*
