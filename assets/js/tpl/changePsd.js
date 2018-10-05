$(function(){
    var timer;
    $("#newPassword2").on("input",function(){
        let that = this;
        //函数节流
        clearTimeout(timer);
        timer = setTimeout(()=>{
            let newPsd = $("#newPassword").val(),
                oldPsd = $("#newPassword2").val(),
                status = 1;
            if(newPsd != oldPsd){
                status = 2;
            }
            setStatus($("#newPassword"),status)
            setStatus($("#newPassword2"),status)
        },500)
    })
    $(".submit").click(()=>{
        if ($(".validate-form").valid()) {
            let sendObj = {
                "oldpwd" : $("#oldPassword").val(),
                "newpwd" : $("#newPassword").val()
            }
            _call("/user/alterpwd",{"msgBody":sendObj},res => {
                if(res.sta == "ok"){
                    d_alert("成功",res.staInfo,"success",()=>{
                        window.location.href = window.location.href;
                    })
                }else{
                    d_alert("错误",res.staInfo,"error")
                }
            })
        }
    })
})
function setStatus(dom,status){
    //status 状态 1正确 2错误
    var iconClass = "glyphicon-ok",
        iconError = "glyphicon-warning-sign",
        parentClass = "has-success",
        parentError = "has-warning",
        info = "两次输入密码正确";
    if(status == 2){
        iconClass = "glyphicon-warning-sign";
        iconError = "glyphicon-ok";
        parentClass = "has-warning";
        parentError = "has-success";
        info = "两次密码不相同";
    }
    dom.parent().removeClass(parentError).addClass(parentClass);
    $("#newPassword2").siblings(".info").text(info).removeClass("sr-only");
    dom.siblings(".form-control-feedback").removeClass(iconError).addClass(iconClass);
}