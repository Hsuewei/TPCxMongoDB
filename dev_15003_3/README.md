dev_15003_3
===
## ref:
1. [Lab: explore mongoimoport-date]()
2. [Mongodb: mongoimport, --columnsHaveTypes](https://docs.mongodb.com/database-tools/mongoimport/#cmdoption-mongoimport-columnshavetypes)


## how i index collection and shard collection?
> please refer to ```dev_15003_3/shardCollection.js```

Comments:
1. ```unique:true``` compound index
2. unique shard key

## how i import files?
> please refer to ```dev_15003_3/mongoimport-withoutHeader.sh```

Comments:
1. **timestamp** field is parsed as ```ISOdate()```
2. **customerId** field is parsed as ```string```
3. Few fun facts with ```mongoimport``` date 
4. **veestatus** is parsed as ```string``` rather then numeric type

## how i query ?
> Please refer to ```dev_15003_3/query.js
>> Here use one-day query as an example
``` javascript
db.dev_15003_3.aggregate([
{ $match: {$and:[
{ timestamp: { $gte: new ISODate('2021-08-31T00:00:00.000Z')}},
{ timestamp: { $lt: new ISODate('2021-09-01T00:00:00.000Z')}},
{ readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'},
{ customerId: '00000000333'}]}},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId: '$_id' ,measurement:1, _id:0 }}
])
```





