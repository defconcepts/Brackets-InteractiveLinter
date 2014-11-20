/**
 * Interactive Linter Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    'use strict';

    var _               = brackets.getModule("thirdparty/lodash");
    var FileSystem      = brackets.getModule("filesystem/FileSystem");
    var pluginLoader    = require("pluginLoader");
    var spromise        = require("libs/js/spromise");
    var pluginDirectory = module.uri.substring(0, module.uri.lastIndexOf("/"));


    /**
     * pluginManager is the processor for loading up plugins in the plugins directory in
     * make sure they are smoothly running in a worker thread.
     */
    function pluginManager() {
        return spromise.all([getPluginsMeta(pluginDirectory  + "/plugins/default"), getPluginsMeta(pluginDirectory  + "/plugins/dev")])
            .then(loadPlugins)
            .then(pluginsLoaded);
    }


    function loadPlugins(plugins) {
        plugins = _.filter(plugins, function(plugin) {
            return !!plugin.directories.length;
        });

        return spromise.all(plugins.map(function(plugin) {
            return pluginLoader.workerThreadPluginLoader(plugin);
        }));
    }


    function pluginsLoaded(plugins) {
        return _.extend.apply(_, plugins);
    }


    function getPluginsMeta(path) {
        return spromise(function(resolve) {
            FileSystem.getDirectoryForPath(path).getContents(function(err, entries) {
                resolve({
                    directories: _.filter(entries, 'isDirectory').map(function(dir) {return dir.name;}),
                    path: path
                });
            });
        });
    }


    return pluginManager;
});

