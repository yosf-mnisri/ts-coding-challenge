import { Given, Then, When } from "@cucumber/cucumber";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenMintTransaction,
  TransferTransaction,
  TokenId,
} from "@hashgraph/sdk";
import { accounts } from "../../src/config";
import assert from "node:assert";

// Pre-configured client for test network (testnet)
const client = Client.forTestnet();
let tokenId: TokenId | null = null; // Variable to store created token ID
let initialSupply: number | null = null; // Variable for initial token supply

Given(/^A Hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

When(/^I create a token named Test Token \(HTT\)$/, async function () {
  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName("Test Token")
    .setTokenSymbol("HTT")
    .setDecimals(2)
    .setInitialSupply(0) // Initially set to 0
    .setTreasuryAccountId(AccountId.fromString(accounts[0].id));

  const response = await tokenCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  tokenId = receipt.tokenId;

  assert.ok(tokenId, "Token creation failed");
});

Then(/^The token has the name "([^"]*)"$/, async function (expectedName: string) {
  if (!tokenId) {
    throw new Error("Token ID is not set.");
  }
  
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  
  assert.strictEqual(tokenInfo.name, expectedName, `Expected token name to be "${expectedName}", but got "${tokenInfo.name}"`);
});

Then(/^The token has the name "([^"]*)"$/, async function (expectedName: string) {
  if (!tokenId) {
    throw new Error("Token ID is not set.");
  }

  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  
  assert.strictEqual(tokenInfo.name, expectedName, `Expected token name to be "${expectedName}", but got "${tokenInfo.name}"`);
});

/*Then(/^The token has (\d+) decimals$/, async function (expectedDecimals: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.decimals, expectedDecimals);
});

Then(/^The token is owned by the account$/, async function () {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.treasury.toString(), accounts[0].id);
});

Then(/^An attempt to mint (\d+) additional tokens succeeds$/, async function (amount: number) {
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount);

  const response = await mintTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status === "SUCCESS", "Minting failed");
  initialSupply = amount; // Store initial supply for assertions
});

When(/^I create a fixed supply token named Test Token \(HTT\) with (\d+) tokens$/, async function (amount: number) {
  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName("Test Token")
    .setTokenSymbol("HTT")
    .setDecimals(2)
    .setInitialSupply(amount)
    .setTreasuryAccountId(AccountId.fromString(accounts[0].id));

  const response = await tokenCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  tokenId = receipt.tokenId;

  assert.ok(tokenId, "Token creation failed");
});

Then(/^The total supply of the token is (\d+)$/, async function (expectedTotalSupply: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toString(), expectedTotalSupply);
});

Then(/^An attempt to mint tokens fails$/, async function () {
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(100); // Attempt to mint more tokens

  const response = await mintTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status !== "SUCCESS", "Minting should have failed");
});

// Additional steps for account management and transfers
Given(/^A first hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

Given(/^A second Hedera account$/, async function () {
  // Ensure the second account is set up
  const account = accounts[1];
  this.secondAccountId = AccountId.fromString(account.id);
  this.secondPrivateKey = PrivateKey.fromStringED25519(account.privateKey);
});

Given(/^A token named Test Token \(HTT\) with (\d+) tokens$/, async function (amount: number) {
  // This step would typically set up the token if it hasn't already been created
  if (!tokenId) {
    await this[`I create a fixed supply token named Test Token (HTT) with ${amount} tokens`]();
  }
});

Given(/^The first account holds (\d+) HTT tokens$/, async function (amount: number) {
  // Transfer tokens to the first account
  const transferTx = new TransferTransaction()
    .addTokens(tokenId, this.secondAccountId, -amount)
    .addTokens(tokenId, accounts[0].id, amount);

  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status === "SUCCESS", "Transfer failed");
});

Given(/^The second account holds (\d+) HTT tokens$/, async function (amount: number) {
  // Similar to the previous step, ensure the second account holds tokens
  const transferTx = new TransferTransaction()
    .addTokens(tokenId, this.secondAccountId, amount)
    .addTokens(tokenId, accounts[0].id, -amount);

  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status === "SUCCESS", "Transfer failed");
});

When(/^The first account creates a transaction to transfer (\d+) HTT tokens to the second account$/, async function (amount: number) {
  this.transferAmount = amount;
  this.transferTx = new TransferTransaction()
    .addTokens(tokenId, accounts[0].id, -amount)
    .addTokens(tokenId, accounts[1].id, amount);
});

When(/^The first account submits the transaction$/, async function () {
  const response = await this.transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status === "SUCCESS", "Transfer transaction failed");
});

When(/^The second account creates a transaction to transfer (\d+) HTT tokens to the first account$/, async function (amount: number) {
  this.reverseTransferAmount = amount;
  this.reverseTransferTx = new TransferTransaction()
    .addTokens(tokenId, accounts[1].id, -amount)
    .addTokens(tokenId, accounts[0].id, amount);
});

Then(/^The first account has paid for the transaction fee$/, async function () {
  const account = accounts[0];
  const balanceBefore = await new AccountBalanceQuery().setAccountId(account.id).execute(client);
  assert.ok(balanceBefore.hbars.toBigNumber().toNumber() < balanceBefore.hbars.toBigNumber().toNumber() - 0.001, "Transaction fee not deducted");
});

// Steps for multiple accounts and transfers
Given(/^A first hedera account with more than (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  await this[`A Hedera account with more than ${hbarAmount} hbar`]();
  await this[`The first account holds ${tokenAmount} HTT tokens`]();
});

Given(/^A second Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  await this[`A second Hedera account`]();
  await this[`The second account holds ${tokenAmount} HTT tokens`]();
});

Given(/^A third Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  // Setup for third account similar to the second
  const account = accounts[2];
  this.thirdAccountId = AccountId.fromString(account.id);
  this.thirdPrivateKey = PrivateKey.fromStringED25519(account.privateKey);
  await this[`A Hedera account with more than ${hbarAmount} hbar`]();
  await this[`The third account holds ${tokenAmount} HTT tokens`]();
});

Given(/^A fourth Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  // Setup for fourth account similar to the third
  const account = accounts[3];
  this.fourthAccountId = AccountId.fromString(account.id);
  this.fourthPrivateKey = PrivateKey.fromStringED25519(account.privateKey);
  await this[`A Hedera account with more than ${hbarAmount} hbar`]();
  await this[`The fourth account holds ${tokenAmount} HTT tokens`]();
});

When(/^A transaction is created to transfer (\d+) HTT tokens out of the first and second account and (\d+) HTT tokens into the third account and (\d+) HTT tokens into the fourth account$/, async function (amount1: number, amount2: number, amount3: number) {
  const transferTx = new TransferTransaction()
    .addTokens(tokenId, accounts[0].id, -amount1)
    .addTokens(tokenId, accounts[1].id, -amount1)
    .addTokens(tokenId, this.thirdAccountId, amount2)
    .addTokens(tokenId, this.fourthAccountId, amount3);
  
  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.ok(receipt.status === "SUCCESS", "Transfer failed");
});

Then(/^The third account holds (\d+) HTT tokens$/, async function (expectedAmount: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toNumber(), expectedAmount);
});

Then(/^The fourth account holds (\d+) HTT tokens$/, async function (expectedAmount: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toNumber(), expectedAmount);
});*/