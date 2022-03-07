<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
        <!-- 提示 -->
        <el-alert title="添加商品信息" type="info" show-icon :closable="false" center></el-alert>

        <!-- 步骤条 -->
        <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>

        <!-- Tab栏 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
            <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name="0">
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model="addForm.goods_weight" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model="addForm.goods_number" type="number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cascaderProps" @change="handleCascaderChange" clearable></el-cascader>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name="1">
                    <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id" closable>
                        <el-checkbox-group v-model="item.attr_vals">
                            <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品属性" name="2">
                    <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id" closable>
                            <el-input v-model="item.attr_vals"></el-input>
                    </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name="3">
                    <!-- 这里action表示图片要上传到的后台API地址 -->
                    <!-- 这里没有用到main.js中定义的axios，所以没有header请求，所以需要自己加header请求 -->
                    <el-upload action="http://127.0.0.1:8888/api/private/v1/upload" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headerObj" :on-success="handleSuccess">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name="4">
                    <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                    <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%" @close="previewClosed">
        <img :src="previewPath" class="previewImg">
    </el-dialog>

  </div>
</template>

<script>
export default {
    name: 'Add',
    data(){
        return {
            activeIndex: '0',
            cateList: [],
            manyTableData: [],
            onlyTableData: [],
            addForm: {
                goods_name: '',
                goods_price: '',
                goods_weight: '',
                goods_number: '',
                goods_cat: [],
                pics: [],
                goods_introduce: '',
                attrs: []
            },
            isCatDone: false,
            previewVisible: false,
            addFormRules: {
                goods_name: [
                    { required: true, message: '请输入商品名称', trigger: 'blur' },
                    { min: 1, max: 30, message: '长度在1到30个字符',trigger: 'blur' }
                ],
                goods_price: [
                    { required: true, message: '请输入商品价格', trigger: 'blur' }
                ],
                goods_weight: [
                    { required: true, message: '请输入商品重量', trigger: 'blur' }
                ],
                goods_number: [
                    { required: true, message: '请输入商品数量', trigger: 'blur' }
                ],
                goods_cat: [
                    { required: true, message: '请输入商品分类', trigger: 'blur' }
                ]
            },
            cascaderProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children'
            },
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            previewPath: ''
        }
    },
    methods: {
        // 获取商品分类数据
        async getCateList(){
            const {data:res} = await this.$http.get('categories')
            if(res.meta.status !== 200)
                return this.$message.error('获取商品分类失败')
            this.cateList = res.data
        },
        // cascader选中项变化时，会触发此函数
        handleCascaderChange(){
            // 让它只能选三级选项
            if(this.addForm.goods_cat.length !== 3){
                this.addForm.goods_cat = []
                return
            }
            this.isCatDone = true
            this.getCateList()
        },
        // 进入的标签页，离开的标签页
        beforeTabLeave(activeName, oldActiveName){
            if(oldActiveName === '0' && !this.isCatDone){
                this.$message.error('请先完成基本信息')
                return false
            }
        },
        // 切换标签页
        async tabClicked(){
            // 当点击的是‘商品参数’时
            if(this.activeIndex === '1'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: "many"} })
                if(res.meta.status !== 200)
                    return this.$message.error('获取商品参数失败')
                // 把字符串以逗号为分割点，转换成数组
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
                })
                this.manyTableData = res.data
            }
            // 当点击的是‘商品属性’时
            if(this.activeIndex === '2'){
                const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`, { params: {sel: "only"} })
                if(res.meta.status !== 200)
                    return this.$message.error('获取商品属性失败')
                this.onlyTableData = res.data
            }
        },
        // 图片预览
        handlePreview(file){
            this.previewPath = file.response.data.url
            this.previewVisible = true

        },
        // 移除图片
        handleRemove(file){
            const filaPath = file.response.data.tmp_path
            const i = this.addForm.pics.findIndex(x => { x.pic === filaPath })
            this.addForm.pics.splice(i, 1)
        },
        // 图片上传成功
        handleSuccess(response){
            const picInfo = { pic: response.data.tmp_path }
            this.addForm.pics.push(picInfo)
        },
        // 关闭图片预览对话框
        previewClosed(){
            this.previewVisible = false
        },
        // 添加商品
        add(){
            this.$refs.addFormRef.validate( async valid => {
                if(!valid) 
                    return this.$message.error('请添加必要的标单项')
                // 生拷贝，改造goods_cat
                const Form = JSON.parse(JSON.stringify(this.addForm))
                Form.goods_cat = Form.goods_cat.join(',')
                // 为了迎合API文档的要求，改造部分数据
                this.manyTableData.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_vals: item.attr_vals.join(' ') }
                    this.addForm.attrs.push(newInfo)
                })
                this.onlyTableData.forEach(item => {
                    const newInfo = { attr_id: item.attr_id, attr_vals: item.attr_vals }
                    this.addForm.attrs.push(newInfo)
                })
                Form.attrs = this.addForm.attrs


                const {data: res} = await this.$http.post('goods', Form)
                if(res.meta.status !== 201)
                    return this.$message.error('添加商品失败')
                this.$message.success('添加商品成功')
                this.$router.push('/goods')
            })
        }
    },
    computed: {
        cateId(){
            if(this.isCatDone)
                return this.addForm.goods_cat[2]
            return null
        }
    },
    created(){
        this.getCateList()
    }
}
</script>

<style>
.el-steps {
    margin: 15px 0;
}

.el-step__title {
    font-size: 12px;
}

.el-checkbox {
    margin: 5px !important;
}

.previewImg {
    width: 100%;
}

.btnAdd {
    margin-top: 15px !important;
}
</style>