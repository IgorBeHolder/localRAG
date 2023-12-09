export const API_BASE = import.meta.env.VITE_API_BASE || "/api";
export const CHAT_MAX_LENGTH = 16384;
export const DEFAULT_CHAT_OPTIONS = {
  openAiHistory: 16,
  openAiTemp: 0.2,
  openAiPrompt: "Вы полезный ассистент. Ваши ответы должны быть точными и краткими. Отвечайте на русском языке. Аргументируйте ваши ответы фактами."
};

export const AUTH_USER = "anythingllm_user";
export const AUTH_TOKEN = "anythingllm_authToken";
export const AUTH_TIMESTAMP = "anythingllm_authTimestamp";
