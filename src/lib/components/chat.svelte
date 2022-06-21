<script>
    import { createEventDispatcher, onMount } from "svelte";
    import { variables } from '$lib/variables';

    const dispatch = createEventDispatcher();
    let message = "";
    let messages = [];
    const randomId = Math.round(Math.random() * 10000000000);

    const sendChatMessage = (message) => {
        dispatch('sendChatMessage', message);
    };

    export function addChat(chatMessage) {
        messages.push(chatMessage);
        // For reactivity:
        messages = messages;
        setTimeout(() => {
            scrollSmoothlyToBottom();
        }, 250)
        console.log("messages: ", messages)
    }

    async function sendMessage() {
        if (message === "") {
            return;
        }
        sendChatMessage(message)
        message = "";
    }

    export function clearChatMessages() {
        messages = [];
    }

    async function keyDownChat(event) {
        if (event.keyCode === 13) {
            await sendMessage()
        }
    }

    const scrollSmoothlyToBottom = () => {
        const elmt = document.getElementById(`chatContainer-${randomId}`);
        elmt.scroll({top: elmt.scrollHeight, behavior: 'smooth'});
    }

</script>

<div class="bg-info position-relative" style="height: 100%">
  <div class="overflow-auto" id="chatContainer-{randomId}" style="max-height: 40vh;">
    {#each messages as message}
      <div>
        <label class="fw-bold">{message.sender}></label>
        <label>{message.message}</label>
      </div>
    {/each}
  </div>
  <div class="position-absolute bottom-0" style="bottom: 0;">
    <input class="d-inline-block" on:keydown={keyDownChat} type="text" bind:value={message}>
    <input class="d-inline-block" type="submit" on:click={sendMessage}>
  </div>
</div>
