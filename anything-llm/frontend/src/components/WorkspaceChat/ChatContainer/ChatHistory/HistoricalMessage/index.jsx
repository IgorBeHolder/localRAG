import {memo, forwardRef} from "react";
import {AlertTriangle} from "react-feather";
import Jazzicon from "../../../../UserIcon";
import renderMarkdown from "../../../../../utils/chat/markdown";
import {userFromStorage} from "../../../../../utils/request";
import Citations from "../Citation";
import {MSG_STYLE} from "../../../../../utils/constants.js";

const HistoricalMessage = forwardRef(
  ({message, role, workspace, sources = [], error = false}, ref) => {
    if (role === "user") {
      return (
        <div className="flex justify-end mb-4 items-end">
          <div className={MSG_STYLE(true) + " bg-blue-100 dark:bg-amber-800 border border-blue-400"}>
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
          <div className={MSG_STYLE() + " bg-gray-400 dark:bg-stone-700"}>
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
          className={MSG_STYLE() + " bg-gray-400 dark:bg-stone-700 border border-gray-700"}>
          <div
            className="brea-k-all-in-children overflow-auto whitespace-pre-line text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base flex flex-col gap-y-1"
            dangerouslySetInnerHTML={{__html: renderMarkdown(message)}}
          />
          <Citations sources={sources}/>
        </div>
      </div>
    );
  }
);

export default memo(HistoricalMessage);
