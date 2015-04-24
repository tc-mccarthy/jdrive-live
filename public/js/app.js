/*
 * jQuery carouFredSel 6.2.1
 * Demo's and documentation:
 * caroufredsel.dev7studios.com
 *
 * Copyright (c) 2013 Fred Heusschen
 * www.frebsite.nl
 *
 * Dual licensed under the MIT and GPL licenses.
 * http://en.wikipedia.org/wiki/MIT_License
 * http://en.wikipedia.org/wiki/GNU_General_Public_License
 */


(function($) {


    // LOCAL

    if ($.fn.carouFredSel) {
        return;
    }

    $.fn.caroufredsel = $.fn.carouFredSel = function(options, configs) {

        // no element
        if (this.length == 0) {
            debug(true, 'No element found for "' + this.selector + '".');
            return this;
        }

        // multiple elements
        if (this.length > 1) {
            return this.each(function() {
                $(this).carouFredSel(options, configs);
            });
        }


        var $cfs = this,
            $tt0 = this[0],
            starting_position = false;

        if ($cfs.data('_cfs_isCarousel')) {
            starting_position = $cfs.triggerHandler('_cfs_triggerEvent', 'currentPosition');
            $cfs.trigger('_cfs_triggerEvent', ['destroy', true]);
        }

        var FN = {};

        FN._init = function(o, setOrig, start) {
            o = go_getObject($tt0, o);

            o.items = go_getItemsObject($tt0, o.items);
            o.scroll = go_getScrollObject($tt0, o.scroll);
            o.auto = go_getAutoObject($tt0, o.auto);
            o.prev = go_getPrevNextObject($tt0, o.prev);
            o.next = go_getPrevNextObject($tt0, o.next);
            o.pagination = go_getPaginationObject($tt0, o.pagination);
            o.swipe = go_getSwipeObject($tt0, o.swipe);
            o.mousewheel = go_getMousewheelObject($tt0, o.mousewheel);

            if (setOrig) {
                opts_orig = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
            }

            opts = $.extend(true, {}, $.fn.carouFredSel.defaults, o);
            opts.d = cf_getDimensions(opts);

            crsl.direction = (opts.direction == 'up' || opts.direction == 'left') ? 'next' : 'prev';

            var a_itm = $cfs.children(),
                avail_primary = ms_getParentSize($wrp, opts, 'width');

            if (is_true(opts.cookie)) {
                opts.cookie = 'caroufredsel_cookie_' + conf.serialNumber;
            }

            opts.maxDimension = ms_getMaxDimension(opts, avail_primary);

            // complement items and sizes
            opts.items = in_complementItems(opts.items, opts, a_itm, start);
            opts[opts.d['width']] = in_complementPrimarySize(opts[opts.d['width']], opts, a_itm);
            opts[opts.d['height']] = in_complementSecondarySize(opts[opts.d['height']], opts, a_itm);

            // primary size not set for a responsive carousel
            if (opts.responsive) {
                if (!is_percentage(opts[opts.d['width']])) {
                    opts[opts.d['width']] = '100%';
                }
            }

            // primary size is percentage
            if (is_percentage(opts[opts.d['width']])) {
                crsl.upDateOnWindowResize = true;
                crsl.primarySizePercentage = opts[opts.d['width']];
                opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
                if (!opts.items.visible) {
                    opts.items.visibleConf.variable = true;
                }
            }

            if (opts.responsive) {
                opts.usePadding = false;
                opts.padding = [0, 0, 0, 0];
                opts.align = false;
                opts.items.visibleConf.variable = false;
            } else {
                // visible-items not set
                if (!opts.items.visible) {
                    opts = in_complementVisibleItems(opts, avail_primary);
                }

                // primary size not set -> calculate it or set to "variable"
                if (!opts[opts.d['width']]) {
                    if (!opts.items.visibleConf.variable && is_number(opts.items[opts.d['width']]) && opts.items.filter == '*') {
                        opts[opts.d['width']] = opts.items.visible * opts.items[opts.d['width']];
                        opts.align = false;
                    } else {
                        opts[opts.d['width']] = 'variable';
                    }
                }
                // align not set -> set to center if primary size is number
                if (is_undefined(opts.align)) {
                    opts.align = (is_number(opts[opts.d['width']])) ? 'center' : false;
                }
                // set variabe visible-items
                if (opts.items.visibleConf.variable) {
                    opts.items.visible = gn_getVisibleItemsNext(a_itm, opts, 0);
                }
            }

            // set visible items by filter
            if (opts.items.filter != '*' && !opts.items.visibleConf.variable) {
                opts.items.visibleConf.org = opts.items.visible;
                opts.items.visible = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
            }

            opts.items.visible = cf_getItemsAdjust(opts.items.visible, opts, opts.items.visibleConf.adjust, $tt0);
            opts.items.visibleConf.old = opts.items.visible;

            if (opts.responsive) {
                if (!opts.items.visibleConf.min) {
                    opts.items.visibleConf.min = opts.items.visible;
                }
                if (!opts.items.visibleConf.max) {
                    opts.items.visibleConf.max = opts.items.visible;
                }
                opts = in_getResponsiveValues(opts, a_itm, avail_primary);
            } else {
                opts.padding = cf_getPadding(opts.padding);

                if (opts.align == 'top') {
                    opts.align = 'left';
                } else if (opts.align == 'bottom') {
                    opts.align = 'right';
                }

                switch (opts.align) {
                    // align: center, left or right
                    case 'center':
                    case 'left':
                    case 'right':
                        if (opts[opts.d['width']] != 'variable') {
                            opts = in_getAlignPadding(opts, a_itm);
                            opts.usePadding = true;
                        }
                        break;

                        // padding
                    default:
                        opts.align = false;
                        opts.usePadding = (
                            opts.padding[0] == 0 &&
                            opts.padding[1] == 0 &&
                            opts.padding[2] == 0 &&
                            opts.padding[3] == 0
                        ) ? false : true;
                        break;
                }
            }

            if (!is_number(opts.scroll.duration)) {
                opts.scroll.duration = 500;
            }
            if (is_undefined(opts.scroll.items)) {
                opts.scroll.items = (opts.responsive || opts.items.visibleConf.variable || opts.items.filter != '*') ? 'visible' : opts.items.visible;
            }

            opts.auto = $.extend(true, {}, opts.scroll, opts.auto);
            opts.prev = $.extend(true, {}, opts.scroll, opts.prev);
            opts.next = $.extend(true, {}, opts.scroll, opts.next);
            opts.pagination = $.extend(true, {}, opts.scroll, opts.pagination);
            // swipe and mousewheel extend later on, per direction

            opts.auto = go_complementAutoObject($tt0, opts.auto);
            opts.prev = go_complementPrevNextObject($tt0, opts.prev);
            opts.next = go_complementPrevNextObject($tt0, opts.next);
            opts.pagination = go_complementPaginationObject($tt0, opts.pagination);
            opts.swipe = go_complementSwipeObject($tt0, opts.swipe);
            opts.mousewheel = go_complementMousewheelObject($tt0, opts.mousewheel);

            if (opts.synchronise) {
                opts.synchronise = cf_getSynchArr(opts.synchronise);
            }


            // DEPRECATED
            if (opts.auto.onPauseStart) {
                opts.auto.onTimeoutStart = opts.auto.onPauseStart;
                deprecated('auto.onPauseStart', 'auto.onTimeoutStart');
            }
            if (opts.auto.onPausePause) {
                opts.auto.onTimeoutPause = opts.auto.onPausePause;
                deprecated('auto.onPausePause', 'auto.onTimeoutPause');
            }
            if (opts.auto.onPauseEnd) {
                opts.auto.onTimeoutEnd = opts.auto.onPauseEnd;
                deprecated('auto.onPauseEnd', 'auto.onTimeoutEnd');
            }
            if (opts.auto.pauseDuration) {
                opts.auto.timeoutDuration = opts.auto.pauseDuration;
                deprecated('auto.pauseDuration', 'auto.timeoutDuration');
            }
            // /DEPRECATED


        }; // /init


        FN._build = function() {
            $cfs.data('_cfs_isCarousel', true);

            var a_itm = $cfs.children(),
                orgCSS = in_mapCss($cfs, ['textAlign', 'float', 'position', 'top', 'right', 'bottom', 'left', 'zIndex', 'width', 'height', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']),
                newPosition = 'relative';

            switch (orgCSS.position) {
                case 'absolute':
                case 'fixed':
                    newPosition = orgCSS.position;
                    break;
            }

            if (conf.wrapper == 'parent') {
                sz_storeOrigCss($wrp);
            } else {
                $wrp.css(orgCSS);
            }
            $wrp.css({
                'overflow': 'hidden',
                'position': newPosition
            });

            sz_storeOrigCss($cfs);
            $cfs.data('_cfs_origCssZindex', orgCSS.zIndex);
            $cfs.css({
                'textAlign': 'left',
                'float': 'none',
                'position': 'absolute',
                'top': 0,
                'right': 'auto',
                'bottom': 'auto',
                'left': 0,
                'marginTop': 0,
                'marginRight': 0,
                'marginBottom': 0,
                'marginLeft': 0
            });

            sz_storeMargin(a_itm, opts);
            sz_storeOrigCss(a_itm);
            if (opts.responsive) {
                sz_setResponsiveSizes(opts, a_itm);
            }

        }; // /build


        FN._bind_events = function() {
            FN._unbind_events();


            // stop event
            $cfs.bind(cf_e('stop', conf), function(e, imm) {
                e.stopPropagation();

                // button
                if (!crsl.isStopped) {
                    if (opts.auto.button) {
                        opts.auto.button.addClass(cf_c('stopped', conf));
                    }
                }

                // set stopped
                crsl.isStopped = true;

                if (opts.auto.play) {
                    opts.auto.play = false;
                    $cfs.trigger(cf_e('pause', conf), imm);
                }
                return true;
            });


            // finish event
            $cfs.bind(cf_e('finish', conf), function(e) {
                e.stopPropagation();
                if (crsl.isScrolling) {
                    sc_stopScroll(scrl);
                }
                return true;
            });


            // pause event
            $cfs.bind(cf_e('pause', conf), function(e, imm, res) {
                e.stopPropagation();
                tmrs = sc_clearTimers(tmrs);

                // immediately pause
                if (imm && crsl.isScrolling) {
                    scrl.isStopped = true;
                    var nst = getTime() - scrl.startTime;
                    scrl.duration -= nst;
                    if (scrl.pre) {
                        scrl.pre.duration -= nst;
                    }
                    if (scrl.post) {
                        scrl.post.duration -= nst;
                    }
                    sc_stopScroll(scrl, false);
                }

                // update remaining pause-time
                if (!crsl.isPaused && !crsl.isScrolling) {
                    if (res) {
                        tmrs.timePassed += getTime() - tmrs.startTime;
                    }
                }

                // button
                if (!crsl.isPaused) {
                    if (opts.auto.button) {
                        opts.auto.button.addClass(cf_c('paused', conf));
                    }
                }

                // set paused
                crsl.isPaused = true;

                // pause pause callback
                if (opts.auto.onTimeoutPause) {
                    var dur1 = opts.auto.timeoutDuration - tmrs.timePassed,
                        perc = 100 - Math.ceil(dur1 * 100 / opts.auto.timeoutDuration);

                    opts.auto.onTimeoutPause.call($tt0, perc, dur1);
                }
                return true;
            });


            // play event
            $cfs.bind(cf_e('play', conf), function(e, dir, del, res) {
                e.stopPropagation();
                tmrs = sc_clearTimers(tmrs);

                // sort params
                var v = [dir, del, res],
                    t = ['string', 'number', 'boolean'],
                    a = cf_sortParams(v, t);

                dir = a[0];
                del = a[1];
                res = a[2];

                if (dir != 'prev' && dir != 'next') {
                    dir = crsl.direction;
                }
                if (!is_number(del)) {
                    del = 0;
                }
                if (!is_boolean(res)) {
                    res = false;
                }

                // stopped?
                if (res) {
                    crsl.isStopped = false;
                    opts.auto.play = true;
                }
                if (!opts.auto.play) {
                    e.stopImmediatePropagation();
                    return debug(conf, 'Carousel stopped: Not scrolling.');
                }

                // button
                if (crsl.isPaused) {
                    if (opts.auto.button) {
                        opts.auto.button.removeClass(cf_c('stopped', conf));
                        opts.auto.button.removeClass(cf_c('paused', conf));
                    }
                }

                // set playing
                crsl.isPaused = false;
                tmrs.startTime = getTime();

                // timeout the scrolling
                var dur1 = opts.auto.timeoutDuration + del;
                dur2 = dur1 - tmrs.timePassed;
                perc = 100 - Math.ceil(dur2 * 100 / dur1);

                if (opts.auto.progress) {
                    tmrs.progress = setInterval(function() {
                        var pasd = getTime() - tmrs.startTime + tmrs.timePassed,
                            perc = Math.ceil(pasd * 100 / dur1);
                        opts.auto.progress.updater.call(opts.auto.progress.bar[0], perc);
                    }, opts.auto.progress.interval);
                }

                tmrs.auto = setTimeout(function() {
                    if (opts.auto.progress) {
                        opts.auto.progress.updater.call(opts.auto.progress.bar[0], 100);
                    }
                    if (opts.auto.onTimeoutEnd) {
                        opts.auto.onTimeoutEnd.call($tt0, perc, dur2);
                    }
                    if (crsl.isScrolling) {
                        $cfs.trigger(cf_e('play', conf), dir);
                    } else {
                        $cfs.trigger(cf_e(dir, conf), opts.auto);
                    }
                }, dur2);

                // pause start callback
                if (opts.auto.onTimeoutStart) {
                    opts.auto.onTimeoutStart.call($tt0, perc, dur2);
                }

                return true;
            });


            // resume event
            $cfs.bind(cf_e('resume', conf), function(e) {
                e.stopPropagation();
                if (scrl.isStopped) {
                    scrl.isStopped = false;
                    crsl.isPaused = false;
                    crsl.isScrolling = true;
                    scrl.startTime = getTime();
                    sc_startScroll(scrl, conf);
                } else {
                    $cfs.trigger(cf_e('play', conf));
                }
                return true;
            });


            // prev + next events
            $cfs.bind(cf_e('prev', conf) + ' ' + cf_e('next', conf), function(e, obj, num, clb, que) {
                e.stopPropagation();

                // stopped or hidden carousel, don't scroll, don't queue
                if (crsl.isStopped || $cfs.is(':hidden')) {
                    e.stopImmediatePropagation();
                    return debug(conf, 'Carousel stopped or hidden: Not scrolling.');
                }

                // not enough items
                var minimum = (is_number(opts.items.minimum)) ? opts.items.minimum : opts.items.visible + 1;
                if (minimum > itms.total) {
                    e.stopImmediatePropagation();
                    return debug(conf, 'Not enough items (' + itms.total + ' total, ' + minimum + ' needed): Not scrolling.');
                }

                // get config
                var v = [obj, num, clb, que],
                    t = ['object', 'number/string', 'function', 'boolean'],
                    a = cf_sortParams(v, t);

                obj = a[0];
                num = a[1];
                clb = a[2];
                que = a[3];

                var eType = e.type.slice(conf.events.prefix.length);

                if (!is_object(obj)) {
                    obj = {};
                }
                if (is_function(clb)) {
                    obj.onAfter = clb;
                }
                if (is_boolean(que)) {
                    obj.queue = que;
                }
                obj = $.extend(true, {}, opts[eType], obj);

                // test conditions callback
                if (obj.conditions && !obj.conditions.call($tt0, eType)) {
                    e.stopImmediatePropagation();
                    return debug(conf, 'Callback "conditions" returned false.');
                }

                if (!is_number(num)) {
                    if (opts.items.filter != '*') {
                        num = 'visible';
                    } else {
                        var arr = [num, obj.items, opts[eType].items];
                        for (var a = 0, l = arr.length; a < l; a++) {
                            if (is_number(arr[a]) || arr[a] == 'page' || arr[a] == 'visible') {
                                num = arr[a];
                                break;
                            }
                        }
                    }
                    switch (num) {
                        case 'page':
                            e.stopImmediatePropagation();
                            return $cfs.triggerHandler(cf_e(eType + 'Page', conf), [obj, clb]);
                            break;

                        case 'visible':
                            if (!opts.items.visibleConf.variable && opts.items.filter == '*') {
                                num = opts.items.visible;
                            }
                            break;
                    }
                }

                // resume animation, add current to queue
                if (scrl.isStopped) {
                    $cfs.trigger(cf_e('resume', conf));
                    $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
                    e.stopImmediatePropagation();
                    return debug(conf, 'Carousel resumed scrolling.');
                }

                // queue if scrolling
                if (obj.duration > 0) {
                    if (crsl.isScrolling) {
                        if (obj.queue) {
                            if (obj.queue == 'last') {
                                queu = [];
                            }
                            if (obj.queue != 'first' || queu.length == 0) {
                                $cfs.trigger(cf_e('queue', conf), [eType, [obj, num, clb]]);
                            }
                        }
                        e.stopImmediatePropagation();
                        return debug(conf, 'Carousel currently scrolling.');
                    }
                }

                tmrs.timePassed = 0;
                $cfs.trigger(cf_e('slide_' + eType, conf), [obj, num]);

                // synchronise
                if (opts.synchronise) {
                    var s = opts.synchronise,
                        c = [obj, num];

                    for (var j = 0, l = s.length; j < l; j++) {
                        var d = eType;
                        if (!s[j][2]) {
                            d = (d == 'prev') ? 'next' : 'prev';
                        }
                        if (!s[j][1]) {
                            c[0] = s[j][0].triggerHandler('_cfs_triggerEvent', ['configuration', d]);
                        }
                        c[1] = num + s[j][3];
                        s[j][0].trigger('_cfs_triggerEvent', ['slide_' + d, c]);
                    }
                }
                return true;
            });


            // prev event
            $cfs.bind(cf_e('slide_prev', conf), function(e, sO, nI) {
                e.stopPropagation();
                var a_itm = $cfs.children();

                // non-circular at start, scroll to end
                if (!opts.circular) {
                    if (itms.first == 0) {
                        if (opts.infinite) {
                            $cfs.trigger(cf_e('next', conf), itms.total - 1);
                        }
                        return e.stopImmediatePropagation();
                    }
                }

                sz_resetMargin(a_itm, opts);

                // find number of items to scroll
                if (!is_number(nI)) {
                    if (opts.items.visibleConf.variable) {
                        nI = gn_getVisibleItemsPrev(a_itm, opts, itms.total - 1);
                    } else if (opts.items.filter != '*') {
                        var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
                        nI = gn_getScrollItemsPrevFilter(a_itm, opts, itms.total - 1, xI);
                    } else {
                        nI = opts.items.visible;
                    }
                    nI = cf_getAdjust(nI, opts, sO.items, $tt0);
                }

                // prevent non-circular from scrolling to far
                if (!opts.circular) {
                    if (itms.total - nI < itms.first) {
                        nI = itms.total - itms.first;
                    }
                }

                // set new number of visible items
                opts.items.visibleConf.old = opts.items.visible;
                if (opts.items.visibleConf.variable) {
                    var vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total - nI), opts, opts.items.visibleConf.adjust, $tt0);
                    if (opts.items.visible + nI <= vI && nI < itms.total) {
                        nI++;
                        vI = cf_getItemsAdjust(gn_getVisibleItemsNext(a_itm, opts, itms.total - nI), opts, opts.items.visibleConf.adjust, $tt0);
                    }
                    opts.items.visible = vI;
                } else if (opts.items.filter != '*') {
                    var vI = gn_getVisibleItemsNextFilter(a_itm, opts, itms.total - nI);
                    opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                }

                sz_resetMargin(a_itm, opts, true);

                // scroll 0, don't scroll
                if (nI == 0) {
                    e.stopImmediatePropagation();
                    return debug(conf, '0 items to scroll: Not scrolling.');
                }
                debug(conf, 'Scrolling ' + nI + ' items backward.');


                // save new config
                itms.first += nI;
                while (itms.first >= itms.total) {
                    itms.first -= itms.total;
                }

                // non-circular callback
                if (!opts.circular) {
                    if (itms.first == 0 && sO.onEnd) {
                        sO.onEnd.call($tt0, 'prev');
                    }
                    if (!opts.infinite) {
                        nv_enableNavi(opts, itms.first, conf);
                    }
                }

                // rearrange items
                $cfs.children().slice(itms.total - nI, itms.total).prependTo($cfs);
                if (itms.total < opts.items.visible + nI) {
                    $cfs.children().slice(0, (opts.items.visible + nI) - itms.total).clone(true).appendTo($cfs);
                }

                // the needed items
                var a_itm = $cfs.children(),
                    i_old = gi_getOldItemsPrev(a_itm, opts, nI),
                    i_new = gi_getNewItemsPrev(a_itm, opts),
                    i_cur_l = a_itm.eq(nI - 1),
                    i_old_l = i_old.last(),
                    i_new_l = i_new.last();

                sz_resetMargin(a_itm, opts);

                var pL = 0,
                    pR = 0;

                if (opts.align) {
                    var p = cf_getAlignPadding(i_new, opts);
                    pL = p[0];
                    pR = p[1];
                }
                var oL = (pL < 0) ? opts.padding[opts.d[3]] : 0;

                // hide items for fx directscroll
                var hiddenitems = false,
                    i_skp = $();
                if (opts.items.visible < nI) {
                    i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
                    if (sO.fx == 'directscroll') {
                        var orgW = opts.items[opts.d['width']];
                        hiddenitems = i_skp;
                        i_cur_l = i_new_l;
                        sc_hideHiddenItems(hiddenitems);
                        opts.items[opts.d['width']] = 'variable';
                    }
                }

                // save new sizes
                var $cf2 = false,
                    i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
                    w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
                    i_siz_vis = 0,
                    a_cfs = {},
                    a_wsz = {},
                    a_cur = {},
                    a_old = {},
                    a_new = {},
                    a_lef = {},
                    a_lef_vis = {},
                    a_dur = sc_getDuration(sO, opts, nI, i_siz);

                switch (sO.fx) {
                    case 'cover':
                    case 'cover-fade':
                        i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visible), opts, 'width');
                        break;
                }

                if (hiddenitems) {
                    opts.items[opts.d['width']] = orgW;
                }

                sz_resetMargin(a_itm, opts, true);
                if (pR >= 0) {
                    sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);
                }
                if (pL >= 0) {
                    sz_resetMargin(i_cur_l, opts, opts.padding[opts.d[3]]);
                }

                if (opts.align) {
                    opts.padding[opts.d[1]] = pR;
                    opts.padding[opts.d[3]] = pL;
                }

                a_lef[opts.d['left']] = -(i_siz - oL);
                a_lef_vis[opts.d['left']] = -(i_siz_vis - oL);
                a_wsz[opts.d['left']] = w_siz[opts.d['width']];

                // scrolling functions
                var _s_wrapper = function() {},
                    _a_wrapper = function() {},
                    _s_paddingold = function() {},
                    _a_paddingold = function() {},
                    _s_paddingnew = function() {},
                    _a_paddingnew = function() {},
                    _s_paddingcur = function() {},
                    _a_paddingcur = function() {},
                    _onafter = function() {},
                    _moveitems = function() {},
                    _position = function() {};

                // clone carousel
                switch (sO.fx) {
                    case 'crossfade':
                    case 'cover':
                    case 'cover-fade':
                    case 'uncover':
                    case 'uncover-fade':
                        $cf2 = $cfs.clone(true).appendTo($wrp);
                        break;
                }
                switch (sO.fx) {
                    case 'crossfade':
                    case 'uncover':
                    case 'uncover-fade':
                        $cf2.children().slice(0, nI).remove();
                        $cf2.children().slice(opts.items.visibleConf.old).remove();
                        break;

                    case 'cover':
                    case 'cover-fade':
                        $cf2.children().slice(opts.items.visible).remove();
                        $cf2.css(a_lef_vis);
                        break;
                }

                $cfs.css(a_lef);

                // reset all scrolls
                scrl = sc_setScroll(a_dur, sO.easing, conf);

                // animate / set carousel
                a_cfs[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

                // animate / set wrapper
                if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable') {
                    _s_wrapper = function() {
                        $wrp.css(w_siz);
                    };
                    _a_wrapper = function() {
                        scrl.anims.push([$wrp, w_siz]);
                    };
                }

                // animate / set items
                if (opts.usePadding) {
                    if (i_new_l.not(i_cur_l).length) {
                        a_cur[opts.d['marginRight']] = i_cur_l.data('_cfs_origCssMargin');

                        if (pL < 0) {
                            i_cur_l.css(a_cur);
                        } else {
                            _s_paddingcur = function() {
                                i_cur_l.css(a_cur);
                            };
                            _a_paddingcur = function() {
                                scrl.anims.push([i_cur_l, a_cur]);
                            };
                        }
                    }
                    switch (sO.fx) {
                        case 'cover':
                        case 'cover-fade':
                            $cf2.children().eq(nI - 1).css(a_cur);
                            break;
                    }

                    if (i_new_l.not(i_old_l).length) {
                        a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
                        _s_paddingold = function() {
                            i_old_l.css(a_old);
                        };
                        _a_paddingold = function() {
                            scrl.anims.push([i_old_l, a_old]);
                        };
                    }

                    if (pR >= 0) {
                        a_new[opts.d['marginRight']] = i_new_l.data('_cfs_origCssMargin') + opts.padding[opts.d[1]];
                        _s_paddingnew = function() {
                            i_new_l.css(a_new);
                        };
                        _a_paddingnew = function() {
                            scrl.anims.push([i_new_l, a_new]);
                        };
                    }
                }

                // set position
                _position = function() {
                    $cfs.css(a_cfs);
                };


                var overFill = opts.items.visible + nI - itms.total;

                // rearrange items
                _moveitems = function() {
                    if (overFill > 0) {
                        $cfs.children().slice(itms.total).remove();
                        i_old = $($cfs.children().slice(itms.total - (opts.items.visible - overFill)).get().concat($cfs.children().slice(0, overFill).get()));
                    }
                    sc_showHiddenItems(hiddenitems);

                    if (opts.usePadding) {
                        var l_itm = $cfs.children().eq(opts.items.visible + nI - 1);
                        l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
                    }
                };


                var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'prev', a_dur, w_siz);

                // fire onAfter callbacks
                _onafter = function() {
                    sc_afterScroll($cfs, $cf2, sO);
                    crsl.isScrolling = false;
                    clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
                    queu = sc_fireQueue($cfs, queu, conf);

                    if (!crsl.isPaused) {
                        $cfs.trigger(cf_e('play', conf));
                    }
                };

                // fire onBefore callback
                crsl.isScrolling = true;
                tmrs = sc_clearTimers(tmrs);
                clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

                switch (sO.fx) {
                    case 'none':
                        $cfs.css(a_cfs);
                        _s_wrapper();
                        _s_paddingold();
                        _s_paddingnew();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        _onafter();
                        break;

                    case 'fade':
                        scrl.anims.push([$cfs, {
                                'opacity': 0
                            },
                            function() {
                                _s_wrapper();
                                _s_paddingold();
                                _s_paddingnew();
                                _s_paddingcur();
                                _position();
                                _moveitems();
                                scrl = sc_setScroll(a_dur, sO.easing, conf);
                                scrl.anims.push([$cfs, {
                                        'opacity': 1
                                    },
                                    _onafter
                                ]);
                                sc_startScroll(scrl, conf);
                            }
                        ]);
                        break;

                    case 'crossfade':
                        $cfs.css({
                            'opacity': 0
                        });
                        scrl.anims.push([$cf2, {
                            'opacity': 0
                        }]);
                        scrl.anims.push([$cfs, {
                                'opacity': 1
                            },
                            _onafter
                        ]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingnew();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    case 'cover':
                        scrl.anims.push([$cf2, a_cfs,
                            function() {
                                _s_paddingold();
                                _s_paddingnew();
                                _s_paddingcur();
                                _position();
                                _moveitems();
                                _onafter();
                            }
                        ]);
                        _a_wrapper();
                        break;

                    case 'cover-fade':
                        scrl.anims.push([$cfs, {
                            'opacity': 0
                        }]);
                        scrl.anims.push([$cf2, a_cfs,
                            function() {
                                _s_paddingold();
                                _s_paddingnew();
                                _s_paddingcur();
                                _position();
                                _moveitems();
                                _onafter();
                            }
                        ]);
                        _a_wrapper();
                        break;

                    case 'uncover':
                        scrl.anims.push([$cf2, a_wsz, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingnew();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    case 'uncover-fade':
                        $cfs.css({
                            'opacity': 0
                        });
                        scrl.anims.push([$cfs, {
                            'opacity': 1
                        }]);
                        scrl.anims.push([$cf2, a_wsz, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingnew();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    default:
                        scrl.anims.push([$cfs, a_cfs,
                            function() {
                                _moveitems();
                                _onafter();
                            }
                        ]);
                        _a_wrapper();
                        _a_paddingold();
                        _a_paddingnew();
                        _a_paddingcur();
                        break;
                }

                sc_startScroll(scrl, conf);
                cf_setCookie(opts.cookie, $cfs, conf);

                $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

                return true;
            });


            // next event
            $cfs.bind(cf_e('slide_next', conf), function(e, sO, nI) {
                e.stopPropagation();
                var a_itm = $cfs.children();

                // non-circular at end, scroll to start
                if (!opts.circular) {
                    if (itms.first == opts.items.visible) {
                        if (opts.infinite) {
                            $cfs.trigger(cf_e('prev', conf), itms.total - 1);
                        }
                        return e.stopImmediatePropagation();
                    }
                }

                sz_resetMargin(a_itm, opts);

                // find number of items to scroll
                if (!is_number(nI)) {
                    if (opts.items.filter != '*') {
                        var xI = (is_number(sO.items)) ? sO.items : gn_getVisibleOrg($cfs, opts);
                        nI = gn_getScrollItemsNextFilter(a_itm, opts, 0, xI);
                    } else {
                        nI = opts.items.visible;
                    }
                    nI = cf_getAdjust(nI, opts, sO.items, $tt0);
                }

                var lastItemNr = (itms.first == 0) ? itms.total : itms.first;

                // prevent non-circular from scrolling to far
                if (!opts.circular) {
                    if (opts.items.visibleConf.variable) {
                        var vI = gn_getVisibleItemsNext(a_itm, opts, nI),
                            xI = gn_getVisibleItemsPrev(a_itm, opts, lastItemNr - 1);
                    } else {
                        var vI = opts.items.visible,
                            xI = opts.items.visible;
                    }

                    if (nI + vI > lastItemNr) {
                        nI = lastItemNr - xI;
                    }
                }

                // set new number of visible items
                opts.items.visibleConf.old = opts.items.visible;
                if (opts.items.visibleConf.variable) {
                    var vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
                    while (opts.items.visible - nI >= vI && nI < itms.total) {
                        nI++;
                        vI = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(a_itm, opts, nI, lastItemNr), opts, opts.items.visibleConf.adjust, $tt0);
                    }
                    opts.items.visible = vI;
                } else if (opts.items.filter != '*') {
                    var vI = gn_getVisibleItemsNextFilter(a_itm, opts, nI);
                    opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                }

                sz_resetMargin(a_itm, opts, true);

                // scroll 0, don't scroll
                if (nI == 0) {
                    e.stopImmediatePropagation();
                    return debug(conf, '0 items to scroll: Not scrolling.');
                }
                debug(conf, 'Scrolling ' + nI + ' items forward.');


                // save new config
                itms.first -= nI;
                while (itms.first < 0) {
                    itms.first += itms.total;
                }

                // non-circular callback
                if (!opts.circular) {
                    if (itms.first == opts.items.visible && sO.onEnd) {
                        sO.onEnd.call($tt0, 'next');
                    }
                    if (!opts.infinite) {
                        nv_enableNavi(opts, itms.first, conf);
                    }
                }

                // rearrange items
                if (itms.total < opts.items.visible + nI) {
                    $cfs.children().slice(0, (opts.items.visible + nI) - itms.total).clone(true).appendTo($cfs);
                }

                // the needed items
                var a_itm = $cfs.children(),
                    i_old = gi_getOldItemsNext(a_itm, opts),
                    i_new = gi_getNewItemsNext(a_itm, opts, nI),
                    i_cur_l = a_itm.eq(nI - 1),
                    i_old_l = i_old.last(),
                    i_new_l = i_new.last();

                sz_resetMargin(a_itm, opts);

                var pL = 0,
                    pR = 0;

                if (opts.align) {
                    var p = cf_getAlignPadding(i_new, opts);
                    pL = p[0];
                    pR = p[1];
                }

                // hide items for fx directscroll
                var hiddenitems = false,
                    i_skp = $();
                if (opts.items.visibleConf.old < nI) {
                    i_skp = a_itm.slice(opts.items.visibleConf.old, nI);
                    if (sO.fx == 'directscroll') {
                        var orgW = opts.items[opts.d['width']];
                        hiddenitems = i_skp;
                        i_cur_l = i_old_l;
                        sc_hideHiddenItems(hiddenitems);
                        opts.items[opts.d['width']] = 'variable';
                    }
                }

                // save new sizes
                var $cf2 = false,
                    i_siz = ms_getTotalSize(a_itm.slice(0, nI), opts, 'width'),
                    w_siz = cf_mapWrapperSizes(ms_getSizes(i_new, opts, true), opts, !opts.usePadding),
                    i_siz_vis = 0,
                    a_cfs = {},
                    a_cfs_vis = {},
                    a_cur = {},
                    a_old = {},
                    a_lef = {},
                    a_dur = sc_getDuration(sO, opts, nI, i_siz);

                switch (sO.fx) {
                    case 'uncover':
                    case 'uncover-fade':
                        i_siz_vis = ms_getTotalSize(a_itm.slice(0, opts.items.visibleConf.old), opts, 'width');
                        break;
                }

                if (hiddenitems) {
                    opts.items[opts.d['width']] = orgW;
                }

                if (opts.align) {
                    if (opts.padding[opts.d[1]] < 0) {
                        opts.padding[opts.d[1]] = 0;
                    }
                }
                sz_resetMargin(a_itm, opts, true);
                sz_resetMargin(i_old_l, opts, opts.padding[opts.d[1]]);

                if (opts.align) {
                    opts.padding[opts.d[1]] = pR;
                    opts.padding[opts.d[3]] = pL;
                }

                a_lef[opts.d['left']] = (opts.usePadding) ? opts.padding[opts.d[3]] : 0;

                // scrolling functions
                var _s_wrapper = function() {},
                    _a_wrapper = function() {},
                    _s_paddingold = function() {},
                    _a_paddingold = function() {},
                    _s_paddingcur = function() {},
                    _a_paddingcur = function() {},
                    _onafter = function() {},
                    _moveitems = function() {},
                    _position = function() {};

                // clone carousel
                switch (sO.fx) {
                    case 'crossfade':
                    case 'cover':
                    case 'cover-fade':
                    case 'uncover':
                    case 'uncover-fade':
                        $cf2 = $cfs.clone(true).appendTo($wrp);
                        $cf2.children().slice(opts.items.visibleConf.old).remove();
                        break;
                }
                switch (sO.fx) {
                    case 'crossfade':
                    case 'cover':
                    case 'cover-fade':
                        $cfs.css('zIndex', 1);
                        $cf2.css('zIndex', 0);
                        break;
                }

                // reset all scrolls
                scrl = sc_setScroll(a_dur, sO.easing, conf);

                // animate / set carousel
                a_cfs[opts.d['left']] = -i_siz;
                a_cfs_vis[opts.d['left']] = -i_siz_vis;

                if (pL < 0) {
                    a_cfs[opts.d['left']] += pL;
                }

                // animate / set wrapper
                if (opts[opts.d['width']] == 'variable' || opts[opts.d['height']] == 'variable') {
                    _s_wrapper = function() {
                        $wrp.css(w_siz);
                    };
                    _a_wrapper = function() {
                        scrl.anims.push([$wrp, w_siz]);
                    };
                }

                // animate / set items
                if (opts.usePadding) {
                    var i_new_l_m = i_new_l.data('_cfs_origCssMargin');

                    if (pR >= 0) {
                        i_new_l_m += opts.padding[opts.d[1]];
                    }
                    i_new_l.css(opts.d['marginRight'], i_new_l_m);

                    if (i_cur_l.not(i_old_l).length) {
                        a_old[opts.d['marginRight']] = i_old_l.data('_cfs_origCssMargin');
                    }
                    _s_paddingold = function() {
                        i_old_l.css(a_old);
                    };
                    _a_paddingold = function() {
                        scrl.anims.push([i_old_l, a_old]);
                    };

                    var i_cur_l_m = i_cur_l.data('_cfs_origCssMargin');
                    if (pL > 0) {
                        i_cur_l_m += opts.padding[opts.d[3]];
                    }

                    a_cur[opts.d['marginRight']] = i_cur_l_m;

                    _s_paddingcur = function() {
                        i_cur_l.css(a_cur);
                    };
                    _a_paddingcur = function() {
                        scrl.anims.push([i_cur_l, a_cur]);
                    };
                }

                // set position
                _position = function() {
                    $cfs.css(a_lef);
                };


                var overFill = opts.items.visible + nI - itms.total;

                // rearrange items
                _moveitems = function() {
                    if (overFill > 0) {
                        $cfs.children().slice(itms.total).remove();
                    }
                    var l_itm = $cfs.children().slice(0, nI).appendTo($cfs).last();
                    if (overFill > 0) {
                        i_new = gi_getCurrentItems(a_itm, opts);
                    }
                    sc_showHiddenItems(hiddenitems);

                    if (opts.usePadding) {
                        if (itms.total < opts.items.visible + nI) {
                            var i_cur_l = $cfs.children().eq(opts.items.visible - 1);
                            i_cur_l.css(opts.d['marginRight'], i_cur_l.data('_cfs_origCssMargin') + opts.padding[opts.d[1]]);
                        }
                        l_itm.css(opts.d['marginRight'], l_itm.data('_cfs_origCssMargin'));
                    }
                };


                var cb_arguments = sc_mapCallbackArguments(i_old, i_skp, i_new, nI, 'next', a_dur, w_siz);

                // fire onAfter callbacks
                _onafter = function() {
                    $cfs.css('zIndex', $cfs.data('_cfs_origCssZindex'));
                    sc_afterScroll($cfs, $cf2, sO);
                    crsl.isScrolling = false;
                    clbk.onAfter = sc_fireCallbacks($tt0, sO, 'onAfter', cb_arguments, clbk);
                    queu = sc_fireQueue($cfs, queu, conf);

                    if (!crsl.isPaused) {
                        $cfs.trigger(cf_e('play', conf));
                    }
                };

                // fire onBefore callbacks
                crsl.isScrolling = true;
                tmrs = sc_clearTimers(tmrs);
                clbk.onBefore = sc_fireCallbacks($tt0, sO, 'onBefore', cb_arguments, clbk);

                switch (sO.fx) {
                    case 'none':
                        $cfs.css(a_cfs);
                        _s_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        _onafter();
                        break;

                    case 'fade':
                        scrl.anims.push([$cfs, {
                                'opacity': 0
                            },
                            function() {
                                _s_wrapper();
                                _s_paddingold();
                                _s_paddingcur();
                                _position();
                                _moveitems();
                                scrl = sc_setScroll(a_dur, sO.easing, conf);
                                scrl.anims.push([$cfs, {
                                        'opacity': 1
                                    },
                                    _onafter
                                ]);
                                sc_startScroll(scrl, conf);
                            }
                        ]);
                        break;

                    case 'crossfade':
                        $cfs.css({
                            'opacity': 0
                        });
                        scrl.anims.push([$cf2, {
                            'opacity': 0
                        }]);
                        scrl.anims.push([$cfs, {
                                'opacity': 1
                            },
                            _onafter
                        ]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    case 'cover':
                        $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
                        scrl.anims.push([$cfs, a_lef, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _moveitems();
                        break;

                    case 'cover-fade':
                        $cfs.css(opts.d['left'], $wrp[opts.d['width']]());
                        scrl.anims.push([$cf2, {
                            'opacity': 0
                        }]);
                        scrl.anims.push([$cfs, a_lef, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _moveitems();
                        break;

                    case 'uncover':
                        scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    case 'uncover-fade':
                        $cfs.css({
                            'opacity': 0
                        });
                        scrl.anims.push([$cfs, {
                            'opacity': 1
                        }]);
                        scrl.anims.push([$cf2, a_cfs_vis, _onafter]);
                        _a_wrapper();
                        _s_paddingold();
                        _s_paddingcur();
                        _position();
                        _moveitems();
                        break;

                    default:
                        scrl.anims.push([$cfs, a_cfs,
                            function() {
                                _position();
                                _moveitems();
                                _onafter();
                            }
                        ]);
                        _a_wrapper();
                        _a_paddingold();
                        _a_paddingcur();
                        break;
                }

                sc_startScroll(scrl, conf);
                cf_setCookie(opts.cookie, $cfs, conf);

                $cfs.trigger(cf_e('updatePageStatus', conf), [false, w_siz]);

                return true;
            });


            // slideTo event
            $cfs.bind(cf_e('slideTo', conf), function(e, num, dev, org, obj, dir, clb) {
                e.stopPropagation();

                var v = [num, dev, org, obj, dir, clb],
                    t = ['string/number/object', 'number', 'boolean', 'object', 'string', 'function'],
                    a = cf_sortParams(v, t);

                obj = a[3];
                dir = a[4];
                clb = a[5];

                num = gn_getItemIndex(a[0], a[1], a[2], itms, $cfs);

                if (num == 0) {
                    return false;
                }
                if (!is_object(obj)) {
                    obj = false;
                }

                if (dir != 'prev' && dir != 'next') {
                    if (opts.circular) {
                        dir = (num <= itms.total / 2) ? 'next' : 'prev';
                    } else {
                        dir = (itms.first == 0 || itms.first > num) ? 'next' : 'prev';
                    }
                }

                if (dir == 'prev') {
                    num = itms.total - num;
                }
                $cfs.trigger(cf_e(dir, conf), [obj, num, clb]);

                return true;
            });


            // prevPage event
            $cfs.bind(cf_e('prevPage', conf), function(e, obj, clb) {
                e.stopPropagation();
                var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
                return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur - 1, obj, 'prev', clb]);
            });


            // nextPage event
            $cfs.bind(cf_e('nextPage', conf), function(e, obj, clb) {
                e.stopPropagation();
                var cur = $cfs.triggerHandler(cf_e('currentPage', conf));
                return $cfs.triggerHandler(cf_e('slideToPage', conf), [cur + 1, obj, 'next', clb]);
            });


            // slideToPage event
            $cfs.bind(cf_e('slideToPage', conf), function(e, pag, obj, dir, clb) {
                e.stopPropagation();
                if (!is_number(pag)) {
                    pag = $cfs.triggerHandler(cf_e('currentPage', conf));
                }
                var ipp = opts.pagination.items || opts.items.visible,
                    max = Math.ceil(itms.total / ipp) - 1;

                if (pag < 0) {
                    pag = max;
                }
                if (pag > max) {
                    pag = 0;
                }
                return $cfs.triggerHandler(cf_e('slideTo', conf), [pag * ipp, 0, true, obj, dir, clb]);
            });

            // jumpToStart event
            $cfs.bind(cf_e('jumpToStart', conf), function(e, s) {
                e.stopPropagation();
                if (s) {
                    s = gn_getItemIndex(s, 0, true, itms, $cfs);
                } else {
                    s = 0;
                }

                s += itms.first;
                if (s != 0) {
                    if (itms.total > 0) {
                        while (s > itms.total) {
                            s -= itms.total;
                        }
                    }
                    $cfs.prepend($cfs.children().slice(s, itms.total));
                }
                return true;
            });


            // synchronise event
            $cfs.bind(cf_e('synchronise', conf), function(e, s) {
                e.stopPropagation();
                if (s) {
                    s = cf_getSynchArr(s);
                } else if (opts.synchronise) {
                    s = opts.synchronise;
                } else {
                    return debug(conf, 'No carousel to synchronise.');
                }

                var n = $cfs.triggerHandler(cf_e('currentPosition', conf)),
                    x = true;

                for (var j = 0, l = s.length; j < l; j++) {
                    if (!s[j][0].triggerHandler(cf_e('slideTo', conf), [n, s[j][3], true])) {
                        x = false;
                    }
                }
                return x;
            });


            // queue event
            $cfs.bind(cf_e('queue', conf), function(e, dir, opt) {
                e.stopPropagation();
                if (is_function(dir)) {
                    dir.call($tt0, queu);
                } else if (is_array(dir)) {
                    queu = dir;
                } else if (!is_undefined(dir)) {
                    queu.push([dir, opt]);
                }
                return queu;
            });


            // insertItem event
            $cfs.bind(cf_e('insertItem', conf), function(e, itm, num, org, dev) {
                e.stopPropagation();

                var v = [itm, num, org, dev],
                    t = ['string/object', 'string/number/object', 'boolean', 'number'],
                    a = cf_sortParams(v, t);

                itm = a[0];
                num = a[1];
                org = a[2];
                dev = a[3];

                if (is_object(itm) && !is_jquery(itm)) {
                    itm = $(itm);
                } else if (is_string(itm)) {
                    itm = $(itm);
                }
                if (!is_jquery(itm) || itm.length == 0) {
                    return debug(conf, 'Not a valid object.');
                }

                if (is_undefined(num)) {
                    num = 'end';
                }

                sz_storeMargin(itm, opts);
                sz_storeOrigCss(itm);

                var orgNum = num,
                    before = 'before';

                if (num == 'end') {
                    if (org) {
                        if (itms.first == 0) {
                            num = itms.total - 1;
                            before = 'after';
                        } else {
                            num = itms.first;
                            itms.first += itm.length;
                        }
                        if (num < 0) {
                            num = 0;
                        }
                    } else {
                        num = itms.total - 1;
                        before = 'after';
                    }
                } else {
                    num = gn_getItemIndex(num, dev, org, itms, $cfs);
                }

                var $cit = $cfs.children().eq(num);
                if ($cit.length) {
                    $cit[before](itm);
                } else {
                    debug(conf, 'Correct insert-position not found! Appending item to the end.');
                    $cfs.append(itm);
                }

                if (orgNum != 'end' && !org) {
                    if (num < itms.first) {
                        itms.first += itm.length;
                    }
                }
                itms.total = $cfs.children().length;
                if (itms.first >= itms.total) {
                    itms.first -= itms.total;
                }

                $cfs.trigger(cf_e('updateSizes', conf));
                $cfs.trigger(cf_e('linkAnchors', conf));

                return true;
            });


            // removeItem event
            $cfs.bind(cf_e('removeItem', conf), function(e, num, org, dev) {
                e.stopPropagation();

                var v = [num, org, dev],
                    t = ['string/number/object', 'boolean', 'number'],
                    a = cf_sortParams(v, t);

                num = a[0];
                org = a[1];
                dev = a[2];

                var removed = false;

                if (num instanceof $ && num.length > 1) {
                    $removed = $();
                    num.each(function(i, el) {
                        var $rem = $cfs.trigger(cf_e('removeItem', conf), [$(this), org, dev]);
                        if ($rem) {
                            $removed = $removed.add($rem);
                        }
                    });
                    return $removed;
                }

                if (is_undefined(num) || num == 'end') {
                    $removed = $cfs.children().last();
                } else {
                    num = gn_getItemIndex(num, dev, org, itms, $cfs);
                    var $removed = $cfs.children().eq(num);
                    if ($removed.length) {
                        if (num < itms.first) {
                            itms.first -= $removed.length;
                        }
                    }
                }
                if ($removed && $removed.length) {
                    $removed.detach();
                    itms.total = $cfs.children().length;
                    $cfs.trigger(cf_e('updateSizes', conf));
                }

                return $removed;
            });


            // onBefore and onAfter event
            $cfs.bind(cf_e('onBefore', conf) + ' ' + cf_e('onAfter', conf), function(e, fn) {
                e.stopPropagation();
                var eType = e.type.slice(conf.events.prefix.length);
                if (is_array(fn)) {
                    clbk[eType] = fn;
                }
                if (is_function(fn)) {
                    clbk[eType].push(fn);
                }
                return clbk[eType];
            });


            // currentPosition event
            $cfs.bind(cf_e('currentPosition', conf), function(e, fn) {
                e.stopPropagation();
                if (itms.first == 0) {
                    var val = 0;
                } else {
                    var val = itms.total - itms.first;
                }
                if (is_function(fn)) {
                    fn.call($tt0, val);
                }
                return val;
            });


            // currentPage event
            $cfs.bind(cf_e('currentPage', conf), function(e, fn) {
                e.stopPropagation();
                var ipp = opts.pagination.items || opts.items.visible,
                    max = Math.ceil(itms.total / ipp - 1),
                    nr;
                if (itms.first == 0) {
                    nr = 0;
                } else if (itms.first < itms.total % ipp) {
                    nr = 0;
                } else if (itms.first == ipp && !opts.circular) {
                    nr = max;
                } else {
                    nr = Math.round((itms.total - itms.first) / ipp);
                }
                if (nr < 0) {
                    nr = 0;
                }
                if (nr > max) {
                    nr = max;
                }
                if (is_function(fn)) {
                    fn.call($tt0, nr);
                }
                return nr;
            });


            // currentVisible event
            $cfs.bind(cf_e('currentVisible', conf), function(e, fn) {
                e.stopPropagation();
                var $i = gi_getCurrentItems($cfs.children(), opts);
                if (is_function(fn)) {
                    fn.call($tt0, $i);
                }
                return $i;
            });


            // slice event
            $cfs.bind(cf_e('slice', conf), function(e, f, l, fn) {
                e.stopPropagation();

                if (itms.total == 0) {
                    return false;
                }

                var v = [f, l, fn],
                    t = ['number', 'number', 'function'],
                    a = cf_sortParams(v, t);

                f = (is_number(a[0])) ? a[0] : 0;
                l = (is_number(a[1])) ? a[1] : itms.total;
                fn = a[2];

                f += itms.first;
                l += itms.first;

                if (items.total > 0) {
                    while (f > itms.total) {
                        f -= itms.total;
                    }
                    while (l > itms.total) {
                        l -= itms.total;
                    }
                    while (f < 0) {
                        f += itms.total;
                    }
                    while (l < 0) {
                        l += itms.total;
                    }
                }
                var $iA = $cfs.children(),
                    $i;

                if (l > f) {
                    $i = $iA.slice(f, l);
                } else {
                    $i = $($iA.slice(f, itms.total).get().concat($iA.slice(0, l).get()));
                }

                if (is_function(fn)) {
                    fn.call($tt0, $i);
                }
                return $i;
            });


            // isPaused, isStopped and isScrolling events
            $cfs.bind(cf_e('isPaused', conf) + ' ' + cf_e('isStopped', conf) + ' ' + cf_e('isScrolling', conf), function(e, fn) {
                e.stopPropagation();
                var eType = e.type.slice(conf.events.prefix.length),
                    value = crsl[eType];
                if (is_function(fn)) {
                    fn.call($tt0, value);
                }
                return value;
            });


            // configuration event
            $cfs.bind(cf_e('configuration', conf), function(e, a, b, c) {
                e.stopPropagation();
                var reInit = false;

                // return entire configuration-object
                if (is_function(a)) {
                    a.call($tt0, opts);
                }
                // set multiple options via object
                else if (is_object(a)) {
                    opts_orig = $.extend(true, {}, opts_orig, a);
                    if (b !== false) reInit = true;
                    else opts = $.extend(true, {}, opts, a);

                } else if (!is_undefined(a)) {

                    // callback function for specific option
                    if (is_function(b)) {
                        var val = eval('opts.' + a);
                        if (is_undefined(val)) {
                            val = '';
                        }
                        b.call($tt0, val);
                    }
                    // set individual option
                    else if (!is_undefined(b)) {
                        if (typeof c !== 'boolean') c = true;
                        eval('opts_orig.' + a + ' = b');
                        if (c !== false) reInit = true;
                        else eval('opts.' + a + ' = b');
                    }
                    // return value for specific option
                    else {
                        return eval('opts.' + a);
                    }
                }
                if (reInit) {
                    sz_resetMargin($cfs.children(), opts);
                    FN._init(opts_orig);
                    FN._bind_buttons();
                    var sz = sz_setSizes($cfs, opts);
                    $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
                }
                return opts;
            });


            // linkAnchors event
            $cfs.bind(cf_e('linkAnchors', conf), function(e, $con, sel) {
                e.stopPropagation();

                if (is_undefined($con)) {
                    $con = $('body');
                } else if (is_string($con)) {
                    $con = $($con);
                }
                if (!is_jquery($con) || $con.length == 0) {
                    return debug(conf, 'Not a valid object.');
                }
                if (!is_string(sel)) {
                    sel = 'a.caroufredsel';
                }

                $con.find(sel).each(function() {
                    var h = this.hash || '';
                    if (h.length > 0 && $cfs.children().index($(h)) != -1) {
                        $(this).unbind('click').click(function(e) {
                            e.preventDefault();
                            $cfs.trigger(cf_e('slideTo', conf), h);
                        });
                    }
                });
                return true;
            });


            // updatePageStatus event
            $cfs.bind(cf_e('updatePageStatus', conf), function(e, build, sizes) {
                e.stopPropagation();
                if (!opts.pagination.container) {
                    return;
                }

                var ipp = opts.pagination.items || opts.items.visible,
                    pgs = Math.ceil(itms.total / ipp);

                if (build) {
                    if (opts.pagination.anchorBuilder) {
                        opts.pagination.container.children().remove();
                        opts.pagination.container.each(function() {
                            for (var a = 0; a < pgs; a++) {
                                var i = $cfs.children().eq(gn_getItemIndex(a * ipp, 0, true, itms, $cfs));
                                $(this).append(opts.pagination.anchorBuilder.call(i[0], a + 1));
                            }
                        });
                    }
                    opts.pagination.container.each(function() {
                        $(this).children().unbind(opts.pagination.event).each(function(a) {
                            $(this).bind(opts.pagination.event, function(e) {
                                e.preventDefault();
                                $cfs.trigger(cf_e('slideTo', conf), [a * ipp, -opts.pagination.deviation, true, opts.pagination]);
                            });
                        });
                    });
                }

                var selected = $cfs.triggerHandler(cf_e('currentPage', conf)) + opts.pagination.deviation;
                if (selected >= pgs) {
                    selected = 0;
                }
                if (selected < 0) {
                    selected = pgs - 1;
                }
                opts.pagination.container.each(function() {
                    $(this).children().removeClass(cf_c('selected', conf)).eq(selected).addClass(cf_c('selected', conf));
                });
                return true;
            });


            // updateSizes event
            $cfs.bind(cf_e('updateSizes', conf), function(e) {
                var vI = opts.items.visible,
                    a_itm = $cfs.children(),
                    avail_primary = ms_getParentSize($wrp, opts, 'width');

                itms.total = a_itm.length;

                if (crsl.primarySizePercentage) {
                    opts.maxDimension = avail_primary;
                    opts[opts.d['width']] = ms_getPercentage(avail_primary, crsl.primarySizePercentage);
                } else {
                    opts.maxDimension = ms_getMaxDimension(opts, avail_primary);
                }

                if (opts.responsive) {
                    opts.items.width = opts.items.sizesConf.width;
                    opts.items.height = opts.items.sizesConf.height;
                    opts = in_getResponsiveValues(opts, a_itm, avail_primary);
                    vI = opts.items.visible;
                    sz_setResponsiveSizes(opts, a_itm);
                } else if (opts.items.visibleConf.variable) {
                    vI = gn_getVisibleItemsNext(a_itm, opts, 0);
                } else if (opts.items.filter != '*') {
                    vI = gn_getVisibleItemsNextFilter(a_itm, opts, 0);
                }

                if (!opts.circular && itms.first != 0 && vI > itms.first) {
                    if (opts.items.visibleConf.variable) {
                        var nI = gn_getVisibleItemsPrev(a_itm, opts, itms.first) - itms.first;
                    } else if (opts.items.filter != '*') {
                        var nI = gn_getVisibleItemsPrevFilter(a_itm, opts, itms.first) - itms.first;
                    } else {
                        var nI = opts.items.visible - itms.first;
                    }
                    debug(conf, 'Preventing non-circular: sliding ' + nI + ' items backward.');
                    $cfs.trigger(cf_e('prev', conf), nI);
                }

                opts.items.visible = cf_getItemsAdjust(vI, opts, opts.items.visibleConf.adjust, $tt0);
                opts.items.visibleConf.old = opts.items.visible;
                opts = in_getAlignPadding(opts, a_itm);

                var sz = sz_setSizes($cfs, opts);
                $cfs.trigger(cf_e('updatePageStatus', conf), [true, sz]);
                nv_showNavi(opts, itms.total, conf);
                nv_enableNavi(opts, itms.first, conf);

                return sz;
            });


            // destroy event
            $cfs.bind(cf_e('destroy', conf), function(e, orgOrder) {
                e.stopPropagation();
                tmrs = sc_clearTimers(tmrs);

                $cfs.data('_cfs_isCarousel', false);
                $cfs.trigger(cf_e('finish', conf));
                if (orgOrder) {
                    $cfs.trigger(cf_e('jumpToStart', conf));
                }
                sz_restoreOrigCss($cfs.children());
                sz_restoreOrigCss($cfs);
                FN._unbind_events();
                FN._unbind_buttons();
                if (conf.wrapper == 'parent') {
                    sz_restoreOrigCss($wrp);
                } else {
                    $wrp.replaceWith($cfs);
                }

                return true;
            });


            // debug event
            $cfs.bind(cf_e('debug', conf), function(e) {
                debug(conf, 'Carousel width: ' + opts.width);
                debug(conf, 'Carousel height: ' + opts.height);
                debug(conf, 'Item widths: ' + opts.items.width);
                debug(conf, 'Item heights: ' + opts.items.height);
                debug(conf, 'Number of items visible: ' + opts.items.visible);
                if (opts.auto.play) {
                    debug(conf, 'Number of items scrolled automatically: ' + opts.auto.items);
                }
                if (opts.prev.button) {
                    debug(conf, 'Number of items scrolled backward: ' + opts.prev.items);
                }
                if (opts.next.button) {
                    debug(conf, 'Number of items scrolled forward: ' + opts.next.items);
                }
                return conf.debug;
            });


            // triggerEvent, making prefixed and namespaced events accessible from outside
            $cfs.bind('_cfs_triggerEvent', function(e, n, o) {
                e.stopPropagation();
                return $cfs.triggerHandler(cf_e(n, conf), o);
            });
        }; // /bind_events


        FN._unbind_events = function() {
            $cfs.unbind(cf_e('', conf));
            $cfs.unbind(cf_e('', conf, false));
            $cfs.unbind('_cfs_triggerEvent');
        }; // /unbind_events


        FN._bind_buttons = function() {
            FN._unbind_buttons();
            nv_showNavi(opts, itms.total, conf);
            nv_enableNavi(opts, itms.first, conf);

            if (opts.auto.pauseOnHover) {
                var pC = bt_pauseOnHoverConfig(opts.auto.pauseOnHover);
                $wrp.bind(cf_e('mouseenter', conf, false), function() {
                    $cfs.trigger(cf_e('pause', conf), pC);
                })
                    .bind(cf_e('mouseleave', conf, false), function() {
                        $cfs.trigger(cf_e('resume', conf));
                    });
            }

            // play button
            if (opts.auto.button) {
                opts.auto.button.bind(cf_e(opts.auto.event, conf, false), function(e) {
                    e.preventDefault();
                    var ev = false,
                        pC = null;

                    if (crsl.isPaused) {
                        ev = 'play';
                    } else if (opts.auto.pauseOnEvent) {
                        ev = 'pause';
                        pC = bt_pauseOnHoverConfig(opts.auto.pauseOnEvent);
                    }
                    if (ev) {
                        $cfs.trigger(cf_e(ev, conf), pC);
                    }
                });
            }

            // prev button
            if (opts.prev.button) {
                opts.prev.button.bind(cf_e(opts.prev.event, conf, false), function(e) {
                    e.preventDefault();
                    $cfs.trigger(cf_e('prev', conf));
                });
                if (opts.prev.pauseOnHover) {
                    var pC = bt_pauseOnHoverConfig(opts.prev.pauseOnHover);
                    opts.prev.button.bind(cf_e('mouseenter', conf, false), function() {
                        $cfs.trigger(cf_e('pause', conf), pC);
                    })
                        .bind(cf_e('mouseleave', conf, false), function() {
                            $cfs.trigger(cf_e('resume', conf));
                        });
                }
            }

            // next butotn
            if (opts.next.button) {
                opts.next.button.bind(cf_e(opts.next.event, conf, false), function(e) {
                    e.preventDefault();
                    $cfs.trigger(cf_e('next', conf));
                });
                if (opts.next.pauseOnHover) {
                    var pC = bt_pauseOnHoverConfig(opts.next.pauseOnHover);
                    opts.next.button.bind(cf_e('mouseenter', conf, false), function() {
                        $cfs.trigger(cf_e('pause', conf), pC);
                    })
                        .bind(cf_e('mouseleave', conf, false), function() {
                            $cfs.trigger(cf_e('resume', conf));
                        });
                }
            }

            // pagination
            if (opts.pagination.container) {
                if (opts.pagination.pauseOnHover) {
                    var pC = bt_pauseOnHoverConfig(opts.pagination.pauseOnHover);
                    opts.pagination.container.bind(cf_e('mouseenter', conf, false), function() {
                        $cfs.trigger(cf_e('pause', conf), pC);
                    })
                        .bind(cf_e('mouseleave', conf, false), function() {
                            $cfs.trigger(cf_e('resume', conf));
                        });
                }
            }

            // prev/next keys
            if (opts.prev.key || opts.next.key) {
                $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
                    var k = e.keyCode;
                    if (k == opts.next.key) {
                        e.preventDefault();
                        $cfs.trigger(cf_e('next', conf));
                    }
                    if (k == opts.prev.key) {
                        e.preventDefault();
                        $cfs.trigger(cf_e('prev', conf));
                    }
                });
            }

            // pagination keys
            if (opts.pagination.keys) {
                $(document).bind(cf_e('keyup', conf, false, true, true), function(e) {
                    var k = e.keyCode;
                    if (k >= 49 && k < 58) {
                        k = (k - 49) * opts.items.visible;
                        if (k <= itms.total) {
                            e.preventDefault();
                            $cfs.trigger(cf_e('slideTo', conf), [k, 0, true, opts.pagination]);
                        }
                    }
                });
            }

            // swipe
            if ($.fn.swipe) {
                var isTouch = 'ontouchstart' in window;
                if ((isTouch && opts.swipe.onTouch) || (!isTouch && opts.swipe.onMouse)) {
                    var scP = $.extend(true, {}, opts.prev, opts.swipe),
                        scN = $.extend(true, {}, opts.next, opts.swipe),
                        swP = function() {
                            $cfs.trigger(cf_e('prev', conf), [scP])
                        },
                        swN = function() {
                            $cfs.trigger(cf_e('next', conf), [scN])
                        };

                    switch (opts.direction) {
                        case 'up':
                        case 'down':
                            opts.swipe.options.swipeUp = swN;
                            opts.swipe.options.swipeDown = swP;
                            break;
                        default:
                            opts.swipe.options.swipeLeft = swN;
                            opts.swipe.options.swipeRight = swP;
                    }
                    if (crsl.swipe) {
                        $cfs.swipe('destroy');
                    }
                    $wrp.swipe(opts.swipe.options);
                    $wrp.css('cursor', 'move');
                    crsl.swipe = true;
                }
            }

            // mousewheel
            if ($.fn.mousewheel) {

                if (opts.mousewheel) {
                    var mcP = $.extend(true, {}, opts.prev, opts.mousewheel),
                        mcN = $.extend(true, {}, opts.next, opts.mousewheel);

                    if (crsl.mousewheel) {
                        $wrp.unbind(cf_e('mousewheel', conf, false));
                    }
                    $wrp.bind(cf_e('mousewheel', conf, false), function(e, delta) {
                        e.preventDefault();
                        if (delta > 0) {
                            $cfs.trigger(cf_e('prev', conf), [mcP]);
                        } else {
                            $cfs.trigger(cf_e('next', conf), [mcN]);
                        }
                    });
                    crsl.mousewheel = true;
                }
            }

            if (opts.auto.play) {
                $cfs.trigger(cf_e('play', conf), opts.auto.delay);
            }

            if (crsl.upDateOnWindowResize) {
                var resizeFn = function(e) {
                    $cfs.trigger(cf_e('finish', conf));
                    if (opts.auto.pauseOnResize && !crsl.isPaused) {
                        $cfs.trigger(cf_e('play', conf));
                    }
                    sz_resetMargin($cfs.children(), opts);
                    $cfs.trigger(cf_e('updateSizes', conf));
                };

                var $w = $(window),
                    onResize = null;

                if ($.debounce && conf.onWindowResize == 'debounce') {
                    onResize = $.debounce(200, resizeFn);
                } else if ($.throttle && conf.onWindowResize == 'throttle') {
                    onResize = $.throttle(300, resizeFn);
                } else {
                    var _windowWidth = 0,
                        _windowHeight = 0;

                    onResize = function() {
                        var nw = $w.width(),
                            nh = $w.height();

                        if (nw != _windowWidth || nh != _windowHeight) {
                            resizeFn();
                            _windowWidth = nw;
                            _windowHeight = nh;
                        }
                    };
                }
                $w.bind(cf_e('resize', conf, false, true, true), onResize);
            }
        }; // /bind_buttons


        FN._unbind_buttons = function() {
            var ns1 = cf_e('', conf),
                ns2 = cf_e('', conf, false);
            ns3 = cf_e('', conf, false, true, true);

            $(document).unbind(ns3);
            $(window).unbind(ns3);
            $wrp.unbind(ns2);

            if (opts.auto.button) {
                opts.auto.button.unbind(ns2);
            }
            if (opts.prev.button) {
                opts.prev.button.unbind(ns2);
            }
            if (opts.next.button) {
                opts.next.button.unbind(ns2);
            }
            if (opts.pagination.container) {
                opts.pagination.container.unbind(ns2);
                if (opts.pagination.anchorBuilder) {
                    opts.pagination.container.children().remove();
                }
            }
            if (crsl.swipe) {
                $cfs.swipe('destroy');
                $wrp.css('cursor', 'default');
                crsl.swipe = false;
            }
            if (crsl.mousewheel) {
                crsl.mousewheel = false;
            }

            nv_showNavi(opts, 'hide', conf);
            nv_enableNavi(opts, 'removeClass', conf);

        }; // /unbind_buttons



        // START

        if (is_boolean(configs)) {
            configs = {
                'debug': configs
            };
        }

        // set vars
        var crsl = {
            'direction': 'next',
            'isPaused': true,
            'isScrolling': false,
            'isStopped': false,
            'mousewheel': false,
            'swipe': false
        },
            itms = {
                'total': $cfs.children().length,
                'first': 0
            },
            tmrs = {
                'auto': null,
                'progress': null,
                'startTime': getTime(),
                'timePassed': 0
            },
            scrl = {
                'isStopped': false,
                'duration': 0,
                'startTime': 0,
                'easing': '',
                'anims': []
            },
            clbk = {
                'onBefore': [],
                'onAfter': []
            },
            queu = [],
            conf = $.extend(true, {}, $.fn.carouFredSel.configs, configs),
            opts = {},
            opts_orig = $.extend(true, {}, options),
            $wrp = (conf.wrapper == 'parent') ? $cfs.parent() : $cfs.wrap('<' + conf.wrapper.element + ' class="' + conf.wrapper.classname + '" />').parent();


        conf.selector = $cfs.selector;
        conf.serialNumber = $.fn.carouFredSel.serialNumber++;

        conf.transition = (conf.transition && $.fn.transition) ? 'transition' : 'animate';

        // create carousel
        FN._init(opts_orig, true, starting_position);
        FN._build();
        FN._bind_events();
        FN._bind_buttons();

        // find item to start
        if (is_array(opts.items.start)) {
            var start_arr = opts.items.start;
        } else {
            var start_arr = [];
            if (opts.items.start != 0) {
                start_arr.push(opts.items.start);
            }
        }
        if (opts.cookie) {
            start_arr.unshift(parseInt(cf_getCookie(opts.cookie), 10));
        }

        if (start_arr.length > 0) {
            for (var a = 0, l = start_arr.length; a < l; a++) {
                var s = start_arr[a];
                if (s == 0) {
                    continue;
                }
                if (s === true) {
                    s = window.location.hash;
                    if (s.length < 1) {
                        continue;
                    }
                } else if (s === 'random') {
                    s = Math.floor(Math.random() * itms.total);
                }
                if ($cfs.triggerHandler(cf_e('slideTo', conf), [s, 0, true, {
                    fx: 'none'
                }])) {
                    break;
                }
            }
        }
        var siz = sz_setSizes($cfs, opts),
            itm = gi_getCurrentItems($cfs.children(), opts);

        if (opts.onCreate) {
            opts.onCreate.call($tt0, {
                'width': siz.width,
                'height': siz.height,
                'items': itm
            });
        }

        $cfs.trigger(cf_e('updatePageStatus', conf), [true, siz]);
        $cfs.trigger(cf_e('linkAnchors', conf));

        if (conf.debug) {
            $cfs.trigger(cf_e('debug', conf));
        }

        return $cfs;
    };



    // GLOBAL PUBLIC

    $.fn.carouFredSel.serialNumber = 1;
    $.fn.carouFredSel.defaults = {
        'synchronise': false,
        'infinite': true,
        'circular': true,
        'responsive': false,
        'direction': 'left',
        'items': {
            'start': 0
        },
        'scroll': {
            'easing': 'swing',
            'duration': 500,
            'pauseOnHover': false,
            'event': 'click',
            'queue': false
        }
    };
    $.fn.carouFredSel.configs = {
        'debug': false,
        'transition': false,
        'onWindowResize': 'throttle',
        'events': {
            'prefix': '',
            'namespace': 'cfs'
        },
        'wrapper': {
            'element': 'div',
            'classname': 'caroufredsel_wrapper'
        },
        'classnames': {}
    };
    $.fn.carouFredSel.pageAnchorBuilder = function(nr) {
        return '<a href="#"><span>' + nr + '</span></a>';
    };
    $.fn.carouFredSel.progressbarUpdater = function(perc) {
        $(this).css('width', perc + '%');
    };

    $.fn.carouFredSel.cookie = {
        get: function(n) {
            n += '=';
            var ca = document.cookie.split(';');
            for (var a = 0, l = ca.length; a < l; a++) {
                var c = ca[a];
                while (c.charAt(0) == ' ') {
                    c = c.slice(1);
                }
                if (c.indexOf(n) == 0) {
                    return c.slice(n.length);
                }
            }
            return 0;
        },
        set: function(n, v, d) {
            var e = "";
            if (d) {
                var date = new Date();
                date.setTime(date.getTime() + (d * 24 * 60 * 60 * 1000));
                e = "; expires=" + date.toGMTString();
            }
            document.cookie = n + '=' + v + e + '; path=/';
        },
        remove: function(n) {
            $.fn.carouFredSel.cookie.set(n, "", -1);
        }
    };


    // GLOBAL PRIVATE

    // scrolling functions

    function sc_setScroll(d, e, c) {
        if (c.transition == 'transition') {
            if (e == 'swing') {
                e = 'ease';
            }
        }
        return {
            anims: [],
            duration: d,
            orgDuration: d,
            easing: e,
            startTime: getTime()
        };
    }

    function sc_startScroll(s, c) {
        for (var a = 0, l = s.anims.length; a < l; a++) {
            var b = s.anims[a];
            if (!b) {
                continue;
            }
            b[0][c.transition](b[1], s.duration, s.easing, b[2]);
        }
    }

    function sc_stopScroll(s, finish) {
        if (!is_boolean(finish)) {
            finish = true;
        }
        if (is_object(s.pre)) {
            sc_stopScroll(s.pre, finish);
        }
        for (var a = 0, l = s.anims.length; a < l; a++) {
            var b = s.anims[a];
            b[0].stop(true);
            if (finish) {
                b[0].css(b[1]);
                if (is_function(b[2])) {
                    b[2]();
                }
            }
        }
        if (is_object(s.post)) {
            sc_stopScroll(s.post, finish);
        }
    }

    function sc_afterScroll($c, $c2, o) {
        if ($c2) {
            $c2.remove();
        }

        switch (o.fx) {
            case 'fade':
            case 'crossfade':
            case 'cover-fade':
            case 'uncover-fade':
                $c.css('opacity', 1);
                $c.css('filter', '');
                break;
        }
    }

    function sc_fireCallbacks($t, o, b, a, c) {
        if (o[b]) {
            o[b].call($t, a);
        }
        if (c[b].length) {
            for (var i = 0, l = c[b].length; i < l; i++) {
                c[b][i].call($t, a);
            }
        }
        return [];
    }

    function sc_fireQueue($c, q, c) {

        if (q.length) {
            $c.trigger(cf_e(q[0][0], c), q[0][1]);
            q.shift();
        }
        return q;
    }

    function sc_hideHiddenItems(hiddenitems) {
        hiddenitems.each(function() {
            var hi = $(this);
            hi.data('_cfs_isHidden', hi.is(':hidden')).hide();
        });
    }

    function sc_showHiddenItems(hiddenitems) {
        if (hiddenitems) {
            hiddenitems.each(function() {
                var hi = $(this);
                if (!hi.data('_cfs_isHidden')) {
                    hi.show();
                }
            });
        }
    }

    function sc_clearTimers(t) {
        if (t.auto) {
            clearTimeout(t.auto);
        }
        if (t.progress) {
            clearInterval(t.progress);
        }
        return t;
    }

    function sc_mapCallbackArguments(i_old, i_skp, i_new, s_itm, s_dir, s_dur, w_siz) {
        return {
            'width': w_siz.width,
            'height': w_siz.height,
            'items': {
                'old': i_old,
                'skipped': i_skp,
                'visible': i_new
            },
            'scroll': {
                'items': s_itm,
                'direction': s_dir,
                'duration': s_dur
            }
        };
    }

    function sc_getDuration(sO, o, nI, siz) {
        var dur = sO.duration;
        if (sO.fx == 'none') {
            return 0;
        }
        if (dur == 'auto') {
            dur = o.scroll.duration / o.scroll.items * nI;
        } else if (dur < 10) {
            dur = siz / dur;
        }
        if (dur < 1) {
            return 0;
        }
        if (sO.fx == 'fade') {
            dur = dur / 2;
        }
        return Math.round(dur);
    }

    // navigation functions

    function nv_showNavi(o, t, c) {
        var minimum = (is_number(o.items.minimum)) ? o.items.minimum : o.items.visible + 1;
        if (t == 'show' || t == 'hide') {
            var f = t;
        } else if (minimum > t) {
            debug(c, 'Not enough items (' + t + ' total, ' + minimum + ' needed): Hiding navigation.');
            var f = 'hide';
        } else {
            var f = 'show';
        }
        var s = (f == 'show') ? 'removeClass' : 'addClass',
            h = cf_c('hidden', c);

        if (o.auto.button) {
            o.auto.button[f]()[s](h);
        }
        if (o.prev.button) {
            o.prev.button[f]()[s](h);
        }
        if (o.next.button) {
            o.next.button[f]()[s](h);
        }
        if (o.pagination.container) {
            o.pagination.container[f]()[s](h);
        }
    }

    function nv_enableNavi(o, f, c) {
        if (o.circular || o.infinite) return;
        var fx = (f == 'removeClass' || f == 'addClass') ? f : false,
            di = cf_c('disabled', c);

        if (o.auto.button && fx) {
            o.auto.button[fx](di);
        }
        if (o.prev.button) {
            var fn = fx || (f == 0) ? 'addClass' : 'removeClass';
            o.prev.button[fn](di);
        }
        if (o.next.button) {
            var fn = fx || (f == o.items.visible) ? 'addClass' : 'removeClass';
            o.next.button[fn](di);
        }
    }

    // get object functions

    function go_getObject($tt, obj) {
        if (is_function(obj)) {
            obj = obj.call($tt);
        } else if (is_undefined(obj)) {
            obj = {};
        }
        return obj;
    }

    function go_getItemsObject($tt, obj) {
        obj = go_getObject($tt, obj);
        if (is_number(obj)) {
            obj = {
                'visible': obj
            };
        } else if (obj == 'variable') {
            obj = {
                'visible': obj,
                'width': obj,
                'height': obj
            };
        } else if (!is_object(obj)) {
            obj = {};
        }
        return obj;
    }

    function go_getScrollObject($tt, obj) {
        obj = go_getObject($tt, obj);
        if (is_number(obj)) {
            if (obj <= 50) {
                obj = {
                    'items': obj
                };
            } else {
                obj = {
                    'duration': obj
                };
            }
        } else if (is_string(obj)) {
            obj = {
                'easing': obj
            };
        } else if (!is_object(obj)) {
            obj = {};
        }
        return obj;
    }

    function go_getNaviObject($tt, obj) {
        obj = go_getObject($tt, obj);
        if (is_string(obj)) {
            var temp = cf_getKeyCode(obj);
            if (temp == -1) {
                obj = $(obj);
            } else {
                obj = temp;
            }
        }
        return obj;
    }

    function go_getAutoObject($tt, obj) {
        obj = go_getNaviObject($tt, obj);
        if (is_jquery(obj)) {
            obj = {
                'button': obj
            };
        } else if (is_boolean(obj)) {
            obj = {
                'play': obj
            };
        } else if (is_number(obj)) {
            obj = {
                'timeoutDuration': obj
            };
        }
        if (obj.progress) {
            if (is_string(obj.progress) || is_jquery(obj.progress)) {
                obj.progress = {
                    'bar': obj.progress
                };
            }
        }
        return obj;
    }

    function go_complementAutoObject($tt, obj) {
        if (is_function(obj.button)) {
            obj.button = obj.button.call($tt);
        }
        if (is_string(obj.button)) {
            obj.button = $(obj.button);
        }
        if (!is_boolean(obj.play)) {
            obj.play = true;
        }
        if (!is_number(obj.delay)) {
            obj.delay = 0;
        }
        if (is_undefined(obj.pauseOnEvent)) {
            obj.pauseOnEvent = true;
        }
        if (!is_boolean(obj.pauseOnResize)) {
            obj.pauseOnResize = true;
        }
        if (!is_number(obj.timeoutDuration)) {
            obj.timeoutDuration = (obj.duration < 10) ? 2500 : obj.duration * 5;
        }
        if (obj.progress) {
            if (is_function(obj.progress.bar)) {
                obj.progress.bar = obj.progress.bar.call($tt);
            }
            if (is_string(obj.progress.bar)) {
                obj.progress.bar = $(obj.progress.bar);
            }
            if (obj.progress.bar) {
                if (!is_function(obj.progress.updater)) {
                    obj.progress.updater = $.fn.carouFredSel.progressbarUpdater;
                }
                if (!is_number(obj.progress.interval)) {
                    obj.progress.interval = 50;
                }
            } else {
                obj.progress = false;
            }
        }
        return obj;
    }

    function go_getPrevNextObject($tt, obj) {
        obj = go_getNaviObject($tt, obj);
        if (is_jquery(obj)) {
            obj = {
                'button': obj
            };
        } else if (is_number(obj)) {
            obj = {
                'key': obj
            };
        }
        return obj;
    }

    function go_complementPrevNextObject($tt, obj) {
        if (is_function(obj.button)) {
            obj.button = obj.button.call($tt);
        }
        if (is_string(obj.button)) {
            obj.button = $(obj.button);
        }
        if (is_string(obj.key)) {
            obj.key = cf_getKeyCode(obj.key);
        }
        return obj;
    }

    function go_getPaginationObject($tt, obj) {
        obj = go_getNaviObject($tt, obj);
        if (is_jquery(obj)) {
            obj = {
                'container': obj
            };
        } else if (is_boolean(obj)) {
            obj = {
                'keys': obj
            };
        }
        return obj;
    }

    function go_complementPaginationObject($tt, obj) {
        if (is_function(obj.container)) {
            obj.container = obj.container.call($tt);
        }
        if (is_string(obj.container)) {
            obj.container = $(obj.container);
        }
        if (!is_number(obj.items)) {
            obj.items = false;
        }
        if (!is_boolean(obj.keys)) {
            obj.keys = false;
        }
        if (!is_function(obj.anchorBuilder) && !is_false(obj.anchorBuilder)) {
            obj.anchorBuilder = $.fn.carouFredSel.pageAnchorBuilder;
        }
        if (!is_number(obj.deviation)) {
            obj.deviation = 0;
        }
        return obj;
    }

    function go_getSwipeObject($tt, obj) {
        if (is_function(obj)) {
            obj = obj.call($tt);
        }
        if (is_undefined(obj)) {
            obj = {
                'onTouch': false
            };
        }
        if (is_true(obj)) {
            obj = {
                'onTouch': obj
            };
        } else if (is_number(obj)) {
            obj = {
                'items': obj
            };
        }
        return obj;
    }

    function go_complementSwipeObject($tt, obj) {
        if (!is_boolean(obj.onTouch)) {
            obj.onTouch = true;
        }
        if (!is_boolean(obj.onMouse)) {
            obj.onMouse = false;
        }
        if (!is_object(obj.options)) {
            obj.options = {};
        }
        if (!is_boolean(obj.options.triggerOnTouchEnd)) {
            obj.options.triggerOnTouchEnd = false;
        }
        return obj;
    }

    function go_getMousewheelObject($tt, obj) {
        if (is_function(obj)) {
            obj = obj.call($tt);
        }
        if (is_true(obj)) {
            obj = {};
        } else if (is_number(obj)) {
            obj = {
                'items': obj
            };
        } else if (is_undefined(obj)) {
            obj = false;
        }
        return obj;
    }

    function go_complementMousewheelObject($tt, obj) {
        return obj;
    }

    // get number functions

    function gn_getItemIndex(num, dev, org, items, $cfs) {
        if (is_string(num)) {
            num = $(num, $cfs);
        }

        if (is_object(num)) {
            num = $(num, $cfs);
        }
        if (is_jquery(num)) {
            num = $cfs.children().index(num);
            if (!is_boolean(org)) {
                org = false;
            }
        } else {
            if (!is_boolean(org)) {
                org = true;
            }
        }
        if (!is_number(num)) {
            num = 0;
        }
        if (!is_number(dev)) {
            dev = 0;
        }

        if (org) {
            num += items.first;
        }
        num += dev;
        if (items.total > 0) {
            while (num >= items.total) {
                num -= items.total;
            }
            while (num < 0) {
                num += items.total;
            }
        }
        return num;
    }

    // items prev

    function gn_getVisibleItemsPrev(i, o, s) {
        var t = 0,
            x = 0;

        for (var a = s; a >= 0; a--) {
            var j = i.eq(a);
            t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
            if (t > o.maxDimension) {
                return x;
            }
            if (a == 0) {
                a = i.length;
            }
            x++;
        }
    }

    function gn_getVisibleItemsPrevFilter(i, o, s) {
        return gn_getItemsPrevFilter(i, o.items.filter, o.items.visibleConf.org, s);
    }

    function gn_getScrollItemsPrevFilter(i, o, s, m) {
        return gn_getItemsPrevFilter(i, o.items.filter, m, s);
    }

    function gn_getItemsPrevFilter(i, f, m, s) {
        var t = 0,
            x = 0;

        for (var a = s, l = i.length; a >= 0; a--) {
            x++;
            if (x == l) {
                return x;
            }

            var j = i.eq(a);
            if (j.is(f)) {
                t++;
                if (t == m) {
                    return x;
                }
            }
            if (a == 0) {
                a = l;
            }
        }
    }

    function gn_getVisibleOrg($c, o) {
        return o.items.visibleConf.org || $c.children().slice(0, o.items.visible).filter(o.items.filter).length;
    }

    // items next

    function gn_getVisibleItemsNext(i, o, s) {
        var t = 0,
            x = 0;

        for (var a = s, l = i.length - 1; a <= l; a++) {
            var j = i.eq(a);

            t += (j.is(':visible')) ? j[o.d['outerWidth']](true) : 0;
            if (t > o.maxDimension) {
                return x;
            }

            x++;
            if (x == l + 1) {
                return x;
            }
            if (a == l) {
                a = -1;
            }
        }
    }

    function gn_getVisibleItemsNextTestCircular(i, o, s, l) {
        var v = gn_getVisibleItemsNext(i, o, s);
        if (!o.circular) {
            if (s + v > l) {
                v = l - s;
            }
        }
        return v;
    }

    function gn_getVisibleItemsNextFilter(i, o, s) {
        return gn_getItemsNextFilter(i, o.items.filter, o.items.visibleConf.org, s, o.circular);
    }

    function gn_getScrollItemsNextFilter(i, o, s, m) {
        return gn_getItemsNextFilter(i, o.items.filter, m + 1, s, o.circular) - 1;
    }

    function gn_getItemsNextFilter(i, f, m, s, c) {
        var t = 0,
            x = 0;

        for (var a = s, l = i.length - 1; a <= l; a++) {
            x++;
            if (x >= l) {
                return x;
            }

            var j = i.eq(a);
            if (j.is(f)) {
                t++;
                if (t == m) {
                    return x;
                }
            }
            if (a == l) {
                a = -1;
            }
        }
    }

    // get items functions

    function gi_getCurrentItems(i, o) {
        return i.slice(0, o.items.visible);
    }

    function gi_getOldItemsPrev(i, o, n) {
        return i.slice(n, o.items.visibleConf.old + n);
    }

    function gi_getNewItemsPrev(i, o) {
        return i.slice(0, o.items.visible);
    }

    function gi_getOldItemsNext(i, o) {
        return i.slice(0, o.items.visibleConf.old);
    }

    function gi_getNewItemsNext(i, o, n) {
        return i.slice(n, o.items.visible + n);
    }

    // sizes functions

    function sz_storeMargin(i, o, d) {
        if (o.usePadding) {
            if (!is_string(d)) {
                d = '_cfs_origCssMargin';
            }
            i.each(function() {
                var j = $(this),
                    m = parseInt(j.css(o.d['marginRight']), 10);
                if (!is_number(m)) {
                    m = 0;
                }
                j.data(d, m);
            });
        }
    }

    function sz_resetMargin(i, o, m) {
        if (o.usePadding) {
            var x = (is_boolean(m)) ? m : false;
            if (!is_number(m)) {
                m = 0;
            }
            sz_storeMargin(i, o, '_cfs_tempCssMargin');
            i.each(function() {
                var j = $(this);
                j.css(o.d['marginRight'], ((x) ? j.data('_cfs_tempCssMargin') : m + j.data('_cfs_origCssMargin')));
            });
        }
    }

    function sz_storeOrigCss(i) {
        i.each(function() {
            var j = $(this);
            j.data('_cfs_origCss', j.attr('style') || '');
        });
    }

    function sz_restoreOrigCss(i) {
        i.each(function() {
            var j = $(this);
            j.attr('style', j.data('_cfs_origCss') || '');
        });
    }

    function sz_setResponsiveSizes(o, all) {
        var visb = o.items.visible,
            newS = o.items[o.d['width']],
            seco = o[o.d['height']],
            secp = is_percentage(seco);

        all.each(function() {
            var $t = $(this),
                nw = newS - ms_getPaddingBorderMargin($t, o, 'Width');

            $t[o.d['width']](nw);
            if (secp) {
                $t[o.d['height']](ms_getPercentage(nw, seco));
            }
        });
    }

    function sz_setSizes($c, o) {
        var $w = $c.parent(),
            $i = $c.children(),
            $v = gi_getCurrentItems($i, o),
            sz = cf_mapWrapperSizes(ms_getSizes($v, o, true), o, false);

        $w.css(sz);

        if (o.usePadding) {
            var p = o.padding,
                r = p[o.d[1]];

            if (o.align && r < 0) {
                r = 0;
            }
            var $l = $v.last();
            $l.css(o.d['marginRight'], $l.data('_cfs_origCssMargin') + r);
            $c.css(o.d['top'], p[o.d[0]]);
            $c.css(o.d['left'], p[o.d[3]]);
        }

        $c.css(o.d['width'], sz[o.d['width']] + (ms_getTotalSize($i, o, 'width') * 2));
        $c.css(o.d['height'], ms_getLargestSize($i, o, 'height'));
        return sz;
    }

    // measuring functions

    function ms_getSizes(i, o, wrapper) {
        return [ms_getTotalSize(i, o, 'width', wrapper), ms_getLargestSize(i, o, 'height', wrapper)];
    }

    function ms_getLargestSize(i, o, dim, wrapper) {
        if (!is_boolean(wrapper)) {
            wrapper = false;
        }
        if (is_number(o[o.d[dim]]) && wrapper) {
            return o[o.d[dim]];
        }
        if (is_number(o.items[o.d[dim]])) {
            return o.items[o.d[dim]];
        }
        dim = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight';
        return ms_getTrueLargestSize(i, o, dim);
    }

    function ms_getTrueLargestSize(i, o, dim) {
        var s = 0;

        for (var a = 0, l = i.length; a < l; a++) {
            var j = i.eq(a);

            var m = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
            if (s < m) {
                s = m;
            }
        }
        return s;
    }

    function ms_getTotalSize(i, o, dim, wrapper) {
        if (!is_boolean(wrapper)) {
            wrapper = false;
        }
        if (is_number(o[o.d[dim]]) && wrapper) {
            return o[o.d[dim]];
        }
        if (is_number(o.items[o.d[dim]])) {
            return o.items[o.d[dim]] * i.length;
        }

        var d = (dim.toLowerCase().indexOf('width') > -1) ? 'outerWidth' : 'outerHeight',
            s = 0;

        for (var a = 0, l = i.length; a < l; a++) {
            var j = i.eq(a);
            s += (j.is(':visible')) ? j[o.d[d]](true) : 0;
        }
        return s;
    }

    function ms_getParentSize($w, o, d) {
        var isVisible = $w.is(':visible');
        if (isVisible) {
            $w.hide();
        }
        var s = $w.parent()[o.d[d]]();
        if (isVisible) {
            $w.show();
        }
        return s;
    }

    function ms_getMaxDimension(o, a) {
        return (is_number(o[o.d['width']])) ? o[o.d['width']] : a;
    }

    function ms_hasVariableSizes(i, o, dim) {
        var s = false,
            v = false;

        for (var a = 0, l = i.length; a < l; a++) {
            var j = i.eq(a);

            var c = (j.is(':visible')) ? j[o.d[dim]](true) : 0;
            if (s === false) {
                s = c;
            } else if (s != c) {
                v = true;
            }
            if (s == 0) {
                v = true;
            }
        }
        return v;
    }

    function ms_getPaddingBorderMargin(i, o, d) {
        return i[o.d['outer' + d]](true) - i[o.d[d.toLowerCase()]]();
    }

    function ms_getPercentage(s, o) {
        if (is_percentage(o)) {
            o = parseInt(o.slice(0, -1), 10);
            if (!is_number(o)) {
                return s;
            }
            s *= o / 100;
        }
        return s;
    }

    // config functions

    function cf_e(n, c, pf, ns, rd) {
        if (!is_boolean(pf)) {
            pf = true;
        }
        if (!is_boolean(ns)) {
            ns = true;
        }
        if (!is_boolean(rd)) {
            rd = false;
        }

        if (pf) {
            n = c.events.prefix + n;
        }
        if (ns) {
            n = n + '.' + c.events.namespace;
        }
        if (ns && rd) {
            n += c.serialNumber;
        }

        return n;
    }

    function cf_c(n, c) {
        return (is_string(c.classnames[n])) ? c.classnames[n] : n;
    }

    function cf_mapWrapperSizes(ws, o, p) {
        if (!is_boolean(p)) {
            p = true;
        }
        var pad = (o.usePadding && p) ? o.padding : [0, 0, 0, 0];
        var wra = {};

        wra[o.d['width']] = ws[0] + pad[1] + pad[3];
        wra[o.d['height']] = ws[1] + pad[0] + pad[2];

        return wra;
    }

    function cf_sortParams(vals, typs) {
        var arr = [];
        for (var a = 0, l1 = vals.length; a < l1; a++) {
            for (var b = 0, l2 = typs.length; b < l2; b++) {
                if (typs[b].indexOf(typeof vals[a]) > -1 && is_undefined(arr[b])) {
                    arr[b] = vals[a];
                    break;
                }
            }
        }
        return arr;
    }

    function cf_getPadding(p) {
        if (is_undefined(p)) {
            return [0, 0, 0, 0];
        }
        if (is_number(p)) {
            return [p, p, p, p];
        }
        if (is_string(p)) {
            p = p.split('px').join('').split('em').join('').split(' ');
        }

        if (!is_array(p)) {
            return [0, 0, 0, 0];
        }
        for (var i = 0; i < 4; i++) {
            p[i] = parseInt(p[i], 10);
        }
        switch (p.length) {
            case 0:
                return [0, 0, 0, 0];
            case 1:
                return [p[0], p[0], p[0], p[0]];
            case 2:
                return [p[0], p[1], p[0], p[1]];
            case 3:
                return [p[0], p[1], p[2], p[1]];
            default:
                return [p[0], p[1], p[2], p[3]];
        }
    }

    function cf_getAlignPadding(itm, o) {
        var x = (is_number(o[o.d['width']])) ? Math.ceil(o[o.d['width']] - ms_getTotalSize(itm, o, 'width')) : 0;
        switch (o.align) {
            case 'left':
                return [0, x];
            case 'right':
                return [x, 0];
            case 'center':
            default:
                return [Math.ceil(x / 2), Math.floor(x / 2)];
        }
    }

    function cf_getDimensions(o) {
        var dm = [
            ['width', 'innerWidth', 'outerWidth', 'height', 'innerHeight', 'outerHeight', 'left', 'top', 'marginRight', 0, 1, 2, 3],
            ['height', 'innerHeight', 'outerHeight', 'width', 'innerWidth', 'outerWidth', 'top', 'left', 'marginBottom', 3, 2, 1, 0]
        ];

        var dl = dm[0].length,
            dx = (o.direction == 'right' || o.direction == 'left') ? 0 : 1;

        var dimensions = {};
        for (var d = 0; d < dl; d++) {
            dimensions[dm[0][d]] = dm[dx][d];
        }
        return dimensions;
    }

    function cf_getAdjust(x, o, a, $t) {
        var v = x;
        if (is_function(a)) {
            v = a.call($t, v);

        } else if (is_string(a)) {
            var p = a.split('+'),
                m = a.split('-');

            if (m.length > p.length) {
                var neg = true,
                    sta = m[0],
                    adj = m[1];
            } else {
                var neg = false,
                    sta = p[0],
                    adj = p[1];
            }

            switch (sta) {
                case 'even':
                    v = (x % 2 == 1) ? x - 1 : x;
                    break;
                case 'odd':
                    v = (x % 2 == 0) ? x - 1 : x;
                    break;
                default:
                    v = x;
                    break;
            }
            adj = parseInt(adj, 10);
            if (is_number(adj)) {
                if (neg) {
                    adj = -adj;
                }
                v += adj;
            }
        }
        if (!is_number(v) || v < 1) {
            v = 1;
        }
        return v;
    }

    function cf_getItemsAdjust(x, o, a, $t) {
        return cf_getItemAdjustMinMax(cf_getAdjust(x, o, a, $t), o.items.visibleConf);
    }

    function cf_getItemAdjustMinMax(v, i) {
        if (is_number(i.min) && v < i.min) {
            v = i.min;
        }
        if (is_number(i.max) && v > i.max) {
            v = i.max;
        }
        if (v < 1) {
            v = 1;
        }
        return v;
    }

    function cf_getSynchArr(s) {
        if (!is_array(s)) {
            s = [
                [s]
            ];
        }
        if (!is_array(s[0])) {
            s = [s];
        }
        for (var j = 0, l = s.length; j < l; j++) {
            if (is_string(s[j][0])) {
                s[j][0] = $(s[j][0]);
            }
            if (!is_boolean(s[j][1])) {
                s[j][1] = true;
            }
            if (!is_boolean(s[j][2])) {
                s[j][2] = true;
            }
            if (!is_number(s[j][3])) {
                s[j][3] = 0;
            }
        }
        return s;
    }

    function cf_getKeyCode(k) {
        if (k == 'right') {
            return 39;
        }
        if (k == 'left') {
            return 37;
        }
        if (k == 'up') {
            return 38;
        }
        if (k == 'down') {
            return 40;
        }
        return -1;
    }

    function cf_setCookie(n, $c, c) {
        if (n) {
            var v = $c.triggerHandler(cf_e('currentPosition', c));
            $.fn.carouFredSel.cookie.set(n, v);
        }
    }

    function cf_getCookie(n) {
        var c = $.fn.carouFredSel.cookie.get(n);
        return (c == '') ? 0 : c;
    }

    // init function

    function in_mapCss($elem, props) {
        var css = {};
        for (var p = 0, l = props.length; p < l; p++) {
            css[props[p]] = $elem.css(props[p]);
        }
        return css;
    }

    function in_complementItems(obj, opt, itm, sta) {
        if (!is_object(obj.visibleConf)) {
            obj.visibleConf = {};
        }
        if (!is_object(obj.sizesConf)) {
            obj.sizesConf = {};
        }

        if (obj.start == 0 && is_number(sta)) {
            obj.start = sta;
        }

        // visible items
        if (is_object(obj.visible)) {
            obj.visibleConf.min = obj.visible.min;
            obj.visibleConf.max = obj.visible.max;
            obj.visible = false;
        } else if (is_string(obj.visible)) {
            // variable visible items
            if (obj.visible == 'variable') {
                obj.visibleConf.variable = true;
            }
            // adjust string visible items
            else {
                obj.visibleConf.adjust = obj.visible;
            }
            obj.visible = false;
        } else if (is_function(obj.visible)) {
            obj.visibleConf.adjust = obj.visible;
            obj.visible = false;
        }

        // set items filter
        if (!is_string(obj.filter)) {
            obj.filter = (itm.filter(':hidden').length > 0) ? ':visible' : '*';
        }

        // primary item-size not set
        if (!obj[opt.d['width']]) {
            // responsive carousel -> set to largest
            if (opt.responsive) {
                debug(true, 'Set a ' + opt.d['width'] + ' for the items!');
                obj[opt.d['width']] = ms_getTrueLargestSize(itm, opt, 'outerWidth');
            }
            //  non-responsive -> measure it or set to "variable"
            else {
                obj[opt.d['width']] = (ms_hasVariableSizes(itm, opt, 'outerWidth')) ? 'variable' : itm[opt.d['outerWidth']](true);
            }
        }

        // secondary item-size not set -> measure it or set to "variable"
        if (!obj[opt.d['height']]) {
            obj[opt.d['height']] = (ms_hasVariableSizes(itm, opt, 'outerHeight')) ? 'variable' : itm[opt.d['outerHeight']](true);
        }

        obj.sizesConf.width = obj.width;
        obj.sizesConf.height = obj.height;
        return obj;
    }

    function in_complementVisibleItems(opt, avl) {
        // primary item-size variable -> set visible items variable
        if (opt.items[opt.d['width']] == 'variable') {
            opt.items.visibleConf.variable = true;
        }
        if (!opt.items.visibleConf.variable) {
            // primary size is number -> calculate visible-items
            if (is_number(opt[opt.d['width']])) {
                opt.items.visible = Math.floor(opt[opt.d['width']] / opt.items[opt.d['width']]);
            }
            // measure and calculate primary size and visible-items
            else {
                opt.items.visible = Math.floor(avl / opt.items[opt.d['width']]);
                opt[opt.d['width']] = opt.items.visible * opt.items[opt.d['width']];
                if (!opt.items.visibleConf.adjust) {
                    opt.align = false;
                }
            }
            if (opt.items.visible == 'Infinity' || opt.items.visible < 1) {
                debug(true, 'Not a valid number of visible items: Set to "variable".');
                opt.items.visibleConf.variable = true;
            }
        }
        return opt;
    }

    function in_complementPrimarySize(obj, opt, all) {
        // primary size set to auto -> measure largest item-size and set it
        if (obj == 'auto') {
            obj = ms_getTrueLargestSize(all, opt, 'outerWidth');
        }
        return obj;
    }

    function in_complementSecondarySize(obj, opt, all) {
        // secondary size set to auto -> measure largest item-size and set it
        if (obj == 'auto') {
            obj = ms_getTrueLargestSize(all, opt, 'outerHeight');
        }
        // secondary size not set -> set to secondary item-size
        if (!obj) {
            obj = opt.items[opt.d['height']];
        }
        return obj;
    }

    function in_getAlignPadding(o, all) {
        var p = cf_getAlignPadding(gi_getCurrentItems(all, o), o);
        o.padding[o.d[1]] = p[1];
        o.padding[o.d[3]] = p[0];
        return o;
    }

    function in_getResponsiveValues(o, all, avl) {

        var visb = cf_getItemAdjustMinMax(Math.ceil(o[o.d['width']] / o.items[o.d['width']]), o.items.visibleConf);
        if (visb > all.length) {
            visb = all.length;
        }

        var newS = Math.floor(o[o.d['width']] / visb);

        o.items.visible = visb;
        o.items[o.d['width']] = newS;
        o[o.d['width']] = visb * newS;
        return o;
    }


    // buttons functions

    function bt_pauseOnHoverConfig(p) {
        if (is_string(p)) {
            var i = (p.indexOf('immediate') > -1) ? true : false,
                r = (p.indexOf('resume') > -1) ? true : false;
        } else {
            var i = r = false;
        }
        return [i, r];
    }

    function bt_mousesheelNumber(mw) {
        return (is_number(mw)) ? mw : null
    }

    // helper functions

    function is_null(a) {
        return (a === null);
    }

    function is_undefined(a) {
        return (is_null(a) || typeof a == 'undefined' || a === '' || a === 'undefined');
    }

    function is_array(a) {
        return (a instanceof Array);
    }

    function is_jquery(a) {
        return (a instanceof jQuery);
    }

    function is_object(a) {
        return ((a instanceof Object || typeof a == 'object') && !is_null(a) && !is_jquery(a) && !is_array(a) && !is_function(a));
    }

    function is_number(a) {
        return ((a instanceof Number || typeof a == 'number') && !isNaN(a));
    }

    function is_string(a) {
        return ((a instanceof String || typeof a == 'string') && !is_undefined(a) && !is_true(a) && !is_false(a));
    }

    function is_function(a) {
        return (a instanceof Function || typeof a == 'function');
    }

    function is_boolean(a) {
        return (a instanceof Boolean || typeof a == 'boolean' || is_true(a) || is_false(a));
    }

    function is_true(a) {
        return (a === true || a === 'true');
    }

    function is_false(a) {
        return (a === false || a === 'false');
    }

    function is_percentage(x) {
        return (is_string(x) && x.slice(-1) == '%');
    }


    function getTime() {
        return new Date().getTime();
    }

    function deprecated(o, n) {
        debug(true, o + ' is DEPRECATED, support for it will be removed. Use ' + n + ' instead.');
    }

    function debug(d, m) {
        if (!is_undefined(window.console) && !is_undefined(window.console.log)) {
            if (is_object(d)) {
                var s = ' (' + d.selector + ')';
                d = d.debug;
            } else {
                var s = '';
            }
            if (!d) {
                return false;
            }

            if (is_string(m)) {
                m = 'carouFredSel' + s + ': ' + m;
            } else {
                m = ['carouFredSel' + s + ':', m];
            }
            window.console.log(m);
        }
        return false;
    }



    // EASING FUNCTIONS
    $.extend($.easing, {
        'quadratic': function(t) {
            var t2 = t * t;
            return t * (-t2 * t + 4 * t2 - 6 * t + 4);
        },
        'cubic': function(t) {
            return t * (4 * t * t - 9 * t + 6);
        },
        'elastic': function(t) {
            var t2 = t * t;
            return t * (33 * t2 * t2 - 106 * t2 * t + 126 * t2 - 67 * t + 15);
        }
    });


})(jQuery);
//     Underscore.js 1.8.2
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousUnderscore = root._;

    // Save bytes in the minified (but not gzipped) version:
    var ArrayProto = Array.prototype,
        ObjProto = Object.prototype,
        FuncProto = Function.prototype;

    // Create quick reference variables for speed access to core prototypes.
    var
    push = ArrayProto.push,
        slice = ArrayProto.slice,
        toString = ObjProto.toString,
        hasOwnProperty = ObjProto.hasOwnProperty;

    // All **ECMAScript 5** native function implementations that we hope to use
    // are declared here.
    var
    nativeIsArray = Array.isArray,
        nativeKeys = Object.keys,
        nativeBind = FuncProto.bind,
        nativeCreate = Object.create;

    // Naked function reference for surrogate-prototype-swapping.
    var Ctor = function() {};

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }

    // Current version.
    _.VERSION = '1.8.2';

    // Internal function that returns an efficient (for current engines) version
    // of the passed-in callback, to be repeatedly applied in other Underscore
    // functions.
    var optimizeCb = function(func, context, argCount) {
        if (context === void 0) return func;
        switch (argCount == null ? 3 : argCount) {
            case 1:
                return function(value) {
                    return func.call(context, value);
                };
            case 2:
                return function(value, other) {
                    return func.call(context, value, other);
                };
            case 3:
                return function(value, index, collection) {
                    return func.call(context, value, index, collection);
                };
            case 4:
                return function(accumulator, value, index, collection) {
                    return func.call(context, accumulator, value, index, collection);
                };
        }
        return function() {
            return func.apply(context, arguments);
        };
    };

    // A mostly-internal function to generate callbacks that can be applied
    // to each element in a collection, returning the desired result — either
    // identity, an arbitrary callback, a property matcher, or a property accessor.
    var cb = function(value, context, argCount) {
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value)) return _.matcher(value);
        return _.property(value);
    };
    _.iteratee = function(value, context) {
        return cb(value, context, Infinity);
    };

    // An internal function for creating assigner functions.
    var createAssigner = function(keysFunc, undefinedOnly) {
        return function(obj) {
            var length = arguments.length;
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                    keys = keysFunc(source),
                    l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };

    // An internal function for creating a new object that inherits from another.
    var baseCreate = function(prototype) {
        if (!_.isObject(prototype)) return {};
        if (nativeCreate) return nativeCreate(prototype);
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result;
    };

    // Helper for collection methods to determine whether a collection
    // should be iterated as an array or as an object
    // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    var isArrayLike = function(collection) {
        var length = collection && collection.length;
        return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };

    // Collection Functions
    // --------------------

    // The cornerstone, an `each` implementation, aka `forEach`.
    // Handles raw objects in addition to array-likes. Treats all
    // sparse array-likes as if they were dense.
    _.each = _.forEach = function(obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        } else {
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };

    // Return the results of applying the iteratee to each element.
    _.map = _.collect = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length,
            results = Array(length);
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Create a reducing function iterating left or right.

    function createReduce(dir) {
        // Optimized iterator function as using arguments.length
        // in the main function will deoptimize the, see #1991.
        function iterator(obj, iteratee, memo, keys, index, length) {
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        }

        return function(obj, iteratee, memo, context) {
            iteratee = optimizeCb(iteratee, context, 4);
            var keys = !isArrayLike(obj) && _.keys(obj),
                length = (keys || obj).length,
                index = dir > 0 ? 0 : length - 1;
            // Determine the initial value if none is provided.
            if (arguments.length < 3) {
                memo = obj[keys ? keys[index] : index];
                index += dir;
            }
            return iterator(obj, iteratee, memo, keys, index, length);
        };
    }

    // **Reduce** builds up a single result from a list of values, aka `inject`,
    // or `foldl`.
    _.reduce = _.foldl = _.inject = createReduce(1);

    // The right-associative version of reduce, also known as `foldr`.
    _.reduceRight = _.foldr = createReduce(-1);

    // Return the first value which passes a truth test. Aliased as `detect`.
    _.find = _.detect = function(obj, predicate, context) {
        var key;
        if (isArrayLike(obj)) {
            key = _.findIndex(obj, predicate, context);
        } else {
            key = _.findKey(obj, predicate, context);
        }
        if (key !== void 0 && key !== -1) return obj[key];
    };

    // Return all the elements that pass a truth test.
    // Aliased as `select`.
    _.filter = _.select = function(obj, predicate, context) {
        var results = [];
        predicate = cb(predicate, context);
        _.each(obj, function(value, index, list) {
            if (predicate(value, index, list)) results.push(value);
        });
        return results;
    };

    // Return all the elements for which a truth test fails.
    _.reject = function(obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };

    // Determine whether all of the elements match a truth test.
    // Aliased as `all`.
    _.every = _.all = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
        }
        return true;
    };

    // Determine if at least one element in the object matches a truth test.
    // Aliased as `any`.
    _.some = _.any = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
            length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
        }
        return false;
    };

    // Determine if the array or object contains a given value (using `===`).
    // Aliased as `includes` and `include`.
    _.contains = _.includes = _.include = function(obj, target, fromIndex) {
        if (!isArrayLike(obj)) obj = _.values(obj);
        return _.indexOf(obj, target, typeof fromIndex == 'number' && fromIndex) >= 0;
    };

    // Invoke a method (with arguments) on every item in a collection.
    _.invoke = function(obj, method) {
        var args = slice.call(arguments, 2);
        var isFunc = _.isFunction(method);
        return _.map(obj, function(value) {
            var func = isFunc ? method : value[method];
            return func == null ? func : func.apply(value, args);
        });
    };

    // Convenience version of a common use case of `map`: fetching a property.
    _.pluck = function(obj, key) {
        return _.map(obj, _.property(key));
    };

    // Convenience version of a common use case of `filter`: selecting only objects
    // containing specific `key:value` pairs.
    _.where = function(obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };

    // Convenience version of a common use case of `find`: getting the first object
    // containing specific `key:value` pairs.
    _.findWhere = function(obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };

    // Return the maximum element (or element-based computation).
    _.max = function(obj, iteratee, context) {
        var result = -Infinity,
            lastComputed = -Infinity,
            value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value > result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index, list) {
                computed = iteratee(value, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Return the minimum element (or element-based computation).
    _.min = function(obj, iteratee, context) {
        var result = Infinity,
            lastComputed = Infinity,
            value, computed;
        if (iteratee == null && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index, list) {
                computed = iteratee(value, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = value;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };

    // Shuffle a collection, using the modern version of the
    // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
    _.shuffle = function(obj) {
        var set = isArrayLike(obj) ? obj : _.values(obj);
        var length = set.length;
        var shuffled = Array(length);
        for (var index = 0, rand; index < length; index++) {
            rand = _.random(0, index);
            if (rand !== index) shuffled[index] = shuffled[rand];
            shuffled[rand] = set[index];
        }
        return shuffled;
    };

    // Sample **n** random values from a collection.
    // If **n** is not specified, returns a single random element.
    // The internal `guard` argument allows it to work with `map`.
    _.sample = function(obj, n, guard) {
        if (n == null || guard) {
            if (!isArrayLike(obj)) obj = _.values(obj);
            return obj[_.random(obj.length - 1)];
        }
        return _.shuffle(obj).slice(0, Math.max(0, n));
    };

    // Sort the object's values by a criterion produced by an iteratee.
    _.sortBy = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function(value, index, list) {
            return {
                value: value,
                index: index,
                criteria: iteratee(value, index, list)
            };
        }).sort(function(left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) return 1;
                if (a < b || b === void 0) return -1;
            }
            return left.index - right.index;
        }), 'value');
    };

    // An internal function used for aggregate "group by" operations.
    var group = function(behavior) {
        return function(obj, iteratee, context) {
            var result = {};
            iteratee = cb(iteratee, context);
            _.each(obj, function(value, index) {
                var key = iteratee(value, index, obj);
                behavior(result, value, key);
            });
            return result;
        };
    };

    // Groups the object's values by a criterion. Pass either a string attribute
    // to group by, or a function that returns the criterion.
    _.groupBy = group(function(result, value, key) {
        if (_.has(result, key)) result[key].push(value);
        else result[key] = [value];
    });

    // Indexes the object's values by a criterion, similar to `groupBy`, but for
    // when you know that your index values will be unique.
    _.indexBy = group(function(result, value, key) {
        result[key] = value;
    });

    // Counts instances of an object that group by a certain criterion. Pass
    // either a string attribute to count by, or a function that returns the
    // criterion.
    _.countBy = group(function(result, value, key) {
        if (_.has(result, key)) result[key]++;
        else result[key] = 1;
    });

    // Safely create a real, live array from anything iterable.
    _.toArray = function(obj) {
        if (!obj) return [];
        if (_.isArray(obj)) return slice.call(obj);
        if (isArrayLike(obj)) return _.map(obj, _.identity);
        return _.values(obj);
    };

    // Return the number of elements in an object.
    _.size = function(obj) {
        if (obj == null) return 0;
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };

    // Split a collection into two arrays: one whose elements all satisfy the given
    // predicate, and one whose elements all do not satisfy the predicate.
    _.partition = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var pass = [],
            fail = [];
        _.each(obj, function(value, key, obj) {
            (predicate(value, key, obj) ? pass : fail).push(value);
        });
        return [pass, fail];
    };

    // Array Functions
    // ---------------

    // Get the first element of an array. Passing **n** will return the first N
    // values in the array. Aliased as `head` and `take`. The **guard** check
    // allows it to work with `_.map`.
    _.first = _.head = _.take = function(array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[0];
        return _.initial(array, array.length - n);
    };

    // Returns everything but the last entry of the array. Especially useful on
    // the arguments object. Passing **n** will return all the values in
    // the array, excluding the last N.
    _.initial = function(array, n, guard) {
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };

    // Get the last element of an array. Passing **n** will return the last N
    // values in the array.
    _.last = function(array, n, guard) {
        if (array == null) return void 0;
        if (n == null || guard) return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };

    // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
    // Especially useful on the arguments object. Passing an **n** will return
    // the rest N values in the array.
    _.rest = _.tail = _.drop = function(array, n, guard) {
        return slice.call(array, n == null || guard ? 1 : n);
    };

    // Trim out all falsy values from an array.
    _.compact = function(array) {
        return _.filter(array, _.identity);
    };

    // Internal implementation of a recursive `flatten` function.
    var flatten = function(input, shallow, strict, startIndex) {
        var output = [],
            idx = 0;
        for (var i = startIndex || 0, length = input && input.length; i < length; i++) {
            var value = input[i];
            if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
                //flatten current level of array or arguments object
                if (!shallow) value = flatten(value, shallow, strict);
                var j = 0,
                    len = value.length;
                output.length += len;
                while (j < len) {
                    output[idx++] = value[j++];
                }
            } else if (!strict) {
                output[idx++] = value;
            }
        }
        return output;
    };

    // Flatten out an array, either recursively (by default), or just one level.
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, false);
    };

    // Return a version of the array that does not contain the specified value(s).
    _.without = function(array) {
        return _.difference(array, slice.call(arguments, 1));
    };

    // Produce a duplicate-free version of the array. If the array has already
    // been sorted, you have the option of using a faster algorithm.
    // Aliased as `unique`.
    _.uniq = _.unique = function(array, isSorted, iteratee, context) {
        if (array == null) return [];
        if (!_.isBoolean(isSorted)) {
            context = iteratee;
            iteratee = isSorted;
            isSorted = false;
        }
        if (iteratee != null) iteratee = cb(iteratee, context);
        var result = [];
        var seen = [];
        for (var i = 0, length = array.length; i < length; i++) {
            var value = array[i],
                computed = iteratee ? iteratee(value, i, array) : value;
            if (isSorted) {
                if (!i || seen !== computed) result.push(value);
                seen = computed;
            } else if (iteratee) {
                if (!_.contains(seen, computed)) {
                    seen.push(computed);
                    result.push(value);
                }
            } else if (!_.contains(result, value)) {
                result.push(value);
            }
        }
        return result;
    };

    // Produce an array that contains the union: each distinct element from all of
    // the passed-in arrays.
    _.union = function() {
        return _.uniq(flatten(arguments, true, true));
    };

    // Produce an array that contains every item shared between all the
    // passed-in arrays.
    _.intersection = function(array) {
        if (array == null) return [];
        var result = [];
        var argsLength = arguments.length;
        for (var i = 0, length = array.length; i < length; i++) {
            var item = array[i];
            if (_.contains(result, item)) continue;
            for (var j = 1; j < argsLength; j++) {
                if (!_.contains(arguments[j], item)) break;
            }
            if (j === argsLength) result.push(item);
        }
        return result;
    };

    // Take the difference between one array and a number of other arrays.
    // Only the elements present in just the first array will remain.
    _.difference = function(array) {
        var rest = flatten(arguments, true, true, 1);
        return _.filter(array, function(value) {
            return !_.contains(rest, value);
        });
    };

    // Zip together multiple lists into a single array -- elements that share
    // an index go together.
    _.zip = function() {
        return _.unzip(arguments);
    };

    // Complement of _.zip. Unzip accepts an array of arrays and groups
    // each array's elements on shared indices
    _.unzip = function(array) {
        var length = array && _.max(array, 'length').length || 0;
        var result = Array(length);

        for (var index = 0; index < length; index++) {
            result[index] = _.pluck(array, index);
        }
        return result;
    };

    // Converts lists into objects. Pass either a single array of `[key, value]`
    // pairs, or two parallel arrays of the same length -- one of keys, and one of
    // the corresponding values.
    _.object = function(list, values) {
        var result = {};
        for (var i = 0, length = list && list.length; i < length; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };

    // Return the position of the first occurrence of an item in an array,
    // or -1 if the item is not included in the array.
    // If the array is large and already in sort order, pass `true`
    // for **isSorted** to use binary search.
    _.indexOf = function(array, item, isSorted) {
        var i = 0,
            length = array && array.length;
        if (typeof isSorted == 'number') {
            i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
        } else if (isSorted && length) {
            i = _.sortedIndex(array, item);
            return array[i] === item ? i : -1;
        }
        if (item !== item) {
            return _.findIndex(slice.call(array, i), _.isNaN);
        }
        for (; i < length; i++)
            if (array[i] === item) return i;
        return -1;
    };

    _.lastIndexOf = function(array, item, from) {
        var idx = array ? array.length : 0;
        if (typeof from == 'number') {
            idx = from < 0 ? idx + from + 1 : Math.min(idx, from + 1);
        }
        if (item !== item) {
            return _.findLastIndex(slice.call(array, 0, idx), _.isNaN);
        }
        while (--idx >= 0)
            if (array[idx] === item) return idx;
        return -1;
    };

    // Generator function to create the findIndex and findLastIndex functions

    function createIndexFinder(dir) {
        return function(array, predicate, context) {
            predicate = cb(predicate, context);
            var length = array != null && array.length;
            var index = dir > 0 ? 0 : length - 1;
            for (; index >= 0 && index < length; index += dir) {
                if (predicate(array[index], index, array)) return index;
            }
            return -1;
        };
    }

    // Returns the first index on an array-like that passes a predicate test
    _.findIndex = createIndexFinder(1);

    _.findLastIndex = createIndexFinder(-1);

    // Use a comparator function to figure out the smallest index at which
    // an object should be inserted so as to maintain order. Uses binary search.
    _.sortedIndex = function(array, obj, iteratee, context) {
        iteratee = cb(iteratee, context, 1);
        var value = iteratee(obj);
        var low = 0,
            high = array.length;
        while (low < high) {
            var mid = Math.floor((low + high) / 2);
            if (iteratee(array[mid]) < value) low = mid + 1;
            else high = mid;
        }
        return low;
    };

    // Generate an integer Array containing an arithmetic progression. A port of
    // the native Python `range()` function. See
    // [the Python documentation](http://docs.python.org/library/functions.html#range).
    _.range = function(start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = step || 1;

        var length = Math.max(Math.ceil((stop - start) / step), 0);
        var range = Array(length);

        for (var idx = 0; idx < length; idx++, start += step) {
            range[idx] = start;
        }

        return range;
    };

    // Function (ahem) Functions
    // ------------------

    // Determines whether to execute a function as a constructor
    // or a normal function with the provided arguments
    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
        if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
        var self = baseCreate(sourceFunc.prototype);
        var result = sourceFunc.apply(self, args);
        if (_.isObject(result)) return result;
        return self;
    };

    // Create a function bound to a given object (assigning `this`, and arguments,
    // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
    // available.
    _.bind = function(func, context) {
        if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
        if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
        var args = slice.call(arguments, 2);
        var bound = function() {
            return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
        };
        return bound;
    };

    // Partially apply a function by creating a version that has had some of its
    // arguments pre-filled, without changing its dynamic `this` context. _ acts
    // as a placeholder, allowing any combination of arguments to be pre-filled.
    _.partial = function(func) {
        var boundArgs = slice.call(arguments, 1);
        var bound = function() {
            var position = 0,
                length = boundArgs.length;
            var args = Array(length);
            for (var i = 0; i < length; i++) {
                args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
            }
            while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(func, bound, this, this, args);
        };
        return bound;
    };

    // Bind a number of an object's methods to that object. Remaining arguments
    // are the method names to be bound. Useful for ensuring that all callbacks
    // defined on an object belong to it.
    _.bindAll = function(obj) {
        var i, length = arguments.length,
            key;
        if (length <= 1) throw new Error('bindAll must be passed function names');
        for (i = 1; i < length; i++) {
            key = arguments[i];
            obj[key] = _.bind(obj[key], obj);
        }
        return obj;
    };

    // Memoize an expensive function by storing its results.
    _.memoize = function(func, hasher) {
        var memoize = function(key) {
            var cache = memoize.cache;
            var address = '' + (hasher ? hasher.apply(this, arguments) : key);
            if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
            return cache[address];
        };
        memoize.cache = {};
        return memoize;
    };

    // Delays a function for the given number of milliseconds, and then calls
    // it with the arguments supplied.
    _.delay = function(func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function() {
            return func.apply(null, args);
        }, wait);
    };

    // Defers a function, scheduling it to run after the current call stack has
    // cleared.
    _.defer = _.partial(_.delay, _, 1);

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    _.throttle = function(func, wait, options) {
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function() {
            previous = options.leading === false ? 0 : _.now();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function() {
            var now = _.now();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    _.debounce = function(func, wait, immediate) {
        var timeout, args, context, timestamp, result;

        var later = function() {
            var last = _.now() - timestamp;

            if (last < wait && last >= 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = _.now();
            var callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }

            return result;
        };
    };

    // Returns the first function passed as an argument to the second,
    // allowing you to adjust arguments, run code before and after, and
    // conditionally execute the original function.
    _.wrap = function(func, wrapper) {
        return _.partial(wrapper, func);
    };

    // Returns a negated version of the passed-in predicate.
    _.negate = function(predicate) {
        return function() {
            return !predicate.apply(this, arguments);
        };
    };

    // Returns a function that is the composition of a list of functions, each
    // consuming the return value of the function that follows.
    _.compose = function() {
        var args = arguments;
        var start = args.length - 1;
        return function() {
            var i = start;
            var result = args[start].apply(this, arguments);
            while (i--) result = args[i].call(this, result);
            return result;
        };
    };

    // Returns a function that will only be executed on and after the Nth call.
    _.after = function(times, func) {
        return function() {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };

    // Returns a function that will only be executed up to (but not including) the Nth call.
    _.before = function(times, func) {
        var memo;
        return function() {
            if (--times > 0) {
                memo = func.apply(this, arguments);
            }
            if (times <= 1) func = null;
            return memo;
        };
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = _.partial(_.before, 2);

    // Object Functions
    // ----------------

    // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
    var hasEnumBug = !{
        toString: null
    }.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
        'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'
    ];

    function collectNonEnumProps(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

        // Constructor is a special case.
        var prop = 'constructor';
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    }

    // Retrieve the names of an object's own properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = function(obj) {
        if (!_.isObject(obj)) return [];
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        for (var key in obj)
            if (_.has(obj, key)) keys.push(key);
            // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve all the property names of an object.
    _.allKeys = function(obj) {
        if (!_.isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        // Ahem, IE < 9.
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };

    // Retrieve the values of an object's properties.
    _.values = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
            values[i] = obj[keys[i]];
        }
        return values;
    };

    // Returns the results of applying the iteratee to each element of the object
    // In contrast to _.map it returns an object
    _.mapObject = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj),
            length = keys.length,
            results = {},
            currentKey;
        for (var index = 0; index < length; index++) {
            currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };

    // Convert an object into a list of `[key, value]` pairs.
    _.pairs = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
            pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };

    // Invert the keys and values of an object. The values must be serializable.
    _.invert = function(obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    // Return a sorted list of the function names available on the object.
    // Aliased as `methods`
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };

    // Extend a given object with all the properties in passed-in object(s).
    _.extend = createAssigner(_.allKeys);

    // Assigns a given object with all the own properties in the passed-in object(s)
    // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    _.extendOwn = _.assign = createAssigner(_.keys);

    // Returns the first key on an object that passes a predicate test
    _.findKey = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj),
            key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };

    // Return a copy of the object only containing the whitelisted properties.
    _.pick = function(object, oiteratee, context) {
        var result = {}, obj = object,
            iteratee, keys;
        if (obj == null) return result;
        if (_.isFunction(oiteratee)) {
            keys = _.allKeys(obj);
            iteratee = optimizeCb(oiteratee, context);
        } else {
            keys = flatten(arguments, false, false, 1);
            iteratee = function(value, key, obj) {
                return key in obj;
            };
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    };

    // Return a copy of the object without the blacklisted properties.
    _.omit = function(obj, iteratee, context) {
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
        } else {
            var keys = _.map(flatten(arguments, false, false, 1), String);
            iteratee = function(value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    };

    // Fill in a given object with default properties.
    _.defaults = createAssigner(_.allKeys, true);

    // Create a (shallow-cloned) duplicate of an object.
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };

    // Invokes interceptor with the obj, and then returns obj.
    // The primary purpose of this method is to "tap into" a method chain, in
    // order to perform operations on intermediate results within the chain.
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };

    // Returns whether an object has a given set of `key:value` pairs.
    _.isMatch = function(object, attrs) {
        var keys = _.keys(attrs),
            length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };


    // Internal recursive comparison function for `isEqual`.
    var eq = function(a, b, aStack, bStack) {
        // Identical objects are equal. `0 === -0`, but they aren't identical.
        // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        // A strict comparison is necessary because `null == undefined`.
        if (a == null || b == null) return a === b;
        // Unwrap any wrapped objects.
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            // Strings, numbers, regular expressions, dates, and booleans are compared by value.
            case '[object RegExp]':
                // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
            case '[object String]':
                // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                // equivalent to `new String("5")`.
                return '' + a === '' + b;
            case '[object Number]':
                // `NaN`s are equivalent, but non-reflexive.
                // Object(NaN) is equivalent to NaN
                if (+a !== +a) return +b !== +b;
                // An `egal` comparison is performed for other numeric values.
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            case '[object Boolean]':
                // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                // millisecond representations. Note that invalid dates with millisecond representations
                // of `NaN` are not equivalent.
                return +a === +b;
        }

        var areArrays = className === '[object Array]';
        if (!areArrays) {
            if (typeof a != 'object' || typeof b != 'object') return false;

            // Objects with different constructors are not equivalent, but `Object`s or `Array`s
            // from different frames are.
            var aCtor = a.constructor,
                bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                _.isFunction(bCtor) && bCtor instanceof bCtor) && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        // Assume equality for cyclic structures. The algorithm for detecting cyclic
        // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

        // Initializing stack of traversed objects.
        // It's done here since we only need them for objects and arrays comparison.
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            // Linear search. Performance is inversely proportional to the number of
            // unique nested structures.
            if (aStack[length] === a) return bStack[length] === b;
        }

        // Add the first object to the stack of traversed objects.
        aStack.push(a);
        bStack.push(b);

        // Recursively compare objects and arrays.
        if (areArrays) {
            // Compare array lengths to determine if a deep comparison is necessary.
            length = a.length;
            if (length !== b.length) return false;
            // Deep compare the contents, ignoring non-numeric properties.
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            // Deep compare objects.
            var keys = _.keys(a),
                key;
            length = keys.length;
            // Ensure that both objects contain the same number of properties before comparing deep equality.
            if (_.keys(b).length !== length) return false;
            while (length--) {
                // Deep compare each member
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        // Remove the first object from the stack of traversed objects.
        aStack.pop();
        bStack.pop();
        return true;
    };

    // Perform a deep comparison to check if two objects are equal.
    _.isEqual = function(a, b) {
        return eq(a, b);
    };

    // Is a given array, string, or object empty?
    // An "empty" object has no enumerable own-properties.
    _.isEmpty = function(obj) {
        if (obj == null) return true;
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
        return _.keys(obj).length === 0;
    };

    // Is a given value a DOM element?
    _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    // Is a given value an array?
    // Delegates to ECMA5's native Array.isArray
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    // Is a given variable an object?
    _.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !! obj;
    };

    // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
    _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });

    // Define a fallback version of the method in browsers (ahem, IE < 9), where
    // there isn't any inspectable "Arguments" type.
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return _.has(obj, 'callee');
        };
    }

    // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
    // IE 11 (#1621), and in Safari 8 (#1929).
    if (typeof / . / != 'function' && typeof Int8Array != 'object') {
        _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }

    // Is a given object a finite number?
    _.isFinite = function(obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };

    // Is the given value `NaN`? (NaN is the only number which does not equal itself).
    _.isNaN = function(obj) {
        return _.isNumber(obj) && obj !== +obj;
    };

    // Is a given value a boolean?
    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    // Is a given value equal to null?
    _.isNull = function(obj) {
        return obj === null;
    };

    // Is a given variable undefined?
    _.isUndefined = function(obj) {
        return obj === void 0;
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function(obj, key) {
        return obj != null && hasOwnProperty.call(obj, key);
    };

    // Utility Functions
    // -----------------

    // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
    // previous owner. Returns a reference to the Underscore object.
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };

    // Keep the identity function around for default iteratees.
    _.identity = function(value) {
        return value;
    };

    // Predicate-generating functions. Often useful outside of Underscore.
    _.constant = function(value) {
        return function() {
            return value;
        };
    };

    _.noop = function() {};

    _.property = function(key) {
        return function(obj) {
            return obj == null ? void 0 : obj[key];
        };
    };

    // Generates a function for a given object that returns a given property.
    _.propertyOf = function(obj) {
        return obj == null ? function() {} : function(key) {
            return obj[key];
        };
    };

    // Returns a predicate for checking whether an object has a given set of 
    // `key:value` pairs.
    _.matcher = _.matches = function(attrs) {
        attrs = _.extendOwn({}, attrs);
        return function(obj) {
            return _.isMatch(obj, attrs);
        };
    };

    // Run a function **n** times.
    _.times = function(n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    };

    // Return a random integer between min and max (inclusive).
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    // A (possibly faster) way to get the current timestamp as an integer.
    _.now = Date.now || function() {
        return new Date().getTime();
    };

    // List of HTML entities for escaping.
    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };
    var unescapeMap = _.invert(escapeMap);

    // Functions for escaping and unescaping strings to/from HTML interpolation.
    var createEscaper = function(map) {
        var escaper = function(match) {
            return map[match];
        };
        // Regexes for identifying a key that needs to be escaped
        var source = '(?:' + _.keys(map).join('|') + ')';
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function(string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    _.escape = createEscaper(escapeMap);
    _.unescape = createEscaper(unescapeMap);

    // If the value of the named `property` is a function then invoke it with the
    // `object` as context; otherwise, return it.
    _.result = function(object, property, fallback) {
        var value = object == null ? void 0 : object[property];
        if (value === void 0) {
            value = fallback;
        }
        return _.isFunction(value) ? value.call(object) : value;
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // By default, Underscore uses ERB-style template delimiters, change the
    // following template settings to use alternative delimiters.
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    // When customizing `templateSettings`, if you don't want to define an
    // interpolation, evaluation or escaping regex, we need one that is
    // guaranteed not to match.
    var noMatch = /(.)^/;

    // Certain characters need to be escaped so that they can be put into a
    // string literal.
    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function(match) {
        return '\\' + escapes[match];
    };

    // JavaScript micro-templating, similar to John Resig's implementation.
    // Underscore templating handles arbitrary delimiters, preserves whitespace,
    // and correctly escapes quotes within interpolated code.
    // NB: `oldSettings` only exists for backwards compatibility.
    _.template = function(text, settings, oldSettings) {
        if (!settings && oldSettings) settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);

        // Combine delimiters into one regular expression via alternation.
        var matcher = RegExp([
            (settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');

        // Compile the template source, escaping string literals appropriately.
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, escapeChar);
            index = offset + match.length;

            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }

            // Adobe VMs need the match returned to produce the correct offest.
            return match;
        });
        source += "';\n";

        // If a variable is not specified, place data values in local scope.
        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
            "print=function(){__p+=__j.call(arguments,'');};\n" +
            source + 'return __p;\n';

        try {
            var render = new Function(settings.variable || 'obj', '_', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call(this, data, _);
        };

        // Provide the compiled source as a convenience for precompilation.
        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';

        return template;
    };

    // Add a "chain" function. Start chaining a wrapped Underscore object.
    _.chain = function(obj) {
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };

    // OOP
    // ---------------
    // If Underscore is called as a function, it returns a wrapped object that
    // can be used OO-style. This wrapper holds altered versions of all the
    // underscore functions. Wrapped objects may be chained.

    // Helper function to continue chaining intermediate results.
    var result = function(instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };

    // Add your own custom functions to the Underscore object.
    _.mixin = function(obj) {
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function() {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result(this, func.apply(_, args));
            };
        });
    };

    // Add all of the Underscore functions to the wrapper object.
    _.mixin(_);

    // Add all mutator Array functions to the wrapper.
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return result(this, obj);
        };
    });

    // Add all accessor Array functions to the wrapper.
    _.each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return result(this, method.apply(this._wrapped, arguments));
        };
    });

    // Extracts the result from a wrapped and chained object.
    _.prototype.value = function() {
        return this._wrapped;
    };

    // Provide unwrapping proxy for some methods used in engine operations
    // such as arithmetic and JSON stringification.
    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

    _.prototype.toString = function() {
        return '' + this._wrapped;
    };

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, underscore registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party lib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    }
}.call(this));
var ustream = function(ele){
	this.ele = ele;
	
	//set the aspect ratio
	this.forceAspect();
};

