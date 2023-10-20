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
            Welcome to AnythingLLM, AnythingLLM is an open-source AI tool by
            Mintplex Labs that turns <i>anything</i> into a trained chatbot you
            can query and chat with. AnythingLLM is a BYOK (bring-your-own-keys)
            software so there is no subscription, fee, or charges for this
            software outside of the services you want to use with it.
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            AnythingLLM is the easiest way to put powerful AI products like
            OpenAi, GPT-4, LangChain, PineconeDB, ChromaDB, and other services
            together in a neat package with no fuss to increase your
            productivity by 100x.
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            AnythingLLM can run totally locally on your machine with little
            overhead you wont even notice it's there! No GPU needed. Cloud and
            on-premises installation is available as well.
            <br/>
            The AI tooling ecosystem gets more powerful everyday. AnythingLLM
            makes it easy to use.
          </p>
          <a
            href={paths.github()}
            target="_blank"
            className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
          >
            <GitMerge className="h-4 w-4"/>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
              Create an issue on Github
            </p>
          </a>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            How do I get started?!
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            It's simple. All collections are organized into buckets we call{" "}
            <b>"Workspaces"</b>. Workspaces are buckets of files, documents,
            images, PDFs, and other files which will be transformed into
            something LLM's can understand and use in conversation.
            <br/>
            <br/>
            You can add and remove files at anytime.
          </p>
          <button
            onClick={showNewWsModal}
            className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
          >
            <Plus className="h-4 w-4"/>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
              Create your first workspace
            </p>
          </button>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            Is this like an AI dropbox or something? What about chatting? It is
            a chatbot isn't it?
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            AnythingLLM is more than a smarter Dropbox.
            <br/>
            <br/>
            AnythingLLM offers two ways of talking with your data:
            <br/>
            <br/>
            <i>Query:</i> Your chats will return data or inferences found with
            the documents in your workspace it has access to. Adding more
            documents to the Workspace make it smarter!
            <br/>
            <br/>
            <i>Conversational:</i> Your documents + your on-going chat history
            both contribute to the LLM knowledge at the same time. Great for
            appending real-time text-based info or corrections and
            misunderstandings the LLM might have.
            <br/>
            <br/>
            You can toggle between either mode <i>in the middle of chatting!</i>
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
            Wow, this sounds amazing, let me try it out already!
          </p>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
                Star on GitHub
              </p>
            </a>
            <a
              href={paths.mailToMintplex()}
              className="mt-4 w-fit flex flex-grow gap-x-2 py-[5px] px-4 border border-slate-400 rounded-lg text-slate-800 dark:text-slate-200 justify-start items-center hover:bg-slate-100 dark:hover:bg-stone-900 dark:bg-stone-900"
            >
              <Mail className="h-4 w-4"/>
              <p className="text-slate-800 dark:text-slate-200 text-sm md:text-lg leading-loose">
                Contact Mintplex Labs
              </p>
            </a>
          </div>
          <div className="text-right text-xs mt-2">
            4:16 PM
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
                    ? "Enter your message here."
                    : "Shift + Enter for newline. Enter to submit."
                }
              />
              <button
                //ref={formRef}
                type="submit"
                //disabled={buttonDisabled}
                className="inline-flex justify-center p-0 md:p-2 rounded-full cursor-pointer text-black-900 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-stone-500 group"
              >
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 rotate-45 fill-gray-500 dark:fill-slate-500 group-hover:dark:fill-slate-200"
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
