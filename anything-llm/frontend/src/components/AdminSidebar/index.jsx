import React, {useEffect, useRef, useState} from "react";
import {
  BookOpen,
  Eye,
  Key,
  Mail,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X
} from "react-feather";
import paths from "../../utils/paths";
import useLogo from "../../hooks/useLogo";

export function SidebarMobileHeader() {
  const {logo} = useLogo();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);

  useEffect(() => {
    function handleBg() {
      if (showSidebar) {
        setTimeout(() => {
          setShowBgOverlay(true);
        }, 300);
      } else {
        setShowBgOverlay(false);
      }
    }

    handleBg();
  }, [showSidebar]);

  return (
    <>
      <div
        className="flex lg:hidden justify-between relative top-0 left-0 w-full p-2 bg-white dark:bg-black-900 text-slate-800 dark:text-slate-200 z-100 shadow shadow-blue-500">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="rounded-md bg-stone-200 p-2 flex items-center justify-center text-slate-800 hover:bg-stone-300 group dark:bg-stone-800 dark:text-slate-200 dark:hover:bg-stone-900 dark:border dark:border-stone-800"
        >
          <Menu className="h-6 w-6"/>
        </button>
        <div className="flex shrink-0 w-fit items-center justify-center flex-1 mr-[40px] gap-2 px-2">
          <img
            src={logo}
            alt="Logo"
            className="rounded max-h-[40px]"
            style={{objectFit: "contain"}}
          />
          <span className="logo-text">Sherpa AI Server</span>
        </div>
      </div>

      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`
        }}
        ref={sidebarRef}
        className="aside-menu top-0 left-0 z-99 fixed lg:relative lg:!transform-none transition-all lg:transition-none h-full duration-500 bg-blue-600 dark:bg-black-900 min-w-[15%] shadow-inner pt-[56px] lg:pt-0"
      >
        <div className="w-full h-full flex flex-col overflow-x-hidden items-between relative">
          {/* Header Information */}
          <div className="flex w-full items-center justify-between px-2">
            <div
              className="logo-block overflow-hidden h-[64px] px-2 gap-2 text-gray-200 cursor-pointer whitespace-nowrap user-select-none flex shrink-0 items-center justify-start">
              <img
                src={logo}
                alt="Logo"
                className="rounded max-h-[40px]"
                style={{objectFit: "contain"}}
              />
              <span className="logo-text overflow-hidden whitespace-nowrap text-ellipsis">Sherpa AI Server</span>
            </div>
            <div className="flex gap-x-2 p-2 items-center text-slate-500">
              <a
                href={paths.home()}
                className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-stone-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4"/>
              </a>
            </div>
          </div>

          {/* Primary Body */}
          <div className="flex flex-1 flex-col w-full justify-between overflow-y-auto">
            <div className="h-auto sidebar-items dark:sidebar-items mb-auto">
              <div className="flex flex-col max-h-[65vh] pb-8 overflow-y-scroll no-scroll">
                <Option
                  href={paths.admin.system()}
                  btnText="Системные настройки"
                  icon={<Settings className="h-4 w-4 flex-shrink-0"/>}
                />
                <Option
                  href={paths.admin.invites()}
                  btnText="Управление приглашениями"
                  icon={<Mail className="h-4 w-4 flex-shrink-0"/>}
                />
                <Option
                  href={paths.admin.users()}
                  btnText="Управление пользователями"
                  icon={<Users className="h-4 w-4 flex-shrink-0"/>}
                />
                <Option
                  href={paths.admin.workspaces()}
                  btnText="Рабочие пространства"
                  icon={<BookOpen className="h-4 w-4 flex-shrink-0"/>}
                />
                <Option
                  href={paths.admin.chats()}
                  btnText="История чатов"
                  icon={<MessageSquare className="h-4 w-4 flex-shrink-0"/>}
                />
{/*                <Option
                  href={paths.admin.appearance()}
                  btnText="Внешний вид"
                  icon={<Eye className="h-4 w-4 flex-shrink-0"/>}
                />
                <Option
                  href={paths.admin.apiKeys()}
                  btnText="Ключи API"
                  icon={<Key className="h-4 w-4 flex-shrink-0"/>}
                />*/}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`${
          showBgOverlay
            ? "transition-all opacity-1"
            : "transition-none opacity-0 pointer-events-none"
        } z-98 lg:hidden duration-500 fixed top-0 left-0 bg-black-900 bg-opacity-75 w-screen h-screen`}
        onClick={() => setShowSidebar(false)}
      />
    </>
  );
}

export default function AdminSidebar() {
  return (
    <SidebarMobileHeader/>
  );
}

const Option = ({btnText, icon, href}) => {
  const isActive = window.location.pathname === href;
  return (
    <div className="flex gap-x-2 items-center justify-between">
      <a
        href={href}
        className={`flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center ${
          isActive
            ? "bg-blue-500"
            : "hover:bg-blue-500 dark:hover:bg-stone-900"
        }`}
      >
        {icon}
        <p className="text-sm leading-loose font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
          {btnText}
        </p>
      </a>
    </div>
  );
};
