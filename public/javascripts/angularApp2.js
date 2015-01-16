angular.module('conditionsApp', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['fhirService', function(fhirService){
          return fhirService.getAll();
        }]
      }
    })
    .state('conditions', {
      url: '/conditions/{id}',
      templateUrl: '/conditions.html',
      controller: 'ConditionsCtrl',
      resolve: {
        patient: ['$stateParams', 'fhirService', function($stateParams, fhirService) {
          return fhirService.getPatient($stateParams.id);
        }]
      }
    });

  $urlRouterProvider.otherwise('home');
}])


.filter('stripId', function() {
  return function(input) {
    var pathArray = input.split('/');
    return pathArray[pathArray.length-1];
  };
})
.factory('fhirService', ['$http', function($http){
  var o = {
    patients: [],
    fhirBase: 'http://spark.furore.com/fhir'
  };
  o.getAll = function() {
    return $http.get(o.fhirBase + '/Patient?_count=1000&_format=json').success(function(data){
      angular.copy(data.entry, o.patients);
    });
  };
  o.getPatient = function(id) {
  return $http.get(o.fhirBase + '/Patient/' + id + '?_format=json').then(function(res){
    return res.data;
  });
};
  return o;
}])
.controller('MainCtrl', [
'$scope',
'fhirService',
function($scope, fhirService){
  $scope.fhirBase = fhirService.fhirBase;
  $scope.patients = fhirService.patients;
}])
.controller('ConditionsCtrl', [
'$scope',
'fhirService',
'patient',
function($scope, fhirService, patient){
  $scope.fhirBase = fhirService.fhirBase;
  $scope.patient = patient;
}]);