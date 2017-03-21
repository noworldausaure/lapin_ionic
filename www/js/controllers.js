angular.module('starter.controllers', [])

.controller('HomeCtrl', function($scope,$http, Home) {
  $scope.loading = true;
  $scope.domain = Home.returnDomain($http).then(function(domain) {
    $scope.loading = false;
    $scope.dataDomain = domain.data;
  });
})

.controller('DomainCtrl', function($scope,$rootScope, $http, Home, $stateParams) {
  var domain = $stateParams.domain;
  $scope.loading = true;
  $scope.domain = domain;

  //GET INFO domain
  Home.returnInfo($http,domain).then(function(info) {
    $scope.info = info.data[0];
  });

  // GET STRIPS
  Home.returnAllStrips($http,domain).then(function(strips) {
    $scope.strips = strips.data;
  }).then(function(strips) {
    $scope.strips.forEach(function(strip) {
      Home.returnStripImage($http,domain,strip.id).then(function(stripImage) {
         $scope.loading = false;
         strip.file = stripImage.data[0].file;
      });
    });
  });

  // GET STORIES
  Home.returnStories($http,domain).then(function(stories) {
    $scope.stories = stories.data;
  });

  // SHOW STORY FUNCTION
  $scope.showStory = function(storyId) {
    $scope.loading = true;
    $rootScope.idStories = storyId;
    if($rootScope.idStories == 0) {
      Home.returnAllStrips($http,domain).then(function(strips) {
        $scope.loading = false;
        $scope.strips = strips.data;
      }).then(function(strips) {
        $scope.strips.forEach(function(strip) {
          Home.returnStripImage($http,domain,strip.id).then(function(stripImage) {
             $scope.loading = false;
             strip.file = stripImage.data[0].file;
          });
        });
      });
    }
    else {
      Home.returnStripsByStories($http,domain,$rootScope.idStories).then(function(strips) {
        $scope.loading = false;
        $scope.strips = strips.data;
      }).then(function(strips) {
        $scope.strips.forEach(function(strip) {
          Home.returnStripImage($http,domain,strip.id).then(function(stripImage) {
             $scope.loading = false;
             strip.file = stripImage.data[0].file;
          });
        });
      });
    }
  }
})


.controller('StripCtrl', function($scope,$ionicPopup,$location, $rootScope, $http, Home, $stateParams, $ionicSlideBoxDelegate) {
  var idStories = $rootScope.idStories;
  var domain = $stateParams.domain;
  var id = $stateParams.id;
  var count = 0;
  var pubDomain = false;
  $scope.domain = domain;
  $scope.data = [];
  // SET UP SLIDER
  $scope.data.sliderOptions = {
    initialSlide: id,
    direction: 'horizontal', //or vertical
  };
  $scope.data.sliderDelegate = null;
  $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
    $scope.slider = data.slider;
});
  $scope.$watch('data.sliderDelegate', function(newVal, oldVal) {
    if (newVal != null) {
      $scope.data.sliderDelegate.on('slideChangeEnd', function() {
        $scope.data.currentPage = $scope.data.sliderDelegate.activeIndex;
        $scope.$apply();
      });
    }
  });

  // STRIPS SECTION
  Home.returnNthStrips($http,domain,5,id-1)
  .then(function(strips) {
    $scope.strips = strips.data;
  })
  .then(function(strips) {
    $scope.strips.forEach(function(strip) {
      Home.returnStripImage($http,domain,strip.id)
      .then(function(stripImage) {
        strip.file = stripImage.data[0].file;
      });
    });
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function(event, data) {
    index = data.slider.activeIndex;
    // if we reached the end of the slider, we'll load data
    if(index == ($scope.strips.length-1)) {
      // first fetch new info, second fetch new images
      Home.returnNthStrips($http,domain,5,$scope.strips[index].id)
      .then(function(strips) {
        $scope.strips = $scope.strips.concat(strips.data);
    console.log($scope.strips);
      })
      .then(function(strips) {
        $scope.strips.forEach(function(strip) {
          try {
            if(strip.file.length === 0) {
              throw {message: 'no file yet'};
            }
          }
          catch(e) {
            Home.returnStripImage($http,domain,strip.id).then(function(stripImage) {
              strip.file = stripImage.data[0].file;
            });
          }
        });
      });
    }
  });

  // ADVERTISING SECTION
  Domainpub = Home.returnPubByDomain($http,domain);
  Lapinpub = Home.returnLapinPub($http);
  $scope.data = {}

  showConfirm = function(data) {
    var confirmPopup = $ionicPopup.confirm({
      title: '<p class=font lapinColor>'+data.name+'</p>',
      template:'<img class=imgPopUp ng-src=data:image/jpeg;base64,'+data.file+'>',
      cancelText:'Retour',
     okText:'Plus d\'info',
    });

    confirmPopup.then(function(res) {
      if(res) {
        window.open(data.link,'_system')
      }
    });
  };
})
