<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card class="profile-card">
          <v-row no-gutters>
            <!-- Sección izquierda - Información del usuario -->
            <v-col cols="12" md="6" class="pa-6 user-info-section">
              <v-card-title class="text-h4 mb-6">Mi Perfil</v-card-title>
              
              <!-- Modo visualización -->
              <template v-if="!isEditing">
                <v-text-field
                  v-model="username"
                  label="Nombre de usuario"
                  readonly
                  outlined
                  class="mb-4"
                ></v-text-field>

                <v-text-field
                  v-model="pokemon"
                  label="Pokémon favorito"
                  readonly
                  outlined
                  class="mb-6"
                ></v-text-field>

                <v-btn 
                  color="primary" 
                  @click="startEditing"
                  block
                  large
                >
                  Editar Perfil
                </v-btn>
              </template>

              <!-- Modo edición -->
              <template v-else>
                <v-text-field
                  v-model="editUsername"
                  label="Nombre de usuario"
                  :rules="usernameRules"
                  required
                  outlined
                  class="mb-4"
                ></v-text-field>

                <v-select
                  v-model="editPokemon"
                  :items="pokemonList"
                  label="Elige tu Pokémon"
                  :loading="isLoading"
                  :rules="pokemonRules"
                  required
                  outlined
                  class="mb-6"
                ></v-select>

                <div class="d-flex">
                  <v-btn 
                    color="primary" 
                    @click="saveProfile"
                    block
                    large
                    class="mr-2"
                  >
                    Guardar
                  </v-btn>
                  <v-btn 
                    color="secondary" 
                    @click="cancelEditing"
                    block
                    large
                    outlined
                  >
                    Cancelar
                  </v-btn>
                </div>
              </template>
            </v-col>

            <!-- Sección derecha - Imagen del Pokémon -->
            <v-col cols="12" md="6" class="pokemon-image-section">
              <div class="image-container">
                <template v-if="pokemonImage">
                  <v-img
                    :src="pokemonImage"
                    contain
                    max-height="400"
                    class="pokemon-image"
                  ></v-img>
                </template>
                <template v-else>
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                    class="loading-spinner"
                  ></v-progress-circular>
                  <p class="text-center mt-4">Cargando Pokémon...</p>
                </template>
              </div>
            </v-col>
          </v-row>
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
      username: '',
      pokemon: '',
      pokemonImage: '',
      isEditing: false,
      editUsername: '',
      editPokemon: '',
      pokemonList: [],
      isLoading: false,
      usernameRules: [
        (v) => !!v || 'El nombre de usuario es requerido',
      ],
      pokemonRules: [
        (v) => !!v || 'Debes elegir un Pokémon',
      ],
    };
  },
  created() {
    this.loadUserData();
    this.fetchPokemonList();
  },
  methods: {
    async loadUserData() {
      const userStore = useUserStore();
      this.username = userStore.username;
      this.pokemon = userStore.pokemon;

      if (this.pokemon) {
        await this.fetchPokemonImage();
      }
    },
    async fetchPokemonImage() {
      this.isLoading = true;
      try {
        const response = await pokeApi.get(`pokemon/${this.pokemon.toLowerCase()}`);
        this.pokemonImage = response.data.sprites.other['official-artwork'].front_default || 
                            response.data.sprites.front_default;
      } catch (error) {
        console.error('Error al cargar la imagen del Pokémon:', error);
      } finally {
        this.isLoading = false;
      }
    },
    async fetchPokemonList() {
      this.isLoading = true;
      try {
        const response = await pokeApi.get('pokemon?limit=151');
        this.pokemonList = response.data.results.map(pokemon => ({
          text: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          value: pokemon.name
        }));
      } catch (error) {
        console.error('Error al cargar la lista de Pokémon:', error);
      } finally {
        this.isLoading = false;
      }
    },
    startEditing() {
      this.editUsername = this.username;
      this.editPokemon = this.pokemon;
      this.isEditing = true;
    },
    async saveProfile() {
      if (!this.editUsername || !this.editPokemon) return;

      const userStore = useUserStore();
      userStore.setUser(this.editUsername, this.editPokemon);
      localStorage.setItem('user', JSON.stringify({ 
        username: this.editUsername, 
        pokemon: this.editPokemon 
      }));

      this.username = this.editUsername;
      this.pokemon = this.editPokemon;
      await this.fetchPokemonImage();
      this.isEditing = false;
    },
    cancelEditing() {
      this.isEditing = false;
    },
  },
};
</script>

<style scoped>
.profile-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-info-section {
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.pokemon-image-section {
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  width: 100%;
  padding: 20px;
  text-align: center;
}

.pokemon-image {
  transition: transform 0.3s ease;
}

.pokemon-image:hover {
  transform: scale(1.05);
}

.loading-spinner {
  margin: 0 auto;
}

/* Responsive design */
@media (max-width: 960px) {
  .user-info-section, 
  .pokemon-image-section {
    padding: 30px;
  }
  
  .pokemon-image-section {
    order: -1; /* Mover la imagen arriba en móvil */
    border-bottom: 1px solid #eee;
  }
}

@media (max-width: 600px) {
  .profile-card {
    border-radius: 8px;
  }
  
  .user-info-section, 
  .pokemon-image-section {
    padding: 20px;
  }
}
</style>