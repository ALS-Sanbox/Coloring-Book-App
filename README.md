# SVG Coloring Widget

This is a basic coloring app that allows you to load an SVG and color it using solid colors, gradients, and patterns.

## Features

- Supports solid colors, gradients, and pattern fills
- Includes basic swatch themes:
  - **Base**
  - **Pastels**
  - **Brights**
- Lightweight: works by including just **two files** (JS and CSS)

## Getting Started

### 1. Include in the `<head>`

```
<link rel="stylesheet" href="svg-coloring-widget.css">
<script src="svg-coloring-widget.js"></script>
```

2. Add a Container in the <body>
Add an empty div with a unique id to your HTML body:
```
<div id="myColoringApp"></div>
```

3. Initialize the Widget
Use the widget's init method with your container's ID and configuration options:
```
<script>
  SVGColoringWidget.init('#myColoringApp', {
    width: '100%',
    height: '600px',
    sidebarWidth: '300px'
  });
</script>
```
