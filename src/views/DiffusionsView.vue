<template>
  <v-container>
    
    <v-card>
      <v-card-title class="text-h4">Difusiones</v-card-title>
      <v-card-text>
        <v-row>
          <v-col 
            v-for="diffusion in diffusions" 
            :key="diffusion.id" 
            cols="12" md="6"
          >
            <v-card class="diffusion-card">
              <v-card-title>{{ diffusion.title }}</v-card-title>
              <v-card-subtitle>
                Creada por {{ diffusion.userName || 'Usuario desconocido' }} • 
                {{ formatDate(diffusion.createdAt) }}
                <v-chip v-if="isEditable(diffusion)" small color="green" class="ml-2">
                  Editable
                </v-chip>
              </v-card-subtitle>
              
              <v-card-text>
                <p>{{ diffusion.description }}</p>
                
                <!-- Sistema de reacciones -->
                <div class="reaction-section">
                  <LikeButton 
                    :active="getUserReaction(diffusion.id) === 'like'" 
                    @click="toggleLike(diffusion)"
                    class="mr-2"
                  />
                  <span class="mr-3">{{ diffusion.likes || 0 }}</span>
                  
                  <DislikeButton 
                    :active="getUserReaction(diffusion.id) === 'dislike'" 
                    @click="toggleDislike(diffusion)"
                    class="mr-2"
                  />
                  <span>{{ diffusion.dislikes || 0 }}</span>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-btn 
                  color="primary" 
                  text 
                  @click="openDiffusionDetail(diffusion)"
                >
                  Ver detalles y comentarios
                </v-btn>
                
                <v-btn 
                  v-if="isEditable(diffusion)"
                  color="secondary" 
                  text 
                  @click="editDiffusion(diffusion)"
                >
                  Editar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Diálogo de detalles y comentarios -->
    <v-dialog v-model="detailDialog" max-width="800" persistent>
      <v-card v-if="selectedDiffusion">
        <v-card-title>
          {{ selectedDiffusion.title }}
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="detailDialog = false">
            Volver
          </v-btn>
        </v-card-title>
        
        <v-card-subtitle>
          Creada por {{ selectedDiffusion.userName }} • 
          {{ formatDate(selectedDiffusion.createdAt) }}
        </v-card-subtitle>
        
        <v-card-text>
          <p class="text-h6">{{ selectedDiffusion.description }}</p>
          
          <!-- Sistema de reacciones -->
          <div class="reaction-section mb-4">
            <LikeButton 
              :active="getUserReaction(selectedDiffusion.id) === 'like'" 
              @click="toggleLike(selectedDiffusion)"
              class="mr-2"
            />
            <span class="mr-3">{{ selectedDiffusion.likes || 0 }} Me gusta</span>
            
            <DislikeButton 
              :active="getUserReaction(selectedDiffusion.id) === 'dislike'" 
              @click="toggleDislike(selectedDiffusion)"
              class="mr-2"
            />
            <span>{{ selectedDiffusion.dislikes || 0 }} No me gusta</span>
          </div>
          
          <v-divider class="my-4"></v-divider>
          
          <!-- Sección de comentarios -->
          <h3 class="mb-4">Comentarios ({{ selectedDiffusion.comments?.length || 0 }})</h3>
          
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
          >
            Publicar comentario
          </v-btn>
          
          <v-list class="mt-4">
            <v-list-item 
              v-for="comment in selectedDiffusion.comments" 
              :key="comment.id"
              class="mb-4"
            >
              <v-list-item-avatar>
                <v-avatar color="primary">
                  <span class="white--text">{{ comment.userName.charAt(0) }}</span>
                </v-avatar>
              </v-list-item-avatar>
              
              <v-list-item-content>
                <v-list-item-title>{{ comment.userName }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(comment.createdAt) }}</v-list-item-subtitle>
                <v-list-item-text class="mt-2">{{ comment.text }}</v-list-item-text>
                
                <!-- Respuestas -->
                <div v-if="comment.replies?.length" class="replies ml-8 mt-2">
                  <v-list-item 
                    v-for="reply in comment.replies" 
                    :key="reply.id"
                    class="mb-2"
                  >
                    <v-list-item-avatar size="32">
                      <v-avatar color="secondary" size="32">
                        <span class="white--text" style="font-size: 0.8rem;">{{ reply.userName.charAt(0) }}</span>
                      </v-avatar>
                    </v-list-item-avatar>
                    
                    <v-list-item-content>
                      <v-list-item-title style="font-size: 0.9rem;">{{ reply.userName }}</v-list-item-title>
                      <v-list-item-subtitle style="font-size: 0.8rem;">{{ formatDate(reply.createdAt) }}</v-list-item-subtitle>
                      <v-list-item-text style="font-size: 0.9rem;" class="mt-1">{{ reply.text }}</v-list-item-text>
                    </v-list-item-content>
                  </v-list-item>
                </div>
                
                <!-- Formulario para responder -->
                <div v-if="activeReply === comment.id" class="reply-form ml-8 mt-2">
                  <v-textarea
                    v-model="replyText"
                    label="Escribe tu respuesta..."
                    outlined
                    rows="2"
                    class="mb-2"
                  ></v-textarea>
                  <v-btn 
                    color="primary" 
                    small
                    @click="addReply(comment)"
                    :disabled="!replyText.trim()"
                  >
                    Responder
                  </v-btn>
                  <v-btn 
                    text 
                    small
                    @click="activeReply = null"
                    class="ml-2"
                  >
                    Cancelar
                  </v-btn>
                </div>
                
                <v-btn 
                  v-else
                  text 
                  small
                  @click="showReplyForm(comment.id)"
                  class="mt-2"
                >
                  Responder
                </v-btn>
              </v-list-item-content>
              
              <v-list-item-action>
                <div class="comment-actions">
                  <LikeButton 
                    :active="getCommentReaction(comment.id) === 'like'" 
                    @click="toggleCommentLike(comment)"
                    size="small"
                    class="mr-1"
                  />
                  <span class="mr-2" style="font-size: 0.8rem;">{{ comment.likes || 0 }}</span>
                  
                  <DislikeButton 
                    :active="getCommentReaction(comment.id) === 'dislike'" 
                    @click="toggleCommentDislike(comment)"
                    size="small"
                    class="mr-1"
                  />
                  <span style="font-size: 0.8rem;">{{ comment.dislikes || 0 }}</span>
                </div>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de edición -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>Editar Difusión</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editingDiffusion.title"
            label="Título"
            outlined
            class="mb-4"
          ></v-text-field>
          
          <v-textarea
            v-model="editingDiffusion.description"
            label="Descripción"
            outlined
            rows="4"
            class="mb-4"
          ></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="saveDiffusion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import mockApiCollabChat from '@/services/mockApiCollabChat';
