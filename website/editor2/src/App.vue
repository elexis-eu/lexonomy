<template>
    <div id="app">
        <div class="nav">
            <router-link to="/">Home</router-link>|<router-link to="/about"
        >About</router-link
        >
        </div>
        <router-view />
    </div>
</template>

<style lang="scss">
// @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500&display=swap");

// :root {
//   --font: Roboto, sans-serif;
//   --textColor: #374961;
//   --linkActiveColor: #41b783;
// }

// #app {
//   font-family: var(--font);
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: var(--textColor);

//   .logo {
//     width: 20%;
//   }
// }

// .nav {
//   padding: 30px 0 100px 0;

//   a {
//     font-weight: 500;
//     color: var(--textColor);
//     margin: 0 5px;
//   }

//   a.router-link-exact-active {
//     color: var(--linkActiveColor);
//   }
// }
</style>
