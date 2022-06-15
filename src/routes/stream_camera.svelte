<script>
    import { onMount } from "svelte";
    import { browser } from '$app/env';

    onMount(async () => {
        if (browser) {
            // this works
            const AgoraRTC = await import('agora-rtc-sdk');
            let client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
            client.init(import.meta.env.VITE_STREAM_APP_ID);
            const localStream = AgoraRTC.createStream({audio: true, video: true})
            localStream.init();
            localStream.play("incomming_stream");
            client.join(import.meta.env.VITE_STREAM_APP_TOKEN, import.meta.env.VITE_STREAM_APP_CHANNEL, null);
            client.publish(localStream);
            // remoteStream.play("elementID");
            client.leave();
        }
    })
</script>

<div id="incomming_stream">
  testt123
</div>
