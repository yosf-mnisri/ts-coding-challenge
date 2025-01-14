import { Given, Then, When } from "@cucumber/cucumber";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicInfoQuery,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} from "@hashgraph/sdk";
import { accounts } from "../../src/config";
import assert from "node:assert";

// Pre-configured client for test network (testnet)
const client = Client.forTestnet();

// Variables to store account, private key, and topic ID
let topicId: string | null = null;

Given(/^a first account with more than (\d+) hbars$/, async function (expectedBalance: number) {
  const acc = accounts[0];
  const account: AccountId = AccountId.fromString(acc.id);
  this.account = account;
  const privKey: PrivateKey = PrivateKey.fromStringED25519(acc.privateKey);
  this.privKey = privKey;
  client.setOperator(this.account, privKey);

  // Create the query request
  const query = new AccountBalanceQuery().setAccountId(account);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance, "Insufficient HBAR balance");
});

When(/^A topic is created with the memo "([^"]*)" with the first account as the submit key$/, async function (memo: string) {
  const topicCreateTx = new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setSubmitKey(this.privKey); // Use the private key as the submit key

  const response = await topicCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  
  // Use a conditional operator to handle undefined
  topicId = receipt.topicId ? receipt.topicId.toString() : null;

  assert.ok(topicId, "Topic creation failed");
});

import { Status } from "@hashgraph/sdk"; // Ensure Status is imported

When(/^The message "([^"]*)" is published to the topic$/, async function (message: string) {
  if (!topicId) {
    throw new Error("Cannot publish message. Topic ID is not set.");
  }

  const messageTx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  const response = await messageTx.execute(client);
  const receipt = await response.getReceipt(client);
  
  // Compare receipt.status with the Status enum value
  assert.ok(receipt.status === Status.Success, "Message publishing failed");
});

//missed function

Given(/^A second account with more than (\d+) hbars$/, async function (expectedBalance: number) {
  const acc = accounts[1];
  const account: AccountId = AccountId.fromString(acc.id);
  const privKey: PrivateKey = PrivateKey.fromStringED25519(acc.privateKey);
  client.setOperator(account, privKey);

  const query = new AccountBalanceQuery().setAccountId(account);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance, "Insufficient HBAR balance");
});

Given(/^A (\d+) of (\d+) threshold key with the first and second account$/, async function (threshold: number, total: number) {
  // Logic to create a threshold key can be implemented here
  // For now, we'll just set a placeholder
  this.thresholdKey = `${threshold} of ${total} threshold key created`;
});

When(/^A topic is created with the memo "([^"]*)" with the threshold key as the submit key$/, async function (memo: string) {
  // Implement topic creation with a threshold key here
  // This will require implementing the logic for creating a threshold key
});