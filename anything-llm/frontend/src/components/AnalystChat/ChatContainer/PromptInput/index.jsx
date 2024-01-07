import React, {useState, useRef, memo, useEffect} from "react";
import {isMobile} from "react-device-detect";
import {Loader, Menu, X} from "react-feather";
import {CHAT_MAX_LENGTH} from "../../../../utils/constants.js";
import TerminalComponent from "../ChatHistory/Terminal/index.jsx";

export default function PromptInput({
                                      workspace,
                                      message,
                                      submit,
                                      onChange,
                                      inputDisabled,
                                      buttonDisabled
                                    }) {
  const [showMenu, setShowMenu] = useState(false);
  const formRef = useRef(null);
  const [_, setFocused] = useState(false);
  const handleSubmit = (e) => {
    setFocused(false);
    submit(e);
  };
  const captureEnter = (event) => {
    if (event.keyCode == 13) {
      if (!event.shiftKey) {
        submit(event);
      }
    }
  };
  const adjustTextArea = (event) => {
    if (isMobile) return false;
    const element = event.target;
    element.style.height = "1px";
    element.style.height =
      event.target.value.length !== 0
        ? (25 + element.scrollHeight) + "px"
        : "1px";
  };

  const setTextCommand = (command = "") => {
    const storageKey = `workspace_chat_mode_${workspace.slug}`;
    if (command !== "/analyst") {
      if (!window.confirm(`Вы покидаете в сеанс анализа данных.\nРабочее пространство "${workspace.name}" будет закрыто.`)) {
        return false;
      }

      if (command === "/conversation") {
        window.localStorage.setItem(storageKey, "chat");
        window.dispatchEvent(new Event("workspace_chat_mode_update"));
        window.location = "/workspace/" + workspace.name;
        return;
      } else if (command === "/query") {
        window.localStorage.setItem(storageKey, "query");
        window.dispatchEvent(new Event("workspace_chat_mode_update"));
        window.location = "/workspace/" + workspace.name;
        return;
      }
    }

    onChange({target: {value: `${command} ${message}`}});
  };

  console.log("workspace", workspace);

  return (
    <div className="main-form absolute p-1 md:p-8 lg:p-[50px] bottom-0 left-0 right-0 !pb-0">
      <div className="bg-white pt-2 pb-8">
        <div className="flex flex-col gap-y-1 bg-white dark:bg-black-900 lg:w-3/4 w-full mx-auto">
          <div className="flex items-center py-2 px-4 rounded-lg">
            <CommandMenu
              workspace={workspace}
              show={showMenu}
              handleClick={setTextCommand}
              hide={() => setShowMenu(false)}
            />
            <button
              onClick={() => setShowMenu(!showMenu)}
              type="button"
              className="p-2 text-slate-500 bg-transparent rounded-md hover:bg-gray-200 dark:hover:bg-stone-500 dark:hover:text-slate-200"
            >
              <Menu className="w-4 h-4 md:h-6 md:w-6"/>
            </button>

            <TerminalComponent handleSubmit={handleSubmit}/>

            <button
              ref={formRef}
              type="submit"
              disabled={buttonDisabled}
              className="transition-all duration-300 inline-flex justify-center p-0 md:p-2 rounded-full cursor-pointer text-gray-200 dark:text-slate-200 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-stone-500 group"
            >
              {buttonDisabled ? (
                <Loader className="w-6 h-6 animate-spin"/>
              ) : (
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
              )}
              <span className="sr-only">Отправить сообщение</span>
            </button>
          </div>
          <Tracking workspaceSlug={workspace.slug}/>
        </div>
      </div>
    </div>
  );
}

const Tracking = memo(({workspaceSlug}) => {
  const storageKey = `workspace_chat_mode_${workspaceSlug}`;
  const [chatMode, setChatMode] = useState(
    window.localStorage.getItem(storageKey) ?? "query"
  );

  useEffect(() => {
    function watchForChatModeChange() {
      if (!workspaceSlug) return;
      window.addEventListener(`workspace_chat_mode_update`, () => {
        try {
          const chatMode = window.localStorage.getItem(storageKey);
          setChatMode(chatMode);
        } catch {
        }
      });
    }

    watchForChatModeChange();
  }, [workspaceSlug]);

  return (
    <div className="flex flex-col md:flex-row w-full justify-center items-center gap-2 mb-2 px-4 mx:px-0">
      <p
        className="whitespace-nowrap bg-gray-200 dark:bg-stone-600 text-gray-800 dark:text-slate-400 text-xs px-2 rounded-lg font-mono text-center">
        Режим чата: {chatMode}
      </p>
      <p className="text-slate-400 text-xs text-center">
        Ответы системы могут быть неточными или недействительными. Используйте их с осторожностью.
      </p>
    </div>
  );
});

function CommandMenu({workspace, show, handleClick, hide}) {
  if (!show) return null;
  const COMMANDS = [
    {
      cmd: "/analyst",
      description: "- перейти в режим кодинга."
    },
    {
      cmd: "/conversation",
      description: "- перейти в режим диалога (запоминает недавнюю историю чата)."
    },
    {
      cmd: "/query",
      description: "- перейти в режим запроса (не запоминает предыдущие чаты)."
    },
    {
      cmd: "/reset",
      description: "- очистить текущую историю чата."
    }
  ];

  return (
    <div
      className="absolute bottom-[100%] min-h-[200px] flex flex-col rounded-lg border border-slate-400 p-2 pt-4 bg-gray-50 dark:bg-stone-600">
      <div className="flex justify-between items-center border-b border-slate-400 px-2 py-1 ">
        <p className="text-gray-800 dark:text-slate-200">Доступные команды</p>
        <button
          type="button"
          onClick={hide}
          className="p-2 rounded-lg hover:bg-gray-200 hover:dark:bg-slate-500 rounded-full text-gray-800 dark:text-slate-400"
        >
          <X className="h-4 w-4"/>
        </button>
      </div>
      <div className="flex flex-col">
        {COMMANDS.map((item, i) => {
          const {cmd, description} = item;
          return (
            <div key={i} className="border-b border-slate-400 p-1">
              <button
                key={i}
                type="button"
                onClick={() => {
                  handleClick(cmd);
                  hide();
                }}
                className="w-full px-4 py-2 flex items-baseline rounded-lg hover:bg-gray-300 hover:dark:bg-slate-500 gap-x-2 disabled:cursor-not-allowed"
              >
                <p className="text-gray-800 dark:text-slate-200 font-semibold">
                  {cmd}
                </p>
                <p className="text-gray-800 dark:text-slate-300 text-sm text-left">
                  {description}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
