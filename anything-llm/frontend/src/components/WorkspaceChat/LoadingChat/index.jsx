import {isMobile} from "react-device-detect";
import * as Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function LoadingChat() {
  return (
    <div
      className="main-content flex-1 lg:max-w-[var(--max-content)] relative bg-white dark:bg-black-900 lg:h-full overflow-y-scroll"
    >
      <div className="main-box relative flex flex-col w-full h-full overflow-y-auto p-[16px] lg:p-[32px] !pb-0">
        <div className="flex flex-col flex-1 w-full bg-white shadow-md relative">
          <div className="flex flex-col w-full flex-grow-1 p-1 md:p-8 lg:p-[50px] relative !pb-[150px]">
            <Skeleton.default
              height="100px"
              width="100%"
              baseColor={"#2a3a53"}
              highlightColor={"#395073"}
              count={1}
              className="max-w-full md:max-w-[75%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
              containerClassName="flex justify-start"
            />
            <Skeleton.default
              height="100px"
              width={isMobile ? "70%" : "45%"}
              baseColor={"#2a3a53"}
              highlightColor={"#395073"}
              count={1}
              className="max-w-full md:max-w-[75%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
              containerClassName="flex justify-end"
            />
            <Skeleton.default
              height="100px"
              width={isMobile ? "55%" : "30%"}
              baseColor={"#2a3a53"}
              highlightColor={"#395073"}
              count={1}
              className="max-w-full md:max-w-[75%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
              containerClassName="flex justify-start"
            />
            <Skeleton.default
              height="100px"
              width={isMobile ? "88%" : "25%"}
              baseColor={"#2a3a53"}
              highlightColor={"#395073"}
              count={1}
              className="max-w-full md:max-w-[75%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
              containerClassName="flex justify-end"
            />
            <Skeleton.default
              height="160px"
              width="100%"
              baseColor={"#2a3a53"}
              highlightColor={"#395073"}
              count={1}
              className="max-w-full md:max-w-[75%] p-4 rounded-b-2xl rounded-tr-2xl rounded-tl-sm mt-6"
              containerClassName="flex justify-start"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
