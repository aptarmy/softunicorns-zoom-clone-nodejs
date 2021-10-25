#!/bin/bash

docker run --rm -d --name zoom-clone-postgres \
	-e POSTGRES_PASSWORD=password \
	-e POSTGRES_DB=zoom_clone \
	-v $(pwd)/postgres_data:/var/lib/postgresql/data \
	-p 5432:5432 \
	postgres