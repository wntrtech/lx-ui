# Development Guide

<!-- TOC -->

- [Development Guide](#development-guide)
  - [Requirements](#requirements)
  - [Setup](#setup)
  - [Development](#development)
  - [Trivy scan with docker](#trivy-scan-with-docker)
    - [Filesystem vulnerabilities scan](#filesystem-vulnerabilities-scan)

<!-- /TOC -->

## Requirements

- [Node.js](https://nodejs.org/en/download/)
- [Pnpm](https://pnpm.io/installation)
- [Git](https://git-scm.com/downloads)
- [VSCode](https://code.visualstudio.com/download)

## Setup

1. Clone **[lx/ui](https://github.com/wntrtech/lx-ui)** repository
2. Run `pnpm install` to install all dependencies
3. Run `pnpm build` to build the package

## Development

Use [`pnpm link`](https://pnpm.io/cli/link) in your project to check your changes before pushing.

## Trivy scan with docker

In order to scan docker image with trivy you must have docker installed. This is useful when debugging CI/CD pipeline.

### Filesystem vulnerabilities scan

High and critical vulnerabilities:

```bash
docker run --rm -v .:/var/ aquasec/trivy:latest fs --exit-code 1 --skip-dirs node_modules --severity HIGH,CRITICAL /var
```

Unknown, low, medium vulnerabilities:

```bash
docker run --rm -v .:/var/ aquasec/trivy:latest fs --exit-code 0 --skip-dirs node_modules --severity UNKNOWN,LOW,MEDIUM /var
```
