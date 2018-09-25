/**
 * @Author liuxintong
 * @Date 2015-6-11
 * @Description 高的地图组件封装
 * @version 
 * ###########################
 * v1.0.0.0 2015-06-11 组件封装
 * ###########################
 * 
 */
(function($) {
	// 插件定义
	$.fn.Map = function(options) {
		var defaults = {
			 mapID:""             // 地图的容器
			,zoom:10                 //地图缩放级别（默认13级）
			,center:{lng:113.82072645
				    ,lat:34.02028346}	//地图中心坐标(经纬度)
			,hotspot:false           //是否开启地图高亮（默认false）
			,dragged:true            //是否支持拖拽
			,animation:true			 //是否支持缩放动画
			,inertia:false			 //惯性滑动效果
			,dblclickZoom:true       //双击放大
			,scrollWheelZoom:true    //鼠标滚轮缩放
			,keyboard:true           //键盘控制
			,animation:false		//缩放动画
			,width:"100%"// 地图的宽度(暂未使用)
			,height:"100%" //地图的高度(暂未使用)
		    /********地图导航设置*********/
			,mapNavigation:{
				             isShow:true //是否显示导航(默认 true)
				             ,type:0     //导航类型（0:标准类型;1:平移和缩放按钮;2:平移按钮;3:缩放按钮;）
				             ,anchor:"LEFT_TOP"    //导航位置()
				             ,offsetX:15 //导航X便宜
				             ,offsetY:10 //导航的Y偏移
				            }
			/*************比例尺配置信息********************/
			,mapScale:{isShow:true //是否显示比例尺(默认 true)
					 ,anchor:"LEFT_BOTTOM"    //显示位置
		             ,offsetX:10 		   //X偏移
		             ,offsetY:-15          //Y偏移
				
			}
			/*************鹰眼配置信息********************/
			,mapOverview:{isShow:true              //是否显示(默认 true)
						 ,interval:4              //鹰眼显示级别(默认4)
						 ,viewState:true         //鹰眼展示模式（隐藏、展示，默认：false）
					 	 ,anchor:"RIGHT_BOTTOM"    //显示位置
					 	 ,width:150				  //鹰眼宽度
					 	 ,height:150			  //鹰眼高度
			             ,offsetX:-2 		      //X偏移
			             ,offsetY:-2               //Y偏移
			}
			/*************自定义版权配置信息********************/
			,mapCopyright:{isShow:true              //是否显示(默认 true)
						// ,id:'zz_map'              	//版权ID
						 ,content:'©2015 TransWiseway - ZZ(2015)0529号'               //版权内容
					 	 ,anchor:"LEFT_BOTTOM"    //显示位置
			             ,offsetX:0 		      //X偏移
			             ,offsetY:-1              //Y偏移
				
			}
			/*************是否添加测距工具********************/
			,mapDistanceToolEnabled:true
			/*************是否添加测面工具********************/
			,mapAreaToolEnabled:true
			/*************是否显示右键菜单********************/
			,isShowRigthMenu:true
			,isShowRightAreaMenu:false
			,isShowRightClearMarksMenu:false
			,onSearchAreaCar:function(lng,lat,r){}	
			/*************图层切换控件********************/
			,layerSwitcherControl:
			 {
				isShow:false
				,anchor:"RIGHT_TOP"
				,offsetX:0 		      //X偏移
		        ,offsetY:0              //Y偏移
			 }
		};
		var opts = $.extend({}, defaults, options||{});
		var $container=$(this); //地图容器
		var $component; //地图组件
		var map_id;
		var $map; //地图对象
		var $nav; //地图导航对象
		var $mapScale; //地图比例尺对象
		var $overview; //鹰眼对象
		var $copyright; //自定义版权配置信息
		var $defaultBGLayer; //默认的底图图层
		var satelliteLayer; //卫星图层对象
		var speedLimitLaryer; // 限速路网图层
		var markerList={}; // 标记集合
		var labelMarkerList={};
		var $polyline; // 轨迹回放折线
		var $attentionCarId;
		var $mapElement;
		var random_sid;
		//初始化地图方法定义
		function init() {
			var UUID=Math.random()+"";
			map_id="map_"+UUID.substring(2);
			random_sid=UUID.substring(2);
			var $width=opts.width||"100%";
			var $height=opts.width||"100%";
			$container.empty();
			
			$component=$container.html('<style type="text/css">'
										+'#'+map_id+' canvas,img{max-width: none;}'
										+'#'+map_id+' div {-webkit-box-sizing: content-box; -moz-box-sizing: content-box;box-sizing:content-box;}'
										+'#'+map_id+' *{color:black;}'
										+'#'+map_id+' .amap-marker-label {position: absolute;z-index: 2;border:1px groove orange;background-color:#FFE6B0;white-space: nowrap;cursor: default;padding:2px 5px;font-size: 12px;line-height:14px;}'
										+'</style>'
										+"<div id='"+map_id+"' style='width:"+$width+";height:"+$height+";margin:0px'></div>");
			var mapOpt ={};
			//缩放等级
			var $zoom=opts.zoom||13;
			mapOpt.zoom=$zoom;
			//中心坐标点
			if(opts.center)
			{
				var $lng=opts.center.lng||113.82072645;
				var $lat=opts.center.lat||34.02028346;
				mapOpt.center = [$lng,$lat];
			}
			//是否高亮
			mapOpt.isHotspot=formatVal(opts.hotspot,false);
			//是否拖拽
			mapOpt.dragEnable=formatVal(opts.dragable,true);
			//平移过程中是否使用动画
			mapOpt.animateEnable=formatVal(opts.animation,true);	
			//双击放大
			mapOpt.doubleClickZoom=formatVal(opts.dblclickZoom,true);
			//鼠标滚轮缩放
			mapOpt.scrollWheel=formatVal(opts.scrollWheelZoom,true);
			//启用键盘控制
			mapOpt.keyboardEnable=formatVal(opts.keyboard,true);
			//构建地图对象
			$map = new AMap.Map(map_id,mapOpt);
			//线路绘制工具初始化
//			initLineTool();
			$defaultBGLayer=$map.getDefaultLayer();
			AMap.plugin(['AMap.ToolBar','AMap.Scale','AMap.OverView'],function(){
				//初始化添加导航
				addNavigation($map);
				//初始化添加比例尺
				addScale($map);
				//初始化添加鹰眼
				addOverview($map);
			});
			//鼠标绘制插件添加
			initMouseTool($map);
			//添加自定义版权
//			addCopyright($map);
//			//添加右键菜单
// 			addRightMenu();
//			//添加地图截图工具
//			addMapSnapshotTool();
		}
		/**
		 *添加导航 
		 */
		function addNavigation(tMap)
		{
			//导航设置
			if(opts.mapNavigation)
		    {
				var mapNavigation_show=formatVal(opts.mapNavigation.isShow,true);
				if(mapNavigation_show)
				{
					$nav=new AMap.ToolBar();
					tMap.addControl($nav);
				}
		    }
		}
		/**
		 * 添加比例尺
		 */
		function addScale(tMap)
		{
			//比例尺设置
			if(opts.mapScale)
		    {
				var mapScale_show=formatVal(opts.mapScale.isShow,true);
				if(mapScale_show)
				{
					$mapScale = new AMap.Scale();
					tMap.addControl($mapScale);
				}
		    }
		}
		/**
		 * 添加鹰眼
		 */
		function addOverview(tMap)
		{
			var mapOverview_show=formatVal(opts.mapOverview.isShow,true);
			var viewState=formatVal(opts.mapOverview.viewState,true);
			if(mapOverview_show)
			{
				 $overview=new AMap.OverView({isOpen:viewState});
				 tMap.addControl($overview);
			}
		}
		/**
		 * 添加右键菜单
		 */
		function addRightMenu()
		{
			var isShowRigthMenu=formatVal(opts.isShowRigthMenu,true);
			if(isShowRigthMenu)
			{
				var isShowRightAreaMenu=formatVal(opts.isShowRightAreaMenu,false);
				var isShowRightClearMarksMenu=formatVal(opts.isShowRightClearMarksMenu,false);
				var $areaMenu="";
				var $clearMarksMenu="<li style='text-indent: 0.5em; font-size:13px;font-family:verdana;height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap;' action='openZoomOutTool'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/la_small2.png"+"'/>拉框缩小</li>";
				if(isShowRightAreaMenu)
				{
					$areaMenu="<li style='margin-left:5px;text-indent: 0.5em; font-size:13px;font-family:verdana;height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap; border-bottom-color: rgb(204, 204, 204); border-bottom-style: solid; border-bottom-width: 1px;'action='openSearchAreaCarTool'><image style='float:left;margin-top:5px;margin-right:3px;' src='"+getRootPath()+"pc/css/index/images/sms.gif"+"'/>区域消息</li>";
				}
				if(isShowRightClearMarksMenu)
				{
					$clearMarksMenu="<li style='text-indent: 0.5em; font-size:13px;font-family:verdana; height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap; border-bottom-color: rgb(204, 204, 204); border-bottom-style: solid; border-bottom-width: 1px;' action='openZoomOutTool'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/la_small2.png"+"'/>拉框缩小</li>"
									+"<li style='text-indent: 0.5em; font-size:13px;font-family:verdana;height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap;' action='clearCarMarks'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/clear.png"+"'/>清除标记</li>";
				}
				var menuObjs=$("<ul id='amapRightMenu' style='width:150px;margin: 2px; padding: 2px; list-style-type: none; position: relative; background-color: rgb(255, 255, 255); border: 1px solid rgb(175, 175, 175); border-top-left-radius: 3px; border-top-right-radius: 3px; border-bottom-right-radius: 3px; border-bottom-left-radius: 3px; box-shadow: rgb(153, 153, 153) 2px 2px 8px; white-space: nowrap; cursor: pointer;'>" 
				+$areaMenu
				+"<li style='text-indent: 0.5em; font-size:13px;font-family:verdana;height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap; border-bottom-color: rgb(204, 204, 204); border-bottom-style: solid; border-bottom-width: 1px;'action='zoomIn'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/big.png"+"'/>放大地图</li>"
				+"<li style='text-indent: 0.5em; font-size:13px;font-family:verdana;height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap; border-bottom-color: rgb(204, 204, 204); border-bottom-style: solid; border-bottom-width: 1px;' action='zoomOut'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/small.png"+"'/>缩小地图</li>" 
				+"<li style='text-indent: 0.5em; font-size:13px;font-family:verdana; height: 26px; line-height: 26px; word-break: break-all; white-space: nowrap; border-bottom-color: rgb(204, 204, 204); border-bottom-style: solid; border-bottom-width: 1px;' action='openZoomInTool'><image style='float:left;margin-top:5px;' src='"+getRootPath()+"pc/css/index/images/la_big2.png"+"'/>拉框放大</li>" 
				+$clearMarksMenu
				+"</ul>");
				var rightMenu= new AMap.ContextMenu({content:menuObjs[0]});
				 $map.on('rightclick', function(e) {
					 var lnglat=e.lnglat;
					 rightMenu.open($map, e.lnglat);
					 menuObjs.find("li").unbind("click").bind("click",function(){
						 var $action=$(this).attr("action");
						 if($mouseSearchAreaTool)
						 {
							 $mouseSearchAreaTool.close();
							 isOpenMouseSearchAreaTool=false;
						 }
						 if($mouseTool)
						 {
							 $mouseTool.close();
						 }
						 eval($action+"(lnglat)");
						 rightMenu.close();
					 });
				 });
				 /**
				  * 地图放大
				  */
				  function zoomIn(lnglat)
				  {
					  var _zoom=$map.getZoom();
					  $map.setZoomAndCenter(_zoom+1,lnglat);
				  }
				  /**
				   * 地图缩小
				   */
				  function zoomOut(lnglat)
				  {
					  var _zoom=$map.getZoom();
					  $map.setZoomAndCenter(_zoom-1,lnglat);
				  }
			}
		}
		/**
		 * 打开区域查车工具
		 */
		var $mouseSearchAreaTool,isOpenMouseSearchAreaTool;
		function openSearchAreaCarTool()
		{
			if(!$mouseSearchAreaTool)
			{
//				console.log($map.getDefaultCursor());
				$map.plugin(["AMap.MouseTool"], function() {
					$mouseSearchAreaTool= new AMap.MouseTool($map);
			        AMap.event.addListener($mouseSearchAreaTool,"draw",function(evt){
			        	 $map.setDefaultCursor("url(http://webapi.amap.com/theme/v1.3/openhand.cur),default");
			        	var circleCenter=evt.obj.Wd.center;
			        	var radius=evt.obj.Wd.radius;
			        	if(radius<2)return;
//			        	console.log(radius);
			        	opts.onSearchAreaCar(circleCenter.getLng(),circleCenter.getLat(),radius);
			        	$mouseSearchAreaTool.close();
			        	isOpenMouseSearchAreaTool=false;
			        });
			    });
			}
			if($mouseSearchAreaTool&&!isOpenMouseSearchAreaTool)
			{
				var ruleOptions = {
			            strokeStyle: "solid",
			            strokeColor: "#FF33FF",
			            strokeOpacity: 1,
			            strokeWeight: 2
			     };
		        $mouseSearchAreaTool.circle(ruleOptions);
		        $map.setDefaultCursor("crosshair");
		        isOpenMouseSearchAreaTool=true;
			}else
			{
				$mouseSearchAreaTool.close();
				isOpenMouseSearchAreaTool=false;
			}
		}
/********************************************************************************/
				//【地图工具添加】【start】
/********************************************************************************/
		var $mouseTool;
		var $snapshot; //截图工具定义
		function initMouseTool(tmap)
		{
			tmap.plugin(["AMap.MouseTool"], function() {
				$mouseTool = new AMap.MouseTool(tmap);
		        AMap.event.addListener($mouseTool, "draw", drawComplete);
		    });
		}
		function drawComplete(e) {
			console.log(e);
			$mouseTool.close();
        }
		/**
		 * 打开拉框放大工具
		 */
		function openZoomInTool()
		{
			//关闭缩小工具
			if($mouseTool){
				var rectOptions = {
		                strokeStyle: "dashed",
		                strokeColor: "#FF33FF",
		                fillColor: "#FF99FF",
		                fillOpacity: 0.5,
		                strokeOpacity: 1,
		                strokeWeight: 2
		     			};
				  $mouseTool.rectZoomIn(rectOptions);
				  var drapZoom=function(e){
						$map.off('zoomend',drapZoom);
						$map.setDefaultCursor("url(http://webapi.amap.com/theme/v1.3/openhand.cur),default");
						$mouseTool.close();
				  }
				  $map.on('zoomend',drapZoom);
				  $map.setDefaultCursor("crosshair");
			}

		} 
		/**
		 *打开拉框缩小工具 
		 */
		function openZoomOutTool()
		{
			if($mouseTool)
			{
				var rectOptions = {
				                strokeStyle: "dashed",
				                strokeColor: "#FF33FF",
				                fillColor: "#FF99FF",
				                fillOpacity: 0.5,
				                strokeOpacity: 1,
				                strokeWeight: 2
				     			};
				  $mouseTool.rectZoomOut(rectOptions);
				  var drapZoom=function(e){
						$map.off('zoomend',drapZoom);
						$map.setDefaultCursor("url(http://webapi.amap.com/theme/v1.3/openhand.cur),default");
						$mouseTool.close();
				  }
				  $map.on('zoomend',drapZoom);
				  $map.setDefaultCursor("crosshair");
			}
		}
		/**
		 * 添加测距工具
		 */
		function openDistanceTool()
		{
			if($mouseTool)
			{
				var ruleOptions = {
			            strokeStyle: "solid",
			            strokeColor: "#FF33FF",
			            strokeOpacity: 1,
			            strokeWeight: 2
			        };
				$mouseTool.rule(ruleOptions);
			}
		}
		/**
		 * 添加测面工具
		 */
		function openAreaTool() {
			if($mouseTool)
			{
				var rectOptions = {
		                strokeStyle: "dashed",
		                strokeColor: "#FF33FF",
		                fillColor: "#FF99FF",
		                fillOpacity: 0.5,
		                strokeOpacity: 1,
		                strokeWeight: 2
		     			};
				$mouseTool.measureArea(rectOptions);
			}
		}
			
		/**
		 * 添加地图截图工具
		 */
		function addMapSnapshotTool()
		{
			if($map)
			{
			}
		}
		/**
		 * 打开地图截图工具
		 */
		function openMapSnapshotTool()
		{
			alertDialog("提示","当前地图不支持截图，请使用第三方截图工具进行截图！");
		}
		/**
		 * 全图显示
		 */
		function openFullMap()
		{
			if($map)
			{
				$map.setZoomAndCenter(4,[108.946609, 34.262324]);
			}
		}
		/**
		 * 最佳视图显示
		 */
		function openBestMap()
		{
			if(markerList)
			{
				var markers=[];
				$.each(markerList,function(key,val){
					markers.push(val);
				});
				if(markers.length>0)
				{
					$map.setFitView(markers);
				}
			}	
		}
/********************************************************************************/
				//【地图工具添加】【end】
/********************************************************************************/
		/**
		 * 添加标注覆盖物
		 */
		function addCarMarker(result,markClick) {
			var $marker;
			var labelMarker;
			// 如果地图上存在车辆标记，对其进行更新
			if (markerList && markerList[result.id]) {
				$marker = markerList[result.id];
				labelMarker=labelMarkerList[result.id];
				markerOpt($marker,labelMarker, result);
				return;
			}
			// 如果地图上不存在车辆标记，对其进行添加
			$marker = new AMap.Marker();
			markerList[result.id] = $marker;	
			$marker.setMap($map);
			//图标的标签提示
			labelMarker = new AMap.Marker();
			labelMarkerList[result.id]=labelMarker;
			labelMarker.setMap($map);
			
			markerOpt($marker,labelMarker, result);
			if(markClick)
			{
				AMap.event.addListener($marker, "click", function callback(e) {
					markClick(result.simid);
		        });
			}
		}
		/**
		 * 删除标注覆盖物
		 */
		function removeCarMarker(result) {
			var $marker=markerList[result.id];
			var labelMarker=labelMarkerList[result.id];
			if($marker)
			{
				$marker.setMap(null);
				labelMarker.setMap(null);
				delete markerList[result.id];
				delete labelMarker[result.id];
			}
		}
		/**
		 * 清除标记
		 */
		function clearMark()
		{
			if($map)
			{
				$map.clearMap();
				markerList={};
				labelMarkerList={};
			}
		}
		/**
		 * 清除车辆标记
		 */
		function clearCarMarks()
		{
			if($map)
			{
				$.each(labelMarkerList,function(i,mark){
					mark.setMap(null);
				});
				$.each(markerList,function(i,mark){
					mark.setMap(null);
				});
				markerList={};
				labelMarkerList={};
			}
		}
		/**
		 * 地图上图标的实时改变
		 * marker 车辆标记
		 * carInfo 车辆的实时情况信息
		 */
		function markerOpt(marker,labelMarker, carInfo) {
			var path=getRootPath()+"pc/images/offline.png";//默认离线状态
			if (carInfo.status == 1) { // 当车辆在线时
				path=getRootPath()+"pc/images/online.png";
				if(carInfo.speed&&carInfo.speed>0)
				{
					path=getRootPath()+"pc/images/running.png";
				}
				if (carInfo.alarm != "" && carInfo.alarm != 0) { // 当车辆有报警信息时
					path=getRootPath()+"pc/images/alarm.png";
				}
			}
			
			try
			{
				var size=new AMap.Size(20,20);
				var icon=new AMap.Icon({size:size,image:path,imageSize:size});
				marker.setIcon(icon);
			}catch(e){
				console.log(e);
			}
			var lnglat=getGoogleLngLat(carInfo.lng||0, carInfo.lat||0);
			marker.setPosition(lnglat);
			marker.setOffset(new AMap.Pixel(-10,-10));
			marker.setAngle(parseInt(carInfo.direct||0));
			labelMarker.setPosition(lnglat);
			var $w=115;
			if((carInfo.cph||"").length>8 && (carInfo.speed+"").length>=2)
			{
				$w=((carInfo.cph||"").length + (carInfo.speed+"").length+5)*8;
			} 
			labelMarker.setOffset(new AMap.Pixel((0-$w)/2,12));
			var lab="<div style='width:"+$w+"px;height:18px;background-color:#FFE6B0;border:1px groove orange;font-family:\"微软雅黑\";font-size:12px;padding:2px 5px;color:black;text-align:center;'>"+carInfo.cph + "  " + carInfo.speed+"km/h"+"</div>";
			labelMarker.setContent(lab);
			marker.setTop(true);
		}
		/**
		 * 设置地图中心与缩放级别
		 */
		function setCenter(result){
			$map.panTo(getGoogleLngLat(result.lng, result.lat));
			//$map.setZoom(10);
		}
		/**
		 * 经纬度纠偏方法
		 * @lng 经度
		 * @lat 纬度
		 * @n 判断地图标志 1 中交 2 高德 3 思维 0或者不存在时 自定义
		 */
		function getGoogleLngLat(lng, lat)
		{
			console.log(lng)
			console.log(lat)
			lng=lng||0;
			lat=lat||0;
			return new AMap.LngLat(lng, lat);
		}
/***************************************************************/
		//轨迹回放控制【start】
/***************************************************************/		
		/**
		 * 轨迹回放
		 */
		var playTimer;//timer时钟
		var interval=80;//执行间隔时间
		var pathMarker;//轨迹回放标记的图像
		var pathLabelMarker;//轨迹回放标记的提示信息
		var speed=5;//每次移动的像素
		var initSpeed=5;//初始速度（每次移动的像素）
		var $pathPoints;//轨迹点列表
		var pixelPoints;//转换后的轨迹点类表
		var points;	//轨迹线对应的轨迹点
		var currIndex;//当前轨迹点的索引
		var moveCallBack;//移动时回调
		var finishBack;//播放完成时回调
		var startMarker;
		var endMarker;
		var $massRender;
		var pathCarSign;//轨迹车辆车牌号
		/**
		 * 绘制轨迹线
		 */
		function addPolyline(pathPoints,callBack)
		{
			var path=[];
			var alarmPoint=[];
			var alarmPointCount=0;
			$pathPoints=null;
			$.each(pathPoints,function(i,pathPoint){
				if (pathPoint.lng && pathPoint.lat) {
					path.push(getGoogleLngLat(pathPoint.lng,pathPoint.lat));
					if(pathPoint.alarmInfo && (pathPoint.alarmInfo.indexOf("超速报警")!=-1 || pathPoint.alarmInfo.indexOf("疲劳驾驶")!=-1 || pathPoint.alarmInfo.indexOf("路线偏离")!=-1))
					{
						alarmPoint.push(pathPoint);
						alarmPointCount++;
					}
				}
			});
//			console.log((alarmPointCount/pathPoints.length));
			if((alarmPointCount/pathPoints.length)*100>10)
			{
				alertDialog("提示","车辆报警频率过高，请及时核查！");
			}else
			{
				$.each(alarmPoint,function(i,e){
					var a_marker = new AMap.Marker({
				        icon: new AMap.Icon({
				            size: new AMap.Size(22, 22),
				            image: getRootPath()+"pc/images/alarmPoint.png",
				            imageOffset: new AMap.Pixel(0,0)
				        }),
				        position:getGoogleLngLat(e.lng,e.lat),
				        offset: new AMap.Pixel(0, -20)
				    });
					a_marker.setMap($map);
					var $InfoWindow;
					AMap.event.addListener(a_marker, "mouseover", function callback(evt) {
						if($InfoWindow)
						{
							$InfoWindow.close();
						}
						var ctn="时间："+formatDateTimeFromMS(e.gpsTime,'YYYY-MM-DD HH:mm:ss')
								+"<br/>速度："+e.speed+"&nbsp;公里/时"
								+"<br/>限速："+e.limitSpeed+"&nbsp;公里/时"
							    +"<br/>报警内容："+e.alarmInfo;
						$InfoWindow = new AMap.InfoWindow({
				            content: ctn
				            ,offset:new AMap.Pixel(0, -20)
				        });
						$InfoWindow.open($map,getGoogleLngLat(e.lng,e.lat));
			        });
					AMap.event.addListener(a_marker,"mouseout",function callback(evt) {
						if($InfoWindow)
						{
							$InfoWindow.close();
						}
			        });
				});
			}
			/**
			 * 添加轨迹线
			 */
			if (path.length > 1) {
				if(!$polyline){
					$polyline= new AMap.Polyline({
				        map: $map,
				        path: path,
				        strokeColor: "#5efe5a",  //线颜色
				        strokeOpacity: 1,     //线透明度
				        strokeWeight: 5,      //线宽
				        strokeStyle:"solid"  //线样式
				     });
					$map.setFitView();
				}
				/**
				 * 起始点标记添加
				 */
				 points=$polyline.getPath();
				 var startPoint=points[0];				 
				 var startMarker = new AMap.Marker({
				           icon: new AMap.Icon({
				           size: new AMap.Size(22, 22),
				           image: getRootPath()+"pc/images/begin.png",
				           imageOffset: new AMap.Pixel(0, 0)
				        }),
				        position:startPoint,
				        offset: new AMap.Pixel(-13, -20)
				    });
				 startMarker.setMap($map);
				/**
				 * 终点标记添加
				 */
				 var ednPoint=points[points.length-1];				 
				 var endMarker = new AMap.Marker({
			           icon: new AMap.Icon({
			           size: new AMap.Size(22, 22),
			           image: getRootPath()+"pc/images/terme.png",
			           imageOffset: new AMap.Pixel(0, 0)
			        }),
			        position:ednPoint,
			        offset: new AMap.Pixel(-13, -20)
			    });
				endMarker.setMap($map);
			 
				$pathPoints=pathPoints
				if(callBack)
				{
					callBack(path.length,$polyline.getLength(),alarmPointCount);
				}
			}	
		}
		/**
		 * 首次播放，重新播放
		 */
		function playBack(carSign,_moveCallBack,_finishBack){
			if(!$polyline)
			{
				return;
			}
			pathCarSign=carSign;
			moveCallBack=_moveCallBack;
			finishBack=_finishBack;
			points=$polyline.getPath();
			pixelPoints=[];
			for(var i=0;i<points.length;i++){
				pixelPoints.push($map.lnglatToPixel(points[i]));
			}
			var startPoint=points[0];
			/**
			 * 添加标记并放置于起始位置
			 */
			var jsonData= $pathPoints[0];
			if(!pathMarker)
			{
				pathMarker=new AMap.Marker({
			           icon: new AMap.Icon({
				           size: new AMap.Size(22, 22),
				           image: getRootPath()+"pc/images/running.png",
				           imageOffset: new AMap.Pixel(0, 0)
				        }),
				        position:startPoint,
				        offset: new AMap.Pixel(-10, -10)
				    });
				 pathLabelMarker=new AMap.Marker({
				        position:startPoint,
				        offset: new AMap.Pixel(-58,13)
				    });
				 pathMarker.setMap($map);
				 pathLabelMarker.setMap($map);
			}else
			{
				pathMarker.setPosition(startPoint);
				pathLabelMarker.setPosition(startPoint);
			}
			if(pathLabelMarker)
			{
				var lab="<div style='width:115px;height:18px;background-color:#FFE6B0;border:1px groove orange;font-family:\"微软雅黑\";font-size:12px;padding:2px 5px;color:black;text-align:center;'>"+carSign+"  " + jsonData.speed+"km/h"+"</div>";
				pathLabelMarker.setContent(lab);
			}
			if(pathMarker)
			{
				$map.setCenter(startPoint);
				 var direction=$pathPoints[0].directionAngle||0;
				 //setTimeout(function(){ pathMarker.rotate(direction);},200);		
			}
			currIndex=0;
			if(playTimer)
			{
				clearTimeout(playTimer);
			}
			if(moveCallBack)
			{
				moveCallBack($pathPoints[currIndex]);
			}
			playTimer=setTimeout(move,interval);
		}
		/**
		 * 根据获取的下一轨迹点坐标，移动车辆标记
		 */
		function move(){
			if(!pathMarker)
			{
				return;
			}
			pixelPoints=[];
			for(var i=0;i<points.length;i++){
				pixelPoints.push($map.lnglatToPixel(points[i]));
			}
			var nextPoint=getNextPoint();
			if(nextPoint!=null){
				var $nextPoint=$map.pixelToLngLat(nextPoint);
				pathMarker.setOffset(new AMap.Pixel(-10,-10));
				pathMarker.setPosition($nextPoint);
				pathLabelMarker.setOffset(new AMap.Pixel(-58,13));
				pathLabelMarker.setPosition($nextPoint);
				if(!containsLngLat($nextPoint.getLng(),$nextPoint.getLat()))
				{
					$map.setCenter($nextPoint);
				}
				playTimer=setTimeout(move,interval);
			}
		}
		/**
		 * 获取下一轨迹点的坐标
		 */
		function getNextPoint(){
			var curr=$map.lnglatToPixel(pathMarker.getPosition());
			if(currIndex+1>=pixelPoints.length){
				if(moveCallBack)
				{
					moveCallBack($pathPoints[currIndex]);
				}
				if(finishBack)
				{
					finishBack($pathPoints[currIndex]);
				}
				var jsonData= $pathPoints[currIndex];
				if(pathLabelMarker)
				{
					var lab="<div style='width:115px;height:18px;background-color:#FFE6B0;border:1px groove orange;font-family:\"微软雅黑\";font-size:12px;padding:2px 5px;color:black;text-align:center;'>"+pathCarSign+"  " + jsonData.speed+"km/h"+"</div>";
					pathLabelMarker.setContent(lab);
				}
				return null;
			}
			var nPoint=pixelPoints[currIndex+1];
			var dis=(curr.x-nPoint.x)*(curr.x-nPoint.x)+(curr.y-nPoint.y)*(curr.y-nPoint.y);
			if(dis<speed*speed){
				if(moveCallBack)
				{
					moveCallBack($pathPoints[currIndex]);
					var jsonData= $pathPoints[currIndex];
					if(pathLabelMarker)
					{
						var lab="<div style='width:115px;height:18px;background-color:#FFE6B0;border:1px groove orange;font-family:\"微软雅黑\";font-size:12px;padding:2px 5px;color:black;text-align:center;'>"+pathCarSign+"  " + jsonData.speed+"km/h"+"</div>";
						pathLabelMarker.setContent(lab);
					}
				}
				currIndex++;
				return nPoint;
			}
			//var pPoint=pixelPoints[currIndex];
			var angle=Math.atan2(nPoint.y-curr.y,nPoint.x-curr.x);
			pathMarker.setRotation(90+angle/Math.PI*180);
			var nx=curr.x+speed*Math.cos(angle);
			var ny=curr.y+speed*Math.sin(angle);
			return new AMap.Pixel(nx,ny);
		}
		/**
		 * @sourceVal 原值
		 * @dftVal 默认值
		 */
		function formatVal(sourceVal,dftVal)
		{
			var rs=sourceVal;
			if(sourceVal==null)
			{
				rs=dftVal;
			}
			return rs;
		}
		/**
		 *删除轨迹线
		 */
		function removePolyline() {
			$map.clearMap();
			$polyline = null;
			pathMarker=null;
			pathLabelMarker=null;
			if(playTimer)
			{
				clearTimeout(playTimer);
				playTimer=null;
			}
		}
		/**
		 * 暂停播放
		 */
		function pausePlayBack()
		{
			if(playTimer)
			{
				clearTimeout(playTimer);
				playTimer=null;
			}
		}
		/**
		 * 继续回放
		 */
		function continuePlayBack()
		{
			if(playTimer)
			{
				clearTimeout(playTimer);
			}
			playTimer=setTimeout(move,interval);
		}
		/**
		 * 轨迹回放速度
		 */
		function setPlaySpeed(sX)
		{
			speed=initSpeed*sX;
		}
		
		function containsLngLat(lng,lat)
		{
			var flag=false;
			try
			{
				if($map)
				{
					var bands=$map.getBounds();
					flag= bands.contains(getGoogleLngLat(lng,lat));
				}
			}catch(e)
			{
				console.log(e);
			}
			return flag;
		}
/***************************************************************/
		//轨迹回放控制【end】
/***************************************************************/	
		/**
		 * 添加自定义版权
		 */
		function addCopyright(tMap)
		{
			var mapCopyright_show=opts.mapCopyright.isShow||true;
			//var $id=opts.mapCopyright.id||'zz_map';
			var content=opts.mapCopyright.content||'';
			var anchor=opts.mapCopyright.anchor||'LEFT_TOP';
			var offsetX=opts.mapCopyright.offsetX||0;
			var offsetY=opts.mapCopyright.offsetY||0;
//			$component.find("#tm_copyright").html("<span style='color:blue;'>"+content+"</span>");
			/**
			 * 自定义版权ID、内容设置
			 */
			 $copyright=tMap.getCopyrightControl();
			if($copyright && $copyright.getCopyrights().length>0)
			{
				var _copyright=$copyright.getCopyrights()[0];
				_copyright.content="<span style='color:blue;'>"+content+"</span>";
				setTimeout(function(){
					//删除默认版权
//					$copyright.removeCopyright(_copyright.id);
					$("[id=tm_copyright]").remove();
					if(mapCopyright_show)
					{
						//添加自定义版权
						var cOpts=new TM.Copyright();
						cOpts.id="copyright_"+random_sid;
						cOpts.content="<span style='color:blue;'>"+content+"</span>";
						$copyright.addCopyright(cOpts);
						$copyright.setAnchor(getControlAnchor(anchor));
						$copyright.setOffset(new AMap.Pixel(offsetX,offsetY));
					}
				}, 1000);
			}
		}
/***********************************************************/
		  //海量数据展示控制【start】
/***********************************************************/
		var tip;
		function openMassRender(tileUrl,JsonUrl,paramStr)
		{
			if(!$map)return;
			var _opts=new TM.MassRenderOptions();
			_opts.hotspot=true;
			//_opts.label=true;
			_opts.serverTileUrl=tileUrl;
			_opts.serverJsonUrl=JsonUrl;
			if(!$massRender)
			{
			  $massRender=new TM.MassRender($map,_opts);
			  $massRender.addEventListener(TM.Constants.CLICK,function(datas,lnglat,m){
				   console.log(datas);
					var size=m.getSize(),c="";
					var subs=datas.datas;
					var l=subs.length;
					if(l>=1){
						var c=subs[0].no;
						for(var i=1;i<l;i++){
							c+="<br/>"+subs[i].no;
						}
					}
					m.setLabel("<div style='background-color:#FFE6B0;border:1px groove orange;font-family:\"微软雅黑\";font-size:12px;padding:2px 5px;'>"+c+"</div>"
						       ,getControlAnchor('LEFT_TOP')
						       , new AMap.Pixel(0, 12));
			   });
			}
		   $massRender.open(paramStr);
		}
		function closeMassRender()
		{
			if($massRender){
				if(tip){
					$map.getOverlayLayer().removeOverlay(tip);
					delete tip;
				}
				$massRender.close();
			}
		}
/***********************************************************/
		//海量数据展示控制【end】
/***********************************************************/
/***********************************************************/
		  //车辆聚合展示控制【start】
/***********************************************************/
		var $cluster;
		function openCluster(cars)
		{
			if($cluster)$cluster.setMap(null);
			if(!$map)return;
			if(!cars)return;
			var $tmarks=[];
			$.each(cars,function(i,car){
				if(car.lng==null||car.lng==""||car.lng=="0"||car.lng==0
					||car.lat==null||car.lat==""||car.lat=="0"||car.lat==0)
					return true;
				console.log(car.carSign+":"+car.lng+"-"+car.lat);
				var position=getGoogleLngLat(car.lng,car.lat)
				var path=getRootPath()+"pc/images/offline.png";//默认离线状态
				var $gpsTime=car.gpsTime;
				if($gpsTime)
				{
					$gpsTime=formatDateTimeFromMS($gpsTime,true);
				}else
				{
					$gpsTime="--";
				}
				var direct=car.directionAngle||0;
				if($gpsTime.length>19)
				{
					$gpsTime=$gpsTime.substring(0,19);
				}
				if(direct)
				{
					var startIndex=direct.indexOf("(")+1;
					direct=parseInt(direct.substr(startIndex));
				}
				if (car.carStatus && car.carStatus == 1) { // 当车辆在线时
					path=getRootPath()+"pc/images/online.png";
					if(car.speed && car.speed>0)
					{
						path=getRootPath()+"pc/images/running.png";
					}
					if (car.alarmInfo && car.alarmInfo != "" && car.alarm != 0) { // 当车辆有报警信息时
						path=getRootPath()+"pc/images/alarm.png";
					}
				}
				var carMarker = new AMap.Marker({
			           icon: new AMap.Icon({
				           size: new AMap.Size(22, 22),
				           image: path,
				           imageOffset: new AMap.Pixel(0, 0)
				        }),
				        position:position,
				        angle:direct,
				        offset: new AMap.Pixel(-10, -10)
				    });
					$tmarks.push(carMarker);
					var $carInfoWindow;
					AMap.event.addListener(carMarker, "mouseover", function callback(evt) {
						if($carInfoWindow)
						{
							$carInfoWindow.close();
						}
						var ctn="车牌号："+(car.carSign||"--")
								+"<br/>时&#8195;间："+$gpsTime
								+"<br/>速&#8195;度："+(car.speed||"0")+"&nbsp;公里/时"
								+"<br/>限&#8195;速："+(car.limitSpeed||"0")+"&nbsp;公里/时";
						$carInfoWindow = new AMap.InfoWindow({
				            content: ctn
				            ,offset:new AMap.Pixel(0, -5)
				        });
						$carInfoWindow.open($map,position);
			        });
					AMap.event.addListener(carMarker,"mouseout",function callback(evt) {
						if($carInfoWindow)
						{
							$carInfoWindow.close();
						}
			        });
			});
			$map.plugin(["AMap.MarkerClusterer"], function() {
				$map.clearMap();
				$cluster = new AMap.MarkerClusterer($map, $tmarks);
				$map.setZoomAndCenter(4,[108.946609, 34.262324]);
            });
		}
		function closeCluster()
		{
			if($cluster){
				$cluster.setMap(null);
				$map.clearMap();
			}
		}
/***********************************************************/
		//海量数据展示控制【end】
/***********************************************************/
/***********************************************************/
		//车辆跟踪【start】
/***********************************************************/
		function markPolyline(pathPoints)
		{
			var path=[];
			if(pathPoints)
			{
				for (var i = 0; i < pathPoints.length; i++) {
					var pathPoint = pathPoints[i];
					if (pathPoint.lng && pathPoint.lat) {
						path.push(getGoogleLngLat(pathPoint.lng,pathPoint.lat));
					}
				}
			}
			/**
			 * 添加轨迹线
			 */
			if (path.length > 1) {
				var $polyline= new AMap.Polyline({
			        map: $map,
			        path: path,
			        strokeColor: "#5efe5a",  //线颜色
			        strokeOpacity: 1,     //线透明度
			        strokeWeight: 3,      //线宽
			        strokeStyle:"solid"  //线样式
			     });
			}
	  }
/***********************************************************/
				//车辆跟踪【end】
/***********************************************************/
		
/***********************************************************/
		//线路管理【start】
/***********************************************************/
var $linedraw;
var $lineStartPoint;
var $splitTool;
var roadLineData;
var lineType;
/**
 * 线路工具初始化
 */
function initLineTool()
{
	//线路拆分工具初始化
	initSplitTool();
	//沿路绘线工具初始化
	initLineDraw();
}

function initLineDraw()
{
	var lineDrawoOpts=new TM.LineDrawOptions();
	lineDrawoOpts.type=1;
	lineDrawoOpts.editabled=true;
	lineDrawoOpts.minZoom=5;
	lineDrawoOpts.maxZoom=17;
	lineDrawoOpts.strokeWeight=4;
	$linedraw=new TM.LineDraw($map,lineDrawoOpts);
	//监听线路规划或起点错误事件
	$linedraw.addEventListener(TM.Constants.ERROR,function(error){
		console.log(error);
	});
	//监听添加一条线路事件
	$linedraw.addEventListener(TM.Constants.ADD_OVERLAY,function(evt){
		roadLineData=$linedraw.getLinesById(evt.lineId,true);
		var lines=roadLineData.lines;
		var nodes=roadLineData.nodes
		console.log(roadLineData);
		var _lines=[];
		for(var i=0;i<lines.length;i++)
		{
			_lines.push(lines[i].lnglats);
		}
		
		if(nodes.length>1)
		{
			var newStartPoint=nodes[nodes.length-1].lnglat;
//			$lineStartPoint=getGoogleLngLat(newStartPoint[0],newStartPoint[1]);		
			nodes.splice(0,1);
			nodes.splice(nodes.length-1,1);
		}
		var $lines={lines:_lines,nodes:nodes};
		$linedraw.removeById(evt.lineId);
		closeLineDraw();
		$splitTool.editabled=false;
		$splitTool.split=false;
		$splitTool.imports($lines,false);
		roadLineData=$lines;
		$splitTool.open();
		$splitTool.close();
	});
	//监听完成一次拆分事件
	$linedraw.addEventListener(TM.Constants.SPLIT_END,function(cObj){
//		roadLineData=$linedraw.getLinesById(cObj.lineId,true);
	});
	//监听完成删除一个节点事件
	$linedraw.addEventListener(TM.Constants.DELETE_NODE_END,function(cObj){
//		roadLineData=$linedraw.getLinesById(cObj.lineId,true);
	});
	//监听完成一次节点拖动事件
	$linedraw.addEventListener(TM.Constants.DRAG_END,function(cObj){
//		roadLineData=$linedraw.getLinesById(cObj.lineId,true);
	});
}
/**
 * 初始化拆分工具
 */
function initSplitTool()
{
	$splitTool=new TM.SplitTool();
	$splitTool.editabled=false;
	$splitTool.split=false;
	$splitTool.strokeWeight=4;
//	$splitTool.strokeColor = "#5efe5a";
	$map.addTool($splitTool);
	//监听添加一条线路事件
	$splitTool.addEventListener(TM.Constants.ADD_OVERLAY,function(evt){
		var lineId = evt.lineId;
		roadLineData=$splitTool.getLinesById(lineId);
		var lines=roadLineData.lines;
		if(lines && lines.length>0)
		{
			var startPoint=lines[0][0];
			var endtPoint=lines[lines.length-1][lines[lines.length-1].length-1];
			if(startPoint)
			{
				var sopt=new TM.MarkerOptions();
				sopt.icon=new TM.Icon("http://api.transmap.com.cn/img/maps/icon/qi.gif", new TM.Size(32, 32));
				sopt.offset=new AMap.Pixel(0,0);
				var s_marker=new TM.Marker(getGoogleLngLat(startPoint[0],startPoint[1]),sopt);
				$map.getOverlayLayer().addOverlay(s_marker);
			}
			if(endtPoint)
			{
				var eopt=new TM.MarkerOptions();
				eopt.icon=new TM.Icon("http://api.transmap.com.cn/img/maps/icon/zhong.gif", new TM.Size(32, 32));
				eopt.offset=new AMap.Pixel(0,0);
				var e_marker=new TM.Marker(getGoogleLngLat(endtPoint[0],endtPoint[1]),eopt);
				$map.getOverlayLayer().addOverlay(e_marker);
			}
		}
		$splitTool.editabled=true;
		$splitTool.split=true;
	});
	//监听完成一次拆分事件
	$splitTool.addEventListener(TM.Constants.SPLIT_END,function(cObj){
		roadLineData=$splitTool.getLinesById(cObj.lineId);
	});
	//监听完成删除一个节点事件
	$splitTool.addEventListener(TM.Constants.DELETE_NODE_END,function(cObj){
		roadLineData=$splitTool.getLinesById(cObj.lineId);
	});
	//监听完成一次节点拖动事件
	$splitTool.addEventListener(TM.Constants.DRAG_END,function(cObj){
		roadLineData=$splitTool.getLinesById(cObj.lineId);
	});

}
/**
 * 开始绘制线路
 */
function openLineDraw(type)
{
	if($linedraw)
	{
		$map.setZoom(9);
		lineType=type;
		if(type)$linedraw.setType(parseInt(lineType));
		$linedraw.mouseOpen($lineStartPoint);
	}
	
}
/**
 * 结束线路绘制
 */		
function closeLineDraw()
{
	if($linedraw)
	{
		$linedraw.mouseClose();
	}
}
/**
 * 打开拆分工具
 */
function openSplitTool()
{
	if($splitTool)
	{
		$map.setZoom(9);
		$splitTool.editabled=false;
		$splitTool.split=false;
		$splitTool.open($lineStartPoint);
	}
}
/**
 * 打开拆分工具
 */
function closeSplitTool()
{
	if($splitTool)
	{
		$splitTool.close();
	}
}
/**
 * 导入拆分线数据
 */
function importLines(rs)
{
	if($splitTool)
	{
		clearLine();
		var UUID=Math.random()+"";
		var randomId=UUID.substring(2);
		$lines.id="st_line_"+randomId;
		$splitTool.imports($lines,true);
		$splitTool.open();
		$splitTool.close();
		roadLineData=rs;
	}
}
/**
 * 结束绘制线路
 */
function finishLines()
{
	$lineStartPoint=null;
	//关闭沿路绘线工具
	closeLineDraw();
	//关闭折线拆分工具
	closeSplitTool();
}
/**
 * 清除线路
 */
function clearLines()
{
	$lineStartPoint=null;
	//关闭沿路绘线工具
	closeLineDraw();
	//关闭折线拆分工具
	closeSplitTool();
	//清除地图覆盖物
	if($map)
	{
		$map.getOverlayLayer().clear();
	}
}
/**
 * 根据经纬度沿路绘线
 */
function drawLineByLngLat(sLng, sLat, eLng, eLat, showInfo){

	var slnglat = getGoogleLngLat(sLng,sLat);
	var elnglat = getGoogleLngLat(eLng,eLat);
	var path = [];
    path.push(slnglat);
    path.push(elnglat);
    $map.plugin("AMap.DragRoute", function() {
       var route = new AMap.DragRoute($map, path, {showTraffic:false}); //构造拖拽导航类
        route.search(); //查询导航路径并开启拖拽导航
    });
}
/**
 * 根据经纬度画圆
 */
function drawCircleByLngLat(radius, slng, slat, showInfo) {
	var circle = new AMap.Circle({
	        center:getGoogleLngLat(slng,slat),// 圆心位置
	        radius:radius, //半径
	        strokeColor:"#4169D3", //线颜色
	        strokeOpacity: 1, //线透明度
	        strokeWeight: 2, //线粗细度
	        fillColor:"#99FFCC", //填充颜色
	        strokeStyle:"dashed",
	        fillOpacity: 0.35//填充透明度
	   });
	circle.setMap($map);
	$map.panTo(getGoogleLngLat(slng,slat));
	$map.setFitView();
}
/***********************************************************/
		//线路管理【end】
/***********************************************************/
		/**
		 * 获取组件在地图容器中的位置
		 */
		function getControlAnchor(anchorValue){
			switch(anchorValue) {
				case "LEFT_TOP": 
					var a = TM.Constants.LEFT_TOP;
					break; 
				case "TOP_CENTER": 
					var a = TM.Constants.TOP_CENTER;
					break;
				case "RIGHT_TOP": 
					var a = TM.Constants.RIGHT_TOP;
					break;
				case "RIGHT_CENTER": 
					var a = TM.Constants.RIGHT_CENTER;
					break;
				case "RIGHT_BOTTOM": 
					var a = TM.Constants.RIGHT_BOTTOM;
					break;
				case "BOTTOM_CENTER": 
					var a = TM.Constants.BOTTOM_CENTER;
					break;
				case "LEFT_BOTTOM": 
					var a = TM.Constants.LEFT_BOTTOM;
					break;
				case "LEFT_CENTER": 
					var a = TM.Constants.LEFT_CENTER;
					break;
				case "CENTER": 
					var a = TM.Constants.CENTER;
					break;
				default: 
					var a = TM.Constants.LEFT_TOP;
			}
			return a;
		}
		/**
		 * 初始化操作
		 */
		init();
		//刷新列表方法返回
		var _result = {
			map: $map
			,mapID:map_id
			/***切换为卫星地图 ***/
			,changeSatelliteLayer:function(){
				if($map && !satelliteLayer){
					satelliteLayer = new AMap.TileLayer.Satellite();
					$map.setDefaultLayer(satelliteLayer);
				}
			}
			/***关闭卫星图层,还原为默认图层***/
			,changeDefaultBGTileLayer:function(){
				if(satelliteLayer){
					$map.setDefaultLayer($defaultBGLayer);
					satelliteLayer = null;
				}
			}
			/***地图上添加限速图层***/
			,addSpeedLimitedLaryer:function(){
				if($map){
					if(!speedLimitLaryer)
					{
						speedLimitLaryer=new AMap.TileLayer({
				            // 图块取图地址
				             tileUrl:'http://ovtileni.transmap.com.cn/xiansu/[z]/[y]/[x].png'
				          	 ,zIndex:5
				        });
						speedLimitLaryer.setMap($map);
					}else
					{
						speedLimitLaryer.setMap(null);
						speedLimitLaryer=null;
					}
				}
			}
			/***添加标记覆盖物***/
			,addCarMarker:function(result,markClick){
				addCarMarker(result,markClick);
			}
			,moveMark:function(carInf)
			{
				moveMark(carInf);
			}
			/***清除标记覆盖物***/
			,clearMarks:function()
			{
				clearMark();
			}
			/***设置地图中心与缩放级别***/
			,setCenter:function(result){
				setCenter(result);
			}
			/***设置地图缩放级别***/
			,setZoom:function(level){
				if($map)
				{
					$map.setZoom(level);
				}
			}
			/***获取地图缩放级别***/
			,getZoom:function(){
				var _zoom=10;
				if($map)
				{
					_zoom=$map.getZoom();
				}
				return _zoom;
			}
			/***地图上删除标记覆盖物***/
			,removeCarMarker:function(result){
				removeCarMarker(result);
			}
			/***显示地图测距工具***/
			,openDistanceTool:function(){
				openDistanceTool();
			}
			/***打开地图测面工具***/
			,openAreaTool:function() {
				openAreaTool();
			}
			/***打开拉框放大工具***/
			,openZoomInTool:function() {
				if ($map) {
					openZoomInTool();
				}
			}
			/***打开拉框缩小工具***/
			,openZoomOutTool:function() {
				if ($map) {
					openZoomOutTool();
				}
			}
			/***打开截图工具***/
			,openMapSnapshotTool:function() {
					openMapSnapshotTool();
			}
			/***全图显示***/
			,openFullMap:function()
			{
				openFullMap();
			}
			/***最佳显示***/
			,openBestMap:function(){
				openBestMap();
			}
			/***关注单个车辆***/
			,attentionCar:function(carId)
			{
				$attentionCarId=carId;
			}
			/***海量数据***/
			,openMassRender:function(tileUrl,JsonUrl,paramStr)
			{
				openMassRender(tileUrl,JsonUrl,paramStr);
			},closeMassRender:function()
			{
				closeMassRender();
			}
			,openCluster:function(cars)
			{
				openCluster(cars);
			},closeCluster:function()
			{
				closeCluster();
			}
			/***打开轨迹回放***/
			,playBack:function(carSign,moveBack,finishBack) {
				playBack(carSign,moveBack,finishBack);
			}
			,addPolyline:function(lnglats,callBack)
			{
				addPolyline(lnglats,callBack);
			}
			/***清除历史轨迹图形***/
			,removePolyline:function() {
				removePolyline();
			}
			/***轨迹回放播放速度设置***/
			,setPlaySpeed:function(speedX)
			{
				setPlaySpeed(speedX);
			}
			/***轨迹回放播放（暂停）***/
			,pausePlayBack:function()
			{
				pausePlayBack();
			}
			/**播放暂停后继续播放**/
			,continuePlayBack:function()
			{
				continuePlayBack();
			}
			/**播放速度控制**/
			,setPlaySpeed:function(seedType)
			{
				setPlaySpeed(seedType);
			}	
			/***添加监控车辆标记覆盖物***/
			,addMonitorMarker:function(carInfo){
				addMonitorMarker(carInfo);
			},
			autoResize:function(){
				if ($map) {
					$map.autoResize();
				}
			}
			,convertPos:function(lnglats,callback){
				if(lnglats)
				{
					var rgc=new TM.RGCSearch();
					rgc.setType(6);
					rgc.search(lnglats,function(datas){
						if(callback)
						{
							callback(datas);
						}
					});
				}else
				{
					callback([]);
				}
			}
			,containsLngLat:function(lng,lat)
			{
				return containsLngLat(lng,lat);
			}
			/**在地图上添加轨迹线**/
			,markPolyline:function(points){
				markPolyline(points);
			}
			/*****线路绘制*****/
			,openLineDraw:function(type)
			{
				openLineDraw(type);
			}
			,closeLineDraw:function()
			{
				closeLineDraw();
			}
			,openSplitTool:function()
			{
				openSplitTool();
			},closeSplitTool:function()
			{
				closeSplitTool();
			}
			/**
			 * 清除线路
			 */
			,clearLine:function()
			{
				clearLine();
			}
			/**
			 * 导入轨迹线路
			 */
			,importLines:function(roadLineData){
				importLines(roadLineData);
			}
			/**
			 * 获取线路数据
			 */
			,getLinesData:function()
			{
				return roadLineData;
			}
			/**
			 * 根据起止点坐标沿路画线
			 */
			,drawLineByLngLat:function(slng, slat, elng, elat, showInfo)
			{
				drawLineByLngLat(slng, slat, elng, elat, showInfo);
			}
			/**
			 * 根据经纬度画圆
			 */
			,drawCircleByLngLat:function(radius, slng, slat, showInfo)
			{
				drawCircleByLngLat(radius, slng, slat, showInfo);
			}
			/**
			 * 清除地图覆盖物
			 */
			,clearMap:function(){
				return $map.clearMap();
			}
			/**
			 * 打开区域查车工具
			 */
			,openSearchAreaCarTool:function(){
				openSearchAreaCarTool();
			}
			/**
			 * 清除车辆标记
			 */
			,clearCarMarks:function()
			{
				clearCarMarks();
			}
		};
		return _result;
	};
	/**
	 * 通过经纬度坐标获取详细地址
	 */
	$.RGCSearch=function(lnglats,callback){
		if(lnglats)
		{
			var rgc=new TM.RGCSearch();
			rgc.setType(6);
			rgc.search(lnglats,function(datas){
				if(callback)
				{
					callback(datas);
				}
			});
		}else
		{
			callback([]);
		}
	};
})(jQuery);
