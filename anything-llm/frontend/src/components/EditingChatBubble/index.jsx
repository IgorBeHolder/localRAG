import React, { useState } from "react";
import { X } from "react-feather";

export default function EditingChatBubble({
  message,
  index,
  type,
  handleMessageChange,
  removeMessage,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMessage, setTempMessage] = useState(message[type]);
  const isUser = type === "user";

  return (
    <div
      className={`flex w-full mt-2 items-center ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {isUser && (
        <button
          className="flex items-center text-red-500 hover:text-red-700 transition mr-2"
          onClick={() => removeMessage(index)}
        >
          <X className="mr-2" size={20} />
        </button>
      )}
      <div
        className={`p-4 max-w-full md:max-w-[75%] rounded-sm xl:rounded-2xl border ${
          isUser
            ? "bg-blue-100 dark:bg-amber-800 border-blue-400"
            : "bg-gray-400 dark:bg-stone-700 border-gray-700"
        }`}
        onDoubleClick={() => setIsEditing(true)}
      >
        {isEditing ? (
          <input
            value={tempMessage}
            onChange={(e) => setTempMessage(e.target.value)}
            onBlur={() => {
              handleMessageChange(index, type, tempMessage);
              setIsEditing(false);
            }}
            autoFocus
          />
        ) : (
          tempMessage && (
            <p className="text-slate-800 dark:text-slate-200 font-[500] md:font-semibold text-sm md:text-base">
              {tempMessage}
            </p>
          )
        )}
      </div>
      {!isUser && (
        <button
          className="flex items-center text-red-500 hover:text-red-700 transition ml-2"
          onClick={() => removeMessage(index)}
        >
          <X className="mr-2" size={20} />
        </button>
      )}
    </div>
  );
}
