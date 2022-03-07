<template>
  <div class="login_container">
      <!-- <div class="login_box"> -->
        <!-- 头像 -->
        <!-- <div class="avatar_box">
          <img src="../assets/avatar.jpeg">
        </div> -->
        <!-- 登录表单 -->
        <!-- <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form"> -->
          <!-- 用户名 -->
          <!-- <el-form-item prop="username">
            <el-input prefix-icon="el-icon-user" v-model="loginForm.username"></el-input>
          </el-form-item> -->
          <!-- 密码 -->
          <!-- <el-form-item prop="password">
            <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
          </el-form-item> -->
          <!-- 按钮 -->
          <!-- <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div> -->

    <div class="loginBody">
      <div class="wrapper">
        <div class="container">
          <h1>Welcome</h1>
          <h2>“Bazaar”</h2>
            <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="form">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username"></el-input>
              </el-form-item>
              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password"></el-input>
              </el-form-item>
              <el-form-item class="btns">
                <el-button type="primary" @click="login">登录</el-button>
              </el-form-item>
                <el-link @click="resetLoginForm" :underline="false" type="primary">重置</el-link>
            <p class="copyright">Vue2.0 + ElementUI project practice  by <a href="https://gitee.com/rgb_adam/vue-bazaar" target="_blank">RGB_Adam</a></p>
          </el-form>
        </div>

        
        <ul class="bg-bubbles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
export default {
    name: 'Login',
    data(){
      return {
        loginForm: {
          username: 'admin',
          password: '123456'
        },
        // 表单验证
        loginFormRules: {
          username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在3到10个字符',trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 10, message: '长度在6到10个字符',trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      // 重置表单数据
      resetLoginForm(){
        this.$refs.loginFormRef.resetFields();
      },
      login(){
        //表单预言证，如果输入不合法，valid返回false，直接return
        this.$refs.loginFormRef.validate(async valid => {
          if(!valid) 
            return
          //发起请求
          //login带参数：loginForm; 获取data，重命名为res
          const {data: res} = await this.$http.post('login', this.loginForm)
          if(res.meta.status !== 200)
            return this.$message.error("登录失败")
          this.$message.success("登录成功");
          //登录成功之后，把token保存在sessionStorage中
          window.sessionStorage.setItem('token', res.data.token)
          //通过编程式导航，跳转到主页
          this.$router.push('/home')
        });
      }
    }
}
</script>

<style scoped>
* {
	margin: 0;
	padding: 0;
	font-weight: 300 !important;
}

.login_container {
  background-color: #2b4b6b;
  height: 100%;
}

.login_box {
  height: 300px;
  width: 450px;
  background-color: #fff;
  border-radius: 3px;
  /* 居中 */
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.login_box .avatar_box {
  height: 130px;
  width: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  /* 居中 */
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
}

.login_box .avatar_box img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #eee;
}

.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: center;
}

.copyright {
  letter-spacing: 1px;
  font-weight: 600;
  color: #333744;
}

.el-link {
  color: #333744 !important ;
}

</style>