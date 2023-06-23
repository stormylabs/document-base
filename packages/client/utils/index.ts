


export const truncateUrl = (url: string) => {
    return url.substring(0, 18) + '...' + url.substring(url.length-10, url.length)
}

export const truncateString = (str: string) => {
    if (str.length < 60) {
        return str;
    }
    return str.substring(0, 60) + '...'
}

export const errorHandler = (errorText: string) => {
    throw new Error(errorText);
  };

