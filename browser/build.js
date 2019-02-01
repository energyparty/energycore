/*
Copyright (c) 2016-Present Energyparty, Energycore and Energywallet Developers
Distributed under the AGPL 3.0 with the OpenSSL exception, see the
accompanying file LICENSE or https://github.com/energyparty/energycore
*/

'use strict';

var fs = require('fs');
var browserify = require('browserify');
var exec = require('child_process').exec;
var sys = require('sys');
var puts = function(error, stdout, stderr) {
  if (error) console.log(error);
};

var modules = [
  'lib/Address',
  'lib/Armory',
  'lib/AuthMessage',
  'lib/Base58',
  'lib/HierarchicalKey',
  'lib/BIP21',
  'lib/BIP39',
  'lib/BIP39WordlistEn',
  'lib/Block',
  'lib/Bloom',
  'lib/Connection',
  'lib/Deserialize',
  'lib/ECIES',
  'lib/Electrum',
  'lib/Message',
  'lib/NetworkMonitor',
  'lib/Opcode',
  'lib/PayPro',
  'lib/Peer',
  'lib/PeerManager',
  'lib/PrivateKey',
  'lib/RpcClient',
  'lib/Key',
  'lib/Point',
  'lib/SIN',
  'lib/SINKey',
  'lib/Script',
  'lib/ScriptInterpreter',
  'lib/SecureRandom',
  'lib/sjcl',
  'lib/Transaction',
  'lib/TransactionBuilder',
  'lib/Wallet',
  'lib/WalletKey',
  'patches/Buffers.monkey',
  'patches/Number.monkey',
  'config',
  'const',
  'networks',
  'util/log',
  'util/util',
  'util/EncodedData',
  'util/VersionedData',
  'util/BinaryParser',
];

module.exports.moduleNames = modules;

var createBitcore = function(opts) {


  opts.dir = opts.dir || '';

  if (!opts.includeall && !opts.includemain && (!opts.submodules || opts.submodules.length === 0)) {
    if (!opts.stdout) console.log('Must use either -s or -a or -m option. For more info use the --help option');
    process.exit(1);
  }

  var submodules = opts.submodules;

  if (opts.includemain) {
    submodules = JSON.parse(JSON.stringify(modules));
    submodules.splice(submodules.indexOf('lib/Armory'), 1);
    submodules.splice(submodules.indexOf('lib/AuthMessage'), 1);
    submodules.splice(submodules.indexOf('lib/BIP21'), 1);
    submodules.splice(submodules.indexOf('lib/BIP39'), 1);
    submodules.splice(submodules.indexOf('lib/BIP39WordlistEn'), 1);
    submodules.splice(submodules.indexOf('lib/Block'), 1);
    submodules.splice(submodules.indexOf('lib/Bloom'), 1);
    submodules.splice(submodules.indexOf('lib/Deserialize'), 1);
    submodules.splice(submodules.indexOf('lib/ECIES'), 1);
    submodules.splice(submodules.indexOf('lib/Electrum'), 1);
    submodules.splice(submodules.indexOf('lib/RpcClient'), 1);
    submodules.splice(submodules.indexOf('lib/SIN'), 1);
    submodules.splice(submodules.indexOf('lib/SINKey'), 1);
    submodules.splice(submodules.indexOf('lib/Wallet'), 1);
    submodules.splice(submodules.indexOf('lib/PayPro'), 1);
    submodules.splice(submodules.indexOf('lib/Connection'), 1);
    submodules.splice(submodules.indexOf('lib/Peer'), 1);
    submodules.splice(submodules.indexOf('lib/PeerManager'), 1);
    submodules.splice(submodules.indexOf('lib/NetworkMonitor'), 1);
    var assert = require('assert');
    assert(submodules.length == modules.length - 19);
  }

  if (opts.submodules) {
    for (var i = 0; i < opts.submodules.length; i++) {
      var sm = opts.submodules[i];
      if (modules.indexOf(sm) === -1) throw new Error('Unknown submodule ' + sm);
    }
  }

  var bopts = {
    debug: true,
    standalone: 'bitcore',
    insertGlobals: true
  };
  var b = browserify(bopts);

  b.require(opts.dir + 'browserify-buffertools/buffertools.js', {
    expose: 'buffertools'
  });
  b.require(opts.dir + 'bufferput', {
    expose: 'bufferput'
  });
  b.require(opts.dir + 'events', {
    expose: 'events'
  });
  b.require(opts.dir + 'buffers', {
    expose: 'buffers'
  });
  b.require('./' + opts.dir + 'bitcore', {
    expose: 'bitcore'
  });
  modules.forEach(function(m) {
    if (opts.includeall || submodules.indexOf(m) > -1) {
      if (!opts.stdout) console.log('Including ' + m + ' in the browser bundle');
      b.require('./' + opts.dir + m + '.js', {
        expose: './' + m
      });
    }
  });

  if (!opts.dontminify) {
    b.transform({
      global: true
    }, 'uglifyify');
  }

  var bundle = b.bundle();
  return bundle;
};

if (require.main === module) {
  var list = function(val) {
    return val.split(',');
  };
  var program = require('commander');
  program
    .version('0.0.1')
    .option('-a, --includeall', 'Include all submodules.')
    .option('-m, --includemain', 'Include main submodules.')
    .option('-d, --dontminify', 'Don\'t minify the code.')
    .option('-o, --stdout', 'Specify output as stdout')
    .option('-D, --dir <dir>', 'Specify a base directory')
    .option('-s, --submodules <items>', 'Include the listed comma-separated submodules.', list)
    .parse(process.argv);
  var bitcoreBundle = createBitcore(program);
  var pjson = require('../package.json');
  bitcoreBundle.pipe(
      program.stdout ? process.stdout :
      fs.createWriteStream('browser/bundle.js'));
}

module.exports.createBitcore = createBitcore;
