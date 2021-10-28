# Crypto Wallet Key Configuration Analyzer
This app is a calculator that helps you analyze, given a certain crypto wallet key distribution setting, the probability of its failure.

## Deploying
This repo is set up with Github Pages so that production builds of the app that are pushed to the `main` branch are automatically deployed to https://zengo-x.github.io/crypto-key-calculator/

## Running the app locally
This is a simple react application.
In order to run node must be installed, then simply run:
```
npm run start
```
And a local instance will be hosted on your machine.

In order to build for production run:
```
npm run build
```
| WARNING: the site is configured by default to be served on `/crypto-key-calculator/`. Change the `homepage` property in `package.json` to `/` when running the production build locally!|
| --- |

Then, in the `docs` directory will be all the files needed to host the application.

To host the application locally run `python3 -m http.server`.