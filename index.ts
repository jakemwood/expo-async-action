import { deleteWebhook } from "./expo";
import * as core from '@actions/core';

try {
    const url = core.getInput('webhook_url');
    deleteWebhook(url);
}
catch (exc) {
    core.setFailed(exc.message);
}