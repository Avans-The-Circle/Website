<script>
    import { onDestroy, onMount } from "svelte";
    import { decompress } from "lz-string";
    import { variables } from '$lib/variables';
    import forge from "node-forge";
    

    import Chat from "/src/lib/components/chat.svelte"
    import Stream from "/src/lib/components/stream.svelte"


    let privateKey = forge.pki.privateKeyFromPem(variables.PRIVATE_KEY);
    let publicKey = forge.pki.publicKeyFromPem(variables.PUBLIC_KEY);
    let clientCount = 0;
    let streamId = "-1";
    let connectedStreamId = "";
    let socket;
    let streamChild;
    let chatChild;
    let pageActive = false;
    let streamerList = [];

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


    function setCookie(cname,cvalue,exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
  let user = getCookie("username");
  if (user != "") {
    //alert("Welcome again " + user);
  } else {
     user = prompt("Please enter your name:","");
     if (user != "" && user != null) {
       setCookie("username", user, 30);
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
        let md;
        let signature;
        let verified;
        socket.onmessage = function (event) {
            //console.log(`[websocket_message] Data received from server: ${event.data}`);
            const data = JSON.parse(event.data);
            console.log("[Socket]Incomming:", data.type)
            switch (data.type) {
                case "CHAT_MESSAGE":
                    md = forge.md.sha256.create();
                    md.update(data.message, "utf8");
                    signature = data.signature;
                    verified = publicKey.verify(md.digest().bytes(), signature);
                    if (verified) {
                        chatChild.addChat(data);
                    }
                    break;
                case "AVAILABLE_CLIENTS":
                    streamerList = data.streamerList
                    console.log("streamerList:", streamerList)
                    break;
                case "INCOMMING_STREAM":
                    clientCount = data.clientCount
                    md = forge.md.sha256.create();
                    md.update(data.frame);
                    signature = data.signature;
                    verified = publicKey.verify(md.digest().bytes(), signature);
                    if (verified) {
                        streamChild.processStream(data.frame)
                    }
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
        let user = getCookie("username")
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
        let md = forge.md.sha256.create();
        md.update(message, "utf8")
        let signature = privateKey.sign(md);
        socket.send(JSON.stringify({
            type: "SEND_MESSAGE",
            sender: user,
            message: message,
            signature: signature
        }));
    }

    //checkCookie();
</script>

<div class="col" style="height: calc(49vh - 1.5rem); padding: 0;" >
    

  <select class="form-select" aria-label="Please select a stream..." bind:value={streamId}>
    
    {#if (true)}
        {onMount(() => {
            checkCookie()
        })}
    {/if}
    <option value="-1">Disconnected</option>
    {#each streamerList as streamerId}
      <option value="{streamerId}">Streamer {streamerId}</option>
    {/each}
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
