/*
 * Minimal WebSocket example to be run in a localhost with a port read from env var URL_TO_ATTACK
 */
import mojo from '@mojojs/core';

export const app = mojo();

app.get('/', async ctx => {
  const baseUrl = process.env.URL_TO_ATTACK ?? 'http://localhost:3000/';
  const attackUrl = baseUrl.replace(/^http/, 'ws').replace(/\/$/, '/channel');
  await ctx.render({ inline: inlineTemplate }, { attackUrl: attackUrl });
});

app.start();

const inlineTemplate = `
<script>
const ews = new WebSocket('<%= ctx.stash.attackUrl %>');
ews.onopen = (event) => {ews.send('some evil text');
    ews.close();
};
</script>
`;