// "семантический" поиск:
const {
  v1_chat_completions,
  v1_embeddings_openllm
} = require("../openAi/web_client.js");
const {response} = require("express");
const fs = require("fs");

async function sem_search(text_prompt) {
  // read the KEYS from the file

  return new Promise((res, rej) => {
    // search for the response (value from da-osp.txt)
    fs.readFile("../../coder/interpreter/terminal_interface/da-osp.txt", "utf8", (err, data) => {
      if (err) {
        rej(err);
      }

      res(data);
    });
  }).then(data => {
    const jsonData = JSON.parse(String(data));

    console.log('readFile', data);

    const key_list = Object.keys(jsonData);

    console.log('key_list');

    const key_list_string = key_list.join(", ");

    console.log('key_list_string', key_list_string);

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
        role: "system", content: sys_prompt
      },
      {role: "user", content: prompt}
    ];

    return new Promise((res, rej) => {
      v1_chat_completions(messages, 0).then(data => {
        // finally process the prompt (concatenate the response with the prompt)
        res(data);
      });
    }).then(response => {
      debugger;

      const process_response = response !== null ? (jsonData[response] === "нет точного соответствия" ? "" : jsonData[response] ?? "") : "";

      console.log("v1_chat_completions_response", response, process_response);

      return process_response + "\n" + text_prompt;
    });
  }).catch(err => {
    console.error("Error reading the file:", err);
  });
}




module.exports = {
  sem_search
};
