---
layout: post
title:  "Archived: Mothership"
date:   2014-03-01
tags: arduino dsp c jackd music archived
---
Ok, so maybe I'm like 10 years late hopping onto the <g1>E</g1><b1>D</b1><r1>M</r1> train (w<b1>00</b1>t w<b1>00</b1>t next stop the cosmos) and maybe I'm also 25 years late to the whole "using computers for music" but FUCK IT, WE'LL DO IT LIVE!!

Mothership was an idea for a modular-synth-like program that I had after finally getting <g1>jackd</g1> to work on my <a href="{% post_url 2014-01-01-Pied-pedal %}">Pi'ed Pedal</a>. Basically you code modules in C, then patch them together live. All this using the input/output jack of your computer (shut up sound quality nerds). <a href="http://www.youtube.com/watch?feature=player_detailpage&v=C402fprLRDw#t=1184">This</a> was the main inspiration for this.

Audio Server Setup
------------------

First, I forked my Pi'ed Pedal repo and started coding the base engine that everything would run on. Every module would be represented using this struct:

{% highlight c %}
typedef struct
{
	int inp_ports;	//number of input buffers
	int out_ports;	//number of output buffers
	int arg_ports;	//number of argument buffers
	int inp_size;	//input buffer size
	int out_size;	//output buffer size
			//argument port size is set to 1
	float *inp_buf;	//buffer used to hold input data
	float *out_buf;	//buffer used to hold output data
	float *arg_buf;	//buffer used to hold argument data
			//argument data can also be placed directly in the
			// buffer by way of directly editing it in the UI

	void* aux;	//pointer to any global arguments you might need
	int aux_size;	//size of global buffer in bytes
	char* name;	//name of the effect
	void (*effect_function)(float *in, float *out, float *arg, void* aux);
} effect_module;
{% endhighlight %}

This way, any data could be passed from any module in anyway (more or less). The only hitch is that the author of the C effect module has to predefine what size his arrays will be and stick to that size when coding. This way the UI knows how to handle such things. I mean, you could still have a buffer size mismatch <b1>if you wanted to</b1> but at least the concept stays the same.

Then, to link a module to another, I use things called <r1>wires</r1> (basically patch cables) which say which module output goes to which module input. Since modules also have "arguments" and "inputs" it can be a bit confusing as to why I made that distinction, but for now arguments have a buffer size of 1 and inputs have a set buffer size. The arguments are meant to be digital knobs and switches, and the inputs are meant to be audio chunks but the distinction can sometimes be pretty vague. So, onto the code:

{% highlight c %}
typedef struct
{
	int module;	//The selected module to run
	int *inp;	//The selected module outputs to use as inputs
	int *inp_ports;	//Which output port to use in each selected input
	int *arg;	//The selected module outputs to use as arguments
	int *arg_ports;	//Which output port to use in each selected argument
} wire;
{% endhighlight %}

Next, we need something to hold all modules and wires and whatnot so we can pass it to UI functions to modify it, then pass it to the engine so it can run all the effects.

{% highlight c %}
typedef struct
{
	int effects_alloc;		//size of effect_module buffer
	int effects_size;		//number of active effects
	effect_module* effects;		//all active effects

	int run_order_alloc;		//size of run_order buffer
	int run_order_size;		//number of wire patches
	wire *run_order;			//how to run the program
	//the last item in run_order contains which module outputs
	//to the global JACKD output
} engine_config;
{% endhighlight %}

I've been told that I should post my jackd API calls since there seems to be no documentation on how to use the newer version of jackd since everything seems to have been <b2>deprecated</b2>. At least, there was nothing new around when I was coding this (I'm using jackd 1.9.10 btw):

