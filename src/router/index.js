import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DocumentView from "@/views/DocumentView.vue";
import PreferencesView from "@/views/PreferencesView.vue";
import TemplatesView from "@/views/TemplatesView.vue";
import TemplateView from "@/views/TemplateView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/doc/:id',
      name: 'document',
      component: DocumentView
    },
    {
      path: '/preferences',
      name: 'preferences',
      component: PreferencesView
    },
    {
      path: '/templates',
      name: 'templates',
      component: TemplatesView,
    },
    {
      path: '/templates/:id',
      name: 'template',
      component: TemplateView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

export default router
