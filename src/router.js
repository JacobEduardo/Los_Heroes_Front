import { createRouter, createWebHistory } from 'vue-router'
import Step_one from './components/Step_one.vue'
import Step_two from './components/Step_two.vue'
import Step_three from './components/Step_three.vue' // Importa el componente Step_three
import Step_four from './components/Step_four.vue'
import Step_five from './components/Step_five.vue'

const routes = [
  { path: '/', 
    name: 'home', 
    component: Step_one },
  { path: '/step-two', 
    name: 'step-two',
    component: Step_two },
  { path: '/step-three',  // Agrega la ruta para step-three
    name: 'step-three',
    component: Step_three },
  { path: '/step-four', 
    name: 'step-four',
    component: Step_four },
    {
      path: '/confirmacion',
      name: 'Confirmacion',
      component: Step_five,
      // Puedes añadir un meta campo si es necesario
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router