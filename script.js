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
    // Display Tech
    { q: "Which display technology allows for absolute infinite black contrast levels?", a: ["OLED panels.", "IPS LCD panels.", "TN panels."], c: 0, topic: "Displays" },
    { q: "What does 'refresh rate' mean on a monitor?", a: ["How many frames per second the screen can display.", "How fast the GPU renders frames.", "The brightness level of the backlight."], c: 0, topic: "Displays" },
    { q: "What resolution does 1440p refer to?", a: ["2560x1440 pixels.", "1920x1080 pixels.", "3840x2160 pixels."], c: 0, topic: "Displays" },
    { q: "Which panel type offers the widest colour accuracy for creative work?", a: ["IPS panels.", "TN panels.", "VA panels."], c: 0, topic: "Displays" },
    { q: "What does 'HDR' stand for in displays?", a: ["High Dynamic Range.", "High Definition Resolution.", "Hardware Display Rendering."], c: 0, topic: "Displays" },
    // CPU
    { q: "Why do hardware analysts choose the AMD Ryzen 7 9800X3D for gaming?", a: ["It integrates 3D V-Cache for massive cache capacity.", "It uses the fastest clock speed of any CPU.", "It is the cheapest AM5 processor available."], c: 0, topic: "CPUs" },
    { q: "What CPU socket do AMD Ryzen 7000 and 9000 series processors use?", a: ["AM5.", "AM4.", "LGA1700."], c: 0, topic: "CPUs" },
    { q: "What memory type is required for AM5 platform CPUs?", a: ["DDR5.", "DDR4.", "DDR3."], c: 0, topic: "CPUs" },
    { q: "What does 'TDP' stand for in CPUs?", a: ["Thermal Design Power.", "Total Data Processing.", "Transistor Density Peak."], c: 0, topic: "CPUs" },
    { q: "What is the purpose of CPU cache (L3)?", a: ["Store frequently accessed data close to the processor for faster access.", "Store the operating system files.", "Control the GPU render pipeline."], c: 0, topic: "CPUs" },
    { q: "What does 'core count' mean in a CPU?", a: ["The number of independent processing units inside the chip.", "The number of RAM slots supported.", "The number of PCIe lanes available."], c: 0, topic: "CPUs" },
    { q: "Which Intel socket is used by 13th and 14th gen processors?", a: ["LGA1700.", "LGA1200.", "AM5."], c: 0, topic: "CPUs" },
    { q: "What does overclocking a CPU mean?", a: ["Running it at a higher clock speed than the factory setting.", "Reducing power consumption below default.", "Enabling more RAM channels."], c: 0, topic: "CPUs" },
    // GPU
    { q: "What does GPU stand for?", a: ["Graphics Processing Unit.", "General Processing Utility.", "Graphics Power Unit."], c: 0, topic: "GPUs" },
    { q: "What architecture do NVIDIA RTX 5000 series GPUs use?", a: ["Blackwell.", "Ada Lovelace.", "Ampere."], c: 0, topic: "GPUs" },
    { q: "What architecture do NVIDIA RTX 3000 series GPUs use?", a: ["Ampere.", "Blackwell.", "Ada Lovelace."], c: 0, topic: "GPUs" },
    { q: "What does VRAM stand for?", a: ["Video Random Access Memory.", "Virtual RAM.", "Variable RAM Architecture."], c: 0, topic: "GPUs" },
    { q: "What is ray tracing in GPUs?", a: ["A technique that simulates realistic lighting by tracing light rays.", "A method of compressing textures on the GPU.", "A way to overclock the GPU shader cores."], c: 0, topic: "GPUs" },
    { q: "What does RDNA stand for in AMD GPUs?", a: ["Radeon DNA architecture.", "Rapid Display Node Architecture.", "Radeon Direct Node Access."], c: 0, topic: "GPUs" },
    { q: "Which GPU series is used for budget 1080p gaming in this game?", a: ["RTX 3060.", "RTX 5080.", "RX 7900 XT."], c: 0, topic: "GPUs" },
    // RAM
    { q: "What does DDR5 offer over DDR4?", a: ["Higher bandwidth and lower voltage.", "Lower latency at the same speed.", "Compatibility with older AM4 motherboards."], c: 0, topic: "RAM" },
    { q: "What does RAM stand for?", a: ["Random Access Memory.", "Rapid Access Module.", "Read-Access Memory."], c: 0, topic: "RAM" },
    { q: "What does 'dual-channel RAM' mean?", a: ["Two RAM sticks working together for double the bandwidth.", "RAM running at twice its rated speed.", "RAM with two voltage rails."], c: 0, topic: "RAM" },
    { q: "What unit is used to measure RAM speed?", a: ["MHz (Megahertz).", "MB/s (Megabytes per second).", "Watts."], c: 0, topic: "RAM" },
    { q: "Which RAM type is compatible with AM4 platform CPUs?", a: ["DDR4.", "DDR5.", "DDR3."], c: 0, topic: "RAM" },
    // Storage
    { q: "What does NVMe stand for?", a: ["Non-Volatile Memory Express.", "New Volume Memory Extension.", "Network Volume Media Express."], c: 0, topic: "Storage" },
    { q: "Which storage type is fastest for a gaming PC?", a: ["NVMe M.2 SSD.", "SATA SSD.", "7200RPM HDD."], c: 0, topic: "Storage" },
    { q: "What does 'Gen4' mean for an NVMe SSD?", a: ["It uses PCIe 4.0 lanes for faster transfer speeds.", "It is the 4th generation of SATA.", "It has 4TB of storage capacity."], c: 0, topic: "Storage" },
    { q: "What is the main advantage of an SSD over an HDD?", a: ["No moving parts means much faster read/write speeds.", "Higher storage capacity per dollar.", "Lower power consumption only."], c: 0, topic: "Storage" },
    // Cooling
    { q: "What does AIO stand for in PC cooling?", a: ["All-In-One liquid cooler.", "Air Intake Output.", "Automatic Integrated Overclock."], c: 0, topic: "Cooling" },
    { q: "What is thermal paste used for?", a: ["Improving heat transfer between CPU and cooler.", "Lubricating fan bearings.", "Protecting the motherboard from static."], c: 0, topic: "Cooling" },
    { q: "What does a larger AIO radiator (360mm vs 240mm) provide?", a: ["More surface area for better heat dissipation.", "Higher water pressure in the loop.", "Faster pump speeds only."], c: 0, topic: "Cooling" },
    // General PC
    { q: "What does PCIe stand for?", a: ["Peripheral Component Interconnect Express.", "Processing Core Interface Engine.", "Parallel Computing Integration Express."], c: 0, topic: "General" },
    { q: "What is a motherboard's main function?", a: ["Connects all PC components and allows them to communicate.", "Stores game data permanently.", "Renders graphics for the display."], c: 0, topic: "General" },
    { q: "What does 'bottleneck' mean in PC building?", a: ["When one component limits the performance of another.", "A thermal paste application technique.", "When a GPU runs out of VRAM."], c: 0, topic: "General" },
    { q: "What is the purpose of a power supply unit (PSU)?", a: ["Converts AC wall power to DC power for PC components.", "Controls fan speeds.", "Regulates GPU clock speeds."], c: 0, topic: "General" },
    { q: "What does 'form factor' mean for a PC case?", a: ["The size and shape standard that determines compatible components.", "The number of fans it can hold.", "The material the case is made from."], c: 0, topic: "General" },

    // ── CPUs (extended) ──
    { q: "What does 'hyperthreading' or SMT allow a CPU to do?", a: ["Run two threads per physical core simultaneously.", "Double the clock speed of each core.", "Share cache between two CPUs."], c: 0, topic: "CPUs" },
    { q: "What is the purpose of the CPU's L1 cache?", a: ["Store the most frequently used data at the fastest possible speed.", "Hold the operating system kernel.", "Buffer GPU frame output."], c: 0, topic: "CPUs" },
    { q: "What does 'IPC' stand for in CPU performance?", a: ["Instructions Per Clock.", "Integrated Power Core.", "Internal Processing Cache."], c: 0, topic: "CPUs" },
    { q: "Which AMD platform uses DDR4 memory exclusively?", a: ["AM4.", "AM5.", "TR4."], c: 0, topic: "CPUs" },
    { q: "What does a higher base clock speed generally mean for a CPU?", a: ["Faster performance in single-threaded tasks.", "More power efficiency.", "More cores available."], c: 0, topic: "CPUs" },
    { q: "What is 'boost clock' on a modern CPU?", a: ["The maximum speed the CPU can briefly reach under load.", "The guaranteed minimum speed at all times.", "The speed during idle mode."], c: 0, topic: "CPUs" },
    { q: "What manufacturing process node does a smaller nm value represent?", a: ["A more efficient and denser chip design.", "A larger and faster chip.", "A chip with more cache."], c: 0, topic: "CPUs" },

    // ── GPUs (extended) ──
    { q: "What does DLSS stand for in NVIDIA technology?", a: ["Deep Learning Super Sampling.", "Direct Lighting Shader System.", "Dynamic Level Scaling System."], c: 0, topic: "GPUs" },
    { q: "What is AMD's equivalent to NVIDIA DLSS called?", a: ["FSR (FidelityFX Super Resolution).", "RSR (Radeon Super Render).", "XeSS (Xe Super Sampling).", ], c: 0, topic: "GPUs" },
    { q: "What does more VRAM on a GPU allow?", a: ["Handling higher resolution textures and more complex scenes.", "Faster CPU-GPU communication.", "Lower power draw."], c: 0, topic: "GPUs" },
    { q: "What does the GPU's shader core count affect?", a: ["Parallel processing power for rendering graphics.", "Memory bandwidth speed.", "PCIe lane count."], c: 0, topic: "GPUs" },
    { q: "What PCIe slot do modern GPUs use?", a: ["PCIe x16.", "PCIe x4.", "PCIe x1."], c: 0, topic: "GPUs" },
    { q: "What is the purpose of GPU drivers?", a: ["Software that lets the OS communicate with and control the GPU.", "Firmware stored inside the GPU chip.", "Cooling software for the GPU fans."], c: 0, topic: "GPUs" },
    { q: "What does a GPU's TDP rating tell you?", a: ["How much power the GPU consumes under full load.", "Its maximum frame rate.", "Its warranty period."], c: 0, topic: "GPUs" },
    { q: "What does 'rasterization' mean in GPU rendering?", a: ["Converting 3D geometry into 2D pixels on screen.", "Simulating realistic light ray bouncing.", "Compressing texture files for faster loading."], c: 0, topic: "GPUs" },

    // ── RAM (extended) ──
    { q: "What does CAS latency (CL) measure in RAM?", a: ["The delay in clock cycles between a command and the data being available.", "The voltage required by the RAM module.", "The maximum temperature the RAM can reach."], c: 0, topic: "RAM" },
    { q: "What does XMP or EXPO do for RAM?", a: ["Automatically sets RAM to its rated advertised speed.", "Reduces RAM voltage for efficiency.", "Enables ECC error correction."], c: 0, topic: "RAM" },
    { q: "Why is it better to install RAM in matched pairs?", a: ["To enable dual-channel mode for higher bandwidth.", "To reduce heat output.", "To double the voltage."], c: 0, topic: "RAM" },
    { q: "What is ECC RAM primarily used for?", a: ["Servers and workstations that require error correction.", "High-speed gaming PCs.", "Budget office computers."], c: 0, topic: "RAM" },
    { q: "What happens to RAM data when the PC is powered off?", a: ["All data is lost since RAM is volatile memory.", "Data is saved automatically to the SSD.", "Data is stored in the CPU cache."], c: 0, topic: "RAM" },

    // ── Storage (extended) ──
    { q: "What is the typical read speed of a modern Gen4 NVMe SSD?", a: ["Up to 7,000 MB/s.", "Up to 550 MB/s.", "Up to 200 MB/s."], c: 0, topic: "Storage" },
    { q: "What does SATA stand for?", a: ["Serial Advanced Technology Attachment.", "Solid Access Transfer Architecture.", "Sequential Array Transfer Access."], c: 0, topic: "Storage" },
    { q: "What is the maximum SATA SSD read speed approximately?", a: ["~550 MB/s.", "~7000 MB/s.", "~3500 MB/s."], c: 0, topic: "Storage" },
    { q: "What does 'TBW' mean on an SSD?", a: ["Terabytes Written — the total data that can be written before wear.", "Total Bandwidth Width.", "Transfer Buffer Width."], c: 0, topic: "Storage" },
    { q: "What form factor do most modern fast SSDs use?", a: ["M.2 (2280).", "2.5 inch.", "3.5 inch."], c: 0, topic: "Storage" },

    // ── Displays (extended) ──
    { q: "What does 'response time' mean on a monitor?", a: ["How quickly a pixel can change from one colour to another.", "How fast the monitor turns on from standby.", "The delay between input and on-screen action."], c: 0, topic: "Displays" },
    { q: "What is input lag on a monitor?", a: ["The delay between a signal being sent and appearing on screen.", "The time to change pixel brightness.", "The refresh rate divided by frames per second."], c: 0, topic: "Displays" },
    { q: "What does G-Sync and FreeSync do?", a: ["Synchronise the monitor refresh rate with the GPU frame rate to eliminate tearing.", "Boost the monitor's peak brightness automatically.", "Control the monitor's colour temperature."], c: 0, topic: "Displays" },
    { q: "What does 4K resolution refer to?", a: ["3840x2160 pixels.", "2560x1440 pixels.", "1920x1080 pixels."], c: 0, topic: "Displays" },
    { q: "Which panel type generally has the fastest response time for gaming?", a: ["TN (Twisted Nematic).", "IPS (In-Plane Switching).", "VA (Vertical Alignment)."], c: 0, topic: "Displays" },
    { q: "What is 'nits' a measurement of on a monitor?", a: ["Brightness/luminance output.", "Colour accuracy.", "Pixel density."], c: 0, topic: "Displays" },

    // ── Cooling (extended) ──
    { q: "What is the advantage of liquid cooling over air cooling?", a: ["Better heat dissipation for high TDP CPUs with less case clearance needed.", "Lower noise at all times.", "Cheaper overall cost."], c: 0, topic: "Cooling" },
    { q: "What does 'TIM' stand for in CPU cooling?", a: ["Thermal Interface Material (thermal paste).", "Thermal Intake Module.", "Temperature Indicator Metric."], c: 0, topic: "Cooling" },
    { q: "What is a heat pipe used for in air coolers?", a: ["Transfer heat away from the CPU base to the fin stack efficiently.", "Pump liquid coolant through the loop.", "Regulate fan speed automatically."], c: 0, topic: "Cooling" },
    { q: "What RPM range do most case fans operate at?", a: ["500–2000 RPM.", "5000–10000 RPM.", "100–300 RPM."], c: 0, topic: "Cooling" },

    // ── General (extended) ──
    { q: "What does ATX stand for in motherboard form factors?", a: ["Advanced Technology eXtended.", "Automatic Thermal eXchange.", "Active Transfer eXtension."], c: 0, topic: "General" },
    { q: "What is a chipset on a motherboard?", a: ["A chip that manages data flow between the CPU, RAM, and peripherals.", "A dedicated GPU on the motherboard.", "A secondary CPU for background tasks."], c: 0, topic: "General" },
    { q: "What does 'modular PSU' mean?", a: ["You can detach unused cables to reduce clutter.", "The PSU has multiple voltage rails.", "The PSU supports automatic wattage scaling."], c: 0, topic: "General" },
    { q: "What is the function of a PC case's front panel USB ports?", a: ["Provide convenient USB access connected to the motherboard header.", "Power external hard drives only.", "Connect to the GPU directly."], c: 0, topic: "General" },
    { q: "What does 'POST' stand for when a PC starts?", a: ["Power-On Self-Test.", "Primary Operating System Transfer.", "Peripheral Output Status Test."], c: 0, topic: "General" },
    { q: "What wattage PSU is generally recommended for a high-end gaming PC?", a: ["850W or higher.", "350W.", "550W maximum."], c: 0, topic: "General" },
    { q: "What does 'RGB' mean in PC components?", a: ["Red Green Blue — addressable lighting on components.", "Real Gain Bandwidth.", "Rendered Graphics Buffer."], c: 0, topic: "General" },
    { q: "What is a BIOS/UEFI used for?", a: ["Firmware that initialises hardware before the OS loads.", "A type of antivirus software.", "The first-boot operating system."], c: 0, topic: "General" }
];

