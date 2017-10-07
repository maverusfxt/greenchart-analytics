// [ ] Monthly Summary
// [ ] Add starting balance and add trade income into growing balance
// [X] Do addition of 6 points to even numbered trade points
// [X] Calculate correct pivot levels for trade (i.e. S2-S1 or S1-S2)
// [X] Display a message when a trade activates and fills.
// [X] Code in stop loss
// [X] Resistance points at penny levels.
// [x] If space between levels is > 30(?) pips, split into multiple trades.
//       -- Set a second pair of percentages for these larger spaces
// [ ] Add "farthest" field for farthest away from entry price.
// [ ] ?Add days before stop loss takes affect
// [ ] Place trades base upon current trend.

// To Do List as of 2017-03-09
// [X] For multiple Trades, keep pivot levels in tact for additional trades
// [X] Implement Days of Week
// [ ] Daily , Weekly, and Monthly summaries.
// [ ] Place trades based upon trend?
// [X] Running dollar balance
// [X] Clicking on a summary row displays table with that information.

// Data columns
// 0     1     2     3     4    5     6       7            8         9        10      11       12       13  14  15  16  17   18    19    20  21   22    23    24  25  26  27  28    29    33  31  32  33  34  35  36  37  38  39  40   41
// Date, Time, Open, High, Low, Last, Volume, # of Trades, OHLC Avg, HLC Avg, HL Avg, Bid Vol, Ask Vol, R1, R2, S1, S2, R.5, R1.5, R2.5, R3, S.5, S1.5, S2.5, S3, PP, R4, S4, R3.5, S3.5, R5, S5, R6, S6, R7, S7, R8, S8, R9, S9, R10, S10

const fs = require( 'fs');
const FILENAME = 'S:\\DayTrading\\AUDUSD Pivots.txt';

const SHORT = 'short', LONG = 'long';

var placedTrades, filledTrades, stoppedTrades, cancelledTrades;
var studyData = fs.readFileSync( FILENAME, 'UTF-8');

