# CLAUDE.md — AI Assistant Guide for laolliuvps

## Project Overview

**laolliuvps** is a minimal repository. It currently contains no application source code, build systems, or configuration files. The repository serves as a placeholder/template potentially intended for VPS (Virtual Private Server) infrastructure management.

## Repository Structure

```
laolliuvps/
├── CLAUDE.md       # This file — AI assistant guidance
└── README.md       # Project readme (minimal)
```

There are no source code files, dependencies, build tools, or test suites.

## Git Conventions

- **Default branch:** `main` (remote) / `master` (local)
- **Feature branches:** Use `claude/` prefix for AI-generated branches
- Keep commit messages clear and descriptive
- Do not force-push or rewrite published history

## Security Notes

- **Do not add workflow files** (`.github/workflows/`) that contain SSH keys, passwords, or other secrets — even via GitHub Actions secrets references — without explicit owner authorization.
- Previously added VPS-related workflows were removed as unauthorized. Any infrastructure or deployment automation must be explicitly requested and approved.
- Never commit credentials, tokens, API keys, or private keys to the repository.

## Development Guidelines

Since this is a minimal repository, follow these conventions if adding code in the future:

1. **Discuss scope first** — Confirm with the repository owner before adding new files, workflows, or configuration.
2. **Keep it simple** — Only add what is explicitly requested.
3. **Document changes** — Update this file and README.md when the project structure changes significantly.

## Commands

No build, test, lint, or run commands exist for this repository. If tooling is added in the future, document the commands here:

```
# (none currently)
```
