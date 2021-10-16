import {Server, IncomingMessage, ServerResponse} from "http";
import React, {ReactNode, useCallback, useContext, useState} from "react";
import {nanoid} from 'nanoid';

const http = window.require('http');

type Request = {
  id: string,
  url: string,
  method: string,
  headers: { [key: string]: string | string[] | undefined },
  body: string,
  timestamp: Date
}

type HttpServer = {
  server: Server | null,
  requests: Request[],
  start: () => void,
  stop: () => void,
}

const serverContext = React.createContext<HttpServer>({
  server: null,
  requests: [], start: () => {
  }, stop: () => {
  }
})

type ServerProviderProps = {
  children: ReactNode
}


function useProvideServer() {
  const [server, setServer] = useState<any>();
  const [requests, setRequests] = useState<Request[]>([])

  const start = useCallback((port = 8888) => {
    const httpServer = http.createServer((req: IncomingMessage, res: ServerResponse) => {
      setServer(httpServer)
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString(); // convert Buffer to string
      });
      req.on('end', () => {
        res.statusCode = 200;
        res.end();
      });

      setRequests([...requests, {
        id: nanoid(),
        method: req.method!,
        url: req.url!,
        headers: req.headers,
        body,
        timestamp: new Date()
      }])
    })
    httpServer.listen(port)
    setServer(server);
  }, [requests, server])

  const stop = useCallback(() => {
    server.close()
    setServer(undefined);
  }, [server, setServer])

  return {server, requests, start, stop}
}

export function ServerProvider({children}: ServerProviderProps) {
  const context = useProvideServer();
  return (
    <serverContext.Provider value={context}>
      {children}
    </serverContext.Provider>
  )
}

export function useServer() {
  return useContext(serverContext);
}
