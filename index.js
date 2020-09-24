const { deleteWebhook } = require("./expo.js");
const core = require('@actions/core');

try {
    const url = core.getInput('webhook_url');
    deleteWebhook(url);
}
catch (exc) {
    core.setFailed(exc.message);
}