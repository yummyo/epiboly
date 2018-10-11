var title = "考勤信息";
var config = {
    url_page: _dir + "attendance.html",
    url_add: _dir + "attendance_add.html",
    title_page: title + "查询",
    title_list: title + "列表",
    title_add: "添加" + title,
    title_edit: "学生定位",
    code_list: "/Attendance/SearchAttendanceList",
    code_noList: "/Attendance/SearchNoAttendanceList",
    code_detail: "/Attendance/SearchAttendanceByNo",
    pagination_01: $("#page_01")
};
$(document).ready(function () {
    if (_page == "attendance") {
        let weekNumberHtml = "";
        setTitle_01(config['title_list'], config['title_page'], config['url_add']);
        setMoreSelect(true);
        //第几周的html拼接
        for(var a=1;a<=18;a++){
            weekNumberHtml += `<option value="${a}" num="${a}">第${a}周</option>`;
        }
        $("#fweekNumber").html(weekNumberHtml);
        $("#fweekNumber").change(function(){
            //查询出班级信息
            bindSearch($("#fformalNo"),7,$("#fclassNo").val(),$("#fweekNumber").val(),()=>{
                let val  = $("#fformalNo").find("option:first-child").length>0 ? $("#fformalNo").find("option:first-child").val() : "";
                $("#fformalNo").val(val).change();
            });
        })
        //加载事件
        var _trs, _pageSize, _pageCount;
        var setData = function (pIndex, pSize) {
            pIndex = pIndex || 1;
            pSize = pSize || 20;
            var pageSetBody = { "pageNo": pIndex, "pageSize": pSize };
            var sendObj = {
                "msgBody":{
                    "fformalNo": $("#fformalNo").val()?$("#fformalNo").val():""
                },
                "pageSetBody": pageSetBody
            };
            _call(config['code_list'], sendObj, function (res) {
                _trs = "";

                if (!res.resultBody) {
                    _trs = "";
                    _pageSize = 1;
                    _pageCount = 1;
                }
                else {
                    _pageSize = res.resultBody.pageSize;
                    _pageCount = res.resultBody.count;
                    $.each(res.resultBody, function (i, v) {
                        _trs = _trs + "<tr><td>" + (i + 1) + "</td><td>" + v.fcourseName + "</td><td>" + v.fstartTime + "</td><td>" + v.fteacherName + "</td><td>" + v.fstudentName + "</td><td>" + v.fcreatedTime + "</td><td>" + getTdOperate(4, config['url_add'], v.fid, "fattendanceNo", v.fattendanceNo) + "</td></tr>";
                    });
                }
                $("#table_01 tbody").html(_trs);

                $(".place").click(function(){
                    getNowIframe().attr("src","/page"+ config['url_add']+"?fattendanceNo="+$(this).attr("fattendanceNo"));
                })
                //绑定删除事件
                setDelete("fformalNo", config['code_delete']);
                //分页方法
                setPagination(config['pagination_01'], _pageSize, _pageCount, setData);
            });
        };

        var loadingAll = function () {
            //初始化加载数据
            setData();
        }
        // loadingAll();

        //查询方法
        setSearch(config['pagination_01'], loadingAll);
    }
    else if (_page == "attendance_add") {
        var sendObj2 = {},
            map = new AMap.Map("carMap",{
                resizeEnable: true
            });
        //初始化
        var PageInit = function () {
            var _fid = $.trim($.request.queryString["fid"]);
            var _fstaffNo = $.trim($.request.queryString["fattendanceNo"]);
            var _rtype = $.trim($.request.queryString["rtype"]);
            var _msgId = 0;
            this.get_fid = function () {
                return this._fid;
            };
            this.get_msgId = function () {
                return this._msgId;
            };
            this.set_fid = function (v) {
                this._fid = v;
            }
            this.set_msgId = function (v) {
                this._msgId = v;
            }
            this.setDefault = function (v) {
                    this.set_msgId(config['code_edit']);
                    this.set_fid(_fid);
                    setTitle_02(config['title_edit'],config['url_page']);
                    sendObj2['fid'] = _fid;

                    //加载数据
                    var sendObj = {
                        "fattendanceNo": $.trim(_fstaffNo)
                    };
                    _call(config['code_detail'], {"msgBody":sendObj}, function (res) {
                        if (res.resultBody) {
                            var _v = res.resultBody;
                            var formObj = new Form(),
                                location = [res.resultBody.flocation.split(",")[0],res.resultBody.flocation.split(",")[1]];
                            formObj.init(_v);
                            map.setCenter(location)
                            map.setZoom(18)
                            AMapUI.load(['ui/overlay/SimpleMarker'], function(SimpleMarker) {
                                new SimpleMarker({
                                    //前景文字
                                    showPositionPoint:true,
                                    //图标主题
                                    iconTheme: 'numv2',
                                    //背景图标样式
                                    iconStyle: 'blue',
                                    //...其他Marker选项...，不包括content
                                    map: map,
                                    position: location
                                });
                            });
                        }
                    });

            }
        };
        var _default = new PageInit();
        _default.setDefault();

        //提交事件
        $(".validate-form .submit").on("click", function () {
            var _this = $(this);
            if ($(".validate-form").validate().form()) {
                sendObj2["pictureList"] = pictureList;
                _call(_default.get_msgId(), sendObj2, function (res) {
                    confirm_add_ok(res, config['url_page'], function () {
                        window.location.href = window.location.href;
                    });
                });
            }
        });
    }
    $(".select2").select2();
});

$(".d_searchNoList").on("click", function () {
    $("#noAttendanceModal").modal('show');
    var sendObj = {
        "msgBody":{
            "fformalNo": $("#fformalNo").val()?$("#fformalNo").val():""
        }
    };

    _call(config['code_noList'], sendObj, function (res) {
        _trs = "";

        if (!res.resultBody) {
            _trs = "";
        }
        else {
            $.each(res.resultBody, function (i, v) {
                _trs = _trs + "<tr><td>" + (i + 1) + "</td><td>" + v.fstudentNo + "</td><td>" + v.fname + "</td><td>" + v.fsex + "</td><td>" + v.fclassName + "</td><td>" + v.ftel + "</td></tr>";
            });
        }
        $("#table_02 tbody").html(_trs);
    });
});