    <div enter="panel" leave>I'm content!</div>

app.directive("leave", function() {
    return function(scope, element, attrs) {
        element.bind("mouseleave", function() {
            element.removeClass(attrs.enter);
        });
    };
});