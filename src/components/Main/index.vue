<script>
export default {
  name: 'Main',
  data() {
    return {
      imageLoaded: false,
      dailyQuote: '',
      dailyQuoteAuthor: '',
      isLoadingQuote: false,
      localQuotes: [
        ["The only way to do great work is to love what you do.", "Steve Jobs"],
        ["Success is not final, failure is not fatal: it is the courage to continue that counts.", "Winston Churchill"],
        ["Innovation distinguishes between a leader and a follower.", "Steve Jobs"],
        ["The future belongs to those who believe in the beauty of their dreams.", "Eleanor Roosevelt"],
        ["It is during our darkest moments that we must focus to see the light.", "Aristotle"],
        ["Believe you can and you're halfway there.", "Theodore Roosevelt"],
        ["The only impossible journey is the one you never begin.", "Tony Robbins"],
        ["In the middle of difficulty lies opportunity.", "Albert Einstein"],
        ["Your time is limited, don't waste it living someone else's life.", "Steve Jobs"],
        ["The way to get started is to quit talking and begin doing.", "Walt Disney"],
        ["Don't be afraid to give up the good to go for the great.", "John D. Rockefeller"],
        ["Champions are made when nobody's watching.", "Unknown"],
        ["Every master was once a beginner. Every pro was once an amateur.", "Robin Sharma"],
        ["Chess is the gymnasium of the mind.", "Blaise Pascal"],
        ["Victory belongs to the most persevering.", "Napoleon Bonaparte"],
        ["Excellence is never an accident. It is always the result of high intention.", "Aristotle"],
        ["The mind is everything. What you think you become.", "Buddha"],
        ["Don't watch the clock; do what it does. Keep going.", "Sam Levenson"],
        ["A goal is not always meant to be reached, it often serves simply as something to aim at.", "Bruce Lee"],
        ["Success is walking from failure to failure with no loss of enthusiasm.", "Winston Churchill"],
        ["The best time to plant a tree was 20 years ago. The second best time is now.", "Chinese Proverb"],
        ["Life is what happens to you while you're busy making other plans.", "John Lennon"],
        ["The greatest glory in living lies not in never falling, but in rising every time we fall.", "Nelson Mandela"],
        ["You miss 100% of the shots you don't take.", "Wayne Gretzky"],
        ["Whether you think you can or you think you can't, you're right.", "Henry Ford"],
        ["I have not failed. I've just found 10,000 ways that won't work.", "Thomas A. Edison"],
        ["A person who never made a mistake never tried anything new.", "Albert Einstein"],
        ["The person who says it cannot be done should not interrupt the person who is doing it.", "Chinese Proverb"],
        ["Do not go where the path may lead, go instead where there is no path and leave a trail.", "Ralph Waldo Emerson"],
        ["Yesterday is history, tomorrow is a mystery, today is a gift of God, which is why we call it the present.", "Bill Keane"],
        ["The only person you are destined to become is the person you decide to be.", "Ralph Waldo Emerson"],
        ["It does not matter how slowly you go as long as you do not stop.", "Confucius"],
        ["Everything you've ever wanted is on the other side of fear.", "George Addair"],
        ["Success is not how high you have climbed, but how you make a positive difference to the world.", "Roy T. Bennett"],
        ["If you want to achieve greatness stop asking for permission.", "Anonymous"],
        ["What lies behind us and what lies before us are tiny matters compared to what lies within us.", "Ralph Waldo Emerson"],
        ["The only limit to our realization of tomorrow will be our doubts of today.", "Franklin D. Roosevelt"],
        ["Challenges are what make life interesting and overcoming them is what makes life meaningful.", "Joshua J. Marine"],
        ["If you look at what you have in life, you'll always have more.", "Oprah Winfrey"],
        ["First, have a definite, clear practical ideal; a goal, an objective.", "Aristotle"],
        ["Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do.", "Mark Twain"],
        ["The successful warrior is the average man with laser-like focus.", "Bruce Lee"],
        ["Develop success from failures. Discouragement and failure are two of the surest stepping stones to success.", "Dale Carnegie"],
        ["If you genuinely want something, don't wait for it – teach yourself to be impatient.", "Gurbaksh Chahal"],
        ["The way I see it, if you want the rainbow, you gotta put up with the rain.", "Dolly Parton"],
        ["Do something today that your future self will thank you for.", "Sean Patrick Flanery"],
        ["Great things never come from comfort zones.", "Anonymous"],
        ["Dream big and dare to fail.", "Norman Vaughan"],
        ["You are never too old to set another goal or to dream a new dream.", "C.S. Lewis"],
        ["Life isn't about getting and having, it's about giving and being.", "Kevin Kruse"]
      ]
    };
  },
  mounted() {
    this.loadDailyQuote();
  },
  methods: {
    onImageLoad() {
      this.imageLoaded = true;
    },
    
    async loadDailyQuote() {
      this.isLoadingQuote = true;
      this.setLocalDailyQuote();
      // 模拟网络请求延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      this.isLoadingQuote = false;
    },
    
    
    // 使用本地名言数组
    setLocalDailyQuote() {
      // 基于当前日期选择名言，确保每天显示相同的名言
      // const today = new Date();
      // const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
      // const quoteIndex = dayOfYear % this.localQuotes.length;

      const randomIndex = Math.floor(Math.random() * this.localQuotes.length);
      const selectedQuote = this.localQuotes[randomIndex];
      this.dailyQuote = selectedQuote[0];
      this.dailyQuoteAuthor = selectedQuote[1];
    },
    
    // 手动刷新名言（可选功能）
    async refreshQuote() {
      await this.loadDailyQuote();
    }
  }
}
</script>

