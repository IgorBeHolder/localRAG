const {Document} = require("../../../models/documents");
const {Telemetry} = require("../../../models/telemetry");
const {DocumentVectors} = require("../../../models/vectors");
const {Analyst} = require("../../../models/analyst");
const {AnalystChats} = require("../../../models/analystChats");
const {
  convertToChatHistory,
  chatWithAnalyst
} = require("../../../utils/chats");
const {getVectorDbClass} = require("../../../utils/helpers");
const {multiUserMode, reqBody} = require("../../../utils/http");
const {validApiKey} = require("../../../utils/middleware/validApiKey");

function apiAnalystEndpoints(app) {
  if (!app) return;

  app.post("/v1/analyst/new", [validApiKey], async (request, response) => {
    /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Create a new analyst'
    #swagger.requestBody = {
        description: 'JSON object containing new display name of analyst.',
        required: true,
        type: 'object',
        content: {
          "application/json": {
            example: {
              name: "My New Analyst",
            }
          }
        }
      }
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              analyst: {
                "id": 79,
                "name": "Sample analyst",
                "slug": "sample-analyst",
                "createdAt": "2023-08-17 00:45:03",
                "openAiTemp": null,
                "lastUpdatedAt": "2023-08-17 00:45:03",
                "openAiHistory": 20,
                "openAiPrompt": null
              },
              message: 'Analyst created'
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
    try {
      const {name = null} = reqBody(request);
      const {analyst, message} = await Analyst.new(name);
      await Telemetry.sendTelemetry("analyst_created", {
        multiUserMode: multiUserMode(response),
        LLMSelection: process.env.LLM_PROVIDER || "openai",
        VectorDbSelection: process.env.VECTOR_DB || "pinecone"
      });
      response.status(200).json({analyst, message});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/v1/analysts", [validApiKey], async (request, response) => {
    /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'List all current analysts'
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              analysts: [
                {
                  "id": 79,
                  "name": "Sample analyst",
                  "slug": "sample-analyst",
                  "createdAt": "2023-08-17 00:45:03",
                  "openAiTemp": null,
                  "lastUpdatedAt": "2023-08-17 00:45:03",
                  "openAiHistory": 20,
                  "openAiPrompt": null
                }
              ],
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
    try {
      const analysts = await Analyst.where();
      response.status(200).json({analysts});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.get("/v1/analyst/:slug", [validApiKey], async (request, response) => {
    /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Get a analyst by its unique slug.'
    #swagger.path = '/v1/analyst/{slug}'
    #swagger.parameters['slug'] = {
        in: 'path',
        description: 'Unique slug of analyst to find',
        required: true,
        type: 'string'
    }
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              analyst: {
                "id": 79,
                "name": "My analyst",
                "slug": "my-analyst-123",
                "createdAt": "2023-08-17 00:45:03",
                "openAiTemp": null,
                "lastUpdatedAt": "2023-08-17 00:45:03",
                "openAiHistory": 20,
                "openAiPrompt": null,
                "documents": []
              }
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
    try {
      const {slug} = request.params;
      const analyst = await Analyst.get({slug});
      response.status(200).json({analyst});
    } catch (e) {
      console.log(e.message, e);
      response.sendStatus(500).end();
    }
  });

  app.delete(
    "/v1/analyst/:slug",
    [validApiKey],
    async (request, response) => {
      /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Deletes a analyst by its slug.'
    #swagger.path = '/v1/analyst/{slug}'
    #swagger.parameters['slug'] = {
        in: 'path',
        description: 'Unique slug of analyst to delete',
        required: true,
        type: 'string'
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
      try {
        const {slug = ""} = request.params;
        const VectorDb = getVectorDbClass();
        const analyst = await Analyst.get({slug});

        if (!analyst) {
          response.sendStatus(400).end();
          return;
        }

        await AnalystChats.delete({analystId: Number(analyst.id)});
        await DocumentVectors.deleteForAnalyst(Number(analyst.id));
        await Document.delete({analystId: Number(analyst.id)});
        await Analyst.delete({id: Number(analyst.id)});
        try {
          await VectorDb["delete-namespace"]({namespace: slug});
        } catch (e) {
          console.error(e.message);
        }
        response.sendStatus(200).end();
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/v1/analyst/:slug/update",
    [validApiKey],
    async (request, response) => {
      /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Update analyst settings by its unique slug.'
    #swagger.path = '/v1/analyst/{slug}/update'
    #swagger.parameters['slug'] = {
        in: 'path',
        description: 'Unique slug of analyst to find',
        required: true,
        type: 'string'
    }
    #swagger.requestBody = {
      description: 'JSON object containing new settings to update a analyst. All keys are optional and will not update unless provided',
      required: true,
      type: 'object',
      content: {
        "application/json": {
          example: {
            "name": 'Updated Analyst Name',
            "openAiTemp": 0.2,
            "openAiHistory": 20,
            "openAiPrompt": "Respond to all inquires and questions in binary - do not respond in any other format."
          }
        }
      }
    }
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              analyst: {
                "id": 79,
                "name": "My analyst",
                "slug": "my-analyst-123",
                "createdAt": "2023-08-17 00:45:03",
                "openAiTemp": null,
                "lastUpdatedAt": "2023-08-17 00:45:03",
                "openAiHistory": 20,
                "openAiPrompt": null,
                "documents": []
              },
              message: null,
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
      try {
        const {slug = null} = request.params;
        const data = reqBody(request);
        const currAnalyst = await Analyst.get({slug});

        if (!currAnalyst) {
          response.sendStatus(400).end();
          return;
        }

        const {analyst, message} = await Analyst.update(
          currAnalyst.id,
          data
        );
        response.status(200).json({analyst, message});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.get(
    "/v1/analyst/:slug/chats",
    [validApiKey],
    async (request, response) => {
      /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Get a analysts chats regardless of user by its unique slug.'
    #swagger.path = '/v1/analyst/{slug}/chats'
    #swagger.parameters['slug'] = {
        in: 'path',
        description: 'Unique slug of analyst to find',
        required: true,
        type: 'string'
    }
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              history: [
                {
                  "role": "user",
                  "content": "What is AnythingLLM?",
                  "sentAt": 1692851630
                },
                {
                  "role": "assistant",
                  "content": "AnythingLLM is a platform that allows you to convert notes, PDFs, and other source materials into a chatbot. It ensures privacy, cites its answers, and allows multiple people to interact with the same documents simultaneously. It is particularly useful for businesses to enhance the visibility and readability of various written communications such as SOPs, contracts, and sales calls. You can try it out with a free trial to see if it meets your business needs.",
                  "sources": [{"source": "object about source document and snippets used"}]
                }
              ]
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
      try {
        const {slug} = request.params;
        const analyst = await Analyst.get({slug});

        if (!analyst) {
          response.sendStatus(400).end();
          return;
        }

        const history = await AnalystChats.forAnalyst(analyst.id);
        response.status(200).json({history: convertToChatHistory(history)});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/v1/analyst/:slug/update-embeddings",
    [validApiKey],
    async (request, response) => {
      /*
    #swagger.tags = ['Analysts']
    #swagger.description = 'Add or remove documents from a analyst by its unique slug.'
    #swagger.path = '/v1/analyst/{slug}/update-embeddings'
    #swagger.parameters['slug'] = {
        in: 'path',
        description: 'Unique slug of analyst to find',
        required: true,
        type: 'string'
    }
    #swagger.requestBody = {
      description: 'JSON object of additions and removals of documents to add to update a analyst. The value should be the folder + filename with the exclusions of the top-level documents path.',
      required: true,
      type: 'object',
      content: {
        "application/json": {
          example: {
            adds: [],
            deletes: ["custom-documents/anythingllm-hash.json"]
          }
        }
      }
    }
    #swagger.responses[200] = {
      content: {
        "application/json": {
          schema: {
            type: 'object',
            example: {
              analyst: {
                "id": 79,
                "name": "My analyst",
                "slug": "my-analyst-123",
                "createdAt": "2023-08-17 00:45:03",
                "openAiTemp": null,
                "lastUpdatedAt": "2023-08-17 00:45:03",
                "openAiHistory": 20,
                "openAiPrompt": null,
                "documents": []
              },
              message: null,
            }
          }
        }
      }
    }
    #swagger.responses[403] = {
      schema: {
        "$ref": "#/definitions/InvalidAPIKey"
      }
    }
    */
      try {
        const {slug = null} = request.params;
        const {adds = [], deletes = []} = reqBody(request);
        const currAnalyst = await Analyst.get({slug});

        if (!currAnalyst) {
          response.sendStatus(400).end();
          return;
        }

        await Document.removeDocuments(currAnalyst, deletes);
        await Document.addDocuments(currAnalyst, adds);
        const updatedAnalyst = await Analyst.get(
          `id = ${Number(currAnalyst.id)}`
        );
        response.status(200).json({analyst: updatedAnalyst});
      } catch (e) {
        console.log(e.message, e);
        response.sendStatus(500).end();
      }
    }
  );

  app.post(
    "/v1/analyst/:slug/coder",
    [validApiKey],
    async (request, response) => {
      /*
   #swagger.tags = ['Analysts']
   #swagger.description = 'Execute a chat with a analyst'
   #swagger.requestBody = {
       description: 'prompt to send to the analyst and the type of conversation (query or chat).',
       required: true,
       type: 'object',
       content: {
         "application/json": {
           example: {
             message: "What is AnythingLLM?",
             mode: "query | chat"
           }
         }
       }
     }
   #swagger.responses[200] = {
     content: {
       "application/json": {
         schema: {
           type: 'object',
           example: {
              id: 'chat-uuid',
              type: "abort | textResponse",
              textResponse: "Response to your query",
              sources: [{title: "anythingllm.txt", chunk: "This is a context chunk used in the answer of the prompt by the LLM,"}],
              close: true,
              error: "null | text string of the failure mode."
           }
         }
       }
     }
   }
   #swagger.responses[403] = {
     schema: {
       "$ref": "#/definitions/InvalidAPIKey"
     }
   }
   */
      try {
        const {slug} = request.params;
        const {message, mode = "query"} = reqBody(request);
        const analyst = await Analyst.get({slug});

        if (!analyst) {
          response.sendStatus(400).end();
          return;
        }

        console.log('### request ###', message, mode);

        //const result = await chatWithAnalyst(analyst, message, mode);
        //await Telemetry.sendTelemetry("sent_chat", {
        //  LLMSelection: process.env.LLM_PROVIDER || "openai",
        //  VectorDbSelection: process.env.VECTOR_DB || "pinecone"
        //});


        response.status(200).json({...result});
      } catch (e) {
        response.status(500).json({
          id: uuidv4(),
          type: "abort",
          textResponse: null,
          sources: [],
          close: true,
          error: e.message
        });
      }
    }
  );
}

module.exports = {apiAnalystEndpoints};
