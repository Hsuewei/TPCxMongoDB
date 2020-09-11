TPCxMongoDB
===
Use mock date from Taiwan Power Company and get familiar with MongoDB
<iframe width="100%" height="500" src="https://hackmd.io/features" frameborder="0"></iframe>

Table of Contents
===
* [Highlights](#highlights)  
* [Hardware Info](#hardware-info)
* [Software Info](#software-info)
* [Host Info](#host-info)
* [Deployment](#deployment)
    * [Topology](#topology)
    * [Install MongoDB](#install-mongodb)
    * [Environment Set-up](#environment-set-up)
        - [Update GNU C Library](#update-gnu-c-library)
        - [Avoid Swap As Possible As System Can](#avoid-swap-as-possible-as-system-can)
        - [Disable SeLinux And Firewall](#disable-selinux-and-firewall)
        - [Disable THP](#disable-thp)
        - [Configure NUMA Interleave For mongod and mongos](#configure-numa-interleave-for-mongod-and-mongos)
        - [Configure ulimit for mongod and mongos instance through systemd](#configure-ulimit-for-mongod-and-mongos-instance-through-systemd)
        - [Separate data and log storage location](#separate-data-and-log-storage-location)
* [Establish a sharded cluster](#establish-a-sharded-cluster)
    * [initiate every roles in mongodb](#initiate-every-role-in-mongodb)
    * [Create a database and collection](#create-database-and-collection)
    

 


## Highlights 
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
    
## Software Info
OS | Application
---|------------
RHEL 7.5 | Mongo DB Community 4.4.0

## Host Info
Hostname | roles | IP | replica set name | port
---------|-------|----|------------------|-----
config | config server,mongos | 10.106.51.152 | mongodb-configsvr | 27019,27017
shard01| shardA | 10.106.51.149 | mongodb-shard01 | 27018
shard02| shardB | 10.106.51.150 | mongodb-shard02 | 27018
shard03| shardC | 10.106.51.151 | mongodb-shard03 | 27018

> ```config``` only equipped with 1 SSD as boot and 4 16G memory

## Deployment

### Topology





### Install MongoDB
#### ref:
  - [Mongodb official doc](https://docs.mongodb.com/manual/installation/)
  - [Mongodb production notes](https://docs.mongodb.com/manual/administration/production-notes/#hardware-considerations)
#### Create mongodb-org-4.4.repo and install
  ```shell
  vim /etc/yum.repos.d/mongodb-org-4.4.repo
  ```
  add these lines:
  ```shell
  [mongodb-org-4.4]
  name=MongoDB Repository
  baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.4/x86_64/
  gpgcheck=1
  enabled=1
  gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
  ```
  install wiith yum:
  ```shell
  sudo yum install mongodb-org
  ```
#### Modify /etc/mongod.conf
Please refer to conf/{ config-mongod.conf, shard-mongod.conf} for samples
- Note:
  - The Lab environment did not deploy config server replica set and shard server replica set
  - (i.e. Only 1 member in config server replica set instead of 3)
  - (i.e. Only 1 member in each shard replica set instead of 3)
#### Create mongos.conf on ```config```
> Please refer to conf/mongos.conf for samples

### Environment Set-up
#### Update GNU C Library
``` shell
yum update glibc
```
---
#### Avoid Swap As Possible As System Can
```shell
echo vm.swappiness = 1 >> /etc/sysctl.conf
```
```shell
sysctl -p
```
---
#### Disable SeLinux And Firewall
``` shell
sed -i 's/^SELINUX=.*$/SELINUX=disabled/g' /etc/sysconfig/selinux
```
``` shell
setenforce 0
```
``` shell
systemctl stop firewalld
systemctl disable firewalld 
```
---
#### Disable THP
##### disable THP on the fly
``` shell
vim /etc/rc.d/rc.local
```
``` shell
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag
```
##### Grant access
``` shell
chmod +x /etc/rc.d/rc.local
```
##### Disable THP on boot
``` shell
vim /etc/default/grub
```
> add ```transparent_hugepage=never```

images
##### Two different commands for different platform
(On UEFI machine)
``` shell
grub2-mkconfig -o /boot/efi/EFI/redhat/grub.cfg
```
(On BIOS machine)
``` shell
grub2-mkconfig -o /boot/grub2/grub.cfg
```
---
#### Configure NUMA Interleave For mongod and mongos
##### install ```numactl```
``` shell
sudo yum -y install numactl
```
##### disable zone reclaim:
``` shell
echo 0 | sudo tee /proc/sys/vm/zone_reclaim_mode
```
``` shell
sudo sysctl -w vm.zone_reclaim_mode=0
```
#### Find out which init system is in use(```systemd``` expected):
``` shell
ps --no-headers -o comm 1
```
> If it is ``` init```, Please refer to [Configure NUMA on Linux part for other tutorial](https://docs.mongodb.com/manual/administration/production-notes/#Configuring%20NUMA%20on%20Linux)

##### establish a new service file and edit
``` shell
sudo cp /lib/systemd/system/mongod.service /etc/systemd/system
```
> modify the ```ExecStart```
>> ExecStart=/usr/bin/numactl --interleave=all /usr/bin/mongod --config /etc/mongod.conf
>>> image
#### apply changes to systemd
``` shell
systemctl daemon-reload
```
---
### Configure ulimit for mongod and mongos instance through systemd
#### ref:
   - [recommended ulimit setting for mongod and mongos](https://docs.mongodb.com/manual/reference/ulimit/)
#### (for host running mongod) edit mongod.service
``` shell
vim /etc/systemd/system/mongod.service
```
add these lines under ```[service]``` part:
```
[Service]
# (file size)
LimitFSIZE=infinity
# (cpu time)
LimitCPU=infinity
# (virtual memory size)
LimitAS=infinity
# (locked-in-memory size)
LimitMEMLOCK=infinity
# (open files)
LimitNOFILE=64000
# (processes/threads)
LimitNPROC=64000
```
#### (for host that running mongos) create mongos.service
##### Note:
   1. This step will use systemd to manage mongos and mongos will write mongos.log to local
      - mongos.log growth rate: 212K/4min
   2. If you don't want preserve mongos.log, Please refer to ```conf/mongos-simple.service``` for sample
   3. User running mongos should have permission to mongos.log and mongos.conf
``` shell
vim /etc/systemd/system/mongos.service
```
> Please refer to ```conf/mongos.service``` for sample
#### create mongos.conf
> Please refer tp ``` conf/mongos.conf``` for sample
#### create user, mongos
``` shell
adduser mongos -g mongod --no-create-home
```
#### space for mongos.log
``` shell
mkdir /var/log/mongos
chown mongos:mongod /var/log/mongos
```
---
### Separate data and log storage location
#### ref:
1. [logical volume administration](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/7/html/logical_volume_manager_administration/LV#raid0volumes)
2. [Configure raid logical volumes](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/configuring_and_managing_logical_volumes/assembly_configure-mange-raid-configuring-and-managing-logical-volumes)
3. [LVM on Raind Calculator](https://access.redhat.com/labs/lvmraidcalculator/)
4. [File System Layout Calculator](https://access.redhat.com/labs/fslayoutcalculator/)

#### storage on ```shard01```,```shard02```,```shard03```
LVM | components | usage
:----|:-----------|:------
LVM | INTEL SSDSC2BA800G4 \*1 | OS<br>data.index 
LVM-raid-5 | SAMSUNG MZ7KM960HAHP-00005 \*3 | data.collection<br>data.journal<br>log.mongod.log
LVM-raid-10 | SAMSUNG MZ7KM960HAHP-00005 \*4 | data.data
#### storage on ```config```
LVM | components | usage
:----|:-----------|:------
LVM | INTEL SSDSC2BA800G4 \*1 | OS<br>data.index<br>data.journal<br>data.collection<br>data.data<br>log.mongod.log
#### Note:
1. Raid-10,Raid5 or Raid6 are recommended. Raid-0 is only for lab
2. Main growth of data will be on data.collection and data.index directory. Make sure these two have enough space
#### LVM-raid-5
``` shell
pvcreate /dev/sdb;pvcreate /dev/sdc;pvcreate /dev/sdd
vgcreate --dataalignment 128K --physicalextentsize 4096K mongodb-j-l /dev/sdb /dev/sdc /dev/sdd 
lvcreate --type raid5 -i 2 -I 64K -l 100%FREE -n storage mongodb-j-l
```
#### LVM-raid10
``` shell
pvcreate /dev/sdd;pvcreate /dev/sde;pvcreate /dev/sdf;pvcreate /dev/sdg
vgcreate --dataalignment 128K --physicalextentsize 4096K mongodb-d /dev/sdd /dev/sde /dev/sdg /dev/sdg
lvcreate --type raid10 -i 2 -m 1 -I 64k -l 100%FREE -n storage mongodb-d
```
#### Format FS and mount
``` shell
mkfs.xfs  -b 4096 -d su=64k,sw=2 /dev/mapper/mongodb--j--l-storage
mkfs.xfs  -b 4096 -d su=64k,sw=2 /dev/mapper/mongodb--d-storage 
mkdir -p /mongodb/{data,log}
mount /dev/mapper/mongodb--j--l-storage /mongodb/log

mount /dev/mapper/mongodb--d-storage /mongodb/data
mkdir -p /mongodb/log/{collection,journal}
mkdir -p /home/mongodb/data/index
```
#### Separate Storage with symbolic link
``` shell
cd /mongodb/data;ln -s /mongodb/log/collection
cd /mongodb/data;ln -s /mongodb/log/journal
cd /mongodb/data;ln -s /home/mongodb/data/index
```
#### Change Owner
``` shell
chown -R mongod:mongod /mongodb
chown -R mongod:mongod /home/mongodb
```
---

## Establish a sharded cluster
### initiate every roles in mongodb
#### start mongod
``` shell
systemctl start mongod
```
#### (for host running config server)initiate config server
```config```
```shell
# use mongo shell connect to config server
mongo 10.106.51.152:27019
```
``` javascript
rs.initiate(
{
  "_id": "mongodb-configsvr",
  "version": 1,
  "term": 1,
  "protocolVersion": 1,
  "writeConcernMajorityJournalDefault": true,
  "configsvr": true,
  "members": [
        {
          "_id": 0,
          "host": "config:27019",
          "arbiterOnly": false,
          "buildIndexes": true,
          "hidden": false,
          "priority": 500,
          "tags": {
              "scripting-date": "2020-08-04"
          },
          "slaveDelay": 0,
          "votes": 1
        }
  ],
  "settings": {
        "chainingAllowed": true,
        "heartbeatTimeoutSecs": 10,
        "electionTimeoutMillis": 10000,
        "catchUpTimeoutMillis": -1
  }
}
)
```
#### (for host running shard server)initiate shard server
```shard01```
```shell
# use mongo shell connect to shard server
mongo 10.106.51,149:27019
```
```javascript
rs.initiate(
{
  "_id": "mongodb-shard01",
  "version": 1,
  "term": 1,
  "protocolVersion": 1,
  "writeConcernMajorityJournalDefault": true,
  "configsvr": false,
  "members": [
        {
          "_id": 0,
          "host": "shard01:27018",
          "arbiterOnly": false,
          "buildIndexes": true,
          "hidden": false,
          "priority": 500,
          "tags": {
              "scripting-date": "2020-08-04"
          },
          "slaveDelay": 0,
          "votes": 1
        }
  ],
  "settings": {
        "chainingAllowed": true,
        "heartbeatTimeoutSecs": 10,
        "electionTimeoutMillis": 10000,
        "catchUpTimeoutMillis": -1
  }
}
)
```
```shard02```
```shell
# use mongo shell connect to shard server
mongo 10.106.51.150:27018
```
```javascript
rs.initiate(
{
  "_id": "mongodb-shard02",
  "version": 1,
  "term": 1,
  "protocolVersion": 1,
  "writeConcernMajorityJournalDefault": true,
  "configsvr": false,
  "members": [
        {
          "_id": 0,
          "host": "shard01:27018",
          "arbiterOnly": false,
          "buildIndexes": true,
          "hidden": false,
          "priority": 500,
          "tags": {
              "scripting-date": "2020-08-04"
          },
          "slaveDelay": 0,
          "votes": 1
        }
  ],
  "settings": {
        "chainingAllowed": true,
        "heartbeatTimeoutSecs": 10,
        "electionTimeoutMillis": 10000,
        "catchUpTimeoutMillis": -1
  }
}
)
```
```shard03```
```shell
# use mongo shell connect to shard server
mongo 10.106.51.151:27018
```
```javascript
rs.initiate(
{
  "_id": "mongodb-shard03",
  "version": 1,
  "term": 1,
  "protocolVersion": 1,
  "writeConcernMajorityJournalDefault": true,
  "configsvr": false,
  "members": [
        {
          "_id": 0,
          "host": "shard01:27018",
          "arbiterOnly": false,
          "buildIndexes": true,
          "hidden": false,
          "priority": 500,
          "tags": {
              "scripting-date": "2020-08-04"
          },
          "slaveDelay": 0,
          "votes": 1
        }
  ],
  "settings": {
        "chainingAllowed": true,
        "heartbeatTimeoutSecs": 10,
        "electionTimeoutMillis": 10000,
        "catchUpTimeoutMillis": -1
  }
}
)
```
#### (On host running mongos.service)Start Mongos
> Ensure ```mongos.conf``` and ```mongos.service``` are configured properly(IPs,hostnames and path....)
``` shell
systemctl start mongos
```
---
### Create a database and collection
#### add shards to cluster
``` shell
# connect to mongos through mongo shell
mongo 10.106.51.152:27017
```
``` javascript
// add shards(shardA,shardB,shardC) to cluster
sh.addShard("mongodb-shard01/shard01:27018")
sh.addShard("mongodb-shard02/shard02:27018")
sh.addShard("mongodb-shard03/shard03:27018")
```
Note:
1. Syntax for ```sh.addShard()```
``` 
sh.addShard( "<replSetName>/shardA-1:27018,shardA-2:27018,……")
sh.addShard( "<replSetName>/shardB-1:27018,shardB-2:27018,……")
sh.addShard( "<replSetName>/shardC-1:27018,shardC-2:27018,……")
```
2. In this test, each replica test only have 1 member


