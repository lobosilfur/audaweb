(function () {
  const Buttons = document.querySelectorAll('button');
  const Button__record = Buttons[0];
  const Button__play = Buttons[1];
  const Select__input = document.querySelector('[name="select-input"]');

  let recordedChunks = [];
  let recording = false;
  let source = undefined;
  let mediaRecorder = undefined;
  let options = { mimeType: 'audio/x-wav; codecs=1' };
  let audio: HTMLAudioElement = new Audio();
  let input = undefined;
  let audioURL = undefined;
  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    } else {
      // ...
    }
  };

  function record() {
    if (recording === false) {
      recordedChunks = [];
      recording = true;

      const constraints = {
        audio: {
          mandatory: {
            googEchoCancellation: false,
            googAutoGainControl: false,
            googNoiseSuppression: false,
            googHighpassFilter: false,
            sourceId: input ? input : undefined,
          },
          optional: []
        },
        video: false
      };
      navigator.mediaDevices.getUserMedia(constraints)
        .then(function (mediaStream) {
          mediaRecorder = new MediaRecorder(mediaStream/*, options*/);
          mediaRecorder.ondataavailable = handleDataAvailable;
          mediaRecorder.start();
        })
        .catch(errorCallback);
    } else {
      recording = false;
      mediaRecorder.stop();
      let superBuffer = new Blob(recordedChunks);
      audioURL = window.URL.createObjectURL(superBuffer);
      document.querySelector('a').href = audioURL;
    }
  }

  function play() {
    if (audioURL !== undefined) {
      audio.src = audioURL;
      audio.play();
      console.log('playing');
    }
  }

  Button__record.addEventListener('click', record);
  Button__play.addEventListener('click', play);


  const errorCallback = (error) => {
    console.log('The following gUM error occured: ' + error);
  };

  const gotDevices = (devicesInfo) => {
    const fragment = new DocumentFragment();
    for (let i = 0; i < devicesInfo.length; ++i) {
      let option = document.createElement('option');
      if (devicesInfo[i].kind === 'audioinput') {
        option.value = devicesInfo[i].label;
        option.textContent = devicesInfo[i].label;
        if (i === 0) {
          option.selected = true;
        }
        fragment.appendChild(option);
      }
    }
    Select__input.appendChild(fragment);
    input = devicesInfo[3].deviceId;
  };

  navigator.mediaDevices.enumerateDevices()
    .then(gotDevices)
    .catch(errorCallback);

})();