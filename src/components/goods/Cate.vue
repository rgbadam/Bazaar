<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <el-row>
            <el-col>
                <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
            </el-col>
        </el-row>

        <!-- 第三方table组件 -->
        <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index index-text='#' border>
            <template slot="isok" scope="scope">
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
                <i class="el-icon-error" v-else style="color: red"></i>
            </template>
            <template slot="order" scope="scope">
                <el-tag v-show="scope.row.cat_level == '0'">一级</el-tag>
                <el-tag type='success' v-show="scope.row.cat_level == '1'">二级</el-tag>
                <el-tag type='warning' v-show="scope.row.cat_level == '2'">三级</el-tag>
            </template>
            <template slot="opt" scope="scope">
                <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeCate(scope.row.cat_id)">删除</el-button>
            </template>
        </tree-table>

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

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="30%" @close="addCateDialogClosed()">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="70px">
            <el-form-item label="分类名称" prop="cat_name" label-width="80px">
                <el-input v-model="addCateForm.cat_name"></el-input>
            </el-form-item>
            <el-form-item label="父级分类" label-width="80px">
                    <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable></el-cascader>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="30%" @close="editCateDialogClosed()">
        <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="70px">
            <el-form-item label="分类名称" prop="cat_name" label-width="80px">
                <el-input v-model="editCateForm.cat_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editCateDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCate">确 定</el-button>
        </span>
    </el-dialog>
        
  </div>
</template>

<script>
export default {
    name: 'Cate',
    data(){
        return {
            queryInfo: {
                type: 3,
                pagenum: 1,
                pagesize: 5
            },
            // 总数据条数
            total: 0,
            cateList: [],
            parentCateList: [],
            selectedKeys: [],
            columns: [
                { label: '分类名称', prop: 'cat_name' },
                { label: '是否有效', prop: 'cat_deleted', type: 'template', template: 'isok', width: '100px', align: 'center', headerAlign: 'center' },
                { label: '排序', type: 'template', template: 'order', width: '150px', align: 'center', headerAlign: 'center' },
                { label: '操作', type: 'template', template: 'opt',  width: '250px', align: 'center', headerAlign: 'center' }
            ],
            addCateDialogVisible: false,
            editCateDialogVisible: false,
            addCateForm: {
                cat_name: '',
                // 父级分类id
                cat_pid: 0,
                // 分类等级
                cat_level: 0
            },
            editCateForm: {
                cat_name: '',
                cat_id: 0
            },
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在1到10个字符',trigger: 'blur' }
                ]
            },
            editCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在1到10个字符',trigger: 'blur' }
                ]
            },
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: true
            }
        }
    },
    methods: {
        // 获取商品分类数据
        async getCateList(){
            const {data:res} = await this.$http.get('categories', { params: this.queryInfo})
            if(res.meta.status !== 200)
                return this.$message.error('获取商品分类失败')
            this.cateList = res.data.result
            this.total = res.data.total
        },
        // 监听 pagesize 改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            //需要重新获取数据
            this.getcateList()
        },
        // 监听 页码值 改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        // 添加分类
        showAddCateDialog(){
            this.getParentCateList()
            this.addCateDialogVisible = true
        },
        // 关闭对话框的时候，会重置内容
        addCateDialogClosed(){
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
        },
        editCateDialogClosed(){
            this.$refs.editCateFormRef.resetFields()
            this.editCateForm.cat_name = ''
        },
        // 获取父级分类数据列表
        async getParentCateList(){
            const {data:res} = await this.$http.get('categories', { params: { type: 2 }})
            if(res.meta.status !== 200)
                return this.$message.error('获取父级分类失败')
            this.parentCateList = res.data
        },
        // 点击按钮，添加新的分类
        addCate(){
            this.$refs.addCateFormRef.validate( async valid => {
                if(!valid) 
                    return
                const {data: res} = await this.$http.post('categories', this.addCateForm)
                if(res.meta.status !== 201)
                    return this.$message.error('添加分类失败')
                this.$message.success('添加分类成功')
                this.addCateDialogVisible = false
                this.getCateList()
            })
        },
        // 监听父级分类的变化
        parentCateChange(){
            if(this.selectedKeys.length > 0){
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
                this.addCateForm.cat_level = this.selectedKeys.length
                return
            } else {
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 编辑分类对话框
        showEditDialog(row){
            this.editCateForm.cat_name = row.cat_name
            this.editCateForm.cat_id = row.cat_id
            this.editCateDialogVisible = true
        },
        // 编辑分类
        editCate(){
            this.$refs.editCateFormRef.validate( async valid => {
                if(!valid) 
                    return
                // 发起请求，向数据路添加新的分类名称
                const {data: res} = await this.$http.put('categories/' + this.editCateForm.cat_id, { cat_name: this.editCateForm.cat_name })
                if(res.meta.status !== 200)
                    return this.$message.error('修改分类名称失败')
                this.$message.success('修改分类名称成功')
                this.editCateDialogVisible = false
                this.getCateList()
            })
        },
        //删除用户
        async removeCate(id){
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm')
                return this.$message.info('删除操作已取消')
            const {data: res} = await this.$http.delete('categories/' + id)
            if(res.meta.status !== 200)
                return this.$message.error('删除分类失败')
            this.$message.success('删除分类成功')
            this.getCateList()
        }
    },
    created(){
        this.getCateList()
    }
}
</script>

<style>
.treeTable {
    margin-top: 15px;
}
</style>