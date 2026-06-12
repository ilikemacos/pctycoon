let gameState = { activeUser: null, users: {} };
let activeCategoryFilter = 'all';
let benchmarkInterval = null;

const catalog = {
    'cpu_7600x': { name: 'AMD Ryzen 5 7600X (AM5 - DDR5 Only)', category: 'cpu', type: 'AM5', cost: 299, power: 105, score: 7200 },
    'cpu_7800x3d': { name: 'AMD Ryzen 7 7800X3D (AM5 - DDR5 Only)', category: 'cpu', type: 'AM5', cost: 449, power: 120, score: 9800 },
    'cpu_9850x3d': { name: 'AMD Ryzen 7 9850X3D (AM5 Next-Gen V-Cache)', category: 'cpu', type: 'AM5', cost: 589, power: 140, score: 14200 },
    'cpu_5800x3d': { name: 'AMD Ryzen 7 5800X3D (AM4 - DDR4 Only)', category: 'cpu', type: 'AM4', cost: 329, power: 105, score: 8100 },
    'cpu_5600x': { name: 'AMD Ryzen 5 5600X (AM4 - DDR4 Only)', category: 'cpu', type: 'AM4', cost: 189, power: 65, score: 5400 },
    
    'nv_3060': { name: 'NVIDIA GeForce RTX 3060 (12GB Ampere)', category: 'nvidia', cost: 339, score: 8500 },
    'amd_7900xt': { name: 'AMD Radeon RX 7900 XT (20GB RDNA 3)', category: 'amd', cost: 849, score: 19500 },
    'nv_5070ti': { name: 'NVIDIA GeForce RTX 5070 Ti (Blackwell 2026)', category: 'nvidia', cost: 899, score: 23000 },
    'nv_5080': { name: 'NVIDIA GeForce RTX 5080 (Blackwell 2026)', category: 'nvidia', cost: 1199, score: 31000 },
    
    'ram_flare_d5': { name: 'G.Skill Flare X5 32GB DDR5 6000MHz', category: 'ram', type: 'DDR5', cost: 145, score: 1200 },
    'ram_venge_d4': { name: 'Corsair Vengeance LPX 16GB DDR4 3200MHz', category: 'ram', type: 'DDR4', cost: 65, score: 700 },
    
    'ssd_850x_2tb': { name: 'WD Black SN850X 2TB NVMe M.2 Gen4', category: 'ssd', cost: 209, score: 1500 },
    'ssd_crucial_1tb': { name: 'Crucial P3 Plus 1TB Gen4 M.2', category: 'ssd', cost: 79, score: 950 },
    
    'cooler_pa120': { name: 'Thermalright Peerless Assassin 120 Air', category: 'cooler', cost: 44, score: 100 },
    'cooler_aio_360': { name: 'Deepcool LS720 360mm AIO Liquid', category: 'cooler', cost: 149, score: 250 },
    
    'disp_ips_144': { name: 'Gigabyte M27Q 27" 1440p IPS', category: 'display', cost: 329, score: 100 },
    'disp_oled_240': { name: 'ASUS ROG Swift 27" 240Hz OLED', category: 'display', cost: 899, score: 400 }
};

const PREBUILT_PRICES = { budget: 1000, mid: 2000, enthusiast: 4500 };
const PREBUILT_BONUSES = { budget: 750, mid: 1250, enthusiast: 2200 };

const database = [
    { q: "Which display configuration family allows for absolute infinite black contrast levels?", a: ["OLED technology panels.", "Standard twisted nematic legacy LCD panels.", "IPS panels driven by edge-lit LED configurations."], c: 0 },
    { q: "Why do hardware analysts choose the AMD Ryzen 7 9800X3D over alternative units for intense gaming?", a: ["It integrates custom layered 3D V-Cache architectures.", "It features low-efficiency processing units.", "It operates exclusively with legacy DDR4 memory frames."], c: 0 }
];

