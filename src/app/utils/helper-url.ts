export type UrlParsed = {
    projectName: string;
    projectScope: string;
    fileName?: string;
    oldFileName?: string;
}

export function getUrlParsed(url: string, isFolder : boolean, isDelete: boolean): UrlParsed {
    let urlParsed = url.split(/[\/\\]+/g).filter((value) => value != "");
    
    let projectName = urlParsed[0];
    let projectScope = urlParsed[1];
    let fileName = url.slice(1);

    if (urlParsed.length <= 2) {
        projectScope = "";
    }

    if (isFolder && !isDelete) {
        projectName = fileName;
        projectScope = "";
    }

    return { projectName, projectScope, fileName };
}