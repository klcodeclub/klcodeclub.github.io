//
// https://www.netlify.com/docs/functions/
//

const Airtable = require('airtable');

exports.handler = function(event, context, callback) {
  const query = event.queryStringParameters;

  if (query && query.base) {
    const airtable = new Airtable({apiKey: process.env.AIRTABLE_API_KEY});
    const base = airtable.base(query.base);
    let allRecords = [];

    base('Attendees').select({
      view: 'Public Data'
    }).eachPage(
      function page(records, fetchNextPage) {
        const cleaned = records.map(function(record) {
          return record.fields;
        });
        allRecords = allRecords.concat(cleaned);
        fetchNextPage();
      },
      function done(error) {
        if (error) {
          callback(error);
        } else {
          callback(null, {
            statusCode: 200,
            body: JSON.stringify(allRecords)
          });
        }
      }
    );

  } else {
    callback('`?base=` is required');
  }
}
