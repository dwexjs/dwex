## 1.0.1 (2025-11-07)

### 🚀 Features

- **examples:** update email module to use registerProcessors ([f89b041](https://github.com/dwexjs/dwex/commit/f89b041))

### 🩹 Fixes

- **core,bullmq:** eagerly instantiate DynamicModule providers and BullMQ workers ([4cb7d12](https://github.com/dwexjs/dwex/commit/4cb7d12))

### ❤️ Thank You

- Claude
- mxvsh

# 1.0.0 (2025-11-07)

### 🚀 Features

- init ([5b780e8](https://github.com/dwexjs/dwex/commit/5b780e8))
- setup common package ([0f0080c](https://github.com/dwexjs/dwex/commit/0f0080c))
- init core package ([f0d7a95](https://github.com/dwexjs/dwex/commit/f0d7a95))
- add test cases for core ([997c6e2](https://github.com/dwexjs/dwex/commit/997c6e2))
- add logger package ([db6792e](https://github.com/dwexjs/dwex/commit/db6792e))
- add logger to core ([7aa1617](https://github.com/dwexjs/dwex/commit/7aa1617))
- add jwt package ([44b5607](https://github.com/dwexjs/dwex/commit/44b5607))
- create-dwex cli ([a317caf](https://github.com/dwexjs/dwex/commit/a317caf))
- update example to include auth routes ([f9ad982](https://github.com/dwexjs/dwex/commit/f9ad982))
- update logger format and add banner ([d3d1054](https://github.com/dwexjs/dwex/commit/d3d1054))
- add docs ([1d980a3](https://github.com/dwexjs/dwex/commit/1d980a3))
- design landing page ([cbb5063](https://github.com/dwexjs/dwex/commit/cbb5063))
- add support for openapi docs ([04fa211](https://github.com/dwexjs/dwex/commit/04fa211))
- add HTTPS configuration support ([7127055](https://github.com/dwexjs/dwex/commit/7127055))
- add analytics script to layout for enhanced tracking ([4bc3583](https://github.com/dwexjs/dwex/commit/4bc3583))
- log application startup time in milliseconds or microseconds ([2670559](https://github.com/dwexjs/dwex/commit/2670559))
- add database support with Drizzle and Prisma, implement OnModuleInit lifecycle hook, and create comprehensive database documentation ([db3abb6](https://github.com/dwexjs/dwex/commit/db3abb6))
- implement full module encapsulation with exports/imports enforcement ([c3a6b79](https://github.com/dwexjs/dwex/commit/c3a6b79))
- support returning Response objects from controllers ([9706182](https://github.com/dwexjs/dwex/commit/9706182))
- migrate Drizzle ORM template from SQLite to PostgreSQL ([432ae95](https://github.com/dwexjs/dwex/commit/432ae95))
- add BullMQ integration package for Redis-based queue management ([de77fab](https://github.com/dwexjs/dwex/commit/de77fab))
- add pipe transformation and validation system ([35f42b0](https://github.com/dwexjs/dwex/commit/35f42b0))
- **ai:** introduce @dwex/ai package with Model Context Protocol integration, including core services, configuration, and documentation ([63b37b6](https://github.com/dwexjs/dwex/commit/63b37b6))
- **ai:** add MCP config generation for AI assistants ([b074fa0](https://github.com/dwexjs/dwex/commit/b074fa0))
- **ai:** convert MCP tool responses from JSON to CSV for lower token usage ([14a1705](https://github.com/dwexjs/dwex/commit/14a1705))
- **basic-example:** add @dwex/cli dependency and update project structure by removing unused application files ([19c7db2](https://github.com/dwexjs/dwex/commit/19c7db2))
- **cli:** implement build, dev, and generate commands with interactive ([#3](https://github.com/dwexjs/dwex/pull/3))
- **cli:** enhance CLI with interactive and non-interactive modes, add validation for project name and features ([bc7e4ac](https://github.com/dwexjs/dwex/commit/bc7e4ac))
- **cli:** add support for AI agent configurations ([89e08e4](https://github.com/dwexjs/dwex/commit/89e08e4))
- **cli:** add update command to CLI interface ([70c84db](https://github.com/dwexjs/dwex/commit/70c84db))
- **create-dwex:** add composable feature system with auth-jwt and openapi features ([c535cc0](https://github.com/dwexjs/dwex/commit/c535cc0))
- **create-dwex:** show version during project creation ([dc01546](https://github.com/dwexjs/dwex/commit/dc01546))
- **create-dwex:** add next steps message with cd and bun run dev instructions after project creation ([5a5c914](https://github.com/dwexjs/dwex/commit/5a5c914))
- **docs:** add rewrites for MDX documentation and enhance page layout with copy button and view options ([0152683](https://github.com/dwexjs/dwex/commit/0152683))
- **examples:** add BullMQ email queue example with Redis integration ([68cbe72](https://github.com/dwexjs/dwex/commit/68cbe72))
- **examples:** add products controller demonstrating pipe usage ([1c6c7bc](https://github.com/dwexjs/dwex/commit/1c6c7bc))
- **logger:** refactor to support log level colors ([c70d722](https://github.com/dwexjs/dwex/commit/c70d722))
- **mdx:** integrate AIQuickStart component and remove deprecated LLM routes ([23c8ee1](https://github.com/dwexjs/dwex/commit/23c8ee1))
- **mdx:** add TabsComponents to MDX components and enhance AIQuickStart instructions for clarity ([a56d271](https://github.com/dwexjs/dwex/commit/a56d271))
- **template:** support ejs ext. file ([ba6afc0](https://github.com/dwexjs/dwex/commit/ba6afc0))

### 🩹 Fixes

- add a metatype field to the InstanceWrapper interface ([e2415ab](https://github.com/dwexjs/dwex/commit/e2415ab))
- remove references from template tsconfig ([1b2be4d](https://github.com/dwexjs/dwex/commit/1b2be4d))
- rename template file to .ejs ([cde9720](https://github.com/dwexjs/dwex/commit/cde9720))
- jwt module reigstration ([0b4a0f5](https://github.com/dwexjs/dwex/commit/0b4a0f5))
- update template sytanx and use ejs ext. ([9d1100a](https://github.com/dwexjs/dwex/commit/9d1100a))
- correct package.json path in DwexApplication ([866d3f1](https://github.com/dwexjs/dwex/commit/866d3f1))
- correct code block syntax for .gitignore in quick-start-https documentation ([d603ead](https://github.com/dwexjs/dwex/commit/d603ead))
- update biome version to latest ([cff3191](https://github.com/dwexjs/dwex/commit/cff3191))
- resolve module encapsulation test failures ([3913968](https://github.com/dwexjs/dwex/commit/3913968))
- **ai-quick-start:** update project creation command to include auth-jwt and openapi features ([afdaec3](https://github.com/dwexjs/dwex/commit/afdaec3))
- **ai-quick-start:** correct project creation command syntax for consistency ([42fd087](https://github.com/dwexjs/dwex/commit/42fd087))
- **cli:** update default entry point in configuration to "index.ts" and remove unused getSourceDir function ([dada214](https://github.com/dwexjs/dwex/commit/dada214))
- **cli:** enhance minification options in bundler to improve logging and control ([64aea4a](https://github.com/dwexjs/dwex/commit/64aea4a))
- **cli:** update README to reflect new entry point and project structure ([3a598d7](https://github.com/dwexjs/dwex/commit/3a598d7))
- **cli:** update default entry point and module path resolution in configuration ([8bf01b4](https://github.com/dwexjs/dwex/commit/8bf01b4))
- **cli:** remove stdout and stderr inheritance from Bun install process ([d8dc85c](https://github.com/dwexjs/dwex/commit/d8dc85c))
- **cli:** suppress stdout and stderr for Bun install and format processes ([e027127](https://github.com/dwexjs/dwex/commit/e027127))
- **create-dwex:** process feature.json files through EJS to render version placeholders ([556ff07](https://github.com/dwexjs/dwex/commit/556ff07))
- **create-dwex:** ensure .gitignore is created before git init and hide git output ([580623f](https://github.com/dwexjs/dwex/commit/580623f))
- **docs:** update layout for documentation page to improve responsiveness ([f31be66](https://github.com/dwexjs/dwex/commit/f31be66))
- **dwex-application:** update package.json path resolution to use core package ([6176067](https://github.com/dwexjs/dwex/commit/6176067))
- **layout:** conditionally load analytics script in production environment to optimize performance ([b1b8c88](https://github.com/dwexjs/dwex/commit/b1b8c88))
- **llm:** update parameter type in GET function to use 'any' for slug handling ([0101696](https://github.com/dwexjs/dwex/commit/0101696))
- **llm:** correct URL path in GET function for LLM pages ([85d5c44](https://github.com/dwexjs/dwex/commit/85d5c44))

### ❤️ Thank You

- Claude
- Monawwar Abdullah
- mxvsh

## 1.0.0-beta.21 (2025-11-07)

### 🚀 Features

- migrate Drizzle ORM template from SQLite to PostgreSQL ([432ae95](https://github.com/dwexjs/dwex/commit/432ae95))
- add BullMQ integration package for Redis-based queue management ([de77fab](https://github.com/dwexjs/dwex/commit/de77fab))
- **examples:** add BullMQ email queue example with Redis integration ([68cbe72](https://github.com/dwexjs/dwex/commit/68cbe72))

### ❤️ Thank You

- Claude
- mxvsh

## 1.0.0-beta.19 (2025-11-06)

### 🚀 Features

- support returning Response objects from controllers ([9706182](https://github.com/dwexjs/dwex/commit/9706182))

### 🩹 Fixes

- resolve module encapsulation test failures ([3913968](https://github.com/dwexjs/dwex/commit/3913968))

### ❤️ Thank You

- Claude
- mxvsh

## 1.0.0-beta.18 (2025-11-05)

### 🚀 Features

- implement full module encapsulation with exports/imports enforcement ([c3a6b79](https://github.com/dwexjs/dwex/commit/c3a6b79))

### ❤️ Thank You

- Claude
- mxvsh

## 1.0.0-beta.17 (2025-11-05)

### 🚀 Features

- add database support with Drizzle and Prisma, implement OnModuleInit lifecycle hook, and create comprehensive database documentation ([db3abb6](https://github.com/dwexjs/dwex/commit/db3abb6))
- **cli:** add update command to CLI interface ([70c84db](https://github.com/dwexjs/dwex/commit/70c84db))
- **create-dwex:** add next steps message with cd and bun run dev instructions after project creation ([5a5c914](https://github.com/dwexjs/dwex/commit/5a5c914))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.16 (2025-10-31)

### 🚀 Features

- **ai:** convert MCP tool responses from JSON to CSV for lower token usage ([14a1705](https://github.com/dwexjs/dwex/commit/14a1705))

### 🩹 Fixes

- **create-dwex:** ensure .gitignore is created before git init and hide git output ([580623f](https://github.com/dwexjs/dwex/commit/580623f))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.15 (2025-10-31)

### 🚀 Features

- **ai:** add MCP config generation for AI assistants ([b074fa0](https://github.com/dwexjs/dwex/commit/b074fa0))
- **cli:** add support for AI agent configurations ([89e08e4](https://github.com/dwexjs/dwex/commit/89e08e4))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.14 (2025-10-30)

### 🚀 Features

- **ai:** introduce @dwex/ai package with Model Context Protocol integration, including core services, configuration, and documentation ([63b37b6](https://github.com/dwexjs/dwex/commit/63b37b6))
- **docs:** add rewrites for MDX documentation and enhance page layout with copy button and view options ([0152683](https://github.com/dwexjs/dwex/commit/0152683))
- **mdx:** integrate AIQuickStart component and remove deprecated LLM routes ([23c8ee1](https://github.com/dwexjs/dwex/commit/23c8ee1))
- **mdx:** add TabsComponents to MDX components and enhance AIQuickStart instructions for clarity ([a56d271](https://github.com/dwexjs/dwex/commit/a56d271))

### 🩹 Fixes

- **ai-quick-start:** update project creation command to include auth-jwt and openapi features ([afdaec3](https://github.com/dwexjs/dwex/commit/afdaec3))
- **ai-quick-start:** correct project creation command syntax for consistency ([42fd087](https://github.com/dwexjs/dwex/commit/42fd087))
- **docs:** update layout for documentation page to improve responsiveness ([f31be66](https://github.com/dwexjs/dwex/commit/f31be66))
- **llm:** update parameter type in GET function to use 'any' for slug handling ([0101696](https://github.com/dwexjs/dwex/commit/0101696))
- **llm:** correct URL path in GET function for LLM pages ([85d5c44](https://github.com/dwexjs/dwex/commit/85d5c44))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.13 (2025-10-29)

### 🚀 Features

- **cli:** enhance CLI with interactive and non-interactive modes, add validation for project name and features ([bc7e4ac](https://github.com/dwexjs/dwex/commit/bc7e4ac))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.12 (2025-10-29)

### 🩹 Fixes

- **cli:** suppress stdout and stderr for Bun install and format processes ([e027127](https://github.com/dwexjs/dwex/commit/e027127))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.11 (2025-10-29)

### 🩹 Fixes

- **cli:** remove stdout and stderr inheritance from Bun install process ([d8dc85c](https://github.com/dwexjs/dwex/commit/d8dc85c))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.10 (2025-10-29)

This was a version bump only, there were no code changes.

## 1.0.0-beta.9 (2025-10-29)

### 🚀 Features

- log application startup time in milliseconds or microseconds ([2670559](https://github.com/dwexjs/dwex/commit/2670559))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.8 (2025-10-29)

### 🚀 Features

- **create-dwex:** show version during project creation ([dc01546](https://github.com/dwexjs/dwex/commit/dc01546))

### 🩹 Fixes

- **layout:** conditionally load analytics script in production environment to optimize performance ([b1b8c88](https://github.com/dwexjs/dwex/commit/b1b8c88))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.7 (2025-10-27)

### 🚀 Features

- **basic-example:** add @dwex/cli dependency and update project structure by removing unused application files ([19c7db2](https://github.com/dwexjs/dwex/commit/19c7db2))
- **cli:** implement build, dev, and generate commands with interactive ([#3](https://github.com/dwexjs/dwex/pull/3))

### 🩹 Fixes

- **cli:** update default entry point in configuration to "index.ts" and remove unused getSourceDir function ([dada214](https://github.com/dwexjs/dwex/commit/dada214))
- **cli:** enhance minification options in bundler to improve logging and control ([64aea4a](https://github.com/dwexjs/dwex/commit/64aea4a))
- **cli:** update README to reflect new entry point and project structure ([3a598d7](https://github.com/dwexjs/dwex/commit/3a598d7))
- **cli:** update default entry point and module path resolution in configuration ([8bf01b4](https://github.com/dwexjs/dwex/commit/8bf01b4))
- **dwex-application:** update package.json path resolution to use core package ([6176067](https://github.com/dwexjs/dwex/commit/6176067))

### ❤️ Thank You

- Monawwar Abdullah
- mxvsh

## 1.0.0-beta.6 (2025-10-27)

### 🚀 Features

- add HTTPS configuration support ([7127055](https://github.com/dwexjs/dwex/commit/7127055))
- add analytics script to layout for enhanced tracking ([4bc3583](https://github.com/dwexjs/dwex/commit/4bc3583))

### 🩹 Fixes

- correct code block syntax for .gitignore in quick-start-https documentation ([d603ead](https://github.com/dwexjs/dwex/commit/d603ead))
- update biome version to latest ([cff3191](https://github.com/dwexjs/dwex/commit/cff3191))
- **create-dwex:** process feature.json files through EJS to render version placeholders ([556ff07](https://github.com/dwexjs/dwex/commit/556ff07))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.5 (2025-10-26)

### 🚀 Features

- **create-dwex:** add composable feature system with auth-jwt and openapi features ([c535cc0](https://github.com/dwexjs/dwex/commit/c535cc0))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.4 (2025-10-26)

### 🚀 Features

- add support for openapi docs ([04fa211](https://github.com/dwexjs/dwex/commit/04fa211))

### 🩹 Fixes

- correct package.json path in DwexApplication ([866d3f1](https://github.com/dwexjs/dwex/commit/866d3f1))

### ❤️ Thank You

- mxvsh

## 1.0.0-beta.3 (2025-10-26)

This was a version bump only, there were no code changes.

## 1.0.0-beta.2 (2025-10-26)

This was a version bump only, there were no code changes.

## 1.0.0-beta.1 (2025-10-26)

### 🚀 Features

- init ([5b780e8](https://github.com/dwexjs/dwex/commit/5b780e8))
- setup common package ([0f0080c](https://github.com/dwexjs/dwex/commit/0f0080c))
- init core package ([f0d7a95](https://github.com/dwexjs/dwex/commit/f0d7a95))
- add test cases for core ([997c6e2](https://github.com/dwexjs/dwex/commit/997c6e2))
- add logger package ([db6792e](https://github.com/dwexjs/dwex/commit/db6792e))
- add logger to core ([7aa1617](https://github.com/dwexjs/dwex/commit/7aa1617))
- add jwt package ([44b5607](https://github.com/dwexjs/dwex/commit/44b5607))
- create-dwex cli ([a317caf](https://github.com/dwexjs/dwex/commit/a317caf))
- update example to include auth routes ([f9ad982](https://github.com/dwexjs/dwex/commit/f9ad982))
- update logger format and add banner ([d3d1054](https://github.com/dwexjs/dwex/commit/d3d1054))
- add docs ([1d980a3](https://github.com/dwexjs/dwex/commit/1d980a3))
- design landing page ([cbb5063](https://github.com/dwexjs/dwex/commit/cbb5063))
- **logger:** refactor to support log level colors ([c70d722](https://github.com/dwexjs/dwex/commit/c70d722))
- **template:** support ejs ext. file ([ba6afc0](https://github.com/dwexjs/dwex/commit/ba6afc0))

### 🩹 Fixes

- add a metatype field to the InstanceWrapper interface ([e2415ab](https://github.com/dwexjs/dwex/commit/e2415ab))
- remove references from template tsconfig ([1b2be4d](https://github.com/dwexjs/dwex/commit/1b2be4d))
- rename template file to .ejs ([cde9720](https://github.com/dwexjs/dwex/commit/cde9720))
- jwt module reigstration ([0b4a0f5](https://github.com/dwexjs/dwex/commit/0b4a0f5))
- update template sytanx and use ejs ext. ([9d1100a](https://github.com/dwexjs/dwex/commit/9d1100a))

### ❤️ Thank You

- mxvsh