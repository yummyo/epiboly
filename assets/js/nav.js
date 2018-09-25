(function() {
    $(document).ready(function(){
		autoMenuSize();
		$(window).resize(function (){
			autoMenuSize();
		});
        var body,content,nav,nav_closed_width,nav_toggler;
        nav_toggler=$(".navbar-mini");
        nav=$("#main-nav");
        content=$("#content");
        body=$("body");
        nav_closed_width=45;
		$("#main-nav").on("click",".dropdown-collapse",function(e){
            e.preventDefault();
            var _this=$(this);
            var _parent_ul=_this.parent().find("> ul");
            if(_parent_ul.is(":visible")){
                if(body.hasClass("main-nav-closed") && _this.parents("li").length === 1){
					$(document).trigger("nav-open");
					menuIn(_parent_ul,_this);
                }
				else{
					menuOut(_parent_ul,_this);
				}
            }
			else{
				if(!_this.find("span").is(":visible")){
					$(document).trigger("nav-open");
				}
				menuIn(_parent_ul,_this);
            }

        });
        nav.swiperight(function(event,touch){
            $(document).trigger("nav-open");
        });
        nav.swipeleft(function(event,touch){
            $(document).trigger("nav-close");
        });
        nav_toggler.on("click",function(){
			if(body.hasClass("main-nav-opened")){
				$(document).trigger("nav-close");
			}
			else if(body.hasClass("main-nav-closed")){
				$(document).trigger("nav-open");
			}
			else{
				if($(document).width()<=768){
					$(document).trigger("nav-open");
				}
				else{
					$(document).trigger("nav-close");
				}
				
			}
            return false;
        });
        $(document).bind("nav-close", function(event, params) {
            body.removeClass("main-nav-opened").addClass("main-nav-closed");
        });
        $(document).bind("nav-open", function(event, params) {
            body.addClass("main-nav-opened").removeClass("main-nav-closed");
        });
		$("#main-nav .navigation > .nav").on("click","li .nav li a",function(){
			if($(this).find("b.caret").length==0){
				$("#main-nav .navigation > .nav > li > .nav > li > a,#main-nav .navigation > .nav > li > .nav > li > .nav > li > a").removeClass("on");
				$(this).addClass("on");
			}
		});
		$("#main-nav .navigation > .nav").on("click","li .nav li .nav li a",function(){
			$("#main-nav .navigation > .nav > li > .nav > li > a,#main-nav .navigation > .nav > li > .nav > li > .nav > li > a").removeClass("on");
			$(this).addClass("on");
		});
		$(".navbar .nav_right li.user-menu ul.dropdown-menu li a").on("click",function(){
			$(this).parent().parent().parent().find("a.dropdown-toggle").click();
		});

    });
}).call(this);
function autoMenuSize(){
	if($(document).width()<=768){
		$(document).trigger("nav-close");
	}
	else{
		$(document).trigger("nav-open");
	}
	if($("ul.nav_menus").length){
		var _height=$(document).height();
		//_height=_height-118;
		_height=_height-80;
		$("ul.nav_menus").animate({height:_height+"px"},'fast','swing');
	}
}
function menuIn(_parent_ul,_this){
	_this.addClass("in");
	_parent_ul.slideDown(300,function(){
		$(this).addClass("in");
		var nav_scroll=$(".nav_menus").scrollTop();
		var _offsetTop=_parent_ul.find(">li:last-child").offset().top;
		if(_offsetTop>=$(window).height()){
			$(".nav_menus").animate({scrollTop:(nav_scroll+_parent_ul.height()+40)},300);
		}
	});
}
function menuOut(_parent_ul,_this){
	_this.removeClass("in");
	_parent_ul.slideUp(300,function(){
		$(this).removeClass("in");
	});
}