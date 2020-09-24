import { listAsync, removeAsync } from "./expo";
import * as core from '@actions/core';

try {
    const url = core.getInput('webhook_url');

    const main = async () => {
        const webhooks = await listAsync('.');
        const matches = webhooks.filter(wh => wh.url === url);

        await Promise.all(matches.map(async wh => {
            await removeAsync('.', wh.id);
            console.log(`Removed ${wh.url}`);
        }));
    };

    main();
}
catch (exc) {
    core.setFailed(exc.message);
}