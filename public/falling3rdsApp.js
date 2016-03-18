var audioContext = new AudioContext();

var falling3rdsApp = {
  currentNumberOfParts: 0,
  resetParts: function(){
    this.currentNumberOfParts = 0;
  },
	arpeggioNotes: [0,0,4,4,7],
	octaveDistribution: [-24,-24,-12,-12,-12,0,0,0,0,0,12,12],
  repeatPeriods: [3,4,5,5,5.5,6,7,7.5,7.5,8,9,10,11,12,13,14,15,16],
  speakers: audioContext.destination,
  availableWaves: ["sine"],
  secondsPerChord: 20,
  displayVolume: 3,
  volumeUp: function(){
    if(this.displayVolume < 11){
      this.displayVolume += 1;
    };
    document.getElementById("volume").innerHTML = this.displayVolume;
  },
  volumeDown: function(){
    if(this.displayVolume > 0){
      this.displayVolume -= 1;
    };
    document.getElementById("volume").innerHTML = this.displayVolume;
  },
  volumeConversion: function(){
    return (0.009 * this.displayVolume * this.displayVolume)-(0.012 * this.displayVolume);
  },
	newMusicalPart: function(){
    falling3rdsApp.currentNumberOfParts += 1;
    var id = falling3rdsApp.currentNumberOfParts;
    var noteSet = [chooseNote(), chooseNote(), chooseNote()];
    var noteLengths = [0.5, 0.33, 1, 0.66, 0.11, 2, 3, 5, 0.75];
		var noteLength = sample(noteLengths);
		var wave = sample(this.availableWaves);
		var melodyLength = sample(this.repeatPeriods);
		melody();
    var looper = setInterval(melody,(1000 * melodyLength));
    function endMusic(){
      clearInterval(looper);
    };
    function chooseNote(){
      return (sample(falling3rdsApp.arpeggioNotes)
        + sample(falling3rdsApp.octaveDistribution));
    };
    function sample(arr){
      return arr[~~(Math.random() * arr.length)];
    };
		function melody(){
			play(0, noteSet[0], 0.5, wave);
			play((+noteLength), noteSet[1], 0.5, wave);
			play((2 * +noteLength), noteSet[2], 0.5, wave);
		};
		function timeInSeconds(time){
			var secs = time.getSeconds();
			var mins = time.getMinutes();
			var hours = time.getHours();
			var days = time.getUTCDate();
			return secs + (mins * 60) + (hours * 60 * 60) + (days * 60 * 60 * 24);
		};
		function thirdsCycler(number){
			var step = number % 24;
      var majorOrMinor = "major";
      var cycleAdjustment = 0;
			if (step % 2 == 1) {
				cycleAdjustment = 0.5;
				majorOrMinor = "minor";
			};
			var transpose = (step * -3.5) + cycleAdjustment;
			while (transpose < -3) {
				transpose += 12;
			};
			return [transpose, majorOrMinor];
		};
		function play(delay, pitch, duration, wave) {
      if (falling3rdsApp.currentNumberOfParts == 0){
        endMusic();
      };
			var progressiveTime = new Date();
			var secondsIntoMonth = timeInSeconds(progressiveTime);
			var chordNumber = parseInt(secondsIntoMonth / falling3rdsApp.secondsPerChord);
			var transpose = thirdsCycler(chordNumber)[0];
			var currentChordType = thirdsCycler(chordNumber)[1];
			if ([-20,-8,4,16,28].includes(pitch) && currentChordType == "minor"){
				pitch -= 1
			};
			var startTime = audioContext.currentTime + delay;
			var endTime = startTime + duration;
			var delayLength = Math.random();
			var panningAmount = (2 * (Math.random())) - 1;
			var envelope = audioContext.createGain();
			var oscillator = audioContext.createOscillator();
			var delayInput = audioContext.createGain();
			var delayFeedback = audioContext.createGain();
			var delayTimer = audioContext.createDelay();
			var delayOutput = audioContext.createGain();
			var panner = audioContext.createStereoPanner();
      var volume = falling3rdsApp.volumeConversion(falling3rdsApp.displayVolume);

			panner.connect(falling3rdsApp.speakers);
			delayOutput.connect(panner);
			delayInput.connect(delayOutput);
			delayFeedback.connect(delayOutput);
			delayFeedback.connect(delayTimer);
			delayTimer.connect(delayFeedback);
			delayInput.connect(delayTimer);
			envelope.connect(delayTimer);
			oscillator.connect(envelope);

			envelope.gain.value = 0;
			envelope.gain.setTargetAtTime(volume, startTime, 0.1);
			envelope.gain.setTargetAtTime(0, endTime, 0.2);

			oscillator.type = wave;
			oscillator.detune.value = (pitch + transpose) * 100;
			oscillator.start(startTime);
			oscillator.stop(endTime + 2);

			delayTimer.delayTime.value = delayLength;
			delayFeedback.gain.value = 0.8;

			panner.pan.value = panningAmount;

			console.log("just played a note: pitch = " + (pitch+transpose)
        + " and delay = " + delayLength + " and volume = " + volume);
		};
	}
};

window.onload = function(){
  document.getElementById("webAudioTest").innerHTML = "";
};