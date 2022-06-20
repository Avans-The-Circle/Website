// Variables are required for building, calling .env doesn't work when exported
export const variables = {
    CHATSERVER_URL: import.meta.env.VITE_CHATSERVER_URL,
    PEER_SERVER_URL: import.meta.env.VITE_PEER_SERVER_URL
};
