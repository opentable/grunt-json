/*
 * grunt-json
 * https://github.com/wilsonpage/grunt-json
 *
 * Copyright (c) 2012 Wilson Page
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function (grunt) {
    var path = require('path');

    var defaultProcessNameFunction = function (name) {
        return name;
    };

    var concatJson = function (files, data) {
        var options = data.options;
        var namespace = options && options.namespace || 'myjson';               // Allows the user to customize the namespace but will have a default if one is not given.
        var singleNamespace = options && options.singleNamespace || false;      // Apply keys of concatted files directly to main namespace. Keys will overwrite previous keys of same name. 
        var noVar = options && options.noVar || false;                          // Allows the user to assign the namespace without var.
        var includePath = options && options.includePath || false;              // Allows the user to include the full path of the file and the extension.
        var processName = options && options.processName || defaultProcessNameFunction;    // Allows the user to modify the path/name that will be used as the identifier.
        var basename;
        var filename;

        var output = (noVar ? '' : 'var ') + namespace + ' = '
        if (singleNamespace) {
            var json = {}
            files.map(function (filepath) {
                var fileJson = grunt.file.readJSON(filepath)
                for (var key in fileJson) {
                    json[key] = fileJson[key]
                }
            })
            output += JSON.stringify(json, null, "\t") + ';'
            // console.log('output',output,'json',json)
        } else {
            output += namespace + ' || {};'
            output += files.map(function (filepath) {
                basename = path.basename(filepath, '.json');
                filename = (includePath) ? processName(filepath) : processName(basename);
                return '\n' + namespace + '["' + filename + '"] = ' + grunt.file.read(filepath) + ';';
            }).join('');
        }
        return output
    };

    // Please see the grunt documentation for more information regarding task and
    // helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

    // ==========================================================================
    // TASKS
    // ==========================================================================

    grunt.registerMultiTask('json', 'Concatenating JSON into JS', function () {
        var data = this.data;
        grunt.util.async.forEachSeries(this.files, function (f, nextFileObj) {
            var destFile = f.dest;
            var files = f.src.filter(function (filepath) {
                // Warn on and remove invalid source files (if nonull was set).
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            });

            var js = concatJson(files, data);
            grunt.file.write(destFile, js);
            grunt.log.write('File "' + destFile + '" created.');
        });
    });
};
