$(document).ready(function(){
$('.pr-sliders').owlCarousel({
    loop:true,
    margin:10,
    nav:false,
    autoplay:true,
    autoplayTimeout:5000,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:1
        },
        1000:{
            items:1
        }
    }
});
});

$(document).ready(function(){
    $('.shop-pr-slider').owlCarousel({
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:3
            }
        }
    });
});


$(document).ready(function(){
    $('.reviews-slider2').owlCarousel({
        loop:true,
        margin:10,
        nav:false,
        autoplay:true,
        autoplayTimeout:5000,
        autoplayHoverPause:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:2
            },
            1000:{
                items:2
            }
        }
    });
});


$(document).ready(function(){
 /*==========sticky menu js ===========*/
 function stickyHeader() {
    if ($("#stricky").length) {
        var strickyScrollPos = 0;
        if ($(window).scrollTop() > strickyScrollPos) {
            $("#stricky").removeClass("");
            $("#stricky").addClass("stricky-fixed")
        } else if ($(window).scrollTop() <= strickyScrollPos) {
            $("#stricky").removeClass("stricky-fixed");
        }
    }
}
// instance of fuction while Window Scroll event
$(window).on("scroll", function () {
    stickyHeader()
});
});