let currentQuestionIdx = 0;
let selectedQuizAnswer = null;
let quizEvaluated = false;

window.onload = function() { loadAccountsFromDisk(); };

function loadAccountsFromDisk() {
    const raw = localStorage.getItem('PC_Hardware_Tycoon_2026_Accounts_v12');
    if (raw) { gameState = JSON.parse(raw); } else { gameState = { activeUser: null, users: {} }; }
    renderProfilesTray();
    showAuthOverlay();
}

function saveAccountsToDisk() {
    localStorage.setItem('PC_Hardware_Tycoon_2026_Accounts_v12', JSON.stringify(gameState));
}

function renderProfilesTray() {
    const tray = document.getElementById('profiles-tray');
    const container = document.getElementById('profiles-list-buttons');
    container.innerHTML = '';
    let userKeys = Object.keys(gameState.users);
    if (userKeys.length > 0) {
        tray.style.display = 'block';
        userKeys.forEach(username => {
            container.innerHTML += '<button class="profile-badge-btn" onclick="selectUserField(\'' + username + '\')">👤 ' + username + '</button>';
        });
    } else { tray.style.display = 'none'; }
}

function selectUserField(username) {
    document.getElementById('auth-username-input').value = username;
    document.getElementById('auth-password-input').focus();
}

function accountRegister() {
    const usernameInput = document.getElementById('auth-username-input').value.trim();
    const passwordInput = document.getElementById('auth-password-input').value.trim();
    if (!usernameInput || !passwordInput) return alert("Please specify username and password!");
    if (gameState.users[usernameInput]) return alert("Profile handle already active!");
    
    let newInventory = {};
    for (let key in catalog) { newInventory[key] = 0; }
    
    const startingPoints = (usernameInput.toLowerCase() === 'mzx') ? 6000 : 1750;
    gameState.users[usernameInput] = { password: passwordInput, points: startingPoints, builds: 0, inventory: newInventory };
    applyUserProfile(usernameInput);
}

function accountLogin() {
    const usernameInput = document.getElementById('auth-username-input').value.trim();
    const passwordInput = document.getElementById('auth-password-input').value.trim();
    if (!usernameInput || !passwordInput) return alert("Enter credentials!");
    
    if (!gameState.users[usernameInput] && usernameInput.toLowerCase() === 'mzx' && passwordInput === '0415') {
        let newInventory = {};
        for (let key in catalog) { newInventory[key] = 0; }
        gameState.users[usernameInput] = { password: passwordInput, points: 50000, builds: 0, inventory: newInventory };
    }
    
    if (!gameState.users[usernameInput]) return alert("Account not found!");
    if (gameState.users[usernameInput].password !== passwordInput) return alert("Incorrect password!");
    
    applyUserProfile(usernameInput);
}

function applyUserProfile(username) {
    gameState.activeUser = username;
    saveAccountsToDisk();
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-game-workspace').style.display = 'block';
    document.getElementById('hud-user').innerText = username;
    renderShop(); loadNextQuestion(); updateHUD(); renderProfilesTray(); resetBenchmarkDisplay(); renderAdminPanel();
}

function accountLogout() { gameState.activeUser = null; saveAccountsToDisk(); showAuthOverlay(); }

function showAuthOverlay() {
    document.getElementById('auth-box').style.display = 'block';
    document.getElementById('main-game-workspace').style.display = 'none';
    renderProfilesTray();
}

function renderShop() {
    const grid = document.getElementById('shop-container'); grid.innerHTML = '';
    for (let key in catalog) {
        let p = catalog[key];
        if (activeCategoryFilter !== 'all' && p.category !== activeCategoryFilter) continue;
        grid.innerHTML += `
            <div class="shop-item">
                <div class="item-info"><h4>` + p.name + `</h4><span>Category: ` + p.category.toUpperCase() + `</span></div>
                <div style="text-align: right; display:flex; flex-direction:column; gap:4px; align-items:flex-end;">
                    <span class="price">$` + p.cost + ` CAD</span>
                    <button class="buy-btn" id="buy-` + key + `" onclick="purchaseItem('` + key + `')">Buy Part</button>
                </div>
            </div>`;
    }
    renderShopButtons();
}

