#!/usr/bin/env bash
binary="portainer-$1-$2"
mkdir -p dist
tmp=$3
#export GOPATH=$GOPATH:/upload/portainer
export GOPATH=$GOPATH:$tmp
mkdir -p $tmp/src/portainer
cp -r api/** src/portainer
cd src
GOOS=$1 GOARCH=$2 go build -o portainer/cmd/portainer/$binary portainer/cmd/portainer
pwd
cd ..
mv src/portainer/cmd/portainer/$binary dist/

rm -rf src