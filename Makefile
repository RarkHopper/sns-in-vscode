.PHONY: install lint format typecheck test build check ext-install ext-package

VSIX := apps/vscode-extension/dist/sns-in-vscode.vsix

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
	corepack pnpm build

check:
	corepack pnpm check

ext-package: build
	corepack pnpm --filter sns-in-vscode exec vsce package --no-dependencies --allow-missing-repository --out dist/sns-in-vscode.vsix

ext-install: ext-package
	code --install-extension $(VSIX)
