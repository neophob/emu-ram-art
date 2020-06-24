#!/bin/bash
FILES=./rom/*

nvm use 10

for f in $FILES
do
  echo "Processing $f file..."
  ROMFILE="$f" node lib/dmdripper/index.js&
done
