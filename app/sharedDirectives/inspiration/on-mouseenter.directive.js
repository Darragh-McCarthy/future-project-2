    <div enter="loadMoreTweets()" leave>I'm content!</div>


app.directive("enter", function() {
    return function(scope, element, attrs) {
        element.bind("mouseenter", function() {
            scope.$apply(attrs.enter);
        });
    };
});