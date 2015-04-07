var fs = require('fs');
var csvtojson = require('csvjson');
var _ = require('lodash');

var defaults = {
   banner: 'Parm File for sql-export script',
   startid: '000101',
   admin: 'tim@gulfcoastcenter.org',
   sqldsnfile: '/c0/DEV/SCRIPT/D/freetds/dw_write.ds',
   sqlcolrename: {},
   sqltable: '',
   sqlexec: 'Y',
   sqltruncate: 'Y',
   sqlcreate: 'Y',
   archivepath: '',
   archiveclean: 'N',
   regcleanscript: '',
   reccleanscript: '',
   layermax: '',
   constants: {},
   required: {},
   effective: {},
   addeffective: {},
   reglimit: 0,
   skipparm: ''
};
var addparmline = function addparmline(name, value) {
   var head = name ? name.toUpperCase() + ' ' + (value || '') : '';
   var tail = Array(80 - head.length).join(' ');
   return head + tail;
};

module.exports = function(options) {

   var settings = _.merge(defaults, options);
   settings.name = settings.name.substr(0,8).toUpperCase();

   if (!settings.dstlistpath) { 
      throw new Error("DST LIST MISSING");
   }

   var dsts = csvtojson.toObject(settings.dstlistpath).output;

   var parmfile = [];
   //add the call to self
   parmfile.push(addparmline('** This Parmfile was Auto-Generated **'));
   parmfile.push(addparmline('** ' + settings.banner + ' **'));
   parmfile.push(addparmline());
   parmfile.push(addparmline('SCRIPT', 'sql-export (' + settings.name + ',, ' + ( settings.startid || '' ) + ')'));
   parmfile.push(addparmline());

   //add the cleaning scripts
   if (settings.regcleanscript) {
      parmfile.push(addparmline('REGCLEAN', settings.regcleanscript));
      parmfile.push(addparmline());
   }

   if (settings.reccleanscript) {
      parmfile.push(addparmline('RECCLEAN', settings.reccleanscript));
      parmfile.push(addparmline());
   }

   //add the custom sql connections
   if (settings.sqldsn) {
      parmfile.push(addparmline('SQLDSN', settings.sqldsn));
      parmfile.push(addparmline());
   }
   if (settings.sqldsnfile) {
      parmfile.push(addparmline('SQLDSNFILE', settings.sqldsnfile));
      parmfile.push(addparmline());
   }

   //add the sql table name
      parmfile.push(addparmline('SQL_TABLE', settings.sqltable));
      parmfile.push(addparmline());

   //exec
   if (settings.sqlexecute) {
      parmfile.push(addparmline('SQL_EXEC', settings.sqlexecute));
      parmfile.push(addparmline());
   }

   //truncate
   if (settings.sqltruncate) {
      parmfile.push(addparmline('SQL_TRUNCATE', settings.sqltruncate));
      parmfile.push(addparmline());
   }

   //create
   if (settings.sqlcreate) { 
      parmfile.push(addparmline('SQL_CREATE', settings.sqlcreate));
      parmfile.push(addparmline());
   }
   //archive path
   if (settings.archivepath) { 
      parmfile.push(addparmline('ARCH_PATH', settings.archivepath));
      parmfile.push(addparmline());
   }

   if (settings.archiveclean) { 
      parmfile.push(addparmline('ARCH_CLEAN', settings.archiveclean));
      parmfile.push(addparmline());
   }

   if (settings.skipparm) {
      parmfile.push(addparmline('SKIPPARM', settings.skipparm));
      parmfile.push(addparmline());
   }

   if (settings.layers) {
      parmfile.push(addparmline('LAYERS', settings.layers));
      parmfile.push(addparmline());
   }

   if (settings.reglimit) {
      parmfile.push(addparmline('REGLIMIT', settings.reglimit));
      parmfile.push(addparmline());
   }
   if (settings.admin) { 
      parmfile.push(addparmline('ADMIN', settings.admin));
      parmfile.push(addparmline());
   }

   
   //add the dsts
   var mis_idx = 0;
   dsts.forEach(function(dst, idx, arr) { 
      mis_idx += 1;

      parmfile.push(addparmline('DST-' + (mis_idx) + ' ' + dst['Ref Name']));
      var refname = dst['Ref Name'];
      var colname = settings.sqlcolrename[refname] || refname;
      //parmfile.push('SQL_COL-' + idx + ' ' + colname);
      parmfile.push(addparmline('SQL_COL-' + (mis_idx), colname.replace(/\./g, '_').replace(/\n/g, '')));

      //required
      if (settings.required[refname]) {
         //parmfile.push('DST_REQ-' + idx + ' Y');
         parmfile.push(addparmline('DST_REQ-' + mis_idx, 'Y'))
      }

      //effective date
      if (settings.effective[refname]) {
         //parmfile.push('DST_EFF-' + idx + ' Y');
         parmfile.push(addparmline('DST_EFF-' + mis_idx, 'Y'));
      }

      //add effective date col
      if (settings.addeffective[refname]) { 
         var i = mis_idx + 1;
         //parmfile.push('DST_EFF-' + i + ' ' + idx);
         parmfile.push(addparmline('DST_EFF-' + i, mis_idx));
      }

      //lookup
      if (Number(dst.Tbl)) { 
         //parmfile.push('DST_LKP-' + idx + ' ' + dst.Tbl);
         var i = mis_idx + 1;
         parmfile.push(addparmline('DST-' + i, dst['Ref Name']));
         parmfile.push(addparmline('SQL_COL-' + i, 
            colname.replace(/\./g, '_')
               .replace(/\n/g, '') + '_description'));
         parmfile.push(addparmline('DST_LKP-' + i, dst.Tbl));
         mis_idx = i;
      }
   });

        //add a blank trailing line
        parmfile.push(addparmline());

   console.log('writing file: '  + settings.name);
   fs.writeFileSync('./parm/' + settings.name + '.parm', parmfile.join('\n'));
};
