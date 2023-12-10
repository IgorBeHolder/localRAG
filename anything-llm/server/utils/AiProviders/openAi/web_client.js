const axios = require('axios');
const { prompt_templates } = require('../../vectorDbProviders/lance/index');
const { BOS, EOS, assistance_prefix, end_of_turn, user_prefix } = prompt_templates();


function format_messages(messages = []) {
  const formattedHistory = [];

  messages.forEach((messagesItem) => {
    const { role, content } = messagesItem;

    // Determine the prefix based on the role
    const prefix = role === "user" ? user_prefix : (role === "system" ? BOS : assistance_prefix);
    EOT = role === "system" ? EOS : end_of_turn;

    // Add the formatted item to the history array
    formattedHistory.push({ role: role, content: prefix + content + EOT });
  });

  // Extract the content from each item and join them into a string
  // const flattenedContent = formattedHistory.map(item => item.content).join("");
  // return flattenedContent;
  return formattedHistory;
}



async function v1_chat_completions(messages, temperature) {
 
  // const messages2string = format_messages(messages);
  const messages2string = messages;

  const base_url = process.env.COMPLETION_MODEL_ENDPOINT;
  console.log('v1_chat_completions: *** base_url:', base_url);
  const compl_model = process.env.COMPLETION_MODEL_NAME;
  console.log('v1_chat_completions: *** completion_model:', compl_model);
  console.log('v1_chat_completions: *** temperature:', temperature);
  console.log('v1_chat_completions: *** messages:', messages2string);
  const url = base_url + '/v1/chat/completions';
  const payload = {
    "model":   "/model-store/" + compl_model,
    "messages": messages2string,
    // "max_tokens": 512,
    "temperature": temperature,
    "top_p": 0.95,
    // "presence_penalty": 0,
    "frequency_penalty": 1.3
  };
  // The presence penalty is a one - off additive contribution that applies to all tokens that
  // have been sampled at least once and the frequency penalty is a contribution that is proportional 
  // to how often a particular token has already been sampled.

  // Reasonable values for the penalty coefficients are around 0.1 to 1 if the aim is to just reduce 
  // repetitive samples somewhat.If the aim is to strongly suppress repetition, then one can increase 
  // the coefficients up to 2, but this can noticeably degrade the quality of samples.Negative values 
  // can be used to increase the likelihood of repetition.
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
