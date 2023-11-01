import {useEffect, useState} from "react";
import Sidebar from "../../../components/AdminSidebar";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import {Mail} from "react-feather";
import usePrefersDarkMode from "../../../hooks/usePrefersDarkMode";
import Admin from "../../../models/admin";
import InviteRow from "./InviteRow";
import NewInviteModal, {NewInviteModalId} from "./NewInviteModal";

export default function AdminInvites() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-400 dark:bg-stone-700 lg:flex">
      <Sidebar/>
      <div
        className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full  p-[16px] md:p-[32px] !pb-0"
      >
        <div
          className="main-box flex flex-col w-full h-full p-2 md:p-6 lg:p-[50px] bg-white shadow-md relative overflow-y-auto">
          <div className="w-full flex flex-col gap-y-1">
            <div className="items-center flex gap-x-4">
              <p className="text-3xl font-semibold text-slate-600 dark:text-slate-200">
                Приглашения
              </p>
              <button
                onClick={() =>
                  document?.getElementById(NewInviteModalId)?.showModal()
                }
                className="border border-slate-800 dark:border-slate-200 px-4 py-1 rounded-lg text-slate-800 dark:text-slate-200 text-sm items-center flex gap-x-2 hover:bg-slate-800 hover:text-slate-100 dark:hover:bg-slate-200 dark:hover:text-slate-800"
              >
                <Mail className="h-4 w-4"/> Создать ссылку-приглашение
              </button>
            </div>
            <p className="text-sm font-base text-slate-600 dark:text-slate-200">
              Создайте ссылки для приглашений, чтобы люди в вашей организации могли принять их и зарегистрироваться.
              Приглашения может использовать только один пользователь.
            </p>
          </div>
          <InvitationsContainer/>
        </div>
        <NewInviteModal/>
      </div>
    </div>
  );
}

function InvitationsContainer() {
  const darkMode = usePrefersDarkMode();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState([]);
  useEffect(() => {
    async function fetchInvites() {
      const _invites = await Admin.invites();
      setInvites(_invites);
      setLoading(false);
    }

    fetchInvites();
  }, []);

  if (loading) {
    return (
      <Skeleton.default
        height="80vh"
        width="100%"
        baseColor={darkMode ? "#2a3a53" : null}
        highlightColor={darkMode ? "#395073" : null}
        count={1}
        className="w-full p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
        containerClassName="flex w-full"
      />
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 rounded-lg mt-5">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-stone-800 dark:text-gray-400">
        <tr>
          <th scope="col" className="px-6 py-3">
            Положение дел
          </th>
          <th scope="col" className="px-6 py-3 rounded-tl-lg">
            Принят
          </th>
          <th scope="col" className="px-6 py-3">
            Сделано
          </th>
          <th scope="col" className="px-6 py-3">
            Созданный
          </th>
          <th scope="col" className="px-6 py-3 rounded-tr-lg">
            Действия
          </th>
        </tr>
        </thead>
        <tbody>
        {invites.map((invite) => (
          <InviteRow key={invite.id} invite={invite}/>
        ))}
        </tbody>
      </table>
    </div>
  );
}
