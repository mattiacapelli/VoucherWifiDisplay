const express = require('express');
// This would be in a Node.js backend file, not in your React component
const unifi = require('node-unifi');
const cors = require('cors');
const env = require('dotenv');
env.config(); // Load environment variables from .env file

const app = express();
const port = 3001;

app.use(cors());


// Create a function to get guest vouchers
async function getGuestVouchers() {
  const controller = new unifi.Controller({
    host: process.env.UNIFI_HOST,
    port: 8443,
    sslverify: false,
    username: 'mattia.capelli@intellimech.it', // Store these securely
    password: 'P8DTL4sXEL9LYK5t'  // Store these securely
  });
  
  try {
    await controller.login();
    const site = await controller.getSites();
    const siteId = site[0].name;
    const vouchers = await controller.getVouchers();
    //pick a voucher randomly
    const randomIndex = Math.floor(Math.random() * vouchers.length);
    const voucher = vouchers[randomIndex];
    await controller.logout();
    return vouchers;
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    throw error;
  }
}

// Example Express endpoint to expose this functionality
app.get('/api/guest-vouchers', async (req, res) => {
  try {
    const vouchers = await getGuestVouchers();
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vouchers' });
  }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });