dev_15003_2
===
## ref:
1. [Mongodb: Zone](https://docs.mongodb.com/manual/core/zone-sharding/#zone-sharding)
2. [Mongodb: updateZoneKeyRange()](https://docs.mongodb.com/manual/reference/method/sh.updateZoneKeyRange/#updatezonekeyrange-method-init-chunk-distribution)
3. [Lab: explore mongoimport-date]()
4. [Mongodb: mongoimport, --columnsHaveTypes](https://docs.mongodb.com/database-tools/mongoimport/#cmdoption-mongoimport-columnshavetypes)
5. [Lab: updateZoneRange() and shard key]()

## how i pre-define Zones and Ranges?
> please refer to ```dev_15003_2/createZone.js```

Comments:
1. Every **customerId** has 6 different *readingType*, and there are 481 cusomerId
2. Thus, I create 2886 zones and evenly associate to 3 shards
3. In each zone, I expect any value of **timestamp**
4. Eventually, this set-up cause uneven chunk distribution
![](../images/chunks.png)
> even worse than collection that did not pre-define zoneRanges

5. After some modifications, ```dev_15003_5``` has some refined results.

## how i import files?
> please refer to ```dev_15003_2/mongoimport-withoutHeader.sh```

Comments:
1. **timestamp** field is parsed as ```ISOdate()```
2. **customerId** field is parsed as ```string```
3. Few fun facts with ```mongoimport``` date.

## how i query ?
> Please refer to ```dev_15003_2/query.js
>> Here use one-day query as an example

``` javascript
db.dev_15003_2.aggregate([
{ $match: {$and:[
{ timestamp: { $gte: new ISODate('2021-08-31T00:00:00.000Z')}},
{ timestamp: { $lt: new ISODate('2021-09-01T00:00:00.000Z')}},
{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'},
{ customerId: '00000000333'}]}},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId: '$_id' ,measurement:1, _id:0 }}
])
```





