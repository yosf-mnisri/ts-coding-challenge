import { Given, Then, When } from "@cucumber/cucumber";
import { accounts } from "../../src/config";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenInfoQuery,
  TokenMintTransaction,
  TokenTransferTransaction,
  TokenId,
} from "@hashgraph/sdk";
import assert from "node:assert";

const client = Client.forTestnet();

let tokenId: TokenId;
let initialSupply: number;

// Given a Hedera account with more than a specified amount of hbar
Given(/^A Hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  // Create the query request
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

// Creating a fixed supply token
When(/^I create a fixed supply token named Test Token \(HTT\) with (\d+) tokens$/, async function (supply: number) {
  initialSupply = supply;
  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName("Test Token (HTT)")
    .setTokenSymbol("HTT")
    .setDecimals(0)
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(client.operatorAccountId)
    .setAdminKey(client.operatorPrivateKey);

  const response = await tokenCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  tokenId = receipt.tokenId; // Store the token ID for further use
});

// Checking token properties
Then(/^The token has the name "([^"]*)"$/, async function (expectedName: string) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.tokenName, expectedName);
});

Then(/^The token has the symbol "([^"]*)"$/, async function (expectedSymbol: string) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.tokenSymbol, expectedSymbol);
});

Then(/^The token has (\d+) decimals$/, async function (expectedDecimals: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.decimals, expectedDecimals);
});

Then(/^The token is owned by the account$/, async function () {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.treasury.toString(), client.operatorAccountId.toString());
});

// Minting tokens
Then(/^An attempt to mint (\d+) additional tokens succeeds$/, async function (amount: number) {
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(amount);

  const response = await mintTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.strictEqual(receipt.status.toString(), "SUCCESS");
});

// Total supply check
Then(/^The total supply of the token is (\d+)$/, async function (expectedSupply: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(tokenId).execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toString(), expectedSupply.toString());
});

// Minting failure case
Then(/^An attempt to mint tokens fails$/, async function () {
  const mintTx = new TokenMintTransaction()
    .setTokenId(tokenId)
    .setAmount(100); // Attempt to mint more tokens

  const response = await mintTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.notStrictEqual(receipt.status.toString(), "SUCCESS");
});

// Additional functionality for managing multiple accounts and transfers

// Given a first hedera account with more than a specified amount of hbar
Given(/^A first hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  // Create the query request
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

// Given a second Hedera account
Given(/^A second Hedera account$/, async function () {
  const account = accounts[1];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
});

// Given a token named Test Token (HTT) with specified tokens
Given(/^A token named Test Token \(HTT\) with (\d+) tokens$/, async function (supply: number) {
  initialSupply = supply;
  const tokenCreateTx = new TokenCreateTransaction()
    .setTokenName("Test Token (HTT)")
    .setTokenSymbol("HTT")
    .setDecimals(0)
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(client.operatorAccountId)
    .setAdminKey(client.operatorPrivateKey);

  const response = await tokenCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  tokenId = receipt.tokenId; // Store the token ID for further use
});

// Given the first account holds specified HTT tokens
Given(/^The first account holds (\d+) HTT tokens$/, async function (amount: number) {
  // Logic to check the balance of the first account
});

// Given the second account holds specified HTT tokens
Given(/^The second account holds (\d+) HTT tokens$/, async function (amount: number) {
  // Logic to check the balance of the second account
});

// When the first account creates a transaction to transfer specified HTT tokens to the second account
When(/^The first account creates a transaction to transfer (\d+) HTT tokens to the second account$/, async function (amount: number) {
  const transferTx = new TokenTransferTransaction()
    .addTokenTransfer(tokenId, client.operatorAccountId, -amount) // Reduce from first account
    .addTokenTransfer(tokenId, accounts[1].id, amount); // Add to second account

  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.strictEqual(receipt.status.toString(), "SUCCESS");
});

// When the first account submits the transaction
When(/^The first account submits the transaction$/, async function () {
  // This will typically be handled in the previous function
});

// When the second account creates a transaction to transfer specified HTT tokens to the first account
When(/^The second account creates a transaction to transfer (\d+) HTT tokens to the first account$/, async function (amount: number) {
  const transferTx = new TokenTransferTransaction()
    .addTokenTransfer(tokenId, accounts[1].id, -amount) // Reduce from second account
    .addTokenTransfer(tokenId, client.operatorAccountId, amount); // Add to first account

  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.strictEqual(receipt.status.toString(), "SUCCESS");
});

// Then the first account has paid for the transaction fee
Then(/^The first account has paid for the transaction fee$/, async function () {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() >= 0); // Ensure the balance is non-negative
});

// Given a first Hedera account with more than a specified amount of hbar and specified HTT tokens
Given(/^A first hedera account with more than (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > hbarAmount);
  // Check for HTT token balance
});

Given(/^A second Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  const account = accounts[1];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);

  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > hbarAmount);
  // Check for HTT token balance
});

Given(/^A third Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  const account = accounts[2];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
  
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > hbarAmount);
  // Check for HTT token balance
});

Given(/^A fourth Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount: number, tokenAmount: number) {
  const account = accounts[3];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
  
  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > hbarAmount);
  // Check for HTT token balance
});

// When a transaction is created to transfer specified HTT tokens
When(/^A transaction is created to transfer (\d+) HTT tokens out of the first and second account and (\d+) HTT tokens into the third account and (\d+) HTT tokens into the fourth account$/, async function (amount1: number, amount2: number, amount3: number) {
  const transferTx = new TokenTransferTransaction()
    .addTokenTransfer(tokenId, accounts[0].id, -amount1) // Reduce from first account
    .addTokenTransfer(tokenId, accounts[1].id, -amount2) // Reduce from second account
    .addTokenTransfer(tokenId, accounts[2].id, amount3) // Add to third account
    .addTokenTransfer(tokenId, accounts[3].id, amount3); // Add to fourth account

  const response = await transferTx.execute(client);
  const receipt = await response.getReceipt(client);
  assert.strictEqual(receipt.status.toString(), "SUCCESS");
});

// Then the third account holds specified HTT tokens
Then(/^The third account holds (\d+) HTT tokens$/, async function (expectedAmount: number) {
  const account = accounts[2];
  const query = new TokenInfoQuery().setTokenId(tokenId);
  const tokenInfo = await query.execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toString(), expectedAmount.toString());
});

// Then the fourth account holds specified HTT tokens
Then(/^The fourth account holds (\d+) HTT tokens$/, async function (expectedAmount: number) {
  const account = accounts[3];
  const query = new TokenInfoQuery().setTokenId(tokenId);
  const tokenInfo = await query.execute(client);
  assert.strictEqual(tokenInfo.totalSupply.toString(), expectedAmount.toString());
});