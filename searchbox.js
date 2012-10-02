// Author: Ryan Heath
// http://rpheath.com

(function($) {
  $.searchbox = {}
  
  $.extend(true, $.searchbox, {
    settings: {
      url: '/search/',
      dom_id: '#results',
      delay: 100,
      loading_css: '#loading',
      characters: 3,
      template: ''
    },
    
    loading: function() {
      $($.searchbox.settings.loading_css).show()
    },
    
    resetTimer: function(timer) {
      if (timer) clearTimeout(timer)
    },
    
    idle: function() {
      $($.searchbox.settings.loading_css).hide()
    },
    
    process: function(terms) {
      $.get([$.searchbox.settings.url, terms].join(''), function (data) {
        var results = null;
        if (data.length) {
          if (($.searchbox.settings.template) && (typeof Mustache != 'undefined')) {
            var tmpl = $($.searchbox.settings.template).html();
            results = Mustache.to_html(tmpl, $.parseJSON(data));
          } else {
            results = data;
          }
        }
        $($.searchbox.settings.dom_id).html(results);
      });
    },
    
    start: function() {
      $(document).trigger('before.searchbox')
      $.searchbox.loading()
    },
    
    stop: function() {
      $.searchbox.idle()
      $(document).trigger('after.searchbox')
    }
  })
  
  $.fn.searchbox = function(config) {
    $(this).data("config", config);
    $.extend(true, $.searchbox.settings, $(this).data("config") || {});
    
    $(document).trigger('init.searchbox')
    $.searchbox.idle()
    
    return this.each(function() {
      var $input = $(this)
      
      $input
      .focus()
      .ajaxStart(function() { $.searchbox.start() })
      .ajaxStop(function() { $.searchbox.stop() })
      .keyup(function() {
        $.extend(true, $.searchbox.settings, $(this).data("config") || {})
        if ($input.val().length >= $.searchbox.settings.characters) {
          if ($input.val() != this.previousValue) {
            $.searchbox.resetTimer(this.timer)

            this.timer = setTimeout(function() {
              $.searchbox.process($input.val())
            }, $.searchbox.settings.delay)
        
            this.previousValue = $input.val()
          }
        } else {
          $($.searchbox.settings.dom_id).html('');
          this.previousValue = '';
        }
      })
    })
  }
})(jQuery);