let currentQuestionIdx = 0;
let selectedQuizAnswer = null;
let quizEvaluated = false;

// ── SUPABASE INIT (Ver 1.5b Teton) ──────────────────────────────────────
const SUPABASE_URL = "https://hkuwkajmgieptgotgmuc.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdXdrYWptZ2llcHRnb3RnbXVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMjE2NjksImV4cCI6MjA5Njc5NzY2OX0.GJhJAE5WlRDNxO9BprFewK75lir4cHnJ_0W-v246-SQ";
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.onload = function() { loadAccountsFromDisk(); };

async function loadAccountsFromDisk() {
    try {
        const { data, error } = await db.from('users').select('*');
        if (error) {
            console.error('Supabase SELECT error:', JSON.stringify(error));
            throw error;
        }
        gameState = { activeUser: null, users: {} };
        if (data && data.length > 0) {
            data.forEach(function(row) {
                gameState.users[row.username] = {
                    password: row.password,
                    points: row.points,
                    builds: row.builds,
                    inventory: row.inventory
                };
            });
        }
        // Migrate any localStorage accounts up to Supabase
        await migrateLocalStorageToSupabase();

        // Auto-login if a saved session exists
        const savedUser = sessionStorage.getItem('tycoon_active_user');
        if (savedUser && gameState.users[savedUser]) {
            applyUserProfile(savedUser);
        } else {
            renderProfilesTray();
            showAuthOverlay();
        }
    } catch(err) {
        console.error('Supabase load error:', err);
        const raw = localStorage.getItem('PC_Hardware_Tycoon_2026_Accounts_v12');
        if (raw) { gameState = JSON.parse(raw); } else { gameState = { activeUser: null, users: {} }; }
        renderProfilesTray();
        showAuthOverlay();
    }
}

