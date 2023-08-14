# DocumentBase

The monorepo chat bot project powered by Chat GPT

> This project is still in analyzed, we will keep updating the documentation until we found the final Recep.

## Intro

This project is using [Nx](https://nx.dev) as extensible Dev Tools

## How to Run

Clone the project

```sh
git clone git@github.com:khalilsiu/document-base.git
```

Goto the project

```sh
cd ./document-base
```

Run `npm install` to install the dependencies

### Run Server Project

Run `nx serve server`

Then you are ready to develop feature ob server api project.

### Run Web UI Project

Run `nx serve web`

Then you are ready to develop feature on web ui project.

## Adding capabilities to workspace

Nx supports many plugins which add capabilities for developing different types of applications and different tools.

These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Below are several core plugins:

- [Next](https://nextjs.org/)
  - `npm install --save-dev @nx/next`
- [Nest](https://nestjs.com)
  - `npm install --save-dev @nx/nest`

There are also many [community plugins](https://nx.dev/community) you could add.

## Generate an application

Run `nx g @nx/nest:app my-app` to generate an application.

> You can use any of the plugins above to generate applications as well.

When using Nx, you can create multiple applications and libraries in the same workspace.

## Generate a library

Run `nx g @nx/nest:lib my-lib` to generate a library.

> You can also use any of the plugins above to generate libraries as well.

Libraries are shareable across libraries and applications. They can be imported from `@nx-example/mylib`.

## Development server

Run `nx serve my-app` for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `nx g @nx/react:component my-component --project=my-app` to generate a new component.

## Build

Run `nx build my-app` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `nx test my-app` to execute the unit tests via [Jest](https://jestjs.io).

Run `nx affected:test` to execute the unit tests affected by a change.

## Running end-to-end tests

Run `nx e2e my-app` to execute the end-to-end tests via [Cypress](https://www.cypress.io).

Run `nx affected:e2e` to execute the end-to-end tests affected by a change.

## Understand your workspace

Run `nx dep-graph` to see a diagram of the dependencies of your projects.

## Further help

Visit the [Nx Documentation](https://nx.dev) to learn more.

## Discussions

If you have questions how to use, want to suggest a feature please join [Discussion on GitHub](https://github.com/khalilsiu/document-base/discussions). I would love to hear from you. 🙂

## Issues

If you find a bug or would like to request a feature, please visit [ISSUES](https://github.com/khalilsiu/document-base/issues)
