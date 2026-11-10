// 스크롤에 맞춰 장면을 보여 주고, 편지와 촛불을 움직입니다.
const revealObserver = new IntersectionObserver((entries, observer) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  }
}, { threshold: 0.14 });

document.querySelectorAll(".reveal").forEach((section) => revealObserver.observe(section));

const photoFlip = document.querySelector("#photo-flip");
const photoHint = document.querySelector("#photo-hint");
photoFlip.addEventListener("click", () => {
  const isFlipped = photoFlip.classList.toggle("is-flipped");
  photoFlip.setAttribute("aria-pressed", String(isFlipped));
  photoFlip.setAttribute("aria-label", isFlipped ? "원래 사진으로 뒤집기" : "둥근 사진을 뒤집어 첨부한 사진 보기");
  photoHint.textContent = isFlipped ? "한 번 더 누르면 원래 사진으로 돌아와요" : "사진을 눌러 뒤집어 보세요 ✨";
});

const envelope = document.querySelector("#envelope");
const letterHint = document.querySelector("#letter-hint");

envelope.addEventListener("click", () => {
  const isOpen = envelope.classList.toggle("is-open");
  envelope.setAttribute("aria-expanded", String(isOpen));
  envelope.setAttribute("aria-label", isOpen ? "생일 편지 닫기" : "생일 편지 열기");
  letterHint.textContent = isOpen ? "편지를 다시 누르면 다정하게 접혀요" : "편지를 열어보세요 ✉️";
});

const cakeScene = document.querySelector("#cake-scene");
const cakeObserver = new IntersectionObserver((entries, observer) => {
  if (!entries.some((entry) => entry.isIntersecting)) return;
  cakeScene.classList.add("is-lit");
  observer.disconnect();
}, { threshold: 0.35 });

cakeObserver.observe(cakeScene);

const music = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicLabel = document.querySelector("#music-label");
const choiceMusic = document.querySelector("#choice-music");
const choiceMusicToggle = document.querySelector("#choice-music-toggle");
const choiceMusicLabel = document.querySelector("#choice-music-label");
const musicReset = document.querySelector("#music-reset");
const musicStatus = document.querySelector("#music-status");
const musicErrorMessage = location.protocol === "file:"
  ? "내장 음악을 불러오지 못했어요. birthday-audio-data.js 파일이 index.html과 같은 폴더에 있는지 확인해 주세요."
  : "음악 파일을 찾을 수 없어요. birthday-music.mp3도 웹사이트에 함께 올려주세요.";
const choiceMusicErrorMessage = location.protocol === "file:"
  ? "두 번째 음악을 불러오지 못했어요. birthday-music-choice-data.js 파일이 index.html과 같은 폴더에 있는지 확인해 주세요."
  : "두 번째 음악 파일을 찾을 수 없어요. birthday-music-choice.mp3도 웹사이트에 함께 올려주세요.";

if (location.protocol === "file:") {
  musicToggle.disabled = true;
  choiceMusicToggle.disabled = true;
  musicStatus.textContent = "배경음악을 준비하고 있어요...";
  const audioDataScript = document.createElement("script");
  audioDataScript.src = "birthday-audio-data.js";
  audioDataScript.addEventListener("load", () => {
    if (typeof window.birthdayAudioData !== "string") {
      musicStatus.textContent = musicErrorMessage;
      console.error("Embedded background music data is missing.");
      return;
    }

    music.src = window.birthdayAudioData;
    musicToggle.disabled = false;
    musicStatus.textContent = "네가 좋아할지도 모르겠어서 넣어 봤어";
  });
  audioDataScript.addEventListener("error", () => {
    musicStatus.textContent = musicErrorMessage;
    console.error("Could not load embedded background music data.");
  });
  document.head.append(audioDataScript);

  const choiceAudioDataScript = document.createElement("script");
  choiceAudioDataScript.src = "birthday-music-choice-data.js";
  choiceAudioDataScript.addEventListener("load", () => {
    if (typeof window.birthdayChoiceAudioData !== "string") {
      musicStatus.textContent = choiceMusicErrorMessage;
      console.error("Embedded second background music data is missing.");
      return;
    }

    choiceMusic.src = window.birthdayChoiceAudioData;
    choiceMusicToggle.disabled = false;
  });
  choiceAudioDataScript.addEventListener("error", () => {
    musicStatus.textContent = choiceMusicErrorMessage;
    console.error("Could not load embedded second background music data.");
  });
  document.head.append(choiceAudioDataScript);
}

