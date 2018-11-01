var title = "问题反馈";
var config = {
    url_page: _dir + "issue.html",
    url_add: _dir + "apk_add.html",
    title_page: title + "查询",
    title_list: title + "列表",
    title_add: "添加" + title,
    title_edit: "修改" + title,
    code_list: "/feedback/query",
    code_delete: "/issue/del",
    code_add: "/issue/add",
    code_edit: "/issue/update",
    code_upload: "/issue/upload",
    pagination_01: $("#page_01")
};
$(document).ready(function () {
    if (_page == "issue") {
        setTitle_01(config['title_list'], config['title_page'], config['url_add']);
        setDefaultDate($("#startTime"),$("#endTime"))
        //加载事件
        var _trs, _pageSize, _pageCount;
        var setData = function (pIndex, pSize) {
            pIndex = pIndex || 1;
            pSize = pSize || 20;
            var pageSetBody = { "pageNo": pIndex, "pageSize": pSize };
            var sendObj = {
                "content": $("#content").val(),
                "startTime": $("#startTime").val(),
                "endTime": $("#endTime").val(),
            };
            window.sessionStorage.setItem(_page+"data",JSON.stringify({
                'sendObj':sendObj,
                'pageSetBody':pageSetBody
            }));
            $.extend(sendObj,pageSetBody);
            _call(config['code_list'], sendObj, function (res) {
                _trs = "";
                if (!res.body || res.body.length == 0) {
                    _trs = "";
                    _pageSize = 1;
                    _pageCount = 1;
                }
                else {
                    _pageSize = res.body.pageSize;
                    _pageCount = res.body.count;
                    $.each(res.body, function (i, v) {
                        _trs = _trs + `<tr>
                            <td>${i+1}</td>
                            <td>${v['userName']}</td>
                            <td>${v['tel']}</td>
                            <td>${v['content']}</td>
                            <td>${changeTime(v['createTime'])}</td>
                            <td>${getTdOperate(6, config['url_add'], v.id, "id", v.id)}</td>
                        </tr>`;
                    });
                    setPageData(res.body);
                }
                $("#table_01 tbody").html(_trs);

                //绑定删除事件
                setDelete("id", config['code_delete']);

                //分页方法
                setPagination(config['pagination_01'], _pageSize, _pageCount, setData);
            });
        };

        var loadingAll = function () {
            //初始化加载数据
            setData();
        }
        autoSearchByCookie(loadingAll);

        //查询方法
        setSearch(config['pagination_01'], loadingAll);
    }
    // $(".select2").select2();
});
function changeTime(time){
    if(time){
        return new Date(time).Format('yyyy-MM-dd hh:mm:ss')
    }
    return "--";
}