if (window.File && window.FileReader && window.FileList && window.Blob) {
	// alert('SUCCESS!');
} else {
	alert('File APIs not supported in this browser');
}  	
var contents = null;

window.onload = function() {
	document.getElementById('files').addEventListener('change', handleFileSelect, false);
	// document.getElementById('files').addEventListener('start', handleStart, false);
	loadUserDefaults();
}

function loadUserDefaults() {
	//var fileToLoad = new File( [""], ['ReplayDefaults.json'], {type:"text/plain"});

	// var fileReader = new FileReader();
	// fileReader.onload = function(evt)	{
			// var textFromFileLoaded = evt.target.result;
			// var defaults = evt.target.result;
			// // document.getElementById("inputTextToSave").value = textFromFileLoaded;
	// };
	// fileReader.readAsText(fileToLoad, "UTF-8");

	userDefaults = [
		{name: "10/60 300", entryPct: 10, exitPct: 60, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 300, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: true, usePsych: true, maxShort: 5, maxLong: 5, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday: true
			, strBalance: 5000, acctPercent: 1, strDate: '2017-03-01', endDate: '2017-03-17'}
		, {name: "10/60 200", entryPct: 10, exitPct: 60, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 200, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: true, usePsych: true, maxShort: 3, maxLong: 3, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
		, {name: "15/65 200", entryPct: 15, exitPct: 65, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 200, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: false, usePsych: true, maxShort: 2, maxLong: 2, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
		, {name: "20/70 200", entryPct: 20, exitPct: 70, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 200, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: false, usePsych: true, maxShort: 2, maxLong: 2, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
		, {name: "25/75 200", entryPct: 25, exitPct: 75, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 200, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: false, usePsych: true, maxShort: 2, maxLong: 2, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
		, {name: "30/80 200", entryPct: 30, exitPct: 80, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 200, trdHours: ['6','17'], divideLargeRanges: true
			, calcNearCP: false, usePsych: true, maxShort: 2, maxLong: 2, strict: true
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
	];

	var select = document.getElementById('userDfts');
	for (var i=0; i < userDefaults.length; i++) {
		var option = document.createElement('option');
		option.value = userDefaults[i].name;
		option.text = userDefaults[i].name;
		select.add( option);
	}
	setUserDefaults();
}

function setUserDefaults() {
	var user = document.getElementById('userDfts').value;
	for ( var i = 0; i < userDefaults.length; i++) {
		if (userDefaults[i].name === user) {
			var d = userDefaults[i];
			document.getElementById('entryPct').value = d.entryPct;
			document.getElementById('exitPct').value = d.exitPct;
			document.getElementById('minPoints').value = d.minPts;
			document.getElementById('maxPoints').value = d.maxPts;
			document.getElementById('spreadPoints').value = d.spreadPts;
			document.getElementById('commPoints').value = d.commPts;
			document.getElementById('stopPoints').value = d.stopPips;
			document.getElementById('tradeHours1').value = d.trdHours[0];
			document.getElementById('tradeHours2').value = d.trdHours[1];
			document.getElementById('tradeHours3').value = d.trdHours[2];
			document.getElementById('tradeHours4').value = d.trdHours[3];
			document.getElementById('tradeHours5').value = d.trdHours[4];
			document.getElementById('tradeHours6').value = d.trdHours[5];
			document.getElementById('multTrades').checked = d.divideLargeRanges;
			document.getElementById('cpTrades').checked = d.calcNearCP;
			document.getElementById('psychLevels').checked = d.usePsych;
			document.getElementById('maxLevelShort').value = d.maxShort;
			document.getElementById('maxLevelLong').value = d.maxLong;
			document.getElementById('dowSunday').checked 		= d.sunday;
			document.getElementById('dowMonday').checked 		= d.monday;
			document.getElementById('dowTuesday').checked 	= d.tuesday;
			document.getElementById('dowWednesday').checked = d.wednesday;
			document.getElementById('dowThursday').checked 	= d.thursday;
			// document.getElementById('dowFriday').checked 		= d.friday;
			$( '#dowFriday').attr( 'checked', true);
			document.getElementById('strict').checked 	= d.strict;
			document.getElementById('strBalance').value = d.strBalance;
			document.getElementById('acctPercent').value = d.acctPercent;
			document.getElementById('startDate').value = d.strDate;
			document.getElementById('endDate').value = d.endDate;
			break;
		}
	}
}

function handleFileSelect(evt) {
	document.getElementById("loadMsg").innerHTML = 'Loading file data...';
	document.getElementById('start').disabled = true;
	var file = evt.target.files[0]; // FileList object

	var r = new FileReader();
	r.onload = function(evt) { 
		contents = evt.target.result;
				document.getElementById('start').disabled = false;
				document.getElementById("loadMsg").innerHTML = '';
	}
	r.readAsText(file);
}

// Run all the basic tests.
function executeBasics() {
	var tests = [
		{entryPct: .10, exitPct: .60},
		{entryPct: .15, exitPct: .65},
		{entryPct: .20, exitPct: .70},
		{entryPct: .25, exitPct: .75},
		{entryPct: .30, exitPct: .80},
	];

	// Insert a blank row to separate runs.
	var tsTable = document.getElementById('tsBody');
	var rowCount = tsTable.rows.length;
	if ( rowCount > 1) { // Insert an empty row between runs
		var row = tsTable.insertRow(rowCount);
		for (var r = 0; r < tsTable.rows[rowCount-1].cells.length; r++) {
			var cell = row.insertCell(r).innerHTML = '.';
		}
	}
	// Loop through tests for the different percentages. 
	// Use everything else from the fields on the page.
	for ( var i in tests) {
		executeCalculate( tests[i].entryPct, tests[i].exitPct)
	}
}

function executeCalculate( entry, exit) {
	document.getElementById("dataDiv2").style.display = "none";
	var fileName = null, entryPct = 0, exitPct = 0, minPoints = 0, maxPoints = 0, spread = 0;
	var commPoints = 0, stopPoints = 0, currPair = null, startDate = null, endDate = null;
	var details = false, weekly = false, monthly = false, tradeHours = [];
	var maxShort = 0, maxLong = 0;

	if (entry == undefined) {
		entryPct  = document.getElementById('entryPct').value / 100;
	} else {
		entryPct = entry;
	}
	if (exit == undefined) {
		exitPct   = document.getElementById('exitPct').value / 100;
	} else {
		exitPct = exit;
	}
	minPoints = Number(document.getElementById('minPoints').value);
	maxPoints = Number(document.getElementById('maxPoints').value);
	spread = document.getElementById('spreadPoints').value / 100000;
	commPoints = Number(document.getElementById('commPoints').value);
	stopPoints = document.getElementById('stopPoints').value / 10000;

	tradeHours[0] = document.getElementById('tradeHours1').value;
	tradeHours[1] = document.getElementById('tradeHours2').value;
	tradeHours[2] = document.getElementById('tradeHours3').value;
	tradeHours[3] = document.getElementById('tradeHours4').value;
	tradeHours[4] = document.getElementById('tradeHours5').value;
	tradeHours[5] = document.getElementById('tradeHours6').value;

	if (files.files.length > 0) {
		 fileName = files.files[0].name;
	}
	startDate = document.getElementById("startDate").value;
	endDate   = document.getElementById("endDate").value;
	multTrades= document.getElementById("multTrades").checked;
	var psychLevels = document.getElementById('psychLevels').checked;
	maxShort = document.getElementById("maxLevelShort").value;
	maxLong = document.getElementById("maxLevelLong").value;

	if (fileName == null || startDate == "" || endDate == "") {
		document.getElementById("selErrors").innerHTML = 'Please enter all information for Selection & Output.';
	} else {
		document.getElementById("selErrors").innerHTML = '';
	}

	// Get trade days of week
	var dow = [];
	dow[0] = document.getElementById('dowSunday').checked;
	dow[1] = document.getElementById('dowMonday').checked;
	dow[2] = document.getElementById('dowTuesday').checked;
	dow[3] = document.getElementById('dowWednesday').checked;
	dow[4] = document.getElementById('dowThursday').checked;
	dow[5] = document.getElementById('dowFriday').checked;

	var strict = document.getElementById('strict').checked;

	var strBalance = document.getElementById('strBalance').value;
	strBalance = Number( strBalance.replace('$',''));
	var acctPercent = document.getElementById('acctPercent').value/100;

	// Run the analysis
	result = replayTrades( contents, minPoints, maxPoints, startDate, endDate, 
		entryPct, exitPct, spread, commPoints, tradeHours, stopPoints, multTrades,
		details, weekly, monthly, psychLevels, maxShort, maxLong, dow, strict, 
		strBalance, acctPercent);

	// Fill in the page
	document.getElementById("dataDiv2").style.display = "block";
	// document.getElementById("fromDate").value = document.getElementById("startDate").value;
	// document.getElementById("toDate").value = document.getElementById("endDate").value;
	populateTradeTables();
}

function populateTradeTables() {
	var fromDate = document.getElementById("startDate").value;
	var toDate = document.getElementById('endDate').value;
	
	var pTable = document.getElementById('ptBody');
	var fTable = document.getElementById('filledTable');
	var sTable = document.getElementById('stoppedTable');
	var uTable = document.getElementById('unactivatedTable');

	// Placed Trades Table		
	var rowCount = pTable.rows.length;
	// delete existing rows first
	for(var i = rowCount-1; i >= 0; i--) {
		pTable.deleteRow(i);
	}
	var filledPts = 0, stoppedPts = 0, netPts = 0;
	var filledCnt = 0; stoppedCnt = 0, activeCnt = 0;
	var dayCnt = 0, prvPlacedDate = new Date( '1980-01-01 00:00:00');
	var prvColor, prvPlacedTime, endingBalance;
	// Load table rows
	for(var i = 0; i < result.placed.length; i++) {
		if (result.placed[i].placedDate >= new Date( fromDate+' 00:00:00') && result.placed[i].placedDate <= new Date( toDate+' 00:00:00')) {
			var rowCount = pTable.rows.length;
			var row = pTable.insertRow(rowCount);

			if (result.placed[i].placedDate.toISOString().substr(0,10) != prvPlacedDate.toISOString().substr(0,10)
				|| result.placed[i].placedTime != prvPlacedTime) {
				if (result.placed[i].placedDate.toISOString().substr(0,10) != prvPlacedDate.toISOString().substr(0,10)) {
					dayCnt++;
				}
				prvPlacedDate = result.placed[i].placedDate;
				prvPlacedTime = result.placed[i].placedTime;
				if (prvColor == '#eee') {
					prvColor = 'none';
				} else {
					prvColor = '#eee';
				}
			}
			row.style.backgroundColor = prvColor;
			var c=0;
			var cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].placedDate.toISOString().substr(0,10);
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].placedTime;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].level;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].entry;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].exit;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].points;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].type;
			c++;
			cell = row.insertCell(c);
			cell.innerHTML = result.placed[i].status;
			if (result.placed[i].status == 'filled') {
				cell.style.backgroundColor = "lightgreen";
			} else if ( result.placed[i].status == 'stopped') {
				cell.style.backgroundColor = "pink";
			} else if ( result.placed[i].status == 'active') {
				cell.style.backgroundColor = "yellow";
			}

			c++;
			cell = row.insertCell(c);
			if (result.placed[i].status == 'filled') {
				filledCnt ++;
				cell.innerHTML = result.placed[i].filledDate.toISOString().substr(0,10) + " " + result.placed[i].filledTime;
				if (result.placed[i].placedDate.toISOString().substr(0,10) !== result.placed[i].filledDate.toISOString().substr(0,10)) {
					cell.style.backgroundColor = "orange";
				}
			} else if ( result.placed[i].status == 'stopped') {
				stoppedCnt ++;
				cell.innerHTML = result.placed[i].stopDate.toISOString().substr(0,10) + " " + result.placed[i].stopTime;
			}

			c++;
			cell = row.insertCell(c);
			if (result.placed[i].status == 'filled') {
				cell.innerHTML = ((result.placed[i].points)*.1).toFixed(1);
			}

			// Short Points
			//cell = row.insertCell(10);
			if (result.placed[i].stopPrice != undefined) {
				cell.innerHTML = '-' + ((result.placed[i].entry - result.placed[i].stopPrice)*10000).toFixed(1);
			}

			if (result.placed[i].status == 'filled') {
				filledPts += result.placed[i].points;
			}
			if (result.placed[i].status == 'stopped') {
				stoppedPts += Math.abs(Number(((result.placed[i].entry - result.placed[i].stopPrice)*100000).toFixed(0)));
			}
			netPts = Number(((filledPts - stoppedPts)*.1).toFixed(1));

			c++;
			cell = row.insertCell(c);
			cell.innerHTML = netPts;

			c++;
			var cell = row.insertCell(c);
			if (result.placed[i].balance !== undefined) {
				cell.innerHTML = '$' + (result.placed[i].balance).toFixed(2);
				cell.title = 'Gain/Loss: $' + result.placed[i].gainLoss.toFixed(2);
				endingBalance = result.placed[i].balance;
			} else {
				cell.innerHTML = '';
			}

			if (result.placed[i].maxCarryover !== undefined) {
				c++;
				cell = row.insertCell(c).innerHTML = result.placed[i].maxCarryover; // Psych Levels?
			}
			if (result.placed[i].status == 'active') {
				activeCnt ++;
			}
		}
	} // for			

