# Tree
Simple nested tree made with [Brunch](http://brunch.io) and [Marionette](http://marionettejs.com)

## View

Simply open ```public/index.html``` in a browser.
(if on Chrome, make sure it's not a file:// URL because it could block local XHR requests. Open with your local webserver or in Firefox)

All files for deployment on a webserver are in ```public``` folder.

## Edit

```
npm install -g brunch
bower install
npm start
```
Brunch will run it's own webserver, accessible at http://localhost:3333
Brunch will also run watcher. Simply edit and save source files in ```app/```

## Test

Open ```public/jasmine/SpecRunner.html``` in a browser.