async function migrateLocalStorageToSupabase() {
    const raw = localStorage.getItem('PC_Hardware_Tycoon_2026_Accounts_v12');
    if (!raw) return;
    try {
        const local = JSON.parse(raw);
        const localUsers = local.users || {};
        const userKeys = Object.keys(localUsers);
        if (userKeys.length === 0) return;
        for (const username of userKeys) {
            if (gameState.users[username]) continue; // already in Supabase
            const u = localUsers[username];
            const { error } = await db.from('users').upsert({
                username: username,
                password: u.password,
                points: u.points,
                builds: u.builds,
                inventory: u.inventory
            }, { onConflict: 'username' });
            if (!error) {
                gameState.users[username] = u;
                console.log('Migrated ' + username + ' to Supabase');
            } else {
                console.error('Migration error for ' + username + ':', JSON.stringify(error));
            }
        }
        localStorage.removeItem('PC_Hardware_Tycoon_2026_Accounts_v12');
        console.log('localStorage migration complete and cleared.');
    } catch(e) {
        console.error('Migration failed:', e);
    }
}

async function saveAccountsToDisk() {
    if (!gameState.activeUser) return;
    const username = gameState.activeUser;
    const user = gameState.users[username];
    try {
        const { error } = await db.from('users').upsert({
            username: username,
            password: user.password,
            points: user.points,
            builds: user.builds,
            inventory: user.inventory
        }, { onConflict: 'username' });
        if (error) throw error;
        // Refresh all users from Supabase so admin panel stays in sync
        const { data } = await db.from('users').select('*');
        if (data) {
            data.forEach(function(row) {
                if (row.username !== username) {
                    gameState.users[row.username] = {
                        password: row.password,
                        points: row.points,
                        builds: row.builds,
                        inventory: row.inventory
                    };
                }
            });
        }
    } catch(err) {
        console.warn('Supabase save error, falling back to localStorage:', err);
        localStorage.setItem('PC_Hardware_Tycoon_2026_Accounts_v12', JSON.stringify(gameState));
    }
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
    sessionStorage.setItem('tycoon_active_user', username);
    gameState.activeUser = username;
    saveAccountsToDisk();
    document.getElementById('auth-box').style.display = 'none';
    document.getElementById('main-game-workspace').style.display = 'block';
    document.getElementById('hud-user').innerText = username;
    renderShop(); loadNextQuestion(); updateHUD(); renderProfilesTray(); resetBenchmarkDisplay(); renderAdminPanel();
}

