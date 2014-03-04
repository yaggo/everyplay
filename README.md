everyplay
=========

MISC NOTES
----------

 - the code could be much simpler if it was solely optimized for the task; artificial complexity has been added to demonstrate various javascript idioms

 - the renderer.js contains a rendering engine extracted from author's mvc framework (written in coffeescript), can be considered more like a 3rd-party dependency than part of the assignment

 - estimately 10 hours time spent total, the code is by no mean a production quality

HOW TO RUN
----------

$ make run

... or visit: http://jaakko.kapsi.fi/everyplay/

KNOWN ISSUES / WONT FIX (TIMEBOXED)
-----------------------------------

 - Only runs on webkit, sorry. The code itself runs fine on gecko, but some (likely trivial) issue prevents the rendering engine properly working.

 - The 3rd-party nodefront server is too dumb to serve index.html for other than root path, so reloading only works on frontpage.

 - Safari/Chrome both seem to block until the mp4 video has been fully loaded :(
