conn=Mongo('10.106.51.152:27017');
db=conn.getDB('tpc_poc');

db.createCollection('dev_15003');
db.dev_15003.ensureIndex({"timestamp":"hashed"});
db.dev_15003.ensureIndex({"readingType":"hashed"});
db.dev_15003.ensureIndex({"customerId":"hashed"});



sh.shardCollection(
	'tpc_poc.dev_15003',
	{ customerId:1,timestamp:1,readingType:"hashed" }
);
