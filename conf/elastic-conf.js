const elasticsearch = require('elasticsearch');

const esClient = new elasticsearch.Client({
  host: [
    {
      host: process.env.ES_HOST,
      protocol: process.env.ES_PROTOCOL,
      port: process.env.ES_PORT,
      auth: `${process.env.ES_USER}:${process.env.ES_PASSWORD}`,
    }
  ]
});

// API VERSION IS SPECIFICALLY SET IN THIS CASE AS IT REQUIRES different 'type' name
// in product index 
const esClientProduct = new elasticsearch.Client({
  host: [
    {
      host: process.env.ES_HOST_PRODUCT,
      protocol: 'http',
      port: '9243'
    }
  ],
  apiVersion: '6.8'
});

module.exports = { esClient, esClientProduct }
