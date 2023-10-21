import {useEffect, useRef, useState} from "react";
import Admin from "../../../../models/admin";
import showToast from "../../../../utils/toast";

export default function ApiKeyRow({apiKey}) {
  const rowRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Вы уверены, что хотите деактивировать этот ключ API?\nПосле этого его больше нельзя будет использовать.\n\nЭто действие необратимо.`
      )
    )
      return false;
    if (rowRef?.current) {
      rowRef.current.remove();
    }
    await Admin.deleteApiKey(apiKey.id);
    showToast("Ключ API удален навсегда", "info");
  };
  const copyApiKey = () => {
    if (!apiKey) return false;
    window.navigator.clipboard.writeText(apiKey.secret);
    showToast("Ключ API скопирован в буфер обмена.", "success");
    setCopied(true);
  };

  useEffect(() => {
    function resetStatus() {
      if (!copied) return false;
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }

    resetStatus();
  }, [copied]);

  return (
    <>
      <tr ref={rowRef} className="bg-transparent">
        <td
          scope="row"
          className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white font-mono"
        >
          {apiKey.secret}
        </td>
        <td className="px-6 py-4">
          {apiKey.createdBy?.username || "неизвестный пользователь"}
        </td>
        <td className="px-6 py-4">{apiKey.createdAt}</td>
        <td className="px-6 py-4 flex items-center gap-x-6">
          <button
            onClick={copyApiKey}
            disabled={copied}
            className="font-medium text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-800 hover:dark:bg-opacity-20"
          >
            {copied ? "Ключ API cкопирован" : "Копировать ключ API"}
          </button>
          <button
            onClick={handleDelete}
            className="font-medium text-red-600 dark:text-red-300 px-2 py-1 rounded-lg hover:bg-red-50 hover:dark:bg-red-800 hover:dark:bg-opacity-20"
          >
            Деактивировать ключ API
          </button>
        </td>
      </tr>
    </>
  );
}
