/*

Inselkampf helper: shows you the limits of the game!
Copyright (C) 2007  Tom Muylle

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.

http://www.gnu.org/licenses/gpl.html

*/

if( location.hostname.indexOf('213.203.194.123') != -1 ) {

	opera.defineMagicVariable(
		'DateHelper',
		function (curVal) {
		if( curVal ) {
			curVal.getDuration = function (seconds) {
				if (seconds == 0) {
					return "Finished";
				}

				var msg = "";
				var days, hours, minutes;
				if (seconds >= 86400) { days = Math.floor(seconds / 86400); seconds = seconds - (days * 86400); }
				if (seconds >= 3600) { hours = Math.floor(seconds / 3600); seconds = seconds - (hours * 3600); } 
				if (seconds >= 60) { minutes = Math.floor(seconds / 60); seconds = seconds - (minutes * 60); }
				
				if (days > 0) {
					msg += days + " " + TextHelper.pluralize( days, "day", "days" ) + " ";
	 			}
				if (hours > 0) {
					msg += hours + " " + TextHelper.pluralize ( hours, "hour", "hours" ) + " ";
				}
				if (minutes > 0) {
					msg += minutes + " " + TextHelper.pluralize( minutes, "minute", "minutes" ) + " "; 
				}
				if (seconds > 0) {
					msg += seconds + " " + TextHelper.pluralize( seconds, "second", "seconds" );
				}
				return msg;
	    	};
	    	
	    	curVal.toSeconds = function (duration) {
	    		var date = new Date(duration);
	    		return (date.getHours() * 3600) + (date.getMinutes() * 60) + (date.getSeconds());
	    	};
	    	
	    	curVal.getDateTime = function (time) {
				var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
				var date = new Date( time );
				return months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + ( date.getHours() < 10 ? "0" + date.getHours() : date.getHours() ) + ":" + ( date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes() ) + ":" + ( date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds() );
	    	};
	    }
	    return curVal;
	  },
	  null
	);

	document.addEventListener(
		'load',
		function (e) {
	    	if( !document.body ) { return; }
	    	var startStoreClock = false;
    		var gold, stone, wood;
			var goldprod, stoneprod, woodprod;
			var minesunknown = false;
			
			
			// http://4umi.com/web/javascript/array.htm
			// Array.indexOf( value, begin, strict ) - Return index of the first element that matches value
			Array.prototype.indexOf = function( v, b, s ) {
				for( var i = +b || 0, l = this.length; i < l; i++ ) {
					if( this[i]===v || s && this[i]==v ) { return i; }
				}
				return -1;
			};
			
			// Array.unique( strict ) - Remove duplicate values
			Array.prototype.unique = function( b ) {
				var a = [], i, l = this.length;
				for(i=0; i < l; ++i) {
					if (a.indexOf(this[i], 0, b) < 0) { a.push(this[i]); }
				}
				return a;
			};
			
			
			var clocks = new Array();
			for( var i = 0, oElement; oElement = document.scripts[i]; ++i ) {
				// deze regexp werkt niet global! maar als ik g vlag bijvoeg, wil het helemaal niet meer matchen.
				// ik schuif schuld op opera.
				var a = oElement.innerText.match(/new Clock\(\s*\w+,\s*e\(\s*'(\S+)'\s*\),\s*(\d+)\s*\);/i);
				if (a) {
					clocks[a[1]] = parseInt(a[2]);
				}
			}
			
/*			//add titles to the images you might find
			//does not have much use, Sven should have made it better!
			var imtitles = new Array();
			imtitles['gold.gif'] = 'Gold';
			imtitles['stones.gif'] = 'Stone';
			imtitles['wood.gif'] = 'Lumber';
			
			var imgs = document.images;
			for (var im = 0; im < imgs.length; ++im) {
				var imsrc = imgs[im].src;
				var filestart = imsrc.lastIndexOf("/");
				filestart = (filestart == -1? 0 : filestart + 1);
				var filename = imsrc.substr(filestart);
				if (imtitles[filename]) {
					imgs[im].title = imtitles[filename];
				}
			}
*/			
			
			var tables = document.getElementsByTagName('table');
			for ( var i = 0, oElement; oElement = tables[i]; ++i) {
				if (tables[i].className == 'table') { // list page, alliance pages, random island page
					var rows = tables[i].getElementsByTagName('tr');
					var numcells = rows[0].children.length;  // 6 for resources, 4 for fleet, 3 for alliance pages

					// add a row with totals
					if (rows[0].children[0].innerText == 'Island' && rows[0].children[numcells-1].width == '1%') { // list page only
						var cells2sum;
						if (numcells == 6) {
							cells2sum = [1, 2, 3];  // starting at 0 of course
						}
						else {
							cells2sum = [1, 2];
						}
						
						var totalsisles = new Array();
						for (var k = 0; k < cells2sum.length; ++k) { // boring init
							totalsisles[k] = 0;
						}
						for (var r = 1; r < rows.length; ++r) {
							for (var k = 0; k < cells2sum.length; ++k) {
								totalsisles[k] += parseInt(rows[r].children[cells2sum[k]].innerText);
							}
						}
						
						var newtfoot = tables[i].createTFoot(); //Create new tfoot
						var newtfootrow = newtfoot.insertRow(0); //Define a new row for the tfoot
						newtfootrow.insertCell(0).innerHTML = "Totals"; //Define a new cell for the tfoot's row
						for (var r = 0; r < totalsisles.length; ++r) {
							newtfootrow.insertCell(r+1).innerHTML = totalsisles[r];
						}
						for (var r = totalsisles.length + 1; r < numcells; ++r) {
							newtfootrow.insertCell(r); // visual appearance
						}
					}
					
					else if (rows[0].children[0].innerText == 'New order') { // harbour page, orders
						// preparation to show how much units and resources you can ship
						var newrow = tables[i].insertRow(rows.length - 1);
						newrow.insertCell(0).innerHTML = "Units: <span id='orders_units'>0</span> Resources: <span id='orders_res'>0</span>";
						newrow.insertCell(1); // visuals
					}
					
					else if (rows[0].children[0].innerText == 'Transport' || rows[0].children[0].innerText == 'Attack' ) { // shipping orders
						for (var r = 1; r < rows.length; ++r) {
							if (rows[r].children[0].innerHTML.toLowerCase().indexOf('<b>army (') == 0) {
								rows[r].children[0].innerHTML += " (<span id='orders_units'>0</span>)";
							}
							else if (rows[r].children[0].innerHTML.toLowerCase().indexOf('<b>resources (') == 0) {
								rows[r].children[0].innerHTML += " (<span id='orders_res'>0</span>)";
							}
						}
					}
					
					else if (rows[0].children[0].innerText == 'Members') { // alliance, members page
						// make a list with all members in mailable format at bottom
						// - collect in array
						// - divide in pieces of 50
						// - add mail-button per segment
						var allmembers = new Array();
						for (var r = 2; r < rows.length; ++r) { // 2 to skip 'Members' and 'Player' rows
							allmembers.push(rows[r].children[0].innerText.split(' ')[0]);
						}
						
						var newDiv = document.createElement('div');
						newDiv.id = 'membersinfo';
						
						var msg = '<h3>' + allmembers.length + ' members</h3>';
						msg += '<table><tr><td width="10"></td><td><b>Members</b></td></tr>';
						for (var i = 0, sc = 1; i < allmembers.length; i += 50, ++sc) {
							var segment = allmembers.slice(i, i+50);
							msg += "<tr><td>" + sc + "</td><td>" + segment.join(' ; ') + "</td></tr>";
						}
						
						msg += '</table>';
		
						newDiv.innerHTML = msg;
						document.body.appendChild(newDiv);
					}
				}
			}

			var cells = document.getElementsByTagName('td');
			
			//gather resources and duration of things and put them in arrays
			// golds, woods, stones[index of row] = amount
			// items[index of row] = name of what the thing is
			// durs['name of thing'] = secs
			// hulpfunctie: DateHelper.toSeconds(durationstring)
			// overloop dus nog eens alle cellen
			var golds = new Array();
			var stones = new Array();
			var woods = new Array();
			var items = new Array();
			var durs = new Array();
			for( var i = 0, oElement; oElement = cells[i]; i++ ) {
				var a = oElement.innerText.match(/\s*((?:\w|\s|-)+)(?: \(Level \d+\))?(?:\r\n|\r|\n).*Gold:\s+(\d+)\s+Stone:\s+(\d+)\s+Lumber:\s+(\d+)\s+Duration:\s+(\d+:\d+:\d+)/i);

				if (a) {
					golds[golds.length] = a[2];
					stones[stones.length] = a[3];
					woods[woods.length] = a[4];
					items[items.length] = a[1];
					durs[a[1] + 's'] = DateHelper.toSeconds(a[5]);
				}
			}

			
			// go over again and add new info
			for( var i = 0, oElement; oElement = cells[i]; i++ ) {
			
				// TODO: deze cellen ook uitbreiden met info, maar enkel op de main pagina waar je mijnenlevels en ook storehouse level hebt.
				// TODO 2: als mijnen of storehouse niet gebouwd zijn, toch iets tonen (main house zal ook wel beperkingen hebben, 1000 of zo)

				if( oElement.innerHTML.indexOf("gold.gif") > 0 ) {
					gold = parseInt(oElement.innerText);
					oElement.innerHTML += "<span id='goldspan'></span>";
				}
				else if( oElement.innerHTML.indexOf("stones.gif") > 0 ) {
					stone = parseInt(oElement.innerText);
					oElement.innerHTML += "<span id='stonespan'></span>";
				}
				else if( oElement.innerHTML.indexOf("wood.gif") > 0 ) {
					wood = parseInt(oElement.innerText);
					oElement.innerHTML += "<span id='woodspan'></span>";
				}
				else if( oElement.innerHTML.indexOf("To here") > 0) {
					var a = oElement.innerHTML.match(/'(.*index\.php\?s=.*)&p=b7&form\[pos1\]=(\d+)&form\[pos2\]=(\d+)&form\[pos3\]=(\d+)'/i);
					if (a) {
						oElement.innerHTML += "<form action='" + a[1] + "&p=map&zoom=&pos1=" + a[2] + "&pos2=" + a[3] + "' method='post'><input type='submit' value='On map'></form>";
						oElement.innerHTML += "<form action='" + a[1] + "&p=calculator&sub=distance' method='post'><input type='hidden' value='" + a[2] + "' name='form[pos1]'><input type='hidden' value='" + a[3] + "' name='form[pos2]'><input type='hidden' value='" + a[4] + "' name='form[pos3]'><b>Distance and Arrival</b>, at <input type='text' value='5' name='form[speed]' size='2'> knots: <input type='submit' value='Calculate'></form>";
					}
					
				}
				
				else {
					//TODO: als mijn nog nooit gebouwd is, staat ze wel in lijst, maar zonder (level ..)!
					var a = oElement.innerText.match(/(.+) \(Level (\d+)\)/);
					if (a) {
						if (a[1].indexOf("Gold Mine") > 0) {
							goldprod = Math.floor(8 * Math.pow(1.2, parseInt(a[2])));
							oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + goldprod + "/h)");
							cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(8 * Math.pow(1.2, parseInt(a[2])+1));
						}
						else if (a[1].indexOf("Stone Quarry") > 0) {
							stoneprod = Math.floor(5 * Math.pow(1.2, parseInt(a[2])));
							oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + stoneprod + "/h)");
							cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(5 * Math.pow(1.2, parseInt(a[2])+1));
						}
						else if (a[1].indexOf("Lumber Mill") > 0) {
							woodprod = Math.floor(6 * Math.pow(1.2, parseInt(a[2])));
							oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Produces " + woodprod + "/h)");
							cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(6 * Math.pow(1.2, parseInt(a[2])+1));
						}
						else if (a[1].indexOf("Storehouse") > 0) {
							// mines at max don't show, but they still produce
							if (!goldprod) goldprod = 306;
							if (!stoneprod) stoneprod = 191;
							if (!woodprod) woodprod = 230;

							var stores = Math.floor(Math.pow(1.2, parseInt(a[2])) * 1000);
							cells[i+1].innerHTML = cells[i+1].innerHTML + "<br>Next: " + Math.floor(Math.pow(1.2, parseInt(a[2]) + 1) * 1000);
							var goldin = Math.round((stores - gold) * 3600 / goldprod);
							var stonein = Math.round((stores - stone) * 3600 / stoneprod);
							var woodin = Math.round((stores - wood) * 3600 / woodprod);
							oElement.innerHTML = oElement.innerHTML.replace(/(\(Level \d+\))/, "$1 (Stores " + stores + ")") + "<hr>Gold reached in <span id='goldin'>" + DateHelper.getDuration(goldin) + "</span><br>Stone reached in <span id='stonein'>" + DateHelper.getDuration(stonein) + "</span><br>Wood reached in <span id='woodin'>" + DateHelper.getDuration(woodin) + "</span>";
							startStoreClock = true;
						}
					}
				}
			}

			// mines at max don't show, but they still produce
			if (!goldprod) { goldprod = 306; minesunknown = true; }
			if (!stoneprod) { stoneprod = 191; minesunknown = true; }
			if (!woodprod) { woodprod = 230; minesunknown = true; }
			
			
			// now do it again, but update the times needed
			for( var i = 0, oElement; oElement = cells[i]; i++ ) {
				var a = oElement.innerHTML.match(/(red|ff0000).*(Upgrade to level|Research|Build)/i);
				if (a) {
					// als dit gevonden, dan in vorige cell kijken hoeveel nodig was
					var goldwait = (golds[(i-4)/2] - gold) * 3600 / goldprod;
					var stonewait = (stones[(i-4)/2] - stone) * 3600 / stoneprod;
					var woodwait = (woods[(i-4)/2] - wood) * 3600 / woodprod;
					var longestwait = Math.round(Math.max(goldwait, stonewait, woodwait));
					var msg;
					if (minesunknown) { msg = "Ass. mines 20, upgrade"; } else { msg = "Upgrade"; }
					var needed = "<br>" + msg + " in <span id='upgr" + i + "'>" + DateHelper.getDuration(longestwait) + "</span>";
					//" + DateHelper.getDuration(longestwait) + "
					cells[i - 1].innerHTML = cells[i - 1].innerHTML + needed;
					new Clock( timer, document.getElementById("upgr" + i), longestwait );
				}
			}
			
			
			// overloop links, op main page zal je hopelijk storehouse vinden
			if (document.location.href.indexOf('&p=main') > -1) {
				var maxStorage = 1000; // just a main house
				for (var i = 0; i < document.links.length; ++i) {
					if (document.links[i].href.indexOf('&p=b8') > -1) {
						var storehouselevel = parseInt(document.links[i].text.match(/\(Level (\d+)\)$/)[1]);
						maxStorage = Math.floor(Math.pow(1.2, storehouselevel) * 1000);
						break;
					}
				}
				document.getElementById('goldspan').innerText = ' / ' + maxStorage;
				document.getElementById('stonespan').innerText = ' / ' + maxStorage;
				document.getElementById('woodspan').innerText = ' / ' + maxStorage;
			}
			
			
			// bij barracks en harbour:
			// bij invoer van een waarde in een inputveld zal javascript starten dat waarde uit invoerveld neemt, samen met gold, stone, lumber, duration uit nog eens vorige td, en dat berekent hoeveel en hoe lang dit duurt om te bouwen, aangenomen dat er genoeg beschikbaar is
			// bepaalde elementen zullen rood zijn als nog niet genoeg aanwezig is (goud bvb), andere groen (steen bvb)
			// al die infotekst zal door een javascript gemaakt worden, en onder de req-lijn van de info-td geplaatst worden.

			var inputs = document.getElementsByTagName('input');
			
			for (var i = 0, oElement; oElement = inputs[i]; ++i) {
				//alert(oElement.type);
				if (oElement.type == 'text') {
					if (oElement.name == 'number') {
						oElement.id = (i / 2) + 'input';
						theCell = cells[(3 + (i * 1.5))];
						theCell.innerHTML += "<b>Needed:</b> Gold: <span id='" + (i/2) + "gold' style='color: green'>0</span> Stone: <span id='" + (i/2) + "stone' style='color: green'>0</span> Lumber: <span id='" + (i/2) + "wood' style='color: green'>0</span><br><b>Duration:</b> <span id='" + (i/2) + "dur'>-</span><br><b>Ass. mines 20:</b> <span id='" + (i/2) + "needed'>-</span>";
						
						oElement.onkeyup = function() {
							var r = parseInt(this.id);
							document.getElementById(r + 'gold').innerText = this.value * golds[r];
							if (gold < this.value * golds[r]) { document.getElementById(r + 'gold').style.color = 'red'; } else { document.getElementById(r + 'gold').style.color = 'green'; }
							document.getElementById(r + 'stone').innerText = this.value * stones[r];
							if (stone < this.value * stones[r]) { document.getElementById(r + 'stone').style.color = 'red'; } else { document.getElementById(r + 'stone').style.color = 'green'; }
							document.getElementById(r + 'wood').innerText = this.value * woods[r];
							if (wood < this.value * woods[r]) { document.getElementById(r + 'wood').style.color = 'red'; } else { document.getElementById(r + 'wood').style.color = 'green'; }
							
							var mydur = this.value * durs[items[r] + 's'];
							mydur = (mydur == 0 ? '-' : (DateHelper.getDuration(mydur) + '<br>&nbsp;&nbsp;&nbsp;&nbsp;(' + DateHelper.getDateTime( new Date().getTime() + mydur * 1000 ) + ')'));
							document.getElementById(r + 'dur').innerHTML = mydur;
							
							var goldwait = ((this.value * golds[r]) - gold) * 3600 / goldprod;
							var stonewait = ((this.value * stones[r]) - stone) * 3600 / stoneprod;
							var woodwait = ((this.value * woods[r]) - wood) * 3600 / woodprod;
							var longestwait = Math.round(Math.max(goldwait, stonewait, woodwait));
							// var myclock = null;
							var myneeded = '-';
							if (longestwait > 0) {
								// TODO: clock hieronder werkt wel, maar je kan ze niet weg krijgen!
								// oplossing: wegdoen van lijst observers, maar nogal moeilijk ;-)
								// myclock = new Clock( timer, document.getElementById(r + 'needed'), longestwait );
								
								myneeded = DateHelper.getDuration(longestwait) + '<br>&nbsp;&nbsp;&nbsp;&nbsp;(' + DateHelper.getDateTime( new Date().getTime() + longestwait * 1000 ) + ')';
							}
							document.getElementById(r + 'needed').innerHTML = myneeded;
	
						};
					}
					else if (oElement.name == 'form[pos1]') {
						// harbour, entering coords
						// when pasting something similar to coords in the first box, this will distribute them over the other two boxes automatically
						oElement.onkeyup = function () {
							var a = this.value.match(/(\d+):(\d+):(\d+)/);
							if (a) {
								this.form.elements[0].value = a[1];
								this.form.elements[1].value = a[2];
								this.form.elements[2].value = a[3];
							}
						}
					}
					
					// update the unit and resources count
					else if (oElement.name == 'form[s1]') { //LWS
						oElement.title = '5 units';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[s2]') { //LMS
						oElement.title = '500 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[s3]') { //SWS
						oElement.title = '2 units';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[s4]') { //SMS
						oElement.title = '200 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[s5]') { //Colo
						oElement.title = '5000 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					
					// also on ordering page
					// but it needs a few tricks ;-)
					else if (oElement.name == 'form[u1]') { //stone thrower
						oElement.title = '1 units';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[u2]') { //spearfighter
						oElement.title = '1 units';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[u3]') { //archer
						oElement.title = '1 units';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					// TODO: check catapults
					else if (oElement.name == 'form[gold]') { //gold
						oElement.title = '1 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[stones]') { //stone
						oElement.title = '1 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
					else if (oElement.name == 'form[wood]') { //lumber
						oElement.title = '1 resources';
						oElement.onkeyup = function () { updateUnitsResources(this.form); }
					}
				}

			}
			

			// overloop divs
			var startOrderClock = false;
			var orderTotalTime = 0;
			var divs = document.getElementsByTagName('div');
			for( var i = 0, oElement; oElement = divs[i]; i++ ) {
				
				// add a few links
				if (oElement.className == "signout") {
					oElement.innerHTML = "<a href='http://www.inselkampf.com/help.htm' target='_blank'>Help</a>&nbsp;&nbsp;" + oElement.innerHTML;
				}
				
				// barracks & harbour
				if (oElement.innerText.indexOf("All orders:") > 0) {
					var a = oElement.innerText.match(/All orders: (.*)\s{2,}Cancel/i);
					if (a) {
						var b = a[1].split(/, /);
						var oo = '';
						for (var rr = 0; rr < b.length; rr++) {
							c = b[rr].match(/(\d+) (.*)/); // (5) (large warship/ships)
							if (rr == 0) {
								// eerste order - 1 doen, omdat hij al bezig is
								c[1] -= 1;
								orderTotalTime += clocks['clock_0']; // + wat al gedaan is van deze eerste order
							}
							var singlecost = durs[c[2]]; if (!singlecost) { singlecost = durs[c[2] + 's']; }
							orderTotalTime += (c[1] * singlecost);
						}
					}
					
					if (orderTotalTime != clocks['clock_0']) {
						// allemaal omdat gewoon innerHTML += niet werkt (breekt id van Duration: of zo)
						var theBR = document.createElement('br');
						var theBOLD = document.createElement('b');
						var theInfoText = document.createTextNode('Done in: ');
						var theTotalDuration = document.createElement('span');
						var theTotalDurationText = document.createTextNode(DateHelper.getDuration(orderTotalTime));
						theTotalDuration.setAttribute('id', 'ordersdonein');
						theTotalDuration.appendChild(theTotalDurationText);
						theBOLD.appendChild(theInfoText);
						theBOLD.appendChild(theTotalDuration);
						oElement.appendChild(theBR);
						oElement.appendChild(theBOLD);
						startOrderClock = true;
					}
					
				}
				
			}
			
			
			var bolds = document.getElementsByTagName('b');
			for( var i = 0, oElement; oElement = bolds[i]; i++ ) {
				var buildingaction = '';
				var a = oElement.innerText.match(/^Amount delivered per hour: (\d+) units$/);
				if (a) { // mines
					// info per day
					oElement.innerHTML += "<br>Amount delivered per day: " + (parseInt(a[1]) * 24) + " units";
					buildingaction = 'Produces';
				}
				else {
					a = oElement.innerText.match(/^Capacity per resource: (\d+) units/); // storehouse
					if (a) { buildingaction = 'Stores'; }
					else {
						a = oElement.innerText.match(/^Offense level: (\d+)/); // stone wall
						if (a) { buildingaction = 'Off/Defence'; }
						else {
							a = oElement.innerText.match(/^Visibility: (\d+,?\d*) nautical miles$/); // watch-tower
							if (a) { buildingaction = 'Sees'; a[1] = a[1].replace(/,/, '.'); }
						}
					}
				}
				
				if (buildingaction) {
					var buildinfo = new Array(); // array with build factors, floor(factor*1.2^level)
					// Production rate, factor, Gold, Stone, Lumber
					buildinfo['goldmine'] = [8, 1.2, 75, 50, 50];
					buildinfo['stonequarry'] = [5, 1.2, 50, 50, 50];
					buildinfo['lumbermill'] = [6, 1.2, 75, (175/3), 50];
					buildinfo['storehouse'] = [1000, 1.2, 75, 50, 75];
					buildinfo['stonewall'] = [50, 1.25, (250/3), 125, 150];
					buildinfo['watch-tower'] = [1, 1.2, 25, 75, (125/3)];
					
					var thisbuilding = bolds[i-1].innerText.toLowerCase().replace(/\s/g, '');
					var currlevel = Math.round(Math.log(parseFloat(a[1]) / buildinfo[thisbuilding][0]) / Math.log(buildinfo[thisbuilding][1]));
					bolds[i-1].innerHTML += ' (Level ' + currlevel + ')';
					
					// now add some more useful info, like building costs for next levels
					var theDIV = document.createElement('div');
					var msg = '<table class="table"><caption>Building costs</caption><tr><td><b>Level</b></td><td><b>Gold</b></td><td><b>Stone</b></td><td><b>Lumber</b></td><td><b>' + buildingaction + '</b></tr>';
					
					for (var cl = currlevel + 1; cl <= 20; ++cl) {
						msg += '<tr><td>' + cl + '</td><td>' + Math.floor(buildinfo[thisbuilding][2] * Math.pow(buildinfo[thisbuilding][1], cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][3] * Math.pow(buildinfo[thisbuilding][1], cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][4] * Math.pow(buildinfo[thisbuilding][1], cl)) + '</td><td>' + Math.floor(buildinfo[thisbuilding][0] * Math.pow(buildinfo[thisbuilding][1], cl)) + '</td></tr>';
					}
					
					msg += '</table>';
					theDIV.innerHTML = msg;
					if (currlevel < 20) {
						oElement.parentNode.appendChild(document.createElement('br'));
						oElement.parentNode.appendChild(document.createElement('br'));
						oElement.parentNode.appendChild(theDIV);
					}
				}
			}
			
			
			// append info to map page
			var areas = document.getElementById('map');
			if (areas) {
				areas = areas.children;
			
				var alliances = new Array();
				var unruled = new Array();
				
				for (var i = 0; i < areas.length; ++i) {
					// var temparr = areas[i].title.split('\n');	// werkt in IE, niet in opera
					// attention! this regular expression will be fooled if someone names his island funny!
					var a = areas[i].title.match(/Island: (.*?)Position: (\d+:\d+:\d+)(?:Ruler: (.*?))?(?:Alliance: (\[\S+\]))?Score: (\d+)/);
					// a[0] = alles
					// a[1] = island name
					// a[2] = position
					// a[3] = ruler name
					// a[4] = alliance name
					// a[5] = score
					if (a) {
						//	alert(areas[i].title + '\n\n' + a.length);
					
						if (!a[3]) { // als geen ruler, dan is het rulerless
							var msg = '<a href="' + areas[i].href + '">' + a[2] + "</a>";
							if (a[5] != 1) { msg += ' (' + a[5] + ')'; } // score
							unruled.push(msg);
						}
						else {
							var alli = (a[4]?a[4]:'None');
							if (!alliances[alli]) { alliances[alli] = new Array(); };
							alliances[alli].push(a[3]); // ruler name
						}
					
						//	document.writeln(a.join(' ooga ') + "<br>");
					}
				}
				
				var newDiv = document.createElement('div');
				newDiv.id = 'mapinfo';
				
				var msg = '<h3>' + areas.length + ' islands</h3>';
				msg += '<table><tr><td><b>Alliance</b></td><td><b>Members</b></td><td><b># Islands</b></td></tr>';
				
				for (var alliance in alliances) {
					if (typeof alliances[alliance] != 'function') { // om de prototypes niet te hebben, christus!
						msg += '<tr><td>' + alliance + '</td><td>' + alliances[alliance].unique().join(' ; ') + '</td><td>' + alliances[alliance].length + '</td></tr>';
					}
				}
				
				msg += '</table>';
				msg += '<br><b>Unruled islands:</b> ' + unruled.join(', ');

				newDiv.innerHTML = msg;
				document.body.appendChild(newDiv);
			}
			
			// start some clocks
			if (startStoreClock) {
				new Clock(timer, document.getElementById("goldin"), goldin);
				new Clock(timer, document.getElementById("stonein"), stonein);
				new Clock(timer, document.getElementById("woodin"), woodin);
			}
			if (startOrderClock) {
				new Clock(timer, document.getElementById("ordersdonein"), orderTotalTime);
			}
			

			// clean-up
			cells = null;
			divs = null;
			bolds = null;
			
			//*************************//
			// extra functions
			//-------------------------//
			
			// update the Units and Resources count on the harbour page
			function updateUnitsResources(form) {
				var units = 0, resources = 0;
				for (var i = 0; i < form.elements.length; ++i) {
					var whowhat = form.elements[i].title.split(' ');
					if (whowhat[1] == 'units') {
						units += parseInt(whowhat[0]) * form.elements[i].value;
					}
					else if (whowhat[1] == 'resources') {
						resources += parseInt(whowhat[0]) * form.elements[i].value;
					}
				}
				if (document.getElementById('orders_units')) {
					document.getElementById('orders_units').innerText = units;
				}
				if (document.getElementById('orders_res')) {
					document.getElementById('orders_res').innerText = resources;
				}
			}
		},
		false
	);
	


	

/*	http://theonlyalterego.org/inselkampf.faq.html
	gold rate = 8 * 1.2^level 
	stone rate = 5 * 1.2^level 
	lumber rate = 6 * 1.2^level
	and floor()ed
*/

}

/*

document.getElementById('nextlink').onclick = function () {
  if( !window.XMLHttpRequest ) { return true; }
  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if( request.readyState != 4 ) { return; }
    var useResponse = request.responseText.replace( /^[\w\W]*<div id="container">|<\/div>\s*<\/body>[\w\W]*$/g , '' );
    document.getElementById('container').innerHTML = useResponse;
    request.onreadystatechange = null;
    request = null;
  };
  request.open( 'GET', this.href, true );
  request.send(null);
  return false;
}


function dump_props(obj) {
   var result = "";
   for (var i in obj) {
      result += i + " = " + obj[i] + "<br>";
   }
   result += "<hr>";
   return result;
}

*/