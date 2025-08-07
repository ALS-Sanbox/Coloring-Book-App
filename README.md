This is a basic coloring app that will load a svg and allow coloing it with solid, graidents, and patterns.

The basic swatch themes are Base, Pastels, Brights.

This will work with just including two files the js app and the css.

Instructions:

1. Include in the header 
   a. svg-coloring-widget.css
   b.svg-coloring-widget.js
   
3. In the body 
  In the body add and empty div with an unique id then in the init script use that id and set basic size options.
  ex.
      <div id="myColoringApp"></div>
      <script>
        SVGColoringWidget.init('#myColoringApp', {
          width: '100%',
          height: '600px',
          sidebarWidth: '300px'
        });
    </script>
