# Sequencer and (Midi) Editor

### Sequencer and midi-style editor for pure data / Purr Data. 

Uses nw.js for the editor. It's preferable to use the sdk version to see the commands exchanged between pd and nw.
Console can be opened by F12. nw.js can be downloaded from here:

https://nwjs.io/

Open sequencers_example.pd and follow the instructions. 



### Shortcuts and Controls
- ITEMS
	- ctrl + click / doubleclick: 	set item
	- mmb on item: 					delete item
	- ctrl + wheel on item: 		set volume
	- shift + ctrl + mousemove: 	draw mode
	- alt + shift + mousemove: 		erase mode
	- ctrl + wheel: 				scale x-axis
	- shift + wheel: 				scroll x-axis
	- ctrl + x: 					select all items on row, move along x axis, return for confirm, esc for abort
	- ctrl + y: 					select all items on row, move along y axis, return for confirm, esc for abort
- PLAYER
	- space: 						starts/stops playing
	- click into x-scale sets transport start
	- ctrl click into x-scale sets loop-region start
	- alt click into x-scale sets loop-region end
	- loop-regions are draggable
- PARAMETERS
	- click: 						set item(s) at current position
	- mmb: 							delete parameter on item
	- click name on the left: set parameter/create new
	- ctrl + lmb: 					draw values
	- ctrl + mousemove on bottom left edge: resize parameters hight
- SOLO/MUTE
	- ctrl + click solo: 			exclusive solo
	- ctrl + s: 					unmute/unsolo all
- VARIOUS
	- ctrl + m: 					show/hide main control
	- ctrl + l: 					log received data
	- ctrl + r: 					log sent data

- MIDI
	- imports midi files of type 1


Works with pd vanilla and Purr Data, tested on win7/win10.

pd vanilla needs following libraries: zexy, moocow, mrpeach and hcs. moonlib is needed for the synth in the example.

The handling of the editor is done with pd. The editor might be controlled by any other program using tcp ports 8150 (server) / 8151 (client) for communication.
 


![alt tag](js/gui/buttons/seq1.png)
![alt tag](js/gui/buttons/seq2.png)
![alt tag](js/gui/buttons/seq3.png)



The code of the midi import filter was taken from:

https://github.com/gasman/jasmid and https://github.com/NHQ/midi-file-parser

Thanks to the authors!
