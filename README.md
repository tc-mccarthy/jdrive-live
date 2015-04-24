#JDrive Live!

Stony Brook University J School's own live stream platform

_In beta_

Supports:

* UStream
* Instagram
* Twitter

Powered by:

* NodeJS
* ExpressJS
* Twitter bootstrap
* jQuery
* SASS
* Jade
* Grunt
* Memcached

This platform was developed to allow a mobile-friendly live stream experience for folks who are unable to attend the annual Roth Regatta. Forks, tickets and suggestions welcome!

Special thanks to @Vectorloft for the major design assist!

##Dev instructions

Nothing major, but this does require access to a memcached service.

On OSX you can install memcached by running

```brew install memcached```

then, make sure it loads on boot with

```ln -sfv /usr/local/opt/memcached/*.plist ~/Library/LaunchAgents```

then, fire it up with 

```launchctl load ~/Library/LaunchAgents/homebrew.mxcl.memcached.plist```