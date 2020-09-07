conn=Mongo('10.106.51.152:27017');
db=conn.getDB('tpc_poc');

db.createCollection('dev_15003_4');
sh.addShardToZone("mongodb-shard01","hashAsFirst");
sh.addShardToZone("mongodb-shard02","hashAsFirst");
sh.addShardToZone("mongodb-shard03","hashAsFirst");
db.dev_15003_4.createIndex(
	{ _id:"hashed", timestamp:1, readingType:1, customerId:1 }
	);

sh.updateZoneKeyRange(
	"tpc_poc.dev_15003_4",
		{ "_id": MinKey, "timestamp" : MinKey, "readingType": MinKey, "customerId":MinKey},
		{ "_id": MaxKey, "timestamp" : MaxKey, "readingType": MaxKey, "customerId":MaxKey},
	"hashAsFirst"
);

sh.shardCollection( 
	'tpc_poc.dev_15003_4', 
	{ '_id':'hashed', 'timestamp':1, 'readingType':1, 'customerId':1 },
	false,
	{ presplitHashedZones: true }
	);

db.dev_15003_4.createIndex(
	{ "timestamp":1, readingType:1, customerId:1 }
	);
