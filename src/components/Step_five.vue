<template>
  <div v-if="mensaje == 'ok'">
    <div style="background-color:#14bd00;align-items:center;width:100%;position: fixed;top: 60px;">
      <div class="row" style="max-width: 900px; margin: 0 auto;">
        <div class="container">
          <div class="col-md-12" id="barra_pasos">
            <div class="px-3 pt-2 pb-0">
              <h5>Transaccion Exitosa</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pb-md-5" style="align-items:center;width:100%;">
      <div class="row" style="max-width: 900px; margin: 0 auto;">
        <div class="container d-flex justify-content-center mt-4 px-4 mb-4">
          <div class="rounded p-4 bg-white px-4" style="width: 100%;">
            <h6 class="mb-3">La transacción fue exitosa.</h6>
            <h6 class="mb-2 text-success">Se ha enviado un comprobante por correo. <a href="#" @click="enviarCorreo">Volver a enviar correo</a></h6>
            <p class="">Recuerda llevar tu carnet de identidad para poder entrar al parque.</p>
            <div>
              <button class="btn btn-primary me-3" @click="descargarBoleta">Descargar Boleta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="container">
        <div class="text-center mt-4">
          Otro tipo de texto como instrucciones o algo así.
        </div>
      </div>
    </div>
    <div class="row">
      <div class="container">
        <div class="text-center mt-4">
          <a href="https://www.recreactiva.cl/" class="btn btn-link">Ir a la pagina de Recreactiva</a>
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="mensaje === 'rechazada' || mensaje === 'tiempo excedido' || mensaje === 'anulacion usuario' || mensaje === 'pago inválido'">
    <div style="background-color: #ff4523;align-items:center;width:100%;position:fixed;top:60px;">
      <div class="row" style="max-width: 900px; margin: 0 auto;">
        <div class="container">
          <div class="col-md-12" id="barra_pasos">
            <div class="px-3 pt-2 pb-0">
              <h5>Transaccion Fallida</h5>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pb-md-5" style="align-items:center;width:100%;">
      <div class="row" style="max-width: 900px; margin: 0 auto;">
        <div class="container d-flex justify-content-center mt-4 px-4 mb-4">
          <div class="border rounded p-4 bg-white px-4" style="width: 100%;">
            <h6 class="mb-3">La transacción no fue exitosa.</h6>
            <h6 class="mb-2 text-success">No se ha realizado ningun cobro a tu targeta.</h6>
            <p class="">Vuelve a intentarlo.</p>
            <div>
              <button class="btn btn-primary me-3" onclick="window.location.href='/'">Volver al Inicio</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="container">
        <div class="text-center mt-4">
          Otro tipo de texto como instrucciones o algo así.
        </div>
      </div>
    </div>
    <div class="row">
      <div class="container">
        <div class="text-center mt-4">
          <a href="https://www.recreactiva.cl/" class="btn btn-link">Ir a la pagina de Recreactiva</a>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>

import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const mensaje = ref('');
const uuid = ref('');
const route = useRoute();

onMounted(() => {
  mensaje.value = route.query.mensajeR || '';
  uuid.value = route.query.uuid || '';
});

const enviarCorreo = async () => {
  console.log(uuid.value);

  try {
    const response = await fetch('http://localhost:3000/caja/enviarCorreo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uuid: uuid.value })
    });

    const data = await response.json();
    console.log(data.mensaje);

  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
}




const descargarBoleta = async () => {
  try {
    const response = await fetch('http://localhost:3000/caja/descargarBoleta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uuid: uuid.value })
    });
    console.log(response)
    const data = await response.json();
    if (data.success) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${data.pdfBase64}`;
      link.download = `boleta_${uuid.value}.pdf`;
      link.click();
    } else {
      console.error('Error al descargar el PDF:', data.message);
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
  }
}
</script>
