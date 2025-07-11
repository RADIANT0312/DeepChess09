<template>
  <div class="login-page">
    <div class="form-container">
      <div class="logo">
        <img src="/sidebar-logo.svg" alt="DeepChess Logo" />
        <h1>DeepChess</h1>
      </div>
      <div v-if="isLogin">
        <h2>Login</h2>
        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="login-username">Username</label>
            <input id="login-username" v-model="loginForm.username" type="text" required />
          </div>
          <div class="form-group">
            <label for="login-password">Password</label>
            <input id="login-password" v-model="loginForm.password" type="password" required />
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
          <button type="submit" class="btn-primary">Login</button>
        </form>
        <p class="toggle-form">
          Don't have an account? <a @click="toggleForm">Register now</a>
        </p>
      </div>
      <div v-else>
        <h2>Register</h2>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="register-username">Username</label>
            <input id="register-username" v-model="registerForm.username" type="text" required />
          </div>
          <div class="form-group">
            <label for="register-password">Password</label>
            <input id="register-password" v-model="registerForm.password" type="password" required />
          </div>
           <div class="form-group">
            <label for="register-confirm-password">Confirm Password</label>
            <input id="register-confirm-password" v-model="registerForm.confirmPassword" type="password" required />
          </div>
          <div v-if="error" class="error-message">{{ error }}</div>
          <button type="submit" class="btn-primary">Register</button>
        </form>
        <p class="toggle-form">
          Already have an account? <a @click="toggleForm">Login now</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth } from '@/api';

const isLogin = ref(true);
const router = useRouter();

const loginForm = ref({
  username: '',
  password: '',
});

const registerForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
});

const error = ref('');

const toggleForm = () => {
  isLogin.value = !isLogin.value;
  error.value = '';
  loginForm.value = { username: '', password: '' };
  registerForm.value = { username: '', password: '', confirmPassword: '' };
};

const handleLogin = async () => {
  try {
    const response = await auth.login(loginForm.value);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
    router.push('/main');
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Login failed, perhaps the username or password is incorrect.';
  }
};

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Passwords do not match.';
    return;
  }
  try {
    // The API documentation does not specify a registration endpoint.
    // I will use a placeholder endpoint '/api/auth/register'.
    // This should be replaced with the actual endpoint when available.
    await auth.register({
      username: registerForm.value.username,
      password: registerForm.value.password,
    });
    // Automatically switch to login form after successful registration
    isLogin.value = true;
    error.value = 'Registration successful! Please log in.';
    loginForm.value.username = registerForm.value.username;
    loginForm.value.password = '';
  } catch (err) {
    error.value = err.response?.data?.error?.message || 'Registration failed, please try again.';
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form-container {
  background: #2b3722;
  padding: 2rem 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 400px;
  text-align: center;
}

.logo {
  margin-bottom: 1.5rem;
}

.logo img {
  height: 40px;
  margin-right: 10px;
  vertical-align: middle;
}

.logo h1 {
  display: inline;
  vertical-align: middle;
  font-size: 2rem;
  color: #eae5e5;
}

h2 {
  margin-bottom: 1.5rem;
  color: #ffffff;
  font-weight: 600;
}

.form-group {
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #e6e1e1;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #a1e18c;
  border-radius: 4px;
  box-sizing: border-box;
}

.btn-primary {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: rgb(255, 255, 255);
  font-size: 1.5rem;
  font-family: "Palatin Linotype", cursive;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 1rem;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.toggle-form {
  margin-top: 1.5rem;
  color: #fefefe;
}

.toggle-form a {
  color: #007bff;
  cursor: pointer;
  text-decoration: none;
}

.toggle-form a:hover {
  text-decoration: underline;
}

.error-message {
  color: red;
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>