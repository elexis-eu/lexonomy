#!/bin/sh

NAME="lexonomy:latest"
DATE="$(git log | head -n 3 | grep Date | cut -d ' ' -f '6,5,8' | tr ' ' .)"
VERSION="$DATE:$(git rev-parse HEAD)"

docker build --build-arg VER="$VERSION" -t "$NAME" .