function updateHUD() {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    document.getElementById('hud-points').innerText = "$" + currentUser.points + " CAD";
    let totalParts = 0;
    for (let key in currentUser.inventory) { totalParts += currentUser.inventory[key]; }
    document.getElementById('hud-parts').innerText = totalParts + " Pcs";
    document.getElementById('hud-builds').innerText = currentUser.builds + " Built";
    renderInventoryAndSelectors(); renderShopButtons(); updatePrebuiltButtons(); renderAdminPanel();
}

function filterShop(category) {
    activeCategoryFilter = category;
    const tabs = document.getElementsByClassName('nav-tab');
    for (let tab of tabs) tab.classList.remove('active');
    let targetTab = document.getElementById('tab-' + category);
    if(targetTab) targetTab.classList.add('active');
    renderShop();
}

function renderShopButtons() {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    for (let key in catalog) {
        let btn = document.getElementById('buy-' + key);
        if (btn) {
            if (currentUser.points >= catalog[key].cost) {
                btn.removeAttribute('disabled'); btn.innerText = "Buy Part";
            } else {
                btn.setAttribute('disabled', 'true'); btn.innerText = "No Funds";
            }
        }
    }
}

function updatePrebuiltButtons() {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    for (let tier in PREBUILT_PRICES) {
        let btn = document.getElementById('buy-prebuilt-' + tier);
        if (btn) {
            if (currentUser.points >= PREBUILT_PRICES[tier]) {
                btn.removeAttribute('disabled'); btn.innerText = "Buy Pre-Built";
            } else {
                btn.setAttribute('disabled', 'true'); btn.innerText = "No Funds";
            }
        }
    }
}

function purchaseItem(key) {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    if (currentUser.points >= catalog[key].cost) {
        currentUser.points -= catalog[key].cost; currentUser.inventory[key]++;
        saveAccountsToDisk(); updateHUD(); logWorkshop("Purchased " + catalog[key].name + ".");
    }
}

function purchasePrebuilt(tier) {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    let cost = PREBUILT_PRICES[tier];
    let bonus = PREBUILT_BONUSES[tier];

    if (currentUser.points >= cost) {
        currentUser.points -= cost;
        currentUser.builds++;
        currentUser.points += bonus;
        
        logWorkshop("⚡ LAZY-BUY: Purchased " + tier.toUpperCase() + " Pre-built rig for $" + cost + " CAD! Contract reward processing: +$" + bonus + " CAD injected.");
        
        if (currentUser.builds === 1) {
            currentUser.points += 500;
            logWorkshop("🎁 GRAND OPENING PRIZE: Handed +$500 CAD Cash Prize for shipping your first machine!");
        } else if (currentUser.builds % 3 === 0) {
            currentUser.points += 1000;
            logWorkshop("🏆 PRODUCTION MULTIPLIER HIT: Issued +$1,000 CAD Production Bonus Grant!");
        }

        saveAccountsToDisk();
        updateHUD();
        alert("⚡ Pre-Built Deployed! Total cost: $" + cost + " CAD. Payout gained: +$" + bonus + " CAD!");
    }
}

// ---- VER 1.2 NEW FEATURE: REAL-TIME BENCHMARKING ENGINE LAB ----
function resetBenchmarkDisplay() {
    document.getElementById('bench-score-gpu').innerText = "--";
    document.getElementById('bench-score-cpu').innerText = "--";
    document.getElementById('bench-revenue-payout').innerText = "+$0 CAD";
    document.getElementById('bench-status-badge').innerText = "[STANDBY]";
    document.getElementById('bench-status-badge').style.color = "#64748b";
    document.getElementById('bench-progress-frame').style.display = 'none';
    document.getElementById('bench-console-text').innerText = "> System engine matrix ready for stress sweep parameters... Select current components inside the assembly bays below to index performance parameters.";
}

