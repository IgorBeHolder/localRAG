export const stringToUnicode = (input) => {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += '\\u' + ('0000' + input.charCodeAt(i).toString(16)).slice(-4);
  }
  return result;
}

export const fixEncoding = (str) => {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }

  const decoder = new TextDecoder("utf-8");
  return decoder.decode(bytes);
}
