import React, {useState} from "react";
import System from "../../../models/system";
import {AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER} from "../../../utils/constants";
import paths from "../../../utils/paths.js";

export default function MultiUserSetup() {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(null);

    const form = new FormData(e.target);
    const data = {
      username: form.get("username"),
      password: form.get("password")
    };

    const {success, error} = await System.setupMultiUser(data);
    if (success) {
      setSuccess(true);
      setSaving(false);
      setTimeout(() => {
        window.localStorage.removeItem(AUTH_USER);
        window.localStorage.removeItem(AUTH_TOKEN);
        window.localStorage.removeItem(AUTH_TIMESTAMP);
        window.location = paths.admin.users();
      }, 2_000);
      return;
    }

    setError(error);
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {(error || success) && (
        <div className="w-full flex px-6">
          {error && (
            <div className="w-full bg-red-300 text-red-800 font-semibold px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="w-full bg-green-300 text-green-800 font-semibold px-4 py-2 rounded-lg">
              Ваша страница обновится через несколько секунд.
            </div>
          )}
        </div>
      )}
      <div className="relative bg-white rounded-lg shadow dark:bg-stone-700">
        <div className="p-6 space-y-6 flex h-full w-full">
          <div className="w-full flex flex-col gap-y-4">
            <>
              <p
                className="text-gray-800 dark:text-stone-200 text-sm bg-gray-200 dark:bg-stone-800 rounded-lg p-4">
                По умолчанию вы будете единственным администратором. Как администратору вам необходимо будет создавать учетные записи для всех новых пользователей или администраторов. Не теряйте свой пароль, поскольку только администратор может сбросить пароли.
              </p>
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Имя пользователя учетной записи администратора
                </label>
                <input
                  name="username"
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Имя администратора"
                  minLength={2}
                  required={true}
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Пароль пользователя учетной записи администратора
                </label>
                <input
                  name="password"
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-stone-600 dark:border-stone-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Пароль администратора"
                  minLength={8}
                  required={true}
                  autoComplete="off"
                />
              </div>
              <button
                disabled={saving}
                type="submit"
                className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                {saving ? "Сохранение..." : "Сохранить"}
              </button>
            </>
          </div>
        </div>
      </div>
    </form>
  );
}
