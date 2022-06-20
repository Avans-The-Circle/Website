<script>
    import { variables } from "$lib/variables";
    import { onMount } from "svelte";
    import { compress } from "lz-string";

    onMount(() => {
        const video = document.querySelector("video");

        // request access to webcam
        navigator.mediaDevices
            .getUserMedia({ video: { width: 426, height: 240 } })
            .then((stream) => (video.srcObject = stream));

        // returns a frame encoded in base64
        const getFrame = () => {
            console.log("Beginning getframe");
            const canvas = document.createElement("canvas");
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d").drawImage(video, 0, 0);
            const data = canvas.toDataURL("image/png");
            console.log("ending getframe");
            return data;
        };

        const FPS = 20;
        const socket = new WebSocket(`${variables.CHATSERVER_URL}`);
        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "OPEN_CONNECTION",
                    streamId: "1",
                })
            );
            //console.log(`Connected to ${variables.CHATSERVER_URL}`);
            setInterval(() => {
                const frameData = getFrame();
                console.log("Beginning compression");
                const compFrameData = compress(frameData);
                console.log("ending compression");
                console.log(
                    "Frame data ",
                    frameData.length,
                    compFrameData.length
                );
                send(compFrameData,socket);
                console.log("Buffered amount of data ", socket.bufferedAmount);
                console.log("__________________________________________");
            }, 1000 / FPS);
        };
    });

    async function send(compFrameData, socket) {
        socket.send(
            JSON.stringify({
                type: "STREAM_FRAME",
                frame: compFrameData,
            })
        );
    }
</script>

<video autoplay />
