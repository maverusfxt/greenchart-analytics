//node documents/daytrading/dtanalysis.js

// [ ] Monthly Summary
// [ ] Add starting balance and add trade income into growing balance
// [X] Do addition of 6 points to even numbered trade points
// [X] Calculate correct pivot levels for trade (i.e. S2-S1 or S1-S2)
// [X] Display a message when a trade activates and fills.
// [X] Code in stop loss
// [X] Resistance points at penny levels (psych levels).
// [ ] If space between levels is > 30(?) pips, split into multiple trades.
//       -- Set a second pair of percentages for these larger spaces
// [X] Add "farthest" field for farthest away from entry price.
// [ ] Add days before stop loss takes affect
// [ ] Trailing Stop. For trailing stop, I need more granular data.
// [ ] Place trades based upon current trend.

const fs = require( 'fs');
// const readline = require( 'readline');

// 1 month = 22 days, one year = 312 days
const MINPOINTS = 56, MAXPOINTS = 116,MAXPERIODS = 192,  MAXDAYS = 312; 
const STARTDATE = '2015-01-01', ENDDATE = '2015-12-31';
// const PCT1 = .10, PCT2 = .40, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .10, PCT2 = .50, SPREAD = .00010, COMMISSIONPOINTS = 6;
//const PCT1 = .10, PCT2 = .60, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .20, PCT2 = .50, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .20, PCT2 = .60, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .20, PCT2 = .70, SPREAD = .00010, COMMISSIONPOINTS = 6;
const PCT1 = .10, PCT2 = .60, SPREAD = .00000, COMMISSIONPOINTS = 6;
// const PCT1 = .30, PCT2 = .60, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .30, PCT2 = .70, SPREAD = .00010, COMMISSIONPOINTS = 6;
// const PCT1 = .30, PCT2 = .80, SPREAD = .00010, COMMISSIONPOINTS = 6;
const TRADEHOURS = ['00','13'];
const STOPPOINTS = .01000; // stop points
const OUTPUTDETAILS = false;
// const FILENAME = 's:\\DayTrading\\EURUSD 12hr Pivot.txt';
const FILENAME = 'S:\\DayTrading\\AUDUSD Pivots.txt';

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// console.log( 'readline=' + JSON.stringify(readline));
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

	//0=Date, 1=Time, 2=Open, 3=High, 4=Low, 5=Last, 13=R1, 14=R2, 15=S1, 16=S2
	// 20=R3, 24=S3, 25=PP
var studyData = fs.readFileSync( FILENAME, 'UTF-8');
replayTrades( studyData, MINPOINTS, MAXPOINTS, STARTDATE, ENDDATE, PCT1, PCT2, SPREAD, COMMISSIONPOINTS, TRADEHOURS, STOPPOINTS, OUTPUTDETAILS, false, false, true);
//return;

