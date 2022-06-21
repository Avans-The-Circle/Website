<script>
    import { onMount } from "svelte";
    import { variables } from '$lib/variables';
    import { decompress } from 'lz-string';
    import forge from "node-forge";

    const randomId = Math.round(Math.random() * 10000000000);
    export let clientCount = 0;
    let ctx;
    let canvas;
    onMount(() => {
        canvas = document.getElementById(`canvas-${randomId}`);
        ctx = canvas.getContext("2d");
    })

    export function processStream(frame) {
        const image = new Image();
        image.onload = function () {
            canvas.width = image.naturalWidth
            canvas.height = image.naturalHeight
            ctx.drawImage(image, 0, 0);
        };
        image.src = decompress(frame);
    }

    export function clearStream() {
        ctx.fillStyle = "rgb(255, 255, 255)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

</script>

<div class="bg-warning position-relative" style="height: 100%; width: 100%">
  <label for="canvas-{randomId}">View count: {clientCount}</label>
  <br />
  <canvas id="canvas-{randomId}" style="max-width: 100%; max-height: 100%; width: 100%;"></canvas>
</div>
