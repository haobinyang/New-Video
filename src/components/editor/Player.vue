<template>
  <div class="container">
    <div class="player">
      <img class="cover" src="../../assets/cover.png" />
      <div class="controls">
        <div class="play-button">
          <svg width="24" height="24" viewBox="0 0 24 24"><path d="M20.6074 11.3193L7.37206 3.13743C7.10118 2.97052 6.75265 2.95415 6.46676 3.09652C6.17912 3.23888 6 3.51624 6 3.81815V20.1818C6 20.4837 6.17912 20.7611 6.46588 20.9035C6.59647 20.9681 6.73941 21 6.88235 21C7.05353 21 7.22471 20.9534 7.37206 20.8625L20.6074 12.6807C20.8526 12.5285 21 12.2733 21 12C21 11.7267 20.8526 11.4714 20.6074 11.3193Z" fill="currentColor"></path></svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  
}
</script>

<style scoped>
.container {
  height: calc(100vh - 450px);
  display: flex;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
}
.player {
  width: 614px;
  height: 345px;
  position: relative;
  top: -20px;
}
.controls {
  position: absolute;
  bottom: -50px;
  width: 100%;
  display: flex;
  justify-content: center;
}
.play-button {
  cursor: pointer;
  color: rgb(244, 244, 244);
}
.play-button:hover {
  color: white;
}
.cover {
  width: 100%;
  height: 100%;
}
</style>