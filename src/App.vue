<template>
  <div class="app-container">
    <!-- Barra de navegación -->
    <header class="app-header">
      <button class="home-btn" @click="goToHome">Pokemon Social</button>
      
      <div class="spacer"></div>
      
      <!-- Botón de hamburguesa SOLO para móvil -->
      <button 
        v-if="isLoggedIn" 
        class="mobile-menu-btn" 
        @click="toggleMobileMenu"
      >
        ☰
      </button>
      
      <!-- Menú de escritorio SOLO para PC/Tablet -->
      <nav v-if="isLoggedIn" class="desktop-menu">
        <button @click="goToProfile" class="nav-btn">
          <span class="icon">👤</span>
          <span class="text">Ver Perfil</span>
        </button>
        
        <button @click="goToBroadcasts" class="nav-btn">
          <span class="icon">📡</span>
          <span class="text">Difusiones</span>
        </button>
        
        <button @click="logout" class="nav-btn">
          <span class="icon">🚪</span>
          <span class="text">Cerrar Sesión</span>
        </button>
      </nav>
      
      <!-- Botón de login cuando no hay sesión -->
      <button v-if="!isLoggedIn" @click="goToLogin" class="login-btn">
        <span class="icon">🔑</span>
        <span class="text">Ingresar</span>
      </button>
    </header>

    <!-- Menú móvil (solo visible en mobile) -->
    <div v-if="isLoggedIn && mobileMenuOpen" class="mobile-menu">
      <button @click="goToHome" class="mobile-menu-item">🏠 Inicio</button>
      <button @click="goToProfile" class="mobile-menu-item">👤 Ver Perfil</button>
      <button @click="goToBroadcasts" class="mobile-menu-item">📡 Difusiones</button>
      <button @click="logout" class="mobile-menu-item">🚪 Cerrar Sesión</button>
    </div>

    <!-- Contenido principal -->
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import { useUserStore } from '@/stores';

export default {
  data() {
    return {
      mobileMenuOpen: false,
      windowWidth: window.innerWidth
    };
  },
  computed: {
    isLoggedIn() {
      const userStore = useUserStore();
      return !!userStore.username;
    },
  },
  created() {
    this.loadUserFromLocalStorage();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.windowWidth = window.innerWidth;
      // Cerrar menú móvil si se cambia a pantalla grande
      if (this.windowWidth > 768) {
        this.mobileMenuOpen = false;
      }
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen;
    },
    goToHome() {
      this.$router.push('/home');
      this.mobileMenuOpen = false;
    },
    goToLogin() {
      this.$router.push('/');
    },
    goToProfile() {
      this.$router.push('/profile');
      this.mobileMenuOpen = false;
    },
    goToBroadcasts() {
      this.$router.push('/diffusions');
      this.mobileMenuOpen = false;
    },
    logout() {
      const userStore = useUserStore();
      userStore.setUser('', '');
      localStorage.removeItem('user');
      this.$router.push('/');
      this.mobileMenuOpen = false;
    },
    loadUserFromLocalStorage() {
      const userStore = useUserStore();
      userStore.loadUserFromLocalStorage();
    },
  },
};
</script>

<style scoped>
/* Estilos base */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color:rgb(239, 221, 61);
  position: relative;
  z-index: 100;
}

.spacer {
  flex-grow: 1;
}

.home-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  font-weight: bold;
  cursor: pointer;
  padding: 0.5rem;
}

/* Menú de escritorio - visible solo en PC/Tablet */
.desktop-menu {
  display: none;
}

.nav-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  margin-left: 1rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.nav-btn .icon {
  margin-right: 0.5rem;
}

.login-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.login-btn .icon {
  margin-right: 0.5rem;
}

/* Botón de menú móvil - visible solo en mobile */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

/* Menú móvil */
.mobile-menu {
  top: 100%;
  left: 0;
  right: 0;
  background-color:rgb(239, 221, 61);
  z-index: 99;
  display: flex;
  flex-direction: column;
}

.mobile-menu-item {
  padding: 1rem;
  background: none;
  border: none;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
}

.mobile-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

/* Contenido principal */
.main-content {
  flex: 1;
  padding: 1rem;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
  /* Mostrar botón de hamburguesa en mobile */
  .mobile-menu-btn {
    display: block;
  }
  
  /* Ocultar menú de escritorio en mobile */
  .desktop-menu {
    display: none !important;
  }
  
  /* Ocultar texto en botón de login en mobile */
  .login-btn .text {
    display: none;
  }
}

@media (min-width: 769px) {
  /* Mostrar menú de escritorio en PC/Tablet */
  .desktop-menu {
    display: flex;
  }
  
  /* Ocultar menú móvil en PC/Tablet */
  .mobile-menu {
    display: none !important;
  }
}
</style>