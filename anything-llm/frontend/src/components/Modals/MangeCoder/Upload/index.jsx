import React, {useState, useCallback, useEffect} from "react";
import Workspace from "../../../../models/workspace";
import paths from "../../../../utils/paths";
import FileUploadProgress from "./FileUploadProgress";
import {useDropzone} from "react-dropzone";
import {v4} from "uuid";
import System from "../../../../models/system";
import {Frown} from "react-feather";
import showToast from "../../../../utils/toast";

export default function UploadToWorkspace({workspace, fileTypes}) {
  const [ready, setReady] = useState(null);
  const [files, setFiles] = useState([]);
  const handleUploadSuccess = () => {
    showToast("Файл успешно загружен", "success");
  };
  const handleUploadError = (message) => {
    showToast(`Ошибка загрузки файла: ${message}`, "error");
  };

  const onDrop = useCallback(async (acceptedFiles, rejections) => {
    const newAccepted = acceptedFiles.map((file) => {
      return {
        uid: v4(),
        file
      };
    });
    const newRejected = rejections.map((file) => {
      return {
        uid: v4(),
        file: file.file,
        rejected: true,
        reason: file.errors[0].code
      };
    });

    setFiles([...files, ...newAccepted, ...newRejected]);
  }, []);

  useEffect(() => {
    async function checkProcessorOnline() {
      const online = fileTypes.indexOf('.csv') > -1 ? await System.checkCsvUploadProcessorOnline() : await System.checkDocumentProcessorOnline();
      setReady(online);
    }

    checkProcessorOnline();
  }, []);

  const {getRootProps, getInputProps} = useDropzone({
    onDrop,
    accept: {
      ...fileTypes
    }
  });

  const deleteWorkspace = async () => {
    if (
      !window.confirm(
        `Вы собираетесь удалить всё рабочее пространство ${workspace.name}. Это приведет к удалению всех вложений векторов из вашей векторной базы данных.\n\nИсходные исходные файлы останутся нетронутыми. Это действие необратимо.`
      )
    )
      return false;
    await Workspace.delete(workspace.slug);
    workspace.slug === slug
      ? (window.location = paths.home())
      : window.location.reload();
  };

  if (ready === null) {
    return (
      <ModalWrapper deleteWorkspace={deleteWorkspace}>
        <div
          className="outline-none transition-all cursor-wait duration-300 bg-stone-400 bg-opacity-20 flex h-[20rem] overflow-y-scroll overflow-x-hidden rounded-lg">
          <div className="flex flex-col gap-y-1 w-full h-full items-center justify-center">
            <p className="text-slate-400 text-xs">
              Проверка обработчика документов онлайн – подождите.
            </p>
            <p className="text-slate-400 text-xs">
              это займет всего несколько минут.
            </p>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  if (ready === false) {
    return (
      <ModalWrapper deleteWorkspace={deleteWorkspace}>
        <div
          className="outline-none transition-all duration-300 bg-red-200 flex h-[20rem] overflow-y-scroll overflow-x-hidden rounded-lg">
          <div className="flex flex-col gap-y-1 w-full h-full items-center justify-center md:px-0 px-2">
            <Frown className="w-8 h-8 text-red-800"/>
            <p className="text-red-800 text-xs text-center">
              Обработчик документов отключен.
            </p>
            <p className="text-red-800 text-[10px] md:text-xs text-center">
              вы не можете загружать документы из пользовательского интерфейса прямо сейчас
            </p>
          </div>
        </div>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper deleteWorkspace={deleteWorkspace}>
      <div
        {...getRootProps()}
        className="outline-none transition-all cursor-pointer duration-300 hover:bg-opacity-40 bg-stone-400 bg-opacity-20 flex h-[20rem] overflow-y-scroll overflow-x-hidden rounded-lg"
      >
        <input {...getInputProps()} />
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                aria-hidden="true"
                className="w-10 h-10 mb-3 text-gray-600 dark:text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-600 dark:text-slate-300">
                <span className="font-semibold">Кликните для загрузки</span> или перетащите файл сюда
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-300"></p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full p-4 gap-y-2">
            {files.map((file) => (
              <FileUploadProgress
                key={file.uid}
                file={file.file}
                slug={workspace.slug}
                rejected={file?.rejected}
                reason={file?.reason}
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            ))}
          </div>
        )}
      </div>
      <p className="text-gray-600 dark:text-stone-400 text-xs ">
        Поддерживаемые расширения файлов:{" "}
        <code
          className="text-xs bg-gray-200 text-gray-800 dark:bg-stone-800 dark:text-slate-400 font-mono rounded-sm px-1">
          {Object.values(fileTypes).flat().join(" ")}
        </code>
      </p>
    </ModalWrapper>
  );
}

function ModalWrapper({deleteWorkspace, children}) {
  return (
    <div className="p-6 flex h-full w-full max-h-[80vh] overflow-y-scroll">
      <div className="flex flex-col gap-y-1 w-full">
        <div className="flex flex-col mb-2">
          <p className="text-gray-800 dark:text-stone-200 text-base ">
            Добавьте файл с данными в рабочее пространство для анализа данных.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
