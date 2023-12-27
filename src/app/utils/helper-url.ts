export type UrlParsed = {
    projectName: string;
    projectScope: string;
    fileName?: string;
    oldFileName?: string;
}

export function getUrlParsed(url: string): UrlParsed {
    let urlParsed = url.split(/[\/\\]+/g).filter((value) => value != "");
    
    let projectName = urlParsed[0];
    let fileName = urlParsed[urlParsed.length - 1];
    let projectScope = urlParsed.slice(1, urlParsed.length - 1).join("/");
    
    if (urlParsed.length <= 2) {
        projectScope = "";
    }

    return { projectName, projectScope, fileName };
}