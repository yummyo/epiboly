/**
 * Created by wsg on 2018-1-15.
 */

// map 地图对象 route 线路规划对象  marker 图标对象
var map, route, marker;
var url = "";
// 线路执行监听器
var routeCompleteListener=null;
var siteLogo=api_base+'/assets/images/siteLogo.png',siteLogo1=api_base+'/assets/images/siteLogol.png',carlogo=api_base+'/assets/images/car.png';

// sites站点对象集合 ,getsta=0 获取站点和车辆信息的状态 1 只能获取到站点 2 站点和车辆都获取到 ,carinfo 车辆信息 ,carPosition 运单最新位置,lastcarPosition 车辆最后一次的位置;
var sites,getsta=0,carinfo,carPositionMarker,lastcarPosition;

var sitebigIcon,siteligIcon,carIcon;

//线路状态  1 只有站点  2 站点车辆混合
var lineSta=1;
$(function(){
    if(_page="wccyrCarLocation"){
        $("#tableParent").height($(window).height()*1-$("#topBox").height()*1)
        //规划线路的点集合
        var path = [];
        //基本地图加载
        map = new AMap.Map("carMap",{
            resizeEnable: true
        });
        var fplateNo = $.trim($.request.queryString["fplateNo"]);
        var floadDate = $.trim($.request.queryString["floadDate"]);
        var funloadDate = $.trim($.request.queryString["funloadDate"]);
        AMapUI.load(['ui/misc/PathSimplifier','ui/overlay/SimpleMarker'], function(PathSimplifier,SimpleMarker) {
            if (!PathSimplifier || !PathSimplifier.supportCanvas) {
                d_alert("错误","网络异常请刷新页面重试！","error",function(){
                    window.location.href = window.location.href;
                });
            }
            var pathSimplifierIns = new PathSimplifier({
                zIndex: 100,
                //autoSetFitView:false,
                map: map, //所属的地图实例
                getPath: function(pathData, pathIndex) {
                    return pathData.path;
                },
                getHoverTitle: function(pathData, pathIndex, pointIndex) {
                    if (pointIndex >= 0) {
                        return pathData.name + '，点：' + pointIndex + '/' + pathData.path.length;
                    }
                    return pathData.name + '，点数量' + pathData.path.length;
                },
                renderOptions: {
                    renderAllPointsIfNumberBelow: 100 //绘制路线节点，如不需要可设置为-1
                }
            });
            window.pathSimplifierIns = pathSimplifierIns;

            //车辆定位被单击时
            $("#dingwei").click(function(){
                carSearch(2)
            })
            //查询车辆轨迹
            $("#guiji").click(function(){
                carSearch(1)
            })
            //清空table
            $(".clearAll").click(function(){
                $("#table_01 tbody").empty();
            })
            //当通过承运单页面跳转过来时
            if(fplateNo && floadDate && funloadDate){
                $("#struckTypeCode").val(fplateNo).attr("readonly","true");
                $("#sstartTime").val(floadDate).hide();
                $("#sstartTime_copy").val(floadDate).show();
                $("#sendTime").val(funloadDate).hide();
                $("#sendTime_copy").val(funloadDate).show();
                $("#fanhui").attr("href",_dir + "wccyrLoadList.html").css("display","inline-block");
                carSearch(1)
            }
            /*
            * _type 1 轨迹查询 2定位查询
            * */
            function carSearch(_type){
                if(_type == 1){
                    var _Time = new Date().getTime()*1;
                    var carSign = $("#struckTypeCode").val();
                    var startDate = $("#sstartTime").val();
                    var endDate = $("#sendTime").val();
                    if(!carSign){
                        d_alert("错误","请输入车牌号！","error");
                        return;
                    }else if(!startDate || !endDate){
                        d_alert("错误","请选择时间！","error");
                        return;
                    }else if(_Time<new Date($("#sstartTime").val()).getTime()*1 || _Time<new Date($("#sendTime").val())*1){
                        d_alert("错误","时间范围选择错误，不能超过当前时间！","error");
                        return;
                    }
                    var data = {
                        "msgBody":{
                            "carSign":carSign,
                            "startDate":startDate,
                            "fcarcolor":$("#fcarcolor").val(),
                            "endDate":endDate
                        }
                    }
                    data = JSON.stringify(data)
                    $.ajax({
                        url:url+"/WccyrDispatchOrder/GetCarHistory",
                        type:"post",
                        data:{"msg":data},
                        success:function(res){
                            if(!res){
                                d_alert("错误","未查询到数据","error")
                                return;
                            }
                            res = JSON.parse(res)
                            if(res.result && res.result.length>0){
                                if(!res.result[0].pos){
                                    d_alert("错误","起点时间超出范围！","error")
                                    return;
                                }
                                if(!res.result[res.result.length-1].pos){
                                    d_alert("错误","终点时间超出范围！","error")
                                    return;
                                }
                                map.clearMap();
                                //经纬度数组
                                var lgAndLt = [];
                                //状态栏信息拼接
                                var trs = "";
                                $.each(res.result,function(i,v){
                                    var time = new Date(v.gpsTime).Format("yyyy-MM-dd hh-mm-ss");
                                    trs += `<tr><td>${i+1}</td><td>${time}</td><td>${v.pos}</td><td>${v.alarmInfo?v.alarmInfo:"正常"}</td></tr>`;
                                    lgAndLt.push([v.lng,v.lat])
                                })
                                $("#table_01").append(trs);
                                //设置数据
                                guiji(lgAndLt)
                                //起点标识
                                sign([lgAndLt[0][0],lgAndLt[0][1]],"起");
                                //终点标识
                                sign([lgAndLt[lgAndLt.length-1][0],lgAndLt[lgAndLt.length-1][1]],"终")
                            }else{
                                d_alert("错误","未查询到数据","error");
                            }
                        }
                    })
                }else if(_type ==2){
                    //清除地图覆盖物
                    map.clearMap();
                    pathSimplifierIns.setData({data:[]});
                    var data = {
                        "msgBody":{
                            "carSign":$("#struckTypeCode").val(),
                            "fcarcolor":$("#fcarcolor").val(),
                            "gpsTime":getTime(2).toString(),
                        }
                    }
                    data = JSON.stringify(data)
                    $.ajax({
                        url:url+"/WccyrDispatchOrder/GetCarPosition",
                        type:"post",
                        data:{"msg":data},
                        success:function(res){
                            if(res){
                                console.log("1")
                                res = JSON.parse(res)
                                if(res.result){
                                    var data = res.result;
                                    //设置中心点和缩放级别
                                    map.setZoom(13);
                                    map.setCenter([data.rectifyLng, data.rectifyLat])
                                    sign([data.rectifyLng, data.rectifyLat],data.carSign)
                                }else{
                                    d_alert("错误","未查询到数据","error");
                                }
                            }else{
                                console.log("2")
                                d_alert("错误","未查询到数据","error");
                            }
                        }
                    })
                }
            }
            /*
            * 标记
            * coordinate 中心点坐标
            * title 标题文字
            * */
            function sign(coordinate,title){
                new SimpleMarker({
                    //前景文字
                    iconLabel: {
                        innerHTML:`<div>${title}</div>`,
                        style:{
                            color:"white"
                        }
                    },
                    showPositionPoint:true,
                    //图标主题
                    iconTheme: 'numv2',
                    //背景图标样式
                    iconStyle: 'blue',
                    //...其他Marker选项...，不包括content
                    map: map,
                    position: coordinate
                });
            }
            /*
            * 轨迹
            * lgAndLt 经纬度坐标数组
            * car 车牌号
            * */
            function guiji(lgAndLt){
                pathSimplifierIns.setData([{
                    name: '路线0',
                    path: lgAndLt,
                    keyPointTolerance:100,
                    pathLineHoverStyle:{"color":"yellow","background":"yellow"}
                }]);

                //对第一条线路（即索引 0）创建一个巡航器
                var navg1 = pathSimplifierIns.createPathNavigator(0, {
                    loop: true, //循环播放
                    speed: 10000 //巡航速度，单位千米/小时
                });
                navg1.start();
            }

        });
        $(".select2").select2();
    }
})

