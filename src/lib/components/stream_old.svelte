<script>
    import { onMount } from "svelte";
    import { variables } from '$lib/variables';
    import { decompress } from 'lz-string';

    let socket;
    let message = "";
    let messages = [];
    const randomId = Math.round(Math.random() * 10000000000);
    export let streamId = ""
    let connectedStreamId = "";
    $: {
        if (isSocketConnected() && connectedStreamId !== streamId) {
            socket.send(JSON.stringify({
                type: "OPEN_CONNECTION",
                streamId: streamId
            }))
            messages = [];
        }
    }
    onMount(() => {
        const connectToSocket = () => {
            socket = new WebSocket(`${variables.CHATSERVER_URL}`)
        }
        connectToSocket();
        socket.addEventListener("open", () => {
            console.log("[websocket_opened]")
            socket.send(JSON.stringify({
                type: "OPEN_CONNECTION",
                streamId: streamId
            }))
        })
        socket.onclose = function (event) {
            connectedStreamId = "";
            if (event.wasClean) {
                console.log(`[websocket_close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[websocket_close] Connection died');
            }
            // Always reconnect to webserver
            connectToSocket();
        };

        socket.onerror = function (error) {
            console.error(`[websocket_error] ${error.message}`);
        };

        const canvas = document.getElementById(`canvas-${randomId}`);
        const ctx = canvas.getContext("2d");
        socket.onmessage = function (event) {
            //console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "INCOMMING_STREAM":
                    // const img = document.querySelector('img');
                    const image = new Image();
                    image.onload = function () {
                        ctx.drawImage(image, 0, 0);
                    };
                    image.src = decompress(data.frame);
                    break;
                case "CONFIRM_CONNECTION":
                    connectedStreamId = data.streamId;
                    break;
            }
        };
    })

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }
</script>

<div class="bg-warning position-relative" style="height: 100%; width: 100%">
  123
  <canvas id="canvas-{randomId}"></canvas>
</div>
