// "семантический" поиск:
const {
  v1_chat_completions,
  v1_embeddings_openllm
} = require("../openAi/web_client.js");
const fs = require("fs");

function sem_search(text_prompt, no_matches_phrase, cb) {
  // read the KEYS from the file

  new Promise((res, rej) => {
    // search for the response (value from da-osp.txt)
    fs.readFile("../../coder/interpreter/terminal_interface/da-osp.txt", "utf8", (err, data) => {
      if (err) {
        rej(err);
      }

      res(data);
    });
  }).then(data => {
    const jsonData = JSON.parse(String(data));

    const key_list = Object.keys(jsonData);

    const key_list_string = key_list.map(m => `"${m}"`).join(",");

    const sys_prompt = `Вы полезный поисковый ассистент. Ваши ответы должны быть точными и краткими. Отвечайте на русском языке. Выбирайте только из предложенных вариантов или укажите, что "${no_matches_phrase}".`;
    const prompt = `
    Q: Какое из выражений [${key_list_string}] точно соответствует фразе 'Выполните EDA для файла 'data.csv' и сохраните отчет.'?
    A: разведочный (EDA) aнализ
    Q: Какое из выражений [${key_list_string}] точно соответствует фразе 'Как на линукс обновить apt'?
    A: "${no_matches_phrase}"
    Q: Какое из выражений [${key_list_string}] точно соответствует фразе '${text_prompt}'?
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
      const process_response = response !== null ? (jsonData[response] === no_matches_phrase ? "" : jsonData[response] ?? "") : "";
      cb({result: (process_response + "\nQ:" + text_prompt + "\A:").trim()});
    });
  }).catch(err => {
    cb({error: err});
  });
}


module.exports = {
  sem_search
};
