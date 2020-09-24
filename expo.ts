// expo.ts
//
// Most of these functions are based on information found scattered
// throughout the expo-cli project.
//
// https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/webhooks.ts
//

import axios from "axios";

type WebhookEvent = 'build';
type Webhook = {
    id: string;
    url: string;
    event: WebhookEvent;
    secret?: string;
};

const XDL_API = 'https://exp.host/--/api/v2/';

const { auth: { sessionSecret }} = require('~/.expo/state.json');
const xdlApi = axios.create({
  baseURL: XDL_API,
  headers: {
    'expo-session': sessionSecret,
    'exponent-client': '3.27.7', // we are hard-coding this because this is the client we reverse-engineered.
  }
});

async function getProjectId(projectRoot: string) {
    // First, we will *very unsafely* read the Expo states
    const { expo: { slug } } = require(`${projectRoot}/app.json`);
    const { auth: { username, sessionSecret }} = require('~/.expo/state.json');

    const experienceName = `@${username}/${slug}`;

    // Now figure out the ID of our project...
    const projectIdResponse = await xdlApi.get('projects', { params: { experienceName } });
    const projectId = projectIdResponse.data.data[0].id;

    return projectId;
}

async function listWebhooks(projectId: string) {
  const url = `projects/${projectId}/webhooks`;

  const results = await xdlApi.get<{ data: Webhook[] }>(url);

  return results.data.data;
}

async function _deleteWebhook(projectId: string, url: string) {
  const webhooks = await listWebhooks(projectId);
  const webhookId = webhooks.find(wh => wh.url === url).id;
  await xdlApi.delete(`projects/${projectId}/webhooks/${webhookId}`);
}

export async function deleteWebhook(url: string) {
  const projectId = await getProjectId('.');
  return _deleteWebhook(projectId, url);
}
