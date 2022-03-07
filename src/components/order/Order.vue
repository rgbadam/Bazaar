<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <!-- 搜索和添加 -->
        <el-row :gutter ='20'>
            <el-col :span='8'>
                <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList()">
                    <el-button slot="append" icon="el-icon-search" @click="getOrderList()"></el-button>
                </el-input>
            </el-col>
        </el-row>

        <!-- 用户列表 -->
        <el-table :data="orderList" style="width: 100%" border stripe>
            <el-table-column type='index' label='#'></el-table-column>
            <el-table-column prop='order_number' label='订单编号' width="400px"></el-table-column>
            <el-table-column prop='order_price' label='订单价格' align="center"></el-table-column>
            <el-table-column label='是否付款' width='120px' align="center">
                <template v-slot='scope'>
                    <el-tag type="success" v-show="scope.row.pay_status == '1'">已付款</el-tag>
                    <el-tag type="danger" v-show="scope.row.pay_status == '0'">未付款</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop='is_send' label='是否发货' align="center"></el-table-column>
            <el-table-column label='下单时间' width='170px' align="center">
                <template v-slot='scope'>
                    {{scope.row.create_time | dataFormat}}
                </template>
            </el-table-column>
            <el-table-column label='操作' width='160px' align="center">
                <template v-slot="scope">
                    <el-tooltip effect="dark" content="修改地址" placement="top" :enterable='false'>
                        <el-button type="primary" icon="el-icon-edit" size='mini' @click="showAddressDialog(scope.row.order_number)"></el-button>
                    </el-tooltip>
                    <el-tooltip effect="dark" content="物流进度" placement="top" :enterable='false'>
                        <el-button type="success" icon="el-icon-location" size='mini' @click="showProgressDialog"></el-button>
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

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="40%" @close="addressDialogClosed">
        <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="70px">
            <el-form-item label="订单编号" prop="orderNum" label-width="100px">
                <el-input v-model="orderNum" disabled></el-input>
            </el-form-item>
            <el-form-item label="省市区/县" prop="address1" label-width="100px">
                <el-cascader :options="cityData" v-model="addressForm.address1" :props="cascaderProps"></el-cascader>
            </el-form-item>
            <el-form-item label="详细地址" prop="address2" label-width="100px">
                <el-input v-model="addressForm.address2"></el-input>
            </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addressDialogVisible = false">取 消</el-button>
            <el-button type="primary">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="40%">
        <el-timeline reverse>
            <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">{{activity.context}}</el-timeline-item>
        </el-timeline>
    </el-dialog>

  </div>
</template>

<script>
import cityData from './citydata'

export default {
    name: 'Order',
    data(){
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            orderList: [],
            progressInfo: [
                {
                    "time": "2018-05-10 09:39:00",
                    "ftime": "2018-05-10 09:39:00",
                    "context": "已签收,感谢使用顺丰,期待再次为您服务",
                    "location": ""
                },
                {
                    "time": "2018-05-10 08:23:00",
                    "ftime": "2018-05-10 08:23:00",
                    "context": "[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件",
                    "location": ""
                },
                {
                    "time": "2018-05-10 07:32:00",
                    "ftime": "2018-05-10 07:32:00",
                    "context": "快件到达 [北京海淀育新小区营业点]",
                    "location": ""
                },
                {
                    "time": "2018-05-10 02:03:00",
                    "ftime": "2018-05-10 02:03:00",
                    "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 23:05:00",
                    "ftime": "2018-05-09 23:05:00",
                    "context": "快件到达 [北京顺义集散中心]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 21:21:00",
                    "ftime": "2018-05-09 21:21:00",
                    "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",
                    "location": ""
                },
                {
                    "time": "2018-05-09 13:07:00",
                    "ftime": "2018-05-09 13:07:00",
                    "context": "顺丰速运 已收取快件",
                    "location": ""
                },
                {
                    "time": "2018-05-09 12:25:03",
                    "ftime": "2018-05-09 12:25:03",
                    "context": "卖家发货",
                    "location": ""
                },
                {
                    "time": "2018-05-09 12:22:24",
                    "ftime": "2018-05-09 12:22:24",
                    "context": "您的订单将由HLA（北京海淀区清河中街店）门店安排发货。",
                    "location": ""
                },
                {
                    "time": "2018-05-08 21:36:04",
                    "ftime": "2018-05-08 21:36:04",
                    "context": "商品已经下单",
                    "location": ""
                }
            ],
            total: 0,
            addressDialogVisible: false,
            progressDialogVisible: false,
            addressForm: {
                address1: [],
                address2: ''
            },
            addressFormRules: {
                orderNum: [ 
                    {required: true, message: '订单编号', trigger: 'blur' }
                ],
                address1: [
                    { required: true, message: '请选择省市区/县', trigger: 'blur' }
                ],
                address2: [
                    { required: true, message: '请填写详细地址', trigger: 'blur' }
                ]
            },
            cityData: cityData,
            cascaderProps: {
                expandTrigger: 'hover'
            },
            orderNum: ""
        }
    },
    methods: {
        // 获取订单列表
        async getOrderList(){
            const {data: res} = await this.$http.get('orders', { params: this.queryInfo })
            if(res.meta.status !== 200)
                return this.$message.error('获取订单列表失败')
            this.orderList = res.data.goods
            this.total = res.data.total
        },
        // 监听 pagesize 改变
        handleSizeChange(newSize){
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        // 监听 页码值 改变
        handleCurrentChange(newPage){
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        // 修改用户信息对话框
        showAddressDialog(order){
            this.addressDialogVisible = true
            this.orderNum = order
        },
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        showProgressDialog(){
            this.progressDialogVisible = true
        }
    },
    created(){
        this.getOrderList()
    }
}
</script>

<style>
.el-cascader {
    width: 100% !important;
}
</style>