function replayTrades( data, mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, 
	trdHours, stopPts, multTrades, outDtls, wkSmry, mthSmry, psychLevels, maxShort, maxLong) {

	var dataLines, process = false, prvDate, dayCount = 1;
	var s1, s2, s3, pp, r1, r2, r3,cp;
	trades = [];
	firstDateProcessed = null;
	filledPoints = 0;
	maxCarryOver = 0;
	totalStops = 0;
	totalStopPoints = 0;
	placedTrades = [];
	filledTrades = [];
	stoppedTrades = [];
	unactivatedTrades = [];

	console.log('\n========================== S T A R T ==========================');

	//0=Date, 1=Time, 2=Open, 3=High, 4=Low, 5=Last, 13=R1, 14=R2, 15=S1, 16=S2
	// 20=R3, 24=S3, 25=PP
	dataLines = data.split('\n');

	// rl.question( 'Ready to proceed? ', (answer) => {
	// 	console.log( 'You answered ' + answer);
	// 	rl.close;
	// });
	for ( var x in dataLines) {
		if (dataLines[x] == '') {
			break;
		}
		var data = dataLines[x].split(', ');

		cp = data[2];
		var time = data[1].substr(0,5);
		var hour = time.split(':')[0];
		var minute = time.split(':')[1];
		var date = null;
// debugger;
		if (data[0] == 'Date') {
			date = '0001-01-01';
		} else {
			date = new Date( data[0]).toISOString().substr(0,10);
		}

		if ( date != '0001-01-01' && date >= stDate && process == false) {
			process = true;
			prvDate = date;
			firstDateProcessed = date;
		}
		// If it isn't the column names and there is a pivot point > 0
		if (process == true && data[14] != 0 && data[0] != 'Date') {

			if ( date !== prvDate) {
				dayCount++;
				prvDate = date;
			}
			// New pivot chart time?
			if ( trdHours.indexOf( hour) >= 0 && minute !== '30') {
				removeFilled( trades);
				closeInactive( trades, outDtls);
				// console.log( 'Current Open Price: ' + cp);
				s1 = data[15];
				s2 = data[16];
				s3 = data[24];
				pp = data[25];
				r1 = data[13];
				r2 = data[14];
				r3 = data[20];
				r4 = data[26];
				s4 = data[27];

				var levelBreaks = [ Number( cp), Number( s4), Number( s3), Number( s2), Number( s1), Number( pp), Number( r1), Number( r2), Number( r3), Number( r4)];
				levelBreaks = levelBreaks.sort();

				placeTrade( date, time, s4, s3, cp, 'S4', 'S3', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, s3, s2, cp, 'S3', 'S2', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, s2, s1, cp, 'S2', 'S1', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, s1, pp, cp, 'S1', 'PP', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, pp, r1, cp, 'PP', 'R1', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, r1, r2, cp, 'R1', 'R2', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, r2, r3, cp, 'R2', 'R3', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
				placeTrade( date, time, r3, r4, cp, 'R3', 'R4', mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);

				// if (MAXDAYS === 1 || outDtls) {
				if (endDate == stDate) {
					for (var x in trades ) {
						if( trades[x].status === 'placed')  {
							console.log( 'Trades: ' + JSON.stringify(trades[x]));
						}
					}
					console.log( '\n');
				}

				//if (x > MAXPERIODS) {break;}
				//break;
				// if (dayCount > MAXDAYS) {
				if (date > endDate) {
// debugger;
					checkTrades( trades, data, spread, stopPts, outDtls);
					break;
				}
			} // end if trdHours
		// Now go through the trades and see if any activated or filled.
		} // end if data[14]
		checkTrades( trades, data, spread, stopPts, outDtls);
	} // for var x in datalines

	removeFilled( trades);
	closeInactive( trades, outDtls);

	// console.log( '\n');
	// debugger;
	console.log( 'Settings\n========');
	console.log( 'Start Date: ' + firstDateProcessed + ' through ' + endDate + '.');
	console.log( 'Trade Hours: ' + trdHours[0] + ' and ' + trdHours[1]);
	console.log( 'Minimum/Maximum Points: ' + mnPts + '/' + mxPts);
	console.log( 'Stop Points: ' + (stopPts*100000).toFixed(0) + ' (Pips:' + (stopPts*10000).toFixed(1) + ')');
	console.log( 'Entry/Exit Percentages: ' + (pctMin*100) + '/' + (pctMax*100));
	console.log( '\nTrade Stats\n===========');
	console.log( 'Filled Points: ' + filledPoints + '  (Pips: ' + (filledPoints*.1).toFixed(1) + ')');
	console.log( 'Average Pips per day: ' + ((filledPoints / dayCount)*.1).toFixed(1));
	console.log( 'Maximum Cary Over Trades: ' + maxCarryOver);
	console.log( 'Total Stops: ' + totalStops);
	console.log( 'Total Stop Loss Points: ' + totalStopPoints + '  (Pips: ' + (totalStopPoints*.1).toFixed(1) + ')');
	console.log( 'Pips gain/loss: ' + ((filledPoints - totalStopPoints)*.1));
	console.log('============================ E N D ============================');

	return {
		pctMin: pctMin*100,
		pctMax: pctMax*100,
		placed: placedTrades,
		filled: filledTrades,
		stopped: stoppedTrades,
		unactivated: unactivatedTrades
	};
	// console.log('\n');
} // End replayTrades function

//======================================================================================================
function placeTrade( date, time, low, high, cp, lowLevel, highLevel, mnPts, mxPts, stDate, endDate, pctMin, pctMax, spread, comm, 
	trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks) {
	var type, entry = 0, exit = 0, points = 0;
	var point = 0, level2 = null, mod = 0;
	low = Number(low);
	high = Number(high);
	cp = Number(cp);
	mnPts += comm;
	mxPts += comm;
	var tradeType;

	if (low < cp) {
		tradeType = 'short';
	} else {
		tradeType = 'long';
	}

	if ( tradeType == 'short'
		&& (levelBreaks.indexOf( cp) - levelBreaks.indexOf( low)) > maxShort)
	{
			return;
	}
	if ( tradeType == 'long'
		&& (levelBreaks.indexOf( high) - levelBreaks.indexOf( cp)) > maxLong)
	{
			return;
	}

// Calculate for psych resistance/support level?
	if (psychLevels) {
		if ( String(low).substr(String(low).indexOf('.')+1,2) != String(high).substr(String(high).indexOf('.')+1,2)) {
			// Low is below high so set resistance level to match high
			if ( tradeType == 'long') { // && String(low).substr(String(low).indexOf('.')+1,2) < String(high).substr(String(high).indexOf('.')+1,2)) {
				high = Number( String(high).substr(0,String( high).indexOf('.')+1) + String(high).substr(String(high).indexOf('.')+1,2));
			}
			// Short trade so set support level to match low
			if ( tradeType == 'short') { // && String(low).substr(String(low).indexOf('.')+1,2) < String(high).substr(String(high).indexOf('.')+1,2)) {
				low = Number( String(high).substr(0,String( high).indexOf('.')+1) + String(high).substr(String(high).indexOf('.')+1,2));
			}
		}
	}

	// Current Price trades
	if ( cp > low && cp < high) {
		entry = Number((cp - ((cp-low)*pctMin)).toFixed(5));
		exit = Number((cp - ((cp-low)*pctMax)).toFixed(5));
		points = Number(((entry - exit)*100000).toFixed(0));

		// set the points to whole pips plus commission pts
		var result = setExitCommission( points, entry, exit, comm);
		points = result.points-comm;
		exit = result.exit;

		if (points > mxPts) {
			points = mxPts-comm;
			exit = entry - Number((mxPts/100000).toFixed(5));
		}
		type = 'short';
		level2 = 'CP-' + lowLevel;
		if (points >= (mnPts-comm)) {
			trades = pushTrade( trades, date, time, entry, exit, points, type, level2);
		}

// CP up to next level
		entry = Number((cp + ((high-cp)*pctMin)).toFixed(5));
		exit = Number((cp + ((high-cp)*pctMax)).toFixed(5));
		points = Number(((exit - entry)*100000).toFixed(0));
		// set the points to whole pips plus 6 points
		var result = setExitCommission( points, entry, exit, comm);
		points = result.points-comm;
		exit = result.exit;

		if (points > mxPts) {
			points = mxPts-comm;
			exit = Number((entry + (mxPts/100000)).toFixed(5));
		}
		type = 'long';
		level2 = 'CP-' + highLevel;

// Short Trade
	} else if (tradeType === 'short') {
		entry = Number((high - ((high-low)*pctMin)).toFixed(5));
		exit = Number((high - ((high-low)*pctMax)).toFixed(5));
		points = Number(((entry - exit)*100000).toFixed(0)); //.toPrecision(3);
		// set the points to whole pips plus 6 points
		var result = setExitCommission( points, entry, exit, comm);
		points = result.points-comm;
		exit = result.exit;

		type = tradeType;
		if (points > mxPts) {
			points = mxPts-comm;
			exit = Number((entry - (mxPts/100000)).toFixed(5));
			if (multTrades) {
				placeTrade( date, time, low, exit, cp, lowLevel, highLevel, mnPts-comm, mxPts-comm, stDate, endDate, pctMin, pctMax, spread, comm, 
					trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
			}
		}
		level2 = highLevel + '-' + lowLevel;

// Long Trade
	} else {
		entry = Number((low + ((high-low)*pctMin)).toFixed(5));
		exit = Number((low + ((high-low)*pctMax)).toFixed(5));
		points = Number(((exit - entry)*100000).toFixed(0)); //.toPrecision(3);
		// set the points to whole pips plus 6 points
		var result = setExitCommission( points, entry, exit, comm);
		points = result.points-comm;
		exit = result.exit;

		type = tradeType;
		if (points > mxPts) {
			points = mxPts-comm;
			exit = Number((entry + (mxPts/100000)).toFixed(5));
			if (multTrades) {
				placeTrade( date, time, exit, high, cp, lowLevel, highLevel, mnPts-comm, mxPts-comm, stDate, endDate, pctMin, pctMax, spread, comm, 
	trdHours, stopPts, multTrades, psychLevels, maxShort, maxLong, levelBreaks);
			}
		}
		level2 = lowLevel + '-' + highLevel;
	}

	if (points >= (mnPts-comm)) {
		trades = pushTrade( trades, date, time, entry, exit, points, type, level2);
	}
} // End of placeTrade

//======================================================================================================
function setExitCommission( points, entry, exit, comm) {
// debugger;
	mod = points % 10; // get the partial pips, e.g. .8 (point 8)
	if (mod > comm) {
		points = ((Math.floor( points/10)*10)+comm);
	} else if (mod < comm) {
		points = (((Math.floor( points/10)-1)*10)+comm);
	}
	if (entry > exit) { // short trade, subtrace points from entry
		exit = Number((entry - (points/100000)).toFixed(5));
	} else {
		exit = Number((entry + (points/100000)).toFixed(5));
	}
	return { points: points, exit: exit};
}

//======================================================================================================
function pushTrade( pTrades, pDate, pTime, pEntry, pExit, pPoints, pType, pLevel) {
	var temp = {};
	temp.placedDate = pDate;
	temp.placedTime = pTime;
	temp.level = pLevel;
	temp.entry = Number(pEntry);
	temp.exit = Number(Number(pExit).toFixed(5));
	temp.points = Number(pPoints);
	temp.type = pType;
	temp.status = 'placed';
	pTrades.push( temp);
	placedTrades.push( temp);
	// console.log( 'Trade: ' + JSON.stringify(temp));
	return pTrades;
}

//======================================================================================================
function closeInactive( pTrades, outDtls) {
	// console.log( '\n****** Did Not Activate ******');
	for (var x = pTrades.length-1; x >= 0; x--) {
		if (pTrades[x].status == 'placed') {
			// console.log( JSON.stringify(pTrades[x]));
			unactivatedTrades.push(pTrades[x]);
			markPlacedTrade( pTrades[x].placedDate, pTrades[x].placedTime, pTrades[x].entry, 'cancelled', pTrades[x].stopDate, pTrades[x].stopTime);
			pTrades.splice( x,1);
		}
	}
	// console.log( '*******************************\n');

	if (outDtls) {
		console.log( '\n****** Remaining Trades ******');
		for (var x = pTrades.length-1; x >= 0; x--) {
			console.log( JSON.stringify(pTrades[x]));
		}
		console.log( '********************************\n');
	}
	if (maxCarryOver < pTrades.length) {
		maxCarryOver = pTrades.length;
	}
}

//======================================================================================================
function removeFilled( pTrades) {
	// console.log( '\n=====================================================================');
	// console.log( '****** Filled Trades ******');
	for (var x = pTrades.length-1; x >= 0; x--) {
//debugger;
		if (pTrades[x].status == 'filled') {
			// console.log( JSON.stringify(pTrades[x]));
			filledPoints += Number(pTrades[x].points);
			filledTrades.push(pTrades[x]);
			markPlacedTrade( pTrades[x].placedDate, pTrades[x].placedTime, pTrades[x].entry, 'filled', pTrades[x].filledDate, pTrades[x].filledTime);
			pTrades.splice( x,1);
		} else 
		if (pTrades[x].status == 'stopped') {
			stoppedTrades.push(pTrades[x]);
			markPlacedTrade( pTrades[x].placedDate, pTrades[x].placedTime, pTrades[x].entry, 'stopped', pTrades[x].stopDate, pTrades[x].stopTime);
			pTrades.splice( x,1);
		}
	}
	// console.log( '***************************\n');
}

//======================================================================================================
function markPlacedTrade( date, time, entry, newStatus, stsDate, stsTime) {
	for (var x = 0; x < placedTrades.length; x++ )	 {
		if ( placedTrades[x].placedDate == date && placedTrades[x].placedTime == time && placedTrades[x].entry == entry) {
			placedTrades[x].status = newStatus;
			if (newStatus == 'filled') {
				placedTrades[x].filledDate = stsDate;
				placedTrades[x].filledTime = stsTime;
			} else if (newStatus == 'stopped') {
				placedTrades[x].stopDate = stsDate;
				placedTrades[x].stopTime = stsTime;
			}
			break; // leave the loop
		}
	}
}

//======================================================================================================
function checkTrades( pTrades, pData, spread, stopPts, outDtls) {

	if (pTrades.length == 0) {return;}

	var high = Number(pData[3]);
	var low = Number(pData[4]);
	var time = pData[1].substr(0,5);
	var date = pData[0].replace(/\//g, '-');
	var open = pData[2];

	for (var x in pTrades) {
		// Do not check the trade if it is filled or stopped.
		if (pTrades[x].status === 'filled' || pTrades[x].status === 'stopped') {continue;}

// Check to see if the trade just filled.
		if ( (pTrades[x].type == 'long' && high >= (pTrades[x].exit)+spread)
			|| (pTrades[x].type == 'short' && low <= (pTrades[x].exit)-spread)) {
			pTrades[x].status = 'filled';
			pTrades[x].filledPrice = pTrades[x].exit;
			if (outDtls) {
				console.log( 'Filled ' + pTrades[x].type + ', Placed: ' + pTrades[x].placedDate + ',' + pTrades[x].placedTime + ', Filled Price: ' + pTrades[x].filledPrice + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Points: ' + pTrades[x].points + ', Level: ' + pTrades[x].level);
			}
			pTrades[x].filledDate = date;
			pTrades[x].filledTime = time;

// Check to see if the price is in the entry/exit range.
		} else 
		if ((pTrades[x].type == 'long' && high+spread >= pTrades[x].entry
			|| pTrades[x].type == 'short' && low-spread <= pTrades[x].entry)
			&& pTrades[x].status !== 'active'
			) {
			pTrades[x].status = 'active';
			pTrades[x].activeDate = date;
			pTrades[x].activeTime = time;
			if (outDtls) {
				console.log( 'Activated ' + pTrades[x].type + ', High/Low: ' + high + '/' + low + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Level: ' + pTrades[x].level);
			}

// Check to see if trade stopped out.			
		} else 
		if ( pTrades[x].status == 'active' &&
			(pTrades[x].type == 'long' && low <= (pTrades[x].entry)-stopPts
			|| pTrades[x].type == 'short' && high >= (pTrades[x].entry)+stopPts)) {
			pTrades[x].status = 'stopped';
			pTrades[x].stopDate = date;
			pTrades[x].stopTime = time;
			if (pTrades[x].type == 'long') {
				pTrades[x].stopPrice = Number((pTrades[x].entry - stopPts).toFixed(5));
			} else {
				pTrades[x].stopPrice = Number((pTrades[x].entry + stopPts).toFixed(5));
			}
			totalStops++;
			totalStopPoints += (stopPts * 100000);
			if (outDtls) {
				console.log( 'Stopped ' + pTrades[x].type + ', Placed dt/tm: ' + pTrades[x].placedDate + ',' + pTrades[x].placedTime + ', High/Low: ' + high + '/' + low + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Level: ' + pTrades[x].level);
			}
		} else
// Record point the prices was furthest from trade
		if ( pTrades[x].status == 'active') {
// Record furthest price point
			if (pTrades[x].type == 'short' && (pTrades[x].furthest == undefined || pTrades[x].furthest < high)) {
				pTrades[x].furthest = high;
				pTrades[x].furthestDtTm = date + ' ' + time;
			} else {
				if (pTrades[x].type == 'long' && (pTrades[x].furthest == undefined || pTrades[x].furthest > low)) {
					pTrades[x].furthest = low;
					pTrades[x].furthestDtTm = date + ' ' + time;
				}
			}
// Record closest price point
			if (pTrades[x].type == 'short' && (pTrades[x].closest == undefined || pTrades[x].closest > low)) {
				pTrades[x].closest = low;
				pTrades[x].closestDtTm = date + ' ' + time;
			 } else {
				if (pTrades[x].type == 'long'  && (pTrades[x].closest == undefined || pTrades[x].closest < high)) {
					pTrades[x].closest = high;
					pTrades[x].closestDtTm = date + ' ' + time;
				}
			}
		}
	}
}