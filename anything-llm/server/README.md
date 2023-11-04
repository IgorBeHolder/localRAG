# TUNING THE PROMPT

## Prompt for the chat
### Chat with workspace
`anything-llm/server/endpoints/api/workspace/index.js`:487  chatWithWorkspace ->
#### hasVectorizedSpace ?
NO:
`anything-llm/server/utils/AiProviders/OpenAi/index.js`:76
`anything-llm/server/utils/chats/index.js`:100  - sendChat  ->
`anything-llm/server/utils/AiProviders/openAi/index.js`:76     PROMPT_TEMPLATE 


YES:
`anything-llm/server/utils/AiProviders/OpenAi/index.js`:136  - query ->
`anything-llm/server/utils/vectorDbProviders/lance/index.js`:254 - prompt  
 getChatCompletion ->
`anything-llm/server/utils/AiProviders/openAi/index.js`:76
