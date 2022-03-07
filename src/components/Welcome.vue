<template>
  <div class="wrap">
    <h3 class="text">Welcome</h3>
    <div class="form">
        <video src="../assets/video.mp4" muted loop autoplay></video>
    </div>
  </div>
</template>

<script>
export default {
    name: 'Welcome'
}
</script>

<style scoped>
.text {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 30px;
    letter-spacing: 15px;
    position: absolute;
}


.wrap {
    width: 100%;
    height: 100%;
    margin: -20px;
    padding: 20px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    background-image: linear-gradient(to left top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1);
}

.form {
    width: 840px;
    height: 560px;
    display: flex;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 25px 45px rgba(0, 0, 0, 0.1);
}

video {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

</style>