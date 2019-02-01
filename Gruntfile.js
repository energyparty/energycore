/*
Copyright (c) 2016-Present Energyparty, Energycore and Energywallet Developers
Distributed under the AGPL 3.0 with the OpenSSL exception, see the
accompanying file LICENSE or https://github.com/energyparty/energycore
*/

'use strict';

module.exports = function(grunt) {

  //Load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-markdown');
  grunt.loadNpmTasks('grunt-shell');

  // Project Configuration
  grunt.initConfig({
    shell: {
      browserify: {
        options: {
          stdout: true,
          stderr: true
        },
        command: grunt.option('target') === 'dev' ?
            'node ./browser/build.js -a -d; docco lib/* ' : 'node ./browser/build.js -a'
      }
    },
    watch: {
      readme: {
        files: ['README.md'],
        tasks: ['markdown']
      },
      scripts: {
        files: ['**/*.js', '**/*.html', '!**/node_modules/**', '!browser/bundle.js', '!docs/**', '!*.md', '!README.html', '!CONTRIBUTING.html'],
        tasks: ['shell'],
      },
    },
    markdown: {
      all: {
        files: [{
          expand: true,
          src: '*.md',
          dest: '.',
          ext: '.html'
        }]
      }
    }


  });

  grunt.registerTask('default', ['shell','watch']);

};
