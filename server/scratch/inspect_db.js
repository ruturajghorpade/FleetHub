import mongoose from 'mongoose';

async function check() {
  await mongoose.connect('mongodb://localhost:27017/fleethub');
  const db = mongoose.connection.db;

  const users = await db.collection('users').countDocuments();
  const clients = await db.collection('clients').countDocuments();
  const branches = await db.collection('branches').countDocuments();
  const vehicles = await db.collection('vehicles').countDocuments({ isDeleted: { $ne: true } });
  const drivers = await db.collection('drivers').countDocuments({ isDeleted: { $ne: true } });

  console.log('DB_COUNTS:', JSON.stringify({ users, clients, branches, vehicles, drivers }));

  // Sample Domino's relationship
  const clientDoc = await db.collection('clients').findOne({ companyName: /domino/i });
  const branchDoc = await db.collection('branches').findOne({ client: clientDoc._id });
  const vehDoc = await db.collection('vehicles').findOne({ branch: branchDoc._id, isDeleted: { $ne: true } });
  const drvDoc = await db.collection('drivers').findOne({ branch: branchDoc._id, isDeleted: { $ne: true } });

  console.log('RELATIONSHIP_SAMPLE:', JSON.stringify({
    client: clientDoc?.companyName,
    branch: branchDoc?.branchName,
    vehicle: vehDoc?.vehicleNumber,
    assignedDriverId: vehDoc?.assignedDriver,
    driver: `${drvDoc?.firstName} ${drvDoc?.lastName}`,
    assignedVehicleId: drvDoc?.assignedVehicle,
  }, null, 2));

  await mongoose.disconnect();
}

check();
