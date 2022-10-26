window.addEventListener("load", function () {
    if ($("#releaseNavSelectBox")) {
        return;
    }
    var navBarElem = $(".md-header nav");
    navBarElem.append(
        "<select id=\"releaseNavSelectBox\" name=\"releaseNav\" onchange=\"location = this.value;\">"
      + " <option value=\"/latest/\">latest</option>"
      + " <option value=\"/v0.12.1/\">v0.12.1</option>"
      + "</select>");
});
