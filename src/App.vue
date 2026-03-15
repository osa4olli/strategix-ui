<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-expand-md bg-navbar">
      <div class="container-fluid">
        <router-link class="navbar-brand text-white" to="/" data-toggle="tooltip" data-placement="top" title="Back to Landing Page">Strategix AI</router-link>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
            </li>
            <li class="nav-item">
            </li>
            <li class="nav-item">
            </li>
            <li class="nav-item">
            </li>
            <li class="nav-item d-lg-block d-md-block d-sm-none d-none">
              <RouterLink class="nav-link text-white" to="/templates">Templates</RouterLink>
            </li>
            <li class="nav-item d-lg-block d-md-block d-sm-none d-none">
              <RouterLink class="nav-link text-white" to="/preferences">Preferences</RouterLink>
            </li>
            <li class="nav-item d-lg-block d-md-block d-sm-none d-none">
              <RouterLink class="nav-link text-white" to="/about">About</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <router-view class="container mt-3"/>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import {do_get} from "@/backend.js";

export default {
  name: 'App',
  components: {
    RouterLink,
    RouterView
  },
  data() {
    return {
      user: null,
      logouturl: '/logout'
    }
  },
  mounted() {
    // Fetch user info from an API or session
    this.fetchUser();
  },
  methods: {
    fetchUser() {
      // Placeholder for fetching user data
      // In a real application, replace this with an actual API call
      do_get('/api/users/me', 'error fetching user info', data => {
        this.user = data;
      });
    }
  }
}
</script>

<style>
.pointer {
  cursor: pointer
}

.modal {
  background: rgba(0, 0, 0, 0.6);
  display: block;
}

.modal-dialog {
  max-width: 80%;
}

.modal-content {
  width: 100%;
}

.modal-body {
  max-height: 700px;
  overflow-y: scroll;
}

.bg-navbar {
  background-color: #001d35 !important;
}

a {
  text-decoration: none !important;
}

a:hover {
  text-decoration: none !important;
}

.required {
  color: red;
}

@keyframes div-rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes div-rotate {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

</style>