{% highlight c %}
//setup jackd client
jack_client_t *setup_jackd(engine_config* config){
	jack_client_t *client;
	/* Setup jack client */
	//try to become a client of the JACK server
	const char **ports;
	jack_status_t err;
	client = jack_client_open ("pedal", JackNullOption, &err);
	if(client == NULL){
		fprintf (stderr, "jack server not running?\n");
		exit(1);
	}
	//bind middle man callback
	jack_set_process_callback (client, process, &config);
	//create two ports
	input_port = jack_port_register (client, "input", JACK_DEFAULT_AUDIO_TYPE, JackPortIsInput, 0);
	output_port = jack_port_register (client, "output", JACK_DEFAULT_AUDIO_TYPE, JackPortIsOutput, 0);
	//activate client
	if (jack_activate (client)) {
		fprintf (stderr, "cannot activate client");
		exit(1);
	}
	//connect the ports
	if ((ports = jack_get_ports (client, NULL, NULL, JackPortIsPhysical|JackPortIsOutput)) == NULL) {
		fprintf(stderr, "Cannot find any physical capture ports\n");
		exit(1);
	}
	if (jack_connect (client, ports[0], jack_port_name (input_port))) {
		fprintf (stderr, "cannot connect input ports\n");
	}
	free (ports);
	if ((ports = jack_get_ports (client, NULL, NULL, JackPortIsPhysical|JackPortIsInput)) == NULL) {
		fprintf(stderr, "Cannot find any physical playback ports\n");
		exit(1);
	}

	if (jack_connect (client, jack_port_name (output_port), ports[0])) {
		fprintf (stderr, "cannot connect output ports\n");
	}
	free (ports);
	return client;
}

//process jackd input samples and output samples
int process (jack_nframes_t nframes, void *arg)
{
	jack_default_audio_sample_t *out = (jack_default_audio_sample_t *) jack_port_get_buffer (output_port, nframes);
	jack_default_audio_sample_t *in = (jack_default_audio_sample_t *) jack_port_get_buffer (input_port, nframes);
	//get configuration
	engine_config* config = (engine_config*)arg;
	//Run all pedal effects
	ms_run_engine(in, out, BUFFER_LEN, config);
	return 0;
}
{% endhighlight %}

If you check the <a href="https://github.com/dudeofea/mothership/blob/master/mothership.c">file on the github repo</a> you can see the full code for the file (also browse around for definitions of other ms_ functions).

In the <b2>process</b2> function, I pass what I call the global input/output which is the actual mic and headphone port of my laptop. Global outputs/inputs are regarded the same as module outputs/inputs just to keep things consistent, so you can make a wire connecting the global input to a low-pass filter then having another wire connect that to the global output to achieve a LPF.

For example, a sine wave generator has no input and only an output (it does though have 1 arg for frequency). It reads the values from a predefined sine wave buffer containing a single wavelength of a sine wave:

{% highlight c %}
//sine wave generator
//argments: [freq in Hz]
//aux buffer: [index (float)]
//global variables: [sine_wave (float)]
void sine_wave_effect(float *in, float *out, float *arg, void *aux){
	float index = ((float*)aux)[0];	//get index value
	for (int i = 0; i < BUFFER_LEN; ++i)
    {
        out[i] = sine_wave[(int)index];
        index += arg[0]*SINE_WAVE_LEN/SAMPLE_RATE;
        if (index >= SINE_WAVE_LEN)
        {
            index -= SINE_WAVE_LEN;
        }
        if (index < 0)
        {
            index += SINE_WAVE_LEN;
        }
    }
    ((float*)aux)[0] = index;	//store index value
}
{% endhighlight %}

Audio Controller
----------------

My next plan was to use a pi as a way to control a single module through wifi, then to have the possibility of multiple of these devices able to run at once to allow for collaborative music creation. Except I realized halfway through building the pedal that pi's don't have analog pins. <a href="http://blogs.telegraph.co.uk/news/files/2013/07/homer-simpson-doh-400x288.jpg">D'oh</a>.

After a little research, I decided to use an <b1>Arduino Due</b1> with a bluetooth low energy dongle. The Due has enough analog pins for knobs, enough digital pins for BLE / LCD and a 5V usb connector (actually 2). This meant I could basically the same setup as the RPi. The reason for BLE are:

