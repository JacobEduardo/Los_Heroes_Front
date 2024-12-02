<template>
    <!-- IF PRINCIPAL -->
    <div v-if="sin_respuesta_servidor">
        <div class="alert alert-warning mb-0" role="alert">
            Server Error: no se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
        </div>
    </div>

    <div v-if="data.mensaje_api">
        <div class="alert alert-warning" role="alert">
            Api Error: error cargando los datos. Por favor, intenta nuevamente más tarde.
        </div>
        <div class="text-center mt-5">
            <button type="button" onclick="window.location.href='/'" class="btn btn-primary">Recargar Pagina</button>
        </div>
    </div>
    <div v-else>
        <div v-if="data && data.user_parque_seleccionado">
            <form>
                <div style="background-color:#f48832;align-items:center;width:100%;position: fixed;top: 60px;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div class="container">
                            <div class="col-md-12" id="barra_pasos">
                                <div class="px-3 pt-2 pb-0">
                                    <h5>Paso 2 de 4</h5>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="fondo_main pb-md-5" style="align-items:center;width:100%;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div class="pe-4 pt-5 col-md-6 ps-5 d-none d-md-block"
                            style=" color: white; font-size: xxx-large;">
                            <strong>Compra tus Entradas</strong>
                            <h5>
                                Compra entradas por que este es un texto que lo dice.
                            </h5>
                        </div>
                        <div class="col-md-6 p-0 pe-md-5 pt-md-5">
                            <div class="rounded-md p-4 pt-5" id="formulario">
                                <h5 class="mb-4">Selecciona la fecha y la cantidad de entradas.</h5>
                                <p v-if="cantidadEntradasDesc > 0" style="color: cornflowerblue">
                                    Eres afiliado y tienes {{ cantidadEntradasDesc }} entradas con descuento por día.
                                </p>

                                <div id="tu_compra" class="p-2 rounded mt-2 mb-3">
                                    <ul class="mb-0">
                                        <li>{{ user_transaccion.parque }}</li>
                                    </ul>
                                </div>
                                <label for="fecha" class="form-label">Entradas adulto:</label>
                                <input v-model="entradas_adulto" class="form-control mb-3 p-2" type="number"
                                    placeholder="Introduzca la cantidad..." aria-label="Cantidad de entradas">

                                <label for="fecha" class="form-label">Entradas niño:</label>
                                <input v-model="entradas_nino" class="form-control mb-3 p-2" type="number"
                                    placeholder="Introduzca la cantidad..." aria-label="Cantidad de entradas">

                                <label for="fecha" class="form-label">Selecciona una fecha:</label>
                                <input v-model="fecha_entradas" @input="handleFechaChange" type="text" id="datepicker"
                                    class="form-control" placeholder="Introduzca una fecha...">
                                <div class="col-sm-12 mt-4 text-end mb-2">
                                    <button type="button" id="btnvalida" @click="enviarOrden"
                                        class="btn btn-success">Continuar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pt-4 px-3 pb-5" style="max-width: 900px;margin: 0px auto;min-height: 250px;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div>*Recuerda llevar tu carnet de identidad. </div>
                        <div>*Consulta la clasificación de los equipos de la Premier League 2024/2025. </div>
                    </div>
                </div>
            </form>
        </div>
        <div v-else>
            <div class="spinner-container pt-5" style="display: flex; justify-content: center; align-items: center;">
                <div class="spinner-border text-primary" role="status"
                    style="display: flex; justify-content: center; align-items: center;">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDataStore } from '../stores/stepStore'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios';

const router = useRouter()

const dataStore = useDataStore()
const data = ref(dataStore.dataStepTwo)
let user_transaccion = data.value.user_transaccion || {};
let user_parque_seleccionado= data.value.user_parque_seleccionado || {};

let sin_respuesta_servidor = ref(false);

const entradas_adulto = ref(0)
const entradas_nino = ref(0)
const fecha_entradas = ref('')

let fecha_ = ref('');
const cantidadEntradasDesc = ref(0);

const enviarOrden = async () => {
    if (entradas_adulto.value === "" || entradas_nino.value === "" || fecha_entradas.value === "") {
        alert('Por favor, completa todos los campos.');
        return;
    }
    if (!comprobarEntradas(entradas_adulto.value, entradas_nino.value)) {
        alert('La cantidad de entradas no es valida.');
        return
    }
    const capacidadDisponible = await comprobarCapacidad(entradas_adulto.value, entradas_nino.value, user_parque_seleccionado.capacidad);
    if (!capacidadDisponible) {
        alert('No quedan entradas para este dia.');
        return;
    }

    user_transaccion.cantidad_de_entradas_con_desc = cantidadEntradasDesc.value;
    try {
        const response = await fetch('/caja/step_three', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                entradas_adulto: entradas_adulto.value,
                entradas_nino: entradas_nino.value,
                fecha_entradas: fecha_entradas.value,
                user_transaccion
            })
        })
        if (response.ok) {
            const result = await response.json();
            console.log('Resultado de la petición /caja/completar_datos:', result);

            dataStore.setDataStepThree(result);
            router.push({ name: 'step-three' });
        } else {
            const errorData = await response.json();

            if (errorData.mensaje === 'tiempo_maximo_excedido') {
                router.push({ name: 'home' });
            }

            sin_respuesta_servidor.value = true;
            console.log('Error de servidor bd.');
        }
    } catch (error) {
        console.error('Error enviando los datos:', error);
    }
}


const handleFechaChange = () => {
    axios.get('http://localhost:3000/cantidad_entradas_desc_por_dia', {//PENDIENTE. esta bien?
        params: {
            fecha: fecha_entradas.value,
            transaccion: user_transaccion,
            parque_seleccionado: data.value.user_parque_seleccionado
        }
    })
        .then(response => {
            cantidadEntradasDesc.value = response.data.mensaje;
        })
        .catch(error => {
            console.error('Error:', error);
        });
};


onMounted(async () => {
    let cerrados = await data.value.dias_cerrado;
    let max_dias = await data.value.user_parque_seleccionado.cantidad_de_dias_cargados;
    console.log(max_dias);
    const diasBloqueados = cerrados.map(element => element.fecha);
    console.log(diasBloqueados);

    const hoy = new Date();
    const maxDate = new Date();
    maxDate.setDate(hoy.getDate() + max_dias);

    flatpickr("#datepicker", {
        disable: [
            ...diasBloqueados,
        ],
        minDate: hoy,
        maxDate: maxDate,
        dateFormat: "Y-m-d",
        locale: 'es'
    });
});

function comprobarEntradas(entradas_adulto, entradas_nino) {
    if (!isNaN(entradas_adulto) && !isNaN(entradas_nino) && entradas_adulto < 30 && entradas_nino < 30 &&
        entradas_adulto >= 0 && entradas_nino >= 0 && (entradas_nino + entradas_adulto) >= 1) {
        return true;
    }
    return false;
}

async function comprobarCapacidad(entradas_adulto, entradas_nino, capacidad) {
    try {
        const response = await axios.get('http://localhost:3000/cantidad_entradas_vendidas', {
            params: {
                fecha: fecha_entradas.value,
                parque_seleccionado: data.value.user_parque_seleccionado,
                entradas_adulto: entradas_adulto,
                entradas_nino: entradas_nino
            }
        });
        const respuesta = response.data.mensaje;
        console.log(respuesta);
        return respuesta;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


</script>