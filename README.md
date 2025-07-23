# as-help-center-oidc-client

1. [What is?](#what-is)
2. [Architecture](#architecture)
   - [Main technologies used](#main-technologies-used)
3. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
   - [Configuration](#configuration)
   - [Run the application](#run-the-application)
   - [Available scripts](#available-scripts)

## What is?
This project implements an OpenID Connect (OIDC) client to handle authentication and authorization between the [PagoPA Help Center (CAC)](https://github.com/pagopa/as-help-center) and [One Identity](https://github.com/pagopa/oneidentity).

## Architecture

![architecture](docs/architecture/architecture.png)
\
<br/>
![sequence](docs/architecture/sequence_diagram.svg)

### Main technologies used
- Express
- Typescript
- Dotenv
- AWS
- Github Actions
- Terraform

## Getting started

### Prerequisites

- Node and npm (the node version is stored in the `.nvmrc` file, we recommend to use [nvm](https://github.com/nvm-sh/nvm) to quickly install and use different versions of node)

### Installation

1. Clone the repository:
   ```bash
   git clone <REPOSITORY_URL>
   ```
2. Install and use node version defined in the .nvmrc file:
   ```bash
   nvm install && nvm use
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. Create a `.env` file in the root of the project. You can duplicate the `.env.example` and rename it to `.env`.
2. Fill in the `.env` file with the required environment variables.

### Run the application

To run in development mode (local):

```bash
npm run dev
```

To compile and run in production mode:

```bash
npm run build
npm start
```

### Available scripts

- `npm run build`: Compiles the TypeScript code into JavaScript.
- `npm start`: Starts the compiled application.
- `npm run dev`: Starts the application in development mode using `nodemon`.
- `npm run type-check`: Runs TypeScript type checking.