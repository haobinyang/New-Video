<template>
  <div id="app">
    <Editor />
  </div>
</template>

<script>
import Editor from './components/editor/Index'

export default {
  name: 'App',
  components: {
    Editor
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  background-color: #1c1c26;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
