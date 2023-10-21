import React, {useEffect, useState} from "react";
import {GitHub, GitMerge, Loader, Mail, Menu, Plus} from "react-feather";
import NewWorkspaceModal, {
  useNewWorkspaceModal
} from "../Modals/NewWorkspace";
import paths from "../../utils/paths";
import {isMobile} from "react-device-detect";
import {SidebarMobileHeader} from "../Sidebar";
import ChatBubble from "../ChatBubble";
import System from "../../models/system";

export default function DefaultChatContainer() {
  const [mockMsgs, setMockMessages] = useState([]);
  const [fetchedMessages, setFetchedMessages] = useState([]);
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal
  } = useNewWorkspaceModal();
  const popMsg = !window.localStorage.getItem("anythingllm_intro");

  useEffect(() => {
    const fetchData = async () => {
      const fetchedMessages = await System.getWelcomeMessages();
      setFetchedMessages(fetchedMessages);
    };
    fetchData();
  }, []);

  const MESSAGES = [
    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Добро пожаловать в Sherpa AI Server. Sherpa AI Server — это инструмент с открытым исходным кодом от Mintplex Labs,
            который превращает <i>любое</i> содержимое в обученного чат-бота, с которым вы можете взаимодействовать.
            Sherpa AI Server — это программное обеспечение BYOK (принесите свои ключи), поэтому за него не взимается
            подписка, плата или другие платежи, кроме услуг, которые вы хотите использовать с ним.
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Sherpa AI Server — это самый простой способ объединить мощные продукты искусственного интеллекта, такие как
            OpenAi, GPT-4, LangChain, PineconeDB, ChromaDB и другие сервисы, в аккуратный пакет без лишних хлопот, чтобы
            увеличить вашу производительность в 100 раз.
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Sherpa AI Server может полностью работать локально на вашем компьютере с минимальными затратами ресурсов, которые
            вы даже не заметите! Не требуется GPU. Также доступна установка в облаке и на локальных серверах.
            <br/>
            Экосистема инструментов искусственного интеллекта становится мощнее каждый день. Sherpa AI Server делает ее
            использование простым.
          </p>
          <a
            href={paths.github()}
            target="_blank"
            className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
          >
            <GitMerge className="h-4 w-4"/>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
              Создайте задачу на Github
            </p>
          </a>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-end ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-blue-100 dark:bg-amber-800 rounded-sm xl:rounded-2xl border border-blue-400">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Как начать?
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Это просто. Все коллекции организованы в контейнеры, которые мы называем {" "}
            <b>"Рабочие пространства"</b>. Рабочие пространства - это контейнеры файлов, документов, изображений, PDF и
            других файлов, которые будут преобразованы в что-то, что LLM может понимать и использовать в разговоре.
            <br/>
            <br/>
            Вы можете добавлять и удалять файлы в любое время
          </p>
          <button
            onClick={showNewWsModal}
            className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
          >
            <Plus className="h-4 w-4"/>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
              Создайте свое первое рабочее пространство
            </p>
          </button>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-end ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-blue-100 dark:bg-amber-800 rounded-sm xl:rounded-2xl border border-blue-400">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Это что-то вроде хранилища для ИИ, как Dropbox или что-то в этом роде? А что насчет разговора? Это же
            чат-бот, верно?
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Sherpa AI Server — это не просто умное хранилище, как Dropbox.
            <br/>
            <br/>
            Sherpa AI Server предлагает два способа общения с вашими данными:
            <br/>
            <br/>
            <i>Запрос:</i> ваши разговоры будут возвращать данные или выводы, найденные в документах вашего
            рабочего пространства, к которым он имеет доступ. Добавление больше документов в рабочее пространство делает
            его умнее!
            <br/>
            <br/>
            <i>Разговорный режим:</i> ваши документы и ваша история чата одновременно вносят вклад в знания LLM. Это
            отлично подходит для добавления информации в реальном времени или коррекции и недопонимания, которые может
            иметь LLM.
            <br/>
            <br/>
            Вы можете переключаться между любым из режимов <i>во время чата!</i>
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-end ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-blue-100 dark:bg-amber-800 rounded-sm xl:rounded-2xl border border-blue-400">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Вау, это звучит потрясающе, дайте мне уже попробовать!
          </p>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>,

    <React.Fragment>
      <div
        className={`flex w-full mb-2 xl:mb-3 justify-start ${
          popMsg ? "chat__message" : ""
        }`}
      >
        <div
          className="p-4 max-w-full md:max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            Have Fun!
          </p>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-4">
            <a
              href={paths.github()}
              target="_blank"
              className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
            >
              <GitHub className="h-4 w-4"/>
              <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
                Оценить на GitHub
              </p>
            </a>
            <a
              href={paths.mailToMintplex()}
              className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
            >
              <Mail className="h-4 w-4"/>
              <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
                Свяжитесь с лабораторией Mintplex
              </p>
            </a>
          </div>
          <div className="text-right text-xs mt-2">
            16:16
          </div>
        </div>
      </div>
    </React.Fragment>
  ];

  useEffect(() => {
    function processMsgs() {
      if (!!window.localStorage.getItem("anythingllm_intro")) {
        setMockMessages([...MESSAGES]);
        return false;
      } else {
        setMockMessages([MESSAGES[0]]);
      }

      var timer = 500;
      var messages = [];

      MESSAGES.map((child) => {
        setTimeout(() => {
          setMockMessages([...messages, child]);
          messages.push(child);
        }, timer);
        timer += 2_500;
      });
      window.localStorage.setItem("anythingllm_intro", 1);
    }

    processMsgs();
  }, []);

  return (
    <div
      className="main-content transition-all duration-500 relative bg-white dark:bg-black-900 h-full"
    >
      {isMobile && <SidebarMobileHeader/>}
      <div className="main-box flex flex-col w-full h-full overflow-y-auto p-[16px] md:p-[32px] !pb-0">
        <div className="main-box flex flex-col w-full bg-white shadow-md relative">
          <div
            className="flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[150px]">
            {fetchedMessages.length === 0
              ? mockMsgs.map((content, i) => {
                return <React.Fragment key={i}>{content}</React.Fragment>;
              })
              : fetchedMessages.map((fetchedMessage, i) => {
                return (
                  <React.Fragment key={i}>
                    <ChatBubble
                      message={
                        fetchedMessage.user === ""
                          ? fetchedMessage.response
                          : fetchedMessage.user
                      }
                      type={fetchedMessage.user === "" ? "response" : "user"}
                      popMsg={popMsg}
                    />
                  </React.Fragment>
                );
              })}
          </div>
        </div>
      </div>
      <div className="main-form absolute p-1 md:p-8 lg:p-[50px] position-absolute bottom-0 left-0 right-0 !pb-0">
        <div className="bg-white pt-2 pb-8">
          <form
            //onSubmit={handleSubmit}
            className="flex flex-col gap-y-1 bg-white dark:bg-black-900 md:bg-transparent rounded-t-lg w-full pr-2 xl:pr-4"
          >
            <div className="flex items-center">
              {/*<CommandMenu*/}
              {/*  workspace={workspace}*/}
              {/*  show={showMenu}*/}
              {/*  handleClick={setTextCommand}*/}
              {/*  hide={() => setShowMenu(false)}*/}
              {/*/>*/}
              {/*<button*/}
              {/*  //onClick={() => setShowMenu(!showMenu)}*/}
              {/*  type="button"*/}
              {/*  className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"*/}
              {/*>*/}
              {/*  <Menu className="w-4 h-4 md:h-6 md:w-6"/>*/}
              {/*</button>*/}
              <textarea
                //onKeyUp={adjustTextArea}
                //onKeyDown={captureEnter}
                //onChange={onChange}
                required={true}
                maxLength={240}
                //disabled={inputDisabled}
                //onFocus={() => setFocused(true)}
                //onBlur={(e) => {
                //  setFocused(false);
                //  adjustTextArea(e);
                //}}
                //value={message}
                className="cursor-text max-h-[100px] md:min-h-[40px] block mx-2 md:mx-4 p-2.5 w-full text-[16px] md:text-sm border bg-white border-gray-300 placeholder-gray-400 text-gray-900 dark:text-white dark:bg-stone-600 dark:border-stone-700 dark:placeholder-stone-400"
                placeholder={
                  isMobile
                    ? "Введите ваше сообщение здесь."
                    : "Shift + Enter для новой строки. Войдите, чтобы отправить."
                }
              />
              <button
                //ref={formRef}
                type="submit"
                //disabled={buttonDisabled}
                className="transition-all duration-300 inline-flex justify-center p-0 md:p-2 rounded-full cursor-pointer text-gray-400 dark:text-slate-200 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-stone-500 group"
              >
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 rotate-45"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
                <span className="sr-only">Send message</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal}/>}
    </div>
  );
}
