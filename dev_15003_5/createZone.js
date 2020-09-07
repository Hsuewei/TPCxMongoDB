con = Mongo('10.106.51.152:27017');
db = con.getDB("tpc_poc");
db.createCollection('dev_15003_5');
db.dev_15003_5.createIndex(
        { readingType:1 , customerId:1, timestamp:"hashed" },
);

const readtypes = [
	"0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0",
	"0.0.2.9.15.2.164.0.0.0.0.0.0.0.0.3.73.0",
	"0.0.2.9.16.2.164.0.0.0.0.0.0.0.0.3.73.0",
	"0.0.2.9.17.2.164.0.0.0.0.0.0.0.0.3.73.0",
	"0.0.2.9.18.2.164.0.0.0.0.0.0.0.0.3.73.0",
	"0.0.2.9.19.2.12.0.0.0.0.0.0.0.0.3.72.0"
]

const shards = [
	"mongodb-shard01",
	"mongodb-shard02",
	"mongodb-shard03"
]

// shuffle an array
// Fisher-Yates Shuffle
// https://shubo.io/javascript-random-shuffle/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

var customerIdUpper,customerIdLower,zoneName

readtypes.forEach( function(r){
		for ( let id=2 ; id < 481; id++){
			customerIdLower = id.toString().padStart(11,"0");
			customerIdUpper = String(id + 1).padStart(11,"0");
			zoneName = "zone"+"_"+r+"_"+customerIdLower+"_"+customerIdUpper;
			// create zone
			sh.addShardToZone( shards[0],zoneName);
			// update zone range
			sh.updateZoneKeyRange(
				"tpc_poc.dev_15003_5",
				{ "readingType": r, "customerId":customerIdLower,  "timestamp": MinKey },
				{ "readingType": r, "customerId":customerIdUpper,  "timestamp": MinKey },
				zoneName
			);
			shuffle(shards);
		}
	}	
)



// Shard Collection:
sh.shardCollection(
   "tpc_poc.dev_15003_5",
     { "readingType": 1, "customerId": 1, "timestamp": "hashed" },
       false,
	{ presplitHashedZones: true }
       )
