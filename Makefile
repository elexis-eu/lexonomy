# Convenience TARGETS for bootstrapping a docker-ised dev environment.
#
# - docker-dev: prepare everything and run the container
# - docker-setup: prepare the docker-local volume that will store the node_modules
# - docker-install: (mostly) run `npm install`

.DEFAULT_GOAL := docker-dev

.PHONY: docker-dev
docker-dev: docker-setup docker-install
	docker-compose run --rm --service-ports dev

.PHONY: docker-setup
docker-setup:
	docker volume create nodemodules

.PHONY: docker-install
docker-install:
	docker-compose run --rm install
