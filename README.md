# 3LM (Local Large Language Models)
is based on or inspired from other projects:  
* [AnythingLLM](https://github.com/Mintplex-Labs/anything-llm) frontend + backend(serving online openai models by subscription, api key is required)  
* [llama-cpp-python](https://github.com/abetlen/llama-cpp-python) (backend server to run LLMs locally).  
localGPT (backend server to run GPT-3 locally)  
* [localGPT](https://github.com/PromtEngineer/localGPT) is an open-source initiative that allows you to converse with your documents without compromising your privacy. 


# Production
### Initialize the database with the following command:
`cd anything-llm && git checkout main && yarn prisma:generate && yarn prisma:migrate && yarn prisma:seed && cd ..`  

### Create a network for the docker containers to communicate with each other:
`docker network create llm-net`

### LLM server (mm):3003 or external url (defined in "embed-server/nginx/local-rag-docs.conf")
`./start-mm.sh` ('mm' stands for 'main model')

### Embeddings server (em)  :3004 (maybe exposed inside the container only, check "embed-server/docker-compose.yml") 
`./start-em.sh` ('em' stands for 'embeddings model')

### To launch the main application :3001
`./start.sh`
* adjust the chunk size for document processor  
 `anything-llm/server/utils/vectorDbProviders/lance/index.js`:166   chunkSize=800  
On average, a word in English is about 4.7 characters long. 
On the other side, one word in English is about 1.5 token long.
For the given max_seq_length=256 (tokens) the chunk size should be 256/1.5*4.7=802 characters. 
For the given max_seq_length=512 (tokens) the chunk size should be 512/1.5*4.7=1604 characters. 
But many embed-models were trianed on max_seq_length=256, so we use 800 as a compromise.

### Document processor (dp) server running on :3005
While in a container all servers communicate using llm-net network.
To start dp server in a separate proccess on host machine:
change `anything-llm/server/utils/files/documentProcessor.js`:6 to const PYTHON_API = "http://0.0.0.0:3005";
and run from root `./start-dp.sh` ('dp' stands for 'document processor')
In a container it is already set to "http://localhost:3005".



## Development installation:
#### prerequisits:
  Install Docker on your computer or machine.
  access to an LLM like GPT-3.5, GPT-4 (api-key)
1. `cd anything-llm`  `yarn setup` (creates .env files for you to fill)
1. `cd server/` and edit .env file and update the variables (this is DEVELOPMENT area)
1. Set `DISABLE_TELEMETRY` in your server or docker .env settings to "true" to opt out of telemetry.
```
DISABLE_TELEMETRY="true"
```

1. check unused ports  `lsof -i :3003` (do not use 3000-3001)
   copy model file to `localRAG/model-store` (e.g. `llama-2-7b-chat.Q4_K_M.gguf`)
   `./start-mm.sh`  (this will start the main model server on port 3003)
1. check unused ports  `lsof -i :3004` (do not use 3000-3001)
   embed-server/docker-compose.yml: 
    ports:
      - "3004:3004" (expose port 3004)
   `./start-em.sh` (this will start the embeddings server on port 3004)
1. check in 'anything-llm/server/utils/files/documentProcessor.js:6'
    const PYTHON_API = "http://0.0.0.0:3005";  //  doc server running on host machine
    `lsof -i :3005 | awk 'NR>1 {print $2}' | xargs kill -9` free port 3005
   `./start-dp.sh` (this will start the document processor server on port 3005)
1. `cd anything-llm/server && yarn dev` this will start the backend server on port 3001
1. `cd anything-llm/client && yarn dev` this will start the client application on port 3000


## Changing the main model

1. copy the model file to `localRAG/model-store` (e.g. `llama-2-7b-chat.Q4_K_M.gguf`)  
   scripts like `copy-mistral.sh` can help with that
* **'CPU" case**: edit `localRAG/client-files/.env` and change the `DEVICE` and `COMPLETION_MODEL_NAME` field to the name of the new    model file
               define `COMPLETION_MODEL_ENDPOINT` also if you want to use a different endpoint  
               execute `./start-mm.sh` script to start the main model server
*   **'GPU" case**: edit `vllm/docker/docker-compose.yml` (change the model name and endpoint)  
               execute `./start-vllm.sh` script to start the main model server


## Changing the embeddings model

1. copy the model file to `localRAG/model-store` (e.g. `sentence-transformers/all-MiniLM-L6-v2`)
   scripts like `copy-mistral.sh` can help with that
1. edit `localRAG/client-files/.env` and change the `EMBEDDINGS_MODEL_NAME` field to the name of the new model file
   define `EMBEDDINGS_MODEL_ENDPOINT` also if you want to use a different endpoint
1. execute `./start-em.sh` script to start the embeddings model server


## Database reset

1. `./db-reset.sh`

## Change the number of citations 

`anything-llm/server/utils/vectorDbProviders/lance/index.js`:62   .limit(3)


