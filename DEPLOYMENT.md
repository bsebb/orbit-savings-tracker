# Orbit Cloud Deployment Guide: Render, Upstash Redis & UptimeRobot

This guide outlines how to deploy Orbit with **real email delivery**, **Upstash Redis** for verification codes, **Render** for hosting, and **UptimeRobot** for 24/7 zero-sleep uptime.

---

## 1. Upstash Redis Setup (Takes 1 minute · Free)

Upstash provides serverless Redis with automated TTL expiration for verification codes.

1. Go to [console.upstash.com](https://console.upstash.com/) and sign in.
2. Click **Create Database**:
   - Name: `orbit-redis`
   - Region: Choose nearest to you
   - Type: Free Serverless
3. On the database details page, scroll down to the **REST API** section.
4. Copy the two values:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## 2. Real Email Setup (Choose Option A or Option B)

### Option A: Gmail SMTP / App Password (Recommended - Sends to ANY email)

No domain verification needed. Works with any regular Gmail account:

1. Enable 2-Step Verification on your Google Account if not already enabled.
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Create a new App Password (e.g. App Name: `Orbit`).
4. Copy the generated 16-character password.
5. Set these environment variables:
   - `SMTP_HOST`: `smtp.gmail.com`
   - `SMTP_PORT`: `465`
   - `SMTP_SECURE`: `true`
   - `SMTP_USER`: `your-email@gmail.com`
   - `SMTP_PASS`: `your-16-char-app-password`
   - `FROM_EMAIL`: `"Orbit Savings" <your-email@gmail.com>`

### Option B: Resend API (Free 100 emails/day)

> [!IMPORTANT]
> Resend's free testing domain (`onboarding@resend.dev`) **only** delivers emails to the **single email address registered on your Resend account**. Trying to send to any other email will fail with a 403 restriction. To send to arbitrary users with Resend, you must add and verify your own custom domain under **Domains** in Resend.

1. Go to [resend.com](https://resend.com/) and create an account.
2. Click **API Keys** → **Create API Key**.
3. Set these environment variables:
   - `RESEND_API_KEY`: `re_...`
   - `FROM_EMAIL`: `Orbit <onboarding@resend.dev>` (or your verified domain: `Orbit <hello@yourdomain.com>`)

---

## 3. Deploy to Render (Free Web Service)

1. Push your latest code to your GitHub repo (`https://github.com/bsebb/orbit-savings-tracker`).
2. Log into [dashboard.render.com](https://dashboard.render.com/).
3. Click **New +** → **Web Service**.
4. Select your `orbit-savings-tracker` repository.
5. Render will automatically detect the settings from `render.yaml`:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.mjs`
6. Under **Environment Variables**, add:
   - `UPSTASH_REDIS_REST_URL`: _(from Step 1)_
   - `UPSTASH_REDIS_REST_TOKEN`: _(from Step 1)_
   - Either SMTP variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`) or Resend variables (`RESEND_API_KEY`, `FROM_EMAIL`).
7. Click **Create Web Service**.
8. Once deployed, Render will provide your public URL (e.g. `https://orbit-savings-tracker.onrender.com`).

---

## 4. UptimeRobot Setup (Prevents Render Cold Sleep)

Render free-tier web services spin down after 15 minutes of inactivity. UptimeRobot pings Orbit every 5 minutes to keep it warm 24/7.

1. Go to [uptimerobot.com](https://uptimerobot.com/) and sign up for a free account.
2. Click **Add New Monitor**:
   - **Monitor Type**: `HTTP(s)`
   - **Friendly Name**: `Orbit Health Check`
   - **URL (or IP)**: `https://your-orbit-app.onrender.com/api/health`
   - **Monitoring Interval**: `5 minutes`
3. Click **Create Monitor**.
4. Orbit is now monitored 24/7 and will remain active without spin-down delays!
