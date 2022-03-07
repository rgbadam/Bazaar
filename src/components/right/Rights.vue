<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template v-slot='scope'>
            <el-tag v-show="scope.row.level == '0'">一级</el-tag>
            <el-tag type='success' v-show="scope.row.level == '1'">二级</el-tag>
            <el-tag type='warning' v-show="scope.row.level == '2'">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "Rights",
  data() {
    return {
      rightsList: []
    }
  },
  methods: {
    async getRightsList() {
      const { data: res } = await this.$http.get("rights/list")
      if (res.meta.status !== 200)
        return this.$message.error("获取权限列表失败")
      this.rightsList = res.data
    }
  },
  created() {
    this.getRightsList()
  }
}
</script>

<style>
</style>