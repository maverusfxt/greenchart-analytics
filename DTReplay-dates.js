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
		{name: "Russ", entryPct: 25, exitPct: 75, minPts: 50, maxPts: 110, spreadPts:10
		  , commPts: 6, stopPips: 200, trdHours: ['00','13'], divideLargeRanges: true
		  , calcNearCP: true, usePsych: true, maxShort: 3, maxLong: 3
		  , sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}
		, {name: "Jeff", entryPct: 10, exitPct: 70, minPts: 50, maxPts: 110, spreadPts:10
			, commPts: 6, stopPips: 100, trdHours: ['10','13'], divideLargeRanges: true
			, calcNearCP: false, usePsych: true, maxShort: 2, maxLong: 2
			, sunday: false, monday:true, tuesday:true, wednesday:true, thursday:true, friday:true}	];

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

	// Run the analysis
	result = replayTrades( contents, minPoints, maxPoints, startDate, endDate, 
		entryPct, exitPct, spread, commPoints, tradeHours, stopPoints, multTrades,
		details, weekly, monthly, psychLevels, maxShort, maxLong, dow);

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
  var dayCnt = 0, prvPlacedDate = null;
  // Load table rows
  for(var i = 0; i < result.placed.length; i++) {
  	if (result.placed[i].placedDate >= new Date( fromDate+' 00:00:00') && result.placed[i].placedDate <= new Date( toDate+' 00:00:00')) {
      var rowCount = pTable.rows.length;
      var row = pTable.insertRow(rowCount);

      if (result.placed[i].placedDate != prvPlacedDate) {
      	dayCnt++;
      	prvPlacedDate = result.placed[i].placedDate;
      }
      var cell = row.insertCell(0);
      cell.innerHTML = result.placed[i].placedDate.toISOString().substr(0,10);
      cell = row.insertCell(1);
      cell.innerHTML = result.placed[i].placedTime;
      cell = row.insertCell(2);
      cell.innerHTML = result.placed[i].level;
      cell = row.insertCell(3);
      cell.innerHTML = result.placed[i].entry;
      cell = row.insertCell(4);
      cell.innerHTML = result.placed[i].exit;
      cell = row.insertCell(5);
      cell.innerHTML = result.placed[i].points;
      cell = row.insertCell(6);
      cell.innerHTML = result.placed[i].type;
      cell = row.insertCell(7);
      cell.innerHTML = result.placed[i].status;
      if (result.placed[i].status == 'filled') {
      	cell.style.backgroundColor = "lightgreen";
      } else if ( result.placed[i].status == 'stopped') {
      	cell.style.backgroundColor = "pink";
      } else if ( result.placed[i].status == 'active') {
      	cell.style.backgroundColor = "yellow";
      }

      cell = row.insertCell(8);
      if (result.placed[i].status == 'filled') {
      	filledCnt ++;
      	cell.innerHTML = result.placed[i].filledDate + " " + result.placed[i].filledTime;
      } else if ( result.placed[i].status == 'stopped') {
      	stoppedCnt ++;
      	cell.innerHTML = result.placed[i].stopDate + " " + result.placed[i].stopTime;
      }

      cell = row.insertCell(9);
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

	      cell = row.insertCell(10);
	      cell.innerHTML = netPts;
      if (result.placed[i].status == 'active') {
      	activeCnt ++;
      }
  	}
  } // for			

// Save the results in the Trade Summary table	    
	var tsTable = document.getElementById('tsBody');
  rowCount = tsTable.rows.length;

  var row = tsTable.insertRow(rowCount), c=0, cell = '';
  cell = row.insertCell(c).innerHTML = '<img src="images/delete25.png" alt="delete" onclick="deleteRow(' + rowCount + ')" style="width; 20px; height: 20px;">';
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
  cell = row.insertCell(c).innerHTML = (netPts / dayCnt).toFixed(0);
  c++;
  cell = row.insertCell(c).innerHTML = 0; // Avg Daily Gain
  c++;
  cell = row.insertCell(c).innerHTML = 0; // Total Gain
  c++;
  cell = row.insertCell(c).innerHTML = document.getElementById("multTrades").checked;; // Mult Trades
  c++;
  cell = row.insertCell(c).innerHTML = 'N/A'; //document.getElementById('cpTrades').checked; // Calc Near CP?
  c++;
  cell = row.insertCell(c).innerHTML = document.getElementById('psychLevels').checked; // Psych Levels?
}

function deleteRow ( row) {
	var tsTable = document.getElementById('tsBody');
	try {
 		tsTable.deleteRow(row);
	} catch( e) {}  		

// rebuild the onclick action for the remaining rows.
	var rows = tsTable.rows;
	for (var r=0; r < rows.length; r++) {
		rows[r].cells[0].innerHTML = '<img src="delete25.png" alt="delete" onclick="deleteRow(' + r + ')" style="width; 20px; height: 20px;">';
	}	  	
}

function deleteAllResults() {
	var rowCount = document.getElementById('tsBody').rows.length;
	for ( var r=rowCount-1; r >= 0; r--) {
		deleteRow( r);
	}
}

function formatBalance() {
	var balance = document.getElementById("strBalance").value;
	balance = '$' + Number(balance).toFixed(2);
	document.getElementById("strBalance").value = balance;
}