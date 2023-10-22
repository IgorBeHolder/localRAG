import React, { useState, useEffect } from "react";
import { Book, Settings } from "react-feather";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Workspace from "../../../models/workspace";
import ManageWorkspace, {
  useManageWorkspaceModal,
} from "../../Modals/MangeWorkspace";
import paths from "../../../utils/paths";
import { useParams } from "react-router-dom";

export default function ActiveWorkspaces() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWs, setSelectedWs] = useState(null);
  const { showing, showModal, hideModal } = useManageWorkspaceModal();

  useEffect(() => {
    async function getWorkspaces() {
      const workspaces = await Workspace.all();
      setLoading(false);
      setWorkspaces(workspaces);
    }
    getWorkspaces();
  }, []);

  if (loading) {
    return (
      <>
        <Skeleton.default
          height={36}
          width="100%"
          count={3}
          baseColor="#292524"
          highlightColor="#4c4948"
          enableAnimation={true}
        />
      </>
    );
  }

  return (
    <>
      {workspaces.map((workspace) => {
        const isActive = workspace.slug === slug;
        return (
          <div
            key={workspace.id}
            className="flex gap-x-2 items-center justify-between"
          >
            <a
              href={isActive ? null : paths.workspace.chat(workspace.slug)}
              className={`flex flex-grow w-[75%] h-[48px] gap-x-2 py-[5px] px-4 text-white dark:text-slate-200 justify-start items-center ${
                isActive
                  ? "bg-blue-500"
                  : "hover:bg-blue-500 dark:hover:bg-stone-900"
              }`}
            >
              <Book className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm leading-loose font-semibold whitespace-nowrap overflow-hidden ">
                {workspace.name}
              </p>
            </a>
            <button
              onClick={() => {
                setSelectedWs(workspace);
                showModal();
              }}
              className="rounded-md bg-stone-200 mr-2 p-2 h-[36px] w-[15%] flex items-center justify-center text-slate-800 hover:bg-stone-300 group dark:bg-stone-800 dark:text-slate-200 dark:hover:bg-stone-900 dark:border dark:border-stone-800"
            >
              <Settings className="h-3.5 w-3.5 transition-all duration-300 group-hover:rotate-90" />
            </button>
          </div>
        );
      })}
      {showing && !!selectedWs && (
        <ManageWorkspace hideModal={hideModal} providedSlug={selectedWs.slug} />
      )}
    </>
  );
}
