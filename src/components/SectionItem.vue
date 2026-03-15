<template>
  <div :class="depth === 0 ? 'mb-2' : 'ms-3 mt-2'">
    <div>
      <!-- Header -->
      <hr/>
      <div >
        <div class="py-3">
          <span :class="'h' + (section.level +1)">{{ section.id}} {{ section.title }}</span>
          <span class="ms-2 float-end">
            <i class="fas fa-circle-notch fa-spin" v-if="section.status === 'generating'"></i>
            <i class="fas fa-check-double text-primary" v-else-if="section.status === 'accepted'"></i>
            <i class="fas fa-check text-primary" v-else-if="section.status === 'done'"></i>
          </span>
        </div>
      </div>

      <!-- Body -->
      <div>
        <div class="py-3">

          <div class="h4">Bullets</div>
          <!-- Bullet points -->
          <ul v-if="section.bullet_points && section.bullet_points.length" class="list-group mb-3">
            <li
              class="list-group-item"
              v-for="(bullet, i) in section.bullet_points"
              :key="i"
            >{{ bullet }}</li>
          </ul>

          <!-- Generated text -->
          <div v-if="section.generated_text" class="bg-light p-2 position-relative">
            <button
              class="btn btn-sm position-absolute top-0 end-0 m-1"
              title="Chat about this section"
              @click.prevent="chatOpen = !chatOpen"
            >
              <i class="fas fa-robot"></i>
            </button>
            <VueShowdown :markdown="section.generated_text" />
          </div>

          <!-- Hints -->
          <div class="mt-2">
            <div class="d-flex align-items-center mb-1" v-if="editingHints">
              <span class="fw-semibold me-2 small text-muted">Hints</span>
            </div>
            <textarea
              v-if="editingHints"
              v-model="section.hints"
              class="form-control form-control-sm"
              rows="3"
              placeholder="Add generation hints for this section…"
              @keydown.enter.prevent="editingHints = false"
            ></textarea>
            <div v-else-if="section.hints" class="text-muted small fst-italic border rounded p-1 bg-light"><span class="fw-bold">Hints:</span> {{ section.hints }}</div>
          </div>

          <!-- Actions -->
          <div class="d-flex justify-content-end mt-2">
            <div class="btn-group">
              <button
                  class="btn btn-sm btn-outline-secondary py-0 px-1"
                  @click.prevent="editingHints = !editingHints"
                  :title="editingHints ? 'Close hints editor' : 'Edit hints for this section'"
              >
                <i :class="editingHints ? 'fas fa-check' : 'fas fa-pencil-alt'">Hints</i>
              </button>
              <button
                class="btn btn-sm btn-outline-primary"
                v-if="section.status !== 'generating' && section.status !== 'accepted'"
                :disabled="running"
                @click.prevent="$emit('generate-section', section)"
                title="Generate content for this section"
              >
                <i class="fas fa-magic"></i> Generate
              </button>
              <button class="btn btn-sm btn-primary" v-if="section.status === 'done'" @click.prevent="$emit('accept-section', section)">
                <i class="fas fa-check"></i> Accept
              </button>
              <button
                class="btn btn-sm btn-danger"
                v-if="section.status === 'done' && section.generated_text"
                @click.prevent="$emit('empty-section', section)"
              >
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>

          <!-- Nested children (recursive) -->
          <div v-if="section.children && section.children.length" class="mt-3">
            <SectionItem
              v-for="(child, idx) in section.children"
              :key="child.id"
              :section="child"
              :depth="depth + 1"
              :initially-open="idx === 0"
              :running="running"
              @empty-section="$emit('empty-section', $event)"
              @accept-section="$emit('accept-section', $event)"
              @generate-section="$emit('generate-section', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueShowdown } from "vue-showdown";

export default {
  name: "SectionItem",
  components: { VueShowdown },
  props: {
    section: {
      type: Object,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    },
    initiallyOpen: {
      type: Boolean,
      default: false
    },
    running: {
      type: Boolean,
      default: false
    }
  },
  emits: ["empty-section", "accept-section", "generate-section"],
  data() {
    return {
      isOpen: this.initiallyOpen,
      chatOpen: false,
      editingHints: false
    };
  }
};
</script>

