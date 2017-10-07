// Gather analysis information for Forex trading
// Command parms:
//  -input, -i: Input file name
//  -chart, -c: Compare data file name; Candles to gather data for
//  -output, -o: Output file name

// Input file CSV structure: 
//  Date, Time, HU/HF, OB/OS, Solid Red/Green Color, Dashed Red/Green Color

// Output file CSV structure:
//  Date, Time, HU/HF, OB/OS, Candle Color (Red, Green, Doji)
//    Majors Red Direction[5], Majors Green Direction[6],
//    Minors Black Direction[7], Minors Gray Direction[8], Pressure Direction[9],
//    Green Pressure Index [63], Red Pressure Index [64],
//    Thick R/G Color, Dotted R/G Color, 
//    Thick Orange Index [38], Thin Orange Index [44],
//	  Majors Red Index [60], Majors Green Index [59],
//    Minors Black Index [58], Minors Gray Index [54]
//    Next Candle Loss Points, Next Candle Max Points,
//    Second Candle Loss Points, Second Candle Max Points,
//    Third Candle Loss Points, Third Candle Max Points,
//    Fourth Candle Loss Points, Fourth Candle Max Points
//	  Up to 10 candles of loss and max points

const fs = require( 'fs');
var exec = require('child_process').exec;
const excel = require( 'exceljs');

var parms = process.argv;
var tradeFile, resultFile; 
var nbrCandles, worksheet = '*all';

var resultTemplateXLS = 'd:\\russ\\documents\\forex\\bbb\\templates\\BBB Back Testing EURUSD 2.0.xlsx';
nbrCandles = 4;

if (parms.length > 2) { // no values passed in. End or set defaults
	for (var i = 2; i < parms.length; i++){
		if (parms[i] == '-t' || parms[i] == '-trade') {
			tradeFile = parms[i+1];
			i++;
		}
		if (parms[i] == '-c' || parms[i] == '-chart') {
			chartFile = parms[i+1];
			i++;
		}
		if (parms[i] == '-o' || parms[i] == '-output') {
			resultFile = parms[i+1];
			i++;
		}
		if (parms[i] == '-can' || parms[i] == '-candles') {
			nbrCandles = parms[i+1];
			i++;
		}
		if (parms[i] == '-h' || parms[i] == '-help') {
			displayHelp();
			return;
		}
		if (parms[i] == '-ws' || parms[i] == '-worksheet') {
			worksheet = parms[i+1];
			i++;
		}
	}
}

if (tradeFile === undefined || chartFile === undefined) {
	console.log( '\nRequired parameters missing. Please include chart file (-c) and tradeFile (-t) values.');
	return;
}

if (resultFile === undefined) {
	resultFile = tradeFile.substr( 0, tradeFile.indexOf('.')) + ' Result.xlsx';
}

var tradeDataWB = new excel.Workbook();
var resultDataWB = new excel.Workbook();

// Get the template to populate.
resultDataWB.xlsx.readFile( resultTemplateXLS).then(function() {
	// Get the trade data spreadsheet
	tradeDataWB.xlsx.readFile( tradeFile).then(function() {
		if (worksheet === '*all') {
			tradeDataWB.eachSheet( function( ws, sid) {
				if ( !isNaN( ws.name.substr(0,1))) {
					var timeFrame = ws.name.substr( 0, ws.name.indexOf(' '));
					// var chartData = getChartData( chartFile, timeFrame);
					var chartData = getChartData( chartFile, ws.name);
					if (chartData !== null) {
						processTradeWorksheet( ws.name, chartData ); // ws.id = sheet id (number)
					}
				}
			});
		} else {
			var chartData = getChartData( chartFile, '');
			processTradeWorksheet( worksheet, chartData);
		}
		resultDataWB.xlsx.writeFile( resultFile).then(function() {
			console.log( '\nSpreadsheet written succesfully (' + resultFile + ')');
			exec( '"' + resultFile + '"',function (err, stdout, stderr) {
			        if (err) {
			        console.error(err);
			        return;
			    }
			    console.log(stdout);
			    process.exit(-1);// exit process once it is opened
			});
		});

	});
	// End of getting trade data
}); // End of reading template file

