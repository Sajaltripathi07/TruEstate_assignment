import { getSalesCollection } from '../models/salesModel.js';

class SalesService {
  async getSales(params) {
    const {
      page = 1,
      limit = 10,
      search = '',
      regions = [],
      genders = [],
      ageMin,
      ageMax,
      categories = [],
      tags = [],
      paymentMethods = [],
      dateFrom,
      dateTo,
      sortBy = 'date',
      sortOrder = 'desc'
    } = params;

    const collection = await getSalesCollection();
    const query = {};

    // Search condition - case-insensitive search on customerName and phoneNumber
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Region filter
    if (regions.length > 0) {
      query.customerRegion = { $in: regions };
    }

    // Gender filter
    if (genders.length > 0) {
      query.gender = { $in: genders };
    }

    // Age range filter
    if (ageMin !== undefined && ageMin !== null && ageMin !== '') {
      query.age = { ...query.age, $gte: parseInt(ageMin) };
    }
    if (ageMax !== undefined && ageMax !== null && ageMax !== '') {
      query.age = { ...query.age, $lte: parseInt(ageMax) };
    }

    // Category filter
    if (categories.length > 0) {
      query.productCategory = { $in: categories };
    }

    // Tags filter - tags field contains comma-separated values
    if (tags.length > 0) {
      const tagConditions = tags.map(tag => ({
        tags: { $regex: tag, $options: 'i' }
      }));
      
      if (query.$or) {
        // If search already has $or, combine with $and
        query.$and = [
          { $or: query.$or },
          { $or: tagConditions }
        ];
        delete query.$or;
      } else {
        query.$or = tagConditions;
      }
    }

    // Payment method filter
    if (paymentMethods.length > 0) {
      query.paymentMethod = { $in: paymentMethods };
    }

    // Date range filter
    if (dateFrom) {
      query.date = { ...query.date, $gte: dateFrom };
    }
    if (dateTo) {
      query.date = { ...query.date, $lte: dateTo };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'date':
        sort.date = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'quantity':
        sort.quantity = sortOrder === 'asc' ? 1 : -1;
        break;
      case 'customerName':
        sort.customerName = sortOrder === 'asc' ? 1 : -1;
        break;
      default:
        sort.date = -1;
    }

    // Get total count
    const total = await collection.countDocuments(query);

    // Get paginated data
    const skip = (page - 1) * limit;
    const data = await collection
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Transform field names to match frontend expectations
    const transformedData = data.map(item => ({
      transactionId: item.transactionId,
      date: item.date,
      customerId: item.customerId,
      customerName: item.customerName,
      phoneNumber: item.phoneNumber,
      gender: item.gender,
      age: item.age,
      customerRegion: item.customerRegion,
      customerType: item.customerType,
      productId: item.productId,
      productName: item.productName,
      brand: item.brand,
      productCategory: item.productCategory,
      tags: item.tags,
      quantity: item.quantity,
      pricePerUnit: item.pricePerUnit,
      discountPercentage: item.discountPercentage,
      totalAmount: item.totalAmount,
      finalAmount: item.finalAmount,
      paymentMethod: item.paymentMethod,
      orderStatus: item.orderStatus,
      deliveryType: item.deliveryType,
      storeId: item.storeId,
      storeLocation: item.storeLocation,
      salespersonId: item.salespersonId,
      employeeName: item.employeeName
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: transformedData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages
      }
    };
  }

  async getMetrics(params) {
    const {
      regions = [],
      genders = [],
      ageMin,
      ageMax,
      categories = [],
      tags = [],
      paymentMethods = [],
      dateFrom,
      dateTo
    } = params;

    const collection = await getSalesCollection();
    const query = {};

    // Apply same filters as getSales
    if (regions.length > 0) {
      query.customerRegion = { $in: regions };
    }

    if (genders.length > 0) {
      query.gender = { $in: genders };
    }

    if (ageMin !== undefined && ageMin !== null && ageMin !== '') {
      query.age = { ...query.age, $gte: parseInt(ageMin) };
    }
    if (ageMax !== undefined && ageMax !== null && ageMax !== '') {
      query.age = { ...query.age, $lte: parseInt(ageMax) };
    }

    if (categories.length > 0) {
      query.productCategory = { $in: categories };
    }

    if (tags.length > 0) {
      const tagConditions = tags.map(tag => ({
        tags: { $regex: tag, $options: 'i' }
      }));
      query.$or = tagConditions;
    }

    if (paymentMethods.length > 0) {
      query.paymentMethod = { $in: paymentMethods };
    }

    if (dateFrom) {
      query.date = { ...query.date, $gte: dateFrom };
    }
    if (dateTo) {
      query.date = { ...query.date, $lte: dateTo };
    }

    // Use aggregation pipeline for metrics
    const pipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalUnits: { $sum: '$quantity' },
          totalAmount: { $sum: '$totalAmount' },
          totalDiscount: {
            $sum: {
              $multiply: [
                { $divide: ['$discountPercentage', 100] },
                '$totalAmount'
              ]
            }
          },
          salesReps: { $addToSet: '$salespersonId' }
        }
      },
      {
        $project: {
          _id: 0,
          totalTransactions: 1,
          totalUnits: 1,
          totalAmount: 1,
          totalDiscount: 1,
          totalSalesReps: { $size: '$salesReps' }
        }
      }
    ];

    const result = await collection.aggregate(pipeline).toArray();
    const metrics = result[0] || {
      totalTransactions: 0,
      totalUnits: 0,
      totalAmount: 0,
      totalDiscount: 0,
      totalSalesReps: 0
    };

    return {
      totalUnits: parseInt(metrics.totalUnits) || 0,
      totalAmount: parseFloat(metrics.totalAmount) || 0,
      totalDiscount: parseFloat(metrics.totalDiscount) || 0,
      totalTransactions: parseInt(metrics.totalTransactions) || 0,
      totalSalesReps: parseInt(metrics.totalSalesReps) || 0
    };
  }

  async getFilterOptions() {
    const collection = await getSalesCollection();

    const results = {};

    // Get distinct regions
    const regions = await collection.distinct('customerRegion', {
      customerRegion: { $ne: null }
    });
    results.regions = regions.filter(Boolean).sort();

    // Get distinct genders
    const genders = await collection.distinct('gender', {
      gender: { $ne: null }
    });
    results.genders = genders.filter(Boolean).sort();

    // Get distinct categories
    const categories = await collection.distinct('productCategory', {
      productCategory: { $ne: null }
    });
    results.categories = categories.filter(Boolean).sort();

    // Get distinct payment methods
    const paymentMethods = await collection.distinct('paymentMethod', {
      paymentMethod: { $ne: null }
    });
    results.paymentMethods = paymentMethods.filter(Boolean).sort();

    // Get distinct tags - tags are comma-separated strings
    const tagsPipeline = [
      { $match: { tags: { $ne: null, $ne: '' } } },
      { $project: { tags: { $split: ['$tags', ','] } } },
      { $unwind: '$tags' },
      { $group: { _id: { $trim: { input: '$tags' } } } },
      { $match: { _id: { $ne: '' } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, tag: '$_id' } }
    ];
    const tagsResult = await collection.aggregate(tagsPipeline).toArray();
    results.tags = tagsResult.map(item => item.tag);

    // Get age range
    const agePipeline = [
      { $match: { age: { $ne: null } } },
      {
        $group: {
          _id: null,
          min: { $min: '$age' },
          max: { $max: '$age' }
        }
      }
    ];
    const ageResult = await collection.aggregate(agePipeline).toArray();
    results.ageRange = {
      min: ageResult[0]?.min ? parseInt(ageResult[0].min) : 0,
      max: ageResult[0]?.max ? parseInt(ageResult[0].max) : 100
    };

    // Get date range
    const datePipeline = [
      { $match: { date: { $ne: null } } },
      {
        $group: {
          _id: null,
          min: { $min: '$date' },
          max: { $max: '$date' }
        }
      }
    ];
    const dateResult = await collection.aggregate(datePipeline).toArray();
    results.dateRange = {
      min: dateResult[0]?.min || null,
      max: dateResult[0]?.max || null
    };

    return results;
  }
}

export default new SalesService();
