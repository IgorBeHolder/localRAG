import React, {useEffect, useState} from "react";
import Workspace from "../../models/workspace";
import LoadingChat from "./LoadingChat";
import ChatContainer from "./ChatContainer";
import paths from "../../utils/paths";

export default function WorkspaceChat({loading, workspace, analystRoute, termRoute, isCoder}) {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const storageKey = workspace ? `workspace_chat_mode_${workspace.slug}` : "";

  useEffect(() => {
    if (analystRoute && !isCoder && storageKey) {
      window.localStorage.setItem(storageKey, "query");
      window.location = "/workspace/" + workspace.name;
    }
  }, [isCoder, storageKey, analystRoute]);

  useEffect(() => {
    async function getHistory() {
      return await Workspace.chatHistory(workspace.slug);
    }

    if (!loading) {
      if (!workspace?.slug || analystRoute) {
        setLoadingHistory(false);
      } else {
        getHistory().then(chatHistory => {
          setHistory(chatHistory);
          setLoadingHistory(false);
        });
      }
    }
  }, [workspace, loading]);

  if (loadingHistory) {
    return <LoadingChat/>;
  }

  if (!loading && !loadingHistory && !workspace) {
    return (
      <>
        {loading === false && !workspace && (
          <dialog
            open={true}
            style={{zIndex: 100}}
            className="fixed top-0 flex bg-black bg-opacity-50 w-[100vw] h-full items-center justify-center"
          >
            <div
              className="w-fit px-10 p-4 w-1/4 rounded-lg bg-white shadow dark:bg-stone-700 text-black dark:text-slate-200">
              <div className="flex flex-col w-full">
                <p className="font-semibold text-red-500">
                  Мы не можем найти это рабочее пространство
                </p>
                <p className="text-sm mt-4">
                  Похоже, рабочая область с таким именем недоступна.
                </p>

                <div className="flex w-full justify-center items-center mt-4">
                  <a
                    href={paths.home()}
                    className="border border-gray-800 text-gray-800 hover:bg-gray-100 px-4 py-1 rounded-lg dark:text-slate-200 dark:border-slate-200 dark:hover:bg-stone-900"
                  >
                    Вернуться на домашнюю страницу
                  </a>
                </div>
              </div>
            </div>
          </dialog>
        )}
        <LoadingChat/>
      </>
    );
  }

  return <ChatContainer isCoder={isCoder} termRoute={termRoute} workspace={workspace} knownHistory={history}/>;
}
