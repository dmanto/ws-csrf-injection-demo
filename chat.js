// this is basically the mojojs chat app example
import { EventEmitter } from 'node:events';
import mojo from '@mojojs/core';

export const app = mojo();

app.models.events = new EventEmitter();

app.get('/', async ctx => {
  // pretend you are an authenticated user
  const session = await ctx.session();
  session.user = 'Bender';
  await ctx.render({ inline: inlineTemplate });
});

app.websocket('/channel', async ctx => {
  const origin = ctx.req.get('Origin');
  const host = ctx.req.get('Host');
  const session = await ctx.session();
  const user = session.user || 'not assigned';
  ctx.log.warn(`Detected Origin:  ${origin}, vs ${host}`);
  ctx.log.warn(`Authenticated user: ${user}`);
  ctx.plain(async ws => {
    const listener = msg => ws.send(msg);
    ctx.models.events.on('mojochat', listener);

    for await (const msg of ws) {
      ctx.models.events.emit('mojochat', `${user}: ${msg}`);
    }

    ctx.models.events.removeListener('mojochat', listener);
  });
});

app.start();

const inlineTemplate = `
<form onsubmit="sendChat(this.children[0]); return false"><input></form>
<div id="log"></div>
<script>
  const ws = new WebSocket('<%= ctx.urlFor('channel') %>');
  ws.onmessage = function (e) {
    document.getElementById('log').innerHTML += '<p>' + e.data + '</p>';
  };
  function sendChat(input) { ws.send(input.value); input.value = '' }
</script>
`;