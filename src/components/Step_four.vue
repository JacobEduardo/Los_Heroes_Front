<template>
    <!-- IF PRINCIPAL -->
    <div v-if="user_transaccion && user_transaccion.id">
        <form>
            <div style="background-color:#f48832;align-items:center;width:100%;position: fixed;top: 60px;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div class="container">
                            <div class="col-md-12" id="barra_pasos">
                                <div class="px-3 pt-2 pb-0">
                                <h4>Paso 3 de 4</h4>
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
                    <h4 class="mb-3">Revisa tu compra.</h4>

                    <div id="tu_compra" class="p-2 rounded mt-2 mb-3">
                        <ul class="mb-0">
                            <li>{{ user_transaccion.parque }}</li>
                            <li>{{ fecha }}</li>
                            <li>{{ user_transaccion.total_entradas_adulto }} entradas Adulto.</li>
                            <li>{{ user_transaccion.total_entradas_nino }} entradas Niño.</li>
                        </ul>
                    </div>

                    <table class="table table-md table-custom">
                        <thead>
                            <tr style="text-align: end;">
                                <td scope="col"></td>
                                <td scope="col" class="td_title">Precio</td>
                                <td scope="col" class="td_title">Cant</td>
                                <td scope="col" class="td_title">Total</td>
                            </tr>
                        </thead>
                        <tbody v-if="boleta">
                            <tr v-if="data.user_transaccion.cantidad_de_entradas_desc_disp > 0">
                                <td scope="row" class="td_text">Entrada Adulto Con Descuento:</td>
                                <td class="td_num">${{ user_transaccion.precio_entrada_adulto_desc }}</td>
                                <td class="td_num">{{ boleta.cant_entradas_adulto_con_descuento }}</td>
                                <td class="td_num">${{ boleta.costo_entradas_adulto_con_descueto }}</td>
                            </tr>
                            <tr v-if="data.user_transaccion.cantidad_de_entradas_desc_disp > 0">
                                <td scope="row" class="td_text">Entrada Niño Con Descuento:</td>
                                <td class="td_num">${{ user_transaccion.precio_entrada_nino_desc }}</td>
                                <td class="td_num">{{ boleta.cant_entradas_nino_con_descuento }}</td>
                                <td class="td_num">${{ boleta.costo_entradas_nino_con_descueto }}</td>
                            </tr>
                            <tr>
                                <td scope="row" class="td_text">Entrada Adulto:</td>
                                <td class="td_num">${{ user_transaccion.precio_entrada_adulto }}</td>
                                <td class="td_num">{{ boleta.cant_entradas_adulto_sin_descuento }}</td>
                                <td class="td_num">${{ boleta.costo_entradas_adulto_sin_descueto }}</td>

                            </tr>
                            <tr>
                                <td scope="row" class="td_text">Entrada Niño:</td>
                                <td class="td_num">${{ user_transaccion.precio_entrada_nino }}</td>
                                <td class="td_num">{{ boleta.cant_entradas_nino_sin_descuento }}</td>
                                <td class="td_num">${{ boleta.costo_entradas_nino_sin_descueto }}</td>
                            </tr>
                            <tr class="">
                                <td scope="row"><b>Total Compra:</b></td>
                                <td class="td_num"></td>
                                <td class="td_num"></td>
                                <td class="td_num"><b>${{ user_transaccion.total_compra }}</b></td>
                            </tr>
                        </tbody>
                    </table>
                    <form :action="urlWP" method="POST">
                        <div class="col-md-12 mt-4 text-end mb-2">
                            <input type="hidden" name="token_ws" :value="tokenWP" />
                            <button type="submit" class="btn btn-success px-4">Pagar</button>
                        </div>
                    </form>
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
import { ref, onMounted, watch } from 'vue';
import { useDataStore } from '../stores/stepStore';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();

const dataStore = useDataStore();
const data = ref(dataStore.dataStepFour);
let user_transaccion = data.value.user_transaccion || {};

const urlWP = ref(data.value.url);
const tokenWP = ref(data.value.tokenR);

let fecha = ref(data.value.user_transaccion.fecha_entradas || {});

fecha = formatearFecha(fecha);

const boleta = ref({});
console.log(boleta);

function formatearFecha(fecha) {
    const dateString = fecha._rawValue;
    const date = new Date(dateString);

    const options = { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' };
    let formattedDate = date.toLocaleDateString('es-ES', options);

    // Convertir la primera letra a mayúscula y el resto a minúscula
    formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

    return formattedDate;
}

onMounted(async () => {
    boleta.value = await calcularEntradasAndCosto(data.value.user_transaccion);
});

async function calcularEntradasAndCosto(bd_user_transaccion) {

    const precio_entrada_nino = bd_user_transaccion.precio_entrada_nino;
    const precio_entrada_adulto = bd_user_transaccion.precio_entrada_adulto;
    const precio_entrada_nino_desc = bd_user_transaccion.precio_entrada_nino_desc;
    const precio_entrada_adulto_desc = bd_user_transaccion.precio_entrada_adulto_desc;
    let cantidad_entradas_nino = bd_user_transaccion.total_entradas_nino;
    let cantidad_entradas_adulto = bd_user_transaccion.total_entradas_adulto;
    let cantidad_de_entradas_con_desc = bd_user_transaccion.cantidad_de_entradas_desc_disp;
    let cant_entradas_adulto_con_descuento = 0;
    let costo_entradas_adulto_con_descueto = 0;
    let cant_entradas_adulto_sin_descuento = 0;
    let costo_entradas_adulto_sin_descueto = 0;
    let cant_entradas_nino_con_descuento = 0;
    let costo_entradas_nino_con_descueto = 0;
    let cant_entradas_nino_sin_descuento = 0;
    let costo_entradas_nino_sin_descueto = 0;

    while (cantidad_de_entradas_con_desc > 0) {
        if (cantidad_entradas_adulto > 0) {
            costo_entradas_adulto_con_descueto += precio_entrada_adulto_desc;
            cant_entradas_adulto_con_descuento += 1;
            cantidad_entradas_adulto -= 1;
        } else if (cantidad_entradas_nino > 0) {
            costo_entradas_nino_con_descueto += precio_entrada_nino_desc;
            cant_entradas_nino_con_descuento += 1;
            cantidad_entradas_nino -= 1;
        }
        cantidad_de_entradas_con_desc -= 1;
    }

    while (cantidad_entradas_adulto > 0) {
        costo_entradas_adulto_sin_descueto += precio_entrada_adulto;
        cant_entradas_adulto_sin_descuento += 1;
        cantidad_entradas_adulto -= 1;
    }

    while (cantidad_entradas_nino > 0) {
        costo_entradas_nino_sin_descueto += precio_entrada_nino;
        cant_entradas_nino_sin_descuento += 1;
        cantidad_entradas_nino -= 1;
    }

    return {
        cant_entradas_adulto_con_descuento: cant_entradas_adulto_con_descuento,
        costo_entradas_adulto_con_descueto: costo_entradas_adulto_con_descueto,
        cant_entradas_adulto_sin_descuento: cant_entradas_adulto_sin_descuento,
        costo_entradas_adulto_sin_descueto: costo_entradas_adulto_sin_descueto,
        cant_entradas_nino_con_descuento: cant_entradas_nino_con_descuento,
        costo_entradas_nino_con_descueto: costo_entradas_nino_con_descueto,
        cant_entradas_nino_sin_descuento: cant_entradas_nino_sin_descuento,
        costo_entradas_nino_sin_descueto: costo_entradas_nino_sin_descueto,
    };

}

</script>
