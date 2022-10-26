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

    var versionPattern = /^\/[^\/]*/;
    var actualVer = location.pathname.match(versionPattern)[0];
    $('#releaseNavSelectBox option[value="' + actualVer + '"]').prop('selected', true);
    $('#releaseNavSelectBox').val(actualVer).change();
    $('#releaseNavSelectBox').change(function() {
        location.pathname.replace(versionPattern, this.value);
    });
});
