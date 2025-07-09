import { createRouter, createWebHistory } from 'vue-router';
const Start = () => import('@components/Start/index.vue');
const Main = () => import('@components/Main/index.vue');
const Game = () => import('@components/Game/index.vue');
const Profile = () => import('@components/Profile/index.vue');

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Start
  },
  {
    path: '/main',
    name: 'Main',
    component: Main
  },
  {
    path: '/start',
    name: 'StartRedirect',
    redirect: '/'
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  }

];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
