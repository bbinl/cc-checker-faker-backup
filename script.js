let stopChecking = false;
let currentCheckingIndex = 0; // To keep track of which card is being checked

document.addEventListener('DOMContentLoaded', () => {
    const checkBtn = document.getElementById("check-btn");
    const stopCheckBtn = document.getElementById("stop-check-btn");
    const numbersTextarea = document.getElementById("numbers");
    const resultOutputTextarea = document.getElementById("result-output"); // This will show general checking status

    // Get references to the specific result textareas
    const liveNumbersTextarea = document.getElementById("ali-numbers");
    const deadNumbersTextarea = document.getElementById("muhammad-numbers");
    const unknownNumbersTextarea = document.getElementById("murad-numbers");

    // Get references to the count display elements
    const liveCountSpan = document.getElementById("ali-count");
    const deadCountSpan = document.getElementById("muhammad-count");
    const unknownCountSpan = document.getElementById("murad-count");

    checkBtn.addEventListener("click", toggleChecking);
    stopCheckBtn.addEventListener("click", stopCheckingProcess);

    function toggleChecking() {
        checkBtn.disabled = true;
        stopCheckBtn.disabled = false;
        startChecking();
    }

    function stopCheckingProcess() {
        stopChecking = true;
        checkBtn.disabled = false;
        stopCheckBtn.disabled = true;
        Swal.fire("Checking Stopped", "Credit card checking has been stopped.", "info");
    }

    async function startChecking() {
        stopChecking = false;
        currentCheckingIndex = 0; // Reset index for a new check
        const input = numbersTextarea.value.trim();
        const cards = input.split("\n").filter(line => line.trim() !== "");

        // Clear previous results from all areas
        resultOutputTextarea.value = "Starting check..."; // Initial message
        liveNumbersTextarea.value = "";
        deadNumbersTextarea.value = "";
        unknownNumbersTextarea.value = "";

        // Reset counts
        updateSummaryCounts(0, 0, 0);

        if (cards.length === 0) {
            Swal.fire("No Cards", "Please enter credit card numbers to check.", "info");
            checkBtn.disabled = false;
            stopCheckBtn.disabled = true;
            resultOutputTextarea.value = "No cards to check.";
            return;
        }

        let liveCount = 0;
        let deadCount = 0;
        let unknownCount = 0;
        let totalCards = cards.length;

        for (let i = 0; i < totalCards; i++) {
            if (stopChecking) {
                updateStatusText(`Checking stopped at ${i}/${totalCards} cards.`);
                break;
            }

            const card = cards[i].trim();
            if (!card) continue;

            // Update general status area with current progress
            updateStatusText(`Checking card ${i + 1} of ${totalCards}...`);

            try {
                const apiUrl = `https://drlabapis.onrender.com/api/chk?cc=${encodeURIComponent(card)}`;

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                let resultLine = `${card} - ${data.message || 'No message'}`;
                
                if (data.response === "Live") {
                    liveCount++;
                    appendResultToSpecificOutput(liveNumbersTextarea, resultLine);
                } else if (data.response === "Dead") {
                    deadCount++;
                    appendResultToSpecificOutput(deadNumbersTextarea, resultLine);
                } else {
                    unknownCount++;
                    appendResultToSpecificOutput(unknownNumbersTextarea, resultLine);
                }

            } catch (err) {
                console.error("Error checking card:", card, err);
                unknownCount++;
                // Append error to unknown section if API call failed, but keep status brief
                appendResultToSpecificOutput(unknownNumbersTextarea, `${card} - Error: ${err.message || 'Network error / API issue'}`);
            }
            
            // Update counts on the UI
            updateSummaryCounts(liveCount, deadCount, unknownCount);
            
            // Short delay to avoid hammering the API and allow UI to update
            await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay

            currentCheckingIndex++; // Increment for next card
        }

        // Final summary message in the main status area
        updateStatusText(`Checking Finished! Total: ${totalCards}, Live: ${liveCount}, Dead: ${deadCount}, Unknown: ${unknownCount}`);

        checkBtn.disabled = false;
        stopCheckBtn.disabled = true;
        Swal.fire("Checking Complete", "All credit cards have been processed and sorted.", "success");
    }

    // Helper function to update the main status output by overwriting
    function updateStatusText(text) {
        resultOutputTextarea.value = text;
        resultOutputTextarea.scrollTop = resultOutputTextarea.scrollHeight; // Still scroll to bottom just in case
    }

    // Helper function to append text to a specific result textarea and scroll it
    function appendResultToSpecificOutput(textareaElement, text) {
        textareaElement.value += text + '\n';
        textareaElement.scrollTop = textareaElement.scrollHeight;
    }

    // Helper function to update the summary counts (Live, Dead, Unknown spans)
    function updateSummaryCounts(live, dead, unknown) {
        liveCountSpan.textContent = live;
        deadCountSpan.textContent = dead;
        unknownCountSpan.textContent = unknown;
    }

    // Function to handle copy to clipboard for textareas
    window.copyToClipboard = function(elementId) {
        const textareaElement = document.getElementById(elementId);
        if (textareaElement && textareaElement.value) {
            navigator.clipboard.writeText(textareaElement.value).then(() => {
                Swal.fire("Copied!", "Content copied to clipboard.", "success");
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                Swal.fire("Error", "Could not copy text.", "error");
            });
        } else {
            Swal.fire("No Content", "The section is empty.", "info");
        }
    }
});
