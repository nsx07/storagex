export type UrlParsed = {
    projectName: string;
    projectScope: string;
    fileName?: string;
    oldFileName?: string;
}

export function getUrlParsed(url: string, isFolder : boolean, isDelete: boolean): UrlParsed {
    let urlParsed = url.split(/[\/\\]+/g).filter((value) => value != "");
    
    // let projectName = urlParsed[0];
    // let projectScope = urlParsed[1];

    // if (urlParsed.length <= 2) {
    //     projectScope = "";
    // }

    // if (isFolder && !isDelete) {
    //     projectScope = "";
    // }
    // projectName = url.slice(1);

    return { projectName: urlParsed.slice(0, urlPArsed.length ? urlParsed.length - 1 : undefined).join("/"), projectScope: "",};
}
