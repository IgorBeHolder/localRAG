import {forwardRef, memo} from "react";
import {AlertTriangle} from "react-feather";
import Jazzicon from "../../../../UserIcon";
import renderMarkdown from "../../../../../utils/chat/markdown";
import Citations from "../Citation";
import {MSG_STYLE} from "../../../../../utils/constants.js";

const TypeWriterMessage = ({ uuid, workspace, sources, typeWriterRef }) => {
  return (
    <div key={uuid} ref={typeWriterRef} className="chat__message mb-4 flex justify-start items-end">
      <Jazzicon size={30} user={{uid: workspace.slug}}/>
      <div className={MSG_STYLE() + " bg-gray-400 dark:bg-stone-700 border border-gray-700"}>
        <div className="typewriter-block overflow-auto whitespace-pre-line text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base"/>
        <Citations sources={sources}/>
      </div>
    </div>
  );
};

const PendingMessage = ({ uuid, workspace }) => {
  return (
    <div ref={uuid} className="chat__message flex justify-start mb-4 items-end">
      <Jazzicon size={30} user={{uid: workspace.slug}}/>
      <div className={MSG_STYLE() + " bg-gray-400 dark:bg-stone-700"}>
        <span className={`inline-block p-2`}>
          <div className="dot-falling"></div>
        </span>
      </div>
    </div>
  );
};

const ErrorMessage = ({ workspace, error }) => {
  return (
    <div className="chat__message flex justify-start mb-4 items-end">
      <Jazzicon size={30} user={{uid: workspace.slug}}/>
      <div className={MSG_STYLE() + " bg-red-50 ml-2 text-red-500 border border-red-300 flex flex-col"}>
        <span className={`inline-block`}>
          <AlertTriangle className="h-4 w-4 mb-1 inline-block"/> Не удалось ответить на сообщение.
        </span>
        <span className="text-xs">Причина: {error || "неизвестна"}</span>
      </div>
    </div>
  );
};

const PromptReply = ({ uuid, reply, pending, error, workspace, sources, typeWriterRef, typeWriter }) => {
  if (!reply && sources.length === 0 && !pending && !error) return null;

  if (typeWriter) {
    return <TypeWriterMessage uuid={uuid} workspace={workspace} sources={sources} typeWriterRef={typeWriterRef} />;
  }

  if (pending) {
    return <PendingMessage uuid={uuid} workspace={workspace} />;
  }

  if (error) {
    return <ErrorMessage workspace={workspace} error={error} />;
  }

  return (
    <div key={uuid} ref={uuid} className="chat__message mb-4 flex justify-start items-end">
      <Jazzicon size={30} user={{uid: workspace.slug}}/>
      <div className={MSG_STYLE() + " bg-gray-400 dark:bg-stone-700 border border-gray-700"}>
        <div className="break-all-in-children overflow-auto whitespace-pre-line text-slate-800 dark:text-slate-200 flex flex-col gap-y-1 font-[500] md:font-semibold text-sm md:text-base" dangerouslySetInnerHTML={{__html: renderMarkdown(reply)}} />
        <Citations sources={sources}/>
      </div>
    </div>
  );
};
          <Citations sources={sources}/>
        </div>
      </div>
    );
  }
);

export default memo(PromptReply);
