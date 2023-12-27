from pydantic import BaseModel, Field
from typing import List, Dict, Union, Optional


class EmbeddingInput(BaseModel):
    """Define the input schema for the /v1/embeddings endpoint."""

    model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
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
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="Estimated token usage.",
    )


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
    text_chunk: List[str] = Field(
        default=None,
        example=[
            "Благодарим Вас за то, что вы выбрали акустику Focal! Focal(r) является зарегистрированной торговой маркой Focal-JMlab -BP 374 -108, rue de l'Avenir - 42353 La Talaudiere cedex- France - Tel. (+33) 04 77 43 57 00 - Fax (+33) 04 77 43 57 04 - www.focal-fr.com www.focal-audio.ru ИЗГОТОВИТЕЛЬ: Фокал-Джи Эм Лаб, Франция, 42353 Ла Талодьер седекс, рю де л'Авенир, ВР 374-108, тел. (33) 04 77 43 5700 ИМПОРТЕР: ЭКСКЛЮЗИВНЫЙ ДИСТРИБЬЮТОР ООО \"Чернов Аудио\". Россия, 123007, Москва, ул. 3-я Магистральная, д. 30, стр. 2, тел. + 7 (495) 721 1381, www.tchernovaudio.ru. Товар сертифицирован Сертификат соответствия № РОСС FR.АЯ46.В14949. Срок действия сертификата по 19.03.2011 г. Адрес органа сертификации (почтовый) : 117418 , Москва, Нахимовский проспект, д.31. Телефон (495) 129 26 00 Страна происхождения : Франция Назначение: Сабвуфер. Излучатель низких частот.",
            'Мы рады поделиться с Вами нашей философией: "the Spirit of Sound". Focal - акустика высокого уровня, которая включает в себя последние разработки компании в сфере дизайна и высоких технологий для максимально достоверного воспроизведения фонограмм.',
            "Восклицательный знак в равностороннем треугольнике предупреждает пользователя о существовании важных инструкций по эксплуатации и обслуживанию (сервису), прилагаемых к изделию. Для того, чтобы получить максимальный результат от прослушивания акустики, мы рекомендуем Вам прочитать данную инструкцию по эксплуатации и сохранить ее, чтобы в дальнейшем обращаться к ней в случае возникновения вопросов. В связи с постоянно прогрессирующей технологией, Focal оставляет за собой право вносить изменения в спецификации без предварительного уведомления. Визуальные изображения могут не точно соответствовать определенному продукту.",
            "Если вы приобрели акустические системы у авторизованного дилера, рекомендуем Вам обратится к его помощи при инсталляции (подключения и настройки основных рабочих параметров) системы с участием его уполномоченного специалиста. Не пользуйтесь услугами лиц, не имеющих достаточной квалификации и опыта работы с дорогостоящей бытовой аудио-видео аппаратурой! В случае, если в районе, где вы проживаете нет авторизованных дилеров или центров по продаже и обслуживанию данной аппаратуры, или вы все же решили подключить систему сами, подробно изучите инструкцию по эксплуатации и проконсультируйтесь у нас по телефону (495) 721 13 81 или 8 800 200 00 81 (бесплатная линия поддержки) с 9 - 30 до 18-30 московского времени.",
            "Внимательно ознакомьтесь с настоящей инструкцией и условиями гарантийного (послегарантийного) обслуживания купленной вами аппаратуры. Только после этого приступайте к подключению!",
        ],
        description="Document Text to be embedded",
    )
    page_number: Optional[int] = Field(default=None, description="Page number")
    doc_path: Optional[str] = Field(
        default=None,
        example="",
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
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="Name of the model to be used",
    )
    input: DocumentInput = Field(default=None, description="Text chunk to be processed")


class DocumentProcessOutput(BaseModel):
    """
    Define the output schema for the /v1/ingest endpoint
    """

    object: str = Field(default="list")
    # data: List[EmbeddingData] = Field(
    #     default=None, description="List of generated embeddings for the input texts."
    # )
    model: str = Field(
        default="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
        description="Model that was used to generate the embeddings.",
    )
    usage: Dict[str, int] = Field(
        default={"prompt_tokens": 0, "total_tokens": 0},
        description="List of estimated token usage.",
    )
    uuid: Optional[List[str]] = Field(
        default=None, description="List of Unique ID for the documents"
    )


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
