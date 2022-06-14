<div style="position: fixed; width: 100vw; height: 3.3rem; left: 0; top: 0; background-color: red">
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <a class="navbar-brand" href="/">The Circle</a>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <a class="nav-link" aria-current="page" href="/">Watch streams</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/stream">Start streaming</a>
          </li>
        </ul>
        <form class="d-flex">
          <a class="nav-link" href="/">Login</a>
        </form>
      </div>
    </div>
  </nav>
</div>
<div style="position: fixed; width: 100vw; height: calc(100vh - 3.3rem); left: 0; top: 3.3rem;">
  <slot />
</div>
<style>
    html {
        overflow: hidden;
    }
</style>

<!--<script src="https://download.agora.io/sdk/release/AgoraRTC_N.js"></script>-->

