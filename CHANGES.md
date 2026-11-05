# Footer + logo update (5 Nov 2026)

Changed
- static/site.css   compact footer (about 320px tall, was about 505px), dotted world-map background, aligned address cards. Green glowing map markers and glowing bullets removed.
- static/site.js    footer markup; logo URLs now carry ?v=20261105d so browsers stop showing the old cached logo. Your Apps Script URL is untouched.
- static/index.html old embedded copy of the previous logo + footer removed (it flashed on load before the script replaced it)
- static/*.html     favicon link added; ?v= cache number bumped
- static/images/world-dots.svg   NEW dotted world map (footer background)
- static/images/favicon.png      NEW browser-tab icon made from the Nanvi "N" mark

Not changed: colours, images/Nanvi logo.png (already your new transparent logo), contact form, server.py.
