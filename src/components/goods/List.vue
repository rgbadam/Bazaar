<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <!-- 搜索和添加 -->
        <el-row :gutter ='20'>
            <el-col :span='8'>
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                    <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                </el-input>
            </el-col>
            <el-col :span='4'>
                <el-button type='primary' @click="goAddPage">添加商品</el-button>
            </el-col>
        </el-row>

        <!-- 商品列表 -->
        <el-table :data="goodsList" style="width: 100%" border stripe>
            <el-table-column type='index' label='#'></el-table-column>
            <el-table-column prop='goods_name' label='商品名称'></el-table-column>
            <el-table-column prop='goods_price' label='商品价格(元)' align="center" width="90px"></el-table-column>
            <el-table-column prop='goods_weight' label='商品重量' align="center" width="90px"></el-table-column>
            <el-table-column prop='add_time' label='创建时间' align="center" width="150px">
                <template v-slot='scope'>
                    <!-- 这里的dataFormat是过滤器，在main.js中定义的，用来过滤时间 -->
                    {{scope.row.add_time | dataFormat}}
                </template>
            </el-table-column>
            <el-table-column label='操作' width='175px' align="center">
                <template v-slot='scope'>
                    <el-tooltip effect="dark" content="编辑" placement="top" :enterable='false'>
                        <el-button type="primary" icon="el-icon-edit" size='mini'></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="删除" placement="top" :enterable='false'>
                        <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeById(scope.row.goods_id)"></el-button>
                    </el-tooltip>
                </template>
            </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[1, 2, 5, 10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>

    </el-card>
  </div>
</template>

<script>
export default {
    name: 'List',
    data(){
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 5
            },
            total: 0,
            goodsList: [],
            addDialogVisible: false
        }
    },
    methods: {
        // 获取商品列表
        async getGoodsList(){
            const {data: res} = await this.$http.get('goods', { params: this.queryInfo })
            if(res.meta.status !== 200)
                return this.$message.error('获取商品列表失败')
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        // 监听 pagesize 改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            //需要重新获取数据
            this.getGoodsList()
        },
        // 监听 页码值 改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        // 删除商品
        async removeById(id){
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm')
                return this.$message.info('删除操作已取消')
            const {data: res} = await this.$http.delete(`goods/${id}`)
            if(res.meta.status !== 200)
                return this.$message.error('删除商品失败')
            this.$message.success('删除商品成功')
            this.getGoodsList()
        },
        goAddPage(){
            this.$router.push('/goods/add')
        }
    },
    created(){
        this.getGoodsList()
    }
}
</script>

<style>

</style>