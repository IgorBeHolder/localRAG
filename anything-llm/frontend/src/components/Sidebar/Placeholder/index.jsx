import React, { useRef } from "react";
import {
  BookOpen,
  Briefcase,
  Cpu,
  GitHub,
  Key,
  Plus,
  AlertCircle,
} from "react-feather";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import paths from "../../../utils/paths";

export default function Sidebar() {
  const sidebarRef = useRef(null);

  // const handleWidthToggle = () => {
  //   if (!sidebarRef.current) return false;
  //   sidebarRef.current.classList.add('translate-x-[-100%]')
  // }

  return (
    <>
      <div
        ref={sidebarRef}
        className="relative transition-all h-full duration-500 relative bg-blue-600 dark:bg-black-900 min-w-[15%] shadow-inner"
      >
        {/* <button onClick={handleWidthToggle} className='absolute -right-[13px] top-[35%] bg-white w-auto h-auto bg-transparent flex items-center'>
        <svg width="16" height="96" viewBox="0 0 16 96" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#141414"><path d="M2.5 0H3C3 20 15 12 15 32V64C15 84 3 76 3 96H2.5V0Z" fill="black" fill-opacity="0.12" stroke="transparent" stroke-width="0px"></path><path d="M0 0H2.5C2.5 20 14.5 12 14.5 32V64C14.5 84 2.5 76 2.5 96H0V0Z" fill="#141414"></path></svg>
        <ChevronLeft className='absolute h-4 w-4 text-white mr-1' />
      </button> */}

        <div className="w-full h-full flex flex-col overflow-x-hidden items-between">
          {/* Header Information */}
          <div className="flex w-full items-center justify-between">
            <p className="text-xl font-base text-slate-600 dark:text-slate-200">
              Sherpa AI Server
            </p>
            <div className="flex gap-x-2 p-2 items-center text-slate-500">
              <button className="transition-all duration-300 p-2 rounded-full bg-slate-200 text-slate-400 dark:bg-stone-800 hover:bg-blue-100 hover:text-blue-600 dark:hover:text-slate-200">
                <Key className="h-4 w-4 " />
              </button>
            </div>
          </div>

          {/* Primary Body */}
          <div className="h-[100%] flex flex-col w-full justify-between pt-4 overflow-y-hidden">
            <div className="h-auto sidebar-items dark:sidebar-items">
              <div className="flex flex-col h-[65vh] pb-8 overflow-y-scroll no-scroll">
                <div className="flex gap-x-2 items-center justify-between">
                  <button className="flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center hover:bg-blue-500 dark:hover:bg-stone-900">
                    <Plus className="h-4 w-4" />
                    <p className="text-slate-800 dark:text-slate-200 text-sm leading-loose font-semibold">
                      Новое рабочее пространство
                    </p>
                  </button>
                </div>
                <Skeleton.default
                  height={36}
                  width="100%"
                  count={3}
                  baseColor="#292524"
                  highlightColor="#4c4948"
                  enableAnimation={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
