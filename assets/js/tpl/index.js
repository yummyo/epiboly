$(function(){
    window.localStorage.setItem("tokenInfo","");
    //输入框获得值
    $("#iframeCanvas").ready(()=>{
        $("#userName").on("input",function(){
            $("#iframeCanvas")[0].contentWindow.inputChange($(this).val())
        })
    })
    //提交事件
    $(".validate-form .submit").on("click",function(){
        $(".inputBody").addClass("test");
        if($(".validate-form").valid()){
            let sendObj = {
                "username" : $("#userName").val(),
                "password" : $("#userPwd").val(),
            };
            _call("/Login",sendObj,function(res){
                console.log(res.sta)
                if(res.sta == "ok"){
                    _setTokenInfo(res.resultBody.frealName,res.resultBody.token,$("#userName").val());
                    window.location.href = "/main.html";
                }else if(res.sta == "err"){

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
        }else{
            $(".inputBody").removeClass("test");
        }
    })
})
function _setTokenInfo(_frealName,_packet_token,_loginName){
    if( _frealName &&_packet_token && _loginName){
        var _storage=window.localStorage;
        var jsonObj=new Object();
        jsonObj["realName"]=_frealName;
        jsonObj["packet_token"]=_packet_token;
        jsonObj["loginName"]=_loginName;
        jsonObj.fdatetime=new Date().getTime();
        var objString=JSON.stringify(jsonObj);
        _storage.setItem("tokenInfo",objString);
    }
}