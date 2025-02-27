export type UrlParsed = {
  projectName: string;
  projectScope: string;
  fileName?: string;
  oldFileName?: string;
};

export function getUrlParsed(
  url: string,
  isFolder: boolean,
  isDelete: boolean
): UrlParsed {
  let urlParsed = url.split(/[\/\\]+/g).filter((value) => value != '');

  return {
    projectName: urlParsed
      .slice(
        0,
        (urlParsed.length > 1 &&
          urlParsed.at(urlParsed.length - 1)?.includes('.')) ||
          isDelete
          ? urlParsed.length - 1
          : undefined
      )
      .join('/'),
    projectScope: '',
  };
}
