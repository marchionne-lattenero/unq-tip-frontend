'use strict';

/**
 * @ngdoc function
 * @name tipMarchionneLattenero.controller:ClosureCtrl
 * @description
 * # ClosureCtrl
 * Controller of the tipMarchionneLattenero
 */

angular.module('myApp')
  .controller('ClosureCtrl', function (FoodOrderClosureService, $rootScope) {
    return new ClosureController(FoodOrderClosureService, $rootScope);
  });

function ClosureController(FoodOrderClosureService, $rootScope) {
  var self = this;

  this.clousure = {
    user: "",
    from: 0,
    to: 0
  };

  this.clousures = [];

  $(function () {
    $('#from').datetimepicker();
    $('#to').datetimepicker({useCurrent: false});

    $("#from").on("dp.change", function (e) {
      $('#to').data("DateTimePicker").minDate(e.date);
      self.clousure.from = new Date(e.date).getTime();
    });

    $("#to").on("dp.change", function (e) {
      $('#from').data("DateTimePicker").maxDate(e.date);
      self.clousure.to = new Date(e.date).getTime();
    });
  });

  this.generateClosure = function () {
    self.clousure.user = $rootScope.userName;

    FoodOrderClosureService.generateClosure(self.clousure)
      .then(function successCallback(response) {
        self.clousures = response.data;
      });
  };

}
