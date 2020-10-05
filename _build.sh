#!/bin/bash
FILES=./dump*.json
for f in $FILES
do
  echo "Processing $f file..."
  node lib/visualise/index.js "$f" a3dpi1200&
  node lib/visualise/index.js "$f" a3dpi1200_10s&
  node lib/visualise/index.js "$f" a3dpi1200_short&
  wait
done
