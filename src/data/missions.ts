export type MissionData = {
  world: string;
  projectName: string;
  briefTitle: string;
  bugDescription: string;
  jobDescription: string;
  requirements: string[];
  starterCode: string;
  validate: (code: string) => [boolean, boolean, boolean];
  duckPrompt: string;
  mentorWelcome: string;
  launchpadFeedback: { author: string; type: "bug" | "praise" | "feature"; text: string; time: string }[];
};

export const MISSIONS: Record<string, MissionData> = {
  "Game Studio": {
    world: "Game Studio",
    projectName: "Space Defender Arcade",
    briefTitle: "Security Exploit Patched Needed (Variables & If-Statements)",
    bugDescription: "Players discovered a bug in Space Defender Arcade! If they spam the 'Alien Damage' button, the underlying mathematical score drops below zero, breaking the high-score boards.",
    jobDescription: "Your job is to refactor the scoring logic so the score hits rock-bottom exactly at 0. Write an if-statement or clamp the variable constraint.",
    requirements: [
      "Star Coins increase score (+10)",
      "Alien damage hurts score (-50)",
      "Score stops strictly at ≥ 0"
    ],
    starterCode: `<!-- Project: Space Defender Arcade -->
<div id="game">
  <h2>Score: <span id="score">0</span></h2>
  <button id="addScoreBtn">Collect Star Coin (+10)</button>
  <button id="alienDmgBtn">Take Alien Damage (-50)</button>
  <button id="resetScoreBtn">Reset</button>
</div>

<script>
  let score = 0;
  
  function updateDisplay() {
    document.getElementById("score").innerText = score;
  }

  document.getElementById("addScoreBtn").onclick = function() {
    score += 10;
    updateDisplay();
  };

  document.getElementById("alienDmgBtn").onclick = function() {
    // BUG: This blindly subtracts 50, even if the score is already 0!
    // TODO: Prevent the score from dropping into negative numbers.
    // Hint: Try using an if-statement, or the Math object's max method.
    score -= 50; 
    updateDisplay();
  };
  
  document.getElementById("resetScoreBtn").onclick = function() {
    score = 0;
    updateDisplay();
  };
</script>
`,
    validate: (code) => {
      const stripped = code.replace(/\s+/g, "");
      const req1 = stripped.includes("score+=10") || stripped.includes("score=score+10");
      
      const alienStart = stripped.indexOf("alienDmgBtn\").onclick=function(){");
      const resetStart = stripped.indexOf("resetScoreBtn\").onclick=function(){");
      const alienCode = alienStart > -1 ? stripped.slice(alienStart, resetStart > -1 ? resetStart : undefined) : "";
      
      const req2 = alienCode.includes("score-=50") || alienCode.includes("score=score-50");
      const minusIndex = Math.max(alienCode.indexOf("score-=50"), alienCode.indexOf("score=score-50"));
      const clampIndex = Math.max(
        alienCode.indexOf("Math.max(0"),
        alienCode.indexOf("score=Math.max"),
        alienCode.indexOf("if(score<0){score=0"),
        alienCode.indexOf("if(score<0)score=0"),
        alienCode.indexOf("if(score<=0)score=0")
      );
      
      // Ensures the clamp is typed AFTER the baseline subtraction
      const req3 = clampIndex > minusIndex && minusIndex > -1;
      return [req1, req2, req3];
    },
    duckPrompt: "The user just triggered the negative score bug. Ask them 'Walk me through what you expect the code to do when taking alien damage vs what is actually happening.'",
    mentorWelcome: "Welcome to PixelForge Game Studio! I'm Atlas. To kick off, test your basic logic and variable constraints. Try taking Alien Damage below 0!",
    launchpadFeedback: [
      { author: "QA_Robo_33", type: "bug", text: "I challenged my brother to tap the alien button to see who could get the lowest score! We got to -10,000!", time: "2 mins ago" },
      { author: "BetaTester9", type: "praise", text: "Wait this is so clean. Variables clamped properly.", time: "12 mins ago" },
      { author: "Lead_Producer", type: "feature", text: "Can we make the score flash green on +10?", time: "18 mins ago" }
    ]
  },

  "Music Tech Startup": {
    world: "Music Tech Startup",
    projectName: "Playlist Queue System",
    briefTitle: "Missing Track Enqueue Logic (Arrays)",
    bugDescription: "DJs can see their active playlist, but the 'Queue Song' button doesn't actually add the selected track into memory. The app is completely dropping inputs!",
    jobDescription: "Use array methods. Write a line of code using `.push()` to firmly append the `newTrack` string cleanly into the end of the `playlist` array.",
    requirements: [
      "Queue button is clicked",
      "Using the array.push() method",
      "Playlist array correctly receives the track"
    ],
    starterCode: `<!-- Project: DJ Queue Playlist -->
<div id="player">
  <h2>Current Queue: <span id="queueCount">2</span> tracks</h2>
  <ul id="playlistList" style="text-align: left; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
    <li>1. Neon Nights</li>
    <li>2. Cybernetic Pulse</li>
  </ul>
  <div style="margin-top: 1rem;">
    <input type="text" id="trackInput" value="Solar Winds" disabled style="padding: 4px; border-radius: 4px; text-align: center; color: black;" />
    <button id="queueBtn">Queue Song</button>
  </div>
  <button id="resetBtn" style="margin-top: 10px;">Reset Deck</button>
</div>

<script>
  let playlist = ["Neon Nights", "Cybernetic Pulse"];
  
  function renderUI() {
    document.getElementById("queueCount").innerText = playlist.length;
    let listHTML = "";
    for(let i = 0; i < playlist.length; i++) {
       listHTML += "<li>" + (i+1) + ". " + playlist[i] + "</li>";
    }
    document.getElementById("playlistList").innerHTML = listHTML;
  }

  document.getElementById("queueBtn").onclick = function() {
    let newTrack = document.getElementById("trackInput").value;
    
    // BUG: The core array is untouched!
    // TODO: Write a line of code to explicitly push 'newTrack' into the 'playlist' array!
    
    
    renderUI();
  };
  
  document.getElementById("resetBtn").onclick = function() {
    playlist = ["Neon Nights", "Cybernetic Pulse"];
    renderUI();
  };
</script>
`,
    validate: (code) => {
      const stripped = code.replace(/\s+/g, "");
      const req1Check = code.includes("queueBtn") && code.includes("onclick");
      
      const queueStart = stripped.indexOf("queueBtn\").onclick=function(){");
      const resetStart = stripped.indexOf("resetBtn\").onclick=function(){");
      const queueCode = queueStart > -1 ? stripped.slice(queueStart, resetStart > -1 ? resetStart : undefined) : "";
      
      const trackIndex = queueCode.indexOf("newTrack=");
      const pushIndex = queueCode.indexOf("playlist.push(");
      const renderIndex = queueCode.indexOf("renderUI()");
      
      const req2 = pushIndex > -1;
      // Ensure push is called after track is defined, but before UI is updated
      const req3 = pushIndex > trackIndex && pushIndex < renderIndex && trackIndex > -1 && renderIndex > -1;
      
      return [req1Check, req2, req3];
    },
    duckPrompt: "The user is having trouble adding items to an array. Ask them 'If you have a physical list of names on a piece of paper, what steps do you take to add a completely new name to the absolute bottom of it?'",
    mentorWelcome: "Welcome to the studio. I'm Atlas. The main playlist array is malfunctioning. We need to introduce array `.push()` methods so DJs can actually queue music!",
    launchpadFeedback: [
      { author: "DJ_Roomba", type: "bug", text: "I kept clicking queue on Solar Winds and absolutely nothing happened... so frustrating.", time: "1 min ago" },
      { author: "AudioPhil", type: "praise", text: "The array handles massive queues now. I pushed 300 tracks flawlessly.", time: "45 mins ago" },
      { author: "Product_Manager", type: "feature", text: "Can we add an array.pop() feature to undo a queued track?", time: "1 hour ago" }
    ]
  },

  "Space Agency": {
    world: "Space Agency",
    projectName: "Orbital Payload Deployment",
    briefTitle: "Systematic Deployment Failure (For Loops)",
    bugDescription: "The Lunar Lander has 5 supply crates sitting in orbital cargo. Pressing 'Deploy All' is supposed to systemically drop them one by one, but the repetition loop is completely missing from the module.",
    jobDescription: "Build a generic `for` loop that iterates exactly 5 times. Inside the loop block, mathematically increment the `deployedCrates` numerical counter and decrement the `cargoCrates`.",
    requirements: [
      "Deploy All button is clicked",
      "Using a standard 'for' loop syntax",
      "Deployed crates counter correctly reaches 5"
    ],
    starterCode: `<!-- Project: Orbital Deployment -->
<div id="module">
  <h2>Crates in Cargo: <span id="cargo" style="color: red;">5</span></h2>
  <h2>Crates Deployed: <span id="deployed" style="color: green;">0</span></h2>
  <button id="deployBtn">Deploy All</button>
  <button id="resetBtn">Reset Mission</button>
</div>

<script>
  let cargoCrates = 5;
  let deployedCrates = 0;
  
  function updateTelemetry() {
    document.getElementById("cargo").innerText = cargoCrates;
    document.getElementById("deployed").innerText = deployedCrates;
  }

  document.getElementById("deployBtn").onclick = function() {
    // CRITICAL BUG: It is highly inefficient to drop crates by typing 5 separate lines of code!
    // TODO: Write a loop that repeats exactly 5 times.
    // Inside the loop's block, increment deployedCrates and decrement cargoCrates by 1.
    
    
    updateTelemetry();
  };
  
  document.getElementById("resetBtn").onclick = function() {
    cargoCrates = 5;
    deployedCrates = 0;
    updateTelemetry();
  };
</script>
`,
    validate: (code) => {
      const stripped = code.replace(/\s+/g, "");
      const req1 = code.includes("deployBtn") && code.includes("onclick");
      
      const deployStart = stripped.indexOf("deployBtn\").onclick=function(){");
      const resetStart = stripped.indexOf("resetBtn\").onclick=function(){");
      const deployCode = deployStart > -1 ? stripped.slice(deployStart, resetStart > -1 ? resetStart : undefined) : "";
      
      const req2 = deployCode.includes("for(") && deployCode.includes("i++");
      
      const iterIndex = Math.max(
        deployCode.indexOf("deployedCrates++"),
        deployCode.indexOf("deployedCrates+=1"),
        deployCode.indexOf("cargoCrates--"),
        deployCode.indexOf("cargoCrates-=1")
      );
      const telemetryIndex = deployCode.indexOf("updateTelemetry()");
      
      // Makes sure crates are dropped within deployBtn and before rendering
      const req3 = iterIndex > -1 && iterIndex < telemetryIndex && telemetryIndex > -1;
      
      return [req1, req2, req3];
    },
    duckPrompt: "The user is having trouble with writing a for-loop structure. Ask them 'If you had to pass out 5 pieces of paper to a class, walk me through what you do iteratively until your hands are empty?'",
    mentorWelcome: "Welcome to Mission Control. I'm Atlas. The Lunar Lander's deployment system is totally manually coded right now. We need you to refactor it to use iterative For Loops so we can drop hundreds of crates systematically.",
    launchpadFeedback: [
      { author: "Astronaut_Dan", type: "bug", text: "The deployment button is completely non-functional. None of our supply crates dropped.", time: "4 mins ago" },
      { author: "Flight_Director", type: "praise", text: "The iterative loop dropped all 5 crates exactly 3 seconds apart. Clean code.", time: "11 mins ago" },
      { author: "UX_Eng", type: "feature", text: "Could we deploy them with a while-loop based on weight next time?", time: "22 mins ago" }
    ]
  },

  "Wildlife Conservation Lab": {
    world: "Wildlife Conservation Lab",
    projectName: "Drone Diagnostics Bootup",
    briefTitle: "JSON Property Mutation (JavaScript Objects)",
    bugDescription: "The recon drone's telemetry object successfully initializes its battery percentage, but the 'Boot Sequence' button fails to change its network status property to Online. It's grounded!",
    jobDescription: "Interact directly with a complex object. Use standard JavaScript dot-notation (e.g., `object.property = value`) to explicitly set the drone's `status` key from 'Offline' to 'Online'.",
    requirements: [
      "Boot Drone button is clicked",
      "Accessing the drone object explicitly",
      "Setting the string value to 'Online'"
    ],
    starterCode: `<!-- Project: Drone Telemetry -->
<div id="drone">
  <h2>Drone Battery: <span id="batt">80</span>%</h2>
  <h2>Network: <span id="net" style="color: red; font-weight: bold;">Offline</span></h2>
  <button id="bootBtn">Run Boot Sequence</button>
  <button id="resetBtn">Power Down</button>
</div>

<script>
  // This is a JavaScript Object tracking complex telemetry!
  const drone = {
    battery: 80,
    speed: 0,
    status: "Offline"
  };
  
  function updateUI() {
    document.getElementById("batt").innerText = drone.battery;
    document.getElementById("net").innerText = drone.status;
    
    if (drone.status === "Online") {
      document.getElementById("net").style.color = "green";
    } else {
      document.getElementById("net").style.color = "red";
    }
  }

  document.getElementById("bootBtn").onclick = function() {
    // CRITICAL BUG: The drone isn't booting because its status mapping remains untouched!
    // TODO: Write a single line of code targeting the 'drone' object using a dot.
    // Change its 'status' property to the string "Online"!
    
    
    updateUI();
  };
  
  document.getElementById("resetBtn").onclick = function() {
    drone.status = "Offline";
    updateUI();
  };
</script>
`,
    validate: (code) => {
      const stripped = code.replace(/\s+/g, "");
      const req1 = code.includes("bootBtn") && code.includes("onclick");
      
      const bootStart = stripped.indexOf("bootBtn\").onclick=function(){");
      const resetStart = stripped.indexOf("resetBtn\").onclick=function(){");
      const bootCode = bootStart > -1 ? stripped.slice(bootStart, resetStart > -1 ? resetStart : undefined) : "";
      
      const req2 = bootCode.includes("drone.");
      
      const statusIndex = Math.max(
        bootCode.indexOf("drone.status=\"Online\""),
        bootCode.indexOf("drone.status='Online'")
      );
      const uiIndex = bootCode.indexOf("updateUI()");
      
      // Mutate the property BEFORE the drone boots up
      const req3 = statusIndex > -1 && statusIndex < uiIndex && uiIndex > -1;
      
      return [req1, req2, req3];
    },
    duckPrompt: "The user is failing to mutate a property on a JSON object. Ask them 'If you have a backpack object containing a book, how do you specifically open the backpack to change out the book variable?'",
    mentorWelcome: "Welcome to the Conservation Lab. I'm Atlas. To finish this drone setup, you need to understand how to interact with JavaScript Objects representing real-world devices. Try flipping the status property!",
    launchpadFeedback: [
      { author: "Field_Tech_Sam", type: "bug", text: "We hit boot sequence 10 times but the JSON object just sat there holding the Offline string.", time: "8 mins ago" },
      { author: "Ecology_Prof", type: "praise", text: "Great understanding of data structures. The drone network pinged back perfectly.", time: "30 mins ago" },
      { author: "Pilot_X", type: "feature", text: "Can we track array coordinates inside the drone object next?", time: "2 hours ago" }
    ]
  }
};
