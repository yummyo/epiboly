$(function(){
    window.localStorage.setItem("_packet_info","");
    //输入框获得值
    $("#iframeCanvas").ready(()=>{
        $("#userName").on("input",function(){
            $("#iframeCanvas")[0].contentWindow.inputChange($(this).val())
        })
    })
    setCode();
    // $("#code").on('focus',function(){
    //     setCode();
    // })
    //提交事件
    $(".validate-form .submit").on("click",function(){
        login();
    })
    $(".validate-form").on("keydown",(e)=>{
        if(e.keyCode == '13' || e.keyCode == '108'){
            login();
        }
    })
})
//获取验证码
function setCode(){
    var _random = new Date().getTime();
    var _src = api_base + "/code?random=" + _random;
    $(".img_code").html("<img src='" + _src + "' width='100' height='38' onclick='setCode();' random='" + _random + "' />");
    $(".img_code img").load(function(){
        $("#code").focus();
    })
}
function login(){
    if($(".validate-form").valid()){
        $(".inputBody").addClass("test");
        let sendObj = {
            "username" : $("#userName").val(),
            "password" : $("#userPwd").val(),
            "code" : $("#code").val(),
            "random" : $(".img_code img").attr('random'),
        };
        _call("/login",sendObj,function(res){
            console.log(res)
            if(res.code == "1"){
                window.location.href = "/main.html";
            }else{
                swal({
                    "title":"错误",
                    "text" : res.info,
                    "type" : "error",
                    "allowOutsideClick" : false,
                    "allowEscapeKey" : false
                }).then(function (isConfirm) {
                    if (isConfirm === true) {
                        $(".inputBody").removeClass("test");
                        setCode();
                    }
                });
                // d_alert("错误",res.staInfo,"error");
            }
        })
    }
    $.ajax({
        'url':'http://47.92.251.237/admin/apk/query'
    })
}
