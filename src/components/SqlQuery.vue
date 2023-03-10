<template>
  <div class="app-container">

    <el-descriptions title="数据库连接"></el-descriptions>
    <el-row>
      <el-form :inline="true" :model="databaseConnectParam" :rules="databaseConnectRules" ref="databaseConnectParam"
        class="demo-form-inline">
        <el-form-item label="Host">
          <el-input v-model="databaseConnectParam.host" prop="host" placeholder="Host" clearable size="small" />
        </el-form-item>
        <el-form-item label="Port">
          <el-input v-model="databaseConnectParam.port" prop="port" placeholder="Port" clearable size="small" />
        </el-form-item>
        <el-form-item label="Database">
          <el-input v-model="databaseConnectParam.database" prop="database" placeholder="Database" clearable
            size="small" />
        </el-form-item>
        <el-form-item label="User">
          <el-input v-model="databaseConnectParam.user" prop="user" placeholder="User" clearable size="small" />
        </el-form-item>
        <el-form-item label="Password">
          <el-input v-model="databaseConnectParam.password" prop="password" placeholder="Password" clearable size="small"
            type="password" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="connectDatabase" size="small">Connect</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-descriptions title="选择数据表"></el-descriptions>
    <el-row>
      <el-form :inline="true" class="demo-form-inline">
        <el-form-item label="Table">
          <el-select v-model="tableName" class="m-2" placeholder="tableName" clearable size="small" @change="getColumns">
            <el-tooltip v-for="(item, index) in tables" :key="index" class="box-item" effect="dark"
              :content=item.tableDesc placement="right">
              <el-option :label="item.tableName" :value="item.tableName" />
            </el-tooltip>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="getList" size="small"
            :disabled="tableName === undefined || tableName === ''">Query</el-button>
        </el-form-item>
      </el-form>
    </el-row>

    <el-descriptions title="筛选数据条件"></el-descriptions>
    <el-row>
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
        <el-tab-pane label="Filter" name="first">
          <el-row v-for="(item, index) in filters" :key="index" :inline="true"
            style="padding-top: 2px;padding-bottom: 2px;">
            <el-select v-model="item.column" class="m-2" placeholder="filed"
              style="width: 100px;padding-left: 2px;padding-right: 2px;" clearable size="small">
              <el-tooltip v-for="(item, index) in columns" :key="index" class="box-item" effect="dark"
                :content=item.columnDesc placement="right">
                <el-option :label="item.columnName" :value="item.columnName" />
              </el-tooltip>
            </el-select>
            <el-select v-model="item.operate" class="m-2" placeholder="operate"
              style="width: 100px;padding-left: 2px;padding-right: 2px;" clearable size="small">
              <el-option v-for="(item, index) in whereOperates" :key="index" :label="item" :value="item" />
            </el-select>
            <el-input v-model="item.value" placeholder="value" style="width: 100px;padding-left: 2px;padding-right: 2px;"
              clearable size="small"></el-input>
            <el-select v-if="index != filters.length - 1" v-model="item.connect" class="m-2" placeholder="connect"
              style="width: 100px;padding-left: 2px;padding-right: 2px;" clearable size="small">
              <el-option v-for="(item, index) in whereConnect" :key="index" :label="item" :value="item" />
            </el-select>
            <el-button type="info" size="small" @click="removeFilter(index)">-</el-button>
            <span style="margin-left: 3px;color: grey;">click '-' to remove filter info</span>
          </el-row>
          <el-row>
            <el-button type="info" size="small" @click="addFilter">+</el-button>
            <span style="margin-left: 3px;color: grey;">click '+' to add filter info</span>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="Sort" name="second">
          <el-row v-for="(item, index) in sorts" :key="index" :inline="true"
            style="padding-top: 2px;padding-bottom: 2px;">
            <el-select v-model="item.column" class="m-2" placeholder="filed"
              style="width: 100px;padding-left: 2px;padding-right: 2px;" clearable size="small">
              <el-tooltip v-for="(item, index) in columns" :key="index" class="box-item" effect="dark"
                :content=item.columnDesc placement="right">
                <el-option :label="item.columnName" :value="item.columnName" />
              </el-tooltip>
            </el-select>
            <el-select v-model="item.operate" class="m-2" placeholder="operate"
              style="width: 100px;padding-left: 2px;padding-right: 2px;" clearable size="small">
              <el-option v-for="(item, index) in sortOperates" :key="index" :label="item" :value="item" />
            </el-select>
            <el-button type="info" size="small" @click="removeSort(index)">-</el-button>
            <span style="margin-left: 3px;color: grey;">click '-' to remove sort info</span>
          </el-row>
          <el-row>
            <el-button type="info" size="small" @click="addSort">+</el-button>
            <span style="margin-left: 3px;color: grey;">click '+' to add sort info</span>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-row>

    <el-descriptions title="数据展示"></el-descriptions>
    <el-row>
      <el-table :data="dataList">
        <el-table-column v-for="(item, index) in columns" :key="index" :label=item.columnName :align="center"
          :prop=item.columnName :show-overflow-tooltip="true" />
      </el-table>

      <el-pagination background layout="total, prev, pager, next" :total="total"
        v-model:current-page="dataListQueryParam.page" v-model:page-size="dataListQueryParam.pageSize"
        @current-change="getList" />
    </el-row>
  </div>
