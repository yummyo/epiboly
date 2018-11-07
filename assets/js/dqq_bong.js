var ajaxNum = 0;
$(function(){
    //获取url参数
    $.request = (function () {
        var apiMap = {};
        function request(queryStr) {
            var api = {};
            if (apiMap[queryStr]) { return apiMap[queryStr]; }
            api.queryString = (function () {
                var urlParams = {};
                var e,
                    d = function (s) { return decodeURIComponent(s.replace(/\+/g, " ")); },
                    q = queryStr.substring(queryStr.indexOf('?') + 1),
                    r = /([^&=]+)=?([^&]*)/g;
                while (e = r.exec(q))   urlParams[d(e[1])] = d(e[2]);
                return urlParams;
            })();
            api.getUrl = function () {
                var url = queryStr.substring(0, queryStr.indexOf('?') + 1);
                for (var p in api.queryString) { url += p + '=' + api.queryString[p] + "&";     }
                if (url.lastIndexOf('&') == url.length - 1) { return url.substring(0, url.lastIndexOf('&')); }
                return url;
            }
            apiMap[queryStr] = api;
            return api;
        }
        $.extend(request, request(window.location.href));
        return request;
    })();
    //laydate加载
    loadLaydate();
    //自动宽度
    if($(".autoWidth").length>0){
        $(".autoWidth").each(function(){
            $(this).width(($(this).parent().width()*1-($(this).prev().width()*1))*0.95)
        })
    }

})
//设置默认时间
function setDefaultDate(_startDate, _endDate) {
    // if (_startDate) {
    //     _startDate.val(getTime(1) + " 01:00:00");
    // }
    // if (_endDate) {
    //     _endDate.val(getTime(1) + " 23:59:59");
    // }
}
//扩展时间插件
Date.prototype.Format = function(fmt){
    var o = {
        "M+" : this.getMonth()+1,         //月份
        "d+" : this.getDate(),          //日
        "h+" : this.getHours(),          //小时
        "m+" : this.getMinutes(),         //分
        "s+" : this.getSeconds(),         //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds()       //毫秒
    };
    if(/(y+)/.test(fmt))
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)
        if(new RegExp("("+ k +")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    return fmt;
}
// 返回指定格式时间 type 1 年月日 2 年月日加时分秒
function getTime(_type,_nowDate) {
    var d = _nowDate?new Date(_nowDate):new Date();
    var _time = "";
    var _month = (parseInt(d.getMonth()) + 1);
    var _date = d.getDate();
    _month = _month < 10 ? "0" + _month : _month;
    _date = _date < 10 ? "0" + _date : _date;

    if (_type == 1) {
        _time = d.getFullYear() + "-" + _month + "-" + _date;
    }
    else if (_type == 2) {
        _time = d.getFullYear() + "-" + _month + "-" + _date + " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    }
    return _time;
}
function getNowIframe(){
    return top.$(".show_iframe:not(:hidden)").children("iframe");
}
function setTitle_01(title_list, title_page, url_add) {
    if (title_page) $(".d_title").text(title_page);
    if (title_list) $(".d_list").text(title_list);

    if ($(".d_add").length) {
        $(".d_add").on("click", function () {
            getNowIframe().attr("src",url_add);
        });
    }
}
function setTitle_02(title_add,_url){
    _url = _url || config["url_page"];
    if(title_add){
        $(".d_title").text(title_add)
    }
    if($(".d_back").length){
        $(".d_back").on("click",function(){
            getNowIframe().attr("src",_url+"?pageType=search");
        });
    }
}
function loadLaydate() {
    if (typeof (laydate) != "undefined") {
        if ($("#all_date .ly_date").length) {
            $('#all_date .ly_date').each(function(i,v){
                var _laydate = {
                    elem:$(v)[0],
                    max: '2099-06-16',
                    event: 'focus',
                    istime:true,
                    istoday: true,
                    type: "datetime",
                    format:'yyyy-MM-dd HH:mm:ss',
                    choose: function (datas) {
                    },
                    theme: 'grid'
                };
                laydate.render(_laydate);
            })
        }
    }
}
function _call(url, send, func, aSynSta) {
    if( url.indexOf('login') > -1 || checkToken()){
        let _token = getLocalData("_packet_info")['token'] || '';
        $.extend(send,{'token':_token})
        ajaxcallAPI(url, send, function (res) {
            top.$('#modal-loading').modal('hide');
            //loading页面关闭
            if(url != "/Notice/ChangeReadStatus" && url !="/Notice/SearchNoticeList"){
                //信息状态修改时不显示发送请求页面
                ajaxNum--;
            }
            if(ajaxNum == 0){
                getMainDom("hide");
            }
            func(res);
        }, function () {
            getMainDom("hide");
            noticeTimeout();
        }, function () {
            getMainDom("hide");
            noticeError();
        }, getHeaderObj(), aSynSta);
    }
}
//获取主页面元素
function getMainDom(type){
    if(top.$('#loading').length>0){
        top.$('#loading')[type]();
    }else if($('#loading').length>0){
        $('#loading')[type]();
    }
}
function noticeTimeout() {
    d_alert("错误!", "请求数据超时，请稍后重试", "error");
    return false;
}
function noticeError() {
    d_alert("错误!", "请求数据错误，请联系管理员", "error");
    return false;
}
function noticeLogout(str) {
    top.swal("错误!", str);
    return false;
}
function d_alert(title, content, type, func) {
    let f = top.swal;
    if(!f){
        f = swal();
    }
    f(title, content, type).then(function (isConfirm) {
        if (isConfirm === true) {
            if (func) {
                func();
            }
        }
    });
}
//获取头部信息
function getHeaderObj() {
    var _tokenInfo = getLocalData("tokenInfo");
    if(_tokenInfo){
        var _headerObj = "Authorization;" + _tokenInfo.packet_token + "#Content-Type;application/json#X-Frame-Options;SAMEORIGIN";
        return _headerObj;
    }else{
        return null;
    }
}
// 验证token是否过期
function checkToken(){
    var _packet_info = getLocalData("_packet_info");
    if(_packet_info && (new Date().getTime() - _packet_info['time']) < 60*60*1000){
        return true;
    }else{
        d_alert('错误','用户信息已过期，请重新登陆！','error',function () {
            top.window.location.href = '/page/index.html';
        });
        return false;
    }
}
function getUserInfo(t) {
    var _storage = window.localStorage,
        _tokenInfo = _storage.getItem("tokenInfo"),
        _userInfo = _storage.getItem("userInfo"),
        _info;

    if (!_tokenInfo || _tokenInfo == null) {
        return null;
    } else {
        if (t == 1) {
            _info = JSON.parse(_userInfo);
        }
        else {
            _info = JSON.parse(_tokenInfo);
        }
        return _info;
    }
}
//按钮增加
function getTdOperate(_type, url_add, fid, key, key_field, key1, key_field1) {
    var _add = "<a href='" + url_add + "?fid=" + fid + "&" + key + "=" + key_field + "' class='btn btn-success btn-mini' href='javascript:void(0);' title='添加'>添加</a>";
    var _edit = "<a href='" + url_add + "?fid=" + fid + "&" + key + "=" + key_field + "&rtype=edit' class='btn btn-primary btn-mini edit' href='javascript:void(0);' title='修改'>修改</a>";
    var _del = "<a class='btn btn-danger btn-mini del' href='javascript:void(0);' title='删除' fid='" + fid + "' " + key + "='" + key_field + "'>删除</a>";
    var _view = "<a class='btn btn-success btn-mini view' href='javascript:void(0);' title='查看' " + key + "='" + key_field + "'>查看</a>";
    var _place = "<a class='btn btn-success btn-mini place' href='javascript:void(0);' title='定位' " + key + "='" + key_field + "'>定位</a>";
    var _signIn = "<a class='btn btn-success btn-mini signIn' href='javascript:void(0);' title='签到' " + key + "='" + key_field + "'" + key1 + "='" + key_field1 + "'>签到</a>";
    var _audit = "<a class='btn btn-success btn-mini audit' href='javascript:void(0);' title='审批' " + key + "='" + key_field + "'>审批</a>";

    if (_type == 6) {
        return  _edit +"&nbsp;"+ _del;
    }
}
function confirm_add_ok(res, url_back, func) {
    if (res.code == '1') {
        top.swal({
            title: res.info + " 是否继续?",
            type: "success",
            showCancelButton: true,
            cancelButtonText: "不了",
            confirmButtonText: "继续",
            confirmButtonColor: "#49bf67",
            closeOnConfirm: false,
            allowOutsideClick: false
        }).then(function (isConfirm) {
            if (isConfirm) {
                func();
                top.swal.closeModal();
            }
            else {
                if (url_back != "") {
                    window.location.href = url_back;
                }
            }
        });
    }
    else{
        d_alert("错误!", res.info, "error");
    }
}
//删除方法
function setDelete(_key, _code) {
    $(".del").on("click", function () {
        var _this = $(this);
        dqq_confirm("确定要删除吗？", function () {
            eval("var sendObj={" + _key + ":'" + _this.attr(_key) + "'}");
            _call(_code, sendObj, function (res) {
                var notice_type = "error";
                if (res.code == 1) {
                    notice_type = "success"
                }
                d_alert("提示", res.info, notice_type);
                _this.parents("tr").remove();
            });
        })
    });
}
//设置分页
function setPagination(pDom, pSize, pCount, func) {
    var titlestrtemp = $(".box-header:eq(1) > .title").text();
    titlestrtemp = titlestrtemp.replace(/共[0-9]+条/, '');
    $(".box-header:eq(1) > .title").text(titlestrtemp);
    if (!pDom.text() || "" == pDom.text()) {
        if (pDom.length) {
            if (pSize == "1" && pCount == "1") {
                //d_alert("提示","暂无数据","info");
                pDom.text("暂无数据");
            } else {
                if (pCount > 0) {
                    var titlestr = $(".box-header:eq(1) > .title").text();
                    $(".box-header:eq(1) > .title").text(titlestr + "   共" + pCount + "条");
                }
                if (pSize == 1 && pCount == 1 && "暂无数据" != pDom.text()) {
                    pDom.pagination('destroy');
                } else {
                    pDom.pagination({
                        pageSize: pSize,
                        total: pCount
                    });
                }
                pDom.on("pageClicked", function (event, data) {
                    func(data.pageIndex, data.pageSize);
                });
            }
        }
    } else if (pSize == 1 && pCount == 1 && "暂无数据" != pDom.text()) {
        pDom.pagination('destroy');
    }
}
//通用绑定查询 增加empty参数 判断是否需要清空原有数据
function bindSearch(_dom, type1, type2, type3, callback) {
    if (_dom.children("[value='']").length>0) {
        var _html = _dom.children("[value='']");
    }else if(_dom.children("[value='-1']").length>0){
        var _html = _dom.children("[value='-1']");
    }
    _dom.html("");
    if (_html) _dom.append(_html);
    var aSynSta = true;
    type3 = type3 || 0;
    callback = callback || null;
    if (_dom.length) {
        var _code, key_value, key_name;
        var sendObj = { "msgBody": "" };
        switch (type1) {
            case 1:
                //学院信息
                _code = "/College/SearchCollege";
                key_value = "fcollegeNo";
                key_name = "fcollegeName";
                sendObj = {
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 2:
                //班级信息
                _code = "/Class/SearchClass";
                key_value = "fclassNo";
                key_name = "fclassName";
                sendObj = {
                    "msgBody":{
                        "fcollegeNo":type2?type2:""
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 3:
                //教师信息
                _code = "/Course/SearchCourse";
                key_value = "fcourseNo";
                key_name = "fcourseName";
                sendObj = {
                    "msgBody":{
                        "fcourseNo":type2?type2:""
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 4:
                //教师信息
                _code = "/Teacher/SearchTeacher";
                key_value = "fteacherNo";
                key_name = "fname";
                sendObj = {
                    "msgBody":{
                        "fname":"",
                        "ftel":""
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 5:
                //课程方案列表查询
                _code = "/CourseCase/SearchCourseCase";
                key_value = "fcaseNo";
                key_name = "fcaseName";
                sendObj = {
                    "msgBody":{
                        "fclassNo":type2?type2:""
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 6:
                //正式课程查询
                _code = "/FormalCourse/SearchFormalCourse";
                key_value = "fformalNo";
                key_name = "fcourseName";
                sendObj = {
                    "msgBody":{
                        "fclassNo":type2?type2:"",
                        "fweekNumber":type3?type3:"1"
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
            case 7:
                //正式课程 展现文字为上课时间+课程名
                _code = "/FormalCourse/SearchFormalCourse";
                key_value = "fformalNo";
                key_name = "fcourseName";
                sendObj = {
                    "msgBody":{
                        "fclassNo":type2?type2:"",
                        "fweekNumber":type3?type3:"1"
                    },
                    "pageSetBody": { "pageNo": 0, "pageSize": "-1" }
                };
                break;
        }

        _call(_code, sendObj, function (res) {
            if (res.resultBody ) {
                if (type1 == 6) {
                    //特殊需要预留
                    $.each(res.resultBody, function (i, v) {
                        _dom.append("<option value='" + v[key_value] + "'>" + v[key_name] + "</option>");
                    });
                }else if(type1 == 7){
                    $.each(res.resultBody, function (i, v) {
                        _dom.append("<option value='" + v[key_value] + "'>" + v['fstartTime'].substring(5) +"&nbsp;"+ v[key_name] + "</option>");
                        // _dom.append("<option value='" + v[key_value] + "'>" + v[key_name] + "</option>");
                    });
                }
                else {
                    $.each(res.resultBody.pageObjBody, function (i, v) {
                        _dom.append("<option value='" + v[key_value] + "'>" + v[key_name] + "</option>");
                    });
                }
                if (callback) {
                    callback();
                }
            }
        }, aSynSta);

    }
}
//获取缓存中的值
function getLocalData(_key){
    if(_key){
        var data = window.localStorage.getItem(_key);
        if(data){
            return JSON.parse(data);
        }else{
            return false;
        }
    }
}
//设置搜索方法
function setSearch(pDom, func) {
    if ($(".d_search").length) {
        var _this = $(".d_search");
        _this.on("click", function () {
            let _status = JSON.parse(window.localStorage.getItem("pageScreenStatus")),
                pageNo = 0,
                pSize = 20;
            if (pDom && pDom.text()) {
                if (pDom.length > 0 && "暂无数据" != pDom.text()) {
                    pDom.pagination('destroy');
                } else {
                    pDom.text("");
                }
            }
            func(pageNo,pSize);
        });
    }
}
function dqq_confirm(str, func) {
    top.swal({
        title: str,
        type: "question",
        showCancelButton: true,
        cancelButtonText: "取消",
        confirmButtonText: "确定",
        confirmButtonColor: "#d33",
        closeOnConfirm: false
    }).then(function (isConfirm) {
        if (isConfirm) {
            func();
        }
    });
}
"use strict"
/*
* 课程表拼接
* DOM table的jquery元素
* option { 课程表配置
*   weekName 周一至周日名称  数组 默认：["周一","周二","周三","周四","周五","周六","周日"]
*   weekNum 显示几天的课程 number 默认：5，
*   dayName 左侧显示具体的课程 默认：{"上午":["1-2节","3-4节"],"下午":["5-6节","7-8节"],"晚上":["9-10节"],}
*   isClick 是否绑定点击事件  默认true
* }
* */
class setClassTable{
    constructor(DOM,option){
        //预留配置信息
        this.defaultOption = {
            "weekName" :  ["周一","周二","周三","周四","周五","周六","周日"],
            "weekNum" : 5,
            "dayName" : {
                "上午":["1-2节","3-4节"],
                "下午":["5-6节","7-8节"],
                "晚上":["9-10节"]
            },
            "isClick":true,
            "isSignIn" : false
        };
        this.DOM = DOM;
        this.option = $.extend(true,{},this.defaultOption,option);
    }
    init(){
        //拼接table
        this.joinTable();
        //绑定单击事件
        if(this.option.isClick || this.option.isSignIn) this.courseClick();
    }
    joinTable(){
        let that = this,
            _theadHtml = "",
            _tbodyHtml = "",
            dayNum = 1;

        //拼接thead
        _theadHtml += `<tr><th class="title" week="0" colspan="2"></th>`;
        $.each(that.option.weekName.slice(0,this.option.weekNum),(i,v)=>{
            _theadHtml += `<th class="week" week="${i+1}">${v}</th>`;
        })
        _theadHtml += "</tr>";
        that.DOM.find("thead").html(_theadHtml);

        //拼接tbody
        $.each(that.option.dayName,(i,v)=>{
            $.each(v,(ii,vv)=>{
                if(ii==0) _tbodyHtml += `<tr><td rowspan="${v.length}">${i}</td>`;
                _tbodyHtml += `<td day="${dayNum}">${vv}</td>`;
                $(".week").each((index,value)=>{
                    _tbodyHtml += `<td id="w_${$(value).attr("week")}d_${dayNum}" class="course" week="${$(value).attr("week")}" day="${dayNum}"></td>`;
                })
                dayNum++;
                if(ii==0) _tbodyHtml += `</tr>`;
            })
        })
        that.DOM.find("tbody").html(_tbodyHtml);

    }
    courseClick(){
        let that = this;
        //td点击事件
        $(".course").click(function(e){
            if(!that.option.isSignIn){
                if($(e.target).hasClass("clear")){
                    dqq_confirm("确定删除吗？",()=>{
                        $(e.target).parents("td").html("").removeClass("active");
                        top.swal.close();
                    })
                }else{
                    if($(this).hasClass("active")){
                        //如果点击的是已经保存过的课程 填充对应值
                        let _value = JSON.parse($(this).find("input").val());
                        that.addValue(_value);
                    }
                    $("#couseid").val($(this).attr("id"))
                    $(".modal").modal("show");
                }
            }else{
                let clickValue = JSON.parse($(this).find("input").val());
                //如果是签到页面  点击td弹出模态框
                $("#signInModal").modal('show');
                qrCode.makeCode(_url+"/page/tpl/wechat/userSignIn.html?fformalNo="+clickValue["fformalNo"]+"&fteacherNo="+clickValue["fteacherNo"]);
            }

        })
        //保存按钮事件
        $("#courseAdd").click(()=>{
            let that = this;
            that.setTdData();
            $(".modal").modal("hide");
        })
        //模态框隐藏事件
        $(".modal").on("hidden.bs.modal",()=>{
            that.addValue();
        })
    }
    setTdData(data={}){
        let that = this,
            _html = "<div>",
            _id = data.fnumber ? data.fnumber : $("#couseid").val(),
            _value = {
                "fcourseNo" : that.dataIsNull(data.fcourseNo,$("#fcourseNo").val()),
                "fcourseName" : that.dataIsNull(data.fcourseName,$("#fcourseNo option:checked").text()),
                "fteacherNo" : that.dataIsNull(data.fteacherNo,$("#fteacherNo").val()),
                "fteacherName" : that.dataIsNull(data.fteacherName,$("#fteacherNo option:checked").text()),
                "fcollegeNo" : that.dataIsNull(data.fcollegeNo,$("#fcollegeNo").val()),
                "fweekNumber" : data.fweekNumber?data.fweekNumber:"",
                "fclassNo" : that.dataIsNull(data.fclassNo,$("#fclassNo").val()),
                "fstartTime" : that.dataIsNull(data.fstartTime,that.setTime($("#fstartTime").val(),_id,1)),
                "fendTime" : that.dataIsNull(data.fendTime,that.setTime($("#fstartTime").val(),_id,2)),
                "fcaseNo" : that.dataIsNull(data.fcaseNo,$("#fcaseNo").val()),
                "fremark" : that.dataIsNull(data.fremark,$("#fremark").val()),
                "fnumber" : _id
            };
        if(that.option.isSignIn) _value['fformalNo'] = data.fformalNo;
        //拼接td的数据
        _html += `
                <input type="hidden" value='${JSON.stringify(_value)}'/>
                <div>
                    ${_value.fcourseName}</br>
                    ${_value.fteacherName}</br>
                    <p class="causeFremark">${_value.fremark}</p>
                </div>
                `;
         if(that.option.isClick && !that.option.isSignIn) _html += `<span class="glyphicon glyphicon-remove clear"></span>`;
        _html += "</div>";
        $("#"+_id).html(_html).addClass("active");
    }
    dataIsNull(data,data2){
        if(data != undefined && data != null){
            return data;
        }else{
            return data2;
        }
    }
    addValue(data){
        //初始化对应select
        if(data){
            $("#fcourseNo").val(data.fcourseNo).change();
            $("#fteacherNo").val(data.fteacherNo).change();
            $("#fremark").val(data.fremark)
        }else{
            $("#fcourseNo").val($("#fcourseNo option:first-child").val()).change();
            $("#fteacherNo").val($("#fteacherNo option:first-child").val()).change();
            $("#fremark").val("");
        }

    }
    setTime(startTime,id,type){
        //计算对应的开始或者结束时间 type ：1 开始时间 2 结束时间
        // startTime所选择的开始时间
        //startTime = startTime.length==10 ? startTime+" 00:00:00" : startTime;
        let _start = new Date(startTime).getTime(),
            weekNum = $("#"+id).attr("week"),
            dayNum = $("#"+id).attr("day"),
            addOrReduce = type==3?"-":"+";

        //计算出第几天
        _start += (weekNum*1-1) * (60*60*24*1000);
        switch (dayNum*1){
            case 1 :
                //第一节 8：00
                eval('_start '+ addOrReduce+'= 8*60*60*1000');
                break;
            case 2 :
                //第二节 10:10
                eval('_start '+ addOrReduce+'= 10*60*60*1000 + 10*60*1000');
                break;
            case 3 :
                //第三节 14:30
                eval('_start '+ addOrReduce+'= 14*60*60*1000 + 30*60*1000');
                break;
            case 4 :
                //第四节 16:20
                eval('_start '+ addOrReduce+'= 16*60*60*1000 + 20*60*1000');
                break;
            case 5 :
                //第五节 19:00
                eval('_start '+ addOrReduce+'= 19*60*60*1000');
                break;
        }
        if(type == 1){
            return new Date(_start).Format("yyyy-MM-dd hh:mm:ss");
        }else if(type == 2){
            return new Date((_start+(1000*60*100))).Format("yyyy-MM-dd hh:mm:ss");
        }else{
            return new Date(_start).Format("yyyy-MM-dd");
        }
    }
    setData(data,type=true){
        //根据查询出的数据初始化表格  type是否初始化学院 班级等信息  默认true
        let that = this;
        that.init();
        $.each(data,(i,v)=>{
            if(i==0 && type){
                $("#fcollegeNo").val(v.fcollegeNo).change();
                $("#fclassNo").val(v.fclassNo).change();
                $("#fcaseNo").val(v.fcaseNo).change();
                $("#fstartTime").val(that.setTime(v.fstartTime,v.fnumber,3)).change();
            }
            that.setTdData(v);
        })
    }
}
//检测是否通过正常登陆进入页面
function checkUserInfo(){
    let dataTime = new Date().getTime(),
        oldTime = getLocalData("_packet_info").time;
    if(dataTime && oldTime && (dataTime*1 - oldTime*1) < (60*60*2*1000)){
        return true;
    }else{
        return false;
    }
}
//级联select绑定
function setMoreSelect(type,fcollegeNoVal="",fclassNoVal="",fcourseNoVal=""){
    //type 是否绑定查询课程信息  存在即绑定  不存在不绑定
    //查询出学院信息
    bindSearch($("#fcollegeNo"),1,"",null,()=>{
        if(fcollegeNoVal){
            $("#fcollegeNo").val(fcollegeNoVal).change();
        }else{
            $("#fcollegeNo").change();
        }
    });
    $("#fcollegeNo").change(function(){
        //查询出班级信息
        bindSearch($("#fclassNo"),2,$(this).val()?$(this).val():"",null,()=>{
            let val  = $("#fclassNo").find("option:first-child").length>0 ? $("#fclassNo").find("option:first-child").val() : "";
            $("#fclassNo").val(val).change();
        });
    })
    if(type){
        $("#fclassNo").change(function(){
            //查询出班级信息
            bindSearch($("#fformalNo"),7,$(this).val()?$(this).val():"",$("#fweekNumber").length>0?$("#fweekNumber").val():"1",()=>{
                let val  = $("#fformalNo").find("option:first-child").length>0 ? $("#fformalNo").find("option:first-child").val() : "";
                $("#fformalNo").val(val).change();
            });
        })
    }
}
class setUpload{
    constructor(DOM,option){
        this.defaultOption = {
            language : 'zh',
            showCancel:false,
            showRemove:true,
            fileActionSettings:{
                showRemove: true,
                showZoom: true,
                showDrag: true,
                removeIcon: '<i class="glyphicon glyphicon-trash text-danger"></i>',
                removeClass: 'btn btn-xs btn-default',
                removeTitle: 'Remove file',
                uploadIcon: '<i class="glyphicon glyphicon-upload text-info"></i>',
                uploadClass: 'btn btn-xs btn-default',
                uploadTitle: 'Upload file',
                zoomIcon: '<i class="glyphicon glyphicon-zoom-in"></i>',
                zoomClass: 'btn btn-xs btn-default',
                zoomTitle: 'View Details',
                dragIcon: '<i class="glyphicon glyphicon-menu-hamburger"></i>',
                dragClass: 'text-info',
                dragTitle: 'Move / Rearrange',
                dragSettings: {},
                indicatorNew: '<i class="glyphicon glyphicon-hand-down text-warning"></i>',
                indicatorSuccess: '<i class="glyphicon glyphicon-ok-sign text-success"></i>',
                indicatorError: '<i class="glyphicon glyphicon-exclamation-sign text-danger"></i>',
                indicatorLoading: '<i class="glyphicon glyphicon-hand-up text-muted"></i>',
                indicatorNewTitle: 'Not uploaded yet',
                indicatorSuccessTitle: 'Uploaded',
                indicatorErrorTitle: 'Upload Error',
                indicatorLoadingTitle: 'Uploading ...'
            },
            uploadUrl: config['code_upload'],
            uploadAsync: true,
            maxFileCount: 1,
            showBrowse: false,
            browseOnZoneClick: true,
            initialPreviewShowDelete:false
        };
        this.DOM = DOM;
        this.option = $.extend(true,{},this.defaultOption,option);
        this.option.uploadUrl = 'http://47.92.251.237/admin' + this.option.uploadUrl;
        // this.option.uploadUrl = api_base + this.option.uploadUrl;
        // this.option.uploadUrl = 'http://www.donzch.com:8080/upload/image';
        this.init();
    }
    init(){
        this.joinHtml();
        this.bindEvent();
    }
    joinHtml(){
        this.DOM.append(`<input name="file" type="file" class="file hoverImg i1" multiple data-show-upload="false" data-show-caption="true" data-msg-placeholder="请上传${this.option.title ? this.option.title : title}">`)
    }
    bindEvent(){
        let that = this,
            _file = this.DOM.find('[type = file]');
        _file.fileinput(this.option);
        //失败提示
        _file.on('fileerror', function(event, data, msg) {
            console.log(event, data, msg)
        });
        //成功提示
        _file.on('fileuploaded', function(event, data, msg) {
            if(data['response']['code'] == 1){
                if(that.option.urlDom && that.option.urlDom.length > 0){
                    that.option.urlDom.val(data['response']['body'][that.option['responseUrl'] || 'downloadUrl'])
                }
            }else{
                d_alert('错误',data['response']['info'],'error',function(){
                    that.DOM.find(".kv-file-remove").click();
                });
            }

        });
        _file.on("filebatchselected", function(event, files) {
            _file.fileinput("upload");
        });
        // _file.fileinput('upload', function(event, data, msg) {
        //     console.log(event, data, msg)
        // });
    }
}
//设置查询数据
function setPageData(data){
    console.log(data)
    let _storge = window.localStorage.getItem('pageData');
    if(_storge != null && _storge != undefined){
        _storge = JSON.parse(_storge);
        let Obj = {};
        $.each(data,(i,v)=>{
            Obj[v['id']] = v;
        })
        _storge[_page] = Obj;
        window.localStorage.setItem('pageData',JSON.stringify(_storge));
    }
}
//根据id获取对应税局
function getPageData(id){
    let _storge = getLocalData('pageData');
    if(_storge && _storge[_page.split("_")[0]]){
        return _storge[_page.split("_")[0]][id]
    }
}
// 渲染数据时检查是否有空值
function dataIsNull(data){
    if(data != 'null' && data != 'undefined' && data != null && data != undefined){
        return data
    }
    return '--';
}
// 查询条件重新赋值
function autoSearchByCookie(fun){
    let storage = window.sessionStorage.getItem(_page+"data");
    if(storage && $.request.queryString["pageType"]){
        //如果缓存存在 并且是通过返回按钮返回 将查询条件重新赋值
        storage = JSON.parse(storage);
        $.each(storage['sendObj'],(i,v)=>{
            $("#"+i).val(v);
    })
        fun(storage['pageSetBody']['pageNo'],storage['pageSetBody']['pageSize'])
    }else{
        fun()
    }
}