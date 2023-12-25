import React, {useState, useEffect, useMemo} from "react";
import {UploadCloud, X, Archive} from "react-feather";
import {useParams} from "react-router-dom";
import Workspace from "../../../models/workspace";
import {hideModal} from "../../../store/popupSlice.js";
import {useDispatch} from "react-redux";
import UploadToWorkspace from "./Upload";
import DocumentSettings from "./Documents";

const noop = () => false;
export default function CoderWorkspaceModal({providedSlug = null, tabList = [], modalName = ""}) {
  const {slug} = useParams();
  const [selectedTab, setSelectedTab] = useState(tabList.length ? tabList[0] : "");
  const [workspace, setWorkspace] = useState(null);
  const [fileTypes, setFileTypes] = useState([".csv"]);
  const dispatch = useDispatch();

  let TABS = useMemo(() => {
    let tabs = {};

    if (tabList.length) {
      tabList.forEach(tab => {
        if (tab === 'documents') {
          tabs.documents = DocumentSettings;
        }
        if (tab === 'upload') {
          tabs.upload = UploadToWorkspace;
        }
      });
    }

    return tabs;
  }, [tabList]);


  useEffect(() => {
    async function fetchWorkspace() {
      const workspace = await Workspace.bySlug(providedSlug ?? slug);
      setWorkspace(workspace);
    }

    fetchWorkspace();
  }, [selectedTab, slug]);

  const closeModal = () => {
    dispatch(hideModal(modalName));
  };

  if (!workspace) return null;

  const Component = TABS[selectedTab];

  return (
    <div
      className="fixed top-0 left-0 right-0 z-100 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] h-full bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className="flex fixed top-0 left-0 right-0 w-full h-full"
        onClick={() => {
          closeModal();
        }}
      />
      <div className="relative w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-stone-700">
          <div className="flex flex-col gap-y-1 border-b dark:border-gray-600 px-4 pt-4 ">
            <div className="flex items-start justify-between rounded-t ">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Файлы для "{workspace.name}"
              </h3>
              <button
                onClick={() => {
                  closeModal();
                }}
                type="button"
                className="transition-all duration-300 text-gray-400 bg-transparent hover:bg-blue-100 hover:text-blue-600 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                data-modal-hide="staticModal"
              >
                <X className="text-__gray-300 text-lg"/>
              </button>
            </div>
            <WorkspaceSettingTabs
              selectedTab={selectedTab}
              changeTab={setSelectedTab}
            />
          </div>
          <Component
            hideModal={() => {
              closeModal()
            }}
            workspace={workspace}
            fileTypes={fileTypes}
          />
        </div>
      </div>
    </div>
  );
}

function WorkspaceSettingTabs({selectedTab, changeTab}) {
  return (
    <div>
      <ul
        className="flex md:flex-wrap overflow-x-scroll no-scroll -mb-px text-sm gap-x-2 font-medium text-center text-gray-500 dark:text-gray-400">
        {selectedTab === "documents" ? <WorkspaceTab
          active={true}
          displayName="Документы"
          tabName="documents"
          icon={<Archive className="h-4 w-4 flex-shrink-0"/>}
          onClick={changeTab}
        /> : null}
        {selectedTab === "upload" ? <WorkspaceTab
          active={true}
          displayName="Загрузить документы"
          tabName="upload"
          icon={<UploadCloud className="h-4 w-4 flex-shrink-0"/>}
          onClick={changeTab}
        /> : null}
      </ul>
    </div>
  );
}

function WorkspaceTab({
                        active = false,
                        displayName,
                        tabName,
                        icon = "",
                        onClick
                      }) {
  const classes = active
    ? "text-blue-600 border-blue-600 active dark:text-blue-400 dark:border-blue-400 bg-blue-500 bg-opacity-5"
    : "border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300";
  return (
    <li className="mr-2">
      <button
        disabled={active}
        onClick={() => onClick(tabName)}
        className={
          "flex items-center gap-x-1 p-4 border-b-2 rounded-t-lg group whitespace-nowrap " +
          classes
        }
      >
        {icon} {displayName}
      </button>
    </li>
  );
}