return;

//=============================================
function getChartData( chartFile, timeFrame) {
	chartFile = chartFile.replace( '&tf', timeFrame);
	try {
		//var tradeData = fs.readFileSync( tradeFile, 'UTF-8');
		var chartData = fs.readFileSync( chartFile, 'UTF-8');
		return chartData;
	} catch (e) {
		console.log( 'Failed open of file: ' + e)
		return null;
	}
}

//==========================================================
function processTradeWorksheet ( worksheet, chartData) {
	var ws = tradeDataWB.getWorksheet( worksheet);
	var tradeRows = [];
	const nbrTradeColumns = 4;

	for ( var r=2; r <= ws.rowCount; r++) {
		var newRow = [];
		var wsRow = ws.getRow( r);

		for (var c = 1; c <=nbrTradeColumns; c++) {
			var val = wsRow.getCell( c).value; 
			if (val === null) {
				break;
			}
			if (c === 1) { // Date
				val = (new Date(val).toISOString()).substr(0,10);
			} else if (c === 2) { // Time
				val = (new Date(val).toISOString()).substr(11,8);
			}
			newRow.push( val);
		}
		if (newRow.length > 0) {
			tradeRows.push(newRow);
		}
	}
	colhdg = hhCSVColumnHeadings( nbrCandles); // Create the csv column headings
	hiccupHeadfake( colhdg, chartData, tradeRows, worksheet);
}

