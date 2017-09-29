(function() {
	'use strict'

	angular
		.module("app")
		.directive("dirCustomer", CustomerDirective);

	function CustomerDirective() {
		return {
      restrict: "EA",
      templateUrl: "/customers.html"
    }
	};
})();
