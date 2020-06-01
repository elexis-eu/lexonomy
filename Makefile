# TARGETS for devs:
# - docker-dev: (prepare everything and) run the dev container
# - docker-lint: run the linter
#
# Update CHANGELOG.md
#   $ GITHUB_TOKEN=INSERT_TOKEN_HERE make CHANGELOG.md
#
# Helper TARGETS:
# - docker-setup: prepare the docker-local volume that will store the node_modules
# - docker-install: (mostly) run `npm install`
#

CHANGELOG_TOKEN := $(if $(GITHUB_TOKEN),--token $(GITHUB_TOKEN),$(""))

.DEFAULT_GOAL := docker-dev

.PHONY: docker-dev
docker-dev: docker-install
	docker-compose -f docker-compose-dev.yml run --rm --service-ports dev

.PHONY: docker-lint
docker-lint: docker-quick-install
	docker-compose -f docker-compose-dev.yml run --rm dev npm run lint

.PHONY: CHANGELOG.md
CHANGELOG.md:
	echo $(CHANGELOG_TOKEN)
	docker-compose -f docker-compose-dev.yml run --rm changelog --user elexis-eu --project lexonomy $(CHANGELOG_TOKEN)

# prep targets
#
.PHONY: docker-setup
docker-setup:
	docker volume create nodemodules

.PHONY: docker-install docker-quick-install
docker-install: docker-setup
	docker-compose -f docker-compose-dev.yml run --rm dev npm install --unsafe-perm=true
	docker-compose -f docker-compose-dev.yml run --rm dev pip install -r requirements.txt
docker-quick-install: docker-setup
	docker-compose -f docker-compose-dev.yml run --rm dev npm install --unsafe-perm=true --ignore-scripts
	docker-compose -f docker-compose-dev.yml run --rm dev pip install -r requirements-dev.txt

.PHONY: docker-clean
docker-clean:
	-docker volume rm nodemodules
