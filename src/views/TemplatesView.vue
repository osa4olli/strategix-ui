<template>
  <main class="container">
    <div class="row mb-3">
      <div class="col-12">
        <span class="float-end btn-group">
          <div class="btn btn-outline-secondary" @click="new_template"><i class="fas fa-plus"></i> New Template</div>
        </span>
        <span class="h3">Templates</span>
      </div>
    </div>
    <div class="row" v-if="loading">
      <div class="col-12 text-center">
        <div class="alert alert-light"><i class="fas fa-spinner rotation-animation"></i> Loading templates…</div>
      </div>
    </div>
    <table class="table table-striped" v-else-if="templates && templates.length">
      <thead>
        <tr>
          <th>Title</th>
          <th>Owner</th>
          <th>Shared with</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tmpl in templates" :key="tmpl.id">
          <td>
            <RouterLink :to="'/templates/' + tmpl.id">{{ tmpl.title }}</RouterLink>
          </td>
          <td>{{ tmpl.owner }}</td>
          <td>
            <span v-for="s in tmpl.shared_with" :key="s.user_id" class="badge bg-secondary me-1">
              {{ s.user_id }} ({{ s.permission }})
            </span>
          </td>
          <td class="text-end">
            <span class="btn-group">
              <i class="fas fa-file-circle-plus text-primary pointer me-3" @click="create_doc(tmpl)" title="Create document from template"></i>
              <i class="fas fa-trash text-danger pointer" @click="delete_template(tmpl)" title="Delete template"></i>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="alert alert-secondary" v-else>No templates yet. Create your first one!</div>
  </main>
</template>

<script>
import { do_delete, do_get, do_post } from '@/backend.js';
import { toastify_success } from '@/utils.js';

export default {
  name: 'TemplatesView',
  data() {
    return {
      templates: [],
      loading: false,
    };
  },
  mounted() {
    this.load_templates();
  },
  methods: {
    load_templates() {
      this.loading = true;
      do_get('/api/templates', 'error fetching templates', data => {
        this.templates = data;
        this.loading = false;
      }, () => {
        this.loading = false;
      });
    },
    new_template() {
      this.$router.push('/templates/new');
    },
    delete_template(tmpl) {
      if (!confirm(`Delete template "${tmpl.title}"?`)) return;
      do_delete(`/api/templates/${tmpl.id}`, null, 'error deleting template', () => {
        toastify_success('Template deleted');
        this.load_templates();
      });
    },
    create_doc(tmpl) {
      do_post(`/api/templates/${tmpl.id}/create-document`, null, 'error creating document from template', doc => {
        toastify_success(`Document "${doc.title}" created`);
        this.$router.push('/doc/' + doc.id);
      });
    },
  },
};
</script>

