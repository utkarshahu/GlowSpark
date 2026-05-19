import { io } from 'socket.io-client';

// If VITE_API_URL is set (e.g. 'https://api.glowspark.com/api'), we need just the base origin ('https://api.glowspark.com')
const apiUrl = import.meta.env.VITE_API_URL;
const URL = apiUrl ? apiUrl.replace(/\/api$/, '') : window.location.origin;

export const socket = io(URL, {
  autoConnect: true,
  withCredentials: true,
  transports: ['websocket'] // Force direct WebSockets to bypass Render load-balancer polling CORS/session errors!
});
