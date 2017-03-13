'use strict';

// Declare core application module which pulls all the components together
var customerMgrApp = angular.module('customerMgrApp', ['ngRoute']);

customerMgrApp.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when("/home", {
            templateUrl: 'js/home/home.html'
        })
        .when("/customers", {
            templateUrl: 'js/customers/customers.html',
            controller: 'customersController'
        })
        .when("/customers/:id", {
            templateUrl: 'js/customers/editCustomer.html',
            controller: 'editCustomerController'
        })
        .when("/login", {
            templateUrl: 'js/login/login.html',
            controller: 'loginController'
        })
        .when("/about", {
            templateUrl: 'js/about/about.html'
        })
        .otherwise("/login");
}]);

customerMgrApp.service('customerService', ['$http', '$q', function ($http, $q) {
    var customers;
    this.setCustomers = function (customersDetails) {
        customers = $q.when({ data: customersDetails });
    };

    this.getCustomers = function () {
        if (!customers) {
            customers = $http.get('http://jsonplaceholder.typicode.com/users');
        }
        return customers;
    };
}]);

customerMgrApp.controller('customersController', ['$scope', 'customerService', '$location', function ($scope, customerService, $location) {
    $scope.searchText = "";
    $scope.vw = {
        cards: true
    };

    $scope.toggle = function () {
        $scope.vw.cards = !$scope.vw.cards;
    };

    $scope.remove = function (deleteCustomer) {
        $scope.customers = _.filter($scope.customers, function (cust) {
            return cust.id !== deleteCustomer.id;
        });
    };

    $scope.edit = function (customer) {
        $location.path('/customers/' + customer.id);
    }

    $scope.addCustomer = function () {
        $location.path('/customers/0');
    };
    var customerPromise = customerService.getCustomers();

    customerPromise.then(function (customers) {
        $scope.customers = customers.data;
    });

}]);

customerMgrApp.directive('usercard', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/usercard/usercard.html'
    }
});
customerMgrApp.directive('customerlist', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/customers/customerslist.html'
    }
});

customerMgrApp.service('loginService', ['$http', function ($http) {
    this.getUser = function () {
        return $http.get('api/user.json');
    };

}]);

customerMgrApp.controller('loginController', ['$scope', 'loginService', '$location', function ($scope, loginService, $location) {

    $scope.login = function () {
        loginService.getUser().then(function (user) {
            if (user.data.username === $scope.username && user.data.password === $scope.password) {
                $location.path('/customers');
            }
            else {
                console.log("UN AUTHENTICATED");
            }
        });
    };
}]);

customerMgrApp.controller('editCustomerController', ['$scope', '$routeParams', 'customerService', function ($scope, $routeParams, customerService) {
    var customers, updateCustomer;

    customerService.getCustomers().then(function (customersDetails) {
        customers = customersDetails.data;
        updateCustomer = _.find(customers, function (customer) {
            return customer.id == $routeParams.id;
        });

        $scope.currentCustomer = JSON.parse(JSON.stringify(updateCustomer));
    });

    $scope.edit = function (updatedCustomer) {
        customers = _.filter(customers, function (customer) {
            return customer.id !== $scope.currentCustomer.id
        });
        if (!updatedCustomer.id) {
            updatedCustomer.id = customers.length + 1;
        }
        customers.push(updatedCustomer);
        customerService.setCustomers(customers);
    }
}]);