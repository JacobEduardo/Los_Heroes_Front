<template>
 <RouterView></RouterView>
</template>

<script>
import { RouterView, useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

 
  }
}
</script>



<!--<template>
  <div>
    <Step_one v-if="mostrarStep_one" @cambiarComponente="cambiarComponente" />
    <Step_two v-else :datos="datosRecibidos" />
  </div>
</template>

<script>
import Step_one from './components/Step_one.vue';
import Step_two from './components/Step_two.vue';



export default {
  data() {
    return {
      mostrarStep_one: true,
      datosRecibidos: null
    };
  },
  components: {
    Step_one,
    Step_two
  },
  methods: {
    cambiarComponente(datos) {
      // Guardar los datos recibidos y cambiar de componente
      this.datosRecibidos = datos.result;  // Asegúrate de pasar solo los datos necesarios
      this.mostrarStep_one = false;
    }
  }
};
</script>-->

