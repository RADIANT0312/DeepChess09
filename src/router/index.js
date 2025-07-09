import { createRouter, createWebHistory } from 'vue-router';
const Start = () => import('@components/Start/index.vue');
const Game = () => import('@components/Game/index.vue');

const routes = [
  {
    path: '/',
    name: 'Start',
    component: Start
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  },
  {
    path: '/start',
    name: 'StartRedirect',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
