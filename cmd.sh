#!/bin/sh

#while ! git pull --rebase ; do echo 'lll';done;

(npm run build2 -- --dest='../cardwordswww' --no-clean )&&echo 'build done'
(cd ../cardwordswww&&git add . && git commit -am 'update' && while ! git push ; do echo 'lll';done;)
