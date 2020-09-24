// expo.ts
//
// Most of these functions are based on information found scattered
// throughout the expo-cli project.
//
// https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/webhooks.ts
//

const axios = require('axios');
const os = require('os');

// type WebhookEvent = 'build';
// type Webhook = {
//     id: string;
//     url: string;
//     event: WebhookEvent;
//     secret?: string;
// };

const XDL_API = 'https://exp.host/--/api/v2/';

const { auth: { sessionSecret }} = require(`${os.homedir()}/.expo/state.json`);
const xdlApi = axios.create({
  baseURL: XDL_API,
  headers: {
    'expo-session': sessionSecret,
    'exponent-client': '3.27.7', // we are hard-coding this because this is the client we reverse-engineered.
  }
});

async function getProjectId(projectRoot) {
    // First, we will *very unsafely* read the Expo states
    const { expo: { slug } } = require(`${projectRoot}/app.json`);
    const { auth: { username }} = require(`${os.homedir()}/.expo/state.json`);

    const experienceName = `@${username}/${slug}`;

    // Now figure out the ID of our project...
    const projectIdResponse = await xdlApi.get('projects', { params: { experienceName } });
    const projectId = projectIdResponse.data.data[0].id;

    return projectId;
}

async function listWebhooks(projectId) {
  const url = `projects/${projectId}/webhooks`;

  const results = await xdlApi.get(url);

  return results.data.data;
}

async function _deleteWebhook(projectId, url) {
  const webhooks = await listWebhooks(projectId);
  const webhook = webhooks.find(wh => wh.url === url);
  if (webhook) {
    await xdlApi.delete(`projects/${projectId}/webhooks/${webhook.id}`);
    console.log('Successfully deleted webhook!');
  } else {
    console.warn('Did not find the webhook url asked for');
  }
}

async function deleteWebhook(url) {
  const projectId = await getProjectId(process.cwd());
  return _deleteWebhook(projectId, url);
}
module.exports.deleteWebhook = deleteWebhook;
