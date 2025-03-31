import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import ProfileView from '@/views/ProfileView.vue';
import PokemonDetail from '../views/PokemonDetail.vue';
import DiffusionsView from '../views/DiffusionsView.vue';


const routes = [
  { path: '/', component: LoginView },
  { path: '/home', component: HomeView },
  { path: '/profile', component: ProfileView },
  {path: '/pokemon/:id', component: PokemonDetail, props: true},
  {path: '/diffusions',component: DiffusionsView}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
