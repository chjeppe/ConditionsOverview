angular.module('conditionsApp', ['ui.router']) .config([ '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
 
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
        conditions: ['$stateParams', 'fhirService', function($stateParams, fhirService) {
          return fhirService.getConditions($stateParams.id);
        }],
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
    return $http.get(o.fhirBase + '/Patient?_format=json').success(function(data){
      angular.copy(data.entry, o.patients);
    });
  };
  o.getConditions = function(id) {
    return $http.get(o.fhirBase + '/Condition?subject=Patient/' + id + '&_format=json').then(function(res){
        return res.data.entry;
      });
  };
  o.getPatient = function(id) {
    return $http.get(o.fhirBase + '/Patient/' + id +'?_format=json').then(function(res){
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
'conditions',
'patient',
function($scope, fhirService, conditions, patient){
  $scope.fhirBase = fhirService.fhirBase;
  $scope.patient = patient;
  $scope.conditions = conditions;
}]);
 