const musicChoices = [
  {
    audio: music,
    toggle: musicToggle,
    label: musicLabel,
    playLabel: "생일 배경음악 재생",
    pauseLabel: "생일 배경음악 정지",
    status: "생일 배경음악을 재생하고 있어요",
    errorMessage: musicErrorMessage,
  },
  {
    audio: choiceMusic,
    toggle: choiceMusicToggle,
    label: choiceMusicLabel,
    playLabel: "다른 배경음악 재생",
    pauseLabel: "다른 배경음악 정지",
    status: "두 번째 배경음악을 재생하고 있어요",
    errorMessage: choiceMusicErrorMessage,
  },
];

musicReset.addEventListener("click", () => {
  for (const choice of musicChoices) {
    choice.audio.pause();
    if (choice.audio.readyState > 0) choice.audio.currentTime = 0;
    choice.toggle.setAttribute("aria-pressed", "false");
    choice.label.textContent = choice.playLabel;
  }
  musicStatus.textContent = "네가 좋아할지도 모르겠어서 넣어 봤어";
});

for (const choice of musicChoices) {
  choice.toggle.addEventListener("click", async () => {
    if (!choice.audio.paused) {
      choice.audio.pause();
      return;
    }

    try {
      await choice.audio.play();
    } catch (error) {
      musicStatus.textContent = choice.errorMessage;
      console.error("Background music playback failed.", error);
    }
  });

  choice.audio.addEventListener("play", () => {
    const otherChoice = musicChoices.find((other) => other !== choice);
    otherChoice.audio.pause();
    choice.toggle.setAttribute("aria-pressed", "true");
    choice.label.textContent = choice.pauseLabel;
    musicStatus.textContent = choice.status;
  });

  choice.audio.addEventListener("pause", () => {
    choice.toggle.setAttribute("aria-pressed", "false");
    choice.label.textContent = choice.playLabel;
    if (musicChoices.every((other) => other.audio.paused)) {
      musicStatus.textContent = "네가 좋아할지도 모르겠어서 넣어 봤어";
    }
  });

  choice.audio.addEventListener("error", () => {
    musicStatus.textContent = choice.errorMessage;
    console.error("Background music could not be loaded.");
  });
}

const voucherDownload = document.querySelector(".voucher-download");
const voucherShare = document.querySelector("#voucher-share");
const voucherShareStatus = document.querySelector("#voucher-share-status");

if (navigator.share && navigator.canShare && typeof File !== "undefined") {
  fetch(voucherDownload.href)
    .then((response) => {
      if (!response.ok) throw new Error(`Voucher request failed: ${response.status}`);
      return response.blob();
    })
    .then((blob) => {
      const voucherFile = new File([blob], voucherDownload.download, { type: blob.type });
      if (!navigator.canShare({ files: [voucherFile] })) return;

      voucherShare.hidden = false;
      voucherShare.addEventListener("click", async () => {
        try {
          await navigator.share({ files: [voucherFile], title: "해미 초코케이크 교환권" });
          voucherShareStatus.textContent = "공유 메뉴에서 사진 앱이나 갤러리를 선택해 저장해 주세요.";
        } catch (error) {
          if (error.name === "AbortError") return;
          voucherShareStatus.textContent = "공유 메뉴를 열지 못했어요. 교환권 다운로드 버튼을 이용해 주세요.";
          console.error("Could not share the cake voucher.", error);
        }
      });
    })
    .catch((error) => {
      console.error("Could not prepare the cake voucher for sharing.", error);
    });
}
