#!/bin/bash
FILES=./dump*.json
for f in $FILES
do
  echo "Processing $f file..."
  node lib/visualise/index.js "$f"
done
