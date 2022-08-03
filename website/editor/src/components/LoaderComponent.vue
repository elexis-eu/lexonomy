<template>
  <div class="loader">.</div>
</template>

<script>
export default {
  name: "LoaderComponent",
  props: {
    color: {
      type: String,
      default: "black"
    }
  }
}
</script>

<style scoped lang="scss">
@keyframes loading-dots-blink {
  0% {
    color: rgba(0, 0, 0, 0.1);
  }
  20% {
    color: rgba(0, 0, 0, 0.4);
  }
  100% {
    color: rgba(0, 0, 0, 0.1);
  }
}

.loader {
  height: 26px;
  line-height: 0;
  font-size: 70px;
  letter-spacing: -2px;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 50%;
  vertical-align: top;
  display: inline-block;
  margin-top: -20px;
  font-family: "Poppins", sans-serif;
  color: rgb(0, 0, 0);
  animation: loading-dots-blink 1.4s infinite 0.2s both;

  &:before,
  &:after {
    content: ".";
    animation: loading-dots-blink 1.4s infinite 0s both;
  }

  &:after {
    animation-delay: 0.4s;
  }

}
</style>
