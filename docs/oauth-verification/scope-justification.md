# Google OAuth Verification — Scope Justification
**App:** PatientRank
**Domain:** https://patientrank.pages.dev
**Client ID:** 248882577385-n9hu8id2v88106ikutpv9mups4s4kh9c.apps.googleusercontent.com
**Submitted:** 2026-04-25
**Track:** Standard Verification (Sensitive Scope)

---

## 1. App Overview

**PatientRank** is a **medical-only SEO diagnostic SaaS** built for dental clinics, oriental medicine clinics, plastic surgery clinics, and other healthcare providers in South Korea. Clinic owners enter their website URL and receive a comprehensive Google Korea search visibility report within 10 seconds, including:

- Keyword rankings (TOP 3 / TOP 10 / TOP 30 / TOP 100)
- Estimated monthly organic traffic
- Backlink profile and Domain Rating analysis
- Competitor gap analysis
- Long-tail keyword discovery
- **Optional: Google Search Console integration** (Pro / Agency plan)

The service launched in 2026 and serves clinic owners who want to reduce ad-spend dependency by improving organic search visibility.

**Target users:** Licensed medical practitioners (clinic owners) in South Korea.
**Audience scale:** Initially < 1,000 paying customers; estimated 5,000 within 12 months.

---

## 2. Requested Scopes

| # | Scope | Type | Required for |
|---|-------|------|--------------|
| 1 | `openid` | Non-sensitive | Login identity |
| 2 | `https://www.googleapis.com/auth/userinfo.email` | Non-sensitive | Account creation, login |
| 3 | `https://www.googleapis.com/auth/userinfo.profile` | Non-sensitive | Display name & avatar |
| 4 | **`https://www.googleapis.com/auth/webmasters.readonly`** | **Sensitive** | **GSC keyword analysis (read-only)** |

Only scope #4 requires verification.

---

## 3. Why does the app need `webmasters.readonly`?

PatientRank's core value proposition for paid users is filling the **gap between third-party SEO databases (DataForSEO) and the actual search exposure recorded by Google itself**.

### Problem we solve:
Third-party SEO data providers like DataForSEO sample only a subset of search queries and miss long-tail queries that produce real impressions. For a typical clinic, DataForSEO captures **~30–50 ranking keywords**, while their actual Google Search Console shows **2,000–25,000+ keywords** with measurable impressions.

### How we use the scope:
1. **User explicitly initiates GSC connection** by clicking the "Connect Google Search Console" button on their result page (Pro / Agency plan only).
2. We request **read-only** access to Webmaster data via OAuth 2.0.
3. We call the [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics) (`searchanalytics.query`) to fetch up to 25,000 query rows containing: query, clicks, impressions, CTR, average position, page URL — for the last 90 days.
4. We display this data **only to the authenticated owner of that GSC property** in their PatientRank dashboard, alongside a "Missed Keywords" report that compares GSC data with DataForSEO data to surface keywords that drive impressions but aren't tracked by third-party DBs.
5. The user can **disconnect at any time** via the in-app "Disconnect" button or via [Google Account Permissions](https://myaccount.google.com/permissions).

### Why `readonly` (not full access)?
We never need to modify, submit sitemaps, or change site verification. **Read-only is the minimum scope** that allows our use case.

---

## 4. Limited Use Compliance

PatientRank's use of data obtained through `webmasters.readonly` adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the **Limited Use** requirements:

| Requirement | Our Compliance |
|-------------|---------------|
| Use is limited to providing or improving user-facing features | GSC data is shown only on the result page of the user who connected their own account. |
| Do not transfer data to others | Data is fetched server-side (Cloudflare Workers) and rendered to the same authenticated user only. We never sell, share, or syndicate the data. |
| Do not use data for advertising | We do not run ads, do not have an ad business, and do not feed GSC data into any advertising systems. |
| Do not allow humans to read the data | Only the authenticated user themselves sees the data. Internal team members never read raw GSC data. The only exceptions are: (a) explicit user consent (e.g., support troubleshooting), (b) security investigations, (c) legal compliance, (d) anonymized & aggregated internal operations metrics. |

---

## 5. Data Handling Architecture

```
[User Browser]
   ↓ HTTPS
[Cloudflare Pages (Hono Worker)]
   ├── OAuth 2.0 flow (Authorization Code)
   ├── Refresh token → encrypted, stored in Cloudflare KV (per-user namespace key)
   ├── searchanalytics.query → fetched on-demand
   ├── Response cache → Cloudflare KV (TTL: 24h max)
   └── Display → result page (only same authenticated user)

Storage:
- Refresh token: AES-encrypted at rest, retrieved only by authenticated user's session
- GSC data cache: Auto-expires within 24h, scoped to user_id
- Email: AES-256-GCM encrypted in D1
- IP: SHA-256 hashed, original never stored
```

### Retention
- **Refresh token**: until user disconnects or deletes account → immediately revoked via Google `revoke` endpoint + KV deletion.
- **Cached GSC rows**: ≤ 24 hours (auto-expire).
- **No long-term storage of raw GSC data.**

### Access control
- Only the authenticated owner of `user_id = X` can read `gsc_data:user_id_X` in KV.
- Server-side enforcement via JWT-signed session cookie (HttpOnly, Secure, SameSite=Lax).
- No internal admin tooling reads raw GSC content.

---

## 6. User Consent Flow

1. User logs in to PatientRank (Google OAuth, basic scopes only).
2. User runs an SEO scan and views their result page.
3. On the result page, user sees a **GSC Card** with a clear description:
   > "Connect your Google Search Console to fetch up to 25,000 actually-exposed keywords directly from Google. Read-only access. Disconnect anytime."
4. User clicks **"Connect GSC Account"** → triggers separate OAuth consent screen for `webmasters.readonly`.
5. Google's consent screen displays the requested scope and our app branding.
6. After consent, user is redirected back to the result page where GSC data is displayed.
7. User can click **"Disconnect"** at any time to revoke and delete the refresh token.

---

## 7. Privacy Policy & Terms

- **Privacy Policy:** https://patientrank.pages.dev/privacy
  - Korean and English versions
  - Explicitly covers: scope `webmasters.readonly`, Limited Use compliance, data retention, third-party processors, user rights
- **Terms of Service:** https://patientrank.pages.dev/terms
  - Chapter 3 specifically addresses GSC integration consent and disconnection rights

Both pages are linked from the global footer on every page of the site.

---

## 8. Security Practices

| Area | Practice |
|------|----------|
| Transport | HTTPS (TLS 1.3) enforced via Cloudflare |
| Auth tokens | OAuth refresh tokens AES-encrypted in Cloudflare KV |
| Session | JWT-signed cookies (HttpOnly, Secure, SameSite=Lax) |
| Email | AES-256-GCM at rest |
| IP | SHA-256 hashed, plaintext never stored |
| Access | Least-privilege per-user namespace keys in KV |
| Logging | Structured logs in Cloudflare; no GSC data content logged |
| Incident response | Rotate `JWT_SECRET` and force-revoke all tokens on incident |

---

## 9. Domain Verification

The production domain `patientrank.pages.dev` is verified in Google Search Console under the developer's account (sodanstjrwns@gmail.com).

---

## 10. Contact

- **Developer:** Seokjun Moon (문석준)
- **Email:** sodanstjrwns@gmail.com
- **Support email:** hello@patientrank.kr
- **Website:** https://patientrank.pages.dev
- **Verification submitted:** 2026-04-25
