<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <!-- 搜索和添加 -->
        <el-row :gutter ='20'>
            <el-col :span='8'>
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList()">
                    <el-button slot="append" icon="el-icon-search" @click="getUserList()"></el-button>
                </el-input>
            </el-col>
            <el-col :span='4'>
                <el-button type='primary' @click="addDialogVisible = true">添加用户</el-button>
            </el-col>
        </el-row>

        <!-- 用户列表 -->
        <el-table :data="userList" style="width: 100%" border stripe>
            <el-table-column type='index' label='#'></el-table-column>
            <el-table-column prop='username' label='姓名'></el-table-column>
            <el-table-column prop='email' label='邮箱'></el-table-column>
            <el-table-column prop='mobile' label='电话'></el-table-column>
            <el-table-column prop='role_name' label='角色'></el-table-column>
            <el-table-column label='状态'>
                <!-- //作用域插槽（忘了），获取只属于这一行的数据 -->
                <template v-slot='scope'>
                    <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
                </template>
            </el-table-column>
            <el-table-column label='操作' width='175px'>
                <template v-slot='scope'>
                    <el-tooltip effect="dark" content="编辑" placement="top" :enterable='false'>
                        <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.id)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="删除" placement="top" :enterable='false'>
                        <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeUserById(scope.row.id)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="分配角色" placement="top" :enterable='false'>
                        <el-button type="warning" icon="el-icon-setting" size='mini' @click="setRole(scope.row)"></el-button>
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

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed()">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed()">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
                <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
                <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
                <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="setRoleDialogClosed()">
        <div>
            <p>当前的用户：{{userInfo.username}}</p>
            <p>当前的角色：{{userInfo.role_name}}</p>
            <p>分配新角色：
                <el-select v-model="selectedRoleId" placeholder="请选择">
                    <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
                </el-select>
            </p>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRoleDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Users",
  data(){

    // 自定义验证规则
    var checkEmail = (rule, value, callback) => {
        // 验证邮箱的规则，可以存起来以后调用嘿嘿
        const refEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(refEmail.test(value))
            return callback()
        callback(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rule, value, callback) => {
        // 验证邮手机的规则，可以存起来以后调用嘿嘿
        const refMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if(refMobile.test(value))
            return callback()
        callback(new Error('请输入合法的手机号'))
    }
        
    return {
        queryInfo: {
            query: '',
            pagenum: 1,
            pagesize: 2
        },
        // 总数据条数
        total: 0,
        userList: [],
        addDialogVisible: false,
        editDialogVisible: false,
        setRoleDialogVisible: false,
        addForm: {
            username: '',
            password: '',
            email: '',
            mobile: ''
        },
        addFormRules: {
            username: [
                { required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在3到10个字符',trigger: 'blur' }
            ],
            password: [
                { required: true, message: '请输入密码', trigger: 'blur' },
                { min: 6, max: 15, message: '长度在6到15个字符',trigger: 'blur' }
            ],
            email: [
                { required: true, message: '请输入邮箱', trigger: 'blur' },
                { validator: checkEmail , trigger: 'blur'}
            ],
            mobile: [
                { required: true, message: '请输入手机号', trigger: 'blur' },
                { validator: checkMobile, trigger: 'blur'}
            ]
        },
        editForm: {
            username: '',
            email: '',
            mobile: ''
        },
        editFormRules: {
            username: [
                { required: true, message: '请输入用户名', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在3到10个字符',trigger: 'blur' }
            ],
            email: [
                { required: true, message: '请输入邮箱', trigger: 'blur' },
                { validator: checkEmail , trigger: 'blur'}
            ],
            mobile: [
                { required: true, message: '请输入手机号', trigger: 'blur' },
                { validator: checkMobile, trigger: 'blur'}
            ]
        },
        userInfo: {},
        rolesList: [],
        selectedRoleId: ''
    }
  },
  methods: {
    // 从服务器获取用户列表
    async getUserList(){
        const {data: res} = await this.$http.get('users', { params: this.queryInfo })
        if(res.meta.status !== 200)
            return this.$message.error('获取用户列表失败')
        this.userList = res.data.users
        this.total = res.data.total

    },
    // 监听 pagesize 改变
    handleSizeChange(newSize){
        this.queryInfo.pagesize = newSize
        //需要重新获取数据
        this.getUserList()
    },
    // 监听 页码值 改变
    handleCurrentChange(newPage){
        this.queryInfo.pagenum = newPage
        this.getUserList()
    },
    // 监听 switch 的改变
    async userStateChanged(userInfo){
        const {data:res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if(res.meta.status !== 200){
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
    },
    // 关闭对话框的时候，会重置内容
    addDialogClosed(){
        this.$refs.addFormRef.resetFields()
    },
    // 添加用户预言证
    addUser(){
        this.$refs.addFormRef.validate( async valid => {
            if(!valid) 
                return
            // 发起请求，向数据路添加新的用户信息
            const {data: res} = await this.$http.post('users', this.addForm)
            if(res.meta.status !== 201)
                return this.$message.error('添加用户失败')
            this.$message.success('添加用户成功')
            this.addDialogVisible = false
            // 重新获取用户列表
            this.getUserList()
        })
    },
    // 修改用户信息对话框
    async showEditDialog(id){
        const {data:res} = await this.$http.get('users/' + id)
        if(res.meta.status !== 200)
            return this.$message.error('修改用户失败')
        this.editForm = res.data
        this.editDialogVisible = true
    },
    // 关闭对话框的时候，会重置内容
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息预言证
    editUserInfo(){
        this.$refs.editFormRef.validate( async valid => {
            if(!valid) 
                return
            // 发起请求，向数据路添加新的用户信息
            const {data: res} = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })
            if(res.meta.status !== 200)
                return this.$message.error('修改用户信息失败')
            this.$message.success('修改用户信息成功')
            this.editDialogVisible = false
            this.getUserList()
        })
    },
    //删除用户
    async removeUserById(id){
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm')
            return this.$message.info('取消删除')
        const {data: res} = await this.$http.delete('users/' + id)
        if(res.meta.status !== 200)
            return this.$message.error('删除用户失败')
        this.$message.success('删除用户成功')
        this.getUserList()
    },
    // 关闭对话框的时候，会重置内容
    setRoleDialogClosed(){
        this.selectedRoleId = ''
        this.userInfo = {}
    },
    async setRole(userInfo){
        this.userInfo = userInfo
        // 获取所有角色列表
        const {data: res} = await this.$http.get('roles')
        if(res.meta.status !== 200)
                return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
        this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo(){
        if(!this.selectedRoleId)
            return this.$message.error('请选择要分配的角色')
        const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {rid: this.selectedRoleId})
        if(res.meta.status !== 200)
            return this.$message.error('更新角色失败')
        this.$message.success('更新角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
    }
  },
  created(){
      this.getUserList()
  }
}
</script>

<style>

</style>