//======================================================
function hiccupHeadfake ( colhdg, chartData, tradeData, worksheet) {
//console.log( '158 ' + chartData);
	var chartLines = chartData.split('\n');
	// var tradeLines = tradeData.split('\r\n');
	var tradeLines = tradeData;

	var date, time, hour, minute, open, high, low, close;
	var candleColor, os_ob, hiccups, headFakes, writeData = [];

	//writeData += colhdg.toString() + '\n';

	// Variables for current row
	var thickOrange = 0, thinOrange, minorBlack, minorGray, majorRed, majorGreen, pressGreen, pressRed;

	// vars that start with "p" are values from previous row
	var pthickOrange, pthinOrange, pminorBlack, pminorGray, pmajorRed, pmajorGreen, ppressGreen, ppressRed;
	var tli = 0;

// Loop through the chart data, split it into array elements and calculate trades.
	for (var r = 1; r < chartLines.length; r++) {
		// try {
		if (chartLines[r] === '') {
			break;
		}
		if (tli >= tradeLines.length || tradeLines[tli] == '') {
			break;
		}
//console.log( '183 ' + chartLines[r]);
		var clRow = chartLines[r].split(',');
		var tlRow = tradeLines[tli]; //.split(',');

		time = clRow[1].substr(1,8);
// console.log( '190; clRow[0]: ' + clRow[0] + ' time: ' + time);
		date = new Date( clRow[0] + ' ' + time); // Chart Date
// console.log( '192; tlRow[0]: ' + tlRow[0] + ' time: ' + time);
		var tlDate = new Date( tlRow[ 0] + ' ' + tlRow[1]);// + ' UTC');
		// Is the chart date (and time) greater than the trade date?
		if ( date.toISOString() > tlDate.toISOString() ) {
			writeData += 'Bad Data,' + tlRow[0] + ',' + tlRow[1] + '\n';
			tli++;
			console.log( 'Bad Data,' + tlRow[0] + ',' + tlRow[1]);
			if (tradeLines.length+1 < tli)  {
				var tlRow = tradeLines[tli]; //.split(',');
			}
		}

		hour = time.split(':')[0];
		minute = time.split(':')[1];
		open = Number( clRow[2]);
		high = Number( clRow[3]);
		low = Number( clRow[4]);
		close = Number( clRow[5]);

		if (close > open) {
			candleColor = 'Green';
		} else if (close < open) {
			candleColor = 'Red';
		} else {
			candleColor = 'Doji';
		}

		thickOrange = Number( clRow[44]);
		thinOrange  = Number( clRow[38]);
		minorGray   = Number( clRow[54]);
		minorBlack  = Number( clRow[58]);
		majorGreen  = Number( clRow[59]);
		majorRed    = Number( clRow[60]);
		pressGreen  = Number( clRow[63]);
		pressRed    = Number( clRow[64]);
		var tlDate = new Date( tlRow[ 0] + ' ' + tlRow[1]);// + ' UTC');
		if ( date.toISOString() === tlDate.toISOString() ) {
			// var compResult = hhCheck( candleColor, tlRow[3], tlRow[2], date, time,
			var ob_os = 'OB';
			if ( majorRed < 50) {
				ob_os = 'OS';
			}

			var hu_hf = 'HF';
			if (ob_os === 'OS') {
				if (majorGreen <= majorRed) {
					hu_hf = 'HU'
				}
			} else if (majorGreen >= majorRed) { // over bought and maj green > maj red
				hu_hf = 'HU';
			}

			try{
				var compResult = hhCheck( candleColor, ob_os, hu_hf, date, time,
					pminorGray, minorGray, pminorBlack, minorBlack,
					pmajorGreen, majorGreen, pmajorRed, majorRed,
					thickOrange, thinOrange,
					ppressGreen, pressGreen, ppressRed, pressRed,
					open, high, low, close,
					tlRow[2], tlRow[3], 
					[chartLines[r+1].split(','),
					chartLines[r+2].split(','),
					chartLines[r+3].split(','),
					chartLines[r+4].split(','),
					chartLines[r+5].split(','),
					chartLines[r+6].split(','),
					chartLines[r+7].split(','),
					chartLines[r+8].split(','),
					chartLines[r+9].split(','),
					chartLines[r+10].split(',')]
				);
			} catch(e) {
				console.log( e);
			}
			writeData += compResult.toString() + '\n';
			tli++;
		}
		// Save row values in previous value variables for comparison
		pthickOrange = thickOrange;
		pthinOrange  = thinOrange;
		pminorGray   = minorGray;
		pminorBlack  = minorBlack;
		pmajorGreen  = majorGreen;
		pmajorRed    = majorRed;
		ppressGreen  = pressGreen;
		ppressRed    = pressRed;
		// } catch(e) {
		// 	console.log( e)
		// 	return null;
		// }

	} // End for loop

	if (writeData.length >0) {
		saveResultSheet( resultFile, writeData, worksheet, colhdg);
	}
} // hiccupHeadfake function end

