function handleReleaseNav(event)
{
    console.log('RELEASE NAV ' + $('#releaseNavSelectBox').val());
}

var releaseNavPathPattern = /^\/[^\/]*/;

window.addEventListener('load', function() {
    if ($('#releaseNavSelectBox').length !== 0) {
        console.log('already ran releaseNav');
        return;
    }
    var navBarElem = $('.md-header nav');
    navBarElem.append(
        '<select id="releaseNavSelectBox" name="releaseNav" onchange="location.pathname.replace(releaseNavPathPattern, this.value)">' +
        ' <option value="/latest">latest</option>' +
        ' <option value="/v0.12.1">v0.12.1</option>' +
        '</select>');

    var actualVer = location.pathname.match(releaseNavPathPattern)[0];
    $('#releaseNavSelectBox option[value="' + actualVer + '"]').prop('selected', 'selected');
});
