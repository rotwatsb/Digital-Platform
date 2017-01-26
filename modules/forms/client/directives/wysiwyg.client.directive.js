(function() {
  'use strict';

  angular
    .module('forms')
    .directive('wysiwygEditor', function() {
      return {
        restrict: 'AE',
        templateUrl: 'modules/forms/client/views/wysiwyg-editor.client.directive.view.html',
        scope: {
          outModel: '=ngModel',
          inTitle: '@',
          outerColumn: '@',
          name: '@',
          required: '@',
          labelClass: '@'
        },
        require: 'ngModel',
        replace: true,
        controller: ['$scope', 'FileUploader', function ($scope, FileUploader) {
          $scope.options = {
            height: 300,
            focus: false,
            toolbar: [
              ['edit',['undo','redo']],
              //['headline', ['style']],
              ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
              //['fontface', ['fontname']],
              //['textsize', ['fontsize']],
              //['fontclr', ['color']],
              ['alignment', ['ul', 'ol', 'paragraph']], //'lineheight'
              //['height', ['height']],
              ['table', ['table']],
              ['insert', ['link','picture','video','hr']],
            ]
          };

          $scope.imageUploader = new FileUploader({
            alias: 'newWysiwygImage',
            queueLimit: 1,
            url: 'api/remote-files/upload-wysiwyg-images'
          });

          var imageUploadSuccessful = function(fileInfo) {
            console.log('fileInfo client', fileInfo);

            var editor = $.summernote.eventHandler.getModule(),
              uploaded_file_name = fileInfo.originalname,
              file_location = fileInfo.path;

            editor.insertImage($scope.editable, file_location, uploaded_file_name);
          };

          var imageUploadError = function(errorMessage) {
            console.log('errorMessage', errorMessage);
          };

          $scope.imageUploader.onSuccessItem = function(fileItem, response, status, headers) {
            $scope.imageUploader.removeFromQueue(fileItem);
            imageUploadSuccessful(response);
          };

          $scope.imageUploader.onErrorItem = function(fileItem, response, status, headers) {
            imageUploadError(response.message);
          };

          $scope.imageUpload = function(files) {
            // console.log('image upload\'s editable:', $scope.editable);
            if (files !== null) {
              // console.log('files', files);
              $scope.imageUploader.addToQueue(files);
              // console.log('queue', $scope.imageUploader.queue);
              $scope.imageUploader.uploadAll();
            }
          };
        }]
      };
    });
})();
