---
layout: post
title:  "Mothership, the Patchening!"
date:   2016-03-25
tags: mothership arduino led hardware archived
---
So, I finally got enough parts to start testing things out for my hardware patcher. I'd been having problems with my other module (the knobby one) and had also just apparently learned about the "anti-turn notch", which I thought was akin to those annoying sharp plastic bits that stick out when you get some kind of hobby kit that was obviously injection molded. So of course I plied them off. I don't think that was giving me the potentiometer issues, I think I was just screwing them in so strongly (with my big strong man arms) that I was bending the taper or something.

So I set up a little test bench with my arduino and the MAX7219

![LED TEST 1]({{ site.baseurl }}/images/mothership_test_1.jpg)

Looks great right! That's what I thought too:

0 min, everything lights up

10 min, OK lets find a library...hmmm there's a bunch

20 min, Oh here's one....uhhh I have to **do** things...download ZIP, code, etc...

40 min, Done my first example this should......*does nothing*

1 hr, what if it's the pins, let's switch to the arduino specific SPI pins

1.2 hrs, let's imbue ourselves with the datasheet

1.4 hrs, let's learn SPI

1.6 hrs, let's use our own SPI library cuz' I don't trust nothin' from nobody!

2 hrs, fuck

2.5 hrs, hmm looks like it's not supposed to light up by default and some other dude has the same dealio because he didn't put the anodes/cathodes with the right pins

2.51 hrs, which is the cathode again?

2.52 hrs, yep that's what it is. Oh look my custom SPI code works, or it had an effect

2.6 hrs, switch to first library I was using (y'know the proper one). works

<video width="400" controls>
	<source src="{{ site.baseurl }}/videos/mothership_test_2.mp4" type="video/mp4">
	Your browser does not support the video tag.
</video>
