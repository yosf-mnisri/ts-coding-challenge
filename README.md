# tha-coding-challenge

This coding challenge uses [Cucumber](https://cucumber.io/) to run tests which implement a hypothetical use-case for Hedera SDK.

Your task is to make as many of the tests pass. This repository has all the dependencies you need to start developing. No setup is required. 

But you will need a Testnet Account by doing either of two things:
* Register on the [Hedera Portal](https://portal.hedera.com/register) - easiest way
* Create a testnet account in a Hedera Wallet like [Hashpack](https://www.hashpack.app/) or [Blade](https://bladewallet.io/) and using [the faucet](https://portal.hedera.com) - more work but allows to better understand what is going on


## Learning resources

You can download a [presentation providing an overview of Hedera Hashgraph](https://hashgraph.atlassian.net/wiki/external/NTdiYjA4ZDZiMWQxNDAzNjg4NTI3ODgyZjE0YzU1MjY) and how to use its services

For the impatient, here are the main links for learning material:
* [Getting Started](https://hedera.com/get-started)
* [Hedera documentation](https://docs.hedera.com/hedera)
* [Hedera Learning Center](https://hedera.com/learning/what-is-hedera-hashgraph)
* [Join developer discord](https://hedera.com/discord)
* [Hedera on Youtube](https://www.youtube.com/c/HederaHashgraph)
* [Application demos](https://docs.hedera.com/guides/resources/demo-applications)

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