function replayTrades( data, minPoints, maxPoints, startDate, endDate, entryPct, exitPct,
	spread, commission, tradeHours, stopPips, multTrades, outDetails, weekly, monthly,
	psychLevels, maxShortLevels, maxLongLevels, dow, strict, strBalance, acctPercent) {

	minPoints = Number( minPoints);
	maxPoints = Number( maxPoints);
	startDate = new Date( startDate+' 00:00:00');
	endDate   = new Date( endDate + ' 00:00:00');
	entryPct  = Number( entryPct);
	exitPct   = Number( exitPct);
	spread    = Number( spread);
	commission = Number( commission);
	stopPips  = Number( stopPips);
	maxShortLevels = Number( maxShortLevels);
	maxLongLevels = Number( maxLongLevels);

// Initialize totals
	firstDate = null;
	trades = [];
	filledPoints = 0;
	dayCount = 0;
	maxCarryOver = 0;
	totalStops   = 0;
	totalStopPoints = 0;
	placedTrades = [];
	filledTrades = []
	stoppedTrades = [];
	cancelledTrades = [];
	newBalance = strBalance;

	var process = false, prvDate = new Date( '1980-01-01 00:00:00');
	var dataLines = data.split('\n');

// Loop through the data, split it into array elements and calculate trades.
	for (var r = 0; r < dataLines.length; r++) {
		if (dataLines[r] == '') {
			break;
		}

		var row = dataLines[r].split(',');
		var date, time, hour, minute, open, high, low, last, cp, r1, r2, r3, r4, pp, s1, s2, s3, s4;

		if (row[0] == 'Date') {
			continue; // loop again
		}

		date = new Date( row[0] + ' 00:00:00');
		time = row[1].substr(1,8);
		hour = time.split(':')[0];
		minute = time.split(':')[1];

		if (date >= startDate) {
			process = true;
			if (firstDate == null) {
				firstDate = date;
			}
			if (date.toISOString().substr(0,10) !== prvDate.toISOString().substr(0,10)) {
				prvDate = date;
				dayCount ++;
			}
		} // date >= startDate

		if (process) {
// Check to see if the day of the week is traded.
			var localTradeDT = new Date( date.toISOString().substr(0,10) + ' ' + time + ' UTC');
			// var utcOffset = ((new Date().getTimezoneOffset()) / 60)
			// var localDate = new Date( date);
			// if ( Number( hour) < utcOffset) {
				// localDate = new Date( localDate.setDate(localDate.getDate()-1));
			// }
			// if ( ! dow[ localDate.getDay()]) {
			if ( ! dow[ localTradeDT.getDay()]) {
				continue;
			}

// If the hour is in the list of hours to trade, then use this line
			// if (tradeHours.indexOf( hour) >= 0 && minute != '30') {
			if ( tradeHours.indexOf( localTradeDT.getHours().toString()) >= 0 && minute != '30') {
				removeFilled( trades);
				closeInactive( trades);

				open = Number( row[2]);
				high = Number( row[3]);
				low =  Number( row[4]);
				last = Number( row[5]);
				r1 =   Number( row[13]);
				r2 =   Number( row[14]);
				r3 =   Number( row[20]);
				r4 =   Number( row[26]);
				cp =   Number( open);
				pp =   Number( row[25]);
				s1 =   Number( row[15]);
				s2 =   Number( row[16]);
				s3 =   Number( row[24]);
				s4 =   Number( row[27]);

				var levelBreaks = [cp, s4, s3, s2, s1, pp, r1, r2, r3, r4];
				levelBreaks = levelBreaks.sort();
				if (psychLevels) {
					var levelCnt = levelBreaks.length - 2;
					for ( var e = 0; e < levelCnt; e++) {
						if ( String( levelBreaks[e]).substr(0,String(levelBreaks).indexOf('.')+3) !== 
								 String( levelBreaks[e+1]).substr(0,String(levelBreaks).indexOf('.')+3)) {
							levelBreaks.push( Number( String( levelBreaks[e+1]).substr(0,String(levelBreaks[e+1]).indexOf('.')+3)));
						}
					}
					levelBreaks = levelBreaks.sort();
				}

				if (strict) {
					placeTradeStrict( date, time, localTradeDT, s4, s3, cp, 'S4', 'S3', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, s3, s2, cp, 'S3', 'S2', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, s2, s1, cp, 'S2', 'S1', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, s1, pp, cp, 'S1', 'PP', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, pp, r1, cp, 'PP', 'R1', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, r1, r2, cp, 'R1', 'R2', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, r2, r3, cp, 'R2', 'R3', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeStrict( date, time, localTradeDT, r3, r4, cp, 'R3', 'R4', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
				} else {
					placeTradeLiberal( date, time, localTradeDT, s4, s3, cp, 'S4', 'S3', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, s3, s2, cp, 'S3', 'S2', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, s2, s1, cp, 'S2', 'S1', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, s1, pp, cp, 'S1', 'PP', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, pp, r1, cp, 'PP', 'R1', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, r1, r2, cp, 'R1', 'R2', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, r2, r3, cp, 'R2', 'R3', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
					placeTradeLiberal( date, time, localTradeDT, r3, r4, cp, 'R3', 'R4', minPoints, maxPoints, startDate, endDate, entryPct, exitPct, spread, commission, tradeHours, stopPips, multTrades, psychLevels, maxShortLevels, maxLongLevels, levelBreaks, 0);
				}
				sortTrades( trades, date, time);

				if ( date > endDate) {
					checkTrades( trades, row, spread, stopPips, outDetails, commission);
					break;
				}

			} // end if Trade hours
		} // if process
		checkTrades( trades, row, spread, stopPips, outDetails, commission);
	} // for loop (through data lines)

	removeFilled( trades);
	closeInactive( trades);

	return {
		pctMin: entryPct*100,
		pctMax: exitPct*100,
		placed: placedTrades,
		filled: filledTrades,
		stopped: stoppedTrades,
		cancelled: cancelledTrades
	}
} // end ReplayTrades function

function placeTradeStrict( date, time, localTradeDT, ppLow, ppHigh, cp, lowText, highText, minPoints,
	maxPoints, startDate, endDate, entryPct, exitPct, spread, commission,
	tradeHours, stopPips, multTrades, psychLevels,
	maxShortLevels, maxLongLevels, levelBreaks, inLevelSpread) {

	var type, entryPrice, exitPrice, points, levelSpread;
	minPoints += commission;
	maxPoints += commission;

	if (ppLow <= cp && ppHigh < cp) {
		type = 'short';
	} else 
	if (ppLow >= cp && ppHigh > cp) {
		type = 'long';
	}

// Compare number of levels above and below current price. 
// Return if too many levels compared to how many were entered on the page.
	if (type == 'short'
		&& (levelBreaks.indexOf( cp) - levelBreaks.indexOf( ppLow)) > maxShortLevels) {
		return;
	}
	if (type == 'long' 
		&& (levelBreaks.indexOf( ppHigh) - levelBreaks.indexOf( cp) > maxLongLevels)) {
			return;
	}

	if (inLevelSpread == 0) {
		levelSpread = Number((ppHigh - ppLow).toFixed(5));
	} else {
		levelSpread = Number( inLevelSpread.toFixed(5));
	}

// Trades around the current price.
	if (cp > ppLow && cp < ppHigh) {
// Calculate short trade from CP to next level down.		
		type = 'short';
		result = checkPsychLevels( type, ppLow, cp);
		var low = result.low;
		// ppHigh = result.high;

		entryPrice = Number((cp - ((cp-low)*entryPct)).toFixed(5));
		exitPrice  = Number((cp - ((cp-low)*exitPct)).toFixed(5));
		points = Number(((entryPrice - exitPrice) *100000).toFixed(0));

		// set the points to whole pips plus commission pts
		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points-commission;
		exitPrice = result.exit;
		var level2 = 'CP-' + lowText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number( (entryPrice - ( maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeStrict( date, time, localTradeDT, low, exitPrice, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks, 0);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}

// Calculate long trade from CP to next level up.
		type = 'long';
		result = checkPsychLevels( type, cp, ppHigh);
		// ppLow = result.low;
		var high = result.high;

		entryPrice = Number((cp + (( high-cp)*entryPct)).toFixed(5));
		exitPrice  = Number((cp + (( high-cp)*exitPct)).toFixed(5));
		points = Number((( exitPrice - entryPrice) *100000).toFixed(0));
		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = 'CP-' + highText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number((entryPrice + (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeStrict( date, time, localTradeDT, exitPrice, high, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks, 0);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}
		if (high !== ppHigh) { // psych leval
				placeTradeStrict( date, time, localTradeDT, high, ppHigh, high, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks, 0);
		}

// Calculate short trade prices		
	} else if (type == 'short') {
		result = checkPsychLevels( type, ppLow, ppHigh);
		var low = result.low;
		var high = result.high;

		entryPrice = Number( ( high - ( levelSpread * entryPct)).toFixed(5));
		if (low === ppLow) {
			exitPrice  = Number( ( high - ( levelSpread * exitPct)).toFixed(5));
			if ( exitPrice < ppLow + (levelSpread * (1-exitPct)) ) {
				exitPrice = Number( (ppLow + (levelSpread * (1-exitPct))).toFixed(5));
			}
		} else {
			exitPrice  = Number( ( high - ( (high - low) * exitPct)).toFixed(5));
		}
		points = Number( ((entryPrice - exitPrice)*100000).toFixed(0));

		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = highText + '-' + lowText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number( (entryPrice - (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades && exitPrice > ppLow) {
				placeTradeStrict( date, time, localTradeDT, ppLow, exitPrice, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks, levelSpread);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}

// Calculate LONG trade prices		
	} else {
		result = checkPsychLevels( type, ppLow, ppHigh);
		var low = result.low;
		var high = result.high;

		entryPrice = Number( ( low + ( levelSpread * entryPct)).toFixed(5)); //*
		if (high === ppHigh) {
 			exitPrice  = Number(( low + ( levelSpread * exitPct)).toFixed(5)); //*
			if ( exitPrice > ppHigh - (levelSpread * (1-exitPct)) ) {
				exitPrice = Number( (ppHigh - (levelSpread * (1-exitPct))).toFixed(5));
			}
		} else {
			exitPrice  = Number(( low + ( (high - low) * exitPct)).toFixed(5)); //*
		}
		points = Number(((exitPrice - entryPrice)*100000).toFixed(0));

		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = lowText + '-' + highText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number( (entryPrice + (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades && exitPrice < ppHigh) {
				placeTradeStrict( date, time, localTradeDT, exitPrice, ppHigh, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks, levelSpread); //*
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}
	}

	// if (points >= minPoints) {
	// 	trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
	// }

} // end PlaceTradeStrict function

// Place trades more liberally in the larger level spreads
function placeTradeLiberal( date, time, localTradeDT, ppLow, ppHigh, cp, lowText, highText, minPoints,
	maxPoints, startDate, endDate, entryPct, exitPct, spread, commission,
	tradeHours, stopPips, multTrades, psychLevels,
	maxShortLevels, maxLongLevels, levelBreaks) {

	var type, entryPrice, exitPrice, points;
	minPoints += commission;
	maxPoints += commission;

	if (ppLow <= cp && ppHigh < cp) {
		type = 'short';
	} else 
	if (ppLow >= cp && ppHigh > cp) {
		type = 'long';
	}

// Compare number of levels above and below current price. 
// Return if too many levels compared to how many were entered on the page.
	if (type == 'short'
		&& (levelBreaks.indexOf( cp) - levelBreaks.indexOf( ppLow)) > maxShortLevels) {
		return;
	}
	if (type == 'long' 
		&& (levelBreaks.indexOf( ppHigh) - levelBreaks.indexOf( cp) > maxLongLevels)) {
			return;
	}

// Trades around the current price.
	if (cp > ppLow && cp < ppHigh) {
// Calculate short trade from CP to next level down.		
		type = 'short';
		result = checkPsychLevels( type, ppLow, cp);
		var low = result.low;
		// ppHigh = result.high;

		entryPrice = Number((cp - ((cp-low)*entryPct)).toFixed(5));
		exitPrice  = Number((cp - ((cp-low)*exitPct)).toFixed(5));
		points = Number(((entryPrice - exitPrice) *100000).toFixed(0));

		// set the points to whole pips plus commission pts
		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points-commission;
		exitPrice = result.exit;
		var level2 = 'CP-' + lowText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = entryPrice - Number(( maxPoints/100000).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeLiberal( date, time, low, exitPrice, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}

// Calculate long trade from CP to next level up.
		type = 'long';
		result = checkPsychLevels( type, cp, ppHigh);
		// ppLow = result.low;
		var high = result.high;

		entryPrice = Number((cp + (( high-cp)*entryPct)).toFixed(5));
		exitPrice  = Number((cp + (( high-cp)*exitPct)).toFixed(5));
		points = Number((( exitPrice - entryPrice) *100000).toFixed(0));
		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = 'CP-' + highText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number((entryPrice + (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeLiberal( date, time, exitPrice, high, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}
		if (high !== ppHigh) { // psych leval
				placeTradeLiberal( date, time, high, ppHigh, high, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks);
		}

// Calculate short trade prices		
	} else if (type == 'short') {
		result = checkPsychLevels( type, ppLow, ppHigh);
		ppLow = result.low;
		ppHigh = result.high;

		entryPrice = Number( ( ppHigh - (( ppHigh - ppLow)*entryPct)).toFixed(5));
		exitPrice  = Number( ( ppHigh - (( ppHigh - ppLow)*exitPct)).toFixed(5));
		points = Number( ((entryPrice - exitPrice)*100000).toFixed(0));

		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = highText + '-' + lowText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number( (entryPrice - (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeLiberal( date, time, ppLow, exitPrice, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks);
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}

// Calculate LONG trade prices		
	} else {
		result = checkPsychLevels( type, ppLow, ppHigh);
		ppLow = result.low;
		ppHigh = result.high;

		entryPrice = Number( ( ppLow + (( ppHigh - ppLow)*entryPct)).toFixed(5)); //*
		exitPrice  = Number(( ppLow + (( ppHigh - ppLow)*exitPct)).toFixed(5)); //*
		points = Number(((exitPrice - entryPrice)*100000).toFixed(0));

		var result = setExitCommission( points, entryPrice, exitPrice, commission);
		points = result.points - commission;
		exitPrice = result.exit;
		var level2 = lowText + '-' + highText;

		if (points > maxPoints) {
			points = maxPoints - commission;
			exitPrice = Number( (entryPrice + (maxPoints/100000)).toFixed(5));
			trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			if (multTrades) {
				placeTradeLiberal( date, time, exitPrice, ppHigh, cp, lowText, highText, minPoints-commission,
					maxPoints-commission, startDate, endDate, entryPct, exitPct, spread, commission,
					tradeHours, stopPips, multTrades, psychLevels,
					maxShortLevels, maxLongLevels, levelBreaks); //*
			}
		} else {
			if (points >= minPoints) {
				trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
			}
		}
	}

	// if (points >= minPoints) {
	// 	trades = pushTrade( trades, date, time, entryPrice, exitPrice, points, type, level2);
	// }

} // end PlaceTradeLiberal function

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
	temp.lotSize = Number((newBalance *.0001).toFixed(2));
	pTrades.push( temp);
	// placedTrades.push( temp);
	return pTrades;
}

//======================================================================================================
function sortTrades( pTrades, pDate, pTime) {
	var st = [];
	for ( var i = pTrades.length-1; i >= 0; i--) {
		if ( pTrades[i].placedDate == pDate && pTrades[i].placedTime == pTime) {
			st.push( pTrades[i]);
			pTrades.splice( i,1); // delete the trade because it will be put back after sorted
		} else {
			break;
		}
	}
	st.sort( compare);
	for (var i = 0; i < st.length; i++) {
		pTrades.push( st[i]);
		placedTrades.push( st[i]);
	}
}

//======================================================================================================
function compare( a, b) {
	if (a.entry > b.entry) {
		return -1;
	}
	if (a.entry < b.entry) {
		return 1;
	}
}

//======================================================================================================
function setExitCommission( points, entry, exit, comm) {
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
function closeInactive( pTrades) {
	for (var x = pTrades.length-1; x >= 0; x--) {
		if (pTrades[x].status == 'placed') {
			cancelledTrades.push(pTrades[x]);
			markPlacedTrade( pTrades[x].placedDate, pTrades[x].placedTime, pTrades[x].entry, 'cancelled', pTrades[x].stopDate, pTrades[x].stopTime);
			pTrades.splice( x,1);
		}
	}

	if (pTrades.length > 0) {
		placedTrades[ placedTrades.length - 1].maxCarryover = pTrades.length;
	}
	if (maxCarryOver < pTrades.length) {
		maxCarryOver = pTrades.length;
	}
}

//======================================================================================================
function removeFilled( pTrades) {
	for (var x = pTrades.length-1; x >= 0; x--) {
		if (pTrades[x].status == 'filled') {
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
function checkTrades( pTrades, pData, spread, stopPts, outDtls, commission) {
	// debugger;
	if (pTrades.length == 0) {return;}

	var high = Number(pData[3]);
	var low = Number(pData[4]);
	var time = pData[1].substr(1,5);
	var date = new Date( pData[0].replace(/\//g, '-'));
	var open = pData[2];

	for (var x in pTrades) {
		if (pTrades[x].status === 'filled' || pTrades[x].status === 'stopped') {continue;}

// Filled?
		if ( (pTrades[x].type == 'long' && high >= (pTrades[x].exit)+spread)
			|| (pTrades[x].type == 'short' && low <= (pTrades[x].exit)-spread)) {
			pTrades[x].status = 'filled';
			pTrades[x].filledPrice = pTrades[x].exit;
			if (outDtls) {
				console.log( 'Filled ' + pTrades[x].type + ', Placed: ' + pTrades[x].placedDate + ',' + pTrades[x].placedTime + ', Filled Price: ' + pTrades[x].filledPrice + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Points: ' + pTrades[x].points + ', Level: ' + pTrades[x].level);
			}
			pTrades[x].filledDate = date;
			pTrades[x].filledTime = time;

			var lotSize = pTrades[x].lotSize;
			var commCost = 0; // Number(((lotSize * 10) * (commission * .1)).toFixed(2));
			var gain = Number((((10 * lotSize) * (Number(pTrades[x].points)/10)) - commCost).toFixed(2));
			newBalance = Number((newBalance + gain).toFixed(2));
			pTrades[x].gainLoss = gain;
			pTrades[x].balance = newBalance;
			// console.log( 'filled ' + pTrades[x].level + ': ' + pTrades[x].type + ' low: ' + low + ' high: ' + high + ' entry: ' + pTrades[x].entry + ' exit: ' + pTrades[x].exit);
		} else 

// Activated?
		if ((pTrades[x].type == 'long' && high+spread >= pTrades[x].entry
			|| pTrades[x].type == 'short' && low-spread <= pTrades[x].entry)
			&& pTrades[x].status !== 'active'
			) {
			pTrades[x].status = 'active';
			pTrades[x].activeDate = date;
			pTrades[x].activeTime = time;
			if (pTrades.type == 'short') {
				pTrades[x].closest = low;
			} else {
				pTrades[x].closest = high;
			}
			if (outDtls) {
				console.log( 'Activated ' + pTrades[x].type + ', High/Low: ' + high + '/' + low + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Level: ' + pTrades[x].level);
			}
			// console.log( 'active ' + pTrades[x].level + ': ' + pTrades[x].type + ' low: ' + low + ' high: ' + high + ' entry: ' + pTrades[x].entry + ' exit: ' + pTrades[x].exit);
		} else 

// Stopped out
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
	
			var lotSize = pTrades[x].lotSize;
			var commCost = 0; // Number(((lotSize * 10) * (commission * .1)).toFixed(2));
			var loss = Number((((10 * lotSize) * (stopPts*10000)) - commCost).toFixed(2));
			pTrades[x].gainLoss = (loss*-1);
			newBalance = newBalance - loss;
			pTrades[x].balance = newBalance;

			totalStops++;
			totalStopPoints += (stopPts * 100000);
			if (outDtls) {
				console.log( 'Stopped ' + pTrades[x].type + ', Placed dt/tm: ' + pTrades[x].placedDate + ',' + pTrades[x].placedTime + ', High/Low: ' + high + '/' + low + ', entry: ' + pTrades[x].entry + ', exit: ' + pTrades[x].exit + ', Level: ' + pTrades[x].level);
// Record closest price point
			} else {
				if ( pTrades[x].type == 'short' && (pTrades[x].closest == undefined || pTrades[x].closest > low)) {
					pTrades[x].closest = low;
					pTrades[x].closestDtTm = date + ' ' + time;
				} else if (pTrades[x].type == 'long' && (pTrades[x].closest == undefined || pTrades[x].closest < high)) {
					pTrades[x].closest = high;
					pTrades[x].closestDtTm = date + ' ' + time;
				}
			}
		}
	}
}

function checkPsychLevels ( type, low, high) {
// Calculate for psych resistance/support level?
	if (psychLevels) {
		if ( String(low).substr(String(low).indexOf('.')+1,2) != String(high).substr(String(high).indexOf('.')+1,2)) {
			// Low is below high so set resistance level to match high
			if ( type == 'long') { // && String(low).substr(String(low).indexOf('.')+1,2) < String(high).substr(String(high).indexOf('.')+1,2)) {
				high = Number( String(high).substr(0,String( high).indexOf('.')+1) + String(high).substr(String(high).indexOf('.')+1,2));
			}
			// Short trade so set support level to match low
			if ( type == 'short') { // && String(low).substr(String(low).indexOf('.')+1,2) < String(high).substr(String(high).indexOf('.')+1,2)) {
				low = Number( String(high).substr(0,String( high).indexOf('.')+1) + String(high).substr(String(high).indexOf('.')+1,2));
			}
		}
	}
	return {
		low: low,
		high: high
	}
} // end checkPsychLevels