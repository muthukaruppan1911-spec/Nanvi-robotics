# Contact Us email via Google Apps Script — deployment guide

Everything runs inside the company's Google account. No Resend/SendGrid/Mailgun,
no Google Cloud Console, no Gmail API.

## 1. Create the script (company Google account)
1. Sign in to the **company Google account** that should send the emails.
2. Go to https://script.google.com → **New project**. Name it `Nanvi Contact Form`.
3. Delete the default code, paste the full contents of `apps-script/Code.gs`.
4. At the top, set the inbox that should receive enquiries:
   `RECIPIENT_EMAIL: 'your-real-inbox@nanvitech.com'`
5. Click **Save** (disk icon).

## 2. Authorize mail sending and send a real test email
1. In the toolbar function dropdown choose **`authorizeAndSendTestEmail`** → **Run**.
2. Google shows "Authorization required" → **Review permissions** → pick the company account →
   **Advanced → Go to Nanvi Contact Form (unsafe)** → **Allow**.
   (The "unsafe" wording is normal for your own unpublished script.)
3. Check the inbox for "Apps Script setup test". If it arrives, MailApp delivery works.

## 3. Deploy as a Web App
1. **Deploy → New deployment** → gear icon → **Web app**.
2. Description: `v1`
3. **Execute as: Me** (the company account)
4. **Who has access: Anyone**
5. **Deploy** → copy the **Web app URL** (looks like `https://script.google.com/macros/s/AKfy.../exec`).
6. Open that URL in a browser: you should see `{"service":"Nanvi contact form","status":"ok","configured":true}`.
   If `configured` is `false`, RECIPIENT_EMAIL is still the placeholder.

## 4. Connect the website
Open `static/site.js` and replace the placeholder:

```js
const NANVI_CONTACT_ENDPOINT = "https://script.google.com/macros/s/AKfy.../exec";
```

Run the site (`python server.py` → http://localhost:8001/contact.html) or upload `static/` to your host.
Both the Contact page and the home-page request form use this one endpoint.

## 5. Real end-to-end test
1. Open the Contact page, fill in all fields (use a different address you can read as the visitor email), wait a few seconds, **Send Message**.
2. Expect the green "Your message has been sent" notice.
3. In the recipient inbox, confirm the email arrived and press **Reply** — the *To* line must be the visitor's address.
4. Also try: empty form (inline errors), invalid email, and a second submit within a minute (cooldown notice).

## Updating the script later
Editing code does **not** change the live Web App. After any change:
**Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The URL stays the same.

## Spam protection included
Frontend: hidden honeypot field · minimum fill-time check · 60 s cooldown after a send · double-submit lock.
Backend: honeypot · fill-time check (2 s–24 h) · full re-validation · header-injection stripping ·
HTML escaping · max 2 links · 3 messages per email per hour · 30 per hour overall · duplicate-message block ·
daily MailApp quota guard.
Note: Apps Script cannot see visitor IPs or the request origin, so limits are per email address and global.

## Limits to know
- MailApp quota: ~100 recipients/day on a free Gmail account, ~1,500/day on Google Workspace.
- Emails are sent *from* the deploying Google account; the visitor's address is only the Reply-To.
- The Web App URL is public by design (the browser must call it); the protections above limit abuse.
