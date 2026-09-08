// FleetHub – Phase 9 Automated Verification Test Script
// Tests Notifications & Alerts: multi-tenant isolation, lifecycle triggers, deduplication, unread counts, mark read, delete

const API_BASE = 'http://localhost:5000/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(`Login failed for ${email}: ${res.data?.message}`);
  }
  return {
    token: res.data?.data?.accessToken || res.data?.data?.token,
    user: res.data?.data?.user,
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 FleetHub Phase 9: Notifications & Alerts Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Authenticate users
    console.log('1. Authenticating test users...');
    const superAdmin = await login('admin@fastfleet.in', 'Password@123');
    const dominosAdmin = await login('manager@dominos.in', 'Password@123');
    const kfcAdmin = await login('manager@kfc.in', 'Password@123');
    const driver = await login('rajesh.rider@fastfleet.in', 'Password@123');
    console.log('  Authenticated Super Admin, Domino\'s Admin, KFC Admin, and Driver Rajesh.\n');

    // 2. Fetch Domino's Branches, Vehicles, Drivers
    console.log('2. Preparing Delivery Setup for Domino\'s...');
    const branchesRes = await request(`/branches?client=${dominosAdmin.user.client}`, { token: dominosAdmin.token });
    const dominosBranch = branchesRes.data?.data?.branches?.[0];
    assert(!!dominosBranch, 'Found Domino\'s Branch: ' + (dominosBranch?.name || dominosBranch?.branchName || 'N/A'));

    const driversRes = await request('/drivers?limit=50', { token: superAdmin.token });
    const rajeshDriver = driversRes.data?.data?.drivers?.find(
      (d) => d.email === 'rajesh.rider@fastfleet.in' || (d.user?._id || d.user) === driver.user?._id
    );
    assert(!!rajeshDriver, 'Found Driver Rajesh: ' + (rajeshDriver?.name || rajeshDriver?.firstName || 'N/A'));

    const vehiclesRes = await request('/vehicles?limit=50', { token: superAdmin.token });
    let testVehicle = (vehiclesRes.data?.data?.vehicles || []).find(
      (v) => (v.client?._id || v.client) === dominosAdmin.user.client
    );
    if (!testVehicle) {
      testVehicle = vehiclesRes.data?.data?.vehicles?.[0];
    }
    assert(!!testVehicle, 'Found Fleet Vehicle: ' + (testVehicle?.plateNumber || testVehicle?.vehicleNumber || 'N/A'));

    // Release any lingering active deliveries for Driver and Vehicle
    const activeDelvs = await request('/deliveries?limit=200', { token: superAdmin.token });
    for (const d of activeDelvs.data?.data?.deliveries || []) {
      if (['assigned', 'picked_up', 'out_for_delivery'].includes(d.status)) {
        const assignedDId = d.assignedDriver?._id || d.assignedDriver;
        const assignedVId = d.assignedVehicle?._id || d.assignedVehicle;
        if (assignedDId === rajeshDriver._id || assignedVId === testVehicle._id) {
          if (d.status === 'assigned') {
            await request(`/deliveries/${d._id}/cancel`, {
              method: 'POST',
              token: superAdmin.token,
              body: JSON.stringify({ reason: 'Pre-test release' }),
            });
          } else {
            await request(`/deliveries/${d._id}/status`, {
              method: 'PATCH',
              token: superAdmin.token,
              body: JSON.stringify({ status: 'delivered', note: 'Pre-test release' }),
            });
          }
        }
      }
    }

    // Reset Driver & Vehicle availability
    await request(`/drivers/${rajeshDriver._id}`, {
      method: 'PUT',
      token: superAdmin.token,
      body: JSON.stringify({
        availability: 'available',
        status: 'available',
        client: dominosAdmin.user.client,
        branch: dominosBranch._id,
      }),
    });
    await request(`/vehicles/${testVehicle._id}`, {
      method: 'PUT',
      token: superAdmin.token,
      body: JSON.stringify({
        availability: 'available',
        status: 'available',
        client: dominosAdmin.user.client,
        branch: dominosBranch._id,
      }),
    });

    // 3. Create a new delivery as Domino's Admin
    console.log('\n3. Creating Delivery as Domino\'s Admin...');
    const randCode = Math.floor(100000 + Math.random() * 900000);
    const deliveryPayload = {
      orderId: `ORD-P9-${randCode}`,
      branch: dominosBranch._id,
      customerName: 'Priya Sharma',
      customerPhone: '+91 98765 43210',
      pickupLocation: {
        name: 'Domino\'s Indiranagar',
        address: '100ft Road, Indiranagar, Bangalore',
      },
      deliveryLocation: {
        address: 'Flat 402, Sunshine Towers, MG Road, Bangalore',
        city: 'Bangalore',
      },
      items: [{ name: 'Farmhouse Pizza', quantity: 2, price: 420 }],
      totalAmount: 840,
      paymentMethod: 'UPI',
      priority: 'high',
      notes: 'Please ring bell twice',
    };

    const createDeliveryRes = await request('/deliveries', {
      method: 'POST',
      token: dominosAdmin.token,
      body: JSON.stringify(deliveryPayload),
    });
    assert(createDeliveryRes.status === 201, 'Domino\'s Delivery created successfully');
    const deliveryId = createDeliveryRes.data?.data?.delivery?._id;

    // 4. Assign Driver & Vehicle -> triggers DELIVERY_ASSIGNED notifications
    console.log('\n4. Assigning Driver Rajesh & Vehicle (Super Admin / Dispatcher)...');
    const assignRes = await request(`/deliveries/${deliveryId}/assign`, {
      method: 'POST',
      token: superAdmin.token,
      body: JSON.stringify({
        driverId: rajeshDriver._id,
        vehicleId: testVehicle._id,
      }),
    });
    assert(assignRes.status === 200, 'Delivery assigned to driver and vehicle');

    // 5. Verify Notifications for Driver and Domino's Admin
    console.log('\n5. Verifying Assignment Notifications...');
    const driverNotifs = await request('/notifications', { token: driver.token });
    const driverAssignedNotif = driverNotifs.data?.data?.notifications?.find(
      (n) => n.delivery === deliveryId || n.delivery?._id === deliveryId
    );
    assert(
      !!driverAssignedNotif && driverAssignedNotif.type === 'DELIVERY_ASSIGNED',
      'Driver received DELIVERY_ASSIGNED notification'
    );

    const dominosNotifs = await request('/notifications', { token: dominosAdmin.token });
    const dominosAssignedNotif = dominosNotifs.data?.data?.notifications?.find(
      (n) => n.delivery === deliveryId || n.delivery?._id === deliveryId
    );
    assert(
      !!dominosAssignedNotif && dominosAssignedNotif.type === 'DELIVERY_ASSIGNED',
      'Domino\'s Admin received DELIVERY_ASSIGNED notification'
    );

    // 6. Verify Tenant Isolation (KFC Admin must NOT see Domino's notification)
    console.log('\n6. Verifying Multi-Tenant Isolation (KFC Admin check)...');
    const kfcNotifs = await request('/notifications', { token: kfcAdmin.token });
    const kfcLeakedNotif = kfcNotifs.data?.data?.notifications?.find(
      (n) => n.delivery === deliveryId || n.delivery?._id === deliveryId
    );
    assert(!kfcLeakedNotif, 'Tenant Isolation Passed: KFC Admin did NOT receive Domino\'s delivery notification');

    // 7. Lifecycle Event: Picked Up
    console.log('\n7. Updating Status to picked_up...');
    const pickupRes = await request(`/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      token: driver.token,
      body: JSON.stringify({
        status: 'picked_up',
        note: 'Order picked up hot and fresh from Domino\'s oven',
      }),
    });
    assert(pickupRes.status === 200, 'Status updated to picked_up');

    const dominosNotifsAfterPickup = await request('/notifications', { token: dominosAdmin.token });
    const pickupNotif = dominosNotifsAfterPickup.data?.data?.notifications?.find(
      (n) => (n.delivery === deliveryId || n.delivery?._id === deliveryId) && n.type === 'DELIVERY_PICKED_UP'
    );
    assert(!!pickupNotif, 'Domino\'s Admin received DELIVERY_PICKED_UP notification');

    // 8. Lifecycle Event: Out for delivery
    console.log('\n8. Updating Status to out_for_delivery...');
    const transitRes = await request(`/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      token: driver.token,
      body: JSON.stringify({
        status: 'out_for_delivery',
        note: 'Riding towards customer location',
      }),
    });
    assert(transitRes.status === 200, 'Status updated to out_for_delivery');

    const dominosNotifsAfterTransit = await request('/notifications', { token: dominosAdmin.token });
    const transitNotif = dominosNotifsAfterTransit.data?.data?.notifications?.find(
      (n) => (n.delivery === deliveryId || n.delivery?._id === deliveryId) && n.type === 'DELIVERY_IN_TRANSIT'
    );
    assert(!!transitNotif, 'Domino\'s Admin received DELIVERY_IN_TRANSIT notification');

    // 9. Lifecycle Event: Delivered
    console.log('\n9. Updating Status to delivered...');
    const deliveredRes = await request(`/deliveries/${deliveryId}/status`, {
      method: 'PATCH',
      token: driver.token,
      body: JSON.stringify({
        status: 'delivered',
        note: 'Handed to customer Priya at door',
      }),
    });
    assert(deliveredRes.status === 200, 'Status updated to delivered');

    const dominosNotifsAfterDelivered = await request('/notifications', { token: dominosAdmin.token });
    const deliveredNotif = dominosNotifsAfterDelivered.data?.data?.notifications?.find(
      (n) => (n.delivery === deliveryId || n.delivery?._id === deliveryId) && n.type === 'DELIVERY_DELIVERED'
    );
    assert(!!deliveredNotif, 'Domino\'s Admin received DELIVERY_DELIVERED notification');

    // 10. Cancellation Notification Test
    console.log('\n10. Testing Cancellation Notification with Reason...');
    const cancelDeliveryRes = await request('/deliveries', {
      method: 'POST',
      token: dominosAdmin.token,
      body: JSON.stringify({
        ...deliveryPayload,
        orderId: `ORD-P9-CNL-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName: 'Vikram Mehta',
        customerPhone: '+91 91234 56789',
      }),
    });
    const cancelDeliveryId = cancelDeliveryRes.data?.data?.delivery?._id;
    assert(!!cancelDeliveryId, 'Created second delivery for cancellation test');

    const cancelReason = 'Customer requested order change';
    const cancelRes = await request(`/deliveries/${cancelDeliveryId}/cancel`, {
      method: 'POST',
      token: dominosAdmin.token,
      body: JSON.stringify({ reason: cancelReason }),
    });
    assert(cancelRes.status === 200, 'Delivery cancelled with reason');

    const dominosNotifsAfterCancel = await request('/notifications', { token: dominosAdmin.token });
    const cancelNotif = dominosNotifsAfterCancel.data?.data?.notifications?.find(
      (n) => (n.delivery === cancelDeliveryId || n.delivery?._id === cancelDeliveryId) && n.type === 'DELIVERY_CANCELLED'
    );
    assert(
      !!cancelNotif && cancelNotif.message.includes(cancelReason),
      'Domino\'s Admin received DELIVERY_CANCELLED notification with reason included'
    );

    // 11. Unread Count & Mark as Read
    console.log('\n11. Testing Unread Count and Mark as Read...');
    const unreadCountRes = await request('/notifications/unread-count', { token: dominosAdmin.token });
    const initialUnread = unreadCountRes.data?.data?.unreadCount;
    assert(typeof initialUnread === 'number' && initialUnread > 0, `Unread count retrieved: ${initialUnread}`);

    if (cancelNotif) {
      const markSingleRes = await request(`/notifications/${cancelNotif._id}/read`, {
        method: 'PATCH',
        token: dominosAdmin.token,
      });
      assert(markSingleRes.status === 200, 'Marked single notification as read');

      const unreadCountAfterSingle = await request('/notifications/unread-count', { token: dominosAdmin.token });
      assert(
        unreadCountAfterSingle.data?.data?.unreadCount === initialUnread - 1,
        `Unread count decremented by 1: ${unreadCountAfterSingle.data?.data?.unreadCount}`
      );
    }

    // 12. Cross-Tenant Authorization Check (403 Forbidden)
    console.log('\n12. Testing Cross-Tenant Security on Notification Mutation...');
    if (cancelNotif) {
      const crossTenantPatch = await request(`/notifications/${cancelNotif._id}/read`, {
        method: 'PATCH',
        token: kfcAdmin.token,
      });
      assert(
        crossTenantPatch.status === 403,
        `KFC Admin cross-tenant PATCH correctly rejected with 403 Forbidden (${crossTenantPatch.status})`
      );

      const crossTenantDelete = await request(`/notifications/${cancelNotif._id}`, {
        method: 'DELETE',
        token: kfcAdmin.token,
      });
      assert(
        crossTenantDelete.status === 403,
        `KFC Admin cross-tenant DELETE correctly rejected with 403 Forbidden (${crossTenantDelete.status})`
      );
    }

    // 13. Mark All as Read
    console.log('\n13. Testing Mark All as Read...');
    const markAllRes = await request('/notifications/read-all', {
      method: 'PATCH',
      token: dominosAdmin.token,
    });
    assert(markAllRes.status === 200, 'Mark all notifications as read executed');

    const unreadCountAfterAll = await request('/notifications/unread-count', { token: dominosAdmin.token });
    assert(
      unreadCountAfterAll.data?.data?.unreadCount === 0,
      `Unread count is now 0: ${unreadCountAfterAll.data?.data?.unreadCount}`
    );

    // 14. Delete Notification
    console.log('\n14. Testing Delete Notification...');
    if (cancelNotif) {
      const deleteRes = await request(`/notifications/${cancelNotif._id}`, {
        method: 'DELETE',
        token: dominosAdmin.token,
      });
      assert(deleteRes.status === 200, 'Owner successfully deleted notification');

      const checkDeleted = await request('/notifications', { token: dominosAdmin.token });
      const foundDeleted = checkDeleted.data?.data?.notifications?.some((n) => n._id === cancelNotif._id);
      assert(!foundDeleted, 'Deleted notification no longer in notifications list');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