// Save the results in the Trade Summary table	    
	var tsTable = document.getElementById('tsBody');
	rowCount = tsTable.rows.length;

	var row = tsTable.insertRow(rowCount), c=0, cell = '';
	cell = row.insertCell(c).innerHTML = '<img src="images/delete25.png" alt="delete" onclick="deleteRow(' + rowCount + ')" style="width; 20px; height: 20px;" title="Delete row.">';
	c++;
	cell = row.insertCell(c).innerHTML = '<img src="images/play.png" alt="play" onclick="playRow(' + rowCount + ')" style="width; 20px; height: 20px;" title="Run again.">';
	c++;
	cell = row.insertCell(c).innerHTML = dayCnt;
	c++;
	cell = row.insertCell(c).innerHTML = document.getElementById('stopPoints').value;
	c++;
	cell = row.insertCell(c).innerHTML = result.pctMin;
	c++;
	cell = row.insertCell(c).innerHTML = result.pctMax;
	c++;
	cell = row.insertCell(c).innerHTML = filledCnt;
	c++;
	cell = row.insertCell(c).innerHTML = stoppedCnt;
	c++;
	cell = row.insertCell(c).innerHTML = activeCnt;
	c++;
	cell = row.insertCell(c).innerHTML = netPts;
	c++;
	cell = row.insertCell(c).innerHTML = (netPts / dayCnt).toFixed(0); // Avg pips per day

	var strBalance = Number( Number(document.getElementById('strBalance').value.replace('$','')).toFixed(2));
	var gainLoss = (endingBalance - strBalance);
	c++;
	cell = row.insertCell(c).innerHTML = (gainLoss / dayCnt).toFixed(2); // Avg Daily Gain
	c++;
	// Total Gain/Loss
	cell = row.insertCell(c).innerHTML = gainLoss.toFixed(2);
	// Gain percentage
	c++;
	cell = row.insertCell(c).innerHTML = ((gainLoss / strBalance) * 100).toFixed(2);

	c++;
	cell = row.insertCell(c).innerHTML = document.getElementById("multTrades").checked; // Mult Trades
	c++;
	cell = row.insertCell(c).innerHTML = 'N/A'; //document.getElementById('cpTrades').checked; // Calc Near CP?
	c++;
	cell = row.insertCell(c).innerHTML = document.getElementById('psychLevels').checked; // Psych Levels?
	c++;
	var replayData = { entryPct: result.pctMin, exitPct: result.pctMax, 
		minPts: document.getElementById("minPoints").value, 
		maxPts: document.getElementById("maxPoints").value,
		spread: document.getElementById("spreadPoints").value,
		commission: document.getElementById('commPoints').value,
		hours: [ document.getElementById('tradeHours1').value, 
			document.getElementById('tradeHours2').value,
			document.getElementById('tradeHours3').value,
			document.getElementById('tradeHours4').value,
			document.getElementById('tradeHours5').value,
			document.getElementById('tradeHours6').value
			],
		multTrades: document.getElementById("multTrades").checked,
		calcNearCP: document.getElementById("cpTrades").checked,
		psychLevels: document.getElementById("psychLevels").checked,
		maxShort: document.getElementById("maxLevelShort").value,
		maxLong: document.getElementById("maxLevelLong").value,
		dow: [document.getElementById("dowSunday").checked, 
			document.getElementById("dowMonday").checked, 
			document.getElementById("dowTuesday").checked, 
			document.getElementById("dowWednesday").checked, 
			document.getElementById("dowThursday").checked, 
			document.getElementById("dowFriday").checked
			],
		startDate: document.getElementById("startDate").value,
		endDate: document.getElementById("endDate").value,
		stopPts: document.getElementById('stopPoints').value / 10000,
		strict: document.getElementById('strict').checked,
		strBalance: Number(document.getElementById('strBalance').value),
		acctPercent: Number(document.getElementById('acctPercent').value)
		};
	cell = row.insertCell(c).innerHTML = JSON.stringify( replayData);
	row.cells[c].style.display = 'none';
}

