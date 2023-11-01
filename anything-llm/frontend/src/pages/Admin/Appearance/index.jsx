import React, {useState, useEffect} from "react";
import Sidebar from "../../../components/AdminSidebar";
import Admin from "../../../models/admin";
import AnythingLLMLight from "../../../media/logo/icon_ai.png";
import AnythingLLMDark from "../../../media/logo/icon_ai.png";
import usePrefersDarkMode from "../../../hooks/usePrefersDarkMode";
import useLogo from "../../../hooks/useLogo";
import System from "../../../models/system";
import EditingChatBubble from "../../../components/EditingChatBubble";
import showToast from "../../../utils/toast";

export default function Appearance() {
  const {logo: _initLogo} = useLogo();
  const [logo, setLogo] = useState("");
  const prefersDarkMode = usePrefersDarkMode();
  const [hasChanges, setHasChanges] = useState(false);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    async function setInitLogo() {
      setLogo(_initLogo || "");
    }

    setInitLogo();
  }, [_initLogo]);

  useEffect(() => {
    async function fetchMessages() {
      const messages = await System.getWelcomeMessages();
      setMessages(messages);
    }

    fetchMessages();
  }, []);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return false;

    const formData = new FormData();
    formData.append("logo", file);
    const {success, error} = await Admin.uploadLogo(formData);
    if (!success) {
      showToast(`Не удалось загрузить логотип: ${error}`, "error");
      return;
    }

    const logoURL = await System.fetchLogo();
    setLogo(logoURL);
    showToast("Изображение успешно загружено.", "success");
  };

  const handleRemoveLogo = async () => {
    const {success, error} = await Admin.removeCustomLogo();
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
    const {success, error} = await Admin.setWelcomeMessages(messages);
    if (!success) {
      showToast(`Не удалось обновить приветственные сообщения: ${error}`, "error");
      return;
    }
    showToast("Приветственные сообщения успешно обновлены.", "success");
    setHasChanges(false);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-400 dark:bg-stone-700 lg:flex">
      <Sidebar/>
      <div
        className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full  p-[16px] md:p-[32px] !pb-0"
      >
        <div className="main-box flex flex-col w-full h-full p-2 md:p-6 lg:p-[50px] bg-white shadow-md relative overflow-y-auto px-1 md:px-8">
          <div className="mb-6">
            <p className="text-3xl font-semibold text-slate-600 dark:text-slate-200">
              Настройки внешнего вида
            </p>
            <p className="mt-2 text-sm font-base text-slate-600 dark:text-slate-200">
              Настройте параметры внешнего вида вашей платформы.
            </p>
          </div>
          <div className="mb-6">
            <div className="flex flex-col gap-y-2">
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
                    Удалить пользовательский логотип
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Загрузите свой логотип. Рекомендуемый размер: 800x200.
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <div className="flex flex-col gap-y-2">
              <h2 className="leading-tight font-medium text-black dark:text-white">
                Пользовательские сообщения
              </h2>
              <p className="leading-tight text-sm text-gray-500 dark:text-slate-400">
                Измените сообщения по умолчанию, которые отображаются пользователям.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-y-6">
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
