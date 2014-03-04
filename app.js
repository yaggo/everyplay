var CLIENT_ID = '26416c2cd682e39bce6d0fb1a440fe718c12759b';


/* Simple HTML5 pushState router
   ============================= */

var Router = function(routes) {
  this.routes = routes;
}

// Emulate traditional links clicks
Router.prototype.navigate = function(path) {
  history.pushState(null, null, path);
  this.dispatch(path);
}

// Match a path to route and call it with optional parameters
Router.prototype.dispatch = function(path) {
  for (var pattern in this.routes) {
    var matches = path.match(new RegExp('^' + pattern + '$')) // TODO: precompile the pattern
    if (matches) {
      return this.routes[pattern](matches.slice(1));
    }
  }
  throw '404';  // TODO: Add catch-all route as last one to render 404 page
}


/* The View represents a routable, renderable "page"
   ================================================= */

var View = function(name, declaration) {
  this.name = name;
  this.datasources = declaration.datasources;  // API endpoints for data
  this.bindings = declaration.bindings;        // event handlers
  this.transformer = declaration.transformer;  // convert API response to render context
};

// Helper function for API requests
View.prototype.fetch = function(endpoint, method, params, cb) {
  params.client_id = CLIENT_ID;
  params.limit = 20; // TODO: infinite scrolling etc
  var query = [];
  for (var key in params) {
    var value = encodeURIComponent(params[key])
    query.push(encodeURIComponent(key) + '=' + value)
  }
  var url = 'https://everyplay.com/api/' + endpoint + '?' + query.join('&');
  var req = new XMLHttpRequest();
  var self = this;
  document.body.parentNode.classList.add('busy');
  req.onload = function() {
    cb.call(self, JSON.parse(this.response));
    document.body.parentNode.classList.remove('busy');
  };
  req.open(method, url, true);
  req.send();
}

// Add listeners for DOM events
View.prototype.bind = function() {
  for (var binding in this.bindings) {
    var handler = this.bindings[binding];
    var splitted = binding.split(' ');
    var selector = splitted[0];
    var event = splitted[1] || 'click';
    var nodes = document.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener(event, handler, true);
    }
  };
}

// Handle display logic for rendered pages
View.prototype.render = function(context) {
  var template = document.querySelector('#template-' + this.name);
  if (! this.slot) {
    this.slot = document.createElement('div');
    this.slot.classList.add('page');
    this.slot.setAttribute('id', 'page-' + this.name);
    document.body.appendChild(this.slot);
  }
  var child;
  while (child = this.slot.lastChild) {
    this.slot.removeChild(child);
  }
  if (template.content instanceof DocumentFragment) {
    this.slot.appendChild(template.content.cloneNode(true));
  } else {
    for (var i = 0; i < template.childNodes.length; i++) {
      this.slot.appendChild(template.childNodes[i].cloneNode(true));
    }
  }
  new Renderer(this.slot, context);  // see renderer.js, extracted from my argonjs framework
  var pages = document.querySelectorAll('.page');
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList[pages[i] == this.slot ? 'remove' : 'add']('hidden');
  }
}

// Main function of view, called by router, orchestrate the pieces
View.prototype.visit = function(params) {
  var responses = new Array(this.datasources.length);
  var done = function() {
    var context = this.transformer.apply(this, responses);
    context.navigate = router.navigate.bind(router);
    this.render(context);
    this.bind();
  };
  var replies = 0;
  this.params = params;
  this.datasources.forEach(function(source, i) {
    if (typeof source == 'function') source = source.call(this);
    this.fetch(source, 'GET', {}, function(response) {
      responses[i] = response; // keep in order
      if (++replies == this.datasources.length) done.call(this);
    });
  }, this);
}

/* Here comes the business logic
   ============================= */

var ListView = new View('video-list', {
  datasources: [
    function() { return this.params[0] && ('users/' + this.params[0] + '/videos') || 'videos' },
    'games'
  ],
  transformer: function(videos, games) {
    return {
      videos:
        videos.map(function(item) {
          item.href = '/watch/' + item.id
          item.inline_style = 'background-image: url("' + (item.preview_thumbnail || item.thumbnail_url) + '")';
          return item;
        }, this),
      games:
        games.map(function(item) {
          item.is_selected = item.id == parseInt(this.params[0], 10);
          return item;
        }, this)
    }
  },
  bindings: {
    '[name=game] change': function(event) {
      router.navigate(event.target.value && ('/by-game/' + event.target.value) || '/');
    }
  }
});

var PlayerView = new View('player', {
  datasources: [function() { return 'videos/' + this.params[0] }],
  transformer: function(video) {
    video.created_at_formatted = new Date(video.created_at).toLocaleDateString();
    return { video: video };
  }
});

var router = new Router({
  '/': ListView.visit.bind(ListView),
  '/by-game/([^/]+)': ListView.visit.bind(ListView),
  '/watch/([^/]+)': PlayerView.visit.bind(PlayerView),
});

window.onpopstate = function() {
  router.dispatch(location.pathname);
}

// TODO: normalize gecko/webkit behaviour on initial load
window.onload = window.onpopstate.bind(window);
