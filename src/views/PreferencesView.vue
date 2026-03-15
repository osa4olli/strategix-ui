<template>
  <main class="container">
    <div class="row mt-3">
      <div class="col-12 mb-4">
        <span class="h3">Preferences</span>
      </div>
    </div>
    <div class="row" v-if="loading">
      <div class="col-12 text-center">
        <div class="alert alert-light" role="alert">
          Loading preferences <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    </div>
    <div class="row" v-else>
      <div class="col-lg-6 col-md-8 col-sm-12">
        <form @submit.prevent="save_preferences">
          <!-- Target Language -->
          <div class="mb-3 row">
            <label class="col-sm-4 col-form-label fw-bold">Target Language</label>
            <div class="col-sm-8">
              <input
                type="text"
                class="form-control"
                v-model="preferences.language"
                placeholder="e.g. English, German, French"
              />
            </div>
          </div>

          <!-- Temperature -->
          <div class="mb-3 row">
            <label class="col-sm-4 col-form-label fw-bold">Temperature</label>
            <div class="col-sm-8">
              <select class="form-select" v-model="preferences.temperature">
                <option v-for="t in temperatures" :key="t" :value="t">{{ t.toFixed(1) }}</option>
              </select>
            </div>
          </div>

          <!-- Length -->
          <div class="mb-3 row">
            <label class="col-sm-4 col-form-label fw-bold">Length</label>
            <div class="col-sm-8">
              <select class="form-select" v-model="preferences.length">
                <option v-for="l in lengths" :key="l" :value="l">{{ l }}</option>
              </select>
              <div class="text-center mt-1" v-if="lengths_loading">
                <i class="fas fa-spinner rotation-animation"></i>
              </div>
            </div>
          </div>

          <!-- Generator Model -->
          <div class="mb-3 row">
            <label class="col-sm-4 col-form-label fw-bold">Generator Model</label>
            <div class="col-sm-8">
              <select class="form-select" v-model="preferences.generator_model">
                <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
              </select>
              <div class="text-center mt-1" v-if="models_loading">
                <i class="fas fa-spinner rotation-animation"></i>
              </div>
            </div>
          </div>

          <!-- Reviewer Model -->
          <div class="mb-3 row">
            <label class="col-sm-4 col-form-label fw-bold">Reviewer Model</label>
            <div class="col-sm-8">
              <select class="form-select" v-model="preferences.reviewer_model">
                <option v-for="m in models" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>

          <!-- Actions -->
          <div class="mb-3 row">
            <div class="col-sm-8 offset-sm-4">
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <i class="fas fa-save me-1"></i>
                <span v-if="saving">Saving… <i class="fas fa-spinner rotation-animation"></i></span>
                <span v-else>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script>
import { do_get, do_put } from "@/backend.js";
import { toastify_success } from "@/utils.js";

export default {
  name: "PreferencesView",
  data() {
    return {
      loading: false,
      saving: false,
      preferences: {
        target_language: "",
        temperature: 0.7,
        length: "",
        generator_model: "",
        reviewer_model: ""
      },
      lengths: [],
      models: [],
      models_loading: false,
      temperatures: Array.from({ length: 11 }, (_, i) => parseFloat((i * 0.1).toFixed(1)))
    };
  },
  async mounted() {
    this.loading = true;

    await Promise.all([
      do_get("/api/preferences", "error loading preferences", data => {
        this.preferences = data;
      }, () => {
      }),
      do_get("/api/preferences/lengths", "error loading length options", data => {
        this.lengths = data;
      }),
      do_get("/api/preferences/models", "error loading model options", data => {
        this.models = data;
      }),
    ]);
    this.loading = false;
  },
  methods: {
    save_preferences() {
      this.saving = true;
      do_put("/api/preferences", this.preferences, "error saving preferences", () => {
        toastify_success("Preferences saved");
      }, () => {
        this.saving = false;
      });
    }
  }
};
</script>

