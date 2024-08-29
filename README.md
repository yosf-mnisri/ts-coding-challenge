# tha-coding-challenge

This coding challenge uses Cucumber to run tests which implement a hypothetical use-case for Hedera SDK.

## Installation

to install the dependencies, run `yarn install`

## Running

To run the tests you have multiple options:

* run `yarn test` to run all steps
* run `yarn test:dev` to run all steps marked with the `@dev` tag
* run `yarn test:wip` to run all steps marked with the `@wip` tag
* create your own tag and run the tests with `cucumber-js -p default --tags 'not @wip' --exit`

## Writing the tests

The tests are implemented as `steps` in the `features` folder. You can use a plugin to your favourite IDE to write
the step definitions for you. An example has been left for reference

The `config.ts` contains a list of private keys which can be used for testing. You can also replace those keys with 
the ones from your own Hedera Console test accounts
