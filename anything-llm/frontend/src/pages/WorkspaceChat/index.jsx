import React, {useEffect, useState} from "react";
import {default as WorkspaceChatContainer} from "../../components/WorkspaceChat";
import Sidebar from "../../components/Sidebar";
import {useParams} from "react-router-dom";
import Workspace from "../../models/workspace";
import PasswordModal, {
  usePasswordModal
} from "../../components/Modals/Password";
import {FullScreenLoader} from "../../components/Preloader";

export default function WorkspaceChat(props) {
  const {loading, requiresAuth, mode} = usePasswordModal();
  const {analystRoute} = props;

  if (loading) return <FullScreenLoader/>;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode}/>}</>;
  }

  return <ShowWorkspaceChat analystRoute={analystRoute}/>;
}

function ShowWorkspaceChat(props) {
  const {slug} = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const {analystRoute} = props;

  useEffect(() => {
    async function getWorkspace() {
      if (!slug) return;
      const _workspace = await Workspace.bySlug(slug);
      setWorkspace(_workspace);
      setLoading(false);
    }

    getWorkspace();
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-400 dark:bg-stone-700 lg:flex">
      <Sidebar/>
      <WorkspaceChatContainer analystRoute={analystRoute} loading={loading} workspace={workspace}/>
    </div>
  );
}
