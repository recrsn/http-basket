import {PlayIcon, StopIcon} from "@heroicons/react/solid";
import {Server} from "http";
import {AddressInfo} from "net";
import React, {ButtonHTMLAttributes, useCallback} from 'react';
import {useServer, ServerProvider} from "./hooks/use-server";
import {ReactComponent as SelectRequest} from "./images/select-request.svg";
import {ReactComponent as Basket} from "./images/basket.svg";

type StartStopButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  started: boolean,
}

function StartStopButton({started, ...props}: StartStopButtonProps) {
  const clazz = started ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
  return <button {...props} type="button"
                 className={`flex px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${clazz}`}>
    {started ? <StopIcon className="h-5 w-5 mr-1"/> : <PlayIcon className="h-5 w-5 mr-1"/>}
    <span>{started ? "Stop" : "Start"}</span>
  </button>;
}

function getServerStatus(server: Server | null) {
  const serverAddress = server && server.address()
  if (!serverAddress) {
    return "To begin, start the HTTP server"
  }

  const {address, port} = serverAddress as AddressInfo
  return `Server running at http://${address}:${port}`
}

function ControlBar() {
  const {server, start, stop} = useServer();
  const startStopServer = useCallback(() => {
    if (server) {
      stop()
    } else {
      start()
    }
  }, [server, start, stop]);

  return <div className="p-2 flex items-center justify-between border-b border-gray-100">
    <span className="text-sm text-gray-500">
      {getServerStatus(server)}
    </span>
    <StartStopButton started={!!server} onClick={startStopServer}/>
  </div>;
}

function Sidebar() {
  const {requests} = useServer()
  return <aside className="w-64 bg-gray-50 border-r border-gray-100">
    <div className="p-1 flex flex-row items-center">
      <Basket className="h-12 w-12 mr-1"/>
      <span>HTTP <i>Basket</i></span>
    </div>
    <div className="p-1 my-2 flex flex-col">
      {requests.map(request => (
        <a key={request.id} className="flex flex-col border-b border-gray-100 px-2 py-1">
          <p className="text-sm">{request.method} {request.url}</p>
          <p className="text-xs text-gray-300">{request.timestamp.toLocaleString()}</p>
        </a>
      ))}
    </div>
  </aside>;
}

function App() {
  return (
    <ServerProvider>
      <div className="w-full flex h-full">
        <Sidebar/>
        <main className="w-full flex flex-col">
          <ControlBar/>
          <div className="flex flex-col justify-center items-center">
            <div className="m-auto">
              <SelectRequest className="w-80 h-80"/>
              <p className="text-center text-sm text-gray-400">Select a request to view</p>
            </div>
          </div>
        </main>
      </div>
    </ServerProvider>
  );
}

export default App;
