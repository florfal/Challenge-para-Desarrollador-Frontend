<script>
import mockApiCollabChat from '@/services/mockApiCollabChat';

export default {
  props: {
    diffusionId: {
      type: [String, Number],
      required: true
    },
    currentUser: {
      type: Object,
      required: true,
      default: () => ({ id: 'alex', name: 'Alex' })
    }
  },
  data() {
    return {
      diffusions: [],
      newComment: '',
      replyText: '',
      activeReply: null,
      userReactions: {
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
        this.diffusions = response.data;
      } catch (error) {
        console.error('Error al cargar difusiones:', error);
      }
    },
    
    getCurrentDiffusion() {
      return this.diffusions.find(d => d.id === this.diffusionId);
    },
    
    async addComment() {
      if (!this.newComment.trim() || !this.diffusionId) return;
      
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
        
        const diffusion = this.getCurrentDiffusion();
        const updatedDiffusion = {
          ...diffusion,
          comments: [...(diffusion.comments || []), newComment]
        };
        
        await mockApiCollabChat.put(`/${this.diffusionId}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.newComment = '';
        this.$emit('comment-added');
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
        
        const diffusion = this.getCurrentDiffusion();
        const updatedComments = diffusion.comments.map(c => {
          if (c.id === comment.id) {
            return {
              ...c,
              replies: [...(c.replies || []), newReply]
            };
          }
          return c;
        });
        
        const updatedDiffusion = {
          ...diffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.diffusionId}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.activeReply = null;
        this.replyText = '';
        this.$emit('reply-added');
      } catch (error) {
        console.error('Error al agregar respuesta:', error);
      }
    },
    
    getCommentReaction(commentId) {
      return this.userReactions.comments[commentId] || null;
    },
    
    async toggleCommentLike(comment) {
      const currentReaction = this.getCommentReaction(comment.id);
      const newLikes = currentReaction === 'like' ? comment.likes - 1 : comment.likes + 1;
      const newDislikes = currentReaction === 'dislike' ? comment.dislikes - 1 : comment.dislikes;
      
      try {
        const diffusion = this.getCurrentDiffusion();
        const updatedComments = diffusion.comments.map(c => {
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
          ...diffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.diffusionId}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.$emit('comment-reaction-updated');
      } catch (error) {
        console.error('Error al actualizar like del comentario:', error);
      }
    },
    
    async toggleCommentDislike(comment) {
      const currentReaction = this.getCommentReaction(comment.id);
      const newDislikes = currentReaction === 'dislike' ? comment.dislikes - 1 : comment.dislikes + 1;
      const newLikes = currentReaction === 'like' ? comment.likes - 1 : comment.likes;
      
      try {
        const diffusion = this.getCurrentDiffusion();
        const updatedComments = diffusion.comments.map(c => {
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
          ...diffusion,
          comments: updatedComments
        };
        
        await mockApiCollabChat.put(`/${this.diffusionId}`, updatedDiffusion);
        await this.fetchDiffusions();
        this.$emit('comment-reaction-updated');
      } catch (error) {
        console.error('Error al actualizar dislike del comentario:', error);
      }
    }
  }
};
</script>