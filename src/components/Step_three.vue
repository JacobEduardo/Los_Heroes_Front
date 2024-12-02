<template>
    <!-- IF PRINCIPAL -->
    <div v-if="sin_respuesta_servidor">
        <div class="alert alert-warning mb-0" role="alert">
            Server Error: no se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
        </div>
    </div>
    <div v-if="user_transaccion && user_transaccion.id">
        <form>
            <div style="background-color:#f48832;align-items:center;width:100%;position: fixed;top: 60px;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div class="container">
                            <div class="col-md-12" id="barra_pasos">
                                <div class="px-3 pt-2 pb-0">
                                <h5>Paso 3 de 4</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="fondo_main pb-md-5" style="align-items:center;width:100%;">
                <div class="row" style="max-width: 900px; margin: 0 auto;">
                    <div class="pe-4 pt-5 col-md-6 ps-5 d-none d-md-block" style=" color: white; font-size: xxx-large;">
                        <strong>Compra tus Entradas</strong>
                        <h5>
                            Compra entradas por que este es un texto que lo dice.
                        </h5>
                    </div>
                    <div class="col-md-6 p-0 pe-md-5 pt-md-5">
                        <div class="rounded-md p-4 pt-5" id="formulario">
                            <h5 class="mb-3">Completa tus datos para continuar y terminar.</h5>

                            <div id="tu_compra" class="p-2 rounded mt-2 mb-3">
                                <ul class="mb-0">
                                    <li>{{ user_transaccion.parque }}</li>
                                    <li>{{ fecha }}</li>
                                    <li>{{ user_transaccion.total_entradas_adulto }} entradas Adulto.</li>
                                    <li>{{ user_transaccion.total_entradas_nino }} entradas Niño.</li>
                                </ul>
                            </div>

                            <label class="form-label">Nombre:</label>
                            <input v-model="nombres" class="form-control mb-3 p-2" type="text"
                                placeholder="Introduzca sus dos nombres..." aria-label="Cantidad de entradas">

                            <label class="form-label">Apellido paterno:</label>
                            <input v-model="apellido_p" class="form-control mb-3 p-2" type="text"
                                placeholder="Escriba su apellido paterno..." aria-label="Cantidad de entradas">

                            <label class="form-label">Apellido matero:</label>
                            <input v-model="apellido_m" class="form-control mb-3 p-2" type="text"
                                placeholder="Escriba su apellido materno..." aria-label="Cantidad de entradas">

                            <label class="form-label">Correo electronico:</label>
                            <input v-model="correo" class="form-control mb-3 p-2" type="email"
                                placeholder="Escriba su apellido materno..." aria-label="Cantidad de entradas">

                            <div class="col-sm-12 mt-4 text-end mb-2">
                                <button type="button" @click="enviarOrden" class="btn btn-success">Continuar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="pt-4 px-3" style="max-width: 900px;margin: 0px auto;height: 250px;">
                <div class="row" style="max-width: 900px; margin: 0 auto;">
                    <div>*Recuerda llevar tu carnet de identidad. </div>
                    <div>*Consulta la clasificación de los equipos de la Premier League 2024/2025. </div>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDataStore } from '../stores/stepStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const dataStore = useDataStore()
const data = ref(dataStore.dataStepThree)

let user_transaccion = data.value.user_transaccion || {};
let fecha = ref(data.value.user_transaccion.fecha_entradas || {});
let sin_respuesta_servidor = ref(false);
const nombres = ref(data.value.user_transaccion.nombres);
const apellido_p = ref(data.value.user_transaccion.apellido_p);
const apellido_m = ref(data.value.user_transaccion.apellido_m);
const correo = ref(data.value.user_transaccion.correo);
fecha = formatearFecha(fecha);

const enviarOrden = async () => {
    if (!nombres.value || !correo.value) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    if (!apellido_p.value && !apellido_m.value) {
        alert('Por favor, completa todos los campos.');
        return;
    }
    if (!comprobarCorreo(correo.value)) {
        alert('Escriba un correo electronico valido');
        return;
    }

    try {
        const response = await fetch('/caja/step_four', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombres: nombres.value,
                apellido_m: apellido_m.value,
                apellido_p: apellido_p.value,
                correo: correo.value,
                user_transaccion
            })
        })
        const result = await response.json();

        if (response.ok) {
            dataStore.setDataStepFour(result);
            router.push({ name: 'step-four' });
        } else {
            sin_respuesta_servidor.value = true;
            const errorData = await response.json();

            if (errorData.mensaje === 'tiempo_maximo_excedido') {
                router.push({ name: 'home' });
            }
        }
    } catch (error) {
        sin_respuesta_servidor.value = true;
    }
}

function formatearFecha(fecha) {
    const dateString = fecha._rawValue;
    const date = new Date(dateString);

    const options = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
    let formattedDate = date.toLocaleDateString('es-ES', options);

    // Convertir la primera letra a mayúscula y el resto a minúscula
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return formattedDate;
}


function comprobarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

</script>