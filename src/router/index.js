import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from "../views/Home/Home";
import Login from "../views/Login/Login";
Vue.use(VueRouter)

const routes = [
  {path: '/home', name: 'home', component: Home},
  {path: '/login', name: 'login', component: Login},
  {path: '/',redirect:"/home"},
]

const router = new VueRouter({
  routes
})

export default router