async function accountLogout() {
    // Save current state before clearing session
    if (gameState.activeUser) {
        const username = gameState.activeUser;
        const user = gameState.users[username];
        try {
            await db.from('users').upsert({
                username: username,
                password: user.password,
                points: user.points,
                builds: user.builds,
                inventory: user.inventory
            }, { onConflict: 'username' });
        } catch(e) { console.warn('Logout save error:', e); }
    }
    sessionStorage.removeItem('tycoon_active_user');
    gameState.activeUser = null;
    showAuthOverlay();
}

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

async function renderAdminPanel() {
    const panel = document.getElementById('mzx-admin-panel');
    const grid  = document.getElementById('admin-accounts-grid');
    if (!panel || !grid) return;

    // Only visible for mzx
    if (!gameState.activeUser || gameState.activeUser.toLowerCase() !== 'mzx') {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = 'block';
    grid.innerHTML = '<div style="color:#94a3b8; font-size:9pt; padding:10px;">🔄 Loading accounts...</div>';

    // Always pull fresh from Supabase
    try {
        const { data, error } = await db.from('users').select('*');
        if (!error && data) {
            data.forEach(function(row) {
                gameState.users[row.username] = {
                    password: row.password, points: row.points,
                    builds: row.builds, inventory: row.inventory
                };
            });
        }
    } catch(e) { console.warn('Admin panel fetch error:', e); }

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

async function adminAdjustFunds(username, action) {
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
    // Admin adjusts another user — save that specific user directly
    try {
        await db.from('users').upsert({
            username: username,
            password: user.password,
            points: user.points,
            builds: user.builds,
            inventory: user.inventory
        }, { onConflict: 'username' });
    } catch(err) {
        console.warn('Supabase admin save error:', err);
    }
    updateHUD();
    renderAdminPanel();
}

// ── STUDY GUIDE + PAGE SWITCHING (Ver 1.5b Teton) ─────────────────────────

let currentStudyTopic = 'all';

function switchPage(page) {
    document.getElementById('page-game').style.display  = page === 'game'  ? 'block' : 'none';
    document.getElementById('page-study').style.display = page === 'study' ? 'block' : 'none';
    document.getElementById('page-tab-game').style.background  = page === 'game'  ? '#eab308' : '#1e293b';
    document.getElementById('page-tab-game').style.color       = page === 'game'  ? '#0f172a' : '#e2e8f0';
    document.getElementById('page-tab-game').style.border      = page === 'game'  ? 'none' : '2px solid #475569';
    document.getElementById('page-tab-study').style.background = page === 'study' ? '#0ea5e9' : '#1e293b';
    document.getElementById('page-tab-study').style.color      = page === 'study' ? 'white' : '#e2e8f0';
    document.getElementById('page-tab-study').style.border     = page === 'study' ? 'none' : '2px solid #475569';
    if (page === 'study') { currentStudyTopic = 'all'; renderStudyCards('all'); }
}

function filterStudy(topic) {
    currentStudyTopic = topic;
    document.querySelectorAll('.study-tab').forEach(function(btn) {
        btn.classList.toggle('active-study-tab', btn.getAttribute('data-topic') === topic);
    });
    renderStudyCards(topic);
}

function renderStudyCards(topic) {
    const grid = document.getElementById('study-cards-grid');
    const countEl = document.getElementById('study-count');
    if (!grid) return;

    const searchEl = document.getElementById('study-search');
    const search = searchEl ? searchEl.value.toLowerCase().trim() : '';

    let filtered = topic === 'all' ? database : database.filter(function(q) { return q.topic === topic; });

    if (search) {
        filtered = filtered.filter(function(q) {
            return q.q.toLowerCase().includes(search) || q.a[q.c].toLowerCase().includes(search);
        });
    }

    if (countEl) countEl.textContent = filtered.length + ' card' + (filtered.length !== 1 ? 's' : '');

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="color:#64748b; font-size:10pt; padding:20px; grid-column:1/-1;">No cards match your search.</div>';
        return;
    }

    grid.innerHTML = filtered.map(function(q) {
        const topicColors = {
            CPUs: '#f59e0b', GPUs: '#a855f7', RAM: '#0ea5e9',
            Storage: '#22c55e', Displays: '#38bdf8', Cooling: '#06b6d4', General: '#94a3b8'
        };
        const color = topicColors[q.topic] || '#94a3b8';
        return '<div class="study-card" style="border-color:rgba(' + hexToRgb(color) + ',0.2);">' +
            '<div class="study-card-topic" style="color:' + color + '; background:rgba(' + hexToRgb(color) + ',0.1);">' + (q.topic || 'General') + '</div>' +
            '<div class="study-card-question">' + q.q + '</div>' +
            '<div class="study-card-answer">' + q.a[q.c] + '</div>' +
        '</div>';
    }).join('');
}

function hexToRgb(hex) {
    const map = { '#f59e0b':'245,158,11', '#a855f7':'168,85,247', '#0ea5e9':'14,165,233',
                  '#22c55e':'34,197,94', '#38bdf8':'56,189,248', '#06b6d4':'6,182,212', '#94a3b8':'148,163,184' };
    return map[hex] || '148,163,184';
}
