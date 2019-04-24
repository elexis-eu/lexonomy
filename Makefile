.DEFAULT_GOAL := dev

dev: setup install
	docker-compose run --rm --service-ports dev

setup:
	docker volume create nodemodules

install:
	docker-compose run --rm install
