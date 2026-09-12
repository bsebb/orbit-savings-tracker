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

## 2. Real Email Setup via Resend (Free 100 emails/day)

1. Go to [resend.com](https://resend.com/) and create an account.
2. Click **API Keys** → **Create API Key**.
3. Copy your key: `re_...`
4. Use this as `RESEND_API_KEY`.
   _(Note: You can use `onboarding@resend.dev` as the sender until you verify your custom domain)._

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
   - `RESEND_API_KEY`: _(from Step 2)_
   - `FROM_EMAIL`: `Orbit <onboarding@resend.dev>`
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
