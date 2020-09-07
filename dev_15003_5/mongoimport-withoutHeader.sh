#!/bin/bash

FILE_DIR=$1/*.csv

for file in $FILE_DIR; do
	 
tail -n +2 ${file} | mongoimport --db=tpc_poc \
		--collection=dev_15003_5 \
		--type=csv \
		--host=10.106.51.152 \
		--port=27017 \
		--columnsHaveTypes \
		--fields "timestamp.date(2006-01-02T15:04:05.999999999Z),branchCode.string(),sdp.string(),customerId.string(),meterId.string(),readingType.string(),displayCode.string(),measurement.double(),multiplier.int32(),quality.string(),qualityReason.string(),veeStatus.string(),veeFlag.string(),messageId.string(),receivedTime.string(),saveTime.string(),editor.string(),reviewer.string(),version.int32()"
done

