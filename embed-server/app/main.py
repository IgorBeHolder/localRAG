import os
import uuid
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from typing import Dict, List, Optional, Union

from asyncpg import Connection, create_pool
from db import insert_to_db, get_similar_text, vectorize_document

from fastapi import Depends, FastAPI, HTTPException, Request, UploadFile, File
from fastapi.responses import JSONResponse
from models.model_manager import ModelManager
from pydantic import BaseModel, Field


# from services.x_auth_token import get_x_token_key


PORT = int(os.getenv("EM_PORT", 3004))
HOST = os.getenv("HOST", "0.0.0.0")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "no_name_model")
DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/postgres"
)


@asynccontextmanager
async def get_db_connection(request: Request) -> Connection:
    """Asynchronous context manager for acquiring and releasing
    a database connection from a connection pool
    """
    async with request.app.state.db_pool.acquire() as connection:
        yield connection  # return connection to the pool


@asynccontextmanager
async def app_lifespan(app: FastAPI) -> None:
    """Asynchronous context manager for initializing and closing
    the database connection pool when the application starts and stops
    """
    global embed_model
    embed_model = ModelManager()
    app.state.db_pool = await create_pool(DATABASE_URL)
    yield  # the FastAPI app runs and serves requests
    await app.state.db_pool.close()


app = FastAPI(
    lifespan=app_lifespan,
    # dependencies=[Depends(get_x_token_key)],
    title="Document Embedding Microservice",
    description="""
    This microservice uses a LLM to solve NLP related problems.
            """,
)


# /v1/embeddings ******************************************************************************
class EmbeddingInput(BaseModel):
    """Define the input schema for the /v1/embeddings endpoint."""

    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model used to generate the embeddings.",
    )
    input: Union[str, List[str]] = Field(
        default=[
            "This is an example sentence",
            "Each sentence is converted",
            "to a vector",
            "using the model",
            "and then returned as a list of vectors.",
            "Here is another sentence.",
            "How many sentences can this model embed at once?",
            "This model can embed up to 256 tokens at once.",
            "The average sentence is about 15 tokens long.",
            "So you can embed about 17 sentences at once.",
            "But you can also embed just one sentence at a time.",
            "This is useful if you want to embed a single sentence.",
            "Or if you want to embed a sentence that is longer than 256 tokens.",
            "This model was trained on the English Wikipedia.",
        ],
        description="List of text strings to generate embeddings for.",
    )


class EmbeddingData(BaseModel):
    """Define the output schema for the EmbeddingData.
    Used in the EmbeddingOutput schema.
    uuid and usage are optional fields. (v1/ingest endpoint)
    """

    object: str = Field(example="embedding")
    embedding: List[float]
    index: int
    usage: Optional[Dict[str, int]] = Field(
        default=None,
        description="List of estimated token usage.",
    )


class EmbeddingOutput(BaseModel):
    """Define the output schema for the embeddings endpoint."""

    object: str = Field(default="list", example="list")
    data: List[EmbeddingData] = Field(
        description="List of generated embeddings for the input text."
    )
    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="Estimated token usage.",
    )


