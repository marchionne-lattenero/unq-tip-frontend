'use strict';
/**
 * @ngdoc function
 * @name tipMarchionneLattenero.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the tipMarchionneLattenero
 */

angular.module('myApp')
  .controller('MainCtrl', function ($rootScope, $interval, ProductService, FoodOrderService, LoginService, CacheService, Notification) {

    var self = this;

    this.newFoodOrder = {
      productId: 0,
      userId: LoginService.getUserId()
    };

    $rootScope.products = [];

    self.autoRefresh = true;
    $rootScope.autoRefresh = self.autoRefresh;

    this.toggleAutoRefresh = function () {
      self.autoRefresh = !self.autoRefresh;
      $rootScope.autoRefresh = self.autoRefresh;
    };

    this.getProducts = function () {
      ProductService.getAll()
        .then(function successCallback(response) {
          $rootScope.products = response.data;
        });
    };

    this.getProducts();


    /*Acciones sobre pedidos de productos*/

    this.getCacheProducts = function () {
      return self.isFront() ?
        $rootScope.productsByUsers :
        $rootScope.cachePlaces[$rootScope.place].allProductsPending;
    };

    this.getPendingForProduct = function (productID) {
      var allPending = self.getCacheProducts();
      return (!allPending.hasOwnProperty(productID)) ? 0 : allPending[productID]
    };

    this.updatePending = function (productID, pending) {
      var allPending = self.getCacheProducts();
      allPending[productID] = self.getPendingForProduct(productID) + pending;
    };

    this.orderProduct = function (product) {
      var cant = 1;
      var msg = "Orden de Pedido realizado!";
      self.updatePending(product.id, cant);

      self.newFoodOrder.productId = product.id;
      FoodOrderService.order(self.newFoodOrder)
        .then(function successCallback(response) {
          self.NotificationSuccess(msg);
        }, function errorCallback(response) {
          self.NotificationError(msg);
          self.updatePending(product.id, -cant);
        });
    };

    this.cancelOrderProduct = function (product) {
      var cant = -1;
      var msg = "Cancelar Orden de Pedido!";
      self.updatePending(product.id, cant);

      self.newFoodOrder.productId = product.id;
      FoodOrderService.cancelorder(self.newFoodOrder)
        .then(function successCallback(response) {
          self.NotificationWarning(msg);
        }, function errorCallback(response) {
          self.NotificationError(msg);
          self.updatePending(product.id, -cant);
        });
    };

    this.cookProduct = function (product) {
      var cant = -1;
      var msg = "Producto Cocinado!";
      self.updatePending(product.id, cant);

      self.newFoodOrder.productId = product.id;
      FoodOrderService.cooked(self.newFoodOrder)
        .then(function successCallback(response) {
          self.NotificationSuccess(msg);
        }, function errorCallback(response) {
          self.NotificationError(msg);
          self.updatePending(product.id, cant * (-1));
        });
    };

    this.cancelCookProduct = function (product) {
      var cant = 1;
      var msg = "Cancelar Producto Cocinado!";
      self.updatePending(product.id, cant);

      self.newFoodOrder.productId = product.id;
      FoodOrderService.cancelcooked(self.newFoodOrder)
        .then(function successCallback(response) {
          self.NotificationWarning(msg);
        }, function errorCallback(response) {
          self.NotificationError(msg);
          self.updatePending(product.id, cant * (-1));
        });
    };

    this.NotificationSuccess = function (msg) {
      Notification.success(msg);
    };

    this.NotificationWarning = function (msg) {
      Notification.warning(msg);
    };

    this.NotificationError = function (msg) {
      Notification.error("Error al informar sobre: <br>" + msg);
    };

    this.isEnabledCookProduct = function (product) {
      return (self.getPendingForProduct(product.id) > 0);
    };

    this.isEnabledCancelOrderProduct = function (product) {
      return (self.getPendingForProduct(product.id) > 0);
    };

    this.isEnabledCancelCookProduct = function (product) {
      //return product[0].modifyStock;
      return true;
    };

    this.isEnabledOrderProduct = function (product) {
      return product.hasStock;
    };


    this.modifyStock = function (product) {
      var productBody = {
        productId: product.id,
        hasStock: !product.hasStock
      };
      ProductService.modifyStock(productBody)
        .then(function successCallback(response) {
          self.updateStock(product.id, response.data.hasStock);
        });
    };
    this.updateStock = function (productId, hasStock) {
      var product = $rootScope.products.filter(function (product) {
        return product.id === productId
      });
      product[0].hasStock = hasStock;
    };

    this.hasStock = function (product) {
      return product.modifyStock;
    };
    this.changePlace = function () {
      if (this.isFront()) {
        $rootScope.place = "COCINA"
      } else {
        $rootScope.place = "MOSTRADOR1"
      }

      var userPlace = {
        place: $rootScope.place,
        userId: LoginService.getUserId()
      };

      console.log(userPlace.place);

      LoginService.changeUserPlace(userPlace)
        .then(function successCallback(response) {
          console.log("Usuario registrado en: " + response.data)
        });
    };

    this.isFront = function () {
      return $rootScope.place != "COCINA";
    };

    this.isKitchen = function () {
      return !this.isFront();
    };

    this.cleanAllCache = function () {
      CacheService.cleanAll()
        .then(function successCallback(response) {
          console.log("Caches Limpias");
        });
    }

  });
