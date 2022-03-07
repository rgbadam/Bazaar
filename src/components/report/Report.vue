<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
        <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片 -->
    <el-card>
        <!-- 用于echarts -->
        <div id="main" style="width: 600px; height: 400px;"></div>
    </el-card>
  </div>
</template>

<script>
// 第三方库
import * as echarts from 'echarts'

export default {
    name: "Report",
    data(){
        return {
            // API文档里要求需要合并的数据
            options: {
                title: {
                    text: '用户来源'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#E9EEF3'
                    }
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: [
                    {
                    boundaryGap: false
                    }
                ],
                yAxis: [
                    {
                    type: 'value'
                    }
                ]
            }
        }
    },
    methods: {

    },
    created(){

    },
    async mounted(){
        // 需要在原生DOM挂在完毕之后，再进行渲染
        var myCharts = echarts.init(document.getElementById('main'))

        // 获取折线图数据
        const {data:res} = await this.$http.get('reports/type/1')
        if(res.meta.status !== 200)
            return this.$message.error('获取折线图数据失败')
        
        // 合并的原生方法
        const result = Object.assign(this.options, res.data)

        // 给echarts提供数据源
        myCharts.setOption(result)
    }
}
</script>

<style>

</style>