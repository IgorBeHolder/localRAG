import React, {useState, useEffect, memo} from "react";
import {v4 as uuidv4} from "uuid";
import Workspace from "../../../../../models/workspace";
import truncate from "truncate";
import {humanFileSize, milliToHms} from "../../../../../utils/numbers";
import {CheckCircle, XCircle} from "react-feather";
import {Grid} from "react-loading-icons";
import {UPLOAD_FILENAME_LEN_LIMIT} from "../../../../../utils/constants.js";

function FileUploadProgressComponent({
                                       slug,
                                       file,
                                       rejected = false,
                                       reason = null,
                                       onUploadSuccess,
                                       onUploadError,
                                     }) {
  const [timerMs, setTimerMs] = useState(10);
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    async function uploadFile() {
      const start = Number(new Date());
      const formData = new FormData();
      const fileExt = file.name.split('.')?.pop() || "";
      // const fileName = uuidv4() + (fileExt ? "." + fileExt : "");
      const fileName = (file.name.replace(/\.[^/.]+$/, "")).slice(0, UPLOAD_FILENAME_LEN_LIMIT) + (fileExt ? "." + fileExt : "");

      formData.append("file", file, fileName);
      const timer = setInterval(() => {
        setTimerMs(Number(new Date()) - start);
      }, 100);

      // Chunk streaming not working in production, so we just sit and wait
      const {response, data} = await Workspace.uploadFile(slug, formData);
      if (!response.ok) {
        setStatus("failed");
        clearInterval(timer);
        onUploadError(data.error);
        setError(data.error);
      } else {
        setStatus("complete");
        clearInterval(timer);
        onUploadSuccess();
      }
    }

    !!file && !rejected && uploadFile();
  }, []);

  if (rejected) {
    return (
      <div
        className="w-fit px-2 py-2 flex items-center gap-x-4 rounded-lg bg-blue-100 border-blue-600 dark:bg-stone-800 bg-opacity-50 border dark:border-stone-600">
        <div className="w-6 h-6">
          <XCircle className="w-6 h-6 stroke-white bg-red-500 rounded-full p-1 w-full h-full"/>
        </div>
        <div className="flex flex-col">
          <p className="text-black dark:text-stone-200 text-sm font-mono overflow-x-scroll">
            {truncate(file.name, 30)}
          </p>
          <p className="text-red-700 dark:text-red-400 text-xs font-mono">
            {reason}
          </p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="w-fit px-2 py-2 flex items-center gap-x-4 rounded-lg bg-blue-100 border-blue-600 dark:bg-stone-800 bg-opacity-50 border dark:border-stone-600">
        <div className="w-6 h-6">
          <XCircle className="w-6 h-6 stroke-white bg-red-500 rounded-full p-1 w-full h-full"/>
        </div>
        <div className="flex flex-col">
          <p className="text-black dark:text-stone-200 text-sm font-mono overflow-x-scroll">
            {truncate(file.name, 30)}
          </p>
          <p className="text-red-700 dark:text-red-400 text-xs font-mono">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-fit px-2 py-2 flex items-center gap-x-4 rounded-lg bg-blue-100 border-blue-600 dark:bg-stone-800 bg-opacity-50 border dark:border-stone-600">
      <div className="w-6 h-6">
        {status !== "complete" ? (
          <Grid className="w-6 h-6 grid-loader"/>
        ) : (
          <CheckCircle className="w-6 h-6 stroke-white bg-green-500 rounded-full p-1 w-full h-full"/>
        )}
      </div>
      <div className="flex flex-col">
        <p className="text-black dark:text-stone-200 text-sm font-mono overflow-x-scroll">
          {truncate(file.name, 30)}
        </p>
        <p className="text-gray-700 dark:text-stone-400 text-xs font-mono">
          {humanFileSize(file.size)} | {milliToHms(timerMs)}
        </p>
      </div>
    </div>
  );
}

export default memo(FileUploadProgressComponent);
