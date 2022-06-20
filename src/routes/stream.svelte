<script>
    import { variables } from "$lib/variables";
    import { onMount } from "svelte";


    onMount(async () => {
        const video = document.querySelector("video");
        const Peer = await import('peerjs');

        const peer = new Peer.Peer('sender', {host: 'localhost', port: 9000, path: '/'});
        // const conn = peer.connect('receiver')
        // conn.on("open", () => {
        //     console.log("connected")
        //     conn.send("hi!");
        //
        //     navigator.mediaDevices
        //         .getUserMedia({video: {width: 426, height: 240}, audio: false})
        //         .then((stream) => {
        //             video.srcObject = stream;
        //             const call = peer.call("receiver", stream);
        //             call.on("stream", (remoteStream) => {
        //                 // Show stream in some <video> element.
        //             });
        //         }).catch((err) => {
        //         console.error("Error while getting stream:", err)
        //     });
        // });

        const localStream = await navigator.mediaDevices.getUserMedia({video: true})
        video.srcObject = localStream;
        peer.on('open', function (id) {
            console.log('My peer ID is: ' + id);
        });
        peer.on('call', call => {
            console.log("incomming call")
            call.answer(localStream)
        })
        peer.on('close', (e) => {
            console.log("connection closed", e)
        })
        peer.on('connection', (e) => {
            console.log("connection started", e);
        })
        peer.on('disconnected', (e) => {
            console.log("disconnected", e)
        })
        peer.on('error', (err) => {
            console.error("Peer stream error:", err)
        })
        // peer.on('call', call => {
        //     console.log("incomming ")
        //     const startChat = async () => {
        //         call.answer(localStream)
        //         // call.on('stream', remoteStream => {
        //         //     video.srcObject = remoteStream
        //         // })    })
        //     }
        //     startChat()
        // })
        peer.on('close', (e) => {
            console.log("connection closed", e)
        })
        peer.on('connection', (e) => {
            console.log("connection started", e);
        })
        peer.on('disconnected', (e) => {
            console.log("disconnected", e)
        })
        peer.on('error', (err) => {
            console.error("Peer stream error:", err)
        })
    });
</script>

<video autoplay></video>
