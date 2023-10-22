import React, {useEffect, useRef, useState} from "react";
import {
  AtSign,
  BookOpen,
  GitHub,
  LogOut,
  Menu,
  Package,
  Plus,
  Shield,
  Tool,
  X
} from "react-feather";
import IndexCount from "./IndexCount";
import LLMStatus from "./LLMStatus";
import NewWorkspaceModal, {
  useNewWorkspaceModal
} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import paths from "../../utils/paths";
import Discord from "../Icons/Discord";
import useUser from "../../hooks/useUser";
import {userFromStorage} from "../../utils/request";
import {AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER} from "../../utils/constants";
import useLogo from "../../hooks/useLogo";
import SettingsOverlay, {useSystemSettingsOverlay} from "./SettingsOverlay";

export default function Sidebar() {
  const {logo} = useLogo();
  const sidebarRef = useRef(null);
  const {showOverlay} = useSystemSettingsOverlay();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal
  } = useNewWorkspaceModal();

  return (
    <>
      <div
        ref={sidebarRef}
        className="relative transition-all h-full duration-500 relative bg-blue-600 dark:bg-black-900 min-w-[15%] shadow-inner"
      >
        <SettingsOverlay/>
        <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
          {/* Header Information */}
          <div className="flex w-full items-center justify-between px-2">
            <div
              className="logo-block h-[64px] px-2 gap-2 text-gray-200 cursor-pointer whitespace-nowrap user-select-none flex shrink-0 items-center justify-start">
              <img
                src={logo}
                alt="Logo"
                className="rounded max-h-[40px]"
                style={{objectFit: "contain"}}
              />
              <span className="logo-text">Sherpa AI Server</span>
            </div>
            <div className="flex gap-x-2 p-2 items-center text-slate-500">
              <AdminHome/>
              <SettingsButton onClick={showOverlay}/>
            </div>
          </div>

          {/* Primary Body */}
          <div className="h-[100%] flex flex-col w-full justify-between pt-4 overflow-y-hidden">
            <div className="h-auto sidebar-items dark:sidebar-items">
              <div className="flex flex-col h-[65vh] pb-8 overflow-y-scroll no-scroll">
                <div className="flex gap-x-2 items-center justify-between">
                  <button
                    onClick={showNewWsModal}
                    className="flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center hover:bg-blue-500 dark:hover:bg-stone-900"
                  >
                    <Plus className="h-4 w-4"/>
                    <p className="text-sm font-semibold text-left">
                      Новое рабочее пространство
                    </p>
                  </button>
                </div>
                <ActiveWorkspaces/>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal}/>}
    </>
  );
}

