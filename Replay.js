include("DTAnalysis.js");

const fs = require( 'fs');
const FILENAME = 'S:\\DayTrading\\EURUSD Pivots.txt';

var studyData = fs.readFileSync( FILENAME, 'UTF-8');
replayTrades( sutdyData);