---
layout: post
title:  "The Oft-Forgotten Diode"
date:   2016-04-13
tags: mothership arduino led hardware archived diode circuit
---
So, upon working on the second pedal component of Mothership, also known as the patcher, I was having trouble (read: hardware life crisis) when my LEDs were not working. I had two MAX7219's on a perfboard with what seemed like a sane circuit:

![BEHOLD!]({{ site.baseurl }}/images/mothership10.jpg)

A mess, I know. These LEDs are common-anode type, so the electrons go in the same LED pin regardless but come out a different pin depending on what the color is. My problem was that either nothing would show up or some weird bunch of colors would flash for an instant before darkness again.

I had the first MAX7219 feed it's DOUT into the second's DIN, and they both shared the LOAD, CLK and DATA signals. Also had independent ISET resistors on each and the proper capacitors on the power rail. The DIG pins were each connected to a vertical column above (2 per row, 1 red, 1 green) with each column having 8 LEDs (the remaining 4 LEDs at the bottom will be taken care of later when they'll be treated as extra columns of length 1). The SEG pins however, were tied together for both MAX7219's. Hence the 8 rows were connected to **both** MAX7219's.

Here's an earlier photo where I hadn't tied the two sets of SEG pins together yet (SEG is blue, DIG is green):

![EARLIER]({{ site.baseurl }}/images/mothership8.jpg)

Apparently, there was a behavior of the MAX7219 that it would flip the SEG / DIG pins upon shutting down

..under construction
