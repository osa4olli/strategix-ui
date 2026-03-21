<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12 text-center mb-3" v-if="loading">
        <div class="alert alert-light" role="alert">loading document <i class="fas fa-spinner rotation-animation"></i></div>
        </div>
      <div class="col-12 text-center mb-3" v-else>
        <span class="h3">{{ title }}</span>
      </div>
      </div>
    <div class="row"  v-if="doc">
      <div class="col-12">
        <div class="nav nav-tabs">
          <div class="nav-item">
            <span :class="'nav-link ' + (tab == 'structure' ? 'active' : 'pointer')" aria-current="page" @click="tab = 'structure'">Structure</span>
          </div>
          <div class="nav-item">
            <a :class="'nav-link ' + (tab == 'content' ? 'active' : 'pointer')" aria-current="page" @click="tab = 'content'">Content</a>
          </div>
          <div class="nav-item">
            <a :class="'nav-link ' + (tab == 'preview' ? 'active' : 'pointer')" aria-current="page" @click="tab = 'preview'">Preview</a>
          </div>
        </div>
      </div>
      <div class="col-12" v-if="tab === 'structure'">
        <div class="row mt-3">
          <div class="col-12">
          <span class="float-end"><span class="fas fa-spinner fa-spin" v-if="running"></span>
          </span>
          </div>
          <div class="col-lg-4 col-md-4 col-sm-12 col-12">
            <span class="fw-bold">Document Context</span>
          </div>
          <div class="col-lg-8 col-md-8 col-sm-12 col-12">
            <textarea v-model="doc.context" v-if="doc.structure_accepted" class="form-control-plaintext" readonly placeholder="provide some additonal document context if necessary"></textarea>
            <textarea v-model="doc.context" v-else class="form-control" rows="5" placeholder="provide some additonal document context if necessary"></textarea>
          </div>
        </div>
        <div class="row my-3">
          <div class="col-lg-12 col-md-12 col-sm-12 col-12">
            <vue-showdown :markdown="structure_input" v-if="doc.structure_accepted"> </vue-showdown>
            <textarea v-model="structure_input" v-else class="form-control" rows="25" placeholder="no structure defined start defining one" @input="doc.status = 'draft'"></textarea>
            <div v-if="structure_feedback" class="alert alert-secondary alert-dismissible">{{ structure_feedback }}</div>
            <span class="float-end btn-group" v-if="structure_input">
              <div class="btn btn-primary" @click="update_structure" v-if="!doc.id">Create</div>
              <div class="btn btn-primary" @click="update_structure" v-if="doc.id && doc.status === 'draft'">Update</div>
              <div class="btn btn-secondary" @click="review_structure" v-if="!doc.id || doc.status=== 'draft' || doc.status === 'structure_review'">Review</div>
              <div class="btn btn-success" @click="accept_structure" v-if="doc.status === 'structure_review'">Accept</div>
              <div class="btn btn-danger" @click="revoke_structure" v-if="doc.status === 'structure_accepted' || doc.status === 'complete'">Revoke</div>
            </span>
          </div>
        </div>
      </div>
      <div class="col-12" v-if="tab === 'content'">
        <div class="row">
          <div class="col-12 py-3">
            <span class="fst-italic" v-if="running">
            {{ current_generating_section }}
            </span>
            <i class="ms-3 fas fa-spinner fa-spin"  v-if="running">
            </i>
            <span class="float-end btn-group">
              <div :class="'btn btn-primary ' + (running ? 'disabled' : '')" @click="generate_content" v-if="!(doc.status == 'draft' || doc.status == 'structure_review')"><i class="fas fa-edit"></i> Generate content</div>
              <div :class="'btn btn-danger'" @click="clear_all_sections" v-if="!running"><i class="fas fa-trash"></i> Clear Content</div>
              <!-- <div class="btn btn-danger" @click="cancel_generate" v-if="running">Cancel</div> -->
            </span>
          </div>
          <div class="row" v-if="doc.structure">
            <div class="col-12">
              <SectionItem
                v-for="(section, idx) in doc.structure.sections"
                :key="section.id"
                :section="section"
                :depth="0"
                :initially-open="idx === 0"
                :running="running"
                @empty-section="empty_section"
                @accept-section="accept_section"
                @generate-section="generate_single_section"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 p-4" v-if="tab === 'preview'">
        <div><span class="float-end btn-group">
          <a class="btn btn-primary fas fa-file-word" :href="'/api/documents/'+doc.id+'/export'"></a>
          </span>
        </div>
        <vue-showdown :markdown="generated_text"></vue-showdown>
      </div>
    </div>
  </div>
