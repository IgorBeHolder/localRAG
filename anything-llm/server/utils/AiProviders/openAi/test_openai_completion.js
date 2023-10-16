/*
script to test the openai api call
need to set the OPENAI_API_KEY environment variable
if moved to the server folder, need to change the path to the .env file
*/

const path = require('path');  //  The path module provides utilities for working with file and directory paths.
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });  //  dotenv is used to load environment variables from the .env file.

// const { OpenAi } = require("./server/utils/AiProviders/openAi");  //  Importing the OpenAi class from a local file.
const { OpenAi } = require(".")
const openAiInstance = new OpenAi();  //  Initializing an instance of OpenAi.

const modelName = process.env.OPEN_MODEL_PREF;  //  Fetching the preferred model name from the .env file.

const prompt_ = "Why people prefer spring time?";


//////////  using custom wrapper functions  //////////
// openAiInstance.getChatCompletion(  //  Making an API request to OpenAi using the defined instance.
//     [
//         { role: "user", content: prompt }
//     ],
//     { temperature: 0.7 }
// )
// .then(response => {
//     console.log("Response:", response);  //  On success, the response is printed.
// })
// .catch(error => {
//     console.error("Error fetching chat completion:", error);  //  Any error during the request is caught and printed.
// });


/////  print out all the methods available in the openai object  /////
// const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(openAiInstance.openai))
// .filter(name => typeof openAiInstance.openai[name] === 'function');


// console.log(methods);

// openAiInstance.openai.listModels().then(response => {
//     console.log(response);
// }
// ).catch(error => {
//     console.error("Error:", error);
// }
// );



// testing legacy api call
const model =   "gpt-3.5-turbo" // "text-davinci-003"; //
openAiInstance.openai.createCompletion({
    model:model, 
    prompt: prompt_,
    max_tokens:100,
    temperature:0.7,
  })
  .then(response => {
      console.log('>>', model, response["data"]["choices"][0]["text"]);
  })
  .catch(error => {
      console.error("Error:", error);
  });
  
