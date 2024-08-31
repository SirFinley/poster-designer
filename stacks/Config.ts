export const rootDomain = 'visualinkworks.com';

export function getSiteDomain(stage: string) {
    if (stage == "prod") {
        return `designer.${rootDomain}`
    }

    return `${stage}-designer.${rootDomain}`;
}

export function getApiDomain(stage: string) {
    if (stage == "prod") {
        return `api.${rootDomain}`
    }

    return `${stage}-api.${rootDomain}`;
}

