---
layout: post
title:  "Archived: Pied Pedal"
date:   2014-01-01
tags: pi dsp c jackd music archived
---
Once upon thy time there was'th a princess, fairest of them al- OH WHO AM I KIDDING!

I like music, you like music, we all scream for ice ice baby. I did indeed make an arduino guitar pedal <a href="arduino_pedal.htm">previously</a>, but hot damn was it slow. Like, couldn't even run a real-time FFT (pfft, I 8-bits for breakfast and spit out the bytes, amirite?!). So now everyone say hello to this enchanting mistress, the <a href="https://www.adafruit.com/category/105">Raspberry Pi</a>!!1!

Setup
-----
So first install Raspian and run all the <em>apt-get</em> commands you can think of. Then follow some instructions (don't need to be errythang) on <a href="http://wiki.linuxaudio.org/wiki/raspberrypi">this</a> page to trim the fat and get you pi to lose some weight. Once you've got your pi running like a kerosene powered antelope, we can begin....muhahahah.

Be sure to get a USB audio interface (<a href="http://www.factorydirect.ca/Canada-Ontario-/Computer_Add-Ons/Video_Audio/Soundcards/SO0001/_Usb_Sound_Card_Dongle_0027242620094/0">super cheap yo</a>) since the pi doesn't have audio input and any 6$ USB soundcard is better than the crap audio port that came with the pi. Optionally, get an LCD charater display so you know what the fuck is going on, knowwhatimsayin?!

<img src="/images/rpi_beast_mode.jpg" width="600px">

Next, you'll want to get yourself some libraries to run your effects:

<ul>
	<li>To coordinate all the audio input/output: <a href="http://wiki.linuxaudio.org/wiki/raspberrypi#packages">Jackd</a></li>
	<li>For all your spectograph needs: <a href="http://www.fftw.org/">FFT in C/C++</a></li>
	<li>To display text onto your optional display: <a href="http://learn.adafruit.com/drive-a-16x2-lcd-directly-with-a-raspberry-pi/overview">Adafruit LCD Tutorial</a></li>
</ul>

Then, feel free to <a href="https://github.com/dudeofea/pi-ed-pedal">fork me on Github</a> or write your own
starting from the <a href="http://trac.jackaudio.org/browser/trunk/jack/example-clients/simple_client.c">simple client example</a> from the jackd examples repo.
