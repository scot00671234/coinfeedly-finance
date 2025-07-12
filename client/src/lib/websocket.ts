export function connectWebSocket(): WebSocket | null {
  try {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    socket.onerror = (error) => {
      console.log('WebSocket connection failed - running without real-time updates');
    };
    
    return socket;
  } catch (error) {
    console.log('WebSocket not available - running without real-time updates');
    return null;
  }
}
