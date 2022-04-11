import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../components/Home.vue";
import About from "../components/About"

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About
    // component: () =>
    //   import(/* webpackChunkName: "about" */ "../components/About.vue"),
  },
];

const router = new VueRouter({
  mode: "history",
  routes,
});

export default router;
