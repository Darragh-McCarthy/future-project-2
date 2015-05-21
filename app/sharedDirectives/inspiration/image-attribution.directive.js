
angular.module('app', []).directive('src', function () {
    var URL_RE = /^http:\/\/[^\/]*/;
    var HTTP_RE = /^(http|https):\/\//;

    return function (scope, element, attrs) {
        var context = {url: attrs.src.match(URL_RE)[0]};
        context.domain = context.url.replace(HTTP_RE, '');
        var templateFn = _.template('<a href="<%= url %>" target="_blank">Photo courtesy of <%= domain %></a>');
        element.after(templateFn(context));
    };
});*/