/* jshint camelcase: false */
'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      'tmp/javascript/client.js': ['src/client/**/*.js'],
      'tmp/javascript/moderator.js': ['src/moderator/**/*.js'],
      'tmp/javascript/emoji.js': ['src/static/emoji.js']
    },

    concat: {
      options: {
        separator: ';\n'
      },
      'client': {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery.finger/dist/jquery.finger.js',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.js',
          'bower_components/emoji-parser/main.js',
          'tmp/javascript/client.min.js',
          'tmp/javascript/emoji.js'
        ],
        dest: 'public/javascripts/client.js'
      },
      'client_dev': {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery.finger/dist/jquery.finger.js',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.js',
          'bower_components/emoji-parser/main.js',
          'tmp/javascript/client.js',
          'tmp/javascript/emoji.js'
        ],
        dest: 'public/javascripts/client.js'
      },
      'moderator': {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery.ui/ui/core.js',
          'bower_components/jquery.ui/ui/widget.js',
          'bower_components/jquery.ui/ui/mouse.js',
          'bower_components/jquery.ui/ui/draggable.js',
          'bower_components/jquery.ui/ui/droppable.js',
          'bower_components/chartjs/Chart.min.js',
          'bower_components/tinysort/dist/jquery.tinysort.js',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.js',
          'bower_components/emoji-parser/main.js',
          'tmp/javascript/moderator.min.js'
        ],
        dest: 'public/javascripts/moderator.js'
      },
      'moderator_dev': {
        src: [
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery.ui/ui/core.js',
          'bower_components/jquery.ui/ui/widget.js',
          'bower_components/jquery.ui/ui/mouse.js',
          'bower_components/jquery.ui/ui/draggable.js',
          'bower_components/jquery.ui/ui/droppable.js',
          'bower_components/chartjs/Chart.min.js',
          'bower_components/tinysort/dist/jquery.tinysort.js',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.js',
          'bower_components/emoji-parser/main.js',
          'tmp/javascript/moderator.js'
        ],
        dest: 'public/javascripts/moderator.js'
      },
      'stylesheets': {
        src: [
          'tmp/_minified_stylesheets/**/*.css',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.css'
        ],
        dest: 'public/stylesheets/<%= pkg.name %>.css'
      },
      'stylesheets_dev': {
        src: [
          'src/static/**/*.css',
          'bower_components/jquery-textcomplete/dist/jquery.textcomplete.css'
        ],
        dest: 'public/stylesheets/<%= pkg.name %>.css'
      },
      'pure': {
        src: [
          'bower_components/pure/pure-min.css',
          'bower_components/pure/grids-responsive-min.css'
        ],
        dest: 'public/stylesheets/pure.css'
      },
      'pure_dev': {
        src: [
          'bower_components/pure/pure.css',
          'bower_components/pure/grids-responsive.css'
        ],
        dest: 'public/stylesheets/pure.css'
      }
    },

    uglify: {
      'tmp/javascript/client.min.js': ['tmp/javascript/client.js'],
      'tmp/javascript/moderator.min.js': ['tmp/javascript/moderator.js']
    },

    cssmin: {
      minify: {
        expand: true,
        src: ['src/static/**/*.css'],
        dest: 'tmp/_minified_stylesheets',
        ext: '.min.css'
      }
    },

    watch: {
      'javascript': {
        files: ['src/client/*.js', 'src/moderator/*.js'],
        tasks: ['assets:javascript:install']
      },
      'javascript_dev': {
        files: ['src/client/*.js', 'src/moderator/*.js'],
        tasks: ['assets:javascript:install_dev']
      },
      'stylesheets': {
        files: ['src/static/*.css', 'src/static/**/*.css'],
        tasks: ['assets:stylesheets:install']
      },
      'stylesheets_dev': {
        files: ['src/static/*.css', 'src/static/**/*.css'],
        tasks: ['assets:stylesheets:install_dev']
      }
    },

    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js', 'config/**/*.js', 'spec/**/*.js'],
      options: {
        jshintrc: true
      }
    },

    jasmine_node: {
      options: {
        forceExit: true,
        extension: 'js',
        specNameMatcher: 'spec'
      },
      all: ['spec/']
    },

    shell: {
      start_redis: {
        command: 'redis-server',
        options: {
          async: true
        }
      },
      stop_redis: {
        command: 'pgrep redis-server | xargs kill'
      },

      emojify: {
        command: 'rsync -az bower_components/emoji-parser/emoji public/images && echo "var base_emojis = [" > public/javascripts/base_emoji.js && ls -1 public/images/emoji | grep ".png" | sed -e \'s/\\..*$//\' | xargs -I{} echo \\\"{}\\\" | tr \"\\n\" "," | sed "s/,$//" >> public/javascripts/base_emoji.js && echo "];" >> public/javascripts/base_emoji.js',
        options: {
          async: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-shell-spawn');

  grunt.registerTask('assets:javascript:install', ['browserify', 'uglify', 'concat:client', 'concat:moderator']);
  grunt.registerTask('assets:javascript:install_dev', ['browserify', 'concat:client_dev', 'concat:moderator_dev']);

  grunt.registerTask('assets:stylesheets:install', ['cssmin:minify', 'concat:stylesheets', 'concat:pure']);
  grunt.registerTask('assets:stylesheets:install_dev', ['concat:stylesheets_dev', 'concat:pure_dev']);

  grunt.registerTask('assets:install', ['assets:javascript:install', 'assets:stylesheets:install', 'shell:emojify']);
  grunt.registerTask('assets:install_dev', ['assets:javascript:install_dev', 'assets:stylesheets:install_dev', 'shell:emojify']);

  grunt.registerTask('redis:start', ['shell:start_redis']);
  grunt.registerTask('redis:stop', ['shell:stop_redis']);

  grunt.registerTask('spec', ['redis:start', 'jasmine_node', 'redis:stop']);

  grunt.registerTask('check', ['spec', 'jshint']);

  grunt.registerTask('db:flush', function() {
    var redis = require('./src/redisClient');
    var done = this.async();
    redis.flushdb(done);
  });

  grunt.registerTask('db:populate', function() {
    var faker = require('faker');
    var redis = require('./src/redisClient');
    var uuid = require('uuid');
    var done = this.async();
    var commands = [];
    var sendCommand, i, tempval, id, topic, title;

    // Session ID
    commands.push(['SET', 'active_session_id', uuid.v4()]);

    // Temperature
    for (i = 0; i < 40; i++) {
      tempval = faker.random.array_element([1, 2, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5]);
      commands.push(['HINCRBY', 'temperature', String(tempval), '1']);
    }

    // Cards
    for (i = 0; i < 12; i++) {
      id = uuid.v4();
      topic = faker.random.array_element(['happy', 'sad', 'shoutout', 'idea']);
      title = topic === 'shoutout' ?
        (faker.Name.firstName() + ' for ' + faker.random.bs_buzz() + ' ' + faker.random.bs_noun()) :
        (faker.Company.bs());

      commands.push([
        'HSET',
        'cards',
        id,
        JSON.stringify({
          id: id,
          type: 'card',
          topic: topic,
          title: title
        })
      ]);
    }

    // Send it all to redis
    sendCommand = function() {
      var args, fn;

      if (commands.length === 0) {
        done();
        return;
      }

      args = commands.shift();
      args.push(sendCommand);
      fn = args.shift();

      redis[fn].apply(redis, args);
    };

    sendCommand();
  });

  grunt.registerTask('db:do_over', ['db:flush', 'db:populate']);
};
