//发送ajax
window.callAPI = function (url,fajaxType,dataInput,onSuccess,onTimeout,onError,headerObj,aSynSta) {
    // XMLHttpRequest 对象
    var xhr = new XMLHttpRequest();
    var xhrSyn=true;//默认异步
    if (typeof(aSynSta)!="undefined"&&aSynSta==false){
        xhrSyn=false;
    }
    xhr.open(fajaxType,url,xhrSyn);
    if (headerObj && typeof(headerObj)!="undefined" && headerObj.length>10)
    {
        var headerobjs=headerObj.split("#");
        for(var headnum=0;headnum<headerobjs.length;headnum++){
            var headObjstr=headerobjs[headnum].split(";");
            if(headObjstr.length==2){
                xhr.setRequestHeader(headObjstr[0],headObjstr[1]);
            }
        }
    }
    xhr.onload = function(){
        console.log(xhr)
        if(xhr.responseText!="" && this.status >= 200 && this.status < 300){
            var res=JSON.parse(xhr.responseText);
            onSuccess(res);
        }else{
            onError(res);
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