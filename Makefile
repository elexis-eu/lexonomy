.DEFAULT_GOAL := dev

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
