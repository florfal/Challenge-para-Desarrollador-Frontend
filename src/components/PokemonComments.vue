<script>
import mockApiPokemon from '@/services/mockApiPokemon';

export default {
  props: {
    pokemonId: {
      type: [String, Number],
      required: true
    },
    currentUser: {
      type: Object,
      required: true,
      default: () => ({ id: 'alex', name: 'Alex' })
    },
    initialInteractions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      pokemonInteractions: [...this.initialInteractions],
      newComment: '',
      editingComment: null,
      editDialog: false
    };
  },
  computed: {
    comments() {
      const comments = [];
      this.pokemonInteractions
        .filter(item => item.pokemonId == this.pokemonId)
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
    }
  },
  methods: {
    getUserName(userId) {
      return userId === 'alex' ? 'Alex' : `Usuario ${userId}`;
    },
    
    async addComment() {
      if (!this.newComment.trim() || !this.pokemonId) return;
      
      try {
        let interaction = this.pokemonInteractions.find(
          item => item.pokemonId == this.pokemonId && 
                 item.userId === this.currentUser.id
        );

        if (!interaction) {
          const newInteraction = {
            pokemonId: this.pokemonId,
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
        this.$emit('interaction-updated', this.pokemonInteractions);
      } catch (error) {
        console.error('Error al agregar comentario:', error);
      }
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
          this.$emit('interaction-updated', this.pokemonInteractions);
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
          this.$emit('interaction-updated', this.pokemonInteractions);
        }
      } catch (error) {
        console.error('Error al eliminar comentario:', error);
      }
    }
  },
  watch: {
    initialInteractions(newVal) {
      this.pokemonInteractions = [...newVal];
    }
  }
};
</script>