<template>
  <div class="main-container">
    <br />
    <!-- 只有图片加载完才显示 -->
    <div class="vs-button" v-show="imageLoaded">
      <router-link :to="{ path: '/choose-options', query: { mode: 'game' } }">
        <img src="/polygon-ai-game.jpg" alt="Chess" @load="onImageLoad" />
      </router-link>
    </div>
    <h1 class="chess-title">{{ dailyQuote }}</h1>

    <div class="teaching-button" v-show="imageLoaded">
      <router-link :to="{ path: '/choose-options', query: { mode: 'teaching' } }">
        <img src="/polygon-ai-learning.jpg" alt="Chess" @load="onImageLoad" />
      </router-link>
    </div>

    <!-- 每日名言区域 -->
    <div class="daily-quote-container" v-show="imageLoaded">
      <div class="daily-quote">
        <div class="quote-header">
          <button 
            class="refresh-quote-btn" 
            @click="refreshQuote" 
            :disabled="isLoadingQuote"
            title="Get new quote"
          >
            <span v-if="isLoadingQuote">⏳</span>
            <span v-else>💡</span>
          </button> Daily Inspiration by <strong><span style="font-style: italic;">{{ dailyQuoteAuthor }}</span></strong>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-container {
  position: relative;
  height: 100vh;
}

/* 图片位置保持不变 */
.vs-button {
  position: absolute;
  top: 55%;
  left: 25%;
  width: 600px;
  /* 固定宽度 */
  transform: translate(-50%, -50%);
}

.vs-button img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.vs-button img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);
}

.chess-title {
  text-align: center;
  font-size: 300%;
  font-weight: 800;
  letter-spacing: 1.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  margin-top: 7.5%;
  margin-bottom: 40px;
  /* 设置左右 */
  padding-left: 15px;
  padding-right: 15px;
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 1s ease-out forwards;
  color: white;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.teaching-button {
  position: absolute;
  top: 55%;
  left: 75%;
  width: 600px;
  /* 固定宽度 */
  transform: translate(-50%, -50%);
}

.teaching-button img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.teaching-button img:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5);
}

/* 每日名言样式 */
.daily-quote-container {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 800px;
}

.daily-quote {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0);
  border-radius: 16px;
  padding: 24px 32px;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 1.2s ease-out 0.5s forwards;
}

.quote-header {
  color: #FEFAE0;
  font-size: 1.1rem;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.refresh-quote-btn {
  background: rgba(235, 233, 227, 0.05);
  border: 1px solid rgba(219, 218, 210, 0);
  border-radius: 8px;
  padding: 4px 8px;
  color: #B1AB86;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.refresh-quote-btn:hover:not(:disabled) {
  background: rgba(235, 233, 227, 0.1);
  border-color: rgba(219, 218, 210, 0);
  transform: scale(1.05);
}

.refresh-quote-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.quote-text {
  color: white;
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 700px;
  margin: 0 auto;
  min-height: 1.6em; /* 防止加载时高度跳跃 */
}

.quote-text.loading {
  opacity: 0.7;
  font-style: normal;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .daily-quote-container {
    width: 95%;
    bottom: 20px;
  }
  
  .daily-quote {
    padding: 20px 24px;
  }
  
  .quote-text {
    font-size: 1rem;
  }
}
</style>
