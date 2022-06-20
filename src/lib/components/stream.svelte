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

    const addSourceBufferWhenOpen = (mediaSource, mimeStr, mode = 'segments') => {
        return new Promise((res, rej) => {
            console.log("mediaSource: ", mediaSource)
            const getSourceBuffer = () => {
                try {
                    const sourceBuffer = mediaSource.addSourceBuffer(mimeStr);
                    sourceBuffer.mode = mode;
                    res(sourceBuffer);
                } catch (e) {
                    rej(e);
                }
            };
            if (mediaSource.readyState === 'open') {
                getSourceBuffer();
            } else {
                console.log("Mediasource state:", mediaSource.readyState)
                mediaSource.addEventListener('sourceopen', getSourceBuffer);
            }
        });
    };
    const b64toBlob = (base64Str, mimeTypeStr) => fetch(base64Str).then((res) => res.blob());


    onMount(async () => {
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

        // const canvas = document.getElementById(`canvas-${randomId}`);
        // const ctx = canvas.getContext("2d");

        const video_output = document.getElementById(`video-${randomId}`);

        const mediaSource = new MediaSource();
        let sourceBuffer = undefined;
        video_output.src = URL.createObjectURL(mediaSource);
        mediaSource.addEventListener('sourceopen', () => {
            sourceBuffer = mediaSource.addSourceBuffer(`video/webm; codecs="vp9,opus"`);
        });

        // video_output.src = window.URL.createObjectURL(blob);

        socket.onmessage = async function (event) {
            if (event.data instanceof Blob) {
                console.log("received blob")
                let blob = event.data;
                // blob = blob.slice(0, blob.size, "video/x-matroska;codecs=avc1,opus")
                blob = new Blob([blob], {'type': 'video/webm;codecs=VP9'});
                const videoBuff = await blob.arrayBuffer();
                console.log("2")
                if (sourceBuffer) {
                    console.log("sourceBuffer check")
                    sourceBuffer.appendBuffer(videoBuff);
                    console.log("3")
                    sourceBuffer.onupdateend = (e) => {
                        // console.log("e?", e)
                        mediaSource.endOfStream();
                        video_output.play();
                    };
                }
            } else {
                console.log("received string")
                //console.log(`[websocket_message] Data received from server: ${event.data}`);
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case "INCOMMING_STREAM":
                        // const img = document.querySelector('img');
                        // const blob = new Blob(data.frame, {'type': 'video/webm; codecs=vp9'});
                        // console.log("incomming stream")
                        // video_output.src = decompress(data.frame);
                        // video_output.play();
                        // const image = new Image();
                        // image.onload = function () {
                        //     ctx.drawImage(image, 0, 0);
                        // };
                        // image.src = decompress(data.frame);
                        //
                        // console.log("1", decompress(data.frame))
                        const blob = await b64toBlob(decompress(data.frame), 'video/webm;codecs=VP9')
                        console.log("1", blob)
                        const videoBuff = await blob.arrayBuffer();
                        console.log("1", videoBuff)
                        console.log("2")
                        if (sourceBuffer) {
                            console.log("sourceBuffer check")
                            sourceBuffer.appendBuffer(videoBuff);
                            setTimeout(() => {
                                sourceBuffer.remove(0, 2)
                            }, 2000)
                            console.log("3")
                            sourceBuffer.onupdateend = (e) => {
                                // console.log("e?", e)
                                // mediaSource.endOfStream();
                                // video_output.play();
                            };
                        }


                        break;
                    case "CONFIRM_CONNECTION":
                        connectedStreamId = data.streamId;
                        break;
                }
            }
        };

    })

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }
</script>

<div class="bg-warning position-relative" style="height: 100%; width: 100%">
  123
  <!--<canvas id="canvas-{randomId}" style="width: 100%"></canvas>-->
  <video id="video-{randomId}" style="max-width: 100%; max-height: 100%" controls autoplay muted></video>
</div>
