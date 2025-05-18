#!/bin/sh
npm i
sh fix-permissions.sh
npm run setup
mkdir -p tmp
export TMPDIR="$(pwd)/tmp"
npm run quickstart
