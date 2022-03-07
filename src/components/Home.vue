<template>
    <el-container class="home-container">
        <!-- 头部 -->
        <el-header>
            <div>
                <img src="../assets/logo.jpeg" @click="welcomePage()">
                <span>Bazaar电商后台管理系统</span>
            </div>
            <el-button type="text" @click="logout()">退出登录</el-button>
        </el-header>
        <!-- 页面主体 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="roggle-button" @click="togglCollapse()">🏷</div>
                <el-menu
                    background-color="#333744"
                    text-color="#fff"
                    active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition='false' router :default-active='activePath'>
                    <!-- 一级菜单 -->
                    <!-- index的值不能相同，index默认只支持字符串，但item.id是数字，所以需要转成字符串 -->
                    <el-submenu :index="String(item.id)" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconsObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>
                </el-menu>
            </el-aside>
            <!-- 右侧内容 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    name: 'Home',
    data(){
        return {
            menuList: [],
            // 这些id数字与item.id数字一致
            iconsObj: {
                '125': 'el-icon-user-solid',
                '103': 'el-icon-s-help',
                '101': 'el-icon-s-goods',
                '102': 'el-icon-s-order',
                '145': 'el-icon-s-marketing'
            },
            isCollapse: false,
            activePath: ''
        }
    },
    methods: {
        logout(){
            window.sessionStorage.clear()
            this.$router.push('/login')
        },
        // 从服务器获取菜单信息，给menuList
        async getMenuList(){
            const {data: res} = await this.$http.get('menus')
            if(res.meta.status !== 200)
                return this.$message.error(res.meta.msg)
            this.menuList = res.data
        },
        // 菜单的折叠功能
        togglCollapse(){
        this.isCollapse = !this.isCollapse
        },
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath', activePath)
            this.activePath = activePath
        },
        welcomePage(){
            this.$router.push('/home')
        }
    },
    created(){
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    }
}
</script>

<style scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;
}

.el-header div {
    display: flex;
    align-items: center;
}
.el-header span {
    margin-left: 15px;
}

.el-header div img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-left: 10px;
}

.el-aside {
    background-color: #333744;
    transition: 0.1s linear;
}

.el-aside .el-menu {
    border-right: none;
}

.el-main {
    background-color: #eaedf1;
}

.roggle-button {
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    letter-spacing: 2px;
    cursor: pointer;
}

</style>