import {Frown} from "react-feather";
import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import {useEffect, useRef} from "react";

export default function ChatHistory({mode, history = [], workspace, lastMessageRef}) {
  const replyRef = useRef(null);
  const typeWriterRef = useRef(null);

  useEffect(() => {
    if (replyRef.current && replyRef.current.hasOwnProperty('scrollIntoView')) {
      setTimeout(() => {
        replyRef.current.scrollIntoView({behavior: "smooth", block: "end"});
      }, 700);
    }

    if (typeWriterRef.current) {
      lastMessageRef(typeWriterRef);
    }
  }, [history, replyRef, typeWriterRef]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col h-[89%] md:mt-0 pb-5 w-full justify-center items-center">
        <div className="w-fit flex items-center gap-x-2">
          <Frown className="h-4 w-4 text-slate-400"/>
          <p className="text-slate-400">История чата не найдена.</p>
        </div>
        <p className="text-slate-400 text-xs">
          Отправьте первое сообщение, чтобы начать.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[${mode === "analyst" ? 350 : 150}px]`}
      id="chat-history"
    >
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;

        if (props.role === "assistant" && (props.animate || props.typeWriter)) {
          return (
            <PromptReply
              key={index}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid}
              typeWriterRef={typeWriterRef}
              typeWriter={isLastMessage && props.typeWriter}
              reply={props.content}
              pending={props.pending}
              sources={props.sources}
              error={props.error}
              workspace={workspace}
              closed={props.closed}
            />
          );
        }

        return (
          <HistoricalMessage
            key={index}
            ref={isLastMessage ? replyRef : null}
            message={props.content}
            role={props.role}
            workspace={workspace}
            sources={props.sources}
            error={props.error}
          />
        );
      })}
    </div>
  );
}
