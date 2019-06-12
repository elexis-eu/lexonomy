# Convenience TARGETS for bootstrapping a docker-ised dev environment.
#
# - docker-dev: (prepare everything and) run the dev container
# - docker-lint: run the linter
#
# - docker-setup: prepare the docker-local volume that will store the node_modules
# - docker-install: (mostly) run `npm install`

.DEFAULT_GOAL := docker-dev

.PHONY: docker-dev
docker-dev: docker-install
	docker-compose run --rm --service-ports dev

.PHONY: docker-lint
docker-lint: docker-quick-install
	docker-compose run --rm dev npm run lint

# prep targets
#
.PHONY: docker-setup
docker-setup:
	docker volume create nodemodules

.PHONY: docker-install docker-quick-install
docker-install: docker-setup
	docker-compose run --rm dev npm install --unsafe-perm=true
	docker-compose run --rm dev pip install -r requirements.txt
docker-quick-install: docker-setup
	docker-compose run --rm dev npm install --unsafe-perm=true --ignore-scripts
	docker-compose run --rm dev pip install -r requirements-dev.txt

.PHONY: docker-clean
docker-clean:
	-docker volume rm nodemodules