import LikeButton from '@/icons/LikeButton.vue';
import DislikeButton from '@/icons/DislikeButton.vue';

export default {
  components: {
    LikeButton,
    DislikeButton
  },
  data() {
    return {
      diffusions: [],
      detailDialog: false,
      selectedDiffusion: null,
      editDialog: false,
      editingDiffusion: null,
      newComment: '',
      replyText: '',
      activeReply: null,
      currentUser: { id: 'alex', name: 'Alex' },
      userReactions: {
        diffusions: JSON.parse(localStorage.getItem('diffusionReactions')) || {},
        comments: JSON.parse(localStorage.getItem('commentReactions')) || {}
      }
    };
  },
  async created() {
    await this.fetchDiffusions();
  },
  methods: {
    async fetchDiffusions() {
      try {
        const response = await mockApiCollabChat.get('/');
        this.diffusions = response.data.map(d => ({
          ...d,
          likes: d.likes || 0,
          dislikes: d.dislikes || 0,
          comments: d.comments || []
        }));
      } catch (error) {
        console.error('Error al cargar difusiones:', error);
      }
    },
    
    isEditable(diffusion) {
      if (!diffusion.createdAt) return false;
      const oneHour = 60 * 60 * 1000;
      const createdAt = new Date(diffusion.createdAt);
      return (new Date() - createdAt) < oneHour && diffusion.userId === this.currentUser.id;
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Fecha desconocida';
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
    
    openDiffusionDetail(diffusion) {
      this.selectedDiffusion = { ...diffusion };
      this.detailDialog = true;
    },
    
    editDiffusion(diffusion) {
      this.editingDiffusion = { ...diffusion };
      this.editDialog = true;
    },
    
    async saveDiffusion() {
      try {
        const updatedDiffusion = {
          ...this.editingDiffusion,
          updatedAt: new Date().toISOString()
        };
        
        await mockApiCollabChat.put(`/${this.editingDiffusion.id}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.editDialog = false;
      } catch (error) {
        console.error('Error al guardar difusión:', error);
      }
    },
    
    // Sistema de reacciones para difusiones
    getUserReaction(diffusionId) {
      return this.userReactions.diffusions[diffusionId] || null;
    },
    
    async toggleLike(diffusion) {
      const currentReaction = this.getUserReaction(diffusion.id);
      const newLikes = currentReaction === 'like' ? diffusion.likes - 1 : diffusion.likes + 1;
      const newDislikes = currentReaction === 'dislike' ? diffusion.dislikes - 1 : diffusion.dislikes;
      
      try {
        const updatedDiffusion = {
          ...diffusion,
          likes: newLikes,
          dislikes: newDislikes
        };
        
        // Actualizar reacción del usuario
        this.userReactions.diffusions[diffusion.id] = currentReaction === 'like' ? null : 'like';
        localStorage.setItem('diffusionReactions', JSON.stringify(this.userReactions.diffusions));
        
        // Actualizar en la API
        await mockApiCollabChat.put(`/${diffusion.id}`, updatedDiffusion);
        
        // Actualizar vista
        if (this.selectedDiffusion?.id === diffusion.id) {
          this.selectedDiffusion = updatedDiffusion;
        }
        await this.fetchDiffusions();
      } catch (error) {
        console.error('Error al actualizar like:', error);
      }
    },
    
    async toggleDislike(diffusion) {
      const currentReaction = this.getUserReaction(diffusion.id);
      const newDislikes = currentReaction === 'dislike' ? diffusion.dislikes - 1 : diffusion.dislikes + 1;
      const newLikes = currentReaction === 'like' ? diffusion.likes - 1 : diffusion.likes;
      
      try {
        const updatedDiffusion = {
          ...diffusion,
          likes: newLikes,
          dislikes: newDislikes
        };
        
        // Actualizar reacción del usuario
        this.userReactions.diffusions[diffusion.id] = currentReaction === 'dislike' ? null : 'dislike';
        localStorage.setItem('diffusionReactions', JSON.stringify(this.userReactions.diffusions));
        
        // Actualizar en la API
        await mockApiCollabChat.put(`/${diffusion.id}`, updatedDiffusion);
        
        // Actualizar vista
        if (this.selectedDiffusion?.id === diffusion.id) {
          this.selectedDiffusion = updatedDiffusion;
        }
        await this.fetchDiffusions();
      } catch (error) {
        console.error('Error al actualizar dislike:', error);
      }
    },
    
    // Sistema de comentarios
    async addComment() {
      if (!this.newComment.trim() || !this.selectedDiffusion) return;
      
      try {
        const newComment = {
          id: Date.now().toString(),
          text: this.newComment,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          createdAt: new Date().toISOString(),
          likes: 0,
          dislikes: 0,
          replies: []
        };
        
        const updatedDiffusion = {
          ...this.selectedDiffusion,
          comments: [...(this.selectedDiffusion.comments || []), newComment]
        };
        
        await mockApiCollabChat.put(`/${this.selectedDiffusion.id}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.selectedDiffusion = updatedDiffusion;
        this.newComment = '';
      } catch (error) {
        console.error('Error al agregar comentario:', error);
      }
    },
    
    showReplyForm(commentId) {
      this.activeReply = commentId;
      this.replyText = '';
    },
    
    async addReply(comment) {
      if (!this.replyText.trim()) return;
      
      try {
        const newReply = {
          id: Date.now().toString(),
          text: this.replyText,
          userId: this.currentUser.id,
          userName: this.currentUser.name,
          createdAt: new Date().toISOString()
        };
        
        const updatedComments = this.selectedDiffusion.comments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
        
        const updatedDiffusion = {
          ...this.selectedDiffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.selectedDiffusion.id}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.selectedDiffusion = updatedDiffusion;
        this.activeReply = null;
        this.replyText = '';
      } catch (error) {
        console.error('Error al agregar respuesta:', error);
      }
    },
    
    // Sistema de reacciones para comentarios
    getCommentReaction(commentId) {
      return this.userReactions.comments[commentId] || null;
    },
    
    async toggleCommentLike(comment) {
      const currentReaction = this.getCommentReaction(comment.id);
      const newLikes = currentReaction === 'like' ? comment.likes - 1 : comment.likes + 1;
      const newDislikes = currentReaction === 'dislike' ? comment.dislikes - 1 : comment.dislikes;
      
      try {
        const updatedComments = this.selectedDiffusion.comments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              likes: newLikes,
              dislikes: newDislikes
            };
          }
          return c;
        });
        
        // Actualizar reacción del usuario
        this.userReactions.comments[comment.id] = currentReaction === 'like' ? null : 'like';
        localStorage.setItem('commentReactions', JSON.stringify(this.userReactions.comments));
        
        // Actualizar en la API
        const updatedDiffusion = {
          ...this.selectedDiffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.selectedDiffusion.id}`, updatedDiffusion);
        this.selectedDiffusion = updatedDiffusion;
        await this.fetchDiffusions();
      } catch (error) {
        console.error('Error al actualizar like del comentario:', error);
      }
    },
    
    async toggleCommentDislike(comment) {
      const currentReaction = this.getCommentReaction(comment.id);
      const newDislikes = currentReaction === 'dislike' ? comment.dislikes - 1 : comment.dislikes + 1;
      const newLikes = currentReaction === 'like' ? comment.likes - 1 : comment.likes;
      
      try {
        const updatedComments = this.selectedDiffusion.comments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              likes: newLikes,
              dislikes: newDislikes
            };
          }
          return c;
        });
        
        // Actualizar reacción del usuario
        this.userReactions.comments[comment.id] = currentReaction === 'dislike' ? null : 'dislike';
        localStorage.setItem('commentReactions', JSON.stringify(this.userReactions.comments));
        
        // Actualizar en la API
        const updatedDiffusion = {
          ...this.selectedDiffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.selectedDiffusion.id}`, updatedDiffusion);
        this.selectedDiffusion = updatedDiffusion;
        await this.fetchDiffusions();
      } catch (error) {
        console.error('Error al actualizar dislike del comentario:', error);
      }
    }
  }
  
};
</script>

<style scoped>
.diffusion-card {
  transition: transform 0.3s;
  margin-bottom: 16px;
}

.diffusion-card:hover {
  transform: translateY(-5px);
}

.reaction-section {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.replies {
  border-left: 3px solid #eee;
  padding-left: 12px;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.reply-form {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
}
</style>