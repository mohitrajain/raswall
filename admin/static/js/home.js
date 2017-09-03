var app = angular.module('home',[]);

app.controller('homeController',['$scope','$http','$interval',function($scope,$http,$interval){
 
     $interval(function(){
         $http.get('/total').then(
                    function(res){ 
                        $scope.friends = res.data; 
                        console.log($scope.friends);
                    }, function(err){
                        $scope.err = 'Connection Error ! Please Try again';
                    });
     },1000);
}
]);