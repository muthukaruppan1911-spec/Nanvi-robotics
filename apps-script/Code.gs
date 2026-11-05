/**
 * Nanvi AI Robotics — Contact form backend
 * Google Apps Script Web App (doPost) + MailApp. No third-party services.
 *
 * Deploy as:  Execute as = Me (the company Google account)
 *             Who has access = Anyone
 */

// ───────────────────────── CONFIGURATION ─────────────────────────
const CONFIG = {
  // Inbox that receives enquiries. MUST be changed before deploying.
  RECIPIENT_EMAIL: 'contact@yourcompany.com',

  SITE_NAME: 'Nanvi AI Robotics',
  SUBJECT_PREFIX: 'New Website Enquiry: ',

  // Field limits
  MAX_NAME: 100,
  MAX_EMAIL: 254,
  MAX_SUBJECT: 150,
  MAX_MESSAGE: 5000,
  MIN_MESSAGE: 10,
  MAX_LINKS: 2,                 // more links than this = treated as spam

  // Spam protection
  MIN_FILL_MS: 2000,            // faster than this = bot
  MAX_FILL_MS: 24 * 60 * 60 * 1000,
  RATE_PER_EMAIL: 3,            // submissions per email address ...
  RATE_PER_EMAIL_WINDOW_SEC: 3600,   // ... per hour
  RATE_GLOBAL: 30,              // total submissions ...
  RATE_GLOBAL_WINDOW_SEC: 3600, // ... per hour
  DUPLICATE_WINDOW_SEC: 600,    // identical message blocked for 10 min
  QUOTA_RESERVE: 3              // keep a few MailApp sends in reserve
};

// ───────────────────────── ENTRY POINTS ─────────────────────────

/** Browser POST from the website. */
function doPost(e) {
  try {
    const data = parseBody_(e);
    if (!data) return respond_(false, 'Invalid request.');

    // 1) Honeypot: real visitors never fill this. Pretend success, do nothing.
    if (clean_(data.website)) return respond_(true, 'Your message has been sent successfully.');

    // 2) Timing trap
    const elapsed = Number(data.elapsedMs);
    if (!isFinite(elapsed) || elapsed < CONFIG.MIN_FILL_MS || elapsed > CONFIG.MAX_FILL_MS) {
      return respond_(false, 'Please take a moment to fill in the form and try again.');
    }

    // 3) Validation (never trust the browser)
    const v = validate_(data);
    if (v.error) return respond_(false, v.error, v.field);
    const f = v.fields;

    // 4) Config + quota guards
    if (!configured_()) {
      console.error('RECIPIENT_EMAIL is not configured.');
      return respond_(false, 'The contact service is not configured yet. Please email us directly.');
    }
    if (MailApp.getRemainingDailyQuota() <= CONFIG.QUOTA_RESERVE) {
      console.error('Daily MailApp quota exhausted.');
      return respond_(false, 'We are receiving a lot of messages right now. Please try again tomorrow or email us directly.');
    }

    // 5) Rate limiting + duplicate detection (serialised with a lock)
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return respond_(false, 'The server is busy. Please try again in a moment.');
    try {
      const limited = rateLimited_(f);
      if (limited) return respond_(false, limited);
    } finally {
      lock.releaseLock();
    }

    // 6) Deliver
    sendMail_(f);
    return respond_(true, 'Your message has been sent successfully.');
  } catch (err) {
    console.error('doPost failed: ' + (err && err.stack ? err.stack : err));
    return respond_(false, 'Unable to send your message right now. Please try again later.');
  }
}

/** Opening the /exec URL in a browser shows this — handy to confirm the deployment is live. */
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ service: 'Nanvi contact form', status: 'ok', configured: configured_() }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────────── VALIDATION ─────────────────────────

const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validate_(d) {
  // Single-line fields: strip control chars/newlines (blocks header injection) and collapse spaces.
  const name = oneLine_(d.name);
  const email = oneLine_(d.email).toLowerCase();
  const subject = oneLine_(d.subject);
  // Message: keep line breaks, drop other control chars.
  const message = String(d.message == null ? '' : d.message)
    .replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();

  if (name.length < 2) return fail_('name', 'Please enter your full name.');
  if (name.length > CONFIG.MAX_NAME) return fail_('name', 'Name must be ' + CONFIG.MAX_NAME + ' characters or fewer.');

  if (!email) return fail_('email', 'Email address is required.');
  if (email.length > CONFIG.MAX_EMAIL || !EMAIL_RE.test(email)) return fail_('email', 'Please enter a valid email address.');

  if (subject.length < 3) return fail_('subject', 'Please enter a subject.');
  if (subject.length > CONFIG.MAX_SUBJECT) return fail_('subject', 'Subject must be ' + CONFIG.MAX_SUBJECT + ' characters or fewer.');

  if (message.length < CONFIG.MIN_MESSAGE) return fail_('message', 'Please enter a message (at least ' + CONFIG.MIN_MESSAGE + ' characters).');
  if (message.length > CONFIG.MAX_MESSAGE) return fail_('message', 'Message must be ' + CONFIG.MAX_MESSAGE + ' characters or fewer.');

  const links = (message.match(/https?:\/\/|www\./gi) || []).length + (subject.match(/https?:\/\/|www\./gi) || []).length;
  if (links > CONFIG.MAX_LINKS) return fail_('message', 'Please remove some links from your message.');

  return { fields: { name: name, email: email, subject: subject, message: message } };
}

function fail_(field, error) { return { error: error, field: field }; }

// ───────────────────────── SPAM / RATE LIMITS ─────────────────────────

