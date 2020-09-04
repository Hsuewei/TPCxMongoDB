con = Mongo('10.106.51.152:27017');
db = con.getDB("config");
const shard_db = db.shards.find();
const shardList=[
	"mongodb-shard01",
	"mongodb-shard02",
	"mongodb-shard03"
]

shardList.forEach( function(s){	
	for (zone of shard_db[parseInt(s.substring(14,15))-1].tags){		
		sh.removeShardFromZone(s,zone)
	}
  }
)
