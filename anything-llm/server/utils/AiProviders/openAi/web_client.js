const axios = require('axios');
const path = require('path');

async function v1_chat_completions(prompt) {
  console.log('**** v1_embeddings_openllm ****', path.resolve(__dirname, 'docker/.env'));
  require('dotenv').config({ path: path.resolve(__dirname, 'docker/.env') }); 
  const base_url = process.env.COMPLETION_MODEL_ENDPOINT;
  console.log('base_url:', base_url);
  const compl_model = process.env.COMPLETION_MODEL_NAME;
  console.log('compl_model:', compl_model);
  const url = base_url + '/v1/chat/completions';
  const payload = {
    "model": compl_model,
    "messages": prompt,
    "max_tokens": 1024,
    "temperature": 0.33
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
  console.log('**** v1_embeddings_openllm ****', path.resolve(__dirname, 'docker/.env'));
  require('dotenv').config({ path: path.resolve(__dirname, 'docker/.env') }); 
  const base_url = process.env.EMBEDDING_MODEL_ENDPOINT;
  console.log('base_url:', base_url);
  const url = base_url + '/v1/embeddings';
  console.log('url:', url);
  try {
    const { data: { data } } = await axios.post(url, {
      'model': 'sentence-transformers/all-MiniLM-L6-v2',
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
