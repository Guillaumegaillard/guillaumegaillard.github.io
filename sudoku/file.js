// taken from https://embed.plnkr.co/plunk/2vgnFe
angular.module('file', [])

.factory('readFile', function ($window, $q) {
    'use strict';

    var readFile = function (file) {
        var deferred = $q.defer(),  
            reader = new $window.FileReader();

        reader.onload = function (ev) {
            var content = ev.target.result;
            deferred.resolve(content);
        };

        reader.readAsText(file);
        return deferred.promise;
    };

    return readFile;
})

// does not capture input change event
.directive('fileHandler', function (readFile) {
    'use strict';

    return {
        link: function (scope, element) {
            element.on('change', function (event) {
                var file = event.target.files[0];
                readFile(file).then(function (content) {
                    console.log(content);
                    scope.file_content=content;
                    scope.set_specific_file();
                });
            });
        }
    };
})

.directive('fileBrowser', function (readFile) {
    'use strict';

    return {
        template: '<input type="file" style="display: none;" />' +
            '<ng-transclude></ng-transclude>',
        transclude: true,
        link: function (scope, element) {
            var fileInput = element.children('input[file]');
            
            fileInput.on('change', function (event) {
                var file = event.target.files[0];
                readFile(file).then(function (content) {
                    console.log(content);
                    scope.file_content=content;

                });
            });
            
            element.on('click', function () {
                fileInput[0].click();
            });
        }
    };
});