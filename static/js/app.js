$(function () {
    var current_screen = 1;
    var last_screen = $('.screen').last().data('screen');
    var isAnimating = false;
    var btn_prev = $('#nav-prev');
    var btn_next = $('#nav-next');
    var last_direction;
    var stopNavigation = false;

    //Переключение кнопок навигации в зависимости от текущего экрана
    function toggle_buttons() {
        if (current_screen == 1) {
            btn_prev.hide();
            btn_next.show();
        } else if (current_screen == last_screen) {
            btn_next.hide();
            btn_prev.show();
        } else {
            btn_next.show();
            btn_prev.show();
        }
    }

    //Навигация по слайдам
    function navigate_to_slide(index, speed) {
        speed = speed | 200;
        var el = $('.screen[data-screen="' + index + '"]');

        while (!el.size()) {
            index = index + last_direction;
            el = $('.screen[data-screen="' + index + '"]');
            if (!el.size() || (index > last_screen) || (index < 1)) {
                return;
            }
        }
        current_screen = index;

        //Обновляем кнопки
        toggle_buttons();

        isAnimating = true;
        $('html, body').animate({
            scrollTop: el.offset().top
        }, speed, function () {
            isAnimating = false;
        });
    }

    //Эффект размытия для блока
    function blur_block(el, onBlurCallback, radius) {
        radius = radius || 2;
        el.foggy({
            blurRadius: 2
        });
        setTimeout(onBlurCallback, 200);

        setTimeout(function () {
            el.foggy(false);
        }, 500);
    }

    //Обработчик кнопок Вперед/Назад
    $('#nav-prev, #nav-next').on('click', function (e) {
        e.preventDefault();

        if ($(this).attr('id') == 'nav-prev') {
            //back
            if (current_screen >= 2) {
                --current_screen;
                last_direction = -1;
            }
        } else {
            //forward
            if (current_screen < last_screen) {
                current_screen++;
                last_direction = 1;
            }
        }

        navigate_to_slide(current_screen);
    });

    //Обработчик навигации по клавиатуре
    $(document).keydown(function (e) {
        switch (e.which) {
            case 33: //PgUp
            case 37: // left
            case 38: // up
                btn_prev.click();
                break;

            case 32: //spacebar
            case 34: //PgDw
            case 39: // right
            case 40: // down
                btn_next.click();
                break;

            case 36://home
                navigate_to_slide(1);
                break;
            case 35://End
                navigate_to_slide(last_screen);
                break;

            default:
                return; // exit this handler for other keys
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    //При загрузке страницы переходим к первому экрану
    navigate_to_slide(current_screen);

    //Обновление кнопок при скроле
    $(window).on('scroll', function () {
        var index = $('.screen:in-viewport').first().data('screen');
        if ((index == current_screen) || isAnimating) {
            return;
        }
        current_screen = index;
        //Обновляем кнопки
        toggle_buttons();
    });

    //Подключаем плагин маскированного ввода
    $("input.inputmask").each(function () {
        $(this).inputmask($(this).data('inputmask'));
    });

    //Перехватываем кнопку заказать звонок
    $('button[data-target="#modalContact"]').off('click').on('click', function (e) {
        e.preventDefault();
        var speed = 100 + (last_screen - current_screen) * 100;
        navigate_to_slide(6, speed);
        return false;
    });

    //Слайдер работ
    var carousel = $('#carousel-portfolio');
    var carousel_caption = $('div.screen-4 .caption');
    //Сделаем первый слайд активным
    carousel.find('.item:first').addClass('active');
    carousel.find('.carousel-indicators li:first').addClass('active');
    //Повешаем событие на момент слайдинга
    carousel.on('slide.bs.carousel', function (e) {
        var target = $(e.relatedTarget);
        carousel_caption.text(target.data('title'));
    });

    //Переключатель цен
    var range = $('.price-range-block');
    var price_block = range.find('.price-block');
    var range_title = price_block.find('.price-label');
    var range_price = price_block.find('.price span');
    var price_description = $('.price-description');
    var range_indicator = range.find('.step-indicator');
    range
        .find('.step')
        .on('click', function (e) {
            //Принудительно прокрутим экран до начала слайда
            if (stopNavigation) {
                stopNavigation = false;
            } else {
                navigate_to_slide(5);
            }
            e.preventDefault();
            var that = $(this);

            //переместим индикатор
            range_indicator
                .addClass('lined')
                .on('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function () {
                    $(this).removeClass('lined');
                });
            setTimeout(function () {
                range_indicator.css({left: that.data('percent') + "%"})
            }, 200);

            //Заблюрим инфу
            blur_block(price_block, function () {
                range_title.text(that.data('title'));
                range_price.text(that.data('price'));
            });

            blur_block(price_description, function () {
                price_description.html(that.data('description'));
            });
        });
    stopNavigation = true;
    range.find('.step:first').addClass('active').click();

    //Форма контактов
    var contact_form = $('#contact-form');
    var contact_form_submit = contact_form.find('.submit');
    var contact_form_field_name = contact_form.find('input[name="name"]');
    var contact_form_field_phone = contact_form.find('input[name="phone"]');

    //Валидатор поля Имя
    function contact_form_validate_name() {
        if (!contact_form_field_name.val() || (contact_form_field_name.val().length < 2)) {
            contact_form_field_name.addClass('has-error');
            return false;
        } else {
            contact_form_field_name.removeClass('has-error');
            return true;
        }
    }

    //Валидатор поля Телефон
    function contact_form_validate_phone() {
        if (!contact_form_field_phone.val() || (contact_form_field_phone.val().length < 2)) {
            contact_form_field_phone.addClass('has-error');
            return false;
        } else {
            contact_form_field_phone.removeClass('has-error');
            return true;
        }
    }

    var csrftoken = $.cookie('csrftoken');
    //$.ajaxSetup({
    //    headers: {"X-CSRFToken": $.cookie("csrftoken")}
    //});
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    //Обработчик отправки формы
    contact_form_submit.on('click', function (e) {
        e.preventDefault();
        var that = this;
        var name = contact_form_field_name.val();
        var phone = contact_form_field_phone.val();
        that.innerHTML += '<span class="glyphicon glyphicon-refresh glyphicon-refresh-animate" style="margin-left:5px;"></span>';
        if (contact_form_validate_name() && contact_form_validate_phone()) {
            $.post('/ajax_contact', {ajax: 1, name: name, phone: phone}, function (json) {
                $.notify(json.message, {type: json.status ? 'success' : "danger"});
                contact_form_field_name.val("");
                contact_form_field_phone.val("");
                $(that).find('.glyphicon').remove();
            });
        } else {
            $(that).find('.glyphicon').remove();
        }
    });
});
