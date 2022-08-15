install:
				npm ci

publish:
				npm publish --dry-run

lint:
				npx eslint bin/** src/** __tests__/**
