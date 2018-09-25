var api_base=getApiBase();
function getApiBase(){
    var curServerPath=window.document.location.href;
    var pathName=window.document.location.pathname;
    var pos=0;
    if(pathName&&typeof(pathName)!="undefined" &&pathName.length>1){
        pos=curServerPath.indexOf(pathName);
    }else{
        pos=curServerPath.length-1;
    }
    var serverPath=curServerPath.substring(0,pos);
    return serverPath;

}
function ajaxcallAPI(url,sendObj,onSuccess,onTimeout,onError,aSynSta){
    callAPIWe(
        api_base+url,
        "POST",
        sendObj,
        onSuccess,
        onTimeout,
        onError,aSynSta
    );
}
function _callWe(url, send, func, aSynSta) {
    ajaxcallAPI(url, send, function (res) {
        func(res);
    }, function () {
        noticeTimeoutWe();
    }, function () {
        noticeErrorWe();
    }, aSynSta);
}
function l_alert(text,title,fun){
    $.alert({
        title: title?title:"",
        text: text?text:"",
        onOK: fun?fun:""
    });
}
function noticeTimeoutWe() {
    console.log(1)
    l_alert("请求数据超时，请稍后重试!");
    return false;
}
function noticeErrorWe() {
    console.log(2)
    l_alert("请求数据错误，请联系管理员!");
    return false;
}
//发送ajax
var callAPIWe = function (url,fajaxType,dataInput,onSuccess,onTimeout,onError,aSynSta) {
    // XMLHttpRequest 对象
    var xhr = new XMLHttpRequest();
    var xhrSyn=true;//默认异步
    if (typeof(aSynSta)!="undefined"&&aSynSta==false){
        xhrSyn=false;
    }
    xhr.open(fajaxType,url,xhrSyn);
    xhr.setRequestHeader("Content-Type","application/json;charset=UTF-8");
    xhr.onload = function(){
        if(xhr.responseText!="" && this.status >= 200 && this.status < 300){
            var res=JSON.parse(xhr.responseText);
            onSuccess(res);
        }
    };
    if(onTimeout!=null&& typeof onTimeout == 'function'){
        xhr.ontimeout=onTimeout;
    }
    if(onError!=null && typeof onError == 'function'){
        xhr.onerror=onError;
    }
    xhr.send(JSON.stringify(dataInput));
};
function jumpFunction (url,params) {
    if (url) {
        if (params) {
            var i = 0;
            for (var key in params) {
                if (params[key]) {
                    if (i > 0) {
                        url = url + "*"+key+"=" + params[key];
                    } else {
                        url = url + "?" +key+"=" + params[key];
                    }
                    i++;
                }
            }
        }
        console.log(getConfig(url));
        window.location.href = encodeURI(getConfig(url));
    }
};
String.prototype.format = function (args) {
    var result = this;
    if (arguments.length > 0) {
        if (arguments.length == 1 && typeof (args) == "object") {
            for (var key in args) {
                if (args[key] != undefined) {
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }else{
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, "");
                }
            }
        }
        else {
            for (var i = 0; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg = new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}
//获取后台配置的微信静态授权链接
function getConfig(url) {
    var formatUrl="";
    if (!formatUrl) {
        _callWe("/Wechat/GetConfig",{},(res)=>{
            console.log(res);
            if (res.backUrl) {
                formatUrl = res.backUrl;
            }
        },false)
    };
    return formatUrl.format(url);
}
//获取后台配置的微信静态授权链接
function getSdk(url,fun) {
    let data = false;
    _callWe("/Wechat/GetSdkInfo",{"msgBody":{"url":url}},(res)=>{
        if (res) {
            data =  res;
        }else{
            l_alert("网络异常！");
        }
    },false)
    if(fun) fun(data);
}
function getUrlParams(names) {
//获取？后面的参数
    var urlSearch = location.search;
    var urlValue = "";
    //以？*&来拆分
    var params = urlSearch.split(/[?*&]/);
    for (var i = 0; i < params.length; i++) {
        //如果url参数里包含传递过来names字段，则取=后面的部分
        var mapInfo = params[i].split("=");
        if(mapInfo[0]==names){
            urlValue =decodeURIComponent(mapInfo[1]);
            return urlValue;
        }
    }
    return urlValue;
}
function tokenByCode(code,fun){
    _callWe("/Wechat/GetOpenIdByCode",{"msgBody":{"code":code}},(res)=>{
        if(res.openId){
            let Obj = {
                "openId" : res.openId
            }
            window.localStorage.setItem("userInfo",JSON.stringify(Obj))
            fun(res);
        }else{
            l_alert("网络异常，请重新进入页面！");
        }
    })
}
function getOpenid(){
    let starage = JSON.parse(window.localStorage.getItem("userInfo"));
    if(starage){
        return starage.openId;
    }
    else{
        return false;
    }
}
function getOpenid_02(fun){
    let starage = JSON.parse(window.localStorage.getItem("userInfo"));
    if(starage){
        fun(starage.openId);
    }
    else{
        tokenByCode(getUrlParams("code"),function(res){
            fun(res.openId);
        });
    }
}
