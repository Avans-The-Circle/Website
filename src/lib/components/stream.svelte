<script>
    import { onMount } from "svelte";

    let socket;
    const randomId = Math.round(Math.random() * 10000000000);
    export let streamId = ""
    onMount(async () => {
        const Peer = await import('peerjs');
        const video = document.getElementById(`randomId-${randomId}`);

        const peer = new Peer.Peer(`receiver-${randomId}`, {host: 'localhost', port: 9000, path: '/'});
        // peer.on("connection", (conn) => {
        //     conn.on("data", (data) => {
        //         // Will print 'hi!'
        //         console.log(data);
        //     });
        //     conn.on("open", () => {
        //         conn.send("hello!");
        //     });
        //
        //     peer.on("call", (call) => {
        //         navigator.mediaDevices.getUserMedia(
        //             {video: true, audio: false},
        //             (stream) => {
        //                 call.answer(stream); // Answer the call with an A/V stream.
        //                 call.on("stream", (remoteStream) => {
        //                     video.srcObject = remoteStream
        //                 });
        //             },
        //             (err) => {
        //                 console.error("Failed to get local stream", err);
        //             },
        //         );
        //     });
        // });

        function connectToSender() {
            let conn = peer.connect('sender')
            let call = peer.call('sender', createMediaStreamFake());
            call.on("stream", (remoteStream) => {
                console.log("Incomming stream");
                video.srcObject = remoteStream;
            });

            // Conn.* is overrated, eigenlijk is dit alleen nuttig voor reconnecting
            // Maar reconnecten werkt ook niet, dus eigenlijk is het kansloos
            conn.on('error', (err) => {
                console.error("[WebTRC]error on peer connection:", err)
            })
            conn.on('close', (e) => {
                console.log("[WebTRC]Connection closed", e)
                setTimeout(connectToSender, 500);
            })
            conn.on('disconnected', (e) => {
                console.log("[WebTRC]disconnected", e)
            })
            conn.on('open', () => {
                console.log('[WebTRC]Connection opened');
            });
        }

        connectToSender();
    })

    // Create a fake media stream to start call.
    // Source: https://github.com/peers/peerjs/issues/158
    const createMediaStreamFake = () => {
        return new MediaStream([createEmptyAudioTrack(), createEmptyVideoTrack({width: 640, height: 480})]);
    }

    const createEmptyAudioTrack = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        const track = dst.stream.getAudioTracks()[0];
        return Object.assign(track, {enabled: false});
    }

    const createEmptyVideoTrack = ({width, height}) => {
        const canvas = Object.assign(document.createElement('canvas'), {width, height});
        canvas.getContext('2d').fillRect(0, 0, width, height);

        const stream = canvas.captureStream();
        const track = stream.getVideoTracks()[0];

        return Object.assign(track, {enabled: false});
    };

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }
</script>

<div class="bg-warning position-relative" style="height: 100%; width: 100%">
  123
  <video id="randomId-{randomId}" autoplay></video>
</div>
