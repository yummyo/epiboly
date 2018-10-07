	function getApiBase(){
		var curServerPath=window.document.location.href;
		if(curServerPath.indexOf('test.gjd8.com')>-1){
			return "http://www.beautyouth.com:7002";
		}
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
    var api_base=getApiBase();
    //本地跨域代理
    api_base += "/apis/admin";
    //生产环境
    // api_base = "http://47.92.251.237/admin";

	function ajaxcallAPI(url,sendObj,onSuccess,onTimeout,onError,headerObj,aSynSta){
		//加载框
        if(url != "/Notice/ChangeReadStatus" && url !="/Notice/SearchNoticeList"){
            //信息状态修改时不显示发送请求页面
            ajaxNum++;
            getMainDom("show");
        }

		var tokenInfo = getLocalData("tokenInfo");
		if(tokenInfo){
            sendObj["fusername"] = tokenInfo['loginName'];
		}
		let ajaxType = 'POST';
		console.log(sendObj)
        if(sendObj['ajaxType']){
            ajaxType = sendObj['ajaxType'];
            delete sendObj['ajaxType'];
        }
        window.callAPI(
			api_base+url,
            ajaxType,
			sendObj,
			onSuccess,
			onTimeout,
			onError,headerObj,aSynSta
		);
		return false;
	}
	function ajaxcallAPI_2(foperationNo,fajaxUrl,fajaxType,sendObj,onSuccess,onTimeout,onError,headerObj,aSynSta){
		var msg={};
		var sendData={};
		sendData["msgId"]=foperationNo;
		sendData["serId"]=0;
		sendData["type"]=1;
		sendData["key"]=0;
		sendData["source"]=1;
		sendData["msgBody"]=sendObj;
		msg["msg"]=JSON.stringify(sendData);

		window.callAPI(
			api_base+fajaxUrl,
			fajaxType,
			msg,
			onSuccess,
			onTimeout,
			onError,headerObj,aSynSta
		);
	}

	/**
	 * 文件上传公用 ajax 公用方法
	 * @param ajaxID 请求ID
	 * @param sendName api 中的参数名称
	 * @param sendObj  需要提交的发送的文件对象
	 * @param onSuccess  成功调用函数
	 * @param progressFunction  上传进度监听程序
	 * function progress(evt) { 这个js 可以监听上传进度
            if (evt.lengthComputable) {
            		total 总进度  loaded 当前进度
                alert(evt.total+"**********************"+evt.loaded);
            }
        }
	 *
	 * @param onError    错误调用函数
	 * @param headerObj  请求hearder 字符串
     * @returns {boolean} 返回成功失败
     */
	function ajaxcallAPI_file(ajaxID,sendName,sendObj,onSuccess,progressFunction,onError,headerObj){
		var _storage=window.localStorage;
		var _userOperation=_storage.getItem("userOperation");
		if(_userOperation!=null){
			let isFind = false;
			_userOperation=JSON.parse(_userOperation);
			$.each(_userOperation,function(i,v){
				if(v['foperationNo']==ajaxID){
					isFind = true;
					window.UpladFile(
						api_base+v['fajaxUrl'],
						v['fajaxType'],
						sendName,sendObj,
						onSuccess,
						progressFunction,
						headerObj
					);
					return false;
				}
			});
			//如果没有找到msgid号 关闭加载状态并提示
			if(!isFind){
                getMainDom("hide");
                d_alert("错误","这个接口暂时没有权限！","error");
			}
		}
		else{
			noticeLogout("参数错误，请重新登录");
			return false;
		}
	}

	function UpladFile(url,fajaxType,sendName,sendObj,onSuccess,progressFunction,headerObj) {
		// FormData 对象
		var form = new FormData();                      // 可以增加表单数据
		form.append(sendName, sendObj);                           // 文件对象
		// XMLHttpRequest 对象
		var xhr = new XMLHttpRequest();
		xhr.open(fajaxType,url,true);
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
			var res=JSON.parse(xhr.responseText);
			if(this.status >= 200 && this.status < 300){
				onSuccess(res);
			}
		};
		if(progressFunction!=null){
			xhr.upload.addEventListener("progress", progressFunction, false);
		}
		xhr.send(form);
	}