//=====================================================================
//Read the summary row and run it again putting the data in the detail table.
function playRow( row) {
	var tsTable = document.getElementById('tsBody');
	var pd = JSON.parse(tsTable.rows[ row].cells[16].innerHTML);

	result = replayTrades( contents, pd.minPts, pd.maxPts, pd.startDate, pd.endDate, 
		pd.entryPct/100, pd.exitPct/100, pd.spread/100000, pd.commission, pd.hours, pd.stopPts, pd.multTrades,
		false, false, false, pd.psychLevels, pd.maxShort, pd.maxLong, pd.dow, pd.strict, pd.strBalance, pd.acctPercent);

	document.getElementById("startDate").value = pd.startDate;
	document.getElementById("endDate").value = pd.endDate;
	document.getElementById('strBalance').value = pd.strBalance;
	document.getElementById('acctPercent').value = pd.acctPercent;

	populateTradeTables();
	tsTable = document.getElementById('tsBody');
	tsTable.deleteRow( tsTable.rows.length - 1);
}

//=====================================================================
function deleteRow ( row) {
	var tsTable = document.getElementById('tsBody');
	try {
		tsTable.deleteRow(row);
	} catch( e) {}  		

// rebuild the onclick action for the remaining rows.
	var rows = tsTable.rows;
	for (var r=0; r < rows.length; r++) {
		rows[r].cells[0].innerHTML = '<img src="images/delete25.png" alt="delete" onclick="deleteRow(' + r + ')" style="width; 20px; height: 20px;">';
	}	  	
}

//=====================================================================
function deleteAllResults() {
	var rowCount = document.getElementById('tsBody').rows.length;
	for ( var r=rowCount-1; r >= 0; r--) {
		deleteRow( r);
	}
}

//=====================================================================
function formatBalance() {
	var balance = document.getElementById("strBalance").value;
	balance = '$' + Number(balance).toFixed(2);
	document.getElementById("strBalance").value = balance;
}
