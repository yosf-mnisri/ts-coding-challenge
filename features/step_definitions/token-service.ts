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

