import React, {useEffect, useState} from "react";
import {default as AnalystChatContainer} from "../../components/AnalystChat";
import Sidebar from "../../components/Sidebar";
import {useParams} from "react-router-dom";
import Workspace from "../../models/workspace";
import PasswordModal, {
  usePasswordModal
} from "../../components/Modals/Password";
import {isMobile} from "react-device-detect";
import {FullScreenLoader} from "../../components/Preloader";

export default function AnalystChat() {
  const {loading, requiresAuth, mode} = usePasswordModal();

  if (loading) return <FullScreenLoader/>;
  if (requiresAuth !== false) {
    return <>{requiresAuth !== null && <PasswordModal mode={mode}/>}</>;
  }

  return <ShowAnalystChat/>;
}

function ShowAnalystChat() {
  const {slug} = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <AnalystChatContainer loading={loading} workspace={workspace}/>
    </div>
  );
}
