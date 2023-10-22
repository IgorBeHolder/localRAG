import React from "react";

export default function ChatBubble({ message, type, popMsg }) {
  const isUser = type === "user";

  return (
    <div
      className={`flex w-full mt-2 items-center ${
        popMsg ? "chat__message" : ""
      } ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-4 max-w-full md:max-w-[75%] rounded-sm xl:rounded-2xl border ${
          isUser
            ? "bg-blue-100 dark:bg-amber-800 border-blue-400"
            : "bg-gray-400 dark:bg-stone-700 border-gray-700"
        }`}
      >
        {message && (
          <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
