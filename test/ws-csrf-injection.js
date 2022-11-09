import { app as chatApp } from '../chat.js';
import { app as attackerApp } from '../attacker.js';
import { Server, util } from '@mojojs/core';
import { chromium } from 'playwright';
import t from 'tap';

t.test('CSRF Injection attack (chromium)', async t => {
  const chatServer = new Server(chatApp, { listen: ['http://*'], quiet: true });
  await chatServer.start();
  const chatUrl = chatServer.urls[0];
  chatUrl.host = '127.0.0.1';
  process.env.URL_TO_ATTACK = chatUrl.toString();
  const attackerServer = new Server(attackerApp, { listen: ['http://*'], quiet: true });
  await attackerServer.start();
  const attackerUrl = attackerServer.urls[0];
  attackerUrl.host = '127.0.0.1';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const chatPage = await context.newPage();

  await chatPage.goto(chatUrl.toString());
  t.equal(await chatPage.innerText('#log'), '', 'empty log');
  const attackerPage = await context.newPage();
  await attackerPage.goto(attackerUrl.toString());
  await chatPage.waitForSelector('#log');
  const log = await chatPage.innerText('#log');
  t.notMatch(log, /Bender:/, `uneffective attack, log: ${log}`);

  await context.close();
  await browser.close();
  await chatServer.stop();
  await attackerServer.stop();
});
