dev_15003_4
===
## ref:
1. [Mongodb: Zone](https://docs.mongodb.com/manual/core/zone-sharding/#zone-sharding)
2. [Mongodb: updateZoneKeyRange()](https://docs.mongodb.com/manual/reference/method/sh.updateZoneKeyRange/#updatezonekeyrange-method-init-chunk-distribution)
3. [Lab: explore mongoimport-date]()
4. [Mongodb: mongoimport, --columnsHaveTypes](https://docs.mongodb.com/database-tools/mongoimport/#cmdoption-mongoimport-columnshavetypes)


## how i pre-define Zones and Ranges?
> please refer to ```dev_15003_4/createZone.js```

Comments:
1. Use hashed field (in this case **_id**) as first key in compound shard key
2. In order to use ```index``` power, i should perform query with conditions that follow the order in shard key
3. Howerver, i don't know how to query on **_id** field
4. If skipping setting condition on **_id** field, it could cause enormous execution time
5. Alternatively, i create another compound index (as followed) for my query:
> { 'timestamp':1, readingType:1, customerId:1 } 

## how i import files?
> please refer to ```dev_15003_4/mongoimport-withoutHeader.sh```

Comments:
1. **timestamp** field is parsed as ```ISOdate()```
2. **customerId** field is parsed as ```string```
3. Few fun facts with ```mongoimport``` date
4. **veestatus** is parsed as ```string``` 

## how i query ?
> Please refer to ```dev_15003_4/match.js
>> Here use one-day query as an example
``` javascript
db.dev_15003_4.aggregate([
{ $match: {$and:[
{ timestamp: { $gte: new ISODate('2021-08-31T00:00:00.000Z')}},
{ timestamp: { $lt: new ISODate('2021-09-01T00:00:00.000Z')}},
{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'},
{ customerId: '00000000333'}]}},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId: '$_id' ,measurement:1, _id:0 }}
])
```





