conn=Mongo('10.106.51.152:27017');
db=conn.getDB('tpc_poc');

//For estimate query time
// db.dev_15003.explain('executionStats').aggregate([
db.dev_15003.aggregate([
{ $set: { timestamp: { $dateFromString: { dateString: '$timestamp', format:'%Y-%m-%dT%H:%M:%S.%LZ' }}}},
{ $match: {
	$and:[
		{ customerId:{ $eq:333}},
		{ timestamp: { $gte: new ISODate('2020-08-01T00:00:00.000Z')}},
		{ timestamp: { $lt: new ISODate('2020-08-02T00:00:00.000Z')}},
		{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'}
	]
  }
},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId:{ $convert:{ input: '$_id', to:'string'}}, _id:0,measurement:1}}
])


// in mongo shell.
// load this query will return nothing
// please copy and paste
