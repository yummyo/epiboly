var title = "apk";
var config = {
    url_page: _dir + "apk.html",
    url_add: _dir + "apk_add.html",
    title_page: title + "查询",
    title_list: title + "列表",
    title_add: "添加" + title,
    title_edit: "修改" + title,
    code_list: "/apk/query",
    code_delete: "/apk/del",
    code_add: "/apk/add",
    code_edit: "/apk/alter",
    code_upload: "/apk/upload",
    pagination_01: $("#page_01")
};
$(document).ready(function () {
    if (_page == "apk") {
        setTitle_01(config['title_list'], config['title_page'], config['url_add']);
        setDefaultDate($("#startTime"),$("#endTime"))
        //加载事件
        var _trs, _pageSize, _pageCount;
        var setData = function (pIndex, pSize) {
            pIndex = pIndex || 0;
            pSize = pSize || 20;
            var pageSetBody = { "pageNo": pIndex, "pageSize": pSize };
            var sendObj = {
                "apkVersion": $("#apkVersion").val(),
                "startTime": $("#startTime").val(),
                "endTime": $("#endTime").val(),
            };
            $.extend(sendObj,pageSetBody);
            _call(config['code_list'], sendObj, function (res) {
                _trs = "";
                if (!res.msgBody) {
                    _trs = "";
                    _pageSize = 1;
                    _pageCount = 1;
                }
                else {
                    _pageSize = res.msgBody.pageOutBody.pageSize;
                    _pageCount = res.msgBody.pageOutBody.count;
                    $.each(res.body, function (i, v) {
                        _trs = _trs + `<tr>
                            <td>${i+1}</td>
                            <td>${v['apkVersion']}</td>
                            <td>${v['apkDescribe']}</td>
                            <td>${v['apkUrl']}</td>
                            <td>${getTdOperate(6, config['url_add'], v.id, "id", v.id)}</td>
                        </tr>`;
                    });
                    setPageData(res.body);
                }
                $("#table_01 tbody").html(_trs);

                //绑定删除事件
                setDelete("fstaffNo", config['code_delete']);

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
    else if (_page == "apk_add") {
        var sendObj2 = {};
        //初始化
        var PageInit = function () {
            var _fid = $.trim($.request.queryString["fid"]);
            var _fstaffNo = $.trim($.request.queryString["fstaffNo"]);
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
                    new setUpload($("#idCardParent"),{"urlDom":$("#apkUrl")});
                }
                else if (_fid != "" && _fstaffNo != "" && _rtype == "edit") {
                    //修改
                    this.set_msgId(config['code_edit']);
                    this.set_fid(_fid);
                    setTitle_02(config['title_edit'],config['url_page']);
                    sendObj2['fid'] = _fid;
                    if (getPageData(_fstaffNo)) {
                        var _v = getPageData(_fstaffNo);
                        var formObj = new Form();
                        formObj.init(_v);
                        new setUpload($("#idCardParent"),{"urlDom":$("#apkUrl")});
                    }
                }

            }
        };
        var _default = new PageInit();
        _default.setDefault();

        //提交事件
        $(".validate-form .submit").on("click", function () {
            var _this = $(this);
            if ($(".validate-form").valid()) {
                sendObj2["apkVersion"] = $("#apkVersion").val();
                sendObj2["apkUrl"] = $("#apkUrl").val();
                sendObj2["apkDescribe"] = $("#apkDescribe").val();
                _call(_default.get_msgId(), sendObj2, function (res) {
                    confirm_add_ok(res, config['url_page'], function () {
                        window.location.href = window.location.href;
                    });
                });

            }
        });
    }
    // $(".select2").select2();
});