dev_15003_5
===
## ref:
1. [Mongodb: Zone](https://docs.mongodb.com/manual/core/zone-sharding/#zone-sharding)
2. [Mongodb: updateZoneKeyRange()](https://docs.mongodb.com/manual/reference/method/sh.updateZoneKeyRange/#updatezonekeyrange-method-init-chunk-distribution)
3. [Lab: explore mongoimport-date]()
4. [Mongodb: mongoimport, --columnHasTypes](https://docs.mongodb.com/database-tools/mongoimport/#cmdoption-mongoimport-columnshavetypes)
5. [Lab: updateZoneRange() and shard key]()

## how i pre-define Zones and Ranges?
> please refer to ```dev_15003_5/createZone.js```
Comments:
1. 481 **customerId** and 6 **readingType** 2886 zones
2. in each zone, hashed **timestamp** is accepted as any value
3. did not use **_id** field as shard key
4. In this dataset, the uniqueness of data can be achieved with **customerId**, **readinType**, and **timestamp**
> { readingType:1 , customerId:1, timestamp:"hashed" } 
5. chunk distribution:
![](images/dev_15003_5-chunk.png)



## how i import files?
> please refer to ```dev_15003_5/mongoimport-withoutHeader.sh```
Comments:
1. **timestamp** field is parsed as ```ISOdate()```
2. **customerId** field is parsed as ```string```
3. Few fun facts with ```mongoimport``` date.

## how i query ?
> Please refer to ```dev_15003_5/match.js
>> Here use one-day query as an example
``` javascript
db.dev_15003_5.aggregate([
{ $match: {$and:[
{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'},
{ customerId: '00000000333'},
{ timestamp: { $gte: new ISODate('2021-08-31T00:00:00.000Z')}},
{ timestamp: { $lt: new ISODate('2021-09-01T00:00:00.000Z')}}]}},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId: '$_id' ,measurement:1, _id:0 }}
])
```





