// "семантический" поиск:
const {
  v1_chat_completions,
  v1_embeddings_openllm
} = require("anything-llm/server/utils/AiProviders/openAi/web_client.js");
const {response} = require("express");
const fs = require("fs");


async function sem_search(text_prompt) {
  // read the KEYS from the file
  fs.readFile("coder/interpreter/terminal_interface/da-osp.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }

    const jsonData = JSON.parse(data);

    const key_list = Object.keys(jsonData);
    const key_list_string = key_list.join(", ");

    console.log(key_list_string);
  });

  const sys_prompt = "Вы полезный поисковый ассистент. Ваши ответы должны быть точными и краткими. Отвечайте на русском языке. Стройте план своих последовательных рассуждений, чтобы гарантировать правильный ответ на вопрос пользователя.";
  const prompt = `
    Q: Какое из выражений '${key_list_string}' точно соответствует фразе 'Выполните EDA для файла 'data.csv' и сохраните отчет.'?
    A: разведочный (EDA) aнализ
    Q: Какое из выражений '${key_list_string}' точно соответствует фразе 'Как на линукс обновить apt'?
    A: "нет точного соответствия"
    Q: Какое из выражений '${key_list_string}' точно соответствует фразе '${text_prompt}'?
    A:
    `;
  const messages = [
    {
      role: "system",
      content: sys_prompt
    },

    ...chatHistory,
    {role: "user", content: prompt}
  ];

  const response = await v1_chat_completions(messages, temperature = 0); // search for the response (value from da-osp.txt)
  console.log("response:", response);
  // finally process the prompt (concatenate the response with the prompt)
  const process_response = jsonData[response] === "нет точного соответствия" ? "" : jsonData[response] ?? "";

  return process_response + "\n" + text_prompt;
}

module.exports = {
  sem_search
};
