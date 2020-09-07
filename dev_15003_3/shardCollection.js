conn=Mongo('10.106.51.152:27017');
db=conn.getDB('tpc_poc');

db.createCollection('dev_15003_3')
db.dev_15003_3.createIndex(
	{ timestamp:1, readingType:1 , customerId:1, _id:1 },
	{ unique: true}
);
sh.shardCollection(
	'tpc_poc.dev_15003_3',
	{timestamp:1, readingType:1 , customerId:1, _id:1 },
	true
);
