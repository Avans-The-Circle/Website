<script>
    let streamId = "-1";
    import Chat from "/src/lib/components/chat.svelte"
    import Stream from "/src/lib/components/stream.svelte"
</script>

<div class="col-6" style="height: 49vh; padding: 0;">
  <select class="form-select" aria-label="Please select a stream..." bind:value={streamId}>
    <option value="-1">Disconnected</option>
    <option value="1">Stream 1</option>
    <option value="2">Stream 2</option>
    <option value="3">Stream 3</option>
    <option value="4">Stream 4</option>
  </select>
  <div class="row" style="height: 100%">
    <div class="col-8">
      {#if streamId === "-1"}
        <h1>Disconnected...</h1>
      {:else }
        123
      {/if}
    </div>
    <div class="col-4">
      <Chat bind:streamId={streamId} />
    </div>
  </div>
</div>