//===================================================================
// Check for Hiccup or Headfake 
function hhCheck ( candleColor, os_ob, hu_hf, date, time,
	pminorGray, minorGray, pminorBlack, minorBlack,
	pmajorGreen, majorGreen, pmajorRed, majorRed,
	thickOrange, thinOrange,
	ppressGreen, pressGreen, ppressRed, pressRed, 
	open, high, low, close, thickRedGreen, dottedRedGreen,
	tenRows) { //rowp1, rowp2, rowp3, rowp4) {
//console.log( 'hhcheck');

	var rtn = [];

	var L = date.toLocaleString().indexOf(',');
	rtn[0] = date.toLocaleString().substr(0,L);
	rtn[1] = time;
	rtn[2] = hu_hf;
	rtn[3] = os_ob;
	rtn[4] = candleColor;
	if (majorRed > pmajorRed) {
		rtn[5] = 'Up';
	} else if (majorRed < pmajorRed) {
		rtn[5] = 'Down';
	} else {
		rtn[5] = 'Flat';
	}
	if (majorGreen > pmajorGreen) {
		rtn[6] = 'Up';
	} else if (majorGreen < pmajorGreen) {
		rtn[6] = 'Down';
	} else {
		rtn[6] = 'Flat';
	}
	if (minorBlack > pminorBlack) {
		rtn[7] = 'Up';
	} else if (minorBlack < pminorBlack) {
		rtn[7] = 'Down';
	} else {
		rtn[7] = 'Flat';
	}
	if (minorGray > pminorGray) {
		rtn[8] = 'Up';
	} else if (minorGray < pminorGray) {
		rtn[8] = 'Down';
	} else {
		rtn[8] = 'Flat';
	}
	if (pressGreen > ppressGreen && pressRed > ppressRed) {
		rtn[9] = 'Up';
	} else if (pressGreen < ppressGreen && pressRed < ppressRed) {
		rtn[9] = 'Down';
	} else {
		rtn[9] = 'Mixed';
	}
	rtn[10] = pressGreen;
	rtn[11] = pressRed;
	rtn[12] = thickRedGreen; // thick red/green
	rtn[13] = dottedRedGreen; // dotted red/green
	rtn[14] = thickOrange;
	rtn[15] = thinOrange;
	rtn[16] = majorRed;
	rtn[17] = majorGreen;
	rtn[18] = minorBlack;
	rtn[19] = minorGray;

	var highProfit=0, highProfCandle=0, largestDrawdown=0, drawDownCandle=0;

	if (os_ob.toLowerCase() === 'os') { // oversold so we are expecting it to drop again
		var colNbr = 20;
		for ( var i=0; i < nbrCandles; i++) {
			var canRow = tenRows[i];
			// Drawdown
			if ( Number( canRow[3]) > close) { // high > close so loss
				rtn[colNbr] = Number((close - Number( canRow[3])).toFixed(5));
				rtn[colNbr] = Number((rtn[colNbr]*10000).toFixed(1));
			} else { rtn[colNbr] = 0;}
			if (rtn[colNbr] < largestDrawdown) {
				largestDrawdown = rtn[colNbr];
				drawDownCandle = i+1;
			}

			colNbr++;
			// Profit
			if ( Number( canRow[4]) < close) { // low < close so profit
				rtn[colNbr] = Number( (close - Number( canRow[4])).toFixed(5));
				rtn[colNbr] = Number((rtn[colNbr]*10000).toFixed(1));
			} else { rtn[colNbr] = 0;}
			if (rtn[colNbr] > highProfit) {
				highProfit = rtn[colNbr];
				highProfCandle = i+1;
			}
			colNbr++;
		}
	} else if (os_ob.toLowerCase() === 'ob') {
		var colNbr = 20;
		for ( var i=0; i < nbrCandles; i++) {
			var canRow = tenRows[i];
			// Draw down
			if ( Number( canRow[4]) < close) { // low < close so loss
				rtn[colNbr] = Number( (Number( canRow[4]) - close).toFixed(5));
				rtn[colNbr] = Number((rtn[colNbr]*10000).toFixed(1));
			} else { rtn[colNbr] = 0;}
			if (rtn[colNbr] < largestDrawdown) {
				largestDrawdown = rtn[colNbr];
				drawDownCandle = i+1;
			}
		
			colNbr++;
			// Profit
			if ( Number( canRow[3]) > close) { // high > close so profit
				rtn[colNbr] = Number( (Number( canRow[3]) - close).toFixed(5));
				rtn[colNbr] = Number((rtn[colNbr]*10000).toFixed(1));
			} else { rtn[colNbr] = 0;}
			if (rtn[colNbr] > highProfit) {
				highProfit = rtn[colNbr];
				highProfCandle = i+1;
			}
			colNbr++;
		}
	}

	rtn[colNbr] = highProfit;
	rtn[colNbr+1] = highProfCandle;
	rtn[colNbr+2] = largestDrawdown;
	rtn[colNbr+3] = drawDownCandle;

	return rtn;
}	

