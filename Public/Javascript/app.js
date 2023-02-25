$(document).ready(function() {
    $('.course-slider').slick({
        slidesToShow:3,
        slidesToScroll:1,
        prevArrow:".prev-btn",
        nextArrow:".next-btn",
        autoplay:true,
        responsive:[
            {
                breakpoint:992,
                settings:{
                    slidesToShow:2, 
                }
            },
            {
                breakpoint:768,
                settings:{
                    slidesToShow:1, 
                }
            }
        ]
    });

    $('.nav-trigger').click(function(){
        $('.site-content-wrapper').toggleClass('scaled')
    })
})