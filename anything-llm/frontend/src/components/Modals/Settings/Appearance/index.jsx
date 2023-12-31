import {useEffect, useState} from "react";
import useLogo from "../../../../hooks/useLogo";
import usePrefersDarkMode from "../../../../hooks/usePrefersDarkMode";
import System from "../../../../models/system";
import EditingChatBubble from "../../../EditingChatBubble";
import AnythingLLMLight from "../../../../media/logo/icon_ai.png";
import AnythingLLMDark from "../../../../media/logo/icon_ai.png";
import showToast from "../../../../utils/toast";

export default function Appearance() {
  const {logo: _initLogo} = useLogo();
  const prefersDarkMode = usePrefersDarkMode();
  const [logo, setLogo] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function fetchMessages() {
      const messages = await System.getWelcomeMessages();
      setMessages(messages);
    }

    fetchMessages();
  }, []);

  useEffect(() => {
    async function setInitLogo() {
      setLogo(_initLogo || "");
    }

    setInitLogo();
  }, [_initLogo]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return false;

    const formData = new FormData();
    formData.append("logo", file);
    const {success, error} = await System.uploadLogo(formData);
    if (!success) {
      console.error("Не удалось загрузить логотип:", error);
      showToast(`Не удалось загрузить логотип: ${error}`, "error");
      return;
    }

    const logoURL = await System.fetchLogo();
    setLogo(logoURL);
    showToast("Изображение успешно загружено.", "success");
  };

  const handleRemoveLogo = async () => {
    const {success, error} = await System.removeCustomLogo();
    if (!success) {
      console.error("Не удалось удалить логотип:", error);
      showToast(`Не удалось удалить логотип: ${error}`, "error");
      return;
    }

    const logoURL = await System.fetchLogo();
    setLogo(logoURL);
    showToast("Изображение успешно удалено.", "success");
  };

  const addMessage = (type) => {
    if (type === "user") {
      setMessages([
        ...messages,
        {user: "Дважды щелкните, чтобы изменить...", response: ""}
      ]);
    } else {
      setMessages([
        ...messages,
        {user: "", response: "Дважды щелкните, чтобы изменить..."}
      ]);
    }
  };

  const removeMessage = (index) => {
    setHasChanges(true);
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleMessageChange = (index, type, value) => {
    setHasChanges(true);
    const newMessages = [...messages];
    newMessages[index][type] = value;
    setMessages(newMessages);
  };

  const handleMessageSave = async () => {
    const {success, error} = await System.setWelcomeMessages(messages);
    if (!success) {
      showToast(`Не удалось обновить приветственные сообщения: ${error}`, "error");
      return;
    }
    showToast("Приветственные сообщения успешно обновлены.", "success");
    setHasChanges(false);
  };

  return (
    <div className="relative w-full w-full max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-stone-700">
        <div className="flex items-start justify-between px-6 py-4">
          <p className="text-gray-800 dark:text-stone-200 text-base ">
            Настройте параметры внешнего вида экземпляра Sherpa AI Server.
          </p>
        </div>

        <div className="px-1 md:px-8 pb-10">
          {/*<div className="mb-6">
            <div className="flex flex-col gap-y-2 mb-4">
              <h2 className="leading-tight font-medium text-black dark:text-white">
                Пользовательский логотип
              </h2>
              <p className="leading-tight text-sm text-gray-500 dark:text-slate-400 mb-4">
                Измените логотип, который появляется на боковой панели.
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <img
                src={logo}
                alt="Uploaded Logo"
                className="w-48 h-48 object-contain"
                onError={(e) =>
                  (e.target.src = prefersDarkMode
                    ? AnythingLLMLight
                    : AnythingLLMDark)
                }
              />
              <div className="flex flex-col">
                <div className="mb-4">
                  <label
                    className="inline-flex cursor-pointer text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600">
                    Загрузить изображение
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
                <div className="mb-4">
                  <button
                    onClick={handleRemoveLogo}
                    className="inline-flex cursor-pointer text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  >
                    Удалить собственный логотип
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Загрузите свой логотип. Рекомендуемый размер: 800x200.
                </div>
              </div>
            </div>
          </div>*/}
          <div className="mb-6">
            <div className="flex flex-col gap-y-2">
              <h2 className="leading-tight font-medium text-black dark:text-white">
                Пользовательские сообщения
              </h2>
              <p className="leading-tight text-sm text-gray-500 dark:text-slate-400">
                Измените сообщения по умолчанию, которые отображаются пользователям.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-y-6 bg-white dark:bg-black-900 p-4 rounded-lg">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col gap-y-2">
                  {message.user && (
                    <EditingChatBubble
                      message={message}
                      index={index}
                      type="user"
                      handleMessageChange={handleMessageChange}
                      removeMessage={removeMessage}
                    />
                  )}
                  {message.response && (
                    <EditingChatBubble
                      message={message}
                      index={index}
                      type="response"
                      handleMessageChange={handleMessageChange}
                      removeMessage={removeMessage}
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-4 mt-4 justify-between">
                <button
                  className="self-end text-orange-500 hover:text-orange-700 transition"
                  onClick={() => addMessage("response")}
                >
                  + Системное сообщение
                </button>
                <button
                  className="self-end text-orange-500 hover:text-orange-700 transition"
                  onClick={() => addMessage("user")}
                >
                  + Сообщение пользователя
                </button>
              </div>
            </div>
            {hasChanges && (
              <div className="flex justify-center py-6">
                <button
                  className="inline-flex cursor-pointer text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                  onClick={handleMessageSave}
                >
                  Сохранить сообщения
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
