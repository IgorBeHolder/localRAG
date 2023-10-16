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

### LLM server (mm):3003
`./start-mm.sh` ('mm' stands for 'main model')

### Embeddings server (em)  :3004
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
### 1.  anythingllm server
#### prerequisits:
  Install Docker on your computer or machine.
  access to an LLM like GPT-3.5, GPT-4 (api-key)
1. `cd anything-llm`  `yarn setup` (creates .env files for you to fill)
2. `cd docker/` and edit in .env file and update the variables
3. Set `DISABLE_TELEMETRY` in your server or docker .env settings to "true" to opt out of telemetry.
```
DISABLE_TELEMETRY="true"
```
4. `docker-compose up -d --build` to build the image - this will take a few moments.
Your docker host will show the image as online once the build process is completed.
This will build the app to http://localhost:3001

### 2. llama server
1. check unused ports  `lsof -i :3003` (do not use 3000-3001)
1. copy model file to `llama-cpp-python/models` (e.g. `llama-2-7b-chat.Q4_K_M.gguf`)
3. `cd llama-cpp-python/docker/simple`
2. `docker-compose up -d --build` run server