</template>

<script>
import { ElMessage } from 'element-plus'

export default {
  name: 'SqlQuery',
  data() {
    return {
      // 静态枚举
      whereOperates: [
        "=",
        "!=",
        "<",
        "<=",
        ">",
        ">="
      ],
      whereConnect: [
        "and",
        "or"
      ],
      sortOperates: [
        "asc",
        "desc"
      ],
      // 搜索参数
      databaseConnectParam: {
        host: undefined,
        port: undefined,
        database: undefined,
        user: undefined,
        password: undefined,
      },
      databaseConnectRules: {
        host: [{ required: true, message: "host必填", trigger: "blur" }],
        port: [{ required: true, message: "port必填", trigger: "blur" }],
        database: [{ required: true, message: "database必填", trigger: "blur" }],
        user: [{ required: true, message: "user必填", trigger: "blur" }],
        password: [{ required: true, message: "password必填", trigger: "blur" }],
      },
      tableName: undefined,
      dataListQueryParam: {
        page: 1,
        pageSize: 10,
      },
      filters: [],
      sorts: [],
      // 表列表
      tables: [],
      // 列列表
      columns: [],
      // 总条数
      total: 0,
      // 参数表格数据
      dataList: [],
    };
  },
  methods: {
    connectDatabase() {
      this.axios
        .post('sql/query/connectDatabase', this.databaseConnectParam)
        .then(res => {
          let data = res.data
          if (data.status === 200) {
            ElMessage({
              showClose: true,
              message: 'Success',
              type: 'success',
            })
            this.tables = data.data.tables;
          } else {
            ElMessage({
              showClose: true,
              message: data.desc,
              type: 'error',
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    getColumns() {
      this.reset()
      if (this.tableName === undefined || this.tableName === "") {
        return;
      }

      this.axios
        .get('sql/query/table/columns', {
          params: {
            tableName: this.tableName
          }
        })
        .then(res => {
          let data = res.data
          if (data.status === 200) {
            this.columns = data.data;
          } else {
            ElMessage({
              showClose: true,
              message: data.desc,
              type: 'error',
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    reset() {
      this.dataListQueryParam["page"] = 1;
      this.filters = [];
      this.sorts = [];
    },
    getList() {
      // 组合sql
      if (this.filters && this.filters.length > 0) {
        this.dataListQueryParam["whereSql"] = this.assembleWhereSql();
      }
      if (this.sorts && this.sorts.length > 0) {
        this.dataListQueryParam["orderList"] = this.assembleOrderSql();
      }

      this.axios
        .post('sql/query/table/dataList', this.dataListQueryParam)
        .then(res => {
          let data = res.data
          if (data.status === 200) {
            this.dataList = data.data.dataList;
            this.total = data.data.total
            console.log(this.dataList)
          } else {
            ElMessage({
              showClose: true,
              message: data.desc,
              type: 'error',
            })
          }
        })
        .catch(err => {
          console.error(err)
        })
    },
    assembleWhereSql() {
      let whereSql = "";
      for (var i = 0; i < this.filters.length; i++) {
        let res = this.filters[i];

        let connect = "";
        if (res.connect !== undefined && res.connect !== null) {
          connect = res.connect;
        }
        switch (res.operate) {
          case "=":
          case "!=":
          case ">":
          case ">=":
          case "<":
          case "<=":
            whereSql += res.column + res.operate + res.value + " " + connect + " ";
            break;
          default:
        }
      }
      return whereSql;
    },
    assembleOrderSql() {
      let orderSql = "";
      let l = this.sorts.length
      for (var i = 0; i < l; i++) {
        let res = this.sorts[i];
        orderSql += res.column + " " + res.operate;
        if (i < l - 1) {
          orderSql += ",";
        }
      }
      return orderSql;
    },
    addFilter() {
      this.filters.push({
        column: undefined,
        operate: undefined,
        value: undefined,
        connect: undefined,
      })
      let l = this.filters.length
      if (l > 1) {
        this.filters[l - 2].connect = "and"
      }
    },
    removeFilter(index) {
      this.filters.splice(index, 1)
      let l = this.filters.length
      if (l > 0) {
        this.filters[l - 1].connect = undefined
      }
    },
    addSort() {
      this.sorts.push({
        column: undefined,
        operate: undefined,
      })
    },
    removeSort(index) {
      this.sorts.splice(index, 1)
    },
  }
}
</script>

<style scoped>
.app-container {
  height: 100%;
  padding: 20px;
  background-color: #eef0f3;
}
</style>
