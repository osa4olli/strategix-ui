<template>
  <main class="container">
    <div class="row">
      <div class="col-12">
        <span class="float-end"><div class="btn btn-outline-secondary" @click="new_doc">new Document</div></span>
      </div>
    </div>
    <table class="table table-striped" v-if="documents">
      <thead>
        <tr>
          <td>Title</td>
          <td>Owner</td>
          <td>Status</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.id">
          <td><RouterLink :to="'/doc/' + doc.id">{{ doc.title }}</RouterLink></td>
          <td>{{ doc.owner }}</td>
          <td>{{ doc.status }}</td>
          <td class="text-end">
            <i class="fas fa-trash text-danger pointer" @click="delete_doc(doc)" title="Delete document"></i>
          </td>
        </tr>
      </tbody>
    </table>

  </main>
</template>

<script>
import {do_delete, do_get} from "@/backend.js";

export default {
  name: 'HomeView',
  data() {
    return {
      documents: undefined
    }
  },
  mounted() {
    this.load_documents()
  },
  methods: {
    load_documents() {
      do_get('/api/documents','error fetching documents', data => {
        this.documents = data;
      });
    },
    new_doc() {
      this.$router.push('/doc/new');
    },
    delete_doc(doc) {
      if (!confirm(`Delete "${doc.title}"?`)) return;
      do_delete(`/api/documents/${doc.id}`, null, 'error deleting document', () => {
        this.load_documents();
      });
    }
  }
}
</script>
