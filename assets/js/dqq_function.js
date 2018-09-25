function getMyIframe() {
    var _data_id = top.$(".page-tabs-content a.active").data("id");
    var _now_iframe = top.$(".J_iframe[data-id='" + _data_id + "']");
    return _now_iframe;
}
function setIframeHeight() {
    var _content_main;
    if ($("#content-main").length) {
        _content_main = $("#content-main");
    }
    else if (parent.$("#content-main").length) {
        _content_main = parent.$("#content-main");
    }
    if (typeof (_content_main) != "undefined" && _content_main.height() != null) {
        var _height = _content_main.height();
        _height = _height - 81;
        getMyIframe().height(_height);
    }
}
