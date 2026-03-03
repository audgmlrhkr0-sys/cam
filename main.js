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
      if (!blob) {
        setStatus('캡처 실패');
        return;
      }
      const name = 'scan_' + new Date().toISOString().slice(0, 19).replace(/[-:T]/g, '') + '.png';
      const file = new File([blob], name, { type: 'image/png' });

      // 모바일: 공유 메뉴로 저장 (갤러리/사진 앱에 저장 가능)
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({
          files: [file],
          title: '스캔 사진',
          text: name
        }).then(function () {
          setStatus('저장됨 (공유 완료)');
          setTimeout(function () { setStatus('READY • SCANNING'); }, 2000);
        }).catch(function (err) {
          if (err.name !== 'AbortError') tryDownload(blob, name);
        });
        return;
      }

      tryDownload(blob, name);
      showFlash();
    }, 'image/png', 0.95);
  }

  function tryDownload(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 3000);
    setStatus('SAVED • ' + name);
    setTimeout(function () {
      setStatus('READY • SCANNING');
    }, 2000);
  }

  btnSave.addEventListener('click', capturePhoto);
  startCamera();
})();
