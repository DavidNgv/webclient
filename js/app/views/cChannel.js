/*
 * Copyright 2012 Denis Washington <denisw@online.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(function(require) {
  var $ = require('jquery');
  var _ = require('underscore');
  var Backbone = require('backbone');
  
  var api = require('util/api');
  var avatarFallback = require('util/avatarFallback');
  
  //var SinglePost = require('app/views/SinglePost');
  
  var template = require('text!templates/cChannel.html');
  
  var Events = Backbone.Events;

  var cChannel = Backbone.View.extend({
    tagName: 'div',
    className: 'post-stream',
    events: {
      'click .new-topic button': 'addNewPost'
    },

    initialize: function() {
      this.model.bind('fetch', this.render, this);
      this.model.posts.bind('add', this.renderPost, this);
      this.model.posts.bind('add', this._clearTextarea, this);
      Events.bind('subscribedChannel', this._enablePosting, this);
      Events.bind('unsubscribedChannel', this._disablePosting, this);
      this._renderSpinningIcon();
    },

    addNewPost: function() {
      var content = this.$('.new-topic').find('textarea').val();
      if (content.length) {
        this.model.posts.create({content: content}, {
          headers: {'Content-type': 'application/json'},
          wait: true,
          dataType: 'text'
        });
      }
    },

    render: function() {
      var self = this;
      var canPost = this.model.followers.isPublisher(sessionStorage.username);

      this.$el.html(_.template(template, this.model));
    },

    renderPost: function(thread) {
      var canPost = this.model.followers.isPublisher(sessionStorage.username);

      this.$('.threads').prepend(new SinglePost({model: [thread], canPost: canPost, credentials: this.options.credentials}).el);
    },

    _enablePosting: function(channel, role) {
      if (role === 'publisher') {
        this.$el.prepend('<section class="new-topic"> \
          <textarea placeholder="New topic..." autocomplete="off"></textarea> \
          <div class="controls"> \
            <button>Post</button> \
          </div> \
        </section>');
      }
    },

    _disablePosting: function() {
      this.$('.new-topic').remove();
    },

    _clearTextarea: function() {
      this.$('.new-topic').find('textarea').val('');
    },

    _renderSpinningIcon: function() {
      var icon =
        $('<div class="loading"><img src="img/bc-icon.png"></div>');

      this.$el.html(icon);
      this._startSpinning(icon);
    },

    _startSpinning: function(icon) {
      var rotation = 0;

      var spin = setInterval(function() {
        var rotate = 'rotate(' + rotation + 'deg)';
        icon.find('img').css({
          'transform': rotate,
          '-moz-transform': rotate,
          '-webkit-transform': rotate
        });
        rotation = (rotation + 10) % 360;
      }, 50);

      this.model.on('reset', function() {
        clearTimeout(spin);
      });
    }
  });

  return cChannel;
});
