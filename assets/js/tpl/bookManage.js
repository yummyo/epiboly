var title = "图书管理";
var config = {
    url_page: _dir + "bookManage.html",
    url_add: _dir + "bookManage_add.html",
    title_page: title + "查询",
    title_list: title + "列表",
    title_add: "添加" + title,
    title_edit: "修改" + title,
    code_list: "/book/query",
    code_delete: "/book/del",
    code_add: "/book/add",
    code_edit: "/book/alter",
    code_dataUpload: "/book/upload",
    code_imgUpload: "/book/coverUpload",
    pagination_01: $("#page_01")
};
$(document).ready(function () {
    if (_page == "bookManage") {
        setTitle_01(config['title_list'], config['title_page'], config['url_add']);
        setDefaultDate($("#startTime"),$("#endTime"))
        //加载事件
        var _trs, _pageSize, _pageCount;
        var setData = function (pIndex, pSize) {
            pIndex = pIndex || 0;
            pSize = pSize || 20;
            var pageSetBody = { "pageNo": pIndex, "pageSize": pSize };
            var sendObj = {
                "fcompanyId": getUserInfo(0).fcompanyId,
                "frealName": $("#srealName").val(),
                "pageSetBody": pageSetBody
            };
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
                    $.each(res.msgBody.pageOutBody.pageObjBody, function (i, v) {
                        _trs = _trs + "<tr><td>" + (i + 1) + "</td><td>" + v.frealName + "</td><td>" + v.fmobile + "</td><td>" + v.fidcardNo + "</td><td>" + v.flicenseTypeName + "</td><td>" + v.fstaffTypeName + "</td><td>" + v.fdepartmentNames + "</td><td>" + getFormatDate(1, v.fzgzdqDate) + "</td><td>" + getText_fisAbled(v.fisAbled, 1) + "</td><td>" + getTdOperate(6, config['url_add'], v.fid, "fstaffNo", v.fstaffNo) + "</td></tr>";
                    });
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
        // setSearch(config['pagination_01'], loadingAll);
    }
    else if (_page == "bookManage_add") {
        var sendObj2 = {};

        var projectfileoptions = {
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
            uploadUrl: "localhost:8893",
            uploadAsync: true,
            maxFileCount: 1,
            showBrowse: false,
            browseOnZoneClick: true,
            allowedPreviewTypes : [ 'image' ],
            allowedFileExtensions : [ 'jpg', 'png', 'gif' ,'jpeg','JPG','PNG','GIF','JPEG'],
            initialPreviewShowDelete:false
        }
        $("#idCardParent").append(`<input id="idCard" name="idCard[]" type="file" class="file hoverImg i1" multiple data-show-upload="false" data-show-caption="true" data-msg-placeholder="请上传图书封面">`)
        $("#businessParent").append(`<input id="business" name="business[]" type="file" class="file hoverImg i2" multiple data-show-upload="false" data-show-caption="true" data-msg-placeholder="请上传图书">`);
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
                    $("#idCard,#business").fileinput(projectfileoptions);
                }
                else if (_fid != "" && _fstaffNo != "" && _rtype == "edit") {
                    //修改
                    this.set_msgId(config['code_edit']);
                    this.set_fid(_fid);
                    setTitle_02(config['title_edit'],config['url_page']);
                    sendObj2['fid'] = _fid;

                    //加载数据
                    var sendObj = {
                        "fstaffNo": $.trim(_fstaffNo)
                    };
                    _call(config['code_detail'], sendObj, function (res) {
                        if (res.msgBody) {
                            var _v = res.msgBody;
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
            if ($(".validate-form").valid()) {
                sendObj2["name"] = $("#name").val();
                sendObj2["describe"] = $("#describe").val();
                sendObj2["coverUrl"] = $("#coverUrl").val();
                sendObj2["downloadUrl"] = $("#downloadUrl").val();
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