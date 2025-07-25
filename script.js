let stopChecking = false;

function toggleButtons() {
  document.getElementById("check-btn").disabled = true;
  document.getElementById("stop-check-btn").disabled = false;
  startChecking();
}

function copyToClipboard(containerId) {
  const content = document.getElementById(containerId).innerText;
  navigator.clipboard.writeText(content).then(() => {
    Swal.fire("Copied!", "", "success");
  });
}

document.getElementById("stop-check-btn").addEventListener("click", () => {
  stopChecking = true;
  document.getElementById("check-btn").disabled = false;
  document.getElementById("stop-check-btn").disabled = true;
});

async function startChecking() {
  stopChecking = false;

  const input = document.getElementById("numbers").value.trim();
  const cards = input.split("\n").filter(line => line.trim() !== "");

  let liveCount = 0;
  let deadCount = 0;
  let unknownCount = 0;

  const liveDiv = document.getElementById("ali-numbers");
  const deadDiv = document.getElementById("muhammad-numbers");
  const unknownDiv = document.getElementById("murad-numbers");

  const liveCountSpan = document.getElementById("ali-count");
  const deadCountSpan = document.getElementById("muhammad-count");
  const unknownCountSpan = document.getElementById("murad-count");

  // Clear previous results
  liveDiv.innerHTML = "";
  deadDiv.innerHTML = "";
  unknownDiv.innerHTML = "";

  for (let i = 0; i < cards.length; i++) {
    if (stopChecking) break;

    const card = cards[i].trim();
    if (!card) continue;

    try {
      const response = await fetch(`https://bbinl.islamraisul796.workers.dev/?cc=${encodeURIComponent(card)}`);
      const data = await response.json();
      const result = data?.response?.trim().toLowerCase();

      if (result === "live") {
        liveCount++;
        liveDiv.innerHTML += `${card}<br>`;
        liveCountSpan.textContent = liveCount;
      } else if (result === "dead") {
        deadCount++;
        deadDiv.innerHTML += `${card}<br>`;
        deadCountSpan.textContent = deadCount;
      } else {
        unknownCount++;
        unknownDiv.innerHTML += `${card}<br>`;
        unknownCountSpan.textContent = unknownCount;
      }
    } catch (err) {
      console.error("Error checking card:", card, err);
      unknownCount++;
      unknownDiv.innerHTML += `${card}<br>`;
      unknownCountSpan.textContent = unknownCount;
    }

    // Optional delay to avoid rate-limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Enable buttons again
  document.getElementById("check-btn").disabled = false;
  document.getElementById("stop-check-btn").disabled = true;
}
