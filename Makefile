.PHONY: install lint format typecheck test build check dev post agent-run agent-start clean

install:
	corepack pnpm install

lint:
	corepack pnpm lint

format:
	corepack pnpm format

typecheck:
	corepack pnpm typecheck

test:
	corepack pnpm test

build:
	corepack pnpm --filter @sns-in-vscode/db run build
	corepack pnpm --filter @sns-in-vscode/domain run build
	corepack pnpm --filter @sns-in-vscode/tui run build

check:
	corepack pnpm check

dev:
	corepack pnpm --filter @sns-in-vscode/tui dev

post:
	@if [ -z "$(TEXT)" ]; then echo "Usage: make post TEXT='your post'"; exit 1; fi
	corepack pnpm --filter @sns-in-vscode/cli dev post "$(TEXT)"

agent-run:
	corepack pnpm --filter @sns-in-vscode/agent dev run

agent-start:
	corepack pnpm --filter @sns-in-vscode/agent dev start

clean:
	rm -f ~/.sns-in-vscode/sns.db
	@echo "DB removed: ~/.sns-in-vscode/sns.db"
