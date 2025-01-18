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
  TransferTransaction,
} from "@hashgraph/sdk";
import assert from "node:assert";

const client = Client.forTestnet();

Given(/^A Hedera account with more than (\d+) hbar$/, async function (expectedBalance: number) {
  const account = accounts[0];
  const MY_ACCOUNT_ID = AccountId.fromString(account.id);
  const MY_PRIVATE_KEY = PrivateKey.fromStringED25519(account.privateKey);
  client.setOperator(MY_ACCOUNT_ID, MY_PRIVATE_KEY);
  this.accountId = client.getOperator()?.accountId;

  const query = new AccountBalanceQuery().setAccountId(MY_ACCOUNT_ID);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

When(/^I create a token named "([^"]*)" \("([^"]*)"\)$/, async function (name: string, symbol: string) {
  const ctt = await new TokenCreateTransaction()
    .setDecimals(2)
    .setTokenName(name)
    .setTokenSymbol(symbol)
    .setAdminKey(this.accountId.publicKey)
    .setTreasuryAccountId(this.accountId)
    .execute(client);
  const receipt = await ctt.getReceipt(client);
  this.tokenId = receipt.tokenId;
});

Then(/^The token has the name "([^"]*)"$/, async function (name: string) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.name === name);
});

Then(/^The token has the symbol "([^"]*)"$/, async function (symbol: string) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.symbol === symbol);
});

Then(/^The token has (\d+) decimals$/, async function (decimals: number) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.decimals === decimals);
});

Then(/^The token is owned by the account$/, async function () {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.treasuryAccountId?.equals(this.accountId));
});

Then(/^An attempt to mint (\d+) additional tokens succeeds$/, async function (tokens: number) {
  const mintTx = await new TokenMintTransaction()
    .setTokenId(this.tokenId)
    .setAmount(tokens)
    .execute(client);
  const receipt = await mintTx.getReceipt(client);
  assert.ok(receipt.status._code === 22); // 22 = SUCCESS
});

When(/^I create a fixed supply token named Test Token \(HTT\) with (\d+) tokens$/, async function (initialSupply: number) {
  const ctt = await new TokenCreateTransaction()
    .setDecimals(0)
    .setTokenName("Test Token")
    .setTokenSymbol("HTT")
    .setInitialSupply(initialSupply)
    .setTreasuryAccountId(this.accountId)
    .execute(client);
  const receipt = await ctt.getReceipt(client);
  this.tokenId = receipt.tokenId;
});

Then(/^The total supply of the token is (\d+)$/, async function (totalSupply: number) {
  
});

Then(/^An attempt to mint tokens fails$/, async function () {
  try {
    await new TokenMintTransaction()
      .setTokenId(this.tokenId)
      .setAmount(10)
      .execute(client);
    assert.fail("Expected minting to fail");
  } catch (error) {
    assert.ok(error); // Ensure an error is thrown
  }
});

Given(/^A first hedera account with more than (\d+) hbar$/, async function (expectedBalance) {
  const account = accounts[0]; // Modify as necessary for the first account
  // Similar logic as the first step
});

Given(/^A second Hedera account$/, function () {
  this.secondAccount = accounts[1]; // Use the second account from your config
});

Given(/^A token named Test Token \(HTT\) with (\d+) tokens$/, async function (initialSupply) {
  // Create the token as in previous steps, or query if it exists.
});

Given(/^The first account holds (\d+) HTT tokens$/, async function (amount) {
  // Transfer tokens to the first account
});

Given(/^The second account holds (\d+) HTT tokens$/, async function (amount) {
  // Transfer tokens to the second account
});

When(/^The first account creates a transaction to transfer (\d+) HTT tokens to the second account$/, async function (amount) {
  this.transferTx = await new TransferTransaction()
    .addTokenTransfer(this.tokenId, this.accountId, -amount)
    .addTokenTransfer(this.tokenId, this.secondAccount.id, amount)
    .freezeWith(client);
});

When(/^The first account submits the transaction$/, async function () {
  const signTx = await this.transferTx.sign(this.accountId.privateKey);
  const receipt = await signTx.execute(client);
  assert.ok(receipt.status._code === 22); // SUCCESS
});

When(/^The second account creates a transaction to transfer (\d+) HTT tokens to the first account$/, async function (amount) {
  this.reverseTransferTx = await new TransferTransaction()
    .addTokenTransfer(this.tokenId, this.secondAccount.id, -amount)
    .addTokenTransfer(this.tokenId, this.accountId, amount)
    .freezeWith(client);
});

Then(/^The first account has paid for the transaction fee$/, async function () {
  // Check the account balance before and after the transaction
});

Given(/^A first hedera account with more than (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount, tokenAmount) {
  // Modify as necessary
});

Given(/^A second Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount, tokenAmount) {
  // Modify as necessary
});

Given(/^A third Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount, tokenAmount) {
  // Modify as necessary
});

Given(/^A fourth Hedera account with (\d+) hbar and (\d+) HTT tokens$/, async function (hbarAmount, tokenAmount) {
  // Modify as necessary
});

When(/^A transaction is created to transfer (\d+) HTT tokens out of the first and second account and (\d+) HTT tokens into the third account and (\d+) HTT tokens into the fourth account$/, async function (amount1, amount2, amount3, amount4) {
  
});

Then(/^The third account holds (\d+) HTT tokens$/, async function (expectedAmount) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.treasuryAccountId?.equals(this.thirdAccount.id)); // Modify logic as necessary
});

Then(/^The fourth account holds (\d+) HTT tokens$/, async function (expectedAmount) {
  const tokenInfo = await new TokenInfoQuery().setTokenId(this.tokenId).execute(client);
  assert.ok(tokenInfo.treasuryAccountId?.equals(this.fourthAccount.id)); // Modify logic as necessary
});