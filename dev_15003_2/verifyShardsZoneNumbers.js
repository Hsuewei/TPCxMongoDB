conn=Mongo('10.106.51.152:27017');
db=conn.getDB('config');
db.shards.aggregate( [ { $project:{ count : { $size: '$tags'}}}]);
