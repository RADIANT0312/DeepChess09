<template>
  <div class="comment-container">
    <div class="comment-editor">
      <textarea
        v-model="userComment"
        placeholder="please enter your comment..."
        class="comment-textarea"
        rows="5"
      ></textarea>
      
      <div class="comment-actions">
        <button 
          @click="submitComment"
          class="comment-button submit-button"
          :disabled="!userComment.trim()"
        >
          {{ existingComment ? 'update' : 'submit' }}
        </button>
        
        <button 
          @click="requestAIAnalysis"
          class="comment-button ai-button"
          :disabled="!moves.length"
        >
          AI-analysis
        </button>
      </div>
      
      <div v-if="existingComment" class="comment-display">
        <div v-if="existingComment.userComment" class="user-comment">
          <h4>you-analysis:</h4>
          <p>{{ existingComment.userComment }}</p>
        </div>
        
        <div v-if="existingComment.aiComment" class="ai-comment">
          <h4>ai-analysis:</h4>
          <p>{{ existingComment.aiComment }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameComment',
  props: {
    gameId: {
      type: String,
      required: true
    },
    existingComment: {
      type: Object,
      default: null
    },
    moves: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      userComment: this.existingComment?.userComment || '',
      isLoading: false
    }
  },
  methods: {
    submitComment() {
      this.$emit('comment-updated', {
        comments: {
          userComment: this.userComment,
          aiComment: this.existingComment?.aiComment || ''
        }
      });
    },
    
    async requestAIAnalysis() {
      this.isLoading = true;
      try {
        const response = await axios.post(
          `/api/user/history/${this.gameId}/ai-analysis`,
          {
            moves: this.moves
          },
          {
            headers: {
              'Authorization': 'Bearer YOUR_AUTH_TOKEN'
            }
          }
        );
        
        this.$emit('comment-updated', {
          comments: {
            userComment: this.userComment,
            aiComment: response.data.analysis
          }
        });
      } catch (error) {
        console.error('AI-analysis-failed:', error);
        this.$message.error('get-analysis-failed, please try again later.');
      } finally {
        this.isLoading = false;
      }
    }
  }
}
</script>

<style scoped>
.comment-container {
  margin-top: 20px;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.comment-textarea {
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 10px;
  resize: vertical;
}

.comment-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.comment-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.submit-button {
  background-color: #4CAF50;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background-color: #45a049;
}

.ai-button {
  background-color: #2196F3;
  color: white;
}

.ai-button:hover:not(:disabled) {
  background-color: #0b7dda;
}

.comment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.comment-display {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.user-comment, .ai-comment {
  margin-bottom: 15px;
}

.user-comment h4, .ai-comment h4 {
  color: #333;
  margin-bottom: 5px;
}

.user-comment p, .ai-comment p {
  color: #666;
  line-height: 1.6;
}
</style>