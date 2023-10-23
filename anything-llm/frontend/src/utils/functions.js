export const stringToUnicode = (input) => {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += '\\u' + ('0000' + input.charCodeAt(i).toString(16)).slice(-4);
  }
  return result;
}
