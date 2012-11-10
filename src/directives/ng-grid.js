﻿ngGridDirectives.directive('ngGrid', function ($compile, GridService, SortService) {
    var ngGrid = {
        scope: true,
        compile: function () {
            return {
                pre: function ($scope, iElement, iAttrs) {	
                    var $element = $(iElement);
                    var options = $scope[iAttrs.ngGrid];
                    var gridDim = new ng.Dimension({ outerHeight: $($element).height(), outerWidth: $($element).width() });
                    var grid = new ng.Grid($scope, options, gridDim, SortService);
                    var htmlText = ng.defaultGridTemplate(grid.config);
                    GridService.StoreGrid($element, grid);
                    grid.footerController = new ng.Footer($scope, grid);
                    ng.domUtility.measureGrid($element, grid, true);
					
					/*if (iAttrs.ngGridData) {
						$scope.$watch(iAttrs.ngGridData, function (data) {
                            if (!data) return;
							grid.sortedData = $.extend([], data);
							grid.rowFactory.sortedDataChanged();
							grid.refreshDomSizes();					
                        });
					}*/
                    // if it is a string we can watch for data changes. otherwise you won't be able to update the grid data
                    if (typeof options.data == "string") {
                        $scope.$parent.$watch(options.data, function (data) {
                            if (!data) return;
                            grid.sortedData = typeof data == "function" ? data : function() { return data; };
                            grid.rowFactory.sortedDataChanged();
                            grid.refreshDomSizes();
                        });
                    }
                    //set the right styling on the container
                    $element.addClass("ngGrid")
                        .addClass("ui-widget")
                        .addClass(grid.gridId.toString());
                    //call update on the grid, which will refresh the dome measurements asynchronously
                    grid.initPhase = 1;
                    iElement.append($compile(htmlText)($scope));// make sure that if any of these change, we re-fire the calc logic
                    //walk the element's graph and the correct properties on the grid
                    ng.domUtility.assignGridContainers($element, grid);
                    //now use the manager to assign the event handlers
                    GridService.AssignGridEventHandlers($scope, grid);
                    //initialize plugins.
                    angular.forEach(options.plugins, function (p) {
                        p.init($scope.$new(), grid, { GridService: GridService, SortService: SortService });
                    });
                    grid.update();
                    return null;
                }
            };
        }
    };
    return ngGrid;
});