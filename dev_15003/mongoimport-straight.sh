#!/bin/bash

FILE_DIR=$1/*.csv

for file in $FILE_DIR; do
	mongoimport --db=tpc_poc \
	--collection=dev_15003 \
	--file=${file} \
	--type=csv \
	--host=10.106.51.152 \
	--port=27017 \
	--headerline
done