<ul>
	<li>No need to lug a router around with my setup or host a wifi network from my laptop</li>
	<li>Easy(er) to setup. Doesn't require me to implement the entire wifi stack</li>
	<li>....or buy a clunky shield to do it for me, I just can't afford the vertical space</li>
</ul>

The easy part of the BLE setup was with the arduino. Simply cross the TX/RX lines into a serial port and away you go. Setting up a BLE server (actually client because of <a href="http://mbientlab.com/blog/bluetooth-low-energy-introduction/">backwards BLE architecture</a>) on my laptop, not so easy. After messing with <b2>bluez</b2> for Linux, updating, rebuilding, reading forums, reading spec sheets, etc. I finally find out how to connect and how to read/write characteristic values (basically <g1>endpoints</g1> if you're a USB buff or <g2>sockets</g2> if you're a Net buff or <g3>global variables</g3> if you're C buff or <g4>variables</g4> if you're a Python buff). Helpful links:

<ul>
	<li>Hacking a BLE lightbulb: <a href="https://learn.adafruit.com/reverse-engineering-a-bluetooth-low-energy-light-bulb/overview">Adafruit Tutorial</a></li>
	<li>BLE Scanning Phone Apps: <a href="https://play.google.com/store/apps/details?id=com.adafruit.bluefruit.le.connect&hl=en">Adafruit LE Connect</a>, <a href="https://play.google.com/store/apps/details?id=com.redbear.redbearbleclient&hl=en">BLE Controller (for RedBear)</a></li>
	<li>Specific to my BLE device (RedBear Mini): <a href="https://boriskourt.wordpress.com/2013/12/09/setting-up-the-ble-mini-from-red-bear-lab/">Setting up with Arduino</a></li>
	<li>And just for fun: <a href="https://www.youtube.com/watch?t=10&v=4POOiVrdnX8">I am Jack's Heart Monitor</a></li>
</ul>

Turns out in my case (with the RedBear Mini) placing the MAC address (or whatever bluetooth calls it) in as a command line argument doesn't work when trying to connect with <b2>gatttool</b2>. I had to run it like this:

{% highlight python %}
#doesn't connect
gatttool -I -b 'D0:39:72:C3:AC:AA'
[   ][       ] > connect

#does connect
gatttool -I
[   ][       ] > connect 'D0:39:72:C3:AC:AA'
{% endhighlight %}

After that, reading/writing was super easy. So, onto the build:

<img src="/images/mothership1.jpg"/>

<img src="/images/mothership2.jpg"/>

After soldering for what seemed like an eternity (maybe it was just the <g4>fumes</g4>), and reading BLE docs/forums (Blah Blah BLE) I started actually plugging things into the board which my heighted <r3>engineering paranoia</r3> was telling me not to do, what from all the things I've roasted in the past (My desktop only has one working front USB port, and somewhere an op-amp is crying from what I did to it). So, in true paranoid fashion I covered everything with styrofoam, the lord and savior of my last arduino project. And hey guess what it worked!

<img src="/images/mothership3.jpg"/>

<img src="/images/mothership4.jpg"/>

As I got onto pin testing my knobs, one of the potentiometers didn't work whatsoever, and it was essentially sucking power and doing nothing useful for society....err ahem I mean my circuit (damn freeloadin' pots!). Since I didn't order extras (fuck) I replaced it with a shittier pot (not <g2>the good shit</g2>), but it's being read with <b1>10</b1>-bit accuracy so who cares. A wild problem appears! Now that I can pin test, some of the pots don't go all the way to <b1>1023</b1> (max value) but maybe somewhere around <b1>650-700</b1>. Again, something that could be solved by extra potentiometers that I don't have and time that I say I don't have and other shit I couldn't be bothered to list. Solution: hardcode max values for potentiometers and scale them accordingly. Behold, the consistency:

<img src="/images/mothership5.jpg"/>

**END OF POST**

Archived from my old website. I ended up redoing the audio server in python as well as not using BLE because of it's slowness (couldn't get more than like 10 bytes/s) and instead just using a wire, y'know like in the 50's!?
