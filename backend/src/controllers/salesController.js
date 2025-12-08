import salesService from '../services/salesService.js';

class SalesController {
  async getSales(req, res) {
    try {
      const {
        page,
        limit,
        search,
        regions,
        genders,
        ageMin,
        ageMax,
        categories,
        tags,
        paymentMethods,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder
      } = req.query;

      const params = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search: search || '',
        regions: regions ? (Array.isArray(regions) ? regions : regions.split(',')) : [],
        genders: genders ? (Array.isArray(genders) ? genders : genders.split(',')) : [],
        ageMin: ageMin || null,
        ageMax: ageMax || null,
        categories: categories ? (Array.isArray(categories) ? categories : categories.split(',')) : [],
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
        paymentMethods: paymentMethods ? (Array.isArray(paymentMethods) ? paymentMethods : paymentMethods.split(',')) : [],
        dateFrom: dateFrom || null,
        dateTo: dateTo || null,
        sortBy: sortBy || 'date',
        sortOrder: sortOrder || 'desc'
      };

      const result = await salesService.getSales(params);
      res.json(result);
    } catch (error) {
      console.error('Error fetching sales:', error);
      res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  }

  async getMetrics(req, res) {
    try {
      const {
        regions,
        genders,
        ageMin,
        ageMax,
        categories,
        tags,
        paymentMethods,
        dateFrom,
        dateTo
      } = req.query;

      const params = {
        regions: regions ? (Array.isArray(regions) ? regions : regions.split(',')) : [],
        genders: genders ? (Array.isArray(genders) ? genders : genders.split(',')) : [],
        ageMin: ageMin || null,
        ageMax: ageMax || null,
        categories: categories ? (Array.isArray(categories) ? categories : categories.split(',')) : [],
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
        paymentMethods: paymentMethods ? (Array.isArray(paymentMethods) ? paymentMethods : paymentMethods.split(',')) : [],
        dateFrom: dateFrom || null,
        dateTo: dateTo || null
      };

      const metrics = await salesService.getMetrics(params);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  async getFilterOptions(req, res) {
    try {
      const options = await salesService.getFilterOptions();
      res.json(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(500).json({ error: 'Failed to fetch filter options' });
    }
  }
}

export default new SalesController();

