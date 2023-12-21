export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const IS_CODER = import.meta.env.VITE_IS_CODER === "TRUE" || false;
export const CHAT_MAX_LENGTH = 16384;
export const WS_URL = "ws://localhost:3030";

export const MSG_STYLE = (user = false) => {
  return "p-2 xl:p-4 w-fit max-w-[75%] rounded-t-2xl " + (user ? "rounded-bl-2xl rounded-br-sm mr-2" : "rounded-br-2xl rounded-bl-sm ml-2");
};

export const DEFAULT_CHAT_OPTIONS = {
  openAiHistory: 10,
  openAiTemp: 0.2,
  openAiPrompt: "Вы полезный ассистент. Ваши ответы должны быть точными и краткими. Отвечайте на русском языке. Стройте план своих последовательных рассуждений, чтобы гарантировать правильный ответ на вопрос пользователя. Аргументируйте ваши ответы фактами."
};

export const AUTH_USER = "anythingllm_user";
export const AUTH_TOKEN = "anythingllm_authToken";
export const AUTH_TIMESTAMP = "anythingllm_authTimestamp";
