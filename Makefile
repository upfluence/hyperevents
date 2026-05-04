.PHONY: all clear install echo start clean re tests testserver enable_pre_hook disable_pre_hook help h version_patch version_minor version_major upfluence sonar-report

.EXPORT_ALL_VARIABLES:

SHELL := /bin/bash

all:	clear upfluence echo start

clear:
	@clear

install: ## Install dependencies
	@echo 'Installing dependencies'
	pnpm install
	@echo ""; echo "\n-------------------------------\n"; echo ""

echo:
	@echo Starting Hyperevents test app

start: ## Starts the dev server
	pnpm start

clean: ## Cleans ./node_modules && ./dist
	@echo "Cleaning up node_modules folders and generated outputs"
	-rm -rf ./node_modules
	-rm -rf ./packages/hyperevents/node_modules
	-rm -rf ./packages/test-app/node_modules
	-rm -rf ./packages/hyperevents/dist
	-rm -rf ./packages/hyperevents/declarations
	-rm -rf ./packages/test-app/dist
	-rm -rf ./packages/test-app/tmp
	-rm -rf ./packages/test-app/coverage
	-rm -rf ./coverage
	@echo ""; echo "-------------------------------"; echo ""

re:	clean install echo start ## Reinstalls dependencies & starts the dev server

tests: ## Runs tests once
	@echo "Running tests once"
	pnpm --filter test-app exec ember test --silent -r dot

testserver: ## Runs the test server
	@echo "Starting Test Server"
	pnpm --filter test-app exec ember test -s

enable_pre_hook: ## Enables git pre-hook on the project. Will run Linter & Tests before pushing.
	@echo "Installing git pre-push hook"
	@echo ""; echo "-------------------------------"; echo ""
	cp ./scripts/pre-push ./.git/hooks/pre-push
	chmod +x ./.git/hooks/pre-push

disable_pre_hook: ## Disables the git pre-push hook.
	@echo "Removing git pre-push hook"
	@echo ""; echo "-------------------------------"; echo ""
	rm -f ./.git/hooks/pre-push

help: ## Displays the help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

h: help ## Displays the help message

version_patch: ## Creates a new patch release
	pnpm release-it patch

version_minor: ## Creates a new minor release
	pnpm release-it minor

version_major: ## Creates a new major release
	pnpm release-it major

upfluence: ## Displays the UPF logo :)
	@sh ./scripts/upf_logo
	@echo ""
	@echo ""

sonar-report: ## Runs a bunch of commands that will finally lead to a new report in sonarqube
	./scripts/generate_sonar_report
