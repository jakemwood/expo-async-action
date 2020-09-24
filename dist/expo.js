// expo.ts
//
// Most of these functions were copied directly from the expo-cli
// project with only minor modifications.
//
// https://github.com/expo/expo-cli/blob/master/packages/expo-cli/src/commands/webhooks.ts
//
import { findConfigFile, getConfig } from "@expo/config";
import { ApiV2, UserManager } from "@expo/xdl";
export async function setupAsync(projectRoot) {
    const { exp } = getConfig(projectRoot, { skipSDKVersionRequirement: true });
    const { slug } = exp;
    if (!slug) {
        throw new Error(`expo.slug is not defined in ${findConfigFile(projectRoot).configName}`);
    }
    const user = await UserManager.ensureLoggedInAsync();
    const client = ApiV2.clientForUser(user);
    const experienceName = `@${exp.owner ? exp.owner : user.username}/${exp.slug}`;
    try {
        const projects = await client.getAsync("projects", {
            experienceName,
        });
        if (projects.length === 0) {
            throw Error(`Project not found: ${experienceName}`);
        }
        const project = projects[0];
        return { experienceName, project, client };
    }
    catch (error) {
        if (error.code === "EXPERIENCE_NOT_FOUND") {
            throw Error(`Project not found: ${experienceName}`);
        }
        else {
            throw error;
        }
    }
}
export async function listAsync(projectRoot) {
    const { project, client } = await setupAsync(projectRoot);
    return await client.getAsync(`projects/${project.id}/webhooks`);
}
export async function removeAsync(projectRoot, id) {
    const { project, client } = await setupAsync(projectRoot);
    await client.deleteAsync(`projects/${project.id}/webhooks/${id}`);
}