function executeBenchmarkSweep() {
    if (!gameState.activeUser) return;
    
    const cpuKey = document.getElementById('slot-cpu').value;
    const gpuKey = document.getElementById('slot-gpu').value;
    const ramKey = document.getElementById('slot-ram').value;
    const ssdKey = document.getElementById('slot-ssd').value;
    const coolerKey = document.getElementById('slot-cooler').value;
    const displayKey = document.getElementById('slot-display').value;

    // Check compatibility before loading test engine
    let isCompatible = true;
    if (cpuKey && ramKey) {
        if (catalog[cpuKey].type === 'AM5' && catalog[ramKey].type === 'DDR4') isCompatible = false;
        if (catalog[cpuKey].type === 'AM4' && catalog[ramKey].type === 'DDR5') isCompatible = false;
    }

    if (!cpuKey || !gpuKey || !ramKey || !ssdKey || !coolerKey || !displayKey || !isCompatible) {
        document.getElementById('bench-console-text').innerHTML = "<span style='color:#f87171;'>❌ ENGINE ERROR: Benchmarking suite aborted. You must configure a fully occupied, error-free component setup in the assembly bay fields below before booting benchmarks!</span>";
        return;
    }

    const testSuite = document.getElementById('bench-test-suite').value;
    const btn = document.getElementById('bench-start-btn');
    const badge = document.getElementById('bench-status-badge');
    const progressFrame = document.getElementById('bench-progress-frame');
    const progressFill = document.getElementById('bench-progress-fill');
    const consoleText = document.getElementById('bench-console-text');

    btn.disabled = true;
    progressFrame.style.display = 'block';
    badge.innerText = "[RUNNING SWEEP]";
    badge.style.color = "#eab308";
    
    let currentPct = 0;
    if (benchmarkInterval) clearInterval(benchmarkInterval);

    benchmarkInterval = setInterval(() => {
        currentPct += 10;
        progressFill.style.width = currentPct + "%";
        
        if (currentPct === 20) {
            consoleText.innerText = "> Loading test parameters... Injecting system workloads into core shaders.";
        } else if (currentPct == 50) {
            consoleText.innerText = "> Running physics simulation frames... Measuring thermal output loops on cooler module.";
        } else if (currentPct == 80) {
            consoleText.innerText = "> final scaling sweep... Generating multi-threaded thread calls across storage links.";
        }

        if (currentPct >= 100) {
            clearInterval(benchmarkInterval);
            btn.disabled = false;
            badge.innerText = "[COMPLETED]";
            badge.style.color = "#22c55e";
            
            // Calculate scores based on the catalog metrics
            let rawCpu = catalog[cpuKey].score;
            let rawGpu = catalog[gpuKey].score;
            let secondaryBonus = catalog[ramKey].score + catalog[ssdKey].score + catalog[coolerKey].score + catalog[displayKey].score;

            let finalGpuScore = 0;
            let finalCpuScore = 0;

            if (testSuite === "timespy") {
                finalGpuScore = Math.floor(rawGpu * 1.05 + (secondaryBonus * 0.1));
                finalCpuScore = Math.floor(rawCpu * 0.9);
                consoleText.innerHTML = "✨ <strong>3DMark Sweep Completed!</strong> Highly optimal results logged. Direct 3D shader compute capacity maximized.";
            } else if (testSuite === "cinebench") {
                finalGpuScore = Math.floor(rawGpu * 0.3);
                finalCpuScore = Math.floor(rawCpu * 1.4 + (secondaryBonus * 0.15));
                consoleText.innerHTML = "✨ <strong>Cinebench Multi-Thread Burn Complete!</strong> CPU architecture pushed to raw limits. Rendering passes finished.";
            } else if (testSuite === "cyberpunk") {
                finalGpuScore = Math.floor(rawGpu * 1.35);
                finalCpuScore = Math.floor(rawCpu * 0.95);
                consoleText.innerHTML = "✨ <strong>Cyberpunk RT Overdrive Simulation Stable!</strong> Trace hierarchies processed successfully.";
            }

            // Display values inside the lab console dashboard boxes
            document.getElementById('bench-score-gpu').innerText = finalGpuScore.toLocaleString();
            document.getElementById('bench-score-cpu').innerText = finalCpuScore.toLocaleString();

            // GOLD MINE REVENUE CONVERSION LAYER: Calculate actual financial payout based on performance!
            let goldMineYield = 100;
            document.getElementById('bench-revenue-payout').innerText = "+$" + goldMineYield + " CAD";
            
            // Inject Gold Mine payout funds directly into user profile bank account balance
            gameState.users[gameState.activeUser].points += goldMineYield;
            saveAccountsToDisk();
            updateHUD();

            logWorkshop("📊 BENCHMARK BONUS: Profile executed hardware sweep. Gold mine algorithm converted performance to +$" + goldMineYield + " CAD!");
        }
    }, 250);
}

