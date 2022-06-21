<script>
    import { variables } from "$lib/variables";
    import { onDestroy, onMount } from "svelte";
    import { compress, decompress } from "lz-string";

    let streamId = "1";
    let connectedStreamId = "";
    $: {
        if (isSocketConnected() && connectedStreamId !== streamId) {
            socket.send(JSON.stringify({
                type: "OPEN_CONNECTION",
                streamId: streamId,
                isStreamer: true
            }))
        }
    }
    let frameCounter = 0;
    let clientCount = 0;
    let socket;
    let video;
    let pageActive = false;

    const connectToSocket = () => {
        if (!pageActive) {
            return;
        }
        socket = new WebSocket(`${variables.CHATSERVER_URL}`);

        socket.onclose = function (event) {
            connectedStreamId = "";
            if (event.wasClean) {
                console.log(`[websocket_close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            } else {
                console.log('[websocket_close] Connection died');
            }
            // Always reconnect to webserver
            setTimeout(connectToSocket, 100);
        };

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "OPEN_CONNECTION",
                    streamId: streamId,
                    isStreamer: true
                })
            );
            sendFrame()
        };

        socket.onmessage = function (event) {
            //console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "SEND_NEXT_FRAME":
                    console.log("received request for next frame")
                    clientCount = data.clientCount
                    sendFrame();
                    // setTimeout(sendFrame, 1000);
                    break;
                case "CONFIRM_CONNECTION":
                    connectedStreamId = data.streamId;
                    console.log("Connected streamid", connectedStreamId)
                    break;
            }
        };
    }

    // returns a frame encoded in base64
    const getFrame = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        return canvas.toDataURL("image/png");
    };

    function sendFrame() {
        const frameData = getFrame();
        // Frame is probably not ready jet
        if (frameData.length <= 10) {
            setTimeout(sendFrame, 100)
            return;
        }
        frameCounter++;
        const compFrameData = compress(frameData);
        const data = {
            type: "STREAM_FRAME",
            frame: compFrameData,
            frame_timing: (new Date()).getTime(),
            frameCounter: frameCounter
        }
        send(data, socket);
        console.log(`[${data.frameCounter}]Sending frame: ${data.frame_timing}`);
    }

    onDestroy(() => {
        pageActive = false;
        if (isSocketConnected()) {
            socket.close();
        }
    })
    onMount(() => {
        pageActive = true;
        video = document.querySelector("video");
        // request access to webcam
        navigator.mediaDevices
            .getUserMedia({video: {width: 426, height: 240}})
            .then((stream) => (video.srcObject = stream));

        connectToSocket();
    });

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }

    async function send(compFrameData, socket) {
        const dataJson = JSON.stringify(compFrameData);
        let blob = new Blob([dataJson]);
        socket.send(blob);

        // const dataString = JSON.stringify({compressed: true, data: compress(dataJson)});
        // socket.send(dataString);
    }
</script>

<div>
  <label for="streamId">Enter your streamer name:</label>
  <input id="streamId" type="text" bind:value={streamId}>
</div>

<br>
<label for="videoStream">View count: {clientCount}</label>
<label>Amount of frames send: {frameCounter}</label>
<br>
<video id="videoStream" autoplay />

