<template>
  <v-container v-if="pokemon" class="pokemon-detail-container">
    <!-- Contenido de la vista de detalle -->
    <v-row class="pokemon-row">
      <v-col cols="12" md="6" class="image-col">
        <v-card class="pokemon-image-card">
          <v-img 
            :src="pokemon.image" 
            contain 
            height="400"
            class="pokemon-image"
          ></v-img>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="6" class="info-col">
        <v-card class="pokemon-info-card">
          <v-card-title class="text-h4">{{ pokemon.name }}</v-card-title>
          
          <v-card-text>
            <div class="type-section mb-4">
              <v-chip-group>
                <v-chip 
                  v-for="type in pokemon.types" 
                  :key="type" 
                  color="primary"
                  class="type-chip"
                >
                  {{ type }}
                </v-chip>
              </v-chip-group>
            </div>
            
            <v-list class="pokemon-stats">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="stat-title">Altura</v-list-item-title>
                  <v-list-item-subtitle class="stat-value">{{ pokemon.height }} m</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="stat-title">Peso</v-list-item-title>
                  <v-list-item-subtitle class="stat-value">{{ pokemon.weight }} kg</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title class="stat-title">Habilidades</v-list-item-title>
                  <v-list-item-subtitle class="stat-value">
                    <span v-for="ability in pokemon.abilities" :key="ability" class="ability">
                      {{ ability }}
                    </span>
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            
            <div class="like-section mt-6">
              <v-btn 
                icon 
                @click="toggleLike(pokemon)"
                class="like-button"
              >
                <LikeButton :active="getUserLike(pokemon.id)" />
              </v-btn>
              <span class="likes-count">{{ getLikesCount(pokemon.id) }} Me gusta</span>
            </div>
          </v-card-text>
          
          <v-card-actions class="actions-section">
            <v-btn 
              color="primary" 
              @click="createDiffusion(pokemon)"
              class="action-button"
            >
              Crear Difusión
            </v-btn>
            <v-btn 
              color="grey" 
              @click="$router.go(-1)"
              class="action-button"
            >
              Volver
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo para editar comentario -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Editar comentario</v-card-title>
        <v-card-text>
          <v-textarea
            v-model="editingComment.text"
            label="Editar comentario"
            outlined
            rows="3"
            class="mb-4"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveEditedComment">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Sección de comentarios -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card class="comments-card">
          <v-card-title>Comentarios</v-card-title>
          
          <!-- Formulario para nuevo comentario -->
          <v-card-text>
            <v-textarea
              v-model="newComment"
              label="Escribe un comentario..."
              outlined
              rows="3"
              class="mb-4"
            ></v-textarea>
            <v-btn 
              color="primary" 
              @click="addComment"
              :disabled="!newComment.trim()"
              class="comment-button"
            >
              Publicar comentario
            </v-btn>
          </v-card-text>
          
          <!-- Lista de comentarios -->
          <v-card-text>
            <v-list v-if="comments.length > 0" class="comments-list">
              <v-list-item 
                v-for="comment in comments" 
                :key="comment.id"
                class="comment-item"
              >
                <v-list-item-avatar>
                  <v-avatar color="primary">
                    <span class="white--text">{{ comment.userName.charAt(0) }}</span>
                  </v-avatar>
                </v-list-item-avatar>
                
                <v-list-item-content>
                  <v-list-item-title class="comment-user">{{ comment.userName }}</v-list-item-title>
                  <v-list-item-subtitle class="comment-date">{{ formatDate(comment.createdAt) }}</v-list-item-subtitle>
                  <v-list-item-text class="comment-text mt-2">{{ comment.text }}</v-list-item-text>
                </v-list-item-content>
                
                <v-list-item-action v-if="comment.userId === currentUser.id" class="comment-actions">
                  <v-btn 
                    color="primary" 
                    @click="editComment(comment)"
                    text
                    class="edit-button"
                  >
                    Editar
                  </v-btn>
                  <v-btn 
                    color="error" 
                    @click="deleteComment(comment)"
                    text
                    class="delete-button"
                  >
                    Eliminar
                  </v-btn>
                </v-list-item-action>
              </v-list-item>
            </v-list>
            
            <v-alert
              v-else
              type="info"
              class="no-comments"
            >
              No hay comentarios aún. ¡Sé el primero en comentar!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

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
      pokemon: null,
      pokemonInteractions: [],
      currentComments: [],
      newComment: '',
      currentUser: { id: 'alex', name: 'Alex' },
      commentsDialog: false,
      editDialog: false,
      editingComment: null
    };
  },
  computed: {
    comments() {
      return this.getPokemonComments(this.pokemon?.id);
    }
  },
  async created() {
    await this.fetchPokemonDetails();
    await this.fetchPokemonInteractions();
  },
  methods: {
    async fetchPokemonDetails() {
      const pokemonId = this.$route.params.id;
      try {
        const response = await pokeApi.get(`pokemon/${pokemonId}`);
        const data = response.data;
        
        this.pokemon = {
          id: data.id,
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          height: data.height / 10,
          weight: data.weight / 10,
          types: data.types.map(t => t.type.name),
          abilities: data.abilities.map(a => a.ability.name)
        };
      } catch (error) {
        console.error('Error al cargar los detalles del Pokémon:', error);
        this.$router.push('/');
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
    
    getPokemonComments(pokemonId) {
      if (!pokemonId) return [];
      
      const comments = [];
      this.pokemonInteractions
        .filter(item => item.pokemonId == pokemonId)
        .forEach(item => {
          if (item.comments && item.comments.length > 0) {
            comments.push(...item.comments.map(comment => ({
              ...comment,
              userName: this.getUserName(comment.userId),
              interactionId: item.id
            })));
          }
        });
      
      return comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    getUserName(userId) {
      return userId === 'alex' ? 'Alex' : `Usuario ${userId}`;
    },
    
    async addComment() {
      if (!this.newComment.trim() || !this.pokemon) return;
      
      try {
        let interaction = this.pokemonInteractions.find(
          item => item.pokemonId == this.pokemon.id && 
                 item.userId === this.currentUser.id
        );

        if (!interaction) {
          const newInteraction = {
            pokemonId: this.pokemon.id,
            userId: this.currentUser.id,
            libed: false,
            comments: []
          };
          const response = await mockApiPokemon.post('/', newInteraction);
          interaction = response.data;
          this.pokemonInteractions.push(interaction);
        }

        const newComment = {
          id: Date.now().toString(),
          text: this.newComment,
          userId: this.currentUser.id,
          createdAt: new Date().toISOString()
        };

        const updatedInteraction = {
          ...interaction,
          comments: [...(interaction.comments || []), newComment]
        };

        await mockApiPokemon.put(`/${interaction.id}`, updatedInteraction);
        
        const index = this.pokemonInteractions.findIndex(
          item => item.id === interaction.id
        );
        this.pokemonInteractions[index] = updatedInteraction;
        
        this.newComment = '';
      } catch (error) {
        console.error('Error al agregar comentario:', error);
      }
    },

    editComment(comment) {
      this.editingComment = { ...comment };
      this.editDialog = true;
    },

    async saveEditedComment() {
      if (!this.editingComment?.text.trim()) {
        this.editDialog = false;
        return;
      }

      try {
        const interaction = this.pokemonInteractions.find(
          item => item.id === this.editingComment.interactionId
        );

        if (interaction) {
          const updatedComments = interaction.comments.map(comment => 
            comment.id === this.editingComment.id ? this.editingComment : comment
          );

          const updatedInteraction = {
            ...interaction,
            comments: updatedComments
          };

          await mockApiPokemon.put(`/${interaction.id}`, updatedInteraction);
          
          const index = this.pokemonInteractions.findIndex(
            item => item.id === interaction.id
          );
          this.pokemonInteractions[index] = updatedInteraction;
          
          this.editDialog = false;
        }
      } catch (error) {
        console.error('Error al editar comentario:', error);
      }
    },

    async deleteComment(comment) {
      try {
        const interaction = this.pokemonInteractions.find(
          item => item.id === comment.interactionId
        );

        if (interaction) {
          const updatedComments = interaction.comments.filter(
            c => c.id !== comment.id
          );

          const updatedInteraction = {
            ...interaction,
            comments: updatedComments
          };

          await mockApiPokemon.put(`/${interaction.id}`, updatedInteraction);
          
          const index = this.pokemonInteractions.findIndex(
            item => item.id === interaction.id
          );
          this.pokemonInteractions[index] = updatedInteraction;
        }
      } catch (error) {
        console.error('Error al eliminar comentario:', error);
      }
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

    async toggleLike(pokemon) {
      try {
        const existingInteraction = this.pokemonInteractions.find(
          item => item.pokemonId == pokemon.id && 
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
        if (!pokemon.name) {
          throw new Error('El Pokémon no tiene nombre definido');
        }

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
        
        await mockApiCollabChat.post('/', newDiffusion);
        
        this.$store.dispatch('showSnackbar', {
          text: 'Difusión creada exitosamente',
          color: 'success'
        });
        
        this.$router.push('/diffusions');
      } catch (error) {
        console.error('Error al crear difusión:', error);
        this.$store.dispatch('showSnackbar', {
          text: error.message || 'Error al crear difusión',
          color: 'error'
        });
      }
    },
    
    formatDate(dateString) {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    }
  }
};
</script>

<style scoped>
/* Eliminamos cualquier flex-wrap y ajustamos los estilos */
.pokemon-row {
  display: flex;
  flex-wrap: nowrap; /* Esto es lo que realmente desactiva el wrap */
  margin: 0 -12px; /* Compensamos el padding de las columnas */
}

/* Ajustamos las columnas para comportamiento responsivo */
.image-col,
.info-col {
  padding: 0 12px;
  flex-shrink: 0;
}

/* Para móviles forzamos el comportamiento de columna */
@media (max-width: 959px) {
  .pokemon-row {
    flex-direction: column;
  }
  
  .image-col,
  .info-col {
    width: 100%;
    max-width: 100%;
  }
}

/* Para desktop mantenemos el layout de dos columnas */
@media (min-width: 960px) {
  .image-col {
    width: 50%;
    max-width: 50%;
  }
  
  .info-col {
    width: 50%;
    max-width: 50%;
  }
}
/* Estilos para la sección de imagen */
.pokemon-image-card {
  border-radius: 12px;
  overflow: hidden;
  height: 100%;
}

.pokemon-image {
  background-color: #f5f5f5;
}

/* Estilos para la sección de información */
.pokemon-info-card {
  border-radius: 12px;
  padding: 20px;
}

.type-section {
  margin-bottom: 20px;
}

.type-chip {
  text-transform: capitalize;
  margin-right: 8px;
}

.pokemon-stats {
  background-color: transparent;
}

.stat-title {
  font-weight: 600;
  color: #333;
}

.stat-value {
  font-size: 1rem;
  color: #555;
}

.ability {
  display: inline-block;
  margin-right: 8px;
  text-transform: capitalize;
}

/* Estilos para la sección de likes */
.like-section {
  display: flex;
  align-items: center;
  margin-top: 24px;
}

.like-button {
  margin-right: 8px;
}

.likes-count {
  font-size: 1rem;
  color: #555;
}

/* Estilos para los botones de acción */
.actions-section {
  padding: 16px 0 0 0;
  border-top: 1px solid #eee;
  margin-top: 16px;
}

.action-button {
  margin-right: 12px;
}

/* Estilos para la sección de comentarios */
.comments-card {
  border-radius: 12px;
}

.comments-list {
  background-color: transparent;
}

.comment-item {
  border-bottom: 1px solid #eee;
  padding: 16px 0;
}

.comment-user {
  font-weight: 600;
}

.comment-date {
  font-size: 0.8rem;
  color: #777;
}

.comment-text {
  font-size: 0.95rem;
  color: #333;
}

.comment-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.edit-button, .delete-button {
  margin: 4px 0;
  min-width: 80px;
}

.comment-button {
  margin-bottom: 16px;
}

.no-comments {
  margin-top: 16px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .pokemon-image-card, .pokemon-info-card {
    margin-bottom: 20px;
  }
  
  .comment-actions {
    flex-direction: row;
    margin-top: 8px;
  }
  
  .edit-button, .delete-button {
    margin: 0 4px;
  }
}
</style>