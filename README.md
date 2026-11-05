# Nanvi Robotics website

## Run in VS Code
1. Install Python 3 (python.org) and VS Code.
2. VS Code -> File -> Open Folder -> choose this `nanvi-robotics` folder.
3. Open the Terminal (Ctrl + `) and run:  python server.py
   (Mac/Linux: python3 server.py)  - or press F5.
4. Open http://localhost:8001 in your browser.

## Files
- server.py        local static server (legacy /contact saves to contacts.json)
- apps-script/Code.gs   Contact Us email backend (Google Apps Script) - see apps-script/DEPLOY.md
- static/index.html  home page with robotics demos
- static/about.html, services.html, projects.html, contact.html  other pages
- static/site.css and site.js  shared navigation, styles, and page interactions
- The Robotics page (projects.html) presents Agri Bot, Care Bot, Indus Bot, Event Bot, and their shared NRIP platform.
- The About page includes company locations and NRIP information.

## Add real photos/videos
Put your image files in `static/images/` and use paths like `images/robot.jpg` in the page HTML.
The shared navigation and footer use `images/Nanvi logo.png` (transparent PNG); replace that file to change the logo.
Current page photos use `r1.jpg`, `r2.jpg`, `r3.jpg`, `r4.jpg`, and `m2.webp`.
To add another photo, copy it to `static/images/` and replace a page image's `src`, for example:
  <div class="media-frame"><img src="images/robot.jpg" alt="Nanvi robot at work"></div>
For videos, use:
  <video src="demo.mp4" autoplay muted loop playsinline></video>
