// Gather analysis information for Forex trading
// Command parms:
//  -input, -i: Input file name
//  -chart, -c: Compare data file name; Candles to gather data for
//  -output, -o: Output file name

// Input file CSV structure: 
//  Date, Time, HU/HF, OB/OS

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

var parms = process.argv;
var tradeFile, chartDataFile, writeFile; 
var currency, nbrCandles;

tradeFile = 'S:\\Forex\\EURUSD BBB 30m.csv';
chartFile = 'S:\\Forex\\EURUSD BBB 30m chart.csv';
writeFile = 'S:\\Forex\\EURUSD BBB.csv';

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
			writeFile = parms[i+1];
			i++;
		}
		if (parms[i] == '-cur' || parms[i] == '-currency') {
			currency = parms[i+1];
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
	}
}

const fs = require( 'fs');
// fs.writeFileSync( WRITEFILE, data, 'UTF-8', callBack);
const SHORT = 'short', LONG = 'long';

var placedTrades, filledTrades, stoppedTrades, cancelledTrades;
var tradeData = fs.readFileSync( tradeFile, 'UTF-8');
var chartData = fs.readFileSync( chartFile, 'UTF-8');

hiccupHeadfake( tradeData, chartData);
process.exit(-1);

//======================================================

function hiccupHeadfake ( data, chartData) {
	var dataLines = data.split('\n');
	var chartLines = chartData.split('\r\n');

	var date, time, hour, minute, open, high, low, close;
	var candleColor, os_ob, hiccups, headFakes, writeData = [];

	// Variables for current row
	var thickOrange = 0, thinOrange, minorBlack, minorGray, majorRed, majorGreen, pressGreen, pressRed;

	// vars that start with "p" are values from previous row
	var pthickOrange, pthinOrange, pminorBlack, pminorGray, pmajorRed, pmajorGreen, ppressGreen, ppressRed;
	var cli = 0;

// Loop through the data, split it into array elements and calculate trades.
	for (var r = 1; r < dataLines.length; r++) {
		if (dataLines[r] === '') {
			break;
		}
		if (cli >= chartLines.length || chartLines[cli] == '') {
			break;
		}
		var row = dataLines[r].split(',');
		var clRow = chartLines[cli].split(',');

		time = row[1].substr(1,8);
		date = new Date( row[0] + ' ' + time);// + ' UTC');
		hour = time.split(':')[0];
		minute = time.split(':')[1];
		open = Number( row[2]);
		high = Number( row[3]);
		low = Number( row[4]);
		close = Number( row[5]);

		if (close > open) {
			candleColor = 'Green';
		} else if (close < open) {
			candleColor = 'Red';
		} else {
			candleColor = 'Doji';
		}

		thickOrange = Number( row[44]);
		thinOrange  = Number( row[38]);
		minorGray   = Number( row[54]);
		minorBlack  = Number( row[58]);
		majorGreen  = Number( row[59]);
		majorRed    = Number( row[60]);
		pressGreen  = Number( row[63]);
		pressRed    = Number( row[64]);

		// if (thickOrange == 0) {
		// 	continue; // loop again
		// }
		// if (majorGreen > 50 && majorRed > 50) {
		// 	os_ob = 'Overbought';
		// } else if (majorGreen < 25 && majorRed < 25) {
		// 	os_ob = 'Oversold';
		// } else {
		// 	os_ob = null;
		// }

		// if (pthickOrange !== 0 && os_ob !== null) {
		var clDate = new Date( clRow[ 0] + ' ' + clRow[1]);// + ' UTC');
		if ( date.toISOString() === clDate.toISOString() ) {
debugger;
			var compResult = hhCheck( candleColor, clRow[3], clRow[2], date, time,
				pminorGray, minorGray, pminorBlack, minorBlack,
				pmajorGreen, majorGreen, pmajorRed, majorRed,
				thickOrange, thinOrange,
				ppressGreen, pressGreen, ppressRed, pressRed,
				open, high, low, close,
				clRow[4], clRow[5],
				dataLines[r+1].split(','),
				dataLines[r+2].split(','),
				dataLines[r+3].split(','),
				dataLines[r+4].split(',')
			);
			writeData += compResult.toString() + '\n';
			cli++;
			// if (compResult.hiccup === true) {
			// 	compResult.date = date;
			// 	compResult.time = time;
			// 	hiccups.push( compResult);
			// } 
			// if (compResult.headFake === true) {
			// 	compResult.date = date;
			// 	compResult.time = time;
			// 	headFakes.push( compResult);
			// }
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

	} // End for loop
	fs.writeFileSync( writeFile, writeData, 'UTF-8');
} // hiccupHeadfake function end

//===================================================================
// Check for Hiccup or Headfake 
function hhCheck ( candleColor, os_ob, hu_hf, date, time,
	pminorGray, minorGray, pminorBlack, minorBlack,
	pmajorGreen, majorGreen, pmajorRed, majorRed,
	thickOrange, thinOrange,
	ppressGreen, pressGreen, ppressRed, pressRed, 
	open, high, low, close, thickRedGreen, dottedRedGreen,
	rowp1, rowp2, rowp3, rowp4) {

	var rtn = [];
	var dbgData = {
		candleColor: candleColor, os_ob: os_ob, date: date, time: time,
		minorGray: minorGray, pminorGray: pminorGray,
		minorBlack: minorBlack, pminorBlack: pminorBlack,
		majorGreen: majorGreen, pmajorGreen: pmajorGreen,
		majorRed: majorRed, pmajorRed: pmajorRed,
		pressGreen: pressGreen, ppressGreen: ppressGreen,
		pressRed: pressGreen, ppressRed: ppressRed
	}

console.log ("Checking: " + JSON.stringify( dbgData));
debugger;
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
		rtn[9] = 'Flat';
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

	if (os_ob.toLowerCase() === 'os') { // oversold so we are expecting it to drop again
		if ( Number( rowp1[3]) > close) { // high > close so loss
			rtn[20] = Number((close - Number( rowp1[3])).toFixed(5));
			rtn[20] = Number((rtn[20]*10000).toFixed(1));
		} else { rtn[20] = 0;}
	
		if ( Number( rowp1[4]) < close) { // low < close so profit
			rtn[21] = Number( (close - Number( rowp1[4])).toFixed(5));
			rtn[21] = Number((rtn[21]*10000).toFixed(1));
		} else { rtn[21] = 0;}
// Candle + 2	
		if ( Number( rowp2[3]) > close) { // high > close so loss
			rtn[22] = Number((close - Number( rowp2[3])).toFixed(5));
			rtn[22] = Number((rtn[22]*10000).toFixed(1));
		} else { rtn[22] = 0;}

		if ( Number( rowp2[4]) < close) { // low < close so profit
			rtn[23] = Number( (close - Number( rowp2[4])).toFixed(5));
			rtn[23] = Number((rtn[23]*10000).toFixed(1));
		} else { rtn[23] = 0;}
// Candle + 3
		if ( Number( rowp3[3]) > close) { // high > close so loss
			rtn[24] = Number((close - Number( rowp3[3])).toFixed(5));
			rtn[24] = Number((rtn[24]*10000).toFixed(1));
		} else { rtn[24] = 0;}
	
		if ( Number( rowp3[4]) < close) { // low < close so profit
			rtn[25] = Number( (close - Number( rowp3[4])).toFixed(5));
			rtn[25] = Number((rtn[25]*10000).toFixed(1));
		} else { rtn[25] = 0;}
// Candle + 4
		if ( Number( rowp4[3]) > close) { // high > close so loss
			rtn[26] = Number((close - Number( rowp4[3])).toFixed(5));
			rtn[26] = Number((rtn[26]*10000).toFixed(1));
		} else { rtn[26] = 0;}
	
		if ( Number( rowp4[4]) < close) { // low < close so profit
			rtn[27] = Number( (close - Number( rowp4[4])).toFixed(5));
			rtn[27] = Number((rtn[27]*10000).toFixed(1));
		} else { rtn[27] = 0;}

// 		if (candleColor === 'Green'
// 			&& pressGreen > pressRed
// 			&& minorGray >= -90 && minorGray > pminorGray
// 			&& minorBlack >= -90 && minorBlack > pminorBlack
// 			&& (majorRed <= 30 && majorRed < minorGray)
// 			&& majorRed > pmajorRed
// 			&& (majorGreen <= 30 && majorGreen < minorBlack)
// 			&& majorGreen > pmajorGreen) {
// debugger;
// 			if (majorGreen <= majorRed) {
// 				rtn.hiccup = true;
// 			} else {
// 				rtn.headFake = true;
// 			}
// 		}
	} else if (os_ob.toLowerCase() === 'ob') {
		if ( Number( rowp1[4]) < close) { // low < close so loss
			rtn[20] = Number( (Number( rowp1[4]) - close).toFixed(5));
			rtn[20] = Number((rtn[20]*10000).toFixed(1));
		} else { rtn[20] = 0;}
	
		if ( Number( rowp1[3]) > close) { // high > close so profit
			rtn[21] = Number( (Number( rowp1[3]) - close).toFixed(5));
			rtn[21] = Number((rtn[21]*10000).toFixed(1));
		} else { rtn[21] = 0;}// 		if (candleColor === 'Red'
// Candle + 2
		if ( Number( rowp2[4]) < close) { // low < close so loss
			rtn[22] = Number( (Number( rowp2[4]) - close).toFixed(5));
			rtn[22] = Number((rtn[22]*10000).toFixed(1));
		} else { rtn[22] = 0;}
	
		if ( Number( rowp2[3]) > close) { // high > close so profit
			rtn[23] = Number( (Number( rowp2[3]) - close).toFixed(5));
			rtn[23] = Number((rtn[23]*10000).toFixed(1));
		} else { rtn[23] = 0;}// 		if (candleColor === 'Red'
// Candle + 3
		if ( Number( rowp3[4]) < close) { // low < close so loss
			rtn[24] = Number( (Number( rowp3[4]) - close).toFixed(5));
			rtn[24] = Number((rtn[24]*10000).toFixed(1));
		} else { rtn[24] = 0;}
	
		if ( Number( rowp3[3]) > close) { // high > close so profit
			rtn[25] = Number( (Number( rowp3[3]) - close).toFixed(5));
			rtn[25] = Number((rtn[25]*10000).toFixed(1));
		} else { rtn[25] = 0;}// 		if (candleColor === 'Red'
// Candle + 4
		if ( Number( rowp4[4]) < close) { // low < close so loss
			rtn[26] = Number( (Number( rowp4[4]) - close).toFixed(5));
			rtn[26] = Number((rtn[26]*10000).toFixed(1));
		} else { rtn[26] = 0;}
	
		if ( Number( rowp4[3]) > close) { // high > close so profit
			rtn[27] = Number( (Number( rowp4[3]) - close).toFixed(5));
			rtn[27] = Number((rtn[27]*10000).toFixed(1));
		} else { rtn[27] = 0;}// 		if (candleColor === 'Red'
// 			&& pressGreen > pressRed
// 			&& minorGray <= 90 && minorGray < pminorGray
// 			&& minorBlack <= 90 && minorBlack < pminorBlack
// 			&& (majorRed >= 70 && majorRed > minorGray)
// 			&& majorRed < pmajorRed
// 			&& (majorGreen >= 70 && majorGreen > minorBlack)
// 			&& majorGreen < pmajorGreen) {
// debugger;
// 			if (majorGreen >= majorRed) {
// 				rtn.hiccup = true;
// 			} else {
// 				rtn.headFake = true;
// 			}
// 		}
	}
	return rtn;
}

function displayHelp() {
	console.log( '\nRunning the BBB Analysis\n\n'
		+ '. Open node command window\n'
		+ '. Command fxbbbanalysis.js\n'
		+ '.. Parms: \n'
		+ '..	-t/-trade: path to file containing trade data\n'
		+ '..	-c/-chart: path to file containing the chart data\n'
		+ '..	-o/-output: path to output file name\n'
		+ '..	-cur/-currency: name of the currency pair\n'
		+ '..	-can/-candles: number of candles to compare for order closure\n'
		+ '..   -h/-help: displays this help text\n\n'
		+ 'Run example: node fxbbbanalysis.js -t "s:\\Forex\\EURUSD BBB 120m.csv" -c "s:\\forex\\eurusd bbb 120m Compare.csv"');
}