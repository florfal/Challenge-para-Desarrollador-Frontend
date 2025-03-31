<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Ingresar</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login">
              <!-- Campo para el nombre de usuario -->
              <v-text-field
                v-model="username"
                label="Nombre de usuario"
                :rules="usernameRules"
                required
              ></v-text-field>

              <!-- Selección de Pokémon -->
              <v-select
                v-model="selectedPokemon"
                :items="pokemonList"
                label="Elige tu Pokémon"
                :loading="isLoading"
                :rules="pokemonRules"
                required
              ></v-select>

              <!-- Botón para ingresar -->
              <v-btn type="submit" color="primary" :disabled="!isFormValid">
                Ingresar
              </v-btn>

              <!-- Mensaje de error -->
              <v-alert v-if="errorMessage" type="error" class="mt-4">
                {{ errorMessage }}
              </v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import pokeApi from '@/services/pokeApi';
import { useUserStore } from '@/stores';

export default {
  data() {
    return {
      username: '', // Nombre de usuario
      selectedPokemon: null, // Pokémon seleccionado
      pokemonList: [], // Lista de Pokémon
      isLoading: false, // Estado de carga
      errorMessage: '', // Mensaje de error
      usernameRules: [
        (v) => !!v || 'El nombre de usuario es requerido', // Validación: campo requerido
      ],
      pokemonRules: [
        (v) => !!v || 'Debes elegir un Pokémon', // Validación: campo requerido
      ],
    };
  },
  computed: {
    // Verifica si el formulario es válido
    isFormValid() {
      return this.username && this.selectedPokemon;
    },
  },
  created() {
    this.fetchPokemonList(); // Obtener la lista de Pokémon al crear el componente
  },
  methods: {
    // Obtener la lista de Pokémon desde la PokeAPI
    async fetchPokemonList() {
      this.isLoading = true;
      try {
        const response = await pokeApi.get('pokemon?limit=151'); // Obtener los primeros 151 Pokémon
        this.pokemonList = response.data.results.map(pokemon => pokemon.name); // Solo los nombres
      } catch (error) {
        this.errorMessage = 'Error al cargar la lista de Pokémon. Inténtalo de nuevo.';
        console.error(error); // Muestra el error en la consola para depuración
      } finally {
        this.isLoading = false;
      }
    },
    // Método para iniciar sesión
    login() {
      if (!this.isFormValid) {
        this.errorMessage = 'Por favor, completa todos los campos correctamente.';
        return;
      }

      const userStore = useUserStore();
      userStore.setUser(this.username, this.selectedPokemon); // Guarda en el store
      localStorage.setItem('user', JSON.stringify({ username: this.username, pokemon: this.selectedPokemon })); // Guarda en LocalStorage
      this.$router.push('/home'); // Redirige a la página principal
    },
  },
};
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>