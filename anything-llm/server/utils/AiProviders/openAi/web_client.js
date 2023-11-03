const axios = require('axios');


async function v1_chat_completions(prompt) {
 
  const base_url = process.env.COMPLETION_MODEL_ENDPOINT;
  console.log('base_url:', base_url);
  const compl_model = process.env.COMPLETION_MODEL_NAME;
  console.log('compl_model:', compl_model);
  const url = base_url + '/v1/chat/completions';
  const payload = {
    "model": compl_model,
    "messages": prompt,
    "max_tokens": 512,
    "temperature": 0.33,
    // "top_p": 0.95,
    // "presence_penalty": 0,
    "frequency_penalty": 1.1
  };

  try {
    const response = await axios.post(url, payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content; // the COMPLETION text

  } catch (error) {
    console.error('Error sending payload (prompt):', error);
    return null;
  }
}




async function v1_embeddings_openllm(textInput) {

  const base_url = process.env.EMBEDDING_MODEL_ENDPOINT;
  const model = process.env.EMBEDDING_MODEL_NAME;
  console.log('base_url:', base_url);
  const url = base_url + '/v1/embeddings';
  console.log('url:', url);
  try {
    const { data: { data } } = await axios.post(url, {
      'model': model,
      'input': textInput
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    const response = data.length > 0 &&
      // return an array of embeddings
      data.every((embd) => embd.hasOwnProperty("embedding"))
      ? data.map((embd) => embd.embedding)
      : null;

    return response;
  }
  catch (error) {
    console.error('Error sending payload (textinput):', error);
    return null;
  }
}


module.exports = {
  v1_embeddings_openllm,
  v1_chat_completions
};
