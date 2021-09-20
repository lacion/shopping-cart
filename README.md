<h1 align="center">
  Paystack Shopping Application
</h1>

![Release](https://github.com/2wce/paystack-shopping/actions/workflows/release.yml/badge.svg)

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before we get started, we're going to need to make sure we have a few things installed and available on our machine.

#### Node >= 12

##### MacOS

```bash
curl "https://nodejs.org/dist/latest/node-${VERSION:-$(wget -qO- https://nodejs.org/dist/latest/ | sed -nE 's|.*>node-(.*)\.pkg</a>.*|\1|p')}.pkg" > "$HOME/Downloads/node-latest.pkg" && sudo installer -store -pkg "$HOME/Downloads/node-latest.pkg" -target "/"
```

##### Other

See the installation guides available @ nodejs.org:

https://nodejs.org/en/download/package-manager/

### Installing

Below is a series of step by step instructions that tell you how to get a development env running.

Create a local clone of the repository

```bash
git clone git@github.com:2wce/paystack-shopping.git
```

Enter the cloned repositories' directory

```bash
cd paystack-shopping
```

Install the projects dependencies

```bash
npm i
```

Create a `.env` file based on the [.env.example template](.env.example)

Export the contents of the created `.env` file to the current terminal session.

```bash
set -o allexport; source .env; set +o allexport
```

Start the projects development server

```bash
yarn dev
```

The project should now be available at http://localhost:4000

![graphql playground](https://i.imgur.com/Gy9arjH.png)

## Environments

Below is a detailed list of the current deployed environments, how they can accessed and any other relevant information.

### Development

> This environment is deployed to automatically on every merge to the `develop` branch.

**Access**
This environment can be accessed using the credentials below.

| Portal | Endpoint | Username | Password |
| ------ | -------- | -------- | -------- |

### Staging

> This environment is deployed to automatically on every merge to the `master` branch.

**Access**
This environment can be accessed using the credentials below.

| Portal | Endpoint | Username | Password |
| ------ | -------- | -------- | -------- |

### Production

> This environment is deployed to manually by promoting a build from the `master` branch.

**Access**
This environment can be accessed using the credentials below.

| Portal | Endpoint | Username | Password |
| ------ | -------- | -------- | -------- |

## Deployment

Deployments are handled by github actions, below is an overview of how the deployments work:

1. Dependencies are installed with `npm i`
2. Unit tests are run with `yarn test`

## Environment Variables

These are the environment variables required to successfully deploy the application.

| key                 | description      |
| ------------------- | ---------------- |
| MYSQL_USER          | DB username      |
| MYSQL_PASSWORD      | DB password      |
| MYSQL_ROOT_PASSWORD | DB root password |
| MYSQL_DATABASE      | DB name          |

## Built With

Details of the tech stack that has been used.

- [Typescript](https://typescript.com/) - React Framework for production
- [Prisma](https://www.prisma.io/) - Next-generation ORM
  for Node.js and TypeScript

## Infrastructure

A list of infrastructure requirements

- PlanetScale (DB)
- Vercel (Serverless Function)

## Services

A list of all services used in this project.

| Service Name | Owner/Admin | Service Details |
| ------------ | ----------- | --------------- |
| Planet Scale | Kuda        |                 |
| Vercel       | Kuda        |                 |

## Versioning

This project uses [SemVer](http://semver.org/) for versioning. Versioning occurs automatically in the pipelines using [Semantic Release](https://github.com/semantic-release/semantic-release). For the versions available, see the tags on this repository.

## Changelog

A running changelog can be found here: [CHANGELOG.md](CHANGELOG.md)

## Authors

- **Kudakwashe Mupeni** <kudamupeni@gmail.com>

## Licenses

```
├─ MIT: 386
├─ ISC: 32
├─ BSD-3-Clause: 30
├─ Apache-2.0: 11
├─ BSD-2-Clause: 7
├─ CC-BY-4.0: 1
├─ (MIT AND BSD-3-Clause): 1
├─ 0BSD: 1
└─ (MIT OR CC0-1.0): 1
```

## Meta

| Version | Author                                   | Date       |
| ------- | ---------------------------------------- | ---------- |
| 0.0.1   | Kudakwashe Mupeni <kudamupeni@gmail.com> | 20/09/2021 |
