# Chai Chat App Server

React frontend for the Chai chat app

# Running

## Locally

#### Install Dependencies

```bash
$ npm install
```

#### Start Database

```sh
$ make up-db-dev
```

#### Compile Build

Compile TypeScript files to JavaScript files.

```bash
$ npm run build
```

#### Run Build

Run compiled JavaScript files.

```bash
$ npm run start
```

#### Run Typescript

Run TypeScript without compilation.

```bash
$ npm run local
```

#### Watch

Run Typescript without compilation, watch for file changes, and restart the server when they are detected.

```bash
$ npm run dev
```

#### Setup Tools

```sh
$ lefthook install
```

## Docker Compose

#### Watch

```sh
$ npm install
$ make up
```

# Features

## Tools

- VS Code
- GitHub
- Type checking with `TypeScript`
- Environmental variables with `dotenv`
- Formatting with `Prettier`
- Linting with `ESLint`
- Package validation with `npm audit`
- Branch name validation with `validate-branch-name`
- Secret scanner for commits with `Gitleaks`
- Commit message linting with `commitlint`
- Commit hooks with `lefthook`

## Frontend

- Built with `Vite`, `React`, and `TypeScript`
- Styling with `Tailwind`
- Components with `DaisyUI`
- Routing with `Tanstack Router`
- State management with `Tanstack Query` and `Tanstack Store`
- Forms with `Tanstack Forms` and `Zod`
- Unit testing with `Vitest`
- End-to-end testing with `Playwright`

## Hosting (Local)

- Containerisation with `Docker Compose`

## Hosting (Production)

- CI/CD with GitHub Actions [TODO]
- AWS Cloudfront, API Gateway, ECS (Fargate), RDS, S3, Terraform [TODO]

## TODO

- JWT refresh tokens
- Webhooks
- Unit tests
- End-to-end tests
- Build and run as prod
- Dockerise
- Deploy to prod
