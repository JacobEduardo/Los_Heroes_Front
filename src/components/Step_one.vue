<template>
	<!-- IF PRINCIPAL -->
	<div v-if="sin_respuesta_servidor">
		<div class="alert alert-warning mb-0" role="alert">
			Server Error: no se pudieron cargar los datos. Por favor, intenta nuevamente más tarde.
		</div>
	</div>

	<div v-if="formData.length > 0">
		<form>
                <div style="background-color:#f48832;align-items:center;width:100%;position: fixed;top: 60px;">
                    <div class="row" style="max-width: 900px; margin: 0 auto;">
                        <div class="container">
                            <div class="col-md-12" id="barra_pasos">
                                <div class="px-3 pt-2 pb-0">
								<h5>Paso 1 de 4</h5>
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
						<div class="rounded-md p-4 py-5" id="formulario">
							<h5 class="mb-4">Ingresa tu rut y selecciona un parque para continuar la compra.</h5>
							<input v-model="rut" class="form-control mb-3 p-2" id="input_rut" type="text"
								placeholder="Ingrese aquí su Rut..." aria-label=".form-control-lg example">
							<div class="col-auto mt-4">
								<select v-model="selectedPark" class="form-select p-2" id="autoSizingSelect">
									<option value="">Selecciona un Parque...</option>
									<option v-for="(parque, index) in formData" :key="index" :value="parque.id">
										{{ parque.nombre }}
									</option>
								</select>
							</div>
							<div class="col-md-12 mt-4 text-end mb-2">
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
	<div v-else>
		<div v-if="sin_respuesta_servidor">
			<div class="text-center mt-5">
				<button type="button" @click="recargarPagina" class="btn btn-primary">Recargar Pagina</button>
			</div>
		</div>
		<div v-else>
			<div class="spinner-container pt-5" style="display: flex; justify-content: center; align-items: center;">
				<div class="spinner-border text-primary" role="status">
					<span class="visually-hidden">Loading...</span>
				</div>
			</div>
		</div>
	</div>

</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDataStore } from '../stores/stepStore'


export default {
	watch: {

	},
	setup() {
		const router = useRouter();
		const route = useRoute();
		const dataStore = useDataStore();

		const rut = ref('');
		const selectedPark = ref('');
		const formData = ref([]);

		const sin_respuesta_servidor = ref(false);

		const fetchFormData = async (retries = 3, delay = 5000) => {
			let attempt = 0;
			let timer;

			const intentarFetch = async () => {
				try {
					timer = setTimeout(() => {
						sin_respuesta_servidor.value = true;
					}, 5000); // Mostrar mensaje si tarda más de 10 segundos

					const response = await fetch('/caja/step_one');
					const data = await response.json();
					formData.value = data;

					// Si los datos se cargan, cancelamos el temporizador
					clearTimeout(timer);
					sin_respuesta_servidor.value = false;

					const parqueIdFromUrl = route.query.parque_id;
					if (parqueIdFromUrl) {
						selectedPark.value = parqueIdFromUrl;
					}

				} catch (error) {
					//cargaLenta.value = true;
					console.error(`Intento ${attempt + 1} fallido:`, error);
					clearTimeout(timer);

					attempt += 1;

					if (attempt < retries) {
						// Esperar un tiempo antes de reintentar
						setTimeout(() => {
							intentarFetch();
						}, delay);
					} else {
						sin_respuesta_servidor.value = true;
						timer = setTimeout(() => {
							router.push({ name: 'home' });
						}, 5000);
					}
				}
			};

			intentarFetch();
		};

		function formatearRut() {
			let asdf = rut.value.replace(/-/g, "");
			if (asdf.length > 1) {
				rut.value = asdf.slice(0, -1) + "-" + asdf.slice(-1);
			}
			console.log('Formateando RUT');
		}



		//ENVIAR
		const enviarOrden = async () => {
			if (!rut.value || !selectedPark.value) {
				alert('Por favor, completa todos los campos.')
				return
			}
			if (!validarRut(rut.value)) {
				alert('El rut no es valido.')
				return
			}

			try {
				const response = await fetch('/caja/step_two', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						rut: rut.value,
						parque_id: selectedPark.value
					})
				})
				const result = await response.json()
				console.log('Resultado de la petición /caja/selecc_fecha:', result)

				if (response.ok) {
					dataStore.setDataStepTwo(result);
					router.push({ name: 'step-two' })

				} else {
					alert('Hubo un error al enviar los datos')
				}
			} catch (error) {
				console.error('Error enviando los datos:', error)
				sin_respuesta_servidor.value = true;
			}
		}

		//START
		onMounted(() => {
			fetchFormData()

		})
		//Watchers
		watch(rut, (newValue, oldValue) => {
			formatearRut();
			console.log('asdfasdf');
		});
		const recargarPagina = async () => {
			window.location.reload();
		}

		return {
			rut,
			selectedPark,
			formData,
			enviarOrden,
			sin_respuesta_servidor,
			recargarPagina,
			formatearRut,
		}
	}
}

function validarRut(rutCompleto) {
	rutCompleto = rutCompleto.replace("‐", "-");
	if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto))
		return false;
	var tmp = rutCompleto.split('-');
	var digv = tmp[1];
	var rut = tmp[0];
	if (digv == 'K') digv = 'k';

	return (dv(rut) == digv);
}
function dv(T) {
	var M = 0, S = 1;
	for (; T; T = Math.floor(T / 10))
		S = (S + T % 10 * (9 - M++ % 6)) % 11;
	return S ? S - 1 : 'k';
}

function validarParque(selectedPark) {
	//PENDIENTE
	return true;
}



</script>
