/*
script to test the openai api call for embeddings
need to set the OPENAI_API_KEY environment variable
if moved to the server folder, need to change the path to the .env file
*/

const path = require('path');  //  The path module provides utilities for working with file and directory paths.
require('dotenv').config({ path: path.resolve(__dirname, './server/.env') });  //  dotenv is used to load environment variables from the .env file.

const { OpenAi } = require(".");  //  Importing the OpenAi class from a local file.
const openAiInstance = new OpenAi();  //  Initializing an instance of OpenAi.

const modelName = "gpt-3.5-turbo" //process.env.OPEN_MODEL_PREF;  //  Fetching the preferred model name from the .env file.

const prompt = "Nice to meet you!";  //  The prompt is the starting point for the AI to generate a response.


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
// const model = "text-davinci-003"; //"gpt-3.5-turbo-instruct";
// openAiInstance.openai.createEmbedding({
//     model:"text-embedding-ada-002", 
//     input: "you",
//   })
//   .then(response => {
//       console.log('>>',  response.data);
//   })
//   .catch(error => {
//       console.error("Error:", error);
//   });
  
openAiInstance.openai.createEmbedding({
    model: "text-embedding-ada-002",
    input: "you",
  }).then((response) => {
    const data = response.data.data;
  
    if (data.length > 0 && data.every((embd) => embd.hasOwnProperty("embedding"))) {
      console.log('All objects have an embedding property. Returning the embeddings...');
      const embeddings = data.map((embd) => embd.embedding);
      console.log(embeddings);
      return embeddings;
    } else {
      console.log('Not all objects have an embedding property or the data array is empty. Returning null...');
      return null;
    }
  }).catch((error) => {
    console.log('An error occurred:', error);
  });
  
  

