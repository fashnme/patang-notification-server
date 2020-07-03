const elasticsearch = require('elasticsearch');

const  esClient =  new elasticsearch.Client({  host: [
    {
      host: process.env.ES_HOST,
      protocol: process.env.ES_PROTOCOL,
      port: process.env.ES_PORT,
      auth: `${process.env.ES_USER}:${process.env.ES_PASSWORD}`,
    }
  ]
});

module.exports = {esClient}