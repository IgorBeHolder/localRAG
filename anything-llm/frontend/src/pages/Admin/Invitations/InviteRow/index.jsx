import { useEffect, useRef, useState } from "react";
import { titleCase } from "text-case";
import Admin from "../../../../models/admin";

export default function InviteRow({ invite }) {
  const rowRef = useRef(null);
  const [status, setStatus] = useState(invite.status);
  const [copied, setCopied] = useState(false);
  const handleDelete = async () => {
    if (
      !window.confirm(
        `Вы уверены, что хотите деактивировать это приглашение?\nПосле этого его больше нельзя будет использовать.\n\nЭто действие необратимо.`
      )
    )
      return false;
    if (rowRef?.current) {
      rowRef.current.children[0].innerText = "Отключен";
    }
    setStatus("disabled");
    await Admin.disableInvite(invite.id);
  };
  const copyInviteLink = () => {
    if (!invite) return false;
    window.navigator.clipboard.writeText(
      `${window.location.origin}/accept-invite/${invite.code}`
    );
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
          {titleCase(status)}
        </td>
        <td className="px-6 py-4">
          {invite.claimedBy
            ? invite.claimedBy?.username || "deleted user"
            : "--"}
        </td>
        <td className="px-6 py-4">
          {invite.createdBy?.username || "deleted user"}
        </td>
        <td className="px-6 py-4">{invite.createdAt}</td>
        <td className="px-6 py-4 flex items-center gap-x-6">
          {status === "pending" && (
            <>
              <button
                onClick={copyInviteLink}
                disabled={copied}
                className="font-medium text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-800 hover:dark:bg-opacity-20"
              >
                {copied ? "Ссылка скопирована" : "Копировать ссылку-приглашение"}
              </button>
              <button
                onClick={handleDelete}
                className="font-medium text-red-600 dark:text-red-300 px-2 py-1 rounded-lg hover:bg-red-50 hover:dark:bg-red-800 hover:dark:bg-opacity-20"
              >
                Деактивировать
              </button>
            </>
          )}
        </td>
      </tr>
    </>
  );
}
