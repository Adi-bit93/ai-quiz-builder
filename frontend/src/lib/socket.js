import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
});

// log when connected
socket.on("connect", () => {
  console.log("[Socket] Connected with ID:", socket.id);
});

export { socket };
