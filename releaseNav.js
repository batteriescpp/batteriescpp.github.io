window.addEventListener('load', function() {
    if ($('#releaseNavSelectBox').length !== 0) {
        return;
    }
    var navBarElem = $('.md-header nav');
    navBarElem.append(
        '<select id="releaseNavSelectBox" name="releaseNav">' +
        ' <option value="/latest">latest</option>' +
        ' <option value="/v0.12.1">v0.12.1</option>' +
        '</select>');

    var actualVer = location.pathname.match(/^\([^\/]*/)[1];
    $('#releaseNavSelectBox').val(actualVer).change();
    $('#releaseNavSelectBox').change(function() {
        location.pathname.replace(/^\/[^\/]*/, this.value);
    });
});
