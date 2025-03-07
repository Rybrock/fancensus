import axios from 'axios';

const API_URL = 'https://www.fancensus.com/test/dataset1.json';

/**
 * @param {*} value
 * @returns {number}
 */
const safeParseNumber = (value) => {
  if (value === null || value === undefined) return 0;
  
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
};

/**
 * @returns {Promise<Array>}
 */
export const fetchData = async () => {
  try {
    const response = await axios.get(API_URL);
    
    if (!Array.isArray(response.data)) {
      console.error('API did not return an array:', response.data);
      throw new Error('Invalid data format from API');
    }
    
    if (response.data.length > 0) {
      console.log('Data Structure:', {
        totalItems: response.data.length,
        sampleItem: response.data[0],
        keys: Object.keys(response.data[0])
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

/**
 * @param {Array} data 
 * @returns {Object}
 */
export const groupByProduct = (data) => {
  return data.reduce((acc, item) => {
    const product = item.product || 'Unknown Product';
    
    if (!acc[product]) {
      acc[product] = {
        product,
        count: 0,
        headline: item.headline || 'N/A',
        countries: new Set()
      };
    }
    
    acc[product].count++;
    
    const country = item.countrycode || item.country || item.nation || 'Unknown';
    if (country !== 'Unknown') {
      acc[product].countries.add(country);
    }
    
    return acc;
  }, {});
};

/**
 * @param {Array} data
 * @returns {Array}
 */
export const getProductSummary = (data) => {
  const grouped = groupByProduct(data);
  
  return Object.values(grouped).map(product => ({
    ...product,
    countries: Array.from(product.countries).filter(Boolean),
    countriesCount: product.countries.size
  })).sort((a, b) => b.count - a.count);
};
/**
 * @param {Array} data
 * @returns {Object}
 */
export const groupByCountry = (data) => {
  return data.reduce((acc, item) => {
    const country = item.countrycode || item.country || item.nation || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(item);
    return acc;
  }, {});
};

/**
 * @param {Array} data
 * @returns {Array}
 */
export const getCountrySummary = (data) => {
    const grouped = groupByCountry(data);
    return Object.keys(grouped).map(country => {
      const items = grouped[country];
      return {
        country,
        count: items.length,
        items: items
      };
    }).sort((a, b) => b.count - a.count);
  };
/**
 * @param {Array} data
 * @returns {Array}
 */
export const getCountryDistribution = (data) => {
  const countryCounts = data.reduce((acc, item) => {
    const country = item.countrycode || item.country || item.nation || 'Unknown';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / data.length) * 100)
    }))
    .sort((a, b) => b.count - a.count);
};