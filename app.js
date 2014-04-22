app = angular.module('myApp', []);

app.controller('HomeCtrl', function($scope, $http){
  $scope.fromServer = "http://annotateit.org/api/search";
  $scope.toServer = "http://dt-interview.herokuapp.com/annotations";

  /* deep watch $scope.items by setting 3rd arg to true */
  $scope.$watch('items', function(newVal, oldVal){
    $scope.setCounters(newVal);
  }, true);

  $scope.loadRows = function(server) {
    console.log('loading data', server);
    $http.get(server)
      .success(function(data, status){
        if (data.rows) {
          $scope.items = data.rows;
        } else {
          $scope.items = data;
        }

        if ($scope.items) {
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
    angular.forEach($scope.items, function(item, index) {
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
        // $scope.countOfExisting = $scope.countOfExisting + 1;
        // $scope.countOfNew = $scope.countOfNew - 1;
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
        // $scope.countOfExisting = $scope.countOfExisting - 1;
        // $scope.countOfNew = $scope.countOfNew + 1;
        console.log('deleting successfully');
      })
      .error(function(data, status){
        console.log('[Error] deleting failed.')
      });
  }

  $scope.deleteExistingItems = function(toServer, items) {
    angular.forEach(items, function(item, index){
      if (item.exist) {
        $scope.deleteItemFromDest(toServer, item);
      }
    });
  }

  $scope.countExistingItems = function(items) {
    return items.reduce(function(total, item){
      if (item.exist) {
        return total + 1;
      } else {
        return total;
      }
    }, 0);
  };

  $scope.saveNewItems = function(toServer, items) {
    angular.forEach(items, function(item, index) {
      if (!item.exist) {
        $scope.saveItemToDest(toServer, item);
      }
    });
  };

  $scope.setCounters = function(vals){
    console.log('setting counters', vals);
    if(vals) {
      $scope.countOfExisting = $scope.countExistingItems(vals);
      $scope.countOfNew = vals.length - $scope.countOfExisting;
    }
  };

  $scope.loadRows($scope.fromServer);
});
