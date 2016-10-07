var app = angular.module('catsvsdogs', []);
var socket = io.connect({transports:['websocket']});

var bg1 = document.getElementById('background-stats-1');
var bg2 = document.getElementById('background-stats-2');

app.controller('statsCtrl', function($scope){

  $scope.option_a = 'Beatles';
  $scope.option_b = 'Stones';

  var animateStats = function(percentA, percentB){
    bg1.style.width= percentA+"%";
    bg2.style.width = percentB+"%";
  };

  $scope.aPercent = 50;
  $scope.bPercent = 50;

  var updateScores = function(){
    socket.on('scores', function (data) {
      var a = parseInt(data[0] || 0);
      var b = parseInt(data[1] || 0);
      if(a + b > 0){
        var percentA = a/(a+b)*100;
        var percentB = 100-percentA;
      }
      else {
        var percentA = 50;
        var percentB = 50;
        $scope.total = 0
      }
      animateStats(percentA, percentB);

      $scope.$apply(function() {
         $scope.aPercent = percentA;
         $scope.bPercent = percentB;
         $scope.total = a + b
      });
    });
  };

  var init = function(){
    document.body.style.opacity=1;
    updateScores();

  };

  socket.on('message',function(data){
    console.log('init');
    init();
  });

  // Voting
  $scope.sendVote = function(value) {
    socket.emit('vote', value);
  }

});
