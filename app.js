app = angular.module('myApp', []);

app.controller('HomeCtrl', function($scope, $http){
  $scope.fromServer = "http://annotateit.org/api/search";
  $scope.toServer = "http://dt-interview.herokuapp.com/annotations";

  $scope.pager = {};
  $scope.pager.currentPage = 1;
  $scope.pager.perPage = 20;
  /* if you see this loadingMessage for some time, Internet is slow or not working */
  $scope.loadingMessage = null;

  /* deep watch $scope.items by setting 3rd arg to true */
  $scope.$watch('items', function(newVal, oldVal){
    $scope.setCounters(newVal);
  }, true);

  $scope.loadRows = function(server) {
    $scope.loadingMessage = "Loading data from  " + server;
    console.log('loading data', server);
    $http.get(server)
      .success(function(data, status){
        if (data.rows) {
          $scope.items = data.rows;
        } else {
          $scope.items = data;
        }
        if (data.total) {
          $scope.total = data.total;
        } else {
          $scope.total = $scope.items.length;
        }
        if ($scope.items) {
          $scope.checkItemDestinations();
        }
        $scope.loadingMessage = null;
      })
      .error(function(data, status) {
        alert('Error loading data. Status ' + status);
        $scope.loadingMessage = null;
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
    $scope.loadingMessage = "Checking for existence on the 2nd server..."
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
    $scope.loadingMessage = null;
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
  };

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

  $scope.nextPage = function(fromServer, pager) {
    pager.currentPage = pager.currentPage + 1;
    $scope.goToPage(fromServer, pager)
  }

  $scope.previousPage = function(fromServer, pager) {
    pager.currentPage = pager.currentPage - 1;
    $scope.goToPage(fromServer, pager)
  }

  $scope.getPageUrl = function(basicUrl, pager) {
    limit = parseInt(pager.perPage);
    currentPage = parseInt(pager.currentPage);
    offset = (currentPage - 1) * limit;
    $scope.currentPageInfo = "from " + (offset + 1) + " to " + (offset + limit);

    var sep = '?';
    if (basicUrl.match(/\?/)) {
      sep = '&';
    }
    fullUrl = basicUrl + sep + 'offset=' + offset + '&limit=' + limit;

    return fullUrl;
  }

  $scope.goToPage = function(fromServer, pager) {
    console.log('next page is ', fromServer);
    url = $scope.getPageUrl(fromServer, pager);
    $scope.loadRows(url);
  }

  $scope.goToPage($scope.fromServer, $scope.pager);
});