export function SidebarMobileHeader() {
  const {logo} = useLogo();
  const sidebarRef = useRef(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showBgOverlay, setShowBgOverlay] = useState(false);
  const {showOverlay} = useSystemSettingsOverlay();
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal
  } = useNewWorkspaceModal();

  useEffect(() => {
    // Darkens the rest of the screen
    // when sidebar is open.
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
        className="flex justify-between relative top-0 left-0 w-full rounded-b-lg px-2 pb-4 bg-white dark:bg-black-900 text-slate-800 dark:text-slate-200">
        <button
          onClick={() => setShowSidebar(true)}
          className="rounded-md bg-stone-200 p-2 flex items-center justify-center text-slate-800 hover:bg-stone-300 group dark:bg-stone-800 dark:text-slate-200 dark:hover:bg-stone-900 dark:border dark:border-stone-800"
        >
          <Menu className="h-6 w-6"/>
        </button>
        <div className="flex shrink-0 w-fit items-center justify-start">
          <img
            src={logo}
            alt="Logo"
            className="rounded w-full max-h-[40px]"
            style={{objectFit: "contain"}}
          />
          <span className="logo-text">Sherpa AI Server</span>
        </div>
      </div>
      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`
        }}
        className={`z-99 fixed top-0 left-0 transition-all duration-500 w-[100vw] h-[100vh]`}
      >
        <div
          className={`${
            showBgOverlay
              ? "transition-all opacity-1"
              : "transition-none opacity-0"
          }  duration-500 fixed top-0 left-0 bg-black-900 bg-opacity-75 w-screen h-screen`}
          onClick={() => setShowSidebar(false)}
        />
        <div
          ref={sidebarRef}
          className="relative h-[100vh] fixed top-0 left-0  rounded-r-[26px] bg-white dark:bg-black-900 w-[80%] p-[18px] "
        >
          <SettingsOverlay/>
          <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
            {/* Header Information */}
            <div className="flex w-full items-center justify-between gap-x-4">
              <div className="flex shrink-1 w-fit items-center justify-start">
                <img
                  src={logo}
                  alt="Logo"
                  className="rounded w-full max-h-[40px]"
                  style={{objectFit: "contain"}}
                />
                <span className="logo-text">Sherpa AI Server</span>
              </div>
              <div className="flex gap-x-2 items-center text-slate-500 shink-0">
                <AdminHome/>
                <SettingsButton onClick={showOverlay}/>
              </div>
            </div>

            {/* Primary Body */}
            <div className="h-full flex flex-col w-full justify-between pt-4 overflow-y-hidden ">
              <div className="h-auto md:sidebar-items md:dark:sidebar-items">
                <div
                  style={{height: "calc(100vw - -3rem)"}}
                  className=" flex flex-col gap-y-4 pb-8 overflow-y-scroll no-scroll"
                >
                  <div className="flex gap-x-2 items-center justify-between">
                    <button
                      onClick={showNewWsModal}
                      className="flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center hover:bg-blue-500 dark:hover:bg-stone-900"
                    >
                      <Plus className="h-4 w-4"/>
                      <p className="text-slate-800 dark:text-slate-200 text-sm leading-loose font-semibold">
                        Новое рабочее пространство
                      </p>
                    </button>
                  </div>
                  <ActiveWorkspaces/>
                </div>
              </div>
              <div>
                <div className="flex flex-col gap-y-2">
                  <div className="w-full flex items-center justify-between">
                    <LLMStatus/>
                    <IndexCount/>
                  </div>
                  {/* <a
                    href={paths.feedback()}
                    target="_blank"
                    className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-slate-400 dark:border-transparent rounded-lg text-slate-800 dark:text-slate-200 justify-center items-center hover:bg-slate-100 dark:bg-stone-800 dark:hover:bg-stone-900"
                  >
                    <AtSign className="h-4 w-4" />
                    <p className="text-slate-800 dark:text-slate-200 text-xs leading-loose font-semibold">
                      Feedback form
                    </p>
                  </a> */}
                  <ManagedHosting/>
                  <LogoutButton/>
                </div>

                {/* Footer */}
                <div className="flex items-end justify-between mt-2">
                  <div className="flex gap-x-1 items-center">
                    <a
                      href={paths.github()}
                      className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-slate-800 hover:bg-slate-800 hover:text-slate-200 dark:hover:text-slate-200"
                    >
                      <GitHub className="h-4 w-4 "/>
                    </a>
                    <a
                      href={paths.docs()}
                      className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-slate-800 hover:bg-slate-800 hover:text-slate-200 dark:hover:text-slate-200"
                    >
                      <BookOpen className="h-4 w-4 "/>
                    </a>
                    <a
                      href={paths.discord()}
                      className="transition-all duration-300 p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-800 group"
                    >
                      <Discord
                        className="h-4 w-4 stroke-slate-400 group-hover:stroke-slate-200 dark:group-hover:stroke-slate-200"/>
                    </a>
                  </div>
                  <a
                    href={paths.mailToMintplex()}
                    className="transition-all duration-300 text-xs text-slate-500 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    @MintplexLabs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal}/>}
      </div>
    </>
  );
}

function AdminHome() {
  const {user} = useUser();
  if (!user || user?.role !== "admin") return null;
  return (
    <a
      href={paths.admin.system()}
      className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-stone-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-slate-200"
    >
      <Shield className="h-4 w-4"/>
    </a>
  );
}

function LogoutButton() {
  if (!window.localStorage.getItem(AUTH_USER)) return null;
  const user = userFromStorage();
  if (!user.username) return null;

  return (
    <button
      onClick={() => {
        window.localStorage.removeItem(AUTH_USER);
        window.localStorage.removeItem(AUTH_TOKEN);
        window.localStorage.removeItem(AUTH_TIMESTAMP);
        window.location.replace(paths.home());
      }}
      className="flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center hover:bg-blue-500 dark:hover:bg-stone-900"
    >
      <LogOut className="h-4 w-4 flex-shrink-0"/>
      <p className="text-sm leading-loose font-semibold whitespace-nowrap overflow-hidden ">
        Выйти из {user.username}
      </p>
    </button>
  );
}

function SettingsButton({onClick}) {
  const {user} = useUser();

  if (!!user && user?.role !== "admin") return null;
  return (
    <button
      onClick={onClick}
      className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-stone-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-slate-200"
    >
      <Tool className="h-4 w-4 "/>
    </button>
  );
}

function ManagedHosting() {
  if (window.location.origin.includes(".useanything.com")) return null;
  return (
    <a
      href={paths.hosting()}
      target="_blank"
      className="flex flex-grow w-[100%] h-[36px] gap-x-2 py-[5px] px-4 border border-slate-400 dark:border-transparent rounded-lg text-slate-800 dark:text-slate-200 justify-center items-center hover:bg-slate-100 dark:bg-stone-800 dark:hover:bg-stone-900"
    >
      <Package className="h-4 w-4"/>
      <p className="text-slate-800 dark:text-slate-200 text-xs leading-loose font-semibold">
        Managed cloud hosting
      </p>
    </a>
  );
}
