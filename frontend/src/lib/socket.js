import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});

// log when connected
socket.on("connect", () => {
  console.log("[Socket] Connected with ID:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ Socket disconnected:", reason);
});
export { socket };
