conn = Mongo('10.106.51.152:27017');
db = conn.getDB('tpc_poc')

//For estimate query time
// db.dev_15003_5.explain('executionStats').aggregate([
db.dev_15003_5.aggregate([
{ $match: {$and:[
{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'},
{ customerId: '00000000333'},
{ timestamp: { $gte: new ISODate('2021-08-31T00:00:00.000Z')}},
{ timestamp: { $lt: new ISODate('2021-09-01T00:00:00.000Z')}}]}},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId: '$_id' ,measurement:1, _id:0 }}
])


// in mongo shell,
// load this .js will give you nothing
// please enter mongo shell , copy and paste
