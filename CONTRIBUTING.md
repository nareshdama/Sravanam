# Contributing

1. Read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for environment setup and the **before push** checklist.  
2. Run **`npm run check`** before opening a PR; run **`npm run test:e2e`** when you change navigation, audio, or immersive behavior. Release candidates must follow [docs/RELEASE_QA.md](docs/RELEASE_QA.md). Major product or architecture changes should also use [docs/PRODUCT_ARCH_QA.md](docs/PRODUCT_ARCH_QA.md).  
3. User-facing changes should be reflected in [docs/USER_GUIDE.md](docs/USER_GUIDE.md) when behavior changes.  
4. Keep React isolated to the landing/global visualization layer unless the product direction explicitly changes.  
5. Scope boundaries (no backend in v1, no framework spread into the main app shell, etc.) are summarized in [REBUILD-PLAN.md](REBUILD-PLAN.md) Part 8.
