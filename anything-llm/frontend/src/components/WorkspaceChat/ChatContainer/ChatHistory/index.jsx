import { Frown } from "react-feather";
import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import { useEffect, useRef } from "react";

export default function ChatHistory({ history = [], workspace }) {
  const replyRef = useRef(null);

  useEffect(() => {
    if (replyRef.current) {
      setTimeout(() => {
        replyRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 700);
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col h-[89%] md:mt-0 pb-5 w-full justify-center items-center">
        <div className="w-fit flex items-center gap-x-2">
          <Frown className="h-4 w-4 text-slate-400" />
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
      className="flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[150px]"
      id="chat-history"
    >
      {history.map((props, index) => {
        const isLastMessage = index === history.length - 1;

        if (props.role === "assistant" && props.animate) {
          return (
            <PromptReply
              key={props.uuid}
              ref={isLastMessage ? replyRef : null}
              uuid={props.uuid}
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
