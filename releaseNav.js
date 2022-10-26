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
    var releases = [
        'latest',
        'v0.12.1',
    ];

    var actualRelease = location.pathname.match(releaseNavPathPattern)[0];
    var i = releases.indexOf(actualRelease.substr(1));
    var tmp = releases[i];
    releases[i] = releases[0];
    releases[0] = tmp;

    navBarElem.append(
        '<select id="releaseNavSelectBox" name="releaseNav" onchange="location.pathname.replace(releaseNavPathPattern, this.value)">' +
        jQuery
            .map(
                releases,
                function(i, ver) {
                    return '<option value="/' + ver + '">' + ver + '</option>'
                })
            .join('') +
        '</select>');
});
