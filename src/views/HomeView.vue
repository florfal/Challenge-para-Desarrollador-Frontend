<template>
  <v-container class="home-container">
    <v-card flat>
      <v-card-title class="text-h4">Pokémones</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          label="Buscar Pokémon"
          outlined
          class="mb-6"
        ></v-text-field>

        <v-alert
          v-if="searchQuery && filteredPokemons.length === 0"
          type="info"
          class="mb-4"
        >
          No se encontraron resultados para "{{ searchQuery }}"
        </v-alert>

        <v-row>
            <v-col 
            v-for="pokemon in filteredPokemons.slice(0, visiblePokemons)" 
            :key="pokemon.id" 
            cols="12" sm="6" md="3" lg="4"
            >
            <v-card 
                class="pokemon-card"
                elevation="0"
                hover="false"
                @click.stop="viewPokemonDetail(pokemon)"
            >

                <v-img 
                :src="pokemon.image" 
                height="180"
                contain
                class="pokemon-img"
                ></v-img>
                
                <v-card-text class="pt-4 pb-0 px-4">
                <div class="text-h5 font-weight-bold pokemon-name">{{ pokemon.name }}</div>
                <div class="text-caption mt-1">#{{ String(pokemon.id).padStart(3, '0') }}</div>
                </v-card-text>
                
                <v-card-actions class="px-4 pb-4 pt-2">
                <div class="like-section">
                    <v-btn 
                    icon 
                    @click.stop="toggleLike(pokemon)"
                    class="mr-2"
                    >
                    <LikeButton :active="getUserLike(pokemon.id)" />
                    </v-btn>
                    <span>{{ getLikesCount(pokemon.id) }}</span>
                    <div v-if="getLikesUsers(pokemon.id).length > 0" class="likes-list-small">
                    <small>
                        <span v-for="(user, index) in getLikesUsers(pokemon.id)" :key="user.id">
                        {{ user.name }}{{ index < getLikesUsers(pokemon.id).length - 1 ? ', ' : '' }}
                        </span>
                    </small>
                    </div>
                </div>
                
                <div>
                    <v-btn @click.stop="createDiffusion(pokemon)" color="blue lighten-2" dark>
                    Difusión
                    </v-btn>
                </div>
                </v-card-actions>
            </v-card>
            </v-col>
        </v-row>

        <v-btn
          v-if="filteredPokemons.length > visiblePokemons"
          color="primary"
          @click="loadMore"
          block
          class="mt-4"
          large
        >
          Ver más Pokémones
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>


<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
}

.v-row {
  justify-content: center;
}

.pokemon-card {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  cursor: pointer;
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.1);
  background-color: white !important;
  margin-bottom: 20px;
}

.pokemon-card:hover {
  transform: translateY(-5px);
  box-shadow: 4px 8px 20px rgba(0, 0, 0, 0.2);
}

.pokemon-img {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background-color: #f8f9fa;
}

.pokemon-name {
  color: #37474f;
  text-transform: capitalize;
  font-size: 1.25rem;
  font-weight: 600;
}