function loadNextQuestion() {
    quizEvaluated = false; selectedQuizAnswer = null; document.getElementById('quiz-feedback').innerHTML = '';
    const btn = document.getElementById('quiz-action-btn'); btn.innerText = "Check Answer"; btn.setAttribute('disabled', 'true');
    currentQuestionIdx = Math.floor(Math.random() * database.length);
    let qData = database[currentQuestionIdx];
    document.getElementById('q-text').innerText = qData.q;
    const optContainer = document.getElementById('options-container'); optContainer.innerHTML = '';
    qData.a.forEach((optionText, idx) => {
        optContainer.innerHTML += '<button class="option-btn" onclick="selectQuizOption(this, ' + idx + ')">' + optionText + '</button>';
    });
}

function selectQuizOption(element, idx) {
    if (quizEvaluated) return;
    const btns = document.getElementById('options-container').getElementsByClassName('option-btn');
    for (let b of btns) b.classList.remove('selected');
    element.classList.add('selected'); selectedQuizAnswer = idx;
    document.getElementById('quiz-action-btn').removeAttribute('disabled');
}

function handleQuizAction() {
    const btn = document.getElementById('quiz-action-btn');
    const feedback = document.getElementById('quiz-feedback');
    let qData = database[currentQuestionIdx];
    if (!quizEvaluated) {
        quizEvaluated = true;
        const btns = document.getElementById('options-container').getElementsByClassName('option-btn');
        if (selectedQuizAnswer === qData.c) {
            btns[selectedQuizAnswer].classList.add('correct');
            feedback.innerHTML = "🎉 Correct! +$500 CAD."; feedback.style.color = "#4ade80";
            gameState.users[gameState.activeUser].points += 500;
            saveAccountsToDisk(); updateHUD();
        } else {
            btns[selectedQuizAnswer].classList.add('incorrect'); btns[qData.c].classList.add('correct');
            feedback.innerHTML = "❌ Architectural mismatch!"; feedback.style.color = "#ef4444";
        }
        btn.innerText = "Next Challenge";
    } else { loadNextQuestion(); }
}

function renderInventoryAndSelectors() {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    const manifest = document.getElementById('inventory-manifest-list');
    let partsList = [];
    for (let key in currentUser.inventory) {
        if (currentUser.inventory[key] > 0) partsList.push(catalog[key].name + " (x" + currentUser.inventory[key] + ")");
    }
    manifest.innerText = partsList.length > 0 ? partsList.join(', ') : "No items owned.";
    populateSlotSelect('slot-cpu', ['cpu']); populateSlotSelect('slot-gpu', ['nvidia', 'amd']);
    populateSlotSelect('slot-ram', ['ram']); populateSlotSelect('slot-ssd', ['ssd']); 
    populateSlotSelect('slot-cooler', ['cooler']); populateSlotSelect('slot-display', ['display']); 
}

