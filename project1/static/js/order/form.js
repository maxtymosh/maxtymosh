(function () {
    "use strict";

    angular.module('App')
        .controller('OrderController', ['$scope', '$rootScope', '$window', '$modal', 'server', 'orderer', 'options', 'commonCalculator', 'personalCalculator', 'wordsCalculator', 'localStorageService', _orderController])
        .controller('FilesController', ['$scope', '$templateCache', _filesController])
        .factory('orderer', ['$http', 'urls', _ordererService])
        .factory('commonCalculator', ['prices', 'basicCalculator', _commonCalculatorService])
        .factory('personalCalculator', [_personalCalculatorService]);

    function _orderController($scope, $rootScope, $window, $modal, server, orderer, options, commonCalculator, personalCalculator, wordsCalculator, localStorageService) {
        $scope.options = options;
        $scope.isAuthenticated = server.isAuthenticated;
        $scope.customer = server.customer;

        _modelInit();
        angular.extend($scope.model, localStorageService.get('order'));
        _applyPrice($scope.model);
        _pagesToWords();

        $scope.placeOrder = _placeOrder;
        $scope.loginAndPlaceOrder = _loginAndPlaceOrder;
        $scope.register = _register;
        $scope.pagesToWords = _pagesToWords;
        $scope.wordsToPages = _wordsToPages;

        $scope.$watch('model', function (newValue, oldValue) {
            _applyPrice(newValue);
            localStorageService.set('order', newValue);
        }, true);

        $scope.$on('auth', function (e, isAuthenticated) {
            $scope.isAuthenticated = isAuthenticated;
        });

        $scope.$on('customer', function (e, customer) {
            $scope.customer = customer;
            _applyPrice($scope.model);
        });

        function _authenticate(isAuthenticated, customer) {
            $rootScope.$broadcast('auth', isAuthenticated);
            $rootScope.$broadcast('customer', customer);
        }

        function _applyPrice(order) {
            $scope.commonPrice = commonCalculator.getTotal(order);
            $scope.price = personalCalculator.getTotal($scope.commonPrice, $scope.customer);
        }

        function _pagesToWords() {
            if ($scope.model.pages) {
                $scope.words = wordsCalculator.pagesToWords($scope.model.pages);
            }
        }

        function _wordsToPages() {
            if ($scope.words) {
                $scope.model.pages = wordsCalculator.wordsToPages($scope.words);
            }
        }

        function _loginAndPlaceOrder() {
            var modalInstance = $modal.open({
                templateUrl: 'loginTemplate.html',
                controller: 'LoginModalController'
            });

            modalInstance.result.then(function (data) {
                _authenticate(true, data);
                _placeOrder();
            });
        }

        function _placeOrder() {
            orderer.place($scope.model).success(function (data, status, headers, config) {
                _showSuccessModal().result.then(function () {
                    _modelInit();
                    $scope.form.$setPristine();
                    localStorageService.set('order', {});
                    $window.location.href = data;
                });
            }).error(function (data, status, headers, config) {
                $scope.error = "Could not create order: " + data;
            });
        }

        function _register() {
            var modalInstance = $modal.open({
                templateUrl: 'registerTemplate.html',
                controller: 'RegisterModalController'
            });

            modalInstance.result.then(function (data) {
                _authenticate(true, data);
            });
        }

        function _showSuccessModal() {
            return $modal.open({
                templateUrl: 'orderSuccessModalTemplate.html',
                controller: 'OkModalController',
                size: 'sm'
            });
        }

        function _guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

        function _modelInit() {
            $scope.model = { key: _guid(), space: 2, writerCategory: 0, sources: 0, slides: 0, extras: [] };
        }
    }

    function _filesController($scope, $templateCache) {
        Dropzone.options.files = {
            paramName: $scope.model.key
        };
    }

    function _ordererService($http, urls) {
        return {
            place: _place
        };

        function _place(order) {
            return $http.post(urls.order, order);
        }
    }

    function _commonCalculatorService(prices, basicCalculator) {
        return {
            getTotal: _getTotal
        };

        function _getTotal(params) {
            var basicPrice = basicCalculator.getTotal(params);
            var percent = 0;
            var extra_price = 0;

            if (params.space === 1) {
                basicPrice *= 2;
            }
            if (params.writerCategory && prices.writerCategory) {
                percent += prices.writerCategory(params.writerCategory);
            }
            angular.forEach(params.extras, function (val, idx) {
                var extra = prices.extras()[idx];
                if (val === true && extra) {
                    if (extra.unit === '%') {
                        percent += extra.price;
                    } else {
                        extra_price += extra.price;
                    }
                }
            });
            return basicPrice * _percentToMultiplier(percent) + extra_price;
        }

        function _percentToMultiplier(percent) {
            return percent / 100 + 1;
        }
    }

    function _personalCalculatorService() {
        return {
            getTotal: _getTotal
        };

        function _getTotal(price, customer) {
            var discount = customer && customer.discount ? customer.discount : 0;
            return price * (1 - discount / 100);
        }
    }
})();
