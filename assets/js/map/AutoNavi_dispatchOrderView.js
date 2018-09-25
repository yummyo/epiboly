/**
 * Created by bcs on 2016-11-23.
 */
// map 地图对象 route 线路规划对象  marker 图标对象
var map, route, marker;
// 线路执行监听器
var routeCompleteListener=null;
var siteLogo=api_base+'/assets/images/siteLogo.png',siteLogo1=api_base+'/assets/images/siteLogol.png',carlogo=api_base+'/assets/images/car.png';

// sites站点对象集合 ,getsta=0 获取站点和车辆信息的状态 1 只能获取到站点 2 站点和车辆都获取到 ,carinfo 车辆信息 ,carPosition 运单最新位置,lastcarPosition 车辆最后一次的位置;
var sites,getsta=0,carinfo,carPositionMarker,lastcarPosition;

var sitebigIcon,siteligIcon,carIcon;

//线路状态  1 只有站点  2 站点车辆混合
var lineSta=1;

//规划线路的点集合
var path = [];
//基本地图加载
map = new AMap.Map("retab7",{
    resizeEnable: true
});

var getDispatchOrderPositionCar;

// 获得指定运单的相关的位置信息
function getDispatchOrderPosition(fdispatchOrderNo){
    sitebigIcon=new AMap.Icon({size:new AMap.Size(24,24),image:siteLogo});
    siteligIcon=new AMap.Icon({size:new AMap.Size(16,16),image:siteLogo1});
    carIcon=new AMap.Icon({size:new AMap.Size(32,32),image:carlogo});
    lineSta=1;
    var sendObj={
        "fdispatchOrderNo":fdispatchOrderNo
    };
    _call("1001001821",sendObj,function(res){
        if(res.msgBody){
            var _v=res.msgBody;
            if(typeof(_v.sites)=="undefined" ||_v.sites==null ||_v.sites=='null' ){
                alert("暂无运单的运输信息！");
                return false;
            }

            getsta=1;
            sites=_v.sites;
            if(typeof(_v.loadList)!="undefined" && _v.loadList!=null && _v.loadList!='null' && typeof(_v.loadList.fplateNo)!="undefined"){
                getsta=2
                carinfo=_v.loadList;
            }
            if(getsta==2){
                getDispatchOrderPositionCar={
                    "fplateNo":carinfo.fplateNo,
                    "fplateColor":carinfo.fplateColor
                };
                _call("1001001823",getDispatchOrderPositionCar,function(res1){
                    if(res1.msgBody){
                        var _v1=res1.msgBody;
                        if(typeof(_v1.carPosition)!="undefined"&& typeof(_v1.carPosition.fgpsTime)!="undefined"){
                            lastcarPosition=_v1.carPosition;
                            setPath(sites,lastcarPosition);
                        }
                    }
                });
            }else if(getsta==1){
                setPath(sites,null);
            }else{
                alert("暂无运单的运输信息！");
            }
        }else{
            alert("暂无运单的运输信息！");
        }
    });
}

function setPath(siteobjs,newcarPosition){
    routeCompleteListener=null;
    lineSta=1;
    if(siteobjs==null || siteobjs.length<1){
        alert("暂无运单的运输信息！");
    }
    if(siteobjs.length>1||(siteobjs.length==1&&newcarPosition!=null)){
        path = [];
        //地图画出线路 标示出最新位置结束
        for(var i=0;i<siteobjs.length;i++) {
            path.push([siteobjs[i].flng, siteobjs[i].flat]);
        }
        if(newcarPosition!=null){
            lineSta=2;
            path.push([newcarPosition.flongitude, newcarPosition.flatitude]);
        }
        map.clearMap();
        map.plugin("AMap.DragRoute", function() {
            route = new AMap.DragRoute(map,path,AMap.DrivingPolicy.LEAST_FEE,{polyOptions:{strokeOpacity:1,isOutline:false,strokeWeight:5,strokeColor:'#FF0000'},startMarkerOptions:{icon:siteligIcon},midMarkerOptions:{icon:siteligIcon},endMarkerOptions:{icon:sitebigIcon},showTraffic:false}); //构造拖拽导航类
            route.search();
            routeCompleteListener=AMap.event.addListener(route,'complete',clearMapSetNewRoad);
        });
    }else{
        //地图增加标注结束
        carPositionMarker=new AMap.Marker({
            map: map,
            position: [siteobjs[0].flng, siteobjs[0].flat],
            icon: sitebigIcon,
            offset:new AMap.Pixel(-12,-12)
        });
       map.setZoomAndCenter(16, [siteobjs[0].flng, siteobjs[0].flat]);
    }
}

function clearMapSetNewRoad(){
    var alllatlngs=route.getRoute();
    map.clearMap();

    for(var i=0;i<path.length;i++) {
        if(lineSta==2){
            if(i==(path.length-1)){
                carPositionMarker= new AMap.Marker({
                    map: map,
                    position: [path[i].lng, path[i].lat],
                    icon: carIcon,
                    offset:new AMap.Pixel(-16,-16)
                });
            }else{
                new AMap.Marker({
                    map: map,
                    position: [path[i].lng, path[i].lat],
                    icon: siteligIcon,
                    offset:new AMap.Pixel(-8,-8)
                });
            }
        }else{
            if(i==(path.length-1)){
                new AMap.Marker({
                    map: map,
                    position: [path[i].lng, path[i].lat],
                    icon: sitebigIcon,
                    offset:new AMap.Pixel(-12,-12)
                });
            }else{
                new AMap.Marker({
                    map: map,
                    position: [path[i].lng, path[i].lat],
                    icon: siteligIcon,
                    offset:new AMap.Pixel(-8,-8)
                });
            }
        }

    }
    var polyline = new AMap.Polyline({
        path:alllatlngs,
        strokeOpacity:1,
        isOutline:false,
        strokeWeight:5,
        strokeColor:'#3d579d'
    });
    polyline.setMap(map);
    if(routeCompleteListener!=null){
        AMap.event.removeListener(routeCompleteListener);//移除事件，以绑定时返回的对象作为参数
    }

    map.setFitView();
    if(lineSta==2){
        setInterval(addCarRunLine,60000);//1 分钟更新一次位置
    }
}

function addCarRunLine(){
    _call("1001001823",getDispatchOrderPositionCar,function(res1){
        if(res1.msgBody){
            var _v1=res1.msgBody;
            if(typeof(_v1.carPosition)!="undefined"&& typeof(_v1.carPosition.fgpsTime)!="undefined"){
                var carRunLine = [];
                carRunLine.push([_v1.carPosition.flongitude,_v1.carPosition.flatitude]);
                carRunLine.push([lastcarPosition.flongitude, lastcarPosition.flatitude]);
                var carRunPolyline = new AMap.Polyline({
                    path:carRunLine,
                    strokeOpacity:1,
                    isOutline:false,
                    strokeWeight:5,
                    strokeColor:'#3d579d'
                });
                carRunPolyline.setMap(map);
                lastcarPosition=_v1.carPosition;
                carPositionMarker.setMap();
                carPositionMarker= new AMap.Marker({
                    map: map,
                    position:[lastcarPosition.flongitude,lastcarPosition.flatitude],
                    icon: carIcon,
                    offset:new AMap.Pixel(-16,-16)
                });

            }
        }
    });

}
