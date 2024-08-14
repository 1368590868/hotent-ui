<template>
  <draggable
    v-model="dataVal"
    class="file-list__wrap"
    tag="ul"
    v-bind="dragOptions"
    handle=".handle"
    @start="isDragging = true"
    @end="isDragging = false"
  >
    <transition-group type="transition" name="flip-list">
      <li
        v-for="file in dataVal"
        :key="file.uid"
        :class="[
          'file-item',
          'el-upload-list__item',
          {
            'is-success': file.status == 'success',
            'is-uploading': file.status == 'uploading',
          },
        ]"
      >
        <ht-icon v-if="sortable && inputWriteable" name="sort" class="handle" />
        <ht-icon name="file" class="file_icon" />
        <p
          class="file__name"
          :class="{ 'done-subject': previewable }"
          :title="file.name"
          @click="$emit('preview', file)"
        >
          {{ file.name || (file.response && file.response.fileName) }}
        </p>
        <el-progress
          v-if="file.status == 'uploading'"
          class="el-progress--line"
          :stroke-width="4"
          :percentage="Math.floor(file.percentage)"
        />
        <ht-icon
          v-if="downloadable && file.status == 'success'"
          class="file-hover__icon"
          name="arrow"
          scale="0.9"
          :title="t('ht.file.download')"
          @click="$emit('download', file)"
        />
        <el-popconfirm
          v-if="inputWriteable"
          :title="$t('ht.file.confirmDelete')"
          @confirm="$emit('remove', file)"
        >
          <ht-icon
            slot="reference"
            name="close"
            class="file-hover__icon"
            :title="t('ht.common.remove')"
          />
        </el-popconfirm>
      </li>
    </transition-group>
  </draggable>
</template>
<script>
  import Locale from '@/mixins/locale'
  const draggable = require('vuedraggable')

  export default {
    name: 'FileList',
    components: { draggable },
    mixins: [Locale],
    props: {
      data: {
        type: Array,
      },
      previewable: {
        type: Boolean,
        default: true,
      },
      inputWriteable: {
        type: Boolean,
        default: true,
      },
      downloadable: {
        type: Boolean,
        default: true,
      },
      sortable: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        isDragging: false,
      }
    },
    computed: {
      dataVal: {
        get() {
          return this.data
        },
        set(val) {
          // 只有在拖拽排序时才通过inputVal对value进行更新
          if (this.isDragging && val.constructor == Array && val.length > 0) {
            this.$emit('sort', val)
          }
        },
      },
      dragOptions() {
        return {
          animation: 0,
          group: 'description',
          disabled: false,
          ghostClass: 'ghost',
        }
      },
    },
  }
</script>
<style lang="scss" scoped>
  .flip-list-move {
    transition: transform 0.5s;
  }

  .file-list__wrap {
    list-style: none;
    width: 100%;
    padding-left: 0;
    .file-item {
      padding: 0 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .el-progress--line {
        width: calc(100% - 10px);
      }

      .file__name {
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: calc(100% - 60px);
        margin: 0;
      }

      &:hover {
        .file-hover__icon {
          visibility: visible;
        }
        .file__name {
          color: $base-color-blue;
          cursor: pointer;
        }
        .handle {
          display: initial;
          position: relative;
          width: 16px;
          height: 16px;
          background: #f5f7fa;
          border: none;
        }
        .handle + .file_icon {
          display: none;
        }
      }
      svg {
        margin-right: 5px;
      }
      .handle {
        display: none;
        cursor: move;
      }
      .file-hover__icon {
        visibility: hidden;
      }
      .file-hover__icon:hover {
        color: $base-color-blue;
        cursor: pointer;
      }
    }
  }
</style>
