var sampleModule = require('./sampleModule');

// var testfeed1, testfeed2,
//     url1 = process.argv[2],
//     url2 = process.argv[3],
//     dest = process.argv[4] || __dirname;

// testfeed1 = sampleModule.downloadLink(url1, dest + '\\testfeed1.csv');
// testfeed2 = sampleModule.downloadLink(url2, dest + '\\testfeed2.csv');

// Leave the next two lines commented if you are using sampleModule.downloadLink() function
var testfeed1 = __dirname + '\\testfeed1.csv',
    testfeed2 = __dirname + '\\testfeed2.csv';
files = sampleModule.processFeed(testfeed1, testfeed2);

// var connectionProperties = {
//     host: string,
//     port: integer,
//     secure: boolean,
//     secureOptions: object,
//     user: string,
//     password: string,
//     connTimeout: integer,
//     pasvTimeout: integer,
//     keepalive: integer},
//     dest = ,//path to the folder on the server
//     destPath = [dest + '\\testfeed1.csv', dest + '\\testfeed2.csv'];
// sampleModule.uploadData(connectionProperties, [testfeed1, testfeed2], destPath);