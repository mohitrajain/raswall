/**
 * Created by chiraj on 7/19/16.
 */
var myapp = angular.module('editProfile',[]);

myapp.controller('maincontroller',['$scope',function ($scope) {

    $scope.username = '';
    $scope.password1 ='password';
    $scope.password2 = 'password';
    $scope.email = '';
    $scope.country = '';
    $scope.status = '';
    $scope.value = 0;

    $scope.watch('password1',function() {
            $scope.value++;
    });

}]);
