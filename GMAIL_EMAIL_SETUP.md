# Gmail Email Setup Guide

This guide configures Gmail to send all site emails: signup welcome, password resets, payment receipts, contact notifications, and more.

---

## Step 1: Enable 2-Step Verification on Your Gmail Account

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Sign in with the Gmail account you want to use (e.g. `info@centerforadmissionandtravels.com` or a personal Gmail)
3. Under **"How you sign in to Google"**, click **2-Step Verification**
4. Follow the prompts to enable it (phone verification, etc.)

---

## Step 2: Create an App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. You may need to sign in again
3. Under **"Select app"**, choose **Mail**
4. Under **"Select device"**, choose **Other** and type `Center for Admission Travels` (or any name)
5. Click **Generate**
6. Google shows a **16-character password** (e.g. `abcd efgh ijkl mnop`)
7. **Copy it** — you won't see it again. Remove the spaces when adding to `.env`

---

## Step 3: Add to Your `.env` File

Open your `.env` file and set:

```env
# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=yourapppassword16chars
SMTP_FROM=your-email@gmail.com
```

**Replace:**
- `your-email@gmail.com` — your Gmail address
- `yourapppassword16chars` — the 16-character App Password (no spaces)

**Example:**
```env
SMTP_USER=info@centerforadmissionandtravels.com
SMTP_PASS=abcdefghijklmnop
SMTP_FROM=info@centerforadmissionandtravels.com
```

---

## Step 4: Restart Your Dev Server

After changing `.env`:

```bash
# Stop the server (Ctrl+C) and restart
npm run dev
```

---

## What Emails Will Be Sent

| Trigger | Recipient | Email |
|---------|-----------|-------|
| **User signup** | New user | Welcome email with link to browse packages |
| **User forgot password** | User | Reset link (expires in 1 hour) |
| **Admin forgot password** | Admin | Reset link (expires in 1 hour) |
| **Payment success** | Customer | Payment confirmation with reference & amount |
| **Contact form submitted** | You (SMTP_FROM) | New contact message details |

---

## Troubleshooting

### "Invalid credentials" or "Username and Password not accepted"
- Ensure 2-Step Verification is enabled
- Use an **App Password**, not your normal Gmail password
- Remove spaces from the App Password

### Emails go to spam
- Use a domain email (e.g. `info@centerforadmissionandtravels.com`) if possible
- Add SPF/DKIM records for your domain (advanced)
- Ask users to add your address to contacts

### "Less secure app" / "Sign-in blocked"
- Google no longer supports "Less secure apps"
- You **must** use 2-Step Verification + App Password

### Emails not sending at all
- Check the terminal/console for `[Email]` logs
- If you see "Would have sent to..." — SMTP is not configured (check SMTP_USER and SMTP_PASS)
- If you see "Failed to send" — check the error message

---

## Using a Custom Domain (e.g. info@centerforadmissionandtravels.com)

If your domain uses **Google Workspace** (Gmail for business):

1. Use that email as `SMTP_USER` and `SMTP_FROM`
2. Create an App Password for that account the same way
3. Add it to `.env`

If your domain uses **another provider** (e.g. cPanel, Hostinger):

- Use that provider's SMTP settings instead of Gmail
- Example: `SMTP_HOST=mail.yourdomain.com`, `SMTP_PORT=587`, etc.
- Get the credentials from your hosting control panel