ustream.prototype.forceAspect = function(){
	var width = this.ele.width(),
		height = (width * 9) / 16;

	this.ele.height(height);
};
jdrive = {
	refreshRate: 30, //how often to update data elements, in seconds
	
	init: function(){
		$(jdrive.registerElements);
		$(jdrive.videoSetup);
		$(jdrive.startIO);
		//$(jdrive.carousel);
	},

	videoSetup: function(){
		jdrive.mainVideo = new ustream(jdrive.mainVideoContainer);
		jdrive.tweetsContainer.height(jdrive.mainVideoContainer.height());
	},

	registerElements: function(){
		jdrive.tweetsTemplate = _.template($("#tweetTemplate").html());
		jdrive.tweetsContainer = $("#tweets");
		jdrive.tweets = $("#tweets #tweetContent");
		jdrive.mainVideoContainer = $("#mainVideo iframe");
		jdrive.instagramTemplate = _.template($("#instaTemplate").html());
		jdrive.instaContainer = $("#ugc");
	},

	abridge: function(string, wordCount){
		stringArray = string.split(" ");

		if(stringArray.length <= wordCount){
			return string;
		}

		return stringArray.slice(0, wordCount).join(" ");
	},

	startIO: function(){
		jdrive.socket = new io();
		jdrive.socket.emit("connection");
		jdrive.socket.emit("get-tweets");
		jdrive.socket.on("tweet", function(data){
			tweet = JSON.parse(data);
			jdrive.addTweet(tweet);
		});

		jdrive.getInstagram();
		setInterval(jdrive.getInstagram, 30 * 1000);
	},	

	addTweet: function(tweet){
		jdrive.tweets.prepend(jdrive.tweetsTemplate({tweet: tweet}));
		var newTweet = $(".tweet.row:eq(0)"),
			lastTweet = $(".tweet.row:gt(" + (settings.twitter.max - 1) + ")");

		newHeight = 0;

		newTweet.children().each(function(){
			newHeight += $(this).height()
		});
		
		lastTweet.remove();
		newTweet.animate({opacity: 1, height: (newHeight * 1.1) + "px"});
	},

	formatTweet: function(text){
		return text.replace(/(https?[:]\/\/[A-Za-z0-9.\/]+)/g, "<a href='$1'>$1</a>").replace(/#([A-Za-z0-9]+)/g, "<a href='http://www.twitter.com/hashtag/$1'>#$1</a>").replace(/@([A-Za-z0-9]+)/g, "<a href='http://www.twitter.com/$1'>@$1</a>");
	},

	getInstagram: function(){
		$.getJSON("/api/instagram", function(data){
			jdrive.instaContainer.html("");
			_.each(data, function(post){
				jdrive.instaContainer.append(jdrive.instagramTemplate({item: post}));
			});
		});
	}
};

jdrive.init();
settings = JSON.parse(settings);