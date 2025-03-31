import { defineStore } from 'pinia';
import mockApiPokemon from '@/services/mockApiPokemon';

export const useUserStore = defineStore('user', {
  state: () => ({
    username: '',
    pokemon: '', // URL del Pokémon seleccionado
    currentUser: { id: 'alex', name: 'Alex' }, // Usuario actual
    comments: [] // Todos los comentarios
  }),
  actions: {
    setUser(username, pokemon) {
      this.username = username;
      this.pokemon = pokemon;
    },
    loadUserFromLocalStorage() {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        this.setUser(userData.username, userData.pokemon);
      }
    },
    async fetchComments() {
      try {
        const response = await mockApiPokemon.get('/comments');
        this.comments = response.data;
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    },
    async addComment(comment) {
      try {
        const response = await mockApiPokemon.post('/comments', comment);
        this.comments.unshift(response.data);
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    },
    async deleteComment(commentId) {
      try {
        await mockApiPokemon.delete(`/comments/${commentId}`);
        this.comments = this.comments.filter(c => c.id !== commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  },
  getters: {
    getPokemonComments: (state) => (pokemonId) => {
      return state.comments.filter(c => c.pokemonId === pokemonId);
    }
  }
});