(function () {
  const video = document.getElementById('camera');
  const canvas = document.getElementById('captureCanvas');
  const ctx = canvas.getContext('2d');
  const btnSave = document.getElementById('btnSave');
  const statusEl = document.getElementById('status');
  const wrap = document.querySelector('.scanner-wrap');

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function showFlash() {
    if (wrap) {
      wrap.classList.remove('flash');
      wrap.offsetHeight;
      wrap.classList.add('flash');
      setTimeout(function () {
        wrap.classList.remove('flash');
      }, 350);
    }
  }

  function startCamera() {
    const constraints = {
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('카메라를 지원하지 않습니다.');
      return;
    }

    setStatus('CAMERA INIT...');

    navigator.mediaDevices.getUserMedia(constraints)
      .then(function (stream) {
        video.srcObject = stream;
        setStatus('READY • SCANNING');
      })
      .catch(function (err) {
        console.error(err);
        setStatus('CAMERA DENIED');
      });
  }

  function capturePhoto() {
    if (!video.srcObject || video.readyState < 2) {
      setStatus('카메라 대기 중...');
      return;
    }

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      setStatus('영상 크기 오류');
      return;
    }

    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);

    showFlash();

    canvas.toBlob(function (blob) {
      if (!blob) return;
      const name = 'scan_' + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '') + '.png';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('SAVED • ' + name);
      setTimeout(function () {
        setStatus('READY • SCANNING');
      }, 2000);
    }, 'image/png', 0.95);
  }

  btnSave.addEventListener('click', capturePhoto);
  startCamera();
})();
