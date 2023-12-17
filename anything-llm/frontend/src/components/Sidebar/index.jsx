import React, {useEffect, useRef, useState} from "react";
import {
  LogOut,
  Menu,
  Package,
  Plus,
  Shield,
  Tool,
  X
} from "react-feather";
import {useSelector, useDispatch} from "react-redux";

import NewWorkspaceModal, {useNewWorkspaceModal} from "../Modals/NewWorkspace";
import ActiveWorkspaces from "./ActiveWorkspaces";
import paths from "../../utils/paths";
import useUser from "../../hooks/useUser";
import {userFromStorage} from "../../utils/request";
import {AUTH_TIMESTAMP, AUTH_TOKEN, AUTH_USER} from "../../utils/constants";
import useLogo from "../../hooks/useLogo";
import SettingsOverlay, {useSystemSettingsOverlay} from "./SettingsOverlay";
import ManageWorkspace, {useManageWorkspaceModal} from "../Modals/MangeWorkspace/index.jsx";
import SystemSettingsModal, {useSystemSettingsModal} from "../Modals/Settings/index.jsx";
import CoderWorkspaceModal, {useCoderWorkspaceModal} from "../Modals/MangeCoder/index.jsx";

export default function Sidebar() {
  const {
    showing: showingNewWsModal,
    showModal: showNewWsModal,
    hideModal: hideNewWsModal
  } = useNewWorkspaceModal();

  return (
    <>
      <SidebarMobileHeader/>
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

  // Workspace
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const {showing, showModal, hideModal} = useManageWorkspaceModal();
  const showModalCoderWorkspace = useSelector((state) => state.popup.modalCoderWorkspace);

  // Settings
  const [tab, setTab] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const {
    showing: showingSettings,
    hideModal: hideModalSettings,
    showModal: showModalSettings
  } = useSystemSettingsModal();

  const handleModalClose = () => {
    hideModalSettings();
    setTab(null);
    return false;
  };

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
          <span className="logo-text overflow-hidden whitespace-nowrap text-ellipsis">Sherpa AI Server</span>
        </div>
      </div>

      <div
        style={{
          transform: showSidebar ? `translateX(0vw)` : `translateX(-100vw)`
        }}
        ref={sidebarRef}
        className="aside-menu top-0 left-0 z-99 fixed lg:relative lg:!transform-none transition-all lg:transition-none h-full duration-500 bg-blue-600 dark:bg-black-900 min-w-[15%] shadow-inner pt-[56px] lg:pt-0"
      >
        <SettingsOverlay setTab={setTab}
                         tab={tab}
                         settings={settings}
                         setSettings={setSettings}
                         showModal={showModalSettings}
                         hideModal={hideModalSettings}
                         setLoading={setLoading}
                         loading={loading}/>

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
              <AdminHome/>
              {/*<SettingsButton onClick={showOverlay}/>*/}
            </div>
          </div>

          {/* Primary Body */}
          <div className="flex flex-1 flex-col w-full justify-between overflow-y-auto">
            <div className="h-auto sidebar-items dark:sidebar-items mb-auto">
              <div className="flex flex-col max-h-[65vh] pb-8 overflow-y-scroll no-scroll">
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
                <ActiveWorkspaces setSelectedWs={setSelectedWs} selectedWs={selectedWs} setWorkspaces={setWorkspaces}
                                  workspaces={workspaces} showModal={showModal}/>
              </div>
            </div>
            <LogoutButton/>
          </div>
        </div>
      </div>

      {showing && !!selectedWs && (
        <ManageWorkspace hideModal={hideModal} providedSlug={selectedWs.slug}/>
      )}

      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal}/>}

      {showModalCoderWorkspace && <CoderWorkspaceModal/>}

      {showingSettings && !!tab && (
        <SystemSettingsModal tab={tab} hideModal={handleModalClose}/>
      )}

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
      className="flex h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center hover:bg-blue-500 dark:hover:bg-stone-900"
    >
      <LogOut className="h-4 w-4 flex-shrink-0"/>
      <p className="text-sm leading-loose font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
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
