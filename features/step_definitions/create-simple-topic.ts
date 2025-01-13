import { Given, Then, When } from "@cucumber/cucumber";
import {
  AccountBalanceQuery,
  AccountId,
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageQuery,
  TopicMessageSubmitTransaction,
  KeyList,
  TopicInfoQuery,
} from "@hashgraph/sdk";
import { accounts } from "../../src/config";
import assert from "node:assert";
import { Given } from "@cucumber/cucumber";
import { Client, TopicCreateTransaction, PrivateKey } from "@hashgraph/sdk";
// Configure the Hedera client
const client = Client.forTestnet();
client.setOperator(process.env.MY_ACCOUNT_ID, PrivateKey.fromString(process.env.MY_PRIVATE_KEY));

// Pre-configured client for test network (testnet)
const client = Client.forTestnet();

// Set the operator with the account ID and private key
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
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});



let topicId: TopicId | null = null; // Initialize topicId as null

// Given a topic is created with the memo and the first account as the submit key
Given(/^A topic is created with the memo "([^"]*)" with the first account as the submit key$/, async function (memo: string) {
  const topicCreateTx = new TopicCreateTransaction()
    .setAdminKey(this.privKey) // Set admin key
    .setSubmitKey(this.privKey); // Set submit key

  const response = await topicCreateTx.execute(client);
  const receipt = await response.getReceipt(client);

  // Check if receipt.topicId is not null before converting to string
  if (receipt.topicId) {
    topicId = receipt.topicId.toString(); // Store the topic ID for further use
  } else {
    throw new Error("Failed to create topic: topicId is null");
  }
});

When(/^The message "([^"]*)" is published to the topic$/, async function (message: string) {
  const messageSubmitTx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  await messageSubmitTx.execute(client);
});

Then(/^The message "([^"]*)" is received by the topic and can be printed to the console$/, async function (expectedMessage: string) {
  const messageQuery = new TopicMessageQuery()
    .setTopicId(topicId)
    .setLimit(10); // Limit the number of messages retrieved

  const messages = await messageQuery.execute(client);
  const receivedMessages = messages.contents.map(m => m.toString());

  assert.ok(receivedMessages.includes(expectedMessage), `Expected message "${expectedMessage}" not found.`);
  console.log(receivedMessages); // Print received messages to the console
});

Given(/^A second account with more than (\d+) hbars$/, async function (expectedBalance: number) {
  const acc = accounts[1];
  const account: AccountId = AccountId.fromString(acc.id);
  this.secondAccount = account;
  const privKey: PrivateKey = PrivateKey.fromStringED25519(acc.privateKey);
  client.setOperator(this.secondAccount, privKey);

  // Create the query request
  const query = new AccountBalanceQuery().setAccountId(account);
  const balance = await query.execute(client);
  assert.ok(balance.hbars.toBigNumber().toNumber() > expectedBalance);
});

Given(/^A (\d+) of (\d+) threshold key with the first and second account$/, async function (threshold: number, total: number) {
  this.threshold = {
    threshold: threshold,
    total: total,
    accounts: [this.account, this.secondAccount],
  };
});

When(/^A topic is created with the memo "([^"]*)" with the threshold key as the submit key$/, async function (memo: string) {
  const keyList = KeyList.fromKeys(this.threshold.accounts); // Create a KeyList from the accounts

  const topicCreateTx = new TopicCreateTransaction()
    .setAdminKey(this.privKey) // Set admin key
    .setSubmitKey(keyList) // Set threshold key as the submit key
    .setMemo(memo); // Set memo

  const response = await topicCreateTx.execute(client);
  const receipt = await response.getReceipt(client);
  topicId = receipt.topicId.toString(); // Store the topic ID for further use
});