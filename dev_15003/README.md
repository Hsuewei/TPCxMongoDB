dev_15003
===
## ref:
1. [Lab: explore mongoimoport-date]()
2. [Mongodb: mongoimport, --columnHasTypes](https://docs.mongodb.com/database-tools/mongoimport/#cmdoption-mongoimport-columnshavetypes)


## how i index collection and shard collection?
> please refer to ```dev_15003/shardCollection.js```
Comments:
1. The ```db.collection.ensureIndex()``` parts are nonsense. I should create compound index once for all.
2. Hash on **readingType** field is nonsense, I should hash on **timestamp** field.
	- Better cardinality
	- Better frequency

## how i import files?
> please refer to ```dev_15003/mongoimport-straight.sh```
Comments:
1. Importing these data without specifying datatypes cause the following problems:
	- **timestamp** field will not be parsed as ```ISOdate()```
	- **customerId** field will be trimmed off 0 and parsed as numeric type, which is nonsense. It should be pared as ```string```
	- **veestatus** field should be parsed as ```string``` rather then numeric type
![](images/dev_15003.png)
2. In dev_15003_2 round will mongoimport with datatypes

## how i query ?
> Please refer to ```dev_15003/query.js
>> Here use one-day query as an example
``` javascript
db.dev_15003.aggregate([
{ $set: { timestamp: { $dateFromString: { dateString: '$timestamp', format:'%Y-%m-%dT%H:%M:%S.%LZ' }}}},
{ $match: {
        $and:[
                { customerId:{ $eq:333}},
                { timestamp: { $gte: new ISODate('2020-08-01T00:00:00.000Z')}},
                { timestamp: { $lt: new ISODate('2020-08-02T00:00:00.000Z')}},
                { readingType: '0.0.2.9.1.2.12.0.0.0.0.0.0.0.0.3.72.0'}
        ]
  }
},
{ $group: { _id:'$customerId', measurement:{ $sum: { $multiply:[ '$measurement','$multiplier']}}}},
{ $project:{ customerId:{ $convert:{ input: '$_id', to:'string'}}, _id:0,measurement:1}}
])

```





