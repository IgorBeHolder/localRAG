const axios = require('axios');

async function v1_chat_completions(prompt) {
  // require('dotenv').config({ path: '../../../.env' });
  const base_url = process.env.LLAMA_ENDPOINT;
  const url = base_url + '/v1/chat/completions';
  const payload = {
    "messages": prompt,
    "max_tokens": 250,
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
  // require('dotenv').config({ path: '../../../.env' });
  const base_url = process.env.OPENLLM_ENDPOINT;
  const url = base_url + '/v1/embeddings';
  try {
    const { data: { data } } = await axios.post(url, textInput, {
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
