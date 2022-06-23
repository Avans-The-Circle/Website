<script>
    // @ts-nocheck

    import { variables } from "$lib/variables";
    import { onDestroy, onMount } from "svelte";
    import { compress, decompress } from "lz-string";
    import forge from "node-forge";
    import Chat from "/src/lib/components/chat.svelte";

    let privateKey = forge.pki.privateKeyFromPem(variables.PRIVATE_KEY);
    let streamId = Math.round(Math.random() * 10000);
    let connectedStreamId = "";
    let chatChild;
    let frameCounter = 0;
    let clientCount = 0;
    let socket;
    let video;
    let pageActive = false;
    let fps = 0;
    let lastFpsTime = new Date().getTime();

    $: {
        if (isSocketConnected() && connectedStreamId !== streamId) {
            socket.send(
                JSON.stringify({
                    type: "OPEN_CONNECTION",
                    streamId: streamId,
                    isStreamer: true,
                    isChatter: true,
                })
            );
        }
    }

    const connectToSocket = () => {
        if (!pageActive) {
            return;
        }
        socket = new WebSocket(`${variables.CHATSERVER_URL}`);

        socket.onclose = function (event) {
            connectedStreamId = "";
            if (event.wasClean) {
                console.log(
                    `[websocket_close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
                );
            } else {
                console.log("[websocket_close] Connection died");
            }
            // Always reconnect to webserver
            setTimeout(connectToSocket, 100);
        };

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "OPEN_CONNECTION",
                    streamId: streamId,
                    isStreamer: true,
                    isChatter: true,
                })
            );
            sendFrame();
        };

        socket.onmessage = function (event) {
            //console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "CHAT_MESSAGE":
                    chatChild.addChat(data);
                    break;
                case "SEND_NEXT_FRAME":
                    // console.log("received request for next frame")
                    clientCount = data.clientCount;
                    sendFrame();
                    // setTimeout(sendFrame, 1000);
                    break;
                case "CONFIRM_CONNECTION":
                    connectedStreamId = data.streamId;
                    console.log("Connected streamid", connectedStreamId);
                    break;
            }
        };
    };

    // returns a frame encoded in base64
    const getFrame = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        return canvas.toDataURL("image/jpeg");
    };

    function sendFrame() {
        const frameData = getFrame();
        // Frame is probably not ready jet
        if (frameData.length <= 10) {
            setTimeout(sendFrame, 100);
            return;
        }
        frameCounter++;
        const currentFpsTime = new Date().getTime();
        fps = Math.floor((1000 / (currentFpsTime - lastFpsTime)) * 100) / 100;
        lastFpsTime = currentFpsTime;
        const compFrameData = compress(frameData);
        let md = forge.md.sha256.create();
        md.update(compFrameData);

        // @ts-ignore
        console.log(frameData);
        let signature = privateKey.sign(md);
        const data = {
            type: "STREAM_FRAME",
            frame: compFrameData,
            frame_timing: new Date().getTime(),
            frameCounter: frameCounter,
            signature: signature,
        };
        send(data, socket);
        console.log(
            `[${data.frameCounter}]Sending frame: ${data.frame_timing}`
        );
    }

    onDestroy(() => {
        pageActive = false;
        if (isSocketConnected()) {
            socket.close();
        }
    });
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
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN);
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
  <input id="streamId" type="text" bind:value={streamId} />
</div>

<label for="videoStream">View count: {clientCount}</label><br />
<label>Amount of frames send: {frameCounter}</label><br />
<label>Streaming with {fps} FPS</label><br />
<label>Confirmed streamer name {connectedStreamId}</label><br />
<br />
<br />
<div class="row">
  <div class="col-8">
    <video id="videoStream" autoplay />
  </div>

  <div class="col-4" style="padding-left: 0;">
    <Chat bind:this={chatChild} canSendMessage={false} />
  </div>
</div>
