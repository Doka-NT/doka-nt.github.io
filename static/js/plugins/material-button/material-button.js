$(function () {

    var element, circle, d, x, y;

    $('button, .btn, .anim-btn').each(function () {
        var html = $(this).html();
        if (html.indexOf('span') < 0) {
            $(this).html($(this).html() + '<span></span>');
        }
    });

    $("button span, .btn span, .anim-btn").click(function (e) {

        element = $(this);

        if (element.find(".circle").length == 0)
            element.prepend("<span class='circle'></span>");

        circle = element.find(".circle");
        circle.removeClass("animate");

        if (!circle.height() && !circle.width()) {
            d = Math.max(element.outerWidth(), element.outerHeight());
            circle.css({height: d, width: d});
        }

        x = e.pageX - element.offset().left - circle.width() / 2;
        y = e.pageY - element.offset().top - circle.height() / 2;

        circle.css({top: y + 'px', left: x + 'px'}).addClass("animate");
    });
});
