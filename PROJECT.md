# Project: Glak Apart Next.js Dockerization & Cleanup

## Architecture
- Next.js application using Node.js alpine inside Docker.
- Port 3000 maps to development container (`npm run dev` with hot-reloading via volume mount).
- Port 3001 maps to production container (standalone output).
- Legacy directory cleanup in the parent folder `C:\Users\thiag\Desktop\Files\Projects\Glak Apart`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Test Suite | Create opaque-box E2E tests for docker, ports, package scripts, and directory cleanup | None | IN_PROGRESS (827384e3-880c-420f-aa20-59f13c33091c) |
| 2 | Docker Setup | Multi-stage Dockerfile, .dockerignore, docker-compose files | M1 | IN_PROGRESS (8c55b0a7-2c71-436b-bff8-27c34e5f16ab) |
| 3 | Package Scripts | docker:dev, docker:prod, docker:down in package.json | M2 | IN_PROGRESS (8c55b0a7-2c71-436b-bff8-27c34e5f16ab) |
| 4 | Legacy Cleanup | Delete specified old project directories from parent directory | None | IN_PROGRESS (8c55b0a7-2c71-436b-bff8-27c34e5f16ab) |
| 5 | E2E & Audit Gate | Run full test suite, coverage check, and Forensic Audit | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
- Next.js standalone mode config: `next.config.js` should have `output: 'standalone'`.
- Docker Compose services named `app` (or similar) mapping ports correctly.
