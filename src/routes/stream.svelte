<script>
    import { variables } from "$lib/variables";
    import { onMount } from "svelte";
    import { compress, decompress } from "lz-string";

    onMount(() => {
        const video = document.querySelector("video");

        // request access to webcam
        navigator.mediaDevices
            .getUserMedia({video: {width: 426, height: 240}})
            .then((stream) => (video.srcObject = stream));

        // returns a frame encoded in base64
        const getFrame = () => {
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const data = canvas.toDataURL("image/png");
            return data;
        };

        const FPS = 12;
        let frameCounter = 0;
        const socket = new WebSocket(`${variables.CHATSERVER_URL}`);
        let bufferArray = [];
        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "OPEN_CONNECTION",
                    streamId: "1",
                })
            );

            socket.onmessage = function (event) {
                //console.log(`[websocket_message] Data received from server: ${event.data}`);
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case "SEND_NEXT_FRAME":
                        console.log("received request for next frame")
                        sendFrame();
                        break;
                }
            };

            async function sendFrame() {
                frameCounter++;
                const frameData = getFrame();
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

            sendFrame();
        };
    });

    async function send(compFrameData, socket) {
        const dataJson = JSON.stringify(compFrameData);
        let blob = new Blob([dataJson]);
        socket.send(blob);

        // const dataString = JSON.stringify({compressed: true, data: compress(dataJson)});
        // socket.send(dataString);
    }
</script>

<video autoplay />
