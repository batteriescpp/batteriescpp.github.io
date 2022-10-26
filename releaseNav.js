function handleReleaseNav()
{
    console.log('RELEASE NAV ' + $('#releaseNavSelectBox').val());
}

window.addEventListener('load', function() {
    if ($('#releaseNavSelectBox').length !== 0) {
        console.log('already ran releaseNav');
        return;
    }
    var navBarElem = $('.md-header nav');



    navBarElem.append(
        '<select id="releaseNavSelectBox" name="releaseNav" onchange="handleReleaseNav();">' +
        ' <option value="/latest">latest</option>' +
        ' <option value="/v0.12.1">v0.12.1</option>' +
        '</select>');

    var versionPattern = /^\/[^\/]*/;
    var actualVer = location.pathname.match(versionPattern)[0];
    $('#releaseNavSelectBox option[value="' + actualVer + '"]').prop('selected', 'selected');
    $('#releaseNavSelectBox').on('select', function() {
        location.pathname.replace(versionPattern, $('#releaseNavSelectBox').val());
    });
});
