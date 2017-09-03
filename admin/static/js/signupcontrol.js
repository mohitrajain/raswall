/**
 * Created by chiraj on 7/19/16.
 */
var myapp = angular.module('signup',[]);

myapp.controller('maincontroller',['$scope',function ($scope) {
    
    $scope.username = 'username';
    $scope.password1 ='';
    $scope.password2 = '';
    $scope.email = '';
    $scope.country = 'India';
    
}]);
