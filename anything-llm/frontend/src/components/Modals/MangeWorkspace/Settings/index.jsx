import React, {useState, useRef, useEffect} from "react";
import Workspace from "../../../../models/workspace";
import paths from "../../../../utils/paths";
import {DEFAULT_CHAT_OPTIONS} from "../../../../utils/constants.js";

// Ensure that a type is correct before sending the body
// to the backend.
function castToType(key, value) {
  const definitions = {
    openAiTemp: {
      cast: (value) => Number(value)
    },
    openAiHistory: {
      cast: (value) => Number(value)
    }
  };

  if (!definitions.hasOwnProperty(key)) return value;
  return definitions[key].cast(value);
}

export default function WorkspaceSettings({workspace}) {
  const formEl = useRef(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    function setTimer() {
      if (success !== null) {
        setTimeout(() => {
          setSuccess(null);
        }, 3_000);
      }

      if (error !== null) {
        setTimeout(() => {
          setError(null);
        }, 3_000);
      }
    }

    setTimer();
  }, [success, error]);

  const handleUpdate = async (e) => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    e.preventDefault();
    const data = {};
    const form = new FormData(formEl.current);
    for (let [key, value] of form.entries()) data[key] = castToType(key, value);
    const {workspace: updatedWorkspace, message} = await Workspace.update(
      workspace.slug,
      data
    );
    if (!!updatedWorkspace) {
      setSuccess("Workspace updated!");
    } else {
      setError(message);
    }
    setSaving(false);
  };

  const deleteWorkspace = async () => {
    if (
      !window.confirm(
        `Вы собираетесь удалить весь свое рабочее пространство ${workspace.name}. Это приведет к удалению всех вложений векторов в вашей векторной базе данных.\n\nИсходные файлы останутся нетронутыми. Это действие необратимо.`
      )
    )
      return false;
    await Workspace.delete(workspace.slug);
    workspace.slug === slug
      ? (window.location = paths.home())
      : window.location.reload();
  };

  return (
    <form ref={formEl} onSubmit={handleUpdate}>
      <div className="p-6 flex h-full w-full max-h-[80vh] overflow-y-scroll">
        <div className="flex flex-col gap-y-1 w-full">
          <div className="flex flex-col mb-2">
            <p className="text-gray-800 dark:text-stone-200 text-base ">
              Измените настройки вашего рабочего пространства
            </p>
          </div>

          <div className="w-full flex flex-col gap-y-4">
            <div>
              <input
                type="text"
                disabled={true}
                defaultValue={workspace?.slug}
                className="bg-gray-50 border disabled:bg-gray-400 disabled:text-gray-700 disabled:border-gray-400 disabled:dark:bg-stone-800 disabled:dark:border-stone-900 disabled:dark:text-stone-600 disabled:cursor-not-allowed border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required={true}
                autoComplete="off"
              />
            </div>

            <div>
              <div className="flex flex-col gap-y-1 mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Имя рабочего пространства
                </label>
                <p className="text-xs text-gray-600 dark:text-stone-400">
                  Это изменит только отображаемое имя вашего рабочего пространства.
                </p>
              </div>
              <input
                name="name"
                type="text"
                minLength={2}
                maxLength={80}
                defaultValue={workspace?.name}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Мое рабочее пространство"
                required={true}
                autoComplete="off"
                onChange={() => setHasChanges(true)}
              />
            </div>

            <div>
              <div className="flex flex-col gap-y-1 mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Температура LLM
                </label>
                <p className="text-xs text-gray-600 dark:text-stone-400">
                  Этот параметр определяет, насколько «случайными» или динамичными будут ваши ответы в чате.
                  <br/>
                  Чем выше число (максимум 1.0), тем более случайным будет ответ (эффект галлюцинаций).
                </p>
              </div>
              <input
                name="openAiTemp"
                type="number"
                min={0.0}
                max={1.0}
                step={0.01}
                onWheel={(e) => e.target.blur()}
                defaultValue={workspace?.openAiTemp ?? DEFAULT_CHAT_OPTIONS.openAiTemp}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="0.5"
                required={true}
                autoComplete="off"
                onChange={() => setHasChanges(true)}
              />
            </div>

            <div>
              <div className="flex flex-col gap-y-1 mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  Запрос
                </label>
                <p className="text-xs text-gray-600 dark:text-stone-400">
                  Системный промпт, которое будет использоваться в этом рабочем пространстве. Определите контекст и
                  инструкции для
                  ИИ, чтобы сгенерировать ответ. Вам следует предоставить тщательно продуманную подсказку, чтобы ИИ мог
                  сгенерировать релевантный и точный ответ.
                </p>
              </div>
              <textarea
                name="openAiPrompt"
                maxLength={512}
                rows={5}
                defaultValue={workspace?.openAiPrompt ?? DEFAULT_CHAT_OPTIONS.openAiPrompt}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Учитывая следующий разговор, соответствующий контекст и дополнительный вопрос, ответьте на текущий вопрос, который задает пользователь. Отправьте только свой ответ на вопрос с учетом приведенной выше информации, следуя инструкциям пользователя по мере необходимости."
                required={true}
                wrap="soft"
                autoComplete="off"
                onChange={() => setHasChanges(true)}
              />
            </div>

            <div>
              <div className="flex flex-col gap-y-1 mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  История чата
                </label>
                <p className="text-xs text-gray-600 dark:text-stone-400">
                  Количество предыдущих вопрос-ответов, которые будут включены в кратковременную память текущего ответа.
                  <br/>
                  При больших значениях увеличивается время на ответ. Если значение больше 20, это может привести к
                  сбоям в чате в зависимости
                  от размера сообщения.
                </p>
              </div>
              <input
                name="openAiHistory"
                type="number"
                min={1}
                max={20}
                step={1}
                onWheel={(e) => e.target.blur()}
                defaultValue={workspace?.openAiHistory ?? DEFAULT_CHAT_OPTIONS.openAiHistory}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="7"
                required={true}
                autoComplete="off"
                onChange={() => setHasChanges(true)}
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">
              Ошибка: {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 dark:text-green-400 text-sm">
              Успех: {success}
            </p>
          )}
        </div>
      </div>
      <div
        className="flex items-center justify-between p-2 md:p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
        <button
          onClick={deleteWorkspace}
          type="button"
          className="border border-transparent text-gray-500 bg-white hover:bg-red-100 rounded-lg whitespace-nowrap text-sm font-medium px-5 py-2.5 hover:text-red-900 focus:z-10 dark:bg-transparent dark:text-gray-300 dark:hover:text-white dark:hover:bg-red-600"
        >
          Удалить рабочее пространство
        </button>
        {hasChanges && (
          <button
            type="submit"
            className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 whitespace-nowrap text-sm font-medium px-2 md:px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-black dark:text-slate-200 dark:border-transparent dark:hover:text-slate-200 dark:hover:bg-gray-900 dark:focus:ring-gray-800"
          >
            {saving ? "Обновление..." : "Обновить рабочее пространство"}
          </button>
        )}
      </div>
    </form>
  );
}
