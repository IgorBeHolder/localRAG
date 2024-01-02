export const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export const ID_DEV = import.meta?.env?.hasOwnProperty('VITE_API_BASE');

// export const PYTHON_API = `http://${(import.meta.env.VITE_USE_DOCKER === "FALSE" || !ID_DEV) ? "localhost" : "0.0.0.0"}:3005`;
export const PYTHON_API = `http://${(import.meta.env.VITE_USE_DOCKER === "FALSE" || !ID_DEV) ? "localhost" : "0.0.0.0"}:3005`;
export const UPLOAD_FILENAME_LEN_LIMIT = 68;
export const CHAT_MAX_LENGTH = 16384;
export const TYPE_EFFECT_DELAY = 20;
export const TYPE_STRING_DELAY = 10;
export const WS_RECONNECT_ATTEMPTS = 10;
export const WS_URL = import.meta.env.VITE_USE_DOCKER === "FALSE" ? ("ws://localhost:" + (process.env.WS_PORT || process.env.VITE_WS_PORT || 3006)) : "ws://localhost:3006";

console.log('ID_DEV', ID_DEV, import.meta?.env?.hasOwnProperty('VITE_API_BASE'), 'PYTHON_API', PYTHON_API, 'WS_URL', WS_URL);

export const MSG_STYLE = (user = false) => {
  return "p-2 xl:p-4 w-fit max-w-[75%] rounded-t-2xl " + (user ? "rounded-bl-2xl rounded-br-sm mr-2" : "rounded-br-2xl rounded-bl-sm ml-2");
};

export const DEFAULT_CHAT_OPTIONS = {
  openAiHistory: 10,
  openAiTemp: 0.2,
  openAiPrompt: "Вы полезный ассистент. Ваши ответы должны быть точными, краткими, конкретными и убедительными. Отвечайте на русском языке. Стройте план своих последовательных рассуждений, чтобы гарантировать правильный ответ на вопрос пользователя. Аргументируйте ваши ответы фактами."
};

export const AUTH_USER = "anythingllm_user";
export const AUTH_TOKEN = "anythingllm_authToken";
export const AUTH_TIMESTAMP = "anythingllm_authTimestamp";