# Creates a pool of threads that can execute calls asynchronously
executor = ThreadPoolExecutor(max_workers=os.cpu_count() // 2)

embed_model: Optional[ModelManager] = None


@app.post(
    "/v1/embeddings",
    response_model=EmbeddingOutput,
)
async def get_embeddings_endpoint(data: EmbeddingInput) -> EmbeddingOutput:
    """Generate embeddings for the provided text list and estimate token usage."""
    if embed_model is None:
        print("Model not initialized")
        raise HTTPException(status_code=500, detail="Model not initialized")

    try:
        result = await embed_model.embed_documents(data.input)
        return result
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


# document processor **************************************************************************
class DocumentInput(BaseModel):
    """
    Define the input schema for the /v1/ingest endpoint
    for the single document
    """

    document_title: str = Field(
        default=None,
        example="Инструкция по эксплуатации изделия Focal Chorus SW 700/800 V",
        description="Document Title",
    )
    type: int = Field(
        default=3,
        example=3,
        description="Document type. 0-folder, 1-document, 2-section, 3-text_chunk, 4-question",
    )
    text_chunk: Optional[str] = Field(
        default=None,
        example="""
        Благодарим Вас за то, что вы выбрали акустику Focal! Focal(r) является зарегистрированной торговой маркой Focal-JMlab -BP 374 -108, rue de l\'Avenir - 42353 La Talaudiere cedex- France - Tel. (+33) 04 77 43 57 00 - Fax (+33) 04 77 43 57 04 - www.focal-fr.com www.focal-audio.ru ИЗГОТОВИТЕЛЬ: Фокал-Джи Эм Лаб, Франция, 42353 Ла Талодьер седекс, рю де л\'Авенир, ВР 374-108, тел. (33) 04 77 43 5700 ИМПОРТЕР: ЭКСКЛЮЗИВНЫЙ ДИСТРИБЬЮТОР ООО "Чернов Аудио". Россия, 123007, Москва, ул. 3-я Магистральная, д. 30, стр. 2, тел. + 7 (495) 721 1381, www.tchernovaudio.ru. Товар сертифицирован Сертификат соответствия № РОСС FR.АЯ46.В14949. Срок действия сертификата по 19.03.2011 г. Адрес органа сертификации (почтовый) : 117418 , Москва, Нахимовский проспект, д.31. Телефон (495) 129 26 00 Страна происхождения : Франция Назначение: Сабвуфер. Излучатель низких частот.

Мы рады поделиться с Вами нашей философией: "the Spirit of Sound". Focal - акустика высокого уровня, которая включает в себя последние разработки компании в сфере дизайна и высоких технологий для максимально достоверного воспроизведения фонограмм.

Восклицательный знак в равностороннем треугольнике предупреждает пользователя о существовании важных инструкций по эксплуатации и обслуживанию (сервису), прилагаемых к изделию. Для того, чтобы получить максимальный результат от прослушивания акустики, мы рекомендуем Вам прочитать данную инструкцию по эксплуатации и сохранить ее, чтобы в дальнейшем обращаться к ней в случае возникновения вопросов. В связи с постоянно прогрессирующей технологией, Focal оставляет за собой право вносить изменения в спецификации без предварительного уведомления. Визуальные изображения могут не точно соответствовать определенному продукту.

Если вы приобрели акустические системы у авторизованного дилера, рекомендуем Вам обратится к его помощи при инсталляции (подключения и настройки основных рабочих параметров) системы с участием его уполномоченного специалиста. Не пользуйтесь услугами лиц, не имеющих достаточной квалификации и опыта работы с дорогостоящей бытовой аудио-видео аппаратурой! В случае, если в районе, где вы проживаете нет авторизованных дилеров или центров по продаже и обслуживанию данной аппаратуры, или вы все же решили подключить систему сами, подробно изучите инструкцию по эксплуатации и проконсультируйтесь у нас по телефону (495) 721 13 81 или 8 800 200 00 81 (бесплатная линия поддержки) с 9 - 30 до 18-30 московского времени.

Внимательно ознакомьтесь с настоящей инструкцией и условиями гарантийного (послегарантийного) обслуживания купленной вами аппаратуры. Только после этого приступайте к подключению!

Запрещается включать АС в сеть переменного тока или трансляционные сети через акустические терминалы! Запрещается использовать бытовые АС с электромузыкальными инструментами в качестве мониторов! Убедитесь, что акустические системы стоят устойчиво и не могут быть опрокинуты! Мы не несем ответственности в случае падения наших систем на людей или домашних животных! Категорически запрещается использовать не оригинальные предохранители других номиналов и типов!

Изображение молнии в равностороннем треугольнике предупреждает о наличии неизолированных токопроводящих частей внутри корпуса изделия, находящихся под напряжением, которое может иметь достаточную величину для возникновения риска поражения человека электричеством.

Предупреждение! Внутри данного изделия отсутствуют части, которые Вы можете самостоятельно обслуживать! Внутри данного изделия есть напряжения опасные для жизни! Категорически запрещено вскрывать данное изделие! В связи с постоянно прогрессирующей технологией, Focal оставляет за собой право вносить изменения в спецификации без предварительного уведомления. Визуальные изображения могут не точно соответствовать определенному продукту.

Динамики, которые используются в акустической системе, являются сложными электромеханическими устройствами и требуют определенного периода "приработки" перед тем, как раскрыть свои лучшие качества. Они должны адаптироваться к температуре и влажности в помещении. Период ввода в эксплуатацию зависит от условий и может длиться до нескольких недель. Для того, чтобы сократить этот период, мы рекомендуем позволить Вашей системе поработать вначале примерно 20 часов. Как только компоненты полностью войдут в рабочий режим, станет возможным насладиться всеми преимуществами Вашей акустической системы.'
""",
        description="Document Text to be embedded",
    )
    page_number: Optional[int] = Field(
        default=None, example=1, description="Page number"
    )
    doc_path: Optional[str] = Field(
        default=None,
        example="/Users/velo1/Downloads/Инструкция Focal SW 700(800)V (RUS).txt",
        description="Path of the document",
    )
    tables: Optional[List[str]] = Field(
        default=None, example=["Table1", "Table2"], description="List of tables"
    )
    images: Optional[List[str]] = Field(
        default=None, example=["Image1.png", "Image2.png"], description="List of images"
    )
    metadata: Optional[Dict[str, Union[str, int, float]]] = Field(
        default=None,
        example={"author": "Author Name", "created_date": "2023-01-01"},
        description="Metadata in JSONB format (should be serialized to string before storing in DB)",
    )


class DocumentProcessInput(BaseModel):
    """
    Define the input schema for the '/v1/ingest' endpoint
    for the list of documents
    """

    model: str = Field(
        default=EMBEDDING_MODEL_NAME, description="Name of the model to be used"
    )
    input: List[DocumentInput] = Field(
        default=None, description="Text chunk to be processed"
    )


class DocumentProcessOutput(BaseModel):
    """
    Define the output schema for the /v1/ingest endpoint
    """

    object: str = Field(default="list")
    data: List[EmbeddingData] = Field(
        default=None, description="List of generated embeddings for the input texts."
    )
    model: str = Field(
        default=EMBEDDING_MODEL_NAME,
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="List of estimated token usage.",
    )
    uuid: Optional[str] = Field(
        default=None, description="List of Unique ID for the documents"
    )


@app.post(
    "/v1/ingest",
    response_model=DocumentProcessOutput,
    description="""
    Process a text chunk, store it in the database and return embeddings and the uuid.
    UUID is generated by the database and is used to retrieve the text chunk from the database.
    """,
)
async def text_processor_endpoint(data: DocumentProcessInput, request: Request):
    try:
        async with get_db_connection(request) as connection:
            async with connection.transaction():
                # Convert the Pydantic model to a dictionary
                document_dict = data.input[0].model_dump()
                response = await insert_to_db(connection, document_dict, embed_model)
            return response
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


# search ***************************************************************************************
class SearchRequest(BaseModel):
    n_top: int = 3
    text_for_search: str = Field(
        default=None,
        example="Какой телефон у торговой марки во Франции?",
        description="Search string to find similar texts",
    )
    search_in_embeddings_only: bool = True


class SearchResult(BaseModel):
    matched_texts: List[str]  # or any other structure you want to return


@app.post("/v1/search", response_model=SearchResult)
async def semantic_search(input: SearchRequest, request: Request):
    try:
        async with get_db_connection(request) as connection:
            async with connection.transaction():
                results = await get_similar_text(
                    connection=connection,
                    embed_model=embed_model,
                    text_for_search=input.text_for_search,
                    n_top=input.n_top,
                    search_in_embeddings_only=input.search_in_embeddings_only,
                )
            return SearchResult(matched_texts=results)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


# model ***************************************************************************************
@app.get(
    "/model_name",
    response_model=str,
    summary="Get the name of the model currently in use.",
)
async def get_model_name():
    """
    Returns the name of the model currently in use.
    """
    if not EMBEDDING_MODEL_NAME:
        raise HTTPException(status_code=404, detail="Model name not set")
    return JSONResponse(content={"model_name": EMBEDDING_MODEL_NAME})


# ingest_documents ***************************************************************************************
@app.post("/ingest_document")
async def ingest_document(request: Request, file: UploadFile = File(...)):
    try:
        # Establish a database connection
        async with get_db_connection(request) as connection:
            # Generate a unique filename using only UUID
            # temp_filename = f"temp_{uuid.uuid4()}.txt"
            temp_filename = file.filename
            # Read the file's content as bytes
            file_content = file.file.read()

            # Save the uploaded file temporarily
            with open(temp_filename, "w+") as file_object:
                file_content_str = file_content.decode("utf-8")
                file_object.write(file_content_str)

            # Process the document
            await vectorize_document(
                temp_filename, connection, embed_model
            )  # Adjust as needed

            # Clean up: Delete the temporary file after processing
            os.remove(temp_filename)

        return {"message": f"Document {file.filename} processed successfully"}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


def run():
    import uvicorn

    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)


# to avoid postrges connection error
# comment line 40: lifespan=app_lifespan,

# changes while debugging in VSC:
# 1. client-files/.env: change HOST to localhost
# 2. set reload=True in run() function HERE
