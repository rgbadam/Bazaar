<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <!-- 添加角色 -->
        <el-row :gutter ='20'>
            <el-col :span='4'>
                <el-button type='primary' @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type='expand' width='50px'>
            <template v-slot='scope'>
                <el-row id='expandBox' :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                    <!--渲染一级权限 -->
                    <el-col :span='5'>
                        <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                    </el-col>
                    <!-- 渲染二级权限 -->
                    <el-col :span='19'>
                        <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                            <el-col :span='6'>
                                <el-tag type='success' closable @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染三级权限 -->
                            <el-col :span='18'>
                                <el-tag type='warning' :class="[i3 === 0 ? '' : 'bdtop']" v-for="(item3, i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
            </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column prop="level" label="操作" width='300px'>
          <template v-slot='scope'>
            <el-button type="primary" icon="el-icon-edit" size='mini' @click="showEditDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size='mini' @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button type="warning" icon="el-icon-setting" size='mini' @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed()">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
            <el-form-item label="角色名称" prop="roleName" label-width="80px">
                <el-input v-model="addForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
                <el-input v-model="addForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed()">
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
            <el-form-item label="角色名称" prop="roleName" label-width="80px">
                <el-input v-model="editForm.roleName"></el-input>
            </el-form-item>
            <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
                <el-input v-model="editForm.roleDesc"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRoleInfo">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="30%" @close="setRightDialogClosed()">
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
        <span slot="footer" class="dialog-footer">
            <el-button @click="setRightDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="allotRights()">确 定</el-button>
        </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
        rolesList: [],
        rightsList: [],
        defkeys: [],
        roleId: [],
        addDialogVisible: false,
        editDialogVisible: false,
        setRightDialogVisible: false,
        addForm: {
            roleName: '',
            roleDesc: ''
        },
        editForm: {
            roleName: '',
            roleDesc: ''
        },
        treeProps: {
            label: 'authName',
            children: 'children'
        },
        addFormRules: {
            roleName: [
                { required: true, message: '请输入角色名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在3到10个字符',trigger: 'blur' }
            ],
            roleDesc: [
                { required: true, message: '请输入角色描述', trigger: 'blur' },
                { min: 1, max: 50, message: '长度在6到15个字符',trigger: 'blur' }
            ]
        },
        editFormRules: {
            roleName: [
                { required: true, message: '请输入角色名称', trigger: 'blur' },
                { min: 3, max: 10, message: '长度在3到10个字符',trigger: 'blur' }
            ],
            roleDesc: [
                { required: true, message: '请输入角色描述', trigger: 'blur' },
                { min: 1, max: 50, message: '长度在6到15个字符',trigger: 'blur' }
            ]
        }
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get("roles")
      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败")
      this.rolesList = res.data
    },
    // 关闭对话框的时候，会重置内容
    addDialogClosed(){
        this.$refs.addFormRef.resetFields()
    },
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    setRightDialogClosed(){
        this.defkeys = []
    },
    // 添加角色预言证
    addRole(){
        this.$refs.addFormRef.validate( async valid => {
            if(!valid) 
                return
            // 发起请求，向数据路添加新的用户信息
            const {data: res} = await this.$http.post('roles', this.addForm)
            if(res.meta.status !== 201)
                return this.$message.error('添加角色失败')
            this.$message.success('添加角色成功')
            this.addDialogVisible = false
            // 重新获取用户列表
            this.getRolesList()
        })
    },
    // 修改用户信息对话框
    async showEditDialog(id){
        const {data:res} = await this.$http.get('roles/' + id)
        if(res.meta.status !== 200)
            return this.$message.error('修改角色失败')
        this.editForm = res.data
        this.editDialogVisible = true
    },
    // 修改用户信息
    editRoleInfo(){
        this.$refs.editFormRef.validate( async valid => {
            if(!valid) 
                return
            // 发起请求，向数据路添加新的用户信息
            const {data: res} = await this.$http.put('roles/' + this.editForm.roleId, { roleName: this.editForm.roleName, roleDesc: this.editForm.roleDesc })
            if(res.meta.status !== 200)
                return this.$message.error('修改角色信息失败')
            this.$message.success('修改角色信息成功')
            this.editDialogVisible = false
            this.getRolesList()
        })
    },
    //删除用户
    async removeRoleById(id){
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm')
            return this.$message.info('删除操作已取消')
        const {data: res} = await this.$http.delete('roles/' + id)
        if(res.meta.status !== 200)
            return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        this.getRolesList()
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId){
        const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm')
            return this.$message.info('删除操作已取消')
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if(res.meta.status !== 200)
            return this.$message.error('删除角色失败')
        this.$message.success('删除角色成功')
        // 重新赋值，使得列表更新
        role.children = res.data
    },
    // 获取权限数据
    async showSetRightDialog(role){
        this.roleId = role.id
        const {data:res} = await this.$http.get('rights/tree')
        if(res.meta.status !== 200)
            return this.$message.error('获取权限数据失败')
        this.rightsList = res.data
        this.getLeafKeys(role, this.defkeys)
        this.setRightDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限id
    getLeafKeys(node, arr){
        // 如果当前node节点不包含children属性，则是三级节点
        if(!node.children)
            return arr.push(node.id)
        node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 分配权限
    async allotRights(){
        const keys = [ ...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys() ]
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if(res.meta.status !== 200)
            return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
    }
  },
  created() {
    this.getRolesList()
  }
}
</script>

<style>
.el-tag {
    margin: 10px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

#expandBox {
    margin: 0 50px;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>