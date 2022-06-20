<script>
    import { variables } from "$lib/variables";
    import { onMount } from "svelte";
    import { compress, decompress } from "lz-string";

    onMount(async () => {
        const video = document.querySelector("video");
        // request access to webcam
        navigator.mediaDevices
            .getUserMedia({video: {width: 426, height: 240}})
            .then((stream) => (video.srcObject = stream));

        let frameCounter = 0;
        const socket = new WebSocket(`${variables.CHATSERVER_URL}/binary/1`);
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
                        // createAndSendVideo();
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

            // sendFrame();
        };

        let media = [];
        let mediaRecorder = null;

        const video_target = document.getElementById('video');
        const stream = await navigator.mediaDevices.getUserMedia({audio: true, video: true});
        mediaRecorder = new MediaRecorder(stream, {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 2500000,
            mimeType: "video/webm;codecs=VP9"
        });

        mediaRecorder.ondataavailable = (e) => {
            console.log('mimetype:', mediaRecorder.mimeType)
            // let blob = e.data
            // blob = new Blob([e.data], {'type': 'video/webm; codecs="vp9,opus"'});
            // socket.send(blob)
            // console.log("frame", blob)
            // media.push(e.data)

            const blob = e.data;
            blobToBase64(blob).then((media_blob) => {
                const data = {
                    type: "STREAM_FRAME",
                    frame: compress(media_blob),
                    frame_timing: (new Date()).getTime(),
                    frameCounter: frameCounter
                }
                send(data, socket);
                console.log(`[${data.frameCounter}]Sending frame: ${data.frame_timing}`);
            })

        }
        mediaRecorder.onstop = function (e) {
            console.log(e);
        }
        // mediaRecorder.onstop = function () {
        //     // const blob = new Blob(media, {'type': 'audio/ogg; codecs=opus'});
        //     const blob = new Blob(media, {'type': 'video/webm; codecs=vp9'});
        //     video_target.src = window.URL.createObjectURL(blob);
        //     frameCounter++;
        //     blobToBase64(blob).then((media_blob) => {
        //         console.log("media: ", media, media_blob)
        //         const data = {
        //             type: "STREAM_FRAME",
        //             frame: compress(media_blob),
        //             frame_timing: (new Date()).getTime(),
        //             frameCounter: frameCounter
        //         }
        //         send(data, socket);
        //         console.log(`[${data.frameCounter}]Sending frame: ${data.frame_timing}`);
        //     })
        //     media = [];
        // }

        function blobToBase64(blob) {
            return new Promise((resolve, _) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }


        function startRecording() {
            console.log("started record")
            mediaRecorder.start()
        }

        function stopRecording() {
            console.log("stopped recording")
            mediaRecorder.stop();
        }

        function createAndSendVideo() {
            startRecording();
            setInterval(() => mediaRecorder.requestData(), 1000)
            // setTimeout(stopRecording, 2000)
        }

        createAndSendVideo();

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
<video id="video" autoplay controls />
<audio autoplay />
<audio id="audio" autoplay />
