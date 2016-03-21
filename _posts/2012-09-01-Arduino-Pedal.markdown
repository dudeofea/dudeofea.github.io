---
layout: post
title:  "Archived: Arduino Guitar Pedal"
date:   2012-09-01
tags: arduino dsp music archived
---
This all stemmed from when I had linked a friend a nifty
<a href="http://vimeo.com/1460684">demo</a> of a guitar pedal. He
wanted one so much I suddenly felt the urge to build him one. Luckily
there were many DIY guides on how to build an arduino guitar pedal
including one on how to build the one in the video, courtesy of
<a href="http://www.instructables.com/id/Lo-fi-Arduino-Guitar-Pedal/?ALLSTEPS">
Kyle McDonald</a>.

The goal of this project was to see if I could put everything together, since I'm obviously not the
<a href="http://www.instructables.com/id/Arduino-Guitar-Pedal/?ALLSTEPS">first</a> to
<a href="http://interface.khm.de/index.php/lab/experiments/arduino-realtime-audio-processing/">think</a> of
<a href="http://deambulatorymatrix.blogspot.ca/2010/11/digital-chromatic-guitar-tuner-2008.html">this</a>.

Input Stage
-----------

My design was based off of Kyle's, but I improved in certain areas. I didn't want an external preamp
(because I didn't have one) and I didn't need stereo output (because I'm not <a href="http://www.youtube.com/watch?v=d681GuMZj6Y">Van Halen</a>).
I bought most of my parts from <a href="http://sparkfun.com">sparkfun.com</a> and the rest I got from random hobby shops.

I had initially tried read in the guitar signal directly, only to realise it was in the milivolt range. Even a windmill
strike with max volume did no more than a blip on the input. For simplicity's sake I plugged the guitar directly into
the LM358 op-amp which added some ridiculous gain (something like 10x-100x). My input's minimum and maximum gain is shown below:

![#myhumps]({{ site.baseurl }}/images/arduino_pedal_4.jpg)

![#railed]({{ site.baseurl }}/images/arduino_pedal_5.jpg)

However I had a problem, my input clipped the negative portion of the guitar signal. An op-amp needs a positive
and negative rail to guide it's input in both directions, I only had <g1>5V</g1> and ground. Hence my amplified input would be
clipped between <g1>5V</g1> and <g1>0V</g1>. Being that my guitar input has no DC offset (swings around <g1>0V</g1>), connecting
my guitar to the op-amp would clip the negative half of my wave. After a quick google, I found
out that certain pedals use this method of amplification, sometimes on purpose.

Later I tried adding a DC bias to the guitar signal simply by connecting it to a voltage divider. The idea was to add about
<g1>0.1V</g1> to the input wave so that when amplified it would swing about <g1>2.5V</g1>. The problem encountered
(of which I didn't know of at the time) was that my makeshift midrail was not a rail at all. Even with my highest resistor value,
the voltage divider caused too much noise to read the input and was highly influenced by the guitar resistance (volume knob).

When I removed the op-amp I had for my output stage (explained below) I had a free op-amp which I then used to act as a proper
virtual ground. This was essentially a voltage divider plugged into a unity-gain amplifier (voltage follower) which then plugged into
the "ground" end of my guitar. The op-amp's resistance was ludicrously high so it didnt affect the guitar whatsoever. Now I could capture the full
waveform (500 is midpoint):

![#slap-d-bass]({{ site.baseurl }}/images/arduino_pedal_6.jpg)

Output Stage
------------

For my output stage, I used Kyle's method. Using the PWM signal from <b1>pins 3 and 11</b1>, both pins ran through a simple RC circuit (to convert PWM to Analog).
We needed 2 pins since each PWM output is 8bits but we have a 10bit input (short int) and would also want a 10bit output. So we need 8bits from one pin (<b1>pin 3</b1>)
and 2 from another (<b1>pin 11</b1>). The first 2bits will be sent to <b1>pin 11</b1> as the "minor" bits and the last 8bits will be sent to <b1>pin 3</b1> as the "major" bits. The minor resistor is 256 (2<sup>8</sup>) times the major one. 1.5k and 390k were used. This gives the minor bits 256 times less of a contribution of current that the major ones. Then the weighted sum is sent to a capacitor in series to remove it's DC bias. 1uF was used. Anything significantly bigger cuts higher frequencies and anything significantly lower can't last between PWM bursts (capacitor doesn't hold it's charge).

At first I added an amplification stage to my output signal which involved adding a DC bias, amplifying with an op-amp, then removing the DC bias. Luckily,
the DAC signal was strong enough on it's own (maybe twice that of a guitar) so the output amp stage was remove, freeing up an op-amp.

Effects
-------

So far, my input and output stages were working. I could test the input by printing off values through the serial port, and the output by having my code output
a sine wave (in the form of a stored array of sine values). Since my output had it's DC bias removed, it didn't matter where my values were centered at just as
long as they were centered somewhere. With no effects (input value not changed before output) my pedal sounded like this:

<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F63470174&amp;color=887239&amp;auto_play=false&amp;show_artwork=false"></iframe>

The first effect I added was an AND response filter. I had tried an OR response filter but it was so weak it sounded just like the clean input. The final code
for the AND filter is as such:

{% highlight c %}
//AND Response Filter
if(type == 1){
	tmp = 0b1;
    for(int i = 0; i < var1/120; i++){
		sample = (sample & ~tmp) | getCBSample(i*var2/50+1) & tmp;
		tmp = tmp << 1;
	}
}
{% endhighlight %}

The <p1>type</p1> was used as a switch to pick which effect should be used, this was controlled by a potentiometer. <p1>tmp</p1> was a bitmask used to AND single
bits of the input with previous bits of the input (using <p1>getCBSample()</p1>, a circular buffer). The bit mask would be "incremented" by way of bit shifting.
The <p1>var1</p1> and <p1>var2</p1> variables were inputs from the potentiometer, ranging from <g1>0</g1> to <g1>1024</g1>. <p1>var1</p1> was scaled to less than
<g1>10</g1> since the sample was a <b1>short</b1> which only have 10bits. <p1>var2</p1> was used to select the "interval" of the previous sample. If <p1>var2/50</p1>
was set to <g1>1</g1>, then the samples used would follow each other consecutively (1 sample back, 2 samples back, etc). If set to a higher value, the sample used
would be a certain distance from the last one used.

The second effect was a XOR filter which used a similar method as the above. The only difference being the <p1>sample</p1> was consecutively XOR'ed with a number
of samples and that the entire sample was used (not just one bit).

{% highlight c %}
//XOR Response Filter
if(type == 2){
	for(int i = 0; i < var1/120; i++){
		sample = sample ^ getCBSample(i*var2/50+1);
    }
}
{% endhighlight %}

Both of these effects have a "distortion" sound to them. The next 2 effects work in a similar fashion:

{% highlight c %}
//Pitch Shift
if(type == 3){
	timeVar += var1/20 + var2/100 + 1;
	sample = circleBuffer[(timeVar/16)%CBLEN];
}

//Wubber
if(type == 5){
	counter++;
	if(counter > (1024-var1)/15){
		period1++;
		counter = 0;
	}
	if(period1 > var2/50 + 7){
		period1 = 0;
	}
	timeVar += period1 + 1;
	sample = circleBuffer[(timeVar/4)%CBLEN];
}
{% endhighlight %}

A circular buffer stores the previous values in a FIFO manner. By using <p1>timeVar</p1> we can iterate through this array at a different speed than
that of <p1>analogRead()</p1>, the function reading/storing samples. This way, we can change the pitch of the sound such as in Pitch Shift. In Wubber, the
sound is run through multiple pitch shifts, from low to high, which cause a sound not unlike a frog's croak. The number of pitch shifts and the speed
of iteration is controlled by <p1>var1</p1> and <p1>var2</p1>. In Pitch Shift, both variables change the pitch to varying degrees (like the major/minor knobs
on a microscope).

The last effect was a frequency detection algorithm dubbed "Cthulu Mode". This would use an FHT (faster verion of FFT) to plot a sample window into frequency
domain. For this I used a <a href="http://www.adafruit.com/blog/2012/08/20/arduino-fft-get-your-freq-on/">neat FFT library</a> for the arduino. After the
frequency was found, a sine wave of the same frequency was played as output. This effect got it's name when it hilariously failed to detect the guitar's
fundamental frequency and instead sounded like Cthulu, demon of the sea, was trapped in my amplifier.

Unfortunatly my "source control" repository reverted to an older version (thanks Google Drive), so I've lost the code for "Cthulu Mode" as of writing this. Luckily, I'll never
see that ugly piece of code again lest it thrust forth from <b1>Posseidon's Trident</b1> to spite me.

Conclusion
----------
This was so far the most complete project I've done yet. If I were to improve anything it would be a complete redesign of "Cthulu Mode" using a better frequency
detection algorithm such as <a href="http://www.instructables.com/id/Arduino-Frequency-Detection/">this</a>.

imagesauce
----------
![prototype]({{ site.baseurl }}/images/arduino_pedal_3.jpg)

![conception]({{ site.baseurl }}/images/arduino_pedal_2.jpg)

![reality]({{ site.baseurl }}/images/arduino_pedal_1.jpg)

following the tradition of giving pedals abstract and synesthetic names, I christened my pedal <r1>The O Face</r1>. Mostly just cuz.

**END OF POST**

Archived from my previous website. Still have the working pedal, haven't touched it in awhile. I'm on to other musical things now.
