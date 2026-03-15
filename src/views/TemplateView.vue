<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 text-center mb-3" v-if="loading">
        <div class="alert alert-light"><i class="fas fa-spinner rotation-animation"></i> Loading template…</div>
      </div>
      <div class="col-12 mb-3" v-else-if="template">
        <span class="h3">{{ template.title }}</span>
        <span class="float-end btn-group">
          <div class="btn btn-success" @click="create_doc" title="Create document from this template" v-if="template.id">
            <i class="fas fa-file-circle-plus"></i> Create Document
          </div>
          <div class="btn btn-primary" @click="save" :class="{ disabled: saving }">
            <i class="fas fa-save"></i> Save
          </div>
          <div class="btn btn-outline-danger" @click="go_back" v-if="!template.id">
            <i class="fas fa-times"></i> Cancel
          </div>
         <div class="btn btn-danger" @click="delete_template">
            <i class="fas fa-trash"></i> Delete
          </div>

        </span>
      </div>
    </div>

    <div class="row" v-if="template">
      <!-- Title -->
      <div class="col-lg-2 col-md-3 col-sm-12 fw-bold">Title</div>
      <div class="col-lg-10 col-md-9 col-sm-12 mb-3">
        <input v-model="template.title" class="form-control" placeholder="Template title" />
      </div>

      <!-- Structure Markdown -->
      <div class="col-lg-2 col-md-3 col-sm-12 fw-bold">Structure</div>
      <div class="col-lg-10 col-md-9 col-sm-12 mb-3">
        <textarea
          v-model="template.structure_markdown"
          class="form-control"
          rows="20"
          placeholder="Define the document structure in markdown…"
        ></textarea>
      </div>

      <!-- Sharing section (owner only) -->
      <!-- <div class="col-12 mb-2 fw-bold border-top pt-3" v-if="template.id">
        <i class="fas fa-share-alt"></i> Sharing
      </div>
      <div class="col-12 mb-3" v-if="template.id">
        <table class="table table-sm" v-if="template.shared_with && template.shared_with.length">
          <thead>
            <tr>
              <th>User</th>
              <th>Permission</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="share in template.shared_with" :key="share.user_id">
              <td>{{ share.user_id }}</td>
              <td>
                <select class="form-select form-select-sm" v-model="share.permission" @change="update_share(share)">
                  <option value="viewer">viewer</option>
                  <option value="editor">editor</option>
                </select>
              </td>
              <td class="text-end">
                <i class="fas fa-trash text-danger pointer" @click="remove_share(share.user_id)" title="Remove share"></i>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="input-group mt-2" style="max-width: 400px;">
          <input v-model="share_user_id" class="form-control" placeholder="Username to share with" />
          <select v-model="share_permission" class="form-select" style="max-width: 130px;">
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
          </select>
          <button class="btn btn-outline-secondary" @click="add_share">
            <i class="fas fa-plus"></i> Share
          </button>
        </div>
      </div> -->
    </div>
  </div>
</template>

<script>
import { do_delete, do_get, do_post, do_put } from '@/backend.js';
import { toastify_success } from '@/utils.js';

export default {
  name: 'TemplateView',
  data() {
    return {
      loading: false,
      saving: false,
      template: undefined,
      share_user_id: '',
      share_permission: 'viewer',
    };
  },
  async mounted() {
    const id = this.$route.params.id;
    if (id === 'new') {
      this.template = {
        title: 'New Template',
        owner: 'me',
        structure_markdown: '',
        shared_with: [],
      };
    } else {
      this.loading = true;
      await do_get(`/api/templates/${id}`, 'error fetching template', data => {
        this.template = data;
        this.loading = false;
      }, () => {
        this.loading = false;
      });
    }
  },
  methods: {
    save() {
      if (this.saving) return;
      this.saving = true;
      if (this.template.id) {
        do_put(`/api/templates/${this.template.id}`, this.template, 'error saving template', data => {
          this.template = data;
          toastify_success('Template saved');
          this.saving = false;
        }, () => {
          this.saving = false;
        });
      } else {
        do_post('/api/templates', this.template, 'error creating template', data => {
          this.template = data;
          toastify_success('Template created');
          this.saving = false;
          this.$router.replace('/templates/' + data.id);
        }, () => {
          this.saving = false;
        });
      }
    },
    go_back() {
      this.$router.push('/templates');
    },
    create_doc() {
      do_post(`/api/templates/${this.template.id}/create-document`, null, 'error creating document', doc => {
        toastify_success(`Document "${doc.title}" created`);
        this.$router.push('/doc/' + doc.id);
      });
    },
    delete_template() {
      if (!confirm(`Delete template "${this.template.title}"?`)) return;
      do_delete(`/api/templates/${this.template.id}`, null, 'error deleting template', () => {
        toastify_success('Template deleted');
        this.$router.push('/templates');
      });
    },
    add_share() {
      if (!this.share_user_id.trim()) return;
      do_post(`/api/templates/${this.template.id}/shares`, {
        user_id: this.share_user_id.trim(),
        permission: this.share_permission,
      }, 'error sharing template', data => {
        this.template = data;
        this.share_user_id = '';
        toastify_success('Template shared');
      });
    },
    update_share(share) {
      do_put(`/api/templates/${this.template.id}/shares/${share.user_id}`, {
        permission: share.permission,
      }, 'error updating share', data => {
        this.template = data;
        toastify_success('Share updated');
      });
    },
    remove_share(user_id) {
      if (!confirm(`Remove access for "${user_id}"?`)) return;
      do_delete(`/api/templates/${this.template.id}/shares/${user_id}`, null, 'error removing share', data => {
        this.template = data;
        toastify_success('Share removed');
      });
    },
  },
};
</script>

