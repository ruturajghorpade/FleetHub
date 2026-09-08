// FleetHub — Phase 9 UI Verification & Screenshot Capture via CDP
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\56b9a691-0875-4820-aae0-0cc4e07ae35e';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async screenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filepath = path.join(ARTIFACT_DIR, filename);
    fs.writeFileSync(filepath, buffer);
    console.log(`📸 Screenshot saved: ${filename}`);
    return filepath;
  }

  close() {
    this.ws.close();
  }
}

async function capturePhase9() {
  console.log('Seeding notifications for Domino\'s Store Manager...');
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'manager@dominos.in', password: 'Password@123' })
  });
  const loginData = await loginRes.json();
  const dominosToken = loginData.data?.accessToken;
  const dominosUser = loginData.data?.user;

  // Fetch branches
  const branchesRes = await fetch(`http://localhost:5000/api/v1/branches?client=${dominosUser.client}`, {
    headers: { Authorization: `Bearer ${dominosToken}` }
  });
  const domBranch = (await branchesRes.json())?.data?.branches?.[0];

  // Create a live delivery to generate notifications
  const randNum = Math.floor(100000 + Math.random() * 900000);
  const delvRes = await fetch('http://localhost:5000/api/v1/deliveries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${dominosToken}`,
    },
    body: JSON.stringify({
      orderId: `ORD-HOT-${randNum}`,
      branch: domBranch?._id,
      customerName: 'Aarav Verma',
      customerPhone: '+91 99887 76655',
      pickupLocation: {
        name: 'Domino\'s Pizza Hub',
        address: 'Indiranagar 100ft Rd, Bangalore',
      },
      deliveryLocation: {
        address: 'Tech Park Block B, Bangalore',
        city: 'Bangalore',
      },
      items: [{ name: 'Chicken Golden Delight', quantity: 2, price: 499 }],
      totalAmount: 998,
      paymentMethod: 'UPI',
      priority: 'high',
      notes: 'Deliver to 4th floor reception',
    }),
  });
  const newDelivery = (await delvRes.json())?.data?.delivery;

  // Create manual maintenance & dispatch alerts via super admin
  const superLoginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@fastfleet.in', password: 'Password@123' })
  });
  const superToken = (await superLoginRes.json())?.data?.accessToken;

  // Auto assign or manual assign if possible
  if (newDelivery?._id) {
    await fetch(`http://localhost:5000/api/v1/deliveries/${newDelivery._id}/auto-assign`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${superToken}` },
    }).catch(() => null);
  }

  console.log('Launching headless Edge on port 9222...');
  const edge = spawn(EDGE_PATH, [
    '--remote-debugging-port=9222',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1440,900',
    '--no-first-run',
    '--no-default-browser-check',
    'http://localhost:5173/login',
  ]);

  await new Promise((r) => setTimeout(r, 2500));

  try {
    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find((t) => t.type === 'page');

    if (!pageTarget) throw new Error('No page target found');

    const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('DOM.enable');

    // 1. Authenticate as Domino's Store Manager via UI form
    console.log('Logging in as Domino\'s Store Manager via UI form...');
    await cdp.evaluate(`
      const buttons = Array.from(document.querySelectorAll('button'));
      const dominosBtn = buttons.find(b => b.textContent.includes("Domino's Store"));
      if (dominosBtn) dominosBtn.click();
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    `);

    await new Promise((r) => setTimeout(r, 4000));

    // 2. Open Header Notification Bell Dropdown
    console.log('Clicking notification bell in header...');
    await cdp.evaluate(`
      const bell = document.querySelector('button[aria-label="Notifications"]');
      if (bell) bell.click();
    `);
    await new Promise((r) => setTimeout(r, 2000));
    await cdp.screenshot('phase9_header_notification_dropdown.png');

    // 3. Navigate to Full Notifications Page via dropdown or router
    console.log('Navigating to Full Notifications Page (/notifications)...');
    await cdp.evaluate(`
      const viewAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View All Notifications'));
      if (viewAllBtn) {
        viewAllBtn.click();
      } else {
        window.location.href = '/notifications';
      }
    `);
    await new Promise((r) => setTimeout(r, 3000));
    await cdp.screenshot('phase9_notifications_page.png');

    // 4. Click the "Unread" tab (empty state if all marked read, or click "Alerts & Exceptions")
    console.log('Switching to Unread tab to demonstrate Empty State...');
    await cdp.evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const unreadTab = tabs.find(b => b.textContent.includes('Unread'));
      if (unreadTab) unreadTab.click();
    `);
    await new Promise((r) => setTimeout(r, 1500));
    await cdp.screenshot('phase9_notifications_unread_tab.png');

    // 5. Click "Mark All as Read" to trigger pristine Empty State
    console.log('Clicking Mark All as Read to demonstrate Empty State...');
    await cdp.evaluate(`
      const markAllBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Mark All as Read'));
      if (markAllBtn) markAllBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 2000));
    await cdp.screenshot('phase9_notifications_empty_state.png');

    console.log('✨ All Phase 9 UI screenshots captured successfully!');
    cdp.close();
  } catch (err) {
    console.error('Automation error:', err);
  } finally {
    edge.kill();
  }
}

capturePhase9();
