<template>
    <div class="coin-center">
        <meta pagetype="jinbi">
        hello
    </div>
</template>
<script>
const localhost ='//m.ymatou.com/coin'
import utils from "../common/utils";
import commonUtil from '../common/commons.js'
export default {
    components: {
    },
    data() {
        return {
         
        }
    },
    mounted(){
        let urlobj = commonUtil.getUrlObj();
        this.getInitialUserId = urlobj.accesstoken;
        //this.ifbindBoth();
        //this.ifbindwechat() 
    },
    methods: {
     
    }
}
</script>
<style lang="scss">
@import "../common/sass/reset.scss";
$rem: 1rem/16;
</style>