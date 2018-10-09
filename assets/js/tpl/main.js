"use strict"
$(function(){
    if(!checkUserInfo()){
        d_alert('错误',"用户信息已过期!",'error');
        window.location.href = "/page/index.html";
    }else{

    }
    //每页查询data数据存放
    window.localStorage.setItem('pageData',"");
    $(".Hui-aside").Huifold({
        titCell:'.menu_dropdown dl dt',
        mainCell:'.menu_dropdown dl dd',
    });
})


//关闭加载框
$(".closeModal").click(function(){
    getMainDom("hide");
})
$("#loginOut").click(()=>{
    window.location.href = "/page/index.html";
})
class setIcon {
    constructor(data){
        this.data = data;
        this.stairList = "";
        this.secondList = {};
    }
    init(){
        let that = this;
        that.joinData();
        that.setSecondHtml();
        // $(".Hui-aside").Huifold({
        //     titCell:'.menu_dropdown dl dt',
        //     mainCell:'.menu_dropdown dl dd',
        // });
    }
    joinData(){
        let that = this;
        $.each(that.data.resultBody,(i,v)=>{
            if(v.flevelNo == "1"){
                that.stairList+=`
                    <dl id="stair_${v.fmenuNo}" fmenuNo="${v.fmenuNo}">
                        <dt><i class="Hui-iconfont"></i>${v.fmenuName}<i class="Hui-iconfont menu_dropdown-arrow"></i></dt>
                        <dd style="display: none;">
                            <ul></ul>
                        </dd>
                    </dl>
                `;
            }else if(v.flevelNo == "2"){
                let _name = v.fmenuNo.substring(0,3)
                if(!that.secondList[_name]){
                    that.secondList[_name] = "";
                }
                //业务需求 单击计划课程时，先查询班级信息
                if(v.fmenuName == "计划课程"){
                    that.secondList[_name] += `
                        <li><a data-href="/tpl/classInfo.html?page=planCourse" data-title="${v.fmenuName}" href="javascript:void(0)">${v.fmenuName}</a></li>
                    `;
                }else{
                    that.secondList[_name] += `
                        <li><a data-href="${_dir+v.fmenuURL}" data-title="${v.fmenuName}" href="javascript:void(0)">${v.fmenuName}</a></li>
                    `;
                }
            }
        })
        $(".menu_dropdown").html(that.stairList);
    }
    setSecondHtml(){
        let that = this;
        $.each(that.secondList,(i,v)=>{
            $("#stair_"+i+"0 ul").html(v);
        })
    }
}
//消息
class setInfo{
    constructor (){
        this.data = {};
        this.setSearch();
        setInterval(()=>{
            this.setSearch();
        },60*1000)
    }
    setSearch(pageNo=0,pageSize=5){
        let that = this,
            infoObj = {
            "msgBody":{},
            "pageSetBody":{
                "pageNo":pageNo,
                "pageSize":pageSize
            }
        };
        _call("/Notice/SearchNoticeList",infoObj,res => {
            if(res.sta == "ok"){
                that.joinDom(res);
            }
        })
    }
    joinDom(res){
        let _trs = "",
            that = this;
        if (res.resultBody) {
            let info = 0;
            $.each(res.resultBody.pageObjBody,function(i,v){
                that.data[v.fnoticeNo] = v;
                var iconColor = "<i class='icon iconfont text-error'>&#xe933;</i>";
                if(v.freadStatus != 0){
                    iconColor = `<i class='icon iconfont text-error old' style="color:#ddd!important;">&#xe933;</i>`;
                }else{info++;}
                _trs=_trs+`
                <li class="info" num="${i}" thisno="${v.fnoticeNo}">
                    <a href="javascript:void(0);">
                        <div class="widget-body">
                            <div class="pull-left icon">
                                ${iconColor}
                            </div>
                            <div class="pull-left text">
                                <p class="messageInfo">${v.fnoticeBody}</p>
                                <small class="muted pull-right">${v.fcreatedTime}</small>
                            </div>
                        </div>
                    </a>
                </li>
				 <li class='divider'></li>`;
            });
            $("#infoNum").text((info*1 == 0 ? "" : info));
            //上一页下一页样式
            var page = res.resultBody;
            if(page.count>5){
                if(page.pageNo=="0"){
                    _trs=_trs+`<li>
                                    <div class=' text-center'>
                                        <button class="btn btn-warning size-MINI infoBtn radius readAll">全部已读</button>
                                        <button pageNo="${page.pageNo*1+1}" class='btn btn-success size-MINI infoBtn nextInfo radius'>下一页</button>
                                    </div>
                                </li>`;
                }else if((page.pageNo+1)*5>page.count || (page.pageNo+1)*5 == page.count){
                    _trs=_trs+`<li>
                                <div class=' text-center'>
                                <button class="btn btn-warning size-MINI radius infoBtn readAll">全部已读</button>
                                    <button pageNo="${page.pageNo*1-1}" class='btn btn-success size-MINI prevInfo infoBtn radius'>上一页</button>
                                </div>
                            </li>`;
                }else{
                    _trs=_trs+`<li>
                            <div class=' text-center'>
                            <button class="btn btn-warning size-MINI radius infoBtn readAll">全部已读</button>
                                <button pageNo="${page.pageNo*1-1}" class='btn btn-success size-MINI prevInfo infoBtn radius'>上一页</button>
                                <button pageNo="${page.pageNo*1+1}" class='btn btn-success size-MINI nextInfo infoBtn radius'>下一页</button>
                            </div>
                        </li>`;
                }
            }
            $("#ToDoList").html(_trs);
            that.bindClick();
        }
    }
    bindClick(){
        let that = this;
        console.log(that.data)
        $(".info").click(function(){
            let _data = that.data[$(this).attr('thisno')];
            that.isNew($(this));
            swal({
                width: 1100,
                allowOutsideClick: false,
                showCloseButton: true,
                showConfirmButton: false,
                animation: false,
                html: `
                    <div class="wrapper-content">
                        <section>
                            <div class="container-fluid">
                                <div class="row-fluid mt10" id="content-wrapper">
                                    <div class="tabbable">
                                        <div class="tab-pane active" id="retab1">
                                            <div id="dispatchOrder_wrap"></div>
                                        </div>
                                        <div class="well" style="margin:0;">
                                            <p class="text-left-i">&nbsp;&nbsp;&nbsp;&nbsp;<span class="infoBody">${_data.fnoticeBody}</span></p>
                                            <p class="fcreatedTime text-right-i">${_data.fcreatedTime}</p>
                                            <p class="creatName text-right-i">${_data.fcreatorName}</p>
                                        </div>
                                    </div>
                                    
                                </div>
                            </div>
                        </section>
                    </div>
                `
            });
        })
        $(".infoBtn ").click(function(){
            if($(this).hasClass("prevInfo") || $(this).hasClass("nextInfo")){
                //如果点击的是上一页或者下一页
                that.setSearch($(this.attr("pageNo")))
            }else{
                //如果点击的是全部已读
                dqq_confirm("确认全部修改为已阅读吗？",()=>{
                    _call("",{"msgBody":{}},()=>{
                        top.swal.close();
                    })
                })
            }
        })
    }
    isNew(DOM){
        if(DOM.find(".old").length>0){

        }else{
            DOM.find(".iconfont").css("cssText","color:#ddd!important").addClass("old");
            $("#infoNum").html(parseInt($("#infoNum").html())-1);
            _call("/Notice/ChangeReadStatus",{msgBody:{"fnoticeNo":DOM.attr('thisno')}});

        }
    }
}