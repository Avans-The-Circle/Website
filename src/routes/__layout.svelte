<script>
    import { UserManager } from "../lib/classes/userManager";

    function changeUsername() {
        UserManager.setUsername();
    }
</script>

<div style="position: fixed; width: 100vw; height: 3.3rem; left: 0; top: 0; background-color: red" class="navbar-header">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/" style="align-self: baseline;">The Circle</a>
      <div id="navbarTogglerDemo03">
        <ul class="navbar-nav  me-auto mb-2 mb-lg-0">
          <li class="nav-item ">
            <a class="nav-link" aria-current="page" href="/">Watch streams</a>
          </li>
          <li class="nav-item ">
            <a class="nav-link" href="/stream">Start streaming</a>
          </li>
          <li class="nav-item ">
            <a class="nav-link" style="color: blue" href="/" on:click={changeUsername}>Change username</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</div>

<div style="position: fixed; width: 100vw; height: calc(100vh - 3.3rem); left: 0; top: 3.3rem; overflow-y: auto;overflow-x: hidden; z-index: 1; background-color: white;">
  <slot />
</div>
<style>
    html {
        overflow: hidden;
    }

    .navbar-header:hover {
        z-index: 1000;
    }
</style>

<!--<script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script>-->
