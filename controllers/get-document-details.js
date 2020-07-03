const { esClient } = require("../conf/elastic-conf");

const getDocumentDetails = async (docsToFetch) => {
    let data = await esClient.mget({
        body: {
            docs: docsToFetch
        }
    }).catch(e => {
        console.log(e);
        return [];
    });

    // Even if one of the document is not found we prevent further notification sending flow
    let error = data.docs.find(ele => ele.found == false);

    if (error) {
        return new Promise((resolve, reject) => {
            reject('Error in one of document');
        })
    }
    return data.docs;
};

module.exports = { getDocumentDetails }