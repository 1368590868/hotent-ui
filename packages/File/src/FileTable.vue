<template>
  <el-table
    :data="data"
    row-key="uid"
    border
    class="file__upload-table"
    :size="size"
  >
    <el-table-column
      :label="$t('ht.common.index')"
      align="center"
      type="index"
      width="50"
    ></el-table-column>
    <el-table-column
      :label="$t('ht.file.fileName')"
      min-width="150"
      align="center"
    >
      <template slot-scope="scope">
        <span
          :class="{ 'done-subject': previewable }"
          @click="$emit('preview', scope.row)"
        >
          {{
            scope.row.name ||
              (scope.row.response && scope.row.response.fileName)
          }}
        </span>
      </template>
    </el-table-column>
    <el-table-column
      v-if="calColumnShow.fileType"
      prop="type"
      align="center"
      lalign="center"
      width="100"
      :label="$t('ht.file.fileType')"
    ></el-table-column>
    <el-table-column
      v-if="calColumnShow.fileSize"
      align="center"
      lalign="center"
      width="100"
      :label="$t('ht.file.fileSize')"
    >
      <template slot-scope="scope">
        {{ scope.row.size | computerSize }}
      </template>
    </el-table-column>
    <el-table-column
      align="center"
      :label="$t('ht.file.uploader')"
      width="120"
      prop="username"
    ></el-table-column>
    <el-table-column
      v-if="inputWriteable"
      align="center"
      :label="$t('ht.common.status')"
      width="80"
    >
      <template slot-scope="scope">
        <el-progress
          type="circle"
          :width="25"
          :stroke-width="2"
          :percentage="scope.row.percentage"
          :status="getProgressStatus(scope.row.state)"
        ></el-progress>
      </template>
    </el-table-column>
    <el-table-column
      v-for="con in propConfList"
      :key="con.name"
      :prop="con.name"
      :label="con.desc"
      width="200"
      align="center"
    >
      <template slot-scope="scope">
        <ht-input
          v-model="data[scope.$index][con.name]"
          :name="con.desc"
          :permission="
            permission == 'w' || permission == 'b'
              ? con.requried
                ? 'b'
                : 'w'
              : permission
          "
        ></ht-input>
      </template>
    </el-table-column>
    <el-table-column
      v-if="inputWriteable || downloadable"
      align="center"
      :label="$t('ht.common.operation')"
      :width="operateWidth"
    >
      <template slot-scope="scope">
        <el-button
          v-if="sortable && inputWriteable"
          size="small"
          icon="el-icon-arrow-up"
          plain
          @click="$emit('move', scope.row, 'up')"
        ></el-button>
        <el-button
          v-if="sortable && inputWriteable"
          size="small"
          icon="el-icon-arrow-down"
          plain
          @click="$emit('move', scope.row, 'down')"
        ></el-button>
        <el-button
          v-if="downloadable"
          :disabled="scope.row.status !== 'success'"
          size="small"
          icon="el-icon-download"
          plain
          @click="$emit('download', scope.row)"
        ></el-button>
        <el-popconfirm
          v-if="inputWriteable"
          class="table-delete__button"
          :title="$t('ht.file.confirmDelete')"
          @confirm="$emit('remove', scope.row)"
        >
          <el-button
            slot="reference"
            plain
            type="danger"
            size="small"
            icon="el-icon-delete"
          ></el-button>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
</template>
<script>
  import Locale from '@/mixins/locale'

  export default {
    name: 'FileTable',
    mixins: [Locale],
    props: {
      data: {
        type: Array,
      },
      size: {
        type: String,
        default: 'small',
        validator: function(value) {
          return ['medium', 'small', 'mini'].indexOf(value) !== -1
        },
      },
      permission: {
        type: String,
        default: 'w',
        validator: function(value) {
          return ['b', 'w', 'r', 'n'].indexOf(value) !== -1
        },
      },
      previewable: {
        type: Boolean,
        default: true,
      },
      columnShow: {
        type: Object,
      },
      propConf: [Array, String],
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
    computed: {
      operateWidth() {
        return !this.inputWriteable ? '70' : this.sortable ? '260' : '130'
      },
      calColumnShow: function() {
        let defaultSetting = { fileType: true, fileSize: true }
        return { ...defaultSetting, ...this.columnShow }
      },

      propConfList() {
        const filePropConf =
          typeof this.propConf === 'string' && this.propConf
            ? JSON.parse(this.propConf)
            : this.propConf
        return (filePropConf && filePropConf.filter((item) => item.desc)) || []
      },
    },
    methods: {
      //附件状态转换为progress的状态
      getProgressStatus(status) {
        return status == 'success'
          ? 'success'
          : status == 'fail'
          ? 'exception'
          : 'warning'
      },
    },
  }
</script>
<style lang="scss" scoped>
  .file__upload-table {
    .el-button + .table-delete__button {
      margin-left: 10px;
    }

    .done-subject {
      cursor: pointer;
    }

    .done-subject:hover {
      color: $base-color-blue;
    }
  }
</style>