function populateSlotSelect(selectId, targetCategories) {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    const select = document.getElementById(selectId);
    const currentSelection = select.value;
    select.innerHTML = '<option value="">-- Select Available Core Stock --</option>';
    let foundAny = false;
    for (let key in catalog) {
        if (targetCategories.includes(catalog[key].category) && currentUser.inventory[key] > 0) {
            foundAny = true; let opt = document.createElement('option');
            opt.value = key; opt.text = catalog[key].name + " [Qty: " + currentUser.inventory[key] + "]";
            if (key === currentSelection) opt.selected = true;
            select.appendChild(opt);
        }
    }
    if (!foundAny) select.innerHTML = '<option value="">-- No Matching Stock --</option>';
}

function syncRigVisuals() {
    const cpuKey = document.getElementById('slot-cpu').value; 
    const gpuKey = document.getElementById('slot-gpu').value;
    const ramKey = document.getElementById('slot-ram').value; 
    const ssdKey = document.getElementById('slot-ssd').value;
    const coolerKey = document.getElementById('slot-cooler').value; 
    const displayKey = document.getElementById('slot-display').value;

    let isCompatible = true;
    let errorMsg = "";
    const alertBanner = document.getElementById('compatibility-alert-banner');
    
    if (cpuKey && ramKey) {
        let selectedCpu = catalog[cpuKey];
        let selectedRam = catalog[ramKey];
        
        if (selectedCpu.type === 'AM5' && selectedRam.type === 'DDR4') {
            isCompatible = false;
            errorMsg = "⚠️ ARCHITECTURAL CONFLICT: AMD AM5 Processors strictly reject DDR4 configurations! Match with a DDR5 Memory kit.";
        }
        else if (selectedCpu.type === 'AM4' && selectedRam.type === 'DDR5') {
            isCompatible = false;
            errorMsg = "⚠️ GEN ARCHITECTURAL CONFLICT: Legacy AMD AM4 sockets cannot execute on DDR5 architecture lines! Remount using a DDR4 memory stick.";
        }
    }

    if (!isCompatible) {
        alertBanner.innerText = errorMsg;
        alertBanner.style.display = 'block';
    } else {
        alertBanner.style.display = 'none';
    }

    document.getElementById('vis-node-cpu').innerHTML = cpuKey ? "💾 CPU: CONNECTED" : "💾 CPU Slot: EMPTY";
    document.getElementById('vis-node-gpu').innerHTML = gpuKey ? "🎮 GPU: ACTIVE" : "🎮 GPU Slot: EMPTY";
    document.getElementById('vis-node-ram').innerHTML = ramKey ? "⚡ RAM: ARMED" : "⚡ RAM Slot: EMPTY";
    document.getElementById('vis-node-ssd').innerHTML = ssdKey ? "🗂️ SSD: MOUNTED" : "🗂️ Storage: EMPTY";

    const screen = document.getElementById('vis-monitor-screen');
    if (displayKey) {
        if (cpuKey && gpuKey && ramKey && ssdKey && coolerKey && isCompatible) {
            screen.innerHTML = "🖥️ SYSTEM BOOT SUCCESS!<br><span style='font-size:7pt; color:#eab308;'>[POST Verification Passed]</span>";
        } else if (!isCompatible) {
            screen.innerHTML = "❌ BOOT MALFUNCTION<br><span style='font-size:7pt; color:#ef4444;'>[Socket Matrix Error]</span>";
        } else {
            screen.innerHTML = "⚠️ NO POST SIGNAL<br><span style='font-size:7pt; color:#94a3b8;'>[Wiring Incomplete]</span>";
        }
    } else {
        screen.innerHTML = "🖥️ NO DISPLAY SIGNAL";
    }

    document.getElementById('assemble-action-btn').disabled = !(cpuKey && gpuKey && ramKey && ssdKey && coolerKey && displayKey && isCompatible);
}

