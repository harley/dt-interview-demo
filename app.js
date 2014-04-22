app = angular.module('myApp', []);

app.controller('HomeCtrl', function($scope, $http){
  $scope.fromServer = "http://annotateit.org/api/search";
  $scope.toServer = "http://dt-interview.herokuapp.com/annotations";

  $scope.loadRows = function(server) {
    console.log('loading data', server);
    $http.get(server)
      .success(function(data, status){
        if (data.rows) {
          $scope.rows = data.rows;
        } else {
          $scope.rows = data;
        }

        if ($scope.rows) {
          $scope.checkItemDestinations();
        }
      })
      .error(function(data, status) {
        alert('Error loading data. Status ' + status);
      });
  };

  $scope.itemUrl = function(searchUrl, item) {
    // return item.links[0].href;
    return searchUrl.replace('search', 'annotations') + '/' + item.id;
  };

  $scope.itemDestinationUrl = function(toServer, item) {
    return toServer + '/' + item.id;
  };

  $scope.checkItemDestinations = function() {
    angular.forEach($scope.rows, function(item, index) {
      url = $scope.itemDestinationUrl($scope.toServer, item);
      console.log('check item destinations from', url);
      $http.get(url)
        .success(function(data, status){
          item.exist = true;
        })
        .error(function(data, status){
          item.exist = false;
        });
    });
  };

  $scope.saveItemToDest = function(toServer, item) {
    $http.post(toServer, item)
      .success(function(data, status){
        console.log('saved successfully');
        item.exist = true;
      })
      .error(function(data, status){
        console.log('[Error] saving failed.');
      });
  }

  $scope.deleteItemFromDest = function(toServer, item) {
    url = toServer + '/' + item.id;
    $http.delete(url)
      .success(function(data, status){
        item.exist = false;
        console.log('deleting successfully');
      })
      .error(function(data, status){
        console.log('[Error] deleting failed.')
      });
  }

  $scope.loadRows($scope.fromServer);
});
