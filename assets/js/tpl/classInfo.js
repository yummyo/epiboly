var title = "班级信息";
var config = {
    url_page: _dir + "classInfo.html",
    url_add: _dir + "classInfo_add.html",
    url_jihua: _dir + "planCourse_add.html",
    title_page: title + "查询",
    title_list: title + "列表",
    title_add: "添加" + title,
    title_edit: "修改" + title,
    code_list: "/Class/SearchClass",
    code_delete: "/Class/DeleteClass",
    code_add: "/Class/AddClass",
    code_edit: "/Class/UpdateClass",
    code_detail: "/Class/SearchClassByNo",
    pagination_01: $("#page_01")
};
$(document).ready(function () {
    if (_page == "classInfo") {
        //判断是从哪个地方跳转来的
        var souce = $.trim($.request.queryString["page"]);
        console.log(souce)
        if(souce){
            config["title_list"] = "计划课程班级信息查询";
            config["title_page"] = "计划课程班级信息列表";
            config["code_list"] = "/PlanCourse/SearchClassByPlanCourse";
            config["url_add"] = _dir + "planCourse_add.html";
        }
        setTitle_01(config['title_list'], config['title_page'], config['url_add']);
        //查询学员信息
        bindSearch($("#fcollegeNo"),1,null,null,()=>{
            $("#fcollegeNo").change();
        })
        //加载事件
        var _trs, _pageSize, _pageCount;
        var setData = function (pIndex, pSize) {
            pIndex = pIndex || 1;
            pSize = pSize || 20;
            var pageSetBody = { "pageNo": pIndex, "pageSize": pSize };
            var sendObj = {
                "msgBody":{
                    "fcollegeNo": $("#fcollegeNo").val(),
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
                    $.each(res.resultBody.pageObjBody, function (i, v) {
                        _trs +=`<tr>
                                <td>${i+1}</td>
                                <td>${v.fclassNo?v.fclassNo:""}</td>
                                <td>${v.fclassName?v.fclassName:""}</td>
                                <td>${v.fremark?v.fremark:""}</td>
                                <td>
                                    <a href='${config['url_jihua']}?fid=${v.fid}&fclassNo=${v.fclassNo}&rtype=edit&fcollegeNo=${v.fcollegeNo}' class='btn btn-success btn-mini' href='javascript:void(0);' title='计划课程'>计划课程</a>&nbsp;
                                    ${souce? '' : getTdOperate(2, config['url_add'], v.fid, "fclassNo", v.fclassNo)}
                                </td>
                            </tr>`;
                    });
                }
                $("#table_01 tbody").html(_trs);

                //绑定删除事件
                setDelete("fclassNo", config['code_delete']);

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
    else if (_page == "classInfo_add") {
        var sendObj2 = {};
        //查询出学院信息
        bindSearch($("#fcollegeNo"),1,null,null,()=>{
            $("#fcollegeNo").change();
        });
        //初始化
        var PageInit = function () {
            var _fid = $.trim($.request.queryString["fid"]);
            var _fstaffNo = $.trim($.request.queryString["fclassNo"]);
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
                if (_fid == "" && _fstaffNo == "" && _rtype == "") {
                    //添加
                    this.set_msgId(config['code_add']);
                    this.set_fid(0);
                    setTitle_02(config['title_add'],config['url_page']);
                }
                else if (_fid != "" && _fstaffNo != "" && _rtype == "edit") {
                    //修改
                    this.set_msgId(config['code_edit']);
                    this.set_fid(_fid);
                    setTitle_02(config['title_edit'],config['url_page']);
                    sendObj2['fclassNo'] = _fstaffNo;

                    //加载数据
                    var sendObj = {
                        "fclassNo": $.trim(_fstaffNo)
                    };
                    _call(config['code_detail'], {"msgBody":sendObj}, function (res) {
                        if (res.resultBody) {
                            var _v = res.resultBody;
                            var formObj = new Form();
                            formObj.init(_v);
                        }
                    });
                }

            }
        };
        var _default = new PageInit();
        _default.setDefault();

        //提交事件
        $(".validate-form .submit").on("click", function () {
            var _this = $(this);
            if ($(".validate-form").validate().form()) {
                sendObj2["fclassName"] = $("#fclassName").val();
                sendObj2["fcollegeNo"] = $("#fcollegeNo").val();
                sendObj2["fremark"] = $("#fremark").val();
                _call(_default.get_msgId(), {"msgBody":sendObj2}, function (res) {
                    confirm_add_ok(res, config['url_page'], function () {
                        window.location.href = window.location.href;
                    });
                });

            }
        });
    }
    $(".select2").select2();
});