function triggerSystemAssembly() {
    if (!gameState.activeUser) return;
    let currentUser = gameState.users[gameState.activeUser];
    const cpu = document.getElementById('slot-cpu').value; const gpu = document.getElementById('slot-gpu').value;
    const ram = document.getElementById('slot-ram').value; const ssd = document.getElementById('slot-ssd').value;
    const cooler = document.getElementById('slot-cooler').value; const display = document.getElementById('slot-display').value;

    if (cpu && gpu && ram && ssd && cooler && display) {
        currentUser.inventory[cpu]--; currentUser.inventory[gpu]--; currentUser.inventory[ram]--; 
        currentUser.inventory[ssd]--; currentUser.inventory[cooler]--; currentUser.inventory[display]--;
        
        currentUser.builds++;
        logWorkshop("✨ Rig compiled and deployed successfully!");

        if (cpu === 'cpu_7600x' && gpu === 'nv_3060') {
            currentUser.points += 750;
            logWorkshop("🎯 BUDGET BONUS: Fulfilled Ryzen 5 7600X + RTX 3060 configuration! Earned +$750 CAD.");
            alert("🎯 Objective Fulfilled! Budget category rig distributed. Wired +$750 CAD bonus!");
        }
        
        if (cpu === 'cpu_7800x3d' && gpu === 'amd_7900xt') {
            currentUser.points += 1250;
            logWorkshop("🎯 MID-RANGE BONUS: Fulfilled Ryzen 7 7800X3D + RX 7900 XT configuration! Earned +$1,250 CAD.");
            alert("🎯 Objective Fulfilled! Mid-Range performance category rig distributed. Wired +$1,250 CAD bonus!");
        }

        if (cpu === 'cpu_9850x3d' && (gpu === 'nv_5070ti' || gpu === 'nv_5080')) {
            currentUser.points += 2200;
            logWorkshop("🎯 ENTHUSIAST BONUS: Fulfilled Ryzen 7 9850X3D + " + catalog[gpu].name.split(' (')[0] + " configuration! Earned +$2,200 CAD.");
            alert("🎯 Objective Fulfilled! Next-Gen Enthusiast category rig distributed. Wired +$2,200 CAD bonus!");
        }

        if (currentUser.builds === 1) {
            currentUser.points += 500;
            logWorkshop("🎁 GRAND OPENING PRIZE: Handed +$500 CAD Cash Prize for shipping your first machine!");
            alert("🎉 First Build Milestone Completed! The hardware firm has wired you a bonus +$500 CAD prize!");
        } 
        else if (currentUser.builds % 3 === 0) {
            currentUser.points += 1000;
            logWorkshop("🏆 PRODUCTION MULTIPLIER HIT: Issued +$1,000 CAD Production Bonus Grant!");
            alert("🏆 Milestone Achieved! You reached " + currentUser.builds + " built systems. Enjoy your +$1,000 CAD management grant!");
        }
        
        saveAccountsToDisk();
        document.getElementById('slot-cpu').value = ""; document.getElementById('slot-gpu').value = "";
        document.getElementById('slot-ram').value = ""; document.getElementById('slot-ssd').value = "";
        document.getElementById('slot-cooler').value = ""; document.getElementById('slot-display').value = "";
        syncRigVisuals(); updateHUD(); resetBenchmarkDisplay();
    }
}

function logWorkshop(message) {
    const output = document.getElementById('workshop-log-output');
    output.innerHTML += "<br>> " + message; output.scrollTop = output.scrollHeight;
}

// ── VER 1.3.10 YOSEMITE: MZX ADMIN PANEL ────────────────────────────────────

