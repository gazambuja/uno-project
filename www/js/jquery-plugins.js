/**
 * Simple jQuery plugin that replaces $.click with a mobile-responsive version
 * that doesn't break scrolling.
 */
(function($){
  $.fn.extend({ 
    clickTouch: function(handler) {
       return this.each(function() {
         var touchedWithoutScroll = false;
         var self = $(this);

         self.bind('touchstart', function(event) {
           // Ignore multi-touches
           if(event.originalEvent.touches.length > 1) {
             return;
           }
           touchedWithoutScroll = true;
         })
         // If user starts scrolling/panning, let the touch through
         .bind('touchmove', function(event) {
           touchedWithoutScroll = false;
         })
         // If user releases without scrolling/panning/multitouching, it's a touch
         .bind('touchend', function(event) {
           if(touchedWithoutScroll) {
             handler.apply(this, arguments);
             return false;
           }
         })
         .click(handler);
       });
    }
  });
})(jQuery);