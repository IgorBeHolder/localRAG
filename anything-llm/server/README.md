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

# Running the app locally (dev mode)

Ensure:
* `anything-llm/frontend/.env` is filled out with the correct values
* `anything-llm/server/.env.development` define the actual endpoints for the backend:
1. `COMPLETION_MODEL_ENDPOINT=http://194.135.112.219:3003` - the GPU endpoint for the completion model
2. `EMBEDDING_MODEL_ENDPOINT=http://localhost:3004` - the endpoint for the embedding model

3. `DATABASE_URL` - choose the right endpoint for the postgres database and
4. ensure postgres vector database is running on `localhost:5432`. To run in dev mode, use `embed-server/app/bootstrap.py` to start the server.
5. ensure document processor is running on `localhost:3005`. To run in dev mode, use `./start-dp.sh` to start the server. To free up the port, use `lsof -i :3005 | awk 'NR>1 {print $2}' | xargs kill -9` to stop the server.