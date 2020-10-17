#!/bin/sh

NAME="lexonomy:latest"
VERSION="$(git rev-parse HEAD)"

docker build --build-arg VER="$VERSION" -t "$NAME" .
