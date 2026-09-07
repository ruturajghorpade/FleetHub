// FleetHub – Comprehensive Database Seeder (Food Delivery Logistics)
import bcrypt from 'bcryptjs';
import connectDB, { disconnectDB } from '../config/db.js';
import User from '../models/User.js';
import Client from '../models/Client.js';
import Branch from '../models/Branch.js';
import Vehicle from '../models/Vehicle.js';
import Driver from '../models/Driver.js';
import Delivery from '../models/Delivery.js';
import Notification from '../models/Notification.js';
import Maintenance from '../models/Maintenance.js';
import { ROLES, STATUSES, DELIVERY_STATUSES, VEHICLE_TYPES, VEHICLE_STATUSES } from '../utils/constants.js';

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Client.deleteMany({}),
      Branch.deleteMany({}),
      Vehicle.deleteMany({}),
      Driver.deleteMany({}),
      Delivery.deleteMany({}),
      Notification.deleteMany({}),
      Maintenance.deleteMany({}),
    ]);
    await Vehicle.collection.dropIndexes().catch(() => {});
    await Driver.collection.dropIndexes().catch(() => {});
    await User.collection.dropIndexes().catch(() => {});
    await Client.collection.dropIndexes().catch(() => {});
    await Branch.collection.dropIndexes().catch(() => {});

    console.log('Creating password hash...');
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('Password@123', salt);

    // ── 1. Create Restaurant Clients ──────────────────────────────
    console.log('Seeding Clients...');
    const [dominos, kfc, pizzaHut, burgerKing] = await Client.create([
      {
        companyName: "Domino's Pizza",
        companyCode: 'DOM-BLR',
        email: 'manager@dominos.in',
        phone: '+91 80 2525 1111',
        businessType: 'RESTAURANT',
        address: '100ft Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        subscriptionPlan: 'enterprise',
        status: STATUSES.ACTIVE,
      },
      {
        companyName: 'KFC India',
        companyCode: 'KFC-BLR',
        email: 'ops@kfc.in',
        phone: '+91 80 2555 2222',
        businessType: 'FAST_FOOD',
        address: '80ft Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        subscriptionPlan: 'professional',
        status: STATUSES.ACTIVE,
      },
      {
        companyName: 'Pizza Hut',
        companyCode: 'PH-BLR',
        email: 'contact@pizzahut.in',
        phone: '+91 80 2555 3333',
        businessType: 'RESTAURANT',
        address: 'MG Road, Central',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        subscriptionPlan: 'professional',
        status: STATUSES.ACTIVE,
      },
      {
        companyName: 'Burger King',
        companyCode: 'BK-BLR',
        email: 'manager@burgerking.in',
        phone: '+91 80 2555 4444',
        businessType: 'FAST_FOOD',
        address: 'ITPL Main Road, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
        subscriptionPlan: 'starter',
        status: STATUSES.ACTIVE,
      },
    ]);

    // ── 2. Create Branches ─────────────────────────────────────────
    console.log('Seeding Branches...');
    const [domIndiranagar, domKoramangala, kfcKoramangala, phMgRoad, bkWhitefield] = await Branch.create([
      {
        client: dominos._id,
        branchName: "Domino's – Indiranagar",
        branchCode: 'DOM-IND-01',
        email: 'indiranagar@dominos.in',
        phone: '+91 80 2525 1112',
        address: '100ft Road, Indiranagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        operatingHours: '10:00 AM – 1:00 AM',
        status: STATUSES.ACTIVE,
      },
      {
        client: dominos._id,
        branchName: "Domino's – Koramangala",
        branchCode: 'DOM-KOR-02',
        email: 'koramangala@dominos.in',
        phone: '+91 80 2525 1113',
        address: '5th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560095',
        operatingHours: '10:00 AM – 1:00 AM',
        status: STATUSES.ACTIVE,
      },
      {
        client: kfc._id,
        branchName: 'KFC – Koramangala 4th Block',
        branchCode: 'KFC-KOR-01',
        email: 'kora4th@kfc.in',
        phone: '+91 80 2555 2223',
        address: '80ft Road, 4th Block, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560034',
        operatingHours: '11:00 AM – 11:30 PM',
        status: STATUSES.ACTIVE,
      },
      {
        client: pizzaHut._id,
        branchName: 'Pizza Hut – MG Road Central',
        branchCode: 'PH-MG-01',
        email: 'mgroad@pizzahut.in',
        phone: '+91 80 2555 3334',
        address: 'MG Road, Near Metro Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        operatingHours: '11:00 AM – 11:00 PM',
        status: STATUSES.ACTIVE,
      },
      {
        client: burgerKing._id,
        branchName: 'Burger King – Whitefield ITPL',
        branchCode: 'BK-WHI-01',
        email: 'itpl@burgerking.in',
        phone: '+91 80 2555 4445',
        address: 'ITPL Main Road, Whitefield',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560066',
        operatingHours: '10:00 AM – 12:00 AM',
        status: STATUSES.ACTIVE,
      },
    ]);

    // ── 3. Create Users ────────────────────────────────────────────
    console.log('Seeding Users...');
    const [superAdmin, clientAdmin, dispatcher, driverUser1, driverUser2] = await User.create([
      {
        name: 'Vikram Malhotra',
        email: 'admin@fastfleet.in',
        password: 'Password@123',
        phone: '+91 98765 00001',
        role: ROLES.SUPER_ADMIN,
        isActive: true,
      },
      {
        name: 'Sanjay Rawat',
        email: 'manager@dominos.in',
        password: 'Password@123',
        phone: '+91 98765 00002',
        role: ROLES.CLIENT_ADMIN,
        client: dominos._id,
        branch: domIndiranagar._id,
        isActive: true,
      },
      {
        name: 'Kavita Joshi',
        email: 'dispatch@fastfleet.in',
        password: 'Password@123',
        phone: '+91 98765 00003',
        role: ROLES.DISPATCHER,
        isActive: true,
      },
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.rider@fastfleet.in',
        password: 'Password@123',
        phone: '+91 98765 43210',
        role: ROLES.DRIVER,
        isActive: true,
      },
      {
        name: 'Amit Sharma',
        email: 'amit.rider@fastfleet.in',
        password: 'Password@123',
        phone: '+91 98765 43211',
        role: ROLES.DRIVER,
        isActive: true,
      },
    ]);

    // Also ensure ruturaj@example.com exists with the same password
    await User.create({
      name: 'Ruturaj',
      email: 'ruturaj@example.com',
      password: 'Password@123',
      phone: '7709176186',
      role: ROLES.SUPER_ADMIN,
      isActive: true,
    });

    // ── 4. Create Fleet Vehicles ───────────────────────────────────
    console.log('Seeding Vehicles...');
    const [v1, v2, v3, v4, v5, v6] = await Vehicle.create([
      {
        client: dominos._id,
        branch: domIndiranagar._id,
        vehicleNumber: 'KA01EF1010',
        vehicleType: VEHICLE_TYPES.EV_BIKE,
        brand: 'Ather Energy',
        model: 'Ather 450X',
        manufacturingYear: 2024,
        fuelType: 'electric',
        engineNumber: 'ENG-ATH-1010',
        chassisNumber: 'CHS-ATH-1010',
        status: VEHICLE_STATUSES.AVAILABLE,
        availability: 'AVAILABLE',
        odometer: 3420,
        createdBy: superAdmin._id,
      },
      {
        client: dominos._id,
        branch: domIndiranagar._id,
        vehicleNumber: 'KA01EF2020',
        vehicleType: VEHICLE_TYPES.EV_BIKE,
        brand: 'Bajaj',
        model: 'Chetak EV',
        manufacturingYear: 2024,
        fuelType: 'electric',
        engineNumber: 'ENG-BAJ-2020',
        chassisNumber: 'CHS-BAJ-2020',
        status: VEHICLE_STATUSES.AVAILABLE,
        availability: 'ON_DELIVERY',
        odometer: 4850,
        createdBy: superAdmin._id,
      },
      {
        client: kfc._id,
        branch: kfcKoramangala._id,
        vehicleNumber: 'KA01GH3030',
        vehicleType: VEHICLE_TYPES.EV_BIKE,
        brand: 'Ola Electric',
        model: 'Ola S1 Pro',
        manufacturingYear: 2023,
        fuelType: 'electric',
        engineNumber: 'ENG-OLA-3030',
        chassisNumber: 'CHS-OLA-3030',
        status: VEHICLE_STATUSES.AVAILABLE,
        availability: 'AVAILABLE',
        odometer: 6100,
        createdBy: superAdmin._id,
      },
      {
        client: pizzaHut._id,
        branch: phMgRoad._id,
        vehicleNumber: 'KA01AB4040',
        vehicleType: VEHICLE_TYPES.SCOOTER,
        brand: 'Honda',
        model: 'Activa 6G',
        manufacturingYear: 2023,
        fuelType: 'petrol',
        engineNumber: 'ENG-HON-4040',
        chassisNumber: 'CHS-HON-4040',
        status: VEHICLE_STATUSES.AVAILABLE,
        availability: 'AVAILABLE',
        odometer: 11200,
        createdBy: superAdmin._id,
      },
      {
        client: burgerKing._id,
        branch: bkWhitefield._id,
        vehicleNumber: 'KA01CD5050',
        vehicleType: VEHICLE_TYPES.EV_BIKE,
        brand: 'TVS',
        model: 'iQube Electric',
        manufacturingYear: 2024,
        fuelType: 'electric',
        engineNumber: 'ENG-TVS-5050',
        chassisNumber: 'CHS-TVS-5050',
        status: VEHICLE_STATUSES.MAINTENANCE,
        availability: 'MAINTENANCE',
        odometer: 8900,
        createdBy: superAdmin._id,
      },
      {
        client: dominos._id,
        branch: domKoramangala._id,
        vehicleNumber: 'KA01EF6060',
        vehicleType: VEHICLE_TYPES.EV_BIKE,
        brand: 'Hero Electric',
        model: 'Photon',
        manufacturingYear: 2023,
        fuelType: 'electric',
        engineNumber: 'ENG-HERO-6060',
        chassisNumber: 'CHS-HERO-6060',
        status: VEHICLE_STATUSES.AVAILABLE,
        availability: 'AVAILABLE',
        odometer: 5400,
        createdBy: superAdmin._id,
      },
    ]);

    // ── 5. Create Drivers ──────────────────────────────────────────
    console.log('Seeding Drivers...');
    const [d1, d2, d3, d4] = await Driver.create([
      {
        client: dominos._id,
        branch: domIndiranagar._id,
        user: driverUser1._id,
        employeeId: 'EMP-DRV-001',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.rider@fastfleet.in',
        phone: '+91 98765 43210',
        licenseNumber: 'KA01-20210001111',
        licenseType: 'MCWG',
        availability: 'AVAILABLE',
        assignedVehicle: v1._id,
        rating: 4.8,
        experience: 3,
        createdBy: superAdmin._id,
      },
      {
        client: dominos._id,
        branch: domIndiranagar._id,
        user: driverUser2._id,
        employeeId: 'EMP-DRV-002',
        firstName: 'Amit',
        lastName: 'Sharma',
        email: 'amit.rider@fastfleet.in',
        phone: '+91 98765 43211',
        licenseNumber: 'KA01-20220002222',
        licenseType: 'MCWG',
        availability: 'BUSY',
        assignedVehicle: v2._id,
        rating: 4.9,
        experience: 4,
        createdBy: superAdmin._id,
      },
      {
        client: kfc._id,
        branch: kfcKoramangala._id,
        employeeId: 'EMP-DRV-003',
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.rider@fastfleet.in',
        phone: '+91 98765 43212',
        licenseNumber: 'KA01-20230003333',
        licenseType: 'MCWG',
        availability: 'AVAILABLE',
        assignedVehicle: v3._id,
        rating: 4.7,
        experience: 2,
        createdBy: superAdmin._id,
      },
      {
        client: pizzaHut._id,
        branch: phMgRoad._id,
        employeeId: 'EMP-DRV-004',
        firstName: 'Vikram',
        lastName: 'Singh',
        email: 'vikram.rider@fastfleet.in',
        phone: '+91 98765 43213',
        licenseNumber: 'KA01-20200004444',
        licenseType: 'MCWG',
        availability: 'AVAILABLE',
        assignedVehicle: v4._id,
        rating: 4.6,
        experience: 5,
        createdBy: superAdmin._id,
      },
    ]);

    // Update vehicle assignedDriver references
    await Vehicle.findByIdAndUpdate(v1._id, { assignedDriver: driverUser1._id });
    await Vehicle.findByIdAndUpdate(v2._id, { assignedDriver: driverUser2._id });

    // ── 6. Create Deliveries ───────────────────────────────────────
    console.log('Seeding Deliveries...');
    await Delivery.create([
      {
        orderId: 'ORD-8491',
        trackingId: 'TRK-8491',
        client: dominos._id,
        branch: domIndiranagar._id,
        customerName: 'Rahul Sharma',
        customerPhone: '+91 98111 22334',
        pickupLocation: {
          name: "Domino's Pizza Indiranagar",
          address: '100ft Road, Indiranagar',
          phone: '+91 80 2525 1112',
        },
        deliveryLocation: {
          address: 'Flat 402, Sunshine Apts, 12th Main',
          landmark: 'Near BDA Complex',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.PENDING,
        items: [
          { name: 'Farmhouse Medium Pizza', quantity: 1, price: 399 },
          { name: 'Garlic Breadsticks', quantity: 1, price: 120 },
        ],
        totalAmount: 519,
        paymentMethod: 'PREPAID',
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 15 * 60 * 1000),
            note: 'Order placed by customer and sent to FastFleet dispatch.',
          },
        ],
      },
      {
        orderId: 'ORD-8492',
        trackingId: 'TRK-8492',
        client: kfc._id,
        branch: kfcKoramangala._id,
        customerName: 'Sneha Patel',
        customerPhone: '+91 98222 33445',
        pickupLocation: {
          name: 'KFC Koramangala 4th Block',
          address: '80ft Road, 4th Block',
          phone: '+91 80 2555 2223',
        },
        deliveryLocation: {
          address: 'No. 18, 3rd Cross, Koramangala 1st Block',
          landmark: 'Opposite Wipro Park',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.ASSIGNED,
        assignedDriver: d1._id,
        assignedVehicle: v1._id,
        assignedAt: new Date(Date.now() - 10 * 60 * 1000),
        items: [
          { name: 'Hot & Crispy Bucket (8 pcs)', quantity: 1, price: 549 },
          { name: 'Pepsi 500ml', quantity: 2, price: 90 },
        ],
        totalAmount: 639,
        paymentMethod: 'UPI',
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            note: 'Delivery request initiated.',
          },
          {
            status: 'assigned',
            timestamp: new Date(Date.now() - 10 * 60 * 1000),
            note: 'Assigned to Rajesh Kumar (Ather 450X).',
          },
        ],
      },
      {
        orderId: 'ORD-8493',
        trackingId: 'TRK-8493',
        client: pizzaHut._id,
        branch: phMgRoad._id,
        customerName: 'Ananya Verma',
        customerPhone: '+91 98333 44556',
        pickupLocation: {
          name: 'Pizza Hut MG Road',
          address: 'MG Road Central',
          phone: '+91 80 2555 3334',
        },
        deliveryLocation: {
          address: '7th Floor, Prestige Tower, Residency Road',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.PICKED_UP,
        assignedDriver: d2._id,
        assignedVehicle: v2._id,
        assignedAt: new Date(Date.now() - 20 * 60 * 1000),
        items: [
          { name: 'Veggie Supreme Pan Pizza', quantity: 2, price: 650 },
          { name: 'Cheese Garlic Bread', quantity: 1, price: 140 },
        ],
        totalAmount: 790,
        paymentMethod: 'PREPAID',
        timeline: [
          {
            status: 'pending',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            note: 'Delivery requested.',
          },
          {
            status: 'assigned',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            note: 'Assigned to Amit Sharma.',
          },
          {
            status: 'picked_up',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            note: 'Rider picked up order from kitchen.',
          },
        ],
      },
      {
        orderId: 'ORD-8494',
        trackingId: 'TRK-8494',
        client: burgerKing._id,
        branch: bkWhitefield._id,
        customerName: 'Karthik Nair',
        customerPhone: '+91 98444 55667',
        pickupLocation: {
          name: 'Burger King Whitefield',
          address: 'ITPL Main Road',
          phone: '+91 80 2555 4445',
        },
        deliveryLocation: {
          address: 'Villa 12, Palm Meadows, Whitefield',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.OUT_FOR_DELIVERY,
        assignedDriver: d3._id,
        assignedVehicle: v3._id,
        assignedAt: new Date(Date.now() - 25 * 60 * 1000),
        items: [
          { name: 'Whopper Meal', quantity: 1, price: 319 },
          { name: 'Chicken Fries', quantity: 1, price: 119 },
        ],
        totalAmount: 438,
        paymentMethod: 'COD',
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 35 * 60 * 1000), note: 'Order placed.' },
          { status: 'assigned', timestamp: new Date(Date.now() - 25 * 60 * 1000), note: 'Assigned to Priya Patel.' },
          { status: 'picked_up', timestamp: new Date(Date.now() - 15 * 60 * 1000), note: 'Order collected.' },
          { status: 'out_for_delivery', timestamp: new Date(Date.now() - 5 * 60 * 1000), note: 'Rider is en route to delivery address.' },
        ],
      },
      {
        orderId: 'ORD-8495',
        trackingId: 'TRK-8495',
        client: dominos._id,
        branch: domIndiranagar._id,
        customerName: 'Pooja Reddy',
        customerPhone: '+91 98555 66778',
        pickupLocation: {
          name: "Domino's Pizza Indiranagar",
          address: '100ft Road, Indiranagar',
        },
        deliveryLocation: {
          address: 'Apartment 3B, Green Glen Layout, Bellandur',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.DELIVERED,
        assignedDriver: d1._id,
        assignedVehicle: v1._id,
        deliveredAt: new Date(Date.now() - 30 * 60 * 1000),
        items: [
          { name: 'Peppy Paneer Large Pizza', quantity: 1, price: 689 },
          { name: 'Choco Lava Cake', quantity: 2, price: 198 },
        ],
        totalAmount: 887,
        paymentMethod: 'PREPAID',
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 90 * 60 * 1000), note: 'Placed.' },
          { status: 'assigned', timestamp: new Date(Date.now() - 75 * 60 * 1000), note: 'Assigned.' },
          { status: 'picked_up', timestamp: new Date(Date.now() - 60 * 60 * 1000), note: 'Picked up.' },
          { status: 'out_for_delivery', timestamp: new Date(Date.now() - 45 * 60 * 1000), note: 'In transit.' },
          { status: 'delivered', timestamp: new Date(Date.now() - 30 * 60 * 1000), note: 'Successfully delivered to customer.' },
        ],
      },
      {
        orderId: 'ORD-8496',
        trackingId: 'TRK-8496',
        client: kfc._id,
        branch: kfcKoramangala._id,
        customerName: 'Rohan Mehta',
        customerPhone: '+91 98666 77889',
        pickupLocation: {
          name: 'KFC Koramangala 4th Block',
          address: '80ft Road, 4th Block',
        },
        deliveryLocation: {
          address: 'Tower 4, Sobha Quartz, Bellandur',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.DELIVERED,
        assignedDriver: d2._id,
        assignedVehicle: v2._id,
        deliveredAt: new Date(Date.now() - 60 * 60 * 1000),
        items: [
          { name: 'Zinger Burger Duo', quantity: 1, price: 349 },
          { name: 'French Fries Large', quantity: 1, price: 110 },
        ],
        totalAmount: 459,
        paymentMethod: 'PREPAID',
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 120 * 60 * 1000), note: 'Placed.' },
          { status: 'delivered', timestamp: new Date(Date.now() - 60 * 60 * 1000), note: 'Delivered.' },
        ],
      },
      {
        orderId: 'ORD-8497',
        trackingId: 'TRK-8497',
        client: dominos._id,
        branch: domIndiranagar._id,
        customerName: 'Devendra Roy',
        customerPhone: '+91 98777 88990',
        pickupLocation: {
          name: "Domino's Pizza Indiranagar",
          address: '100ft Road, Indiranagar',
        },
        deliveryLocation: {
          address: 'Flat 101, Lakeview Apts, HAL 2nd Stage',
          city: 'Bengaluru',
        },
        status: DELIVERY_STATUSES.CANCELLED,
        cancelledBy: clientAdmin._id,
        cancellationReason: 'Customer requested order change before kitchen pickup.',
        cancelledAt: new Date(Date.now() - 40 * 60 * 1000),
        items: [
          { name: 'Chicken Golden Delight', quantity: 1, price: 499 },
        ],
        totalAmount: 499,
        paymentMethod: 'PREPAID',
        timeline: [
          { status: 'pending', timestamp: new Date(Date.now() - 50 * 60 * 1000), note: 'Order placed.' },
          { status: 'cancelled', timestamp: new Date(Date.now() - 40 * 60 * 1000), note: 'Pre-pickup cancellation confirmed by client admin. Driver released.' },
        ],
      },
    ]);

    // ── 7. Create Maintenance Records ──────────────────────────────
    console.log('Seeding Maintenance records...');
    await Maintenance.create([
      {
        vehicle: v5._id,
        client: burgerKing._id,
        maintenanceType: 'electrical',
        title: 'Battery Cell Balancing & Diagnostics',
        description: 'Periodic EV battery maintenance and firmware diagnostics update.',
        cost: 1450,
        status: 'in_progress',
        odometer: 8900,
        serviceCenter: 'TVS Authorized EV Service – Whitefield',
        performedBy: 'Raghu Technician',
        maintenanceDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin._id,
      },
      {
        vehicle: v4._id,
        client: pizzaHut._id,
        maintenanceType: 'brake_service',
        title: 'Front & Rear Brake Pad Replacement',
        description: 'Scheduled brake pad replacement for Honda Activa delivery scooter.',
        cost: 850,
        status: 'scheduled',
        odometer: 11200,
        serviceCenter: 'Honda Care MG Road',
        maintenanceDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nextMaintenanceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        createdBy: superAdmin._id,
      },
    ]);

    // ── 8. Create Notifications ────────────────────────────────────
    console.log('Seeding Notifications...');
    await Notification.create([
      {
        targetRole: 'all',
        type: 'ALERT',
        title: 'System Online',
        message: 'FastFleet Food Delivery Logistics Platform v1.0.0 is operating at optimal performance.',
      },
      {
        recipient: driverUser1._id,
        targetRole: 'driver',
        type: 'ASSIGNMENT',
        title: 'New Delivery Assigned',
        message: 'Order #ORD-8492 from KFC Koramangala is assigned to you. Head to restaurant for pickup.',
      },
      {
        targetRole: 'dispatcher',
        type: 'CANCELLATION',
        title: 'Order Cancelled Pre-Pickup',
        message: 'Order #ORD-8497 was cancelled by Domino’s Indiranagar before rider dispatch. Fleet partner returned to available pool.',
      },
    ]);

    console.log('\n✅ Database seeded successfully with FastFleet Food Logistics ecosystem!');
    console.log('----------------------------------------------------');
    console.log('Test Accounts (Password for all: Password@123):');
    console.log('  Super Admin : admin@fastfleet.in');
    console.log("  Client Admin: manager@dominos.in (Domino's Store)");
    console.log('  Dispatcher  : dispatch@fastfleet.in');
    console.log('  Driver      : rajesh.rider@fastfleet.in (Ather 450X)');
    console.log('  Developer   : ruturaj@example.com');
    console.log('----------------------------------------------------\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
