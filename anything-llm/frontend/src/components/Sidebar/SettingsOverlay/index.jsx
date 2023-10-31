import React, {useEffect, useState} from "react";
import {
  X,
  Archive,
  Lock,
  Users,
  Database,
  MessageSquare,
  Eye,
  Key
} from "react-feather";

import useLogo from "../../../hooks/useLogo";
import System from "../../../models/system";

const OVERLAY_ID = "sherpa-ai-system-overlay";
const OVERLAY_CLASSES = {
  enabled: ["z-10", "opacity-1"],
  disabled: ["-z-10", "opacity-0"]
};

export default function SettingsOverlay({
                                          setTab,
                                          tab,
                                          settings,
                                          setSettings,
                                          showModal,
                                          hideModal,
                                          setLoading,
                                          loading
                                        }) {
  const {logo} = useLogo();

  const selectTab = (tab = null) => {
    setTab(tab);
    showModal(true);
  };

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      setSettings(_settings);
      setLoading(false);
    }

    fetchKeys();
  }, []);

  return (
    <div
      id={OVERLAY_ID}
      className="absolute left-0 top-0 w-full h-full opacity-0 -z-10 transition-all duration-300 bg-blue-600 dark:bg-black-900 flex flex-col overflow-x-hidden items-between shadow-inner pt-[56px] lg:pt-0"
    >
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
          <button
            onClick={() => {
              setTab(null);
              hideOverlay();
            }}
            className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-stone-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4 "/>
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col w-full justify-between overflow-y-auto">
        <div className="h-auto sidebar-items dark:sidebar-items mb-auto">
          <p className="text-sm leading-loose my-2 text-white p-4 dark:text-slate-200 ">
            Выберите параметр
          </p>
          {loading ? (
            <div className="flex flex-col max-h-[65vh] pb-8 overflow-y-scroll no-scroll">
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
              <div className="rounded-lg w-[90%] h-[36px] bg-stone-600 animate-pulse"/>
            </div>
          ) : (
            <div className="flex flex-col max-h-[65vh] pb-8 overflow-y-scroll no-scroll">
              {!settings?.MultiUserMode && (
                <Option
                  btnText="Вид"
                  icon={<Eye className="h-4 w-4 flex-shrink-0"/>}
                  isActive={tab === "appearance"}
                  onClick={() => selectTab("appearance")}
                />
              )}
              <Option
                btnText="Настройки LLM"
                icon={<MessageSquare className="h-4 w-4 flex-shrink-0"/>}
                isActive={tab === "llm"}
                onClick={() => selectTab("llm")}
              />
              <Option
                btnText="База данных векторов"
                icon={<Database className="h-4 w-4 flex-shrink-0"/>}
                isActive={tab === "vectordb"}
                onClick={() => selectTab("vectordb")}
              />
              <Option
                btnText="Экспорт или импорт"
                icon={<Archive className="h-4 w-4 flex-shrink-0"/>}
                isActive={tab === "exportimport"}
                onClick={() => selectTab("exportimport")}
              />
              {!settings?.MultiUserMode && (
                <>
                  <Option
                    btnText="Защита паролем"
                    icon={<Lock className="h-4 w-4 flex-shrink-0"/>}
                    isActive={tab === "password"}
                    onClick={() => selectTab("password")}
                  />
                  <Option
                    btnText="Пользователи"
                    icon={<Users className="h-4 w-4 flex-shrink-0"/>}
                    isActive={tab === "multiuser"}
                    onClick={() => selectTab("multiuser")}
                  />
                  <Option
                    btnText="API-ключ"
                    icon={<Key className="h-4 w-4 flex-shrink-0"/>}
                    isActive={tab === "apikey"}
                    onClick={() => selectTab("apikey")}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Option = ({btnText, icon, isActive, onClick}) => {
  return (
    <div className="flex gap-x-2 items-center justify-between">
      <button
        onClick={onClick}
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
      </button>
    </div>
  );
};

function showOverlay() {
  document
    .getElementById(OVERLAY_ID)
    .classList.remove(...OVERLAY_CLASSES.disabled);
  document.getElementById(OVERLAY_ID).classList.add(...OVERLAY_CLASSES.enabled);
}

function hideOverlay() {
  document
    .getElementById(OVERLAY_ID)
    .classList.remove(...OVERLAY_CLASSES.enabled);
  document
    .getElementById(OVERLAY_ID)
    .classList.add(...OVERLAY_CLASSES.disabled);
}

export function useSystemSettingsOverlay() {
  return {showOverlay, hideOverlay};
}
