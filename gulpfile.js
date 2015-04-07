var gulp = require('gulp');
var mis = require('../usc-deploy/deploy.js');
var parm = require('./src/gen-parm.js');

var userconfig = require('./userconfig.ignore');

gulp.task('build', function() {

	parm({
		name: 'ANSASQL',
		dstlistpath: './dst/dst-rec-ansa.csv',
		startid: '000101',
		sqltable: 'ansa',
		required: {
			'C.ANSA.DATE': true
		}
	});

	parm({
		name: 'CANSSQL',
		dstlistpath: './dst/dst-rec-cans.csv',
		startid: '000101',
		sqltable: 'cans',
		required: {
			'C.CANS.DATE': true
		}
	});
});

gulp.task('script', function() {
	return mis({connect: {password: userconfig.p}}).push_usc();
});
gulp.task('parm', ['build'], function() {
	return mis({connect: {password: userconfig.p}}).push_parm();
});

gulp.task('push', ['script', 'parm']);

