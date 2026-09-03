// FleetHub – Report Service (Food Delivery Logistics Analytics)
import Delivery from '../models/Delivery.js';
import Driver from '../models/Driver.js';
import Vehicle from '../models/Vehicle.js';
import Client from '../models/Client.js';

export const getDailyDeliveriesReport = async () => {
  // Aggregate deliveries grouped by day for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyStats = await Delivery.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        total: { $sum: 1 },
        delivered: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
        },
        cancelled: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return dailyStats;
};

export const getRestaurantReport = async () => {
  return Delivery.aggregate([
    {
      $group: {
        _id: '$client',
        totalOrders: { $sum: 1 },
        deliveredOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
        },
        cancelledOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
        },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
    {
      $lookup: {
        from: 'clients',
        localField: '_id',
        foreignField: '_id',
        as: 'restaurant',
      },
    },
    { $unwind: { path: '$restaurant', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        restaurantId: '$_id',
        restaurantName: { $ifNull: ['$restaurant.companyName', 'Unknown Restaurant'] },
        businessType: { $ifNull: ['$restaurant.businessType', 'RESTAURANT'] },
        totalOrders: 1,
        deliveredOrders: 1,
        cancelledOrders: 1,
        totalRevenue: 1,
      },
    },
    { $sort: { totalOrders: -1 } },
  ]);
};

export const getDriverReport = async () => {
  return Driver.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $project: {
        name: { $concat: ['$firstName', ' ', '$lastName'] },
        phone: 1,
        availability: 1,
        rating: { $ifNull: ['$rating', 4.5] },
        experience: 1,
      },
    },
    { $sort: { rating: -1 } },
  ]);
};

export const getVehicleUsageReport = async () => {
  return Vehicle.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    {
      $group: {
        _id: '$availability',
        count: { $sum: 1 },
        vehicles: {
          $push: {
            vehicleNumber: '$vehicleNumber',
            vehicleType: '$vehicleType',
            model: '$model',
          },
        },
      },
    },
  ]);
};

export const getCancelledDeliveriesReport = async () => {
  return Delivery.find({ status: 'cancelled' })
    .populate('client', 'companyName')
    .populate('assignedDriver', 'firstName lastName')
    .populate('cancelledBy', 'name role')
    .select('orderId client customerName cancellationReason cancelledAt timeline totalAmount')
    .sort({ cancelledAt: -1 })
    .limit(50);
};
