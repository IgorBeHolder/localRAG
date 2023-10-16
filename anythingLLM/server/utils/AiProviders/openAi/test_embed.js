/*
script to test the openai api call
need to set the OPENAI_API_KEY environment variable
if moved to the server folder, need to change the path to the .env file

index.js:157  set  const IS_OFFLINE = true;
*/

// process.env doesn't work so we need to use dotenv
// 
const path = require('path');  //  The path module provides utilities for working with file and directory paths.
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });  //  dotenv is used to load environment variables from the .env file.


const { OpenAi } = require(".");
const openAiInstance = new OpenAi();

// input should be an array of strings
const textChunks = "The quick brown fox jumped over the lazy dog";
// const textChunks = ["The quick brown fox jumped over the lazy dog",
//     "The quick brown fox jumped over the lazy dog",
//     "The quick brown fox jumped over the lazy dog"];



const resPromise = openAiInstance.embedChunks(textChunks);

resPromise.then(res => {
    console.log('embeddings >>>:',res);
}).catch(error => {
    console.error("Error:", error);
});

