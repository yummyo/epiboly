//发送ajax
window.callAPI = function (url,fajaxType,dataInput,onSuccess,onTimeout,onError,headerObj,aSynSta) {
    // // XMLHttpRequest 对象
    // var xhr = new XMLHttpRequest();
    var xhrSyn=true,
        _header = {};//默认异步
    if (typeof(aSynSta)!="undefined"&&aSynSta==false){
        xhrSyn=false;
    }
    // xhr.onload = function(){
    //     if(xhr.responseText!="" && this.status >= 200 && this.status < 300){
    //         var res=JSON.parse(xhr.responseText);
    //         onSuccess(res);
    //     }else{
    //         onError(res);
    //     }
    // };
    // if(onTimeout!=null&& typeof onTimeout == 'function'){
    //     xhr.ontimeout=onTimeout;
    // }
    // if(onError!=null && typeof onError == 'function'){
    //     xhr.onerror=onError;
    // }
    // xhr.open(fajaxType,url,xhrSyn);
    // xhr.send(dataInput);

    $.ajax({
        'url':url,
        'type':fajaxType,
        'data':dataInput,
        'async':xhrSyn,
        'error':onError,
        'success':function(res){
            if(res.token){
                let Obj = {
                    'time':new Date().getTime(),
                    'token':res.token
                }
                window.localStorage.setItem('_packet_info',JSON.stringify(Obj))
            }
            onSuccess(res)
        },
        'timeout':onError,
        'headers':_header
    })
};