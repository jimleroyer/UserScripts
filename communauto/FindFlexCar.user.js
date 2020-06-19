// ==UserScript==
// @name         FindFlexCar
// @namespace    https://github.com/jimleroyer/UserScripts
// @version      0.1
// @description  Find back a Flex car by ID from the Communauto website.
// @author       jlr
// @copyright    2020+, Jimmy Royer (https://twitter.com/jimleroyer)
// @license      CC-BY-NC-SA-4.0; https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode
// @license      GPL-3.0-or-later; http://www.gnu.org/licenses/gpl-3.0.txt
// @updateURL    https://github.com/jimleroyer/UserScripts/raw/master/communauto/FindFlexCar.user.js
// @match        https://www.reservauto.net/Scripts/Client/Mobile/Default.asp*
// @grant        unsafeWindow
// ==/UserScript==
/* global map,google,$ */

(function() {
    'use strict';

    var that = {};
    var map = null;
    var markerMgr = null;

    waitForVar('map', lateBinding);

    $.ajax({url: '/WCF/LSI/Cache/LSIBookingService.svc/GetVehicleProposals',
			type: 'GET',
			dataType: 'json',
			crossdomain: true,
			contentType: 'application/json; charset=utf-8',
			success: function (data) {
                that.vehicules = data.Vehicules;
            }
    });

    function init() {
        createControls();
    }

    function lateBinding() {
        map = unsafeWindow.map;
        markerMgr = unsafeWindow.mgr;
        map.controls[google.maps.ControlPosition.RIGHT_TOP].push($('#ctrl-search-car').get(0));
    }

    function createControls() {
        // var stations = $('#ShowStations');
        var html = `<div id="placeholder-search-car" style="display: none;">
          <div id="ctrl-search-car" style="padding: 3px; background-color: white;">
            <div style="font-weight: bold;">Search for a Flex Car:</div>
            <div style="padding: 2px;">
              <input type="text" value="" id="textCarId" placeholder="Flex Car ID..." />
              <input type="button" value="Search" id="btnSearchCar"  />
            </div>
          </div>
        </div>`;

        $('body').append(html);
        $('#btnSearchCar').on('click', function() { searchCar(textCarId.value); });
        $('#textCarId').on('keyup', function(event) { keyUpEnter(event, '#btnSearchCar'); });
    }

    function keyUpEnter(event, button) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            // Cancel the default action, if needed
            event.preventDefault();
            // Trigger the button element with a click
            $(button).click();
        }
    }

    function searchCar(carId) {
        if (!Number.isInteger(parseInt(carId))) {
            alert('Car ID should be a number.');
            return;
        }

        if (!that || !that.vehicules) {
            alert('The vehicules database did not initialize.');
            return;
        }

        console.log('searching for car id ' + carId);

        var found = that.vehicules.find( v => v.Name.trim() == carId);
        if (!found) {
            var msg = 'Could not find car #' + carId + '. The car is probably in service at this moment. Try again later.';
            console.log(msg);
            alert(msg);
        } else {
            console.log('found car ' + carId + ': ' + JSON.stringify(found));
            var lat = found.Position.Lat;
            var long = found.Position.Lon;
            var latlng = new google.maps.LatLng(lat, long);
            map.setCenter(latlng);
            var marker = markerMgr.getMarker(lat, long, 15);
            google.maps.event.trigger(marker, 'click');
        }
    }

    function waitForVar(variable, callback) {
      var interval = setInterval(function() {
        if (unsafeWindow[variable]) {
          clearInterval(interval);
          callback();
        }
      }, 200);
    }

    init();

})();
