# TPCxMongoDB
Use mock date from Taiwan Power Company and get familiar with MongoDB
# Highlights
  - dev_15003_3's result is the best
  - dev_15003_5 set 1 zone range per customerId-readingType combination
  - dev_15003_2 experiment round on zone range test, casue unbalanced chunk distribution
  - dev_15003_1 resemble the real world case, because it dumps data into sharded cluster without pre-defining datatype in mongoimport
  - dev_15003_4 use hashed ``_id`` field as compound shard key's first element which make this round the worst,
    because i dont't know how to query on ``_id`` field (i.e. conditions,operators..)
    I have to create a compound index without ``_id`` as prefix
## Hardware Info
- servers:
  - QuantaGrid D51PH-1ULH : 4
    - CPU: Intel Xeon E5 2680 V3 : 8 
    - RAM: Skhynix 2133Hz 2R*4 16G : 52 (4,16,16,16)
    - Boot: InteL SATA SSD S3710 960GB : 4
    - SSD: Samsung SATA SSD SM863 960GB : 21 (0,7,7,7)
    - NIC: Mellanox  CX4 25G  Dual port : 4
    - SAS Controller: SAS Controller: LSI 3008 (LSI SAS9300) : 4
- switches:
  - QuantaMesh T3048-LY8 : 1
    - cables: 10G SFP+ DAC Cable - 3m: 8
  - QuantaMesh T1048-LB9 : 1
    - cables: 1G Cat5e CABLE - 2m: 4
    
## Software info
OS | Application
---|------------
RHEL 7.5 | Mongo DB Community 4.4.0

## Deployment
##### topology

##### host info
##### install MongoDB
