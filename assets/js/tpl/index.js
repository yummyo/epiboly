$(function(){
    window.localStorage.setItem("tokenInfo","");
    //输入框获得值
    $("#iframeCanvas").ready(()=>{
        $("#userName").on("input",function(){
            $("#iframeCanvas")[0].contentWindow.inputChange($(this).val())
        })
    })
    setCode();
    $("#code").on('focus',function(){
        setCode();
    })
    //提交事件
    $(".validate-form .submit").on("click",function(){
        if($(".validate-form").valid()){
            $(".inputBody").addClass("test");
            let sendObj = {
                "username" : $("#userName").val(),
                "password" : $("#userPwd").val(),
                "code" : $("#code").val(),
                "random" : $(".img_code img").attr('random'),
            };
            _call("/login",sendObj,function(res){
                if(res.code == "1"){
                    window.location.href = "/main.html";
                }else{
                    swal({
                        "title":"错误",
                        "text" : res.staInfo ,
                        "type" : "error",
                        "allowOutsideClick" : false,
                        "allowEscapeKey" : false
                    }).then(function (isConfirm) {
                        if (isConfirm === true) {
                            $(".inputBody").removeClass("test");
                        }
                    });
                    // d_alert("错误",res.staInfo,"error");
                }
            })
        }
    })
})
//获取验证码
function setCode(){
    var _random = new Date().getTime();
    var _src = api_base + "/code?random=" + _random;
    $(".img_code").html("<img src='" + _src + "' width='100' height='38' onclick='setCode();' random='" + _random + "' />");
    console.log(_random)
}
