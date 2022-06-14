<script>
    import { onMount } from "svelte";
    import { variables } from '$lib/variables';

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
    onMount(() => {
        const connectToSocket = () => {
            socket = new WebSocket(`ws://${variables.CHATSERVER_URL}`)
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
        socket.onmessage = function (event) {
            console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "CHAT_MESSAGE":
                    messages.push(data);
                    // For reactivity:
                    messages = messages;
                    setTimeout(() => {
                        scrollSmoothlyToBottom();
                    }, 250)
                    console.log("messages: ", messages)
                    break;
                case "CONFIRM_CONNECTION":
                    connectedStreamId = data.streamId;
                    break;
            }
        };
    })

    function isSocketConnected() {
        return !(socket === undefined || socket.readyState !== WebSocket.OPEN)
    }

    async function sendMessage() {
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
        message = "";
    }

    const scrollSmoothlyToBottom = () => {
        const elmt = document.getElementById(`chatContainer-${randomId}`);
        elmt.scroll({top: elmt.scrollHeight, behavior: 'smooth'});
    }
</script>

<div class="bg-info position-relative" style="height: 100%">
  {#if (socket === undefined || socket.readyState !== WebSocket.OPEN)}
    <h1>Disconnected</h1>
  {/if}
  {#if streamId !== "-1"}
    <div class="overflow-auto" id="chatContainer-{randomId}" style="max-height: 40vh;">
      {#each messages as message}
        <div>
          <label class="fw-bold">{message.sender}></label>
          <label>{message.message}</label>
        </div>
      {/each}
    </div>
    <div class="position-absolute bottom-0" style="bottom: 0;">
      <input class="d-inline-block" type="text" bind:value={message}>
      <input class="d-inline-block" type="submit" on:click={sendMessage}>
    </div>
  {/if}
</div>