//===================================================================
function saveResultSheet( fileName, resultData, worksheet, colhdg) {
	// var resultDataWB = new excel.Workbook();
//console.log( '410 ' + resultData);
	var rdRows = resultData.split('\n');

	var ws = resultDataWB.getWorksheet( worksheet);
	// Set column headings for additional candle info
	var ch = colhdg.split(',');
	var wsRow = ws.getRow( 1);
	for (var c = 21; c <= ch.length; c++) {
		wsRow.getCell( c).value = ch[c-1];
	}

	var wsr = 3; // start putting data in third row of worksheet
	for ( var r=0; r < rdRows.length; r++) {
//console.log( '422 ' + rdRows[r]);
		var rdRow = rdRows[ r].split( ',');
		wsRow = ws.getRow( wsr);
		// Put data in all the columns
		for (var c = 1; c <= rdRow.length; c++) {
			if ( isNaN( rdRow[c-1])) {
				wsRow.getCell( c).value = rdRow[c-1];
			} else {
				wsRow.getCell( c).value = Number(rdRow[c-1]);
			}
		}
		wsr++;
	}
} // end saveResultSheet

//=====================================================================
function hhCSVColumnHeadings( nbrCandles) {
	var hdg = 'Date XX/XX/XX,Time XX:XX (Military Time Format),HU/HF,'
		+ 'OB/OS,Current Candle Color,Major\'s Red Line Direction,'
		+ 'Major\'s Green Line Direction,Minors\' Black Line Direction,'
		+ 'Minors\' Grey Line Direction,Press. Direction,'
		+ 'Green Pressure Index,Red Pressure Index,'
		+ 'Thick R/G TNT Color,Dotted R/G TNT Color,'
		+ 'Thick Orange TNT Index,Thin Orange TNT Index,'
		+ 'Majors Red Line Index,Majors Green Line Index,'
		+ 'Minors Black Line Index,Minors Gray Line Index';
	for (var x = 1; x <= nbrCandles; x++) {
		hdg += ',Candle +' + x + ' Draw Down,Candle +' + x + ' Max Profit'
	}
	hdg += ',Highest Profit,High Profit Candle,Largest Draw Down,Draw Down Candle'
	return hdg;
}

//=====================================================================
function displayHelp() {
	console.log( '\nRunning the BBB Analysis\n\n'
		+ 'Open node command window\n'
		+ 'Command fxbbbanalysis.js\n'
		+ '	Parms: \n'
		+ '..	-t/-trade: Path to file containing trade data\n'
		+ '..	-c/-chart: Path to file containing the chart data\n'
		+ '			When doing all worksheets in a spreadsheet, use a variable\n'
		+ '			in place of the chart timeframe (&tf). Example: \\path\\BBB EURUSD &tf Chart.csv\n'
		+ '..	-o/-output: Path to output file name\n'
		+ '..	-can/-candles: Number of candles to compare for order closure (max. 10 candles)\n'
		+ '..	-ws/-worksheet: Name of the worksheet within the Excel spreadsheet (workbook)\n'
		+ '..	-h/-help: displays this help text\n\n'
		+ 'Run examples:\n  1. node fxbbbanalysis-xls -c "D:\\Russ\\Documents\\Forex\\BBB\\Chart Data\\B2B EURUSD &tf Chart.csv" -t "D:\\Russ\\Documents\\Forex\\BBB\\Trade Workbooks\\BBB EURUSD RussR.xlsx"\n'
		+ '  2. node fxbbbanalysis-xls -c "D:\Russ\Documents\Forex\BBB\Chart Data\BBB EURUSD 120m Chart.csv" -t "D:\Russ\Documents\Forex\BBB\Trade Workbooks\BBB EURUSD RussR.xlsx" -ws "120m €$"');
}