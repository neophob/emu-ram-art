#!/bin/bash
FILES=/Users/michaelvogt/Downloads/NES_655_ROMS/NES_655_ROMS/*

nvm use 10

processed=0

for f in $FILES
do
  echo "Processing $f file... $processed"
  node ../lib/dump-nes/index.js "$f"&

  processed=$((processed + 1))
  count=$(($processed%64))
  if [ "$count" = "63" ]; then
    echo "wait.."
    wait
  fi

done