.like-section {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.likes-list-small {
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}



/* Ajustes para móvil */
@media (max-width: 600px) {
  .v-col {
    flex: 0 0 100%;
    max-width: 100%;
  }
}

.v-application .v-card:not(.custom-card):hover::before {
  background-color: transparent !important;
}

.v-card__actions {
  padding-top: 0;
}
</style>


<script>
import pokeApi from '@/services/pokeApi';
import mockApiPokemon from '@/services/mockApiPokemon';
import mockApiCollabChat from '@/services/mockApiCollabChat';
import LikeButton from '@/icons/LikeButton.vue';

export default {
  components: {
    LikeButton
  },
  data() {
    return {
      pokemons: [],
      pokemonInteractions: [],
      diffusions: [],
      searchQuery: '',
      visiblePokemons: 9, // Mostrar múltiplo de 2 y 3 para mejor visualización
      currentUser: { id: 'alex', name: 'Alex' }
    };
  },
  computed: {
    filteredPokemons() {
      if (!this.searchQuery) return this.pokemons;
      return this.pokemons.filter(pokemon =>
        pokemon.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  async created() {
    await this.fetchPokemons();
    await this.fetchPokemonInteractions();
    await this.fetchDiffusions();
  },
  methods: {
    viewPokemonDetail(pokemon) {
      this.$router.push(`/pokemon/${pokemon.id}`);
    },

    async fetchPokemons() {
      try {
        const response = await pokeApi.get('pokemon?limit=151');
        this.pokemons = response.data.results.map((pokemon, index) => ({
          id: index + 1,
          name: pokemon.name,
          url: pokemon.url
        }));
        
        await Promise.all(this.pokemons.map(async (pokemon) => {
          const details = await pokeApi.get(pokemon.url);
          pokemon.image = details.data.sprites.front_default;
        }));
      } catch (error) {
        console.error('Error al cargar los Pokémones:', error);
      }
    },

    async fetchPokemonInteractions() {
      try {
        const response = await mockApiPokemon.get('/');
        this.pokemonInteractions = response.data;
      } catch (error) {
        console.error('Error al cargar interacciones:', error);
      }
    },

    async fetchDiffusions() {
      try {
        const response = await mockApiCollabChat.get('/');
        this.diffusions = response.data;
      } catch (error) {
        console.error('Error al cargar difusiones:', error);
      }
    },

    loadMore() {
      this.visiblePokemons += 8;
    },

    getLikesCount(pokemonId) {
      return this.pokemonInteractions
        .filter(item => item.pokemonId == pokemonId && item.libed)
        .length;
    },

    getUserLike(pokemonId) {
      return this.pokemonInteractions.some(
        item => item.pokemonId == pokemonId && 
                item.userId === this.currentUser.id && 
                item.libed
      );
    },

    getLikesUsers(pokemonId) {
      const usersWhoLiked = [];
      this.pokemonInteractions
        .filter(item => item.pokemonId == pokemonId && item.libed)
        .forEach(item => {
          usersWhoLiked.push({
            id: item.userId,
            name: item.userId === 'alex' ? 'Alex' : item.userId
          });
        });
      return usersWhoLiked;
    },

    async toggleLike(pokemon) {
      try {
        const existingInteraction = this.pokemonInteractions.find(
          item => item.pokemonId === pokemon.id && 
                 item.userId === this.currentUser.id
        );

        if (existingInteraction) {
          const updatedInteraction = {
            ...existingInteraction,
            libed: !existingInteraction.libed
          };
          await mockApiPokemon.put(`/${existingInteraction.id}`, updatedInteraction);
          
          const index = this.pokemonInteractions.findIndex(
            item => item.id === existingInteraction.id
          );
          this.pokemonInteractions[index] = updatedInteraction;
        } else {
          const newInteraction = {
            pokemonId: pokemon.id,
            userId: this.currentUser.id,
            libed: true,
            comments: []
          };
          const response = await mockApiPokemon.post('/', newInteraction);
          this.pokemonInteractions.push(response.data);
        }
      } catch (error) {
        console.error('Error al actualizar like:', error);
      }
    },

    async createDiffusion(pokemon) {
      try {
        const newDiffusion = {
          title: `Difusión sobre ${pokemon.name}`,
          description: `¡Mira este increíble Pokémon: ${pokemon.name}!`,
          pokemonId: pokemon.id,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          comments: []
        };
        
        const response = await mockApiCollabChat.post('/', newDiffusion);
        this.diffusions.push(response.data);
        
        this.$store.dispatch('showSnackbar', {
          text: 'Difusión creada exitosamente',
          color: 'success'
        });
      } catch (error) {
        console.error('Error al crear difusión:', error);
        this.$store.dispatch('showSnackbar', {
          text: 'Error al crear difusión',
          color: 'error'
        });
      }
    }
  }
};
</script>

