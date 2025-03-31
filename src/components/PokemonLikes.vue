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
      pokemonInteractions: [...this.initialInteractions]
    };
  },
  computed: {
    likesCount() {
      return this.pokemonInteractions
        .filter(item => item.pokemonId == this.pokemonId && item.libed)
        .length;
    },
    userLiked() {
      return this.pokemonInteractions.some(
        item => item.pokemonId == this.pokemonId && 
                item.userId === this.currentUser.id && 
                item.libed
      );
    }
  },
  methods: {
    async toggleLike() {
      try {
        const existingInteraction = this.pokemonInteractions.find(
          item => item.pokemonId == this.pokemonId && 
                 item.userId === this.currentUser.id
        );

        let updatedInteraction;
        
        if (existingInteraction) {
          updatedInteraction = {
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
            pokemonId: this.pokemonId,
            userId: this.currentUser.id,
            libed: true,
            comments: []
          };
          const response = await mockApiPokemon.post('/', newInteraction);
          updatedInteraction = response.data;
          this.pokemonInteractions.push(updatedInteraction);
        }
        
        this.$emit('interaction-updated', this.pokemonInteractions);
      } catch (error) {
        console.error('Error al actualizar like:', error);
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