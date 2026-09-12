import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Redis } from '@upstash/redis';
import { sendOtpEmail } from './mailer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Initialize Upstash Redis or In-Memory fallback
let redis = null;
const memoryStore = new Map();

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('✅ Connected to Upstash Redis for Cross-Device Sync & OTP');
  } catch (err) {
    console.warn('⚠️ Upstash Redis init error, using in-memory store:', err.message);
  }
} else {
  console.log('ℹ️ No Upstash Redis credentials found. Using local in-memory store.');
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

async function setOtp(email, code, ttlSeconds = 600) {
  if (redis) {
    await redis.set(`otp:${email}`, code, { ex: ttlSeconds });
  } else {
    memoryStore.set(`otp:${email}`, {
      code,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

async function getOtp(email) {
  if (redis) {
    return await redis.get(`otp:${email}`);
  } else {
    const entry = memoryStore.get(`otp:${email}`);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(`otp:${email}`);
      return null;
    }
    return entry.code;
  }
}

async function deleteOtp(email) {
  if (redis) {
    await redis.del(`otp:${email}`);
  } else {
    memoryStore.delete(`otp:${email}`);
  }
}

// ─── API Endpoints ────────────────────────────────────────────────────────────

/**
 * Health check endpoint for UptimeRobot monitoring
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Orbit Cloud Backend',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    redis: redis ? 'upstash-connected' : 'in-memory-fallback',
  });
});

/**
 * Send 6-digit OTP verification code
 */
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid email required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis with 10-minute expiry
    await setOtp(cleanEmail, code, 600);

    // Send email
    const result = await sendOtpEmail(cleanEmail, code);

    if (result.success) {
      res.json({
        success: true,
        message: 'Verification code sent to your email inbox',
        provider: result.provider,
        devCode: result.provider === 'local-preview' ? code : undefined,
      });
    } else {
      // Return helpful error so user knows why email failed and provide emergency fallback code
      res.json({
        success: false,
        message: result.error,
        devCode: result.code,
      });
    }
  } catch (err) {
    console.error('Send code error:', err);
    res.status(500).json({ success: false, message: 'Failed to send verification code' });
  }
});

/**
 * Verify 6-digit OTP code against Upstash Redis
 */
app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email and code are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const storedCode = await getOtp(cleanEmail);

    if (!storedCode) {
      return res.status(400).json({
        success: false,
        message: 'Code expired or not found. Please request a new code.',
      });
    }

    if (storedCode.toString() !== code.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect verification code. Please try again.',
      });
    }

    await deleteOtp(cleanEmail);

    res.json({
      success: true,
      message: 'Verification successful',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Verify code error:', err);
    res.status(500).json({ success: false, message: 'Verification error' });
  }
});

// ─── Cross-Device Cloud Sync Endpoints ────────────────────────────────────────

/**
 * Fetch user data from Upstash Redis (Phone / Browser Sync)
 */
app.get('/api/user/data', async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const cleanEmail = String(email).trim().toLowerCase();
    let data = null;

    if (redis) {
      const stored = await redis.get(`data:${cleanEmail}`);
      data = typeof stored === 'string' ? JSON.parse(stored) : stored;
    } else {
      data = memoryStore.get(`data:${cleanEmail}`) || null;
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('Fetch cloud data error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve cloud data' });
  }
});

/**
 * Sync user data to Upstash Redis
 */
app.post('/api/user/sync', async (req, res) => {
  try {
    const { email, data } = req.body;
    if (!email || !data) {
      return res.status(400).json({ success: false, message: 'Email and data required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const payload = typeof data === 'string' ? data : JSON.stringify(data);

    if (redis) {
      await redis.set(`data:${cleanEmail}`, payload);
    } else {
      memoryStore.set(`data:${cleanEmail}`, typeof data === 'string' ? JSON.parse(data) : data);
    }

    res.json({
      success: true,
      message: 'Cloud data synchronized',
      syncedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Sync cloud data error:', err);
    res.status(500).json({ success: false, message: 'Failed to sync cloud data' });
  }
});

// Serve frontend static build files in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🪐 Orbit Backend running on port ${PORT}`);
  console.log(`🔗 Health Check URL for UptimeRobot: http://localhost:${PORT}/api/health`);
});
