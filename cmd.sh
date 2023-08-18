#!/bin/sh

#while ! git pull --rebase ; do echo 'lll';done;
export NODE_OPTIONS=--openssl-legacy-provider

(npm run build2 -- --dest='../cardwordswww' --no-clean )&&echo 'build done'
(cd ../cardwordswww&&git add . && git commit -am 'update' && while ! git push ; do echo 'lll';done;)