/** Returns an error string if the submission must be refused, otherwise records it and returns ''. */
function rateLimited_(f) {
  const cache = CacheService.getScriptCache();

  const dupKey = 'dup:' + hash_(f.email + '|' + f.subject + '|' + f.message);
  if (cache.get(dupKey)) return 'This message was already sent. We will get back to you soon.';

  const emailKey = 'em:' + hash_(f.email);
  const globalKey = 'all';
  const emailCount = Number(cache.get(emailKey) || 0);
  const globalCount = Number(cache.get(globalKey) || 0);

  if (emailCount >= CONFIG.RATE_PER_EMAIL) return 'Too many messages from this email address. Please try again later.';
  if (globalCount >= CONFIG.RATE_GLOBAL) return 'We are receiving a lot of messages right now. Please try again later.';

  cache.put(emailKey, String(emailCount + 1), Math.min(CONFIG.RATE_PER_EMAIL_WINDOW_SEC, 21600));
  cache.put(globalKey, String(globalCount + 1), Math.min(CONFIG.RATE_GLOBAL_WINDOW_SEC, 21600));
  cache.put(dupKey, '1', Math.min(CONFIG.DUPLICATE_WINDOW_SEC, 21600));
  return '';
}

function hash_(s) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8);
  return bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

// ───────────────────────── EMAIL ─────────────────────────

function sendMail_(f) {
  const received = Utilities.formatDate(new Date(), 'UTC', "MMMM d, yyyy 'at' HH:mm 'UTC'");

  const text =
    'NEW WEBSITE ENQUIRY\n' +
    '========================================\n\n' +
    'Subject:  ' + f.subject + '\n' +
    'Name:     ' + f.name + '\n' +
    'Email:    ' + f.email + '\n' +
    'Received: ' + received + '\n\n' +
    '----------------------------------------\n' +
    'MESSAGE:\n\n' + f.message + '\n\n' +
    '----------------------------------------\n' +
    'Reply directly to this email to respond to ' + f.name + '.\n';

  const e = escapeHtml_;
  const html =
    '<div style="margin:0;padding:24px 12px;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden">' +
    '<tr><td style="background:#006583;padding:24px 28px;text-align:center">' +
    '<div style="color:#ffffff;font-size:20px;font-weight:700">' + e(CONFIG.SITE_NAME) + '</div>' +
    '<div style="color:#b2e0ed;font-size:13px;margin-top:4px">New Website Enquiry</div></td></tr>' +
    '<tr><td style="padding:28px">' +
    '<h2 style="margin:0 0 18px;color:#282d30;font-size:18px">' + e(f.subject) + '</h2>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;font-size:14px;color:#282d30">' +
    row_('Name', e(f.name)) +
    row_('Email', '<a href="mailto:' + e(f.email) + '" style="color:#006583">' + e(f.email) + '</a>') +
    row_('Received', e(received)) +
    '</table>' +
    '<div style="padding:16px;background:#f7f9fa;border-left:4px solid #006583;color:#282d30;font-size:14px;line-height:1.7">' +
    e(f.message).replace(/\n/g, '<br>') + '</div>' +
    '<p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #e1e7ea;color:#616a6f;font-size:12px;text-align:center">' +
    'Reply directly to this email to respond to <strong>' + e(f.name) + '</strong>.</p>' +
    '</td></tr></table></div>';

  MailApp.sendEmail({
    to: CONFIG.RECIPIENT_EMAIL,
    replyTo: f.email,                       // visitor's address → pressing Reply writes to them
    subject: CONFIG.SUBJECT_PREFIX + f.subject,
    body: text,
    htmlBody: html,
    name: CONFIG.SITE_NAME + ' Website'
  });
}

function row_(label, valueHtml) {
  return '<tr><td style="padding:8px 12px;background:#f7f9fa;border-bottom:1px solid #e1e7ea;color:#616a6f;font-weight:700;width:90px">' + label +
         '</td><td style="padding:8px 12px;background:#f7f9fa;border-bottom:1px solid #e1e7ea">' + valueHtml + '</td></tr>';
}

// ───────────────────────── HELPERS ─────────────────────────

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  if (e.postData.contents.length > 20000) return null;      // oversized payload
  try {
    const obj = JSON.parse(e.postData.contents);
    return (obj && typeof obj === 'object' && !Array.isArray(obj)) ? obj : null;
  } catch (err) {
    return null;
  }
}

function clean_(v) { return v == null ? '' : String(v).trim(); }

function oneLine_(v) {
  return String(v == null ? '' : v).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function configured_() {
  return EMAIL_RE.test(CONFIG.RECIPIENT_EMAIL) && !/yourcompany\.com$/i.test(CONFIG.RECIPIENT_EMAIL);
}

function respond_(success, message, field) {
  const body = { success: success, message: message };
  if (field) body.field = field;
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────────── ONE-TIME SETUP TEST ─────────────────────────

/**
 * Run this ONCE from the Apps Script editor (select it in the toolbar → Run).
 * It triggers Google's permission prompt for sending mail and sends a real
 * test email to RECIPIENT_EMAIL so you can confirm delivery before deploying.
 */
function authorizeAndSendTestEmail() {
  if (!configured_()) throw new Error('Set CONFIG.RECIPIENT_EMAIL to your real inbox first.');
  sendMail_({
    name: 'Setup Test',
    email: CONFIG.RECIPIENT_EMAIL,
    subject: 'Apps Script setup test',
    message: 'If you can read this, MailApp delivery works.\nRemaining daily quota: ' + MailApp.getRemainingDailyQuota()
  });
  console.log('Test email sent to ' + CONFIG.RECIPIENT_EMAIL);
}
