<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <el-alert title="只允许为三级分类设置相关参数" type="warning" show-icon></el-alert>
        <el-row class="cat-opt">
            <el-col>
                <span>选择商品分类：</span>
                 <el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="handleCascaderChange" clearable></el-cascader>
            </el-col>
        </el-row>
        <!-- Tab 标签 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible=true">添加参数</el-button>
                <el-table :data="manyTableData" style="width: 100%" border stripe>
                    <el-table-column type='expand' width='50px'>
                        <template v-slot='scope'>
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                    <el-table-column label="操作">
                        <template v-slot='scope'>
                            <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" size="mini" :disabled="isDisabled" @click="addDialogVisible=true">添加属性</el-button>
                <el-table :data="onlyTableData" style="width: 100%" border stripe>
                    <el-table-column type='expand' width='50px'>
                        <template v-slot='scope'>
                            <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" label="#"></el-table-column>
                    <el-table-column prop="attr_name" label="属性名称"></el-table-column>
                    <el-table-column label="操作">
                        <template v-slot='scope'>
                            <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                            <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed()">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item :label="titleText" prop="attr_name" label-width="80px">
                <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed()">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item :label="titleText" prop="attr_name" label-width="80px">
                <el-input v-model="editForm.attr_name"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
    </el-dialog>


  </div>
</template>

<script>
export default {
    name: 'Params',
    data(){
        return {
            cateList: [],
            selectedKeys: [],
            manyTableData: [],
            onlyTableData: [],
            addDialogVisible: false,
            editDialogVisible: false,
            inputVisible: false,
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            activeName: 'many',
            addForm: {
                attr_name: ''
            },
            editForm: {
                attr_name: ''
            },
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在1到10个字符',trigger: 'blur' }
                ]
            },
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' },
                    { min: 1, max: 10, message: '长度在1到10个字符',trigger: 'blur' }
                ]
            },
            inputValue: ''
        }
    },
    methods: {
        // 获取所有商品分类列表
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !== 200)
                return this.$message.error('获取商品分类失败')
            this.cateList = res.data
        },
        // cascader选中项变化时，会触发此函数
        handleCascaderChange(){
            // 让它只能选三级选项
            if(this.selectedKeys.length !== 3){
                this.selectedKeys = []
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            this.getParamsData()
        },
        // Tab选中项变化时，会触发此函数
        handleTabClick(){
            if(this.isDisabled)
                return 
            this.getParamsData()
        },
        // 获取参数的列表数据
        async getParamsData(){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: this.activeName} })
            if(res.meta.status !== 200)
                return this.$message.error('获取商品分类失败')
            // 让attr_vals以逗号为分割点，转换成数组
            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : [] 
                item.inputVisible = false
                item.inputValue = ''
                })
            if(this.activeName === 'many')
                this.manyTableData = res.data
            this.onlyTableData = res.data
        },
        // 添加对话框关闭
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        // 修改对话框关闭
        editDialogClosed(){
            this.$refs.editFormRef.resetFields()
        },
        // 添加参数
        addParams(){
            this.$refs.addFormRef.validate( async valid => {
                if(!valid) 
                    return
                const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
                if(res.meta.status !== 201)
                    return this.$message.error('添加参数失败')
                this.$message.success('添加参数成功')
                this.addDialogVisible = false
                this.getParamsData()
            })
        },
        // 显示修改按钮
        async showEditDialog(attr_id){
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { attr_sel: this.activeName })
            if(res.meta.status !== 200)
                return this.$message.error('获取参数信息失败')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 修改参数
        editParams(){
            this.$refs.editFormRef.validate( async valid => {
                if(!valid) 
                    return
                const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
                if(res.meta.status !== 200)
                    return this.$message.error('修改参数失败')
                this.$message.success('修改参数成功')
                this.editDialogVisible = false
                this.getParamsData()
            })
        },
        // 删除参数
        async removeParams(attr_id){
            const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm')
                return this.$message.info('删除操作已取消')
            const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            if(res.meta.status !== 200)
                return this.$message.error('删除参数失败')
            this.$message.success('删除参数成功')
            this.getParamsData()
        },
        // 文本输入框失去焦点或按下Enter键会触发
        async handleInputConfirm(row){
            // 判断是否输入了一堆空格，并清空输入框里的内容
            if(row.inputValue.trim().length === 0){
                row.inputValue = ''
                row.inputVisible = false
                return 
            }
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 把数组改回字符串，后面加上逗号
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
            if(res.meta.status !== 200)
                return this.$message.error('修改参数项失败')
        },
        // 点击按钮，展示文本输入框
        showInput(row){
            row.inputVisible = true
            // 页面重新渲染之后才会触发nextTick函数
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus()
                // 傻子，不用一下会报错
                _
            })
        },
        async handleClose(i, row){
            // 从第i个位置删除1个数据
            row.attr_vals.splice(i, 1)
            const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(',') })
            if(res.meta.status !== 200)
                return this.$message.error('修改参数项失败')
        }
    },
    computed: {
        isDisabled(){
            if(this.selectedKeys.length !== 3)
                return true
            return false
        },
        cateId(){
            if(this.selectedKeys.length === 3)
                return this.selectedKeys[2]
            return null
        },
        titleText(){
            if(this.activeName === "many")
                return "动态参数"
            return "静态属性"
        }
    },
    created(){
        this.getCateList()
    }
}
</script>

<style scoped>
.cat-opt {
    margin: 15px 0;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
}
</style>