</template>

<script>
import {do_delete, do_get, do_post, do_put} from "@/backend.js";
import {toastify_error, toastify_success} from "@/utils.js";
import {VueShowdown} from "vue-showdown";
import SectionItem from "@/components/SectionItem.vue";

export default {
  name: "DocumentView",
  components: {
    VueShowdown,
    SectionItem
  },
  data() {
    return {
      running: false,
      loading: false,
      tab: undefined,
      structure_feedback: undefined,
      structure_input: "",
      doc: undefined,
      job: undefined,
      chat: [],
      input: '',
      pollInterval: undefined,
    }
  },
  watch: {
    job(newJob) {
      if (newJob) {
        this.startJobPolling();
      } else {
        clearInterval(this.pollInterval);
        this.pollInterval = undefined;
      }
    }
  },
  beforeUnmount() {
    clearInterval(this.pollInterval);
  },
  computed: {
    title() {
      return this.doc && this.doc.title ? this.doc.title : "no document provided"
    },
    generated_text() {
      if (!this.doc || !this.doc.structure) return '';
      let text = '# ' + this.doc.title + '\n\n';
      const appendSectionText = (section, depth) => {
        //text += `${'#'.repeat(depth + 1)} ${section.title}\n\n`;
        if (section.generated_text) {
          text += section.generated_text + '\n\n';
        }
        if (section.children) {
          section.children.forEach(child => appendSectionText(child, depth + 1));
        }
      };
      this.doc.structure.sections.forEach(section => appendSectionText(section, 0));
      return text;
    },
    current_generating_section() {
      if(this.job && this.job.action) {
        return `Current action: Generating section ${this.job.action}`;
      }
    }
  },
  async mounted() {
    var id = this.$route.params.id;
    if(id === 'new') {
      this.doc = {
        title: 'new document',
        status: 'draft',
        owner: 'me',
        structure: undefined
      }
    }
    else {
      this.loading = true;
      await do_get('/api/documents/' + id, 'error fetching document', data => {
        this.doc = data;
        this.structure_input = this.doc.structure_markdown || '';
        this.loading = false;
      }, () => {
        this.loading = false;
      });
      await do_get('/api/jobs/document/' + id, '', data => {
        if(data && data.length>0) {
          this.job = data[0];
          this.running = this.job.status === 'running' || this.job.status === 'pending';
        }
        else {
          this.running = false;
        }
      });

    }
    if(this.doc.status === 'draft') {
      this.tab = 'structure';
    } else if (this.doc.status === 'structure_review') {
      this.tab = 'structure';
    } else if (this.doc.status === 'structure_accepted') {
      this.tab = 'content';
    } else if (this.doc.status === 'generating') {
      this.tab = 'content';
    } else if (this.doc.status === 'complete') {
      this.tab = 'preview';
    } else {
      this.tab = 'structure';
    }
  },
  methods: {
    review_structure(evt) {
      evt.preventDefault();
      this.running = true;
      var obj = {
        markdown: this.structure_input,
        context: this.doc.context
      }
      do_post('/api/documents/review-structure', obj, 'error reviewing structure', data => {
        this.doc.structure = data.structure;
        this.structure_input = data.suggested_markdown;
        this.doc.status = 'structure_review';
        this.structure_feedback = data.suggestions;
        this.doc.structure_markdown = this.structure_input;
        toastify_success('Structure reviewed successfully');
      }, () => {
        this.running = false;
      });
    },
    update_structure(evt) {
      evt.preventDefault();
      if (this.doc.id) {
        var obj = {
          markdown: this.structure_input,
          context: this.doc.context
        }
        do_put(`/api/documents/${this.doc.id}/structure`, obj, 'error saving document', response => {
          this.doc = response;
          this.doc.status = 'structure_review';
          this.doc.structure_markdown = this.structure_input
          toastify_success('Document saved successfully');
        });
      } else {
        this.doc.structure_markdown = this.structure_input;
        do_post(`/api/documents`, this.doc, 'error saving document', response => {
          this.doc = response;
          this.doc.status = 'structure_review';
          this.tab = 'content';
        });
      }
    },
    empty_section(section) {
      do_delete(`/api/documents/${this.doc.id}/sections/${section.id}/content`, null, 'error deleting section content', () => {
        section.generated_text = undefined;
        section.status = 'empty';
        toastify_success('Section content removed');
      });
    },
    accept_section(section) {
      do_post(`/api/documents/${this.doc.id}/sections/${section.id}/accept`, null, 'error accepting section ' + section.title, () => {
        section.status = 'accepted';
        toastify_success('Section accepted');
      });
    },
    revoke_structure(evt) {
      evt.preventDefault();
      if(!confirm('Are you sure you want to revoke structure acceptance? This will move the document back to structure review status and allow you to edit the structure again.')) return;
      do_post(`/api/documents/${this.doc.id}/revoke-structure`, null, 'error revoking structure acceptance', doc => {
        this.doc = doc;
        this.structure_input = this.doc.structure_markdown || '';
        this.doc.status = 'structure_review';
        toastify_success('Document structure acceptance revoked');
      })
    },
    accept_structure(evt) {
      evt.preventDefault();
      do_post(`/api/documents/${this.doc.id}/accept-structure`, null, 'error reviewing structure', doc => {
        this.doc = doc;
        this.doc.status = 'structure_accepted';
        toastify_success('Document structure accepted');
      })
    },
    async generate_single_section(section) {
      if (this.running) return;
      this.running = true;
      this.cancelled = false;
      try {
        section.status = 'generating';
        await do_post(`/api/documents/${this.doc.id}/sections/${section.id}/generate`, null, 'error generating content for section ' + section.title, response => {
          section.generated_text = response.generated_text;
          section.status = 'done';
          toastify_success('Content generated for: ' + section.title);
        });
      } catch (e) {
        toastify_error('error generating content for section ' + section.title + '\n' + e.message);
        section.status = 'empty';
      } finally {
        this.running = false;
        this.cancelled = false;
      }
    },
    cancel_generate() {
      this.cancelled = true;
    },
    async generate_section(section) {
      if (this.cancelled) return;
      if (section.generated_text) {
        console.log("skipping generated text for section " + section.title);
      } else {
        console.log("generating content for section " + section);
        section.status = 'generating';
        await do_post(`/api/documents/${this.doc.id}/sections/${section.id}/generate`, null, 'error generating content for section ' + section.title, response => {
          section.generated_text = response.generated_text;
          section.status = 'done';
        });
      }
      if (section.children) {
        for (var idx in section.children) {
          if (this.cancelled) return;
          await this.generate_section(section.children[idx]);
        }
      }
    },
    async generate_content() {
      this.running = true;
      this.cancelled = false;
      try {
        for (var idx in this.doc.structure.sections) {
          if (this.cancelled) break;
          try {
            await this.generate_section(this.doc.structure.sections[idx]);
          } catch (e) {
            toastify_error('error generating content for section ' + section.title + '\n' + e.message);
            console.error("error generating content for section " + section.title, e);
          }
        }
      } catch (e) {
        toastify_error('error generating content for document\n' + e.message);
        console.error("error generating content for document", e);
      } finally {
        this.running = false;
        this.cancelled = false;
      }
    },
    findGeneratingSection(sections) {
      for (const section of sections) {
        if (section.status === 'generating') {
          return section;
        }
        if (section.children) {
          const generatingChild = this.findGeneratingSection(section.children);
          if (generatingChild) {
            return generatingChild;
          }
        }
      }
      return null;
    }
  }
}
</script>

