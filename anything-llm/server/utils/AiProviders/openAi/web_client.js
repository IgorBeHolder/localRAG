const axios = require('axios');
const { prompt_templates } = require('../../vectorDbProviders/lance/index');
const { fetchModelName } = require("./model_name_fetch");
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

  const base_url = process.env.COMPLETION_MODEL_ENDPOINT;
  const url_ = base_url + '/v1/models';
  // async mode
  // fetchModelName(url_)
  // .then(modelId => {
  //   if (modelId) {
  //     global.COMPLETION_MODEL_NAME = modelId;
  //     console.log("*** COMPLETION_MODEL_NAME", modelId);
  //   } else {
  //     console.log('No model ID returned or error occurred');
  //   }
  // })
  // .catch(error => {
  //   console.error('Error in fetching model:', error);
  // });

  // sync mode
  try {
    const modelId = fetchModelName(url_);
    if (modelId) {
      global.COMPLETION_MODEL_NAME = modelId;
      console.log("*** COMPLETION_MODEL_NAME", modelId);
    } else {
      console.log('No model ID returned or error occurred');
    }
  } catch (error) {
    console.error('Error in fetching model:', error);
  }


  // const messages2string = format_messages(messages);
  const messages2string = messages;  // skip the formatting

  const url = base_url + '/v1/chat/completions';
  const R_PENALTY = process.env.R_PENALTY;
  const F_PENALTY = process.env.F_PENALTY;
  const P_PENALTY = process.env.P_PENALTY;
  const L_PENALTY = process.env.L_PENALTY;
  const MAX_TOKENS = process.env.MAX_TOKENS;
  const TOP_P = process.env.TOP_P;
  const TOP_K = process.env.TOP_K;
  const STOP = ["<|im_end|>", "<|im_start|>", "<|end_of_turn|>"];
  const compl_model = global.COMPLETION_MODEL_NAME;


  console.log('v1_chat_completions: *** url:', url);
  console.log('v1_chat_completions: *** completion_model:', compl_model);
  console.log('v1_chat_completions: *** temperature:', temperature);
  console.log('v1_chat_completions: *** repetition_penalty R_PENALTY:', R_PENALTY);
  console.log('v1_chat_completions: *** frequency_penalty F_PENALTY:', F_PENALTY);
  console.log('v1_chat_completions: *** presence_penalty P_PENALTY:', P_PENALTY);
  console.log('v1_chat_completions: *** length_penalty L_PENALTY:', L_PENALTY);
  console.log('v1_chat_completions: *** max_tokens:', MAX_TOKENS);
  console.log('v1_chat_completions: *** top_p:', TOP_P);
  console.log('v1_chat_completions: *** top_k:', TOP_K);
  console.log('v1_chat_completions: *** stop:', STOP);


  console.log('v1_chat_completions: *** messages:', messages2string);

  const payload = {
    // add the prefix to the model name like '/app'
    "model": compl_model,
    "messages": messages2string,
    "temperature": temperature,
    "top_p": TOP_P,
    "top_k": TOP_K,
    "repetition_penalty": R_PENALTY,
    // "frequency_penalty": F_PENALTY,
    // "max_tokens": MAX_TOKENS,
    // "presence_penalty": P_PENALTY,
    // "length_penalty": L_PENALTY,
    // "tokenizer.ggml.add_bos_token": "false",
    "stop": STOP
    // "spaces_between_special_tokens": "False"

  };

  // https://github.com/vllm-project/vllm/blob/main/vllm/sampling_params.py

  try {
    const response = await axios.post(url, payload,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return response?.data?.choices?.[0]?.message?.content ?? compl_model + " not answered";

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
    return data.length > 0 &&
      // return an array of embeddings
      data.every((embd) => embd.hasOwnProperty("embedding"))
      ? data.map((embd) => embd.embedding)
      : null;
  } catch (error) {
    console.error('Error sending payload (textinput):', error);
    return null;
  }
}


module.exports = {
  v1_embeddings_openllm,
  v1_chat_completions
};
