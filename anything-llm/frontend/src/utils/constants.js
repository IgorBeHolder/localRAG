export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const IS_CODER = import.meta.env.VITE_IS_CODER === "TRUE" || false;
export const CHAT_MAX_LENGTH = 16384;
export const WS_URL = "ws://localhost:3030";

export const DEFAULT_CHAT_OPTIONS = {
  openAiHistory: 10,
  openAiTemp: 0.2,
  openAiPrompt: "Вы полезный ассистент. Ваши ответы должны быть точными и краткими. Отвечайте на русском языке. Стройте план своих последовательных рассуждений, чтобы гарантировать правильный ответ на вопрос пользователя. Аргументируйте ваши ответы фактами."
};

export const AUTH_USER = "anythingllm_user";
export const AUTH_TOKEN = "anythingllm_authToken";
export const AUTH_TIMESTAMP = "anythingllm_authTimestamp";
