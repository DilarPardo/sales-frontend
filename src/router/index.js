import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'
import ProyectosView from '../views/ProyectosView.vue'
import BloquesView from '../views/BloquesView.vue'
import PiezasView from '../views/PiezasView.vue'
import ReportesView from '../views/ReportesView.vue'

const routes = [
  {
    path: '/',
    name: 'login',
    component: LoginView,
    // Marcamos explícitamente que esta ruta NO requiere autenticación
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: MainLayout,
    // Aplicamos la protección a /admin y a todos sus hijos (dashboard, proyectos, etc.)
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: DashboardView
      },
      { 
        path: 'proyectos', 
        name: 'proyectos', 
        component: ProyectosView 
      },
      { 
        path: 'bloques', 
        name: 'bloques', 
        component: BloquesView 
      },
      { 
        path: 'piezas', 
        name: 'piezas', 
        component: PiezasView 
      },
      {
        path: 'registrar',
        name: 'registrar',
        component: () => import('../views/RegistrarFabricacionView.vue')
      },
      { 
        path: 'reportes', 
        name: 'reportes', 
        component: ReportesView
      },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * GUARDIA DE NAVEGACIÓN (Middleware)
 * Se ejecuta antes de cada cambio de ruta.
 */
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('AUTH_TOKEN');

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' });
  } 
  else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' });
  } 
  else {
    next();
  }
});

export default router