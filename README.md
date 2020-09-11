TPCxMongoDB
===
Use mock date from Taiwan Power Company and get familiar with MongoDB


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
  ```shell
  [mongodb-org-4.4]
  name=MongoDB Repository
  baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/4.4/x86_64/
  gpgcheck=1
  enabled=1
  gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc
  ```
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
Please refer to conf/mongos.conf for samples

### Environment Set-up:
#### update GNU C Library
``` shell
yum update glibc
```
#### avoid swap as possible as system can
```shell
echo vm.swappiness = 1 >> /etc/sysctl.conf
```
```shell
sysctl -p
```
#### disable secure Linux and fire wall
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
#### disable THP(transparent huge page)
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
transparent_hugepage=never
```
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

#### Configure NUMA: -- interleave and start mongod and mongos with ```numactl```
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
If it is ``` init```, Please refer to ['Configure NUMA on Linux' part for other tutorial](https://docs.mongodb.com/manual/administration/production-notes/#Configuring%20NUMA%20on%20Linux)
#### establish a new service file
``` shell
sudo cp /lib/systemd/system/mongod.service /etc/systemd/system
```
#### install ```numactl```
``` shell
sudo yum -y install numactl
```