function renderAdminPanel() {
    const panel = document.getElementById('mzx-admin-panel');
    const grid  = document.getElementById('admin-accounts-grid');
    if (!panel || !grid) return;

    // Only visible for mzx
    if (!gameState.activeUser || gameState.activeUser.toLowerCase() !== 'mzx') {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    grid.innerHTML = '';

    const users = gameState.users;
    const userKeys = Object.keys(users);

    if (userKeys.length === 0) {
        grid.innerHTML = '<span style="color:#64748b; font-size:9pt;">No registered accounts found.</span>';
        return;
    }

    userKeys.forEach(function(username) {
        const user = users[username];
        const isSelf = username.toLowerCase() === 'mzx';
        const cardColor = isSelf ? 'rgba(239,68,68,0.08)' : 'rgba(30,41,59,0.6)';
        const borderColor = isSelf ? '#ef4444' : '#334155';

        grid.innerHTML += `
            <div style="background:${cardColor}; border:1px solid ${borderColor}; border-radius:8px; padding:14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-weight:900; font-size:10pt; color:${isSelf ? '#f87171' : '#f8fafc'};">
                        👤 ${username}${isSelf ? ' <span style="font-size:7pt; color:#ef4444;">[ADMIN]</span>' : ''}
                    </span>
                    <span style="font-size:8.5pt; color:#4ade80; font-family:monospace; font-weight:bold;">
                        $${user.points.toLocaleString()} CAD
                    </span>
                </div>
                <div style="font-size:8pt; color:#94a3b8; margin-bottom:10px;">
                    Builds: ${user.builds} &nbsp;|&nbsp; Parts: ${Object.values(user.inventory).reduce((a,b)=>a+b,0)}
                </div>
                <div style="display:flex; gap:6px; align-items:center;">
                    <input
                        type="number"
                        id="admin-input-${username}"
                        placeholder="Amount..."
                        min="1"
                        style="background:#0f172a; border:1px solid #475569; color:#f8fafc; padding:6px 8px; border-radius:5px; font-size:9pt; width:100%; -moz-appearance:textfield;"
                    >
                </div>
                <div style="display:flex; gap:6px; margin-top:8px;">
                    <button
                        onclick="adminAdjustFunds('${username}', 'add')"
                        style="flex:1; background:#22c55e; border:none; border-bottom:3px solid #16a34a; color:white; padding:7px; font-weight:bold; border-radius:6px; cursor:pointer; font-size:8.5pt;">
                        ＋ Add
                    </button>
                    <button
                        onclick="adminAdjustFunds('${username}', 'deduct')"
                        style="flex:1; background:#ef4444; border:none; border-bottom:3px solid #b91c1c; color:white; padding:7px; font-weight:bold; border-radius:6px; cursor:pointer; font-size:8.5pt;">
                        － Deduct
                    </button>
                </div>
            </div>`;
    });
}

function adminAdjustFunds(username, action) {
    const input = document.getElementById('admin-input-' + username);
    const amount = parseInt(input.value);

    if (!input.value || isNaN(amount) || amount <= 0) {
        alert('⚠️ Enter a valid positive amount first.');
        return;
    }

    const user = gameState.users[username];
    if (!user) return;

    if (action === 'add') {
        user.points += amount;
        alert('✅ Added $' + amount.toLocaleString() + ' CAD to ' + username + '\'s account.\nNew balance: $' + user.points.toLocaleString() + ' CAD');
    } else {
        if (user.points - amount < 0) {
            if (!confirm('⚠️ This will put ' + username + ' into a negative balance ($' + (user.points - amount).toLocaleString() + ' CAD). Continue?')) return;
        }
        user.points -= amount;
        alert('✅ Deducted $' + amount.toLocaleString() + ' CAD from ' + username + '\'s account.\nNew balance: $' + user.points.toLocaleString() + ' CAD');
    }

    input.value = '';
    saveAccountsToDisk();
    updateHUD();
    renderAdminPanel();
}
