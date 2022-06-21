<script>
    import { onDestroy, onMount } from "svelte";
    import { decompress } from "lz-string";
    import { variables } from '$lib/variables';

    import Chat from "/src/lib/components/chat.svelte"
    import Stream from "/src/lib/components/stream.svelte"


    let clientCount = 0;
    let streamId = "-1";
    let connectedStreamId = "";
    let socket;
    let streamChild;
    let chatChild;
    let pageActive = false;

    $: {
        if (isSocketConnected() && connectedStreamId !== streamId) {
            socket.send(JSON.stringify({
                type: "OPEN_CONNECTION",
                streamId: streamId,
                isWatcher: true,
                isChatter: true
            }));

            if (chatChild && chatChild.clearChatMessages !== undefined) {
                chatChild.clearChatMessages();
            }
            if (streamChild && streamChild.clearStream !== undefined) {
                streamChild.clearStream()
            }
        }
    }

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }

    const connectToSocket = () => {
        if (!pageActive) {
            return;
        }
        socket = new WebSocket(`${variables.CHATSERVER_URL}`)
        socket.onopen = () => {
            console.log("[websocket_opened]")
            socket.send(JSON.stringify({
                type: "OPEN_CONNECTION",
                streamId: streamId,
                isWatcher: true,
                isChatter: true
            }))
        };
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

        socket.onerror = function (error) {
            console.error(`[websocket_error] ${error.message}`);
        };
        socket.onmessage = function (event) {
            //console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            console.log("[Socket]Incomming:", data.type)
            switch (data.type) {
                case "CHAT_MESSAGE":
                    chatChild.addChat(data);
                    break;
                case "INCOMMING_STREAM":
                    clientCount = data.clientCount
                    streamChild.processStream(data.frame)
                    break;
                case "CONFIRM_CONNECTION":
                    connectedStreamId = data.streamId;
                    break;
            }
        };
    }

    onDestroy(() => {
        pageActive = false;
        if (isSocketConnected()) {
            socket.close();
        }
    })

    onMount(() => {
        pageActive = true;
        connectToSocket();
    })


    async function sendMessage(e) {
        const message = e.detail;
        console.log("Sending message: ", message)
        if (message === "") {
            return;
        }
        if (!isSocketConnected()) {
            console.error("Websocket not connected.", socket)
            alert("Chat server connection issue. Check console for more info.")
            return;
        }
        socket.send(JSON.stringify({
            type: "SEND_MESSAGE",
            sender: "Je moeder",
            message: message
        }));
    }
</script>

<div class="col" style="height: calc(49vh - 1.5rem); padding: 0;">
  <select class="form-select" aria-label="Please select a stream..." bind:value={streamId}>
    <option value="-1">Disconnected</option>
    <option value="1">Stream 1</option>
    <option value="2">Stream 2</option>
    <option value="3">Stream 3</option>
    <option value="4">Stream 4</option>
  </select>
  <div class="row" style="height: calc(100% - 2.4rem)">
    {#if (socket === undefined || socket.readyState !== WebSocket.OPEN)}
      <h1>Socket disconnected</h1>
    {:else}
      {#if streamId === "-1"}
        <h1>Disconnected...</h1>
      {:else}
        <div class="col-8" style="padding-right: 0;">
          {#if streamId === "-1"}
          {:else }
            <Stream bind:clientCount={clientCount} bind:this={streamChild} />
          {/if}
        </div>
        <div class="col-4" style="padding-left: 0;">
          <Chat bind:this={chatChild} on:sendChatMessage={sendMessage} />
        </div>
      {/if}
    {/if}
  </div>
</div>
