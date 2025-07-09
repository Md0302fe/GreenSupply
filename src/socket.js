import { io } from "socket.io-client";

// Địa chỉ backend của bạn (thay bằng domain thật khi deploy)
const SOCKET_URL = "http://localhost:3001";

// Tạo kết nối socket
const socket = io(SOCKET_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;  
