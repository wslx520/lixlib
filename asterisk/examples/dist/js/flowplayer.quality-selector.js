/*!

   Flowplayer HTML5 quality selector plugin

   Copyright (c) 2016, Flowplayer Oy

   Released under the MIT License:
   http://www.opensource.org/licenses/mit-license.php

   revision: 4f2e08f

*/

(function(flowplayer) {
    flowplayer(function(api, root) {
        'use strict';
        var common = flowplayer.common,
            explicitSrc = false;

        //only register once
        if (api.pluginQualitySelectorEnabled) return;
        api.pluginQualitySelectorEnabled = true;

        if (!flowplayer.support.inlineVideo) return; // No inline video 

        if (api.conf.qualities) {
            api.conf.qualities = typeof api.conf.qualities === 'string' ? api.conf.qualities.split(',') : api.conf.qualities;
        }

        flowplayer.bean.on(root, 'click', '.fp-quality-selector li', function(ev) {
            var elem = ev.currentTarget;
            if (!common.hasClass(elem, 'active')) {
                var currentTime = api.finished ? 0 : api.video.time,
                    quality = elem.getAttribute('data-quality'),
                    src;
                // src = processClip(api.video, quality);
                src = findSrc(quality);
                api.quality = quality;
                if (!src) return;
                explicitSrc = true;
                api.load(src, function() {
                    //Make sure api is not in finished state anymore
                    explicitSrc = false;
                    api.finished = false;
                    if (currentTime && !api.live) {
                        api.seek(currentTime, function() {
                            api.resume();
                        });
                    }
                });
            }
        });

        api.on('load', function(ev, api, video) {
            api.qualities = video.qualities || api.conf.qualities || [];
            api.defaultQuality = video.defaultQuality || api.conf.defaultQuality;
            if (typeof api.qualities === 'string') api.qualities = api.qualities.split(',');
            if (!api.quality) return; // Let's go with default quality
            // var desiredQuality = findOptimalQuality(api.quality, api.qualities),
            //     newClip = processClip(video, desiredQuality, !explicitSrc);
            // if (!explicitSrc && newClip) {
            //     ev.preventDefault();
            //     api.loading = false;
            //     api.load(newClip);
            // }
        }).on('ready', function(ev, api, video) {
            if (!api.qualities.length) {
                api.qualities = video.qualities || api.conf.qualities || [];
                api.defaultQuality = video.defaultQuality || api.conf.defaultQuality;
            }
            var quality = api.quality||api.defaultQuality;
            removeAllQualityClasses();
            common.addClass(root, 'quality-' + quality);
            var ui = common.find('.fp-ui', root)[0];
            var sel = common.find('.fp-quality-selector', ui)[0];
            common.removeNode(sel);
            if (api.qualities.length < 2) return;
            // api.quality = quality;
            var selector = common.createElement('ul', { 'class': 'fp-quality-selector' });
            ui.appendChild(selector);
            api.qualities.forEach(function(q) {
                q = q.q;
                var _q = parseInt(q, 10);
                var qt = _q >= 720 ? '高清' : '标清';
                selector.appendChild(common.createElement('li', { 'data-quality': q, 'class': q == quality ? 'active' : '' }, qt));
            });
        }).on('unload', function() {
            removeAllQualityClasses();
            common.removeNode(common.find('.fp-quality-selector', root)[0]);
        });

        function findSrc(q) {
            var qs = api.qualities || [];
            var url = '';
            for (var i = 0, len = qs.length; i < len; i++) {
                if (qs[i].q === q) {
                    url = qs[i].url;
                    break;
                }
            }
            return url;
        }

        function canPlay(type) {
            var videoTag = document.createElement('video');
            return !!videoTag.canPlayType(type).replace('no', '');
        }

        function getQualityFromSrc(src, qualities) {
            var m = /-(\d+p)(\.(mp4|webm|m3u8))?$/.exec(src);
            if (!m) return;
            // if (qualities.indexOf(m[1]) === -1) return;
            // return m[1];
        }

        function removeAllQualityClasses() {
            if (!api.qualities || !api.qualities.length) return;
            api.qualities.forEach(function(quality) {
                quality = quality.q;
                common.removeClass(root, 'quality-' + quality);
            });
        }

        function findOptimalQuality(previousQuality, newQualities) {
            var a = parseInt(previousQuality, 0),
                ret;
            newQualities.forEach(function(quality, i) {
                if (i == newQualities.length - 1 && !ret) { // The best we can do
                    ret = quality;
                }
                if (parseInt(quality) <= a && parseInt(newQualities[i + 1]) > a) { // Is between
                    ret = quality;
                }
            });
            return ret;
        }

        function processClip(video, quality, clean) {
            var changed = false,
                re,
                currentQuality = api.quality || Math.min(api.video.height, api.video.width) + 'p';
            re = /(-\d+p)?((\.(mp4|webm|m3u8)$|$))/;
            var newSources = video.sources.map(function(src) {
                var n = {
                    type: src.type,
                    src: currentQuality === quality ? src.src : src.src.replace(re, '-' + quality + '$2')
                };
                if (n.src !== src.src) changed = true;
                return n;
            });
            var newSourcesStr = JSON.stringify(newSources);
            newSources.sort(function(a, b) {
                ret = re.test(a.type) - re.test(b.type);
                return ret;
            });
            changed = changed || JSON.stringify(newSources) !== newSourcesStr;
            var clip = flowplayer.extend({}, video, {
                sources: newSources
            });


            return changed ? clip : false;
        }

    });
})(typeof module === 'object' && module.exports ? require('flowplayer') : window.flowplayer);
