const express = require('express');
const unifi = require('node-unifi');
const cors = require('cors');
const env = require('dotenv');
env.config();

const app = express();
const port = 3001;

app.use(cors());

// Session management
let controller = null;
let isLoggedIn = false;
let loginPromise = null;

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000
};

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getController() {
  // If already logging in, wait for that to complete
  if (loginPromise) {
    await loginPromise;
    return controller;
  }

  // If already logged in, return existing controller
  if (controller && isLoggedIn) {
    return controller;
  }

  // Create new controller and login
  controller = new unifi.Controller({
    host: process.env.UNIFI_HOST,
    port: 11443,
    sslverify: false,
    username: 'voucherdisplay',
    password: 'P8DTL4sXEL9LYK5t'
  });

  loginPromise = controller.login();

  try {
    await loginPromise;
    isLoggedIn = true;
    console.log('Successfully logged in to UniFi controller');
    return controller;
  } catch (error) {
    isLoggedIn = false;
    controller = null;
    throw error;
  } finally {
    loginPromise = null;
  }
}

function invalidateSession() {
  isLoggedIn = false;
  controller = null;
  loginPromise = null;
}

async function withRetry(fn, retryCount = 0) {
  try {
    return await fn();
  } catch (error) {
    const is429 = error.response?.status === 429;
    const isAuthError = error.response?.status === 401 ||
                        error.message?.includes('AUTHENTICATION');

    if (isAuthError && retryCount === 0) {
      // Session might have expired, invalidate and retry once
      console.log('Authentication error, invalidating session and retrying...');
      invalidateSession();
      return withRetry(fn, retryCount + 1);
    }

    if (is429 && retryCount < RETRY_CONFIG.maxRetries) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, retryCount),
        RETRY_CONFIG.maxDelayMs
      );
      console.log(`Rate limited (429). Retrying in ${delay}ms... (attempt ${retryCount + 1}/${RETRY_CONFIG.maxRetries})`);
      await sleep(delay);
      return withRetry(fn, retryCount + 1);
    }

    throw error;
  }
}

async function getGuestVouchers() {
  return withRetry(async () => {
    const ctrl = await getController();
    const vouchers = await ctrl.getVouchers();
    return vouchers;
  });
}

// Example Express endpoint to expose this functionality
app.get('/api/guest-vouchers', async (req, res) => {
  try {
    const vouchers = await getGuestVouchers();
    //filtra per durata 1 giorno
    const filteredVouchers = vouchers.filter(voucher => voucher.duration <= 1440);
    res.json(filteredVouchers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });