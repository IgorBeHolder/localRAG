import {memo, forwardRef} from "react";
import {AlertTriangle} from "react-feather";
import Jazzicon from "../../../../UserIcon";
import renderMarkdown from "../../../../../utils/chat/markdown";
import {userFromStorage} from "../../../../../utils/request";
import Citations from "../Citation";

const HistoricalMessage = forwardRef(
  ({message, role, workspace, sources = [], error = false}, ref) => {
    if (role === "user") {
      return (
        <div className="flex justify-end mb-4 items-start">
          <div
            className="mr-2 p-2 xl:p-4 w-fit md:max-w-[75%] bg-blue-100 dark:bg-amber-800 rounded-md xl:rounded-2xl border border-blue-400">
            <span
              className={`inline-block rounded-lg whitespace-pre-line text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base`}
            >
              {message}
            </span>
          </div>
          <Jazzicon size={30} user={{uid: userFromStorage()?.username}}/>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-start mb-4 items-end">
          <Jazzicon size={30} user={{uid: workspace.slug}}/>
          <div className="ml-2 max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-t-2xl rounded-br-2xl rounded-bl-sm">
            <span
              className={`inline-block p-4 rounded-lg bg-red-50 text-red-500`}
            >
              <AlertTriangle className="h-4 w-4 mb-1 inline-block"/> Не удалось ответить на сообщение.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div ref={ref} className="flex justify-start items-end mb-4">
        <Jazzicon size={30} user={{uid: workspace.slug}}/>
        <div
          className="ml-2 p-4 max-w-[75%] bg-gray-400 dark:bg-stone-700 rounded-sm xl:rounded-2xl border border-gray-700">
          <div
            className="break-all-in-children overflow-auto whitespace-pre-line text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base flex flex-col gap-y-1"
            dangerouslySetInnerHTML={{__html: renderMarkdown(message)}}
          />
          <Citations sources={sources}/>
        </div>
      </div>
    );
  }
);

export default memo(HistoricalMessage);
