#!/bin/sh

pkRoot=`pwd`

rm -rf cfgDb/
#DEBUG=cfg PKROOT=$pkRoot node test.js
PKROOT=$pkRoot node test.js
