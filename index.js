
const games = [
    {id:"math", name:"Matematika", icon:"🔢", desc:"Misollarni yeching!", type:"math"},
    {id:"logic", name:"Mantiqiy fikrlash", icon:"🧩", desc:"Miyangizni ishlating!", type:"logic"},
    {id:"memory", name:"Xotira", icon:"🧠", desc:"Xotirangizni sinang!", type:"memory"},
    {id:"attention", name:"Diqqat", icon:"👀", desc:"Farqlarni toping!", type:"attention"},
    {id:"english", name:"Ingliz tili", icon:"🇬🇧", desc:"English o‘rganing!", type:"english"},
    {id:"german", name:"Nemis tili", icon:"🇩🇪", desc:"Deutsch o‘rganing!", type:"german"},
    {id:"korean", name:"Koreys tili", icon:"🇰🇷", desc:"한국어 o‘rganing!", type:"korean"}
];

const ageSettings = {
    "6-9": {level:1, time:20},
    "9-13": {level:2, time:25},
    "13-17": {level:3, time:30}
};

let currentAge = "6-9";
let currentGame = null;
let questionPool = [];
let currentQuestion = 0;
let correctAnswers = 0;
let wrongAnswers = 0;
let totalStars = 0;
let timeLeft = 20;
let questionTime = 20;
let timerInterval = null;
let nextTimeout = null;
let answered = false;
let soundEnabled = true;

let playerData = JSON.parse(localStorage.getItem("fgwData")) || {
    stars: 0,
    played: 0,
    correct: 0,
    best: 0
};

// O'yinlar oynasini ochish
function showGames(age) {
    currentAge = age;

    document.getElementById("games-section").hidden = false;
    document.getElementById("game-area").hidden = true;

    document.getElementById("games-title").textContent =
        "🎮 " + age + " yosh uchun o'yinlar";

    const list = document.getElementById("games-list");
    list.innerHTML = "";

    games.forEach(game => {
        list.innerHTML += `
            <div class="col-md-4 col-sm-6">
                <div class="game-card" onclick="selectGame('${game.id}')">
                    <div class="game-icon">${game.icon}</div>
                    <h4>${game.name}</h4>
                    <p>${game.desc}</p>
                    <button class="btn btn-primary">O'ynash 🚀</button>
                </div>
            </div>
        `;
    });

    document.getElementById("games-section").scrollIntoView({
        behavior: "smooth"
    });
}

// O'yinni tanlash
function selectGame(id) {
    currentGame = games.find(game => game.id === id);

    document.getElementById("games-section").hidden = true;
    document.getElementById("game-area").hidden = false;

    document.getElementById("game-title").textContent =
        currentGame.icon + " " + currentGame.name;

    document.getElementById("start-btn").hidden = false;
    document.getElementById("next-btn").hidden = true;
    document.getElementById("result-area").hidden = true;

    document.getElementById("question").textContent =
        "O'yinni boshlashga tayyormisiz?";

    document.getElementById("answers").innerHTML = "";
    document.getElementById("feedback").textContent = "";

    document.getElementById("timer").textContent =
        ageSettings[currentAge].time;

    document.getElementById("stars").textContent = "0";
    document.getElementById("question-number").textContent = "1";

    document.getElementById("game-area").scrollIntoView({
        behavior: "smooth"
    });
}

// Tasodifiy tartib
function shuffle(array) {
    let result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

// Variantlarni yaratish
function makeQuestion(prompt, answer, options) {
    return {
        prompt,
        answer: String(answer),
        options: shuffle([...new Set([
            String(answer),
            ...options.map(String)
        ])]).slice(0, 4)
    };
}

// 1. MATEMATIKA: 120 ta noyob topshiriq
function generateMath(level) {
    let pool = [];

    for (let i = 0; i < 120; i++) {
        let a = level === 1 ? i + 2 : i * 3 + 11;
        let b = level === 1 ? (i % 9) + 1 : (i % 17) + 3;

        let operations = ["+", "-"];

        if (level >= 2) operations.push("×");

        if (level === 3) operations.push("÷");

        let op = operations[i % operations.length];
        let answer;

        if (op === "+") answer = a + b;
        if (op === "-") {
            answer = a + b;
            a = answer;
        }
        if (op === "×") answer = a * b;
        if (op === "÷") {
            answer = a;
            a = a * b;
        }

        let wrong = [
            answer + 1,
            Math.max(0, answer - 2),
            answer + 3
        ];

        pool.push(makeQuestion(
            `${a} ${op} ${b} = ?`,
            answer,
            wrong
        ));
    }

    return pool;
}

// 2. MANTIQIY FIKRLASH: 120 ta topshiriq
function generateLogic(level) {
    let pool = [];

    for (let i = 0; i < 120; i++) {
        let start = i + 2;
        let step = level === 1 ? 2 : (i % 7) + 3;
        let answer = start + step * 4;

        pool.push(makeQuestion(
            `${start}, ${start + step}, ${start + step * 2}, ${start + step * 3}, ?`,
            answer,
            [
                answer + 1,
                answer - 2,
                answer + step
            ]
        ));
    }

    return pool;
}

// 3. XOTIRA O'YINI
function generateMemory(level) {
    const symbols = ["🍎", "🍌", "🍇", "🍒", "🍓", "🍉",
        "🐶", "🐱", "🦁", "🐸", "🐼", "🦊", "🚗", "🚀",
        "⚽", "🎈", "🌟", "🎁", "🐢", "🦋"];

    let pool = [];

    for (let i = 0; i < 120; i++) {
        let first = symbols[i % symbols.length];
        let second = symbols[(i * 3 + 4) % symbols.length];
        let third = symbols[(i * 7 + 9) % symbols.length];

        let sequence = [first, second, third];

        if (level >= 2) {
            sequence.push(symbols[(i * 11 + 5) % symbols.length]);
        }

        let position = i % sequence.length;
        let answer = sequence[position];

        let choices = shuffle(symbols.filter(x => x !== answer)).slice(0, 3);

        pool.push({
            prompt: `Eslab qol: ${sequence.join(" ")}`,
            question: `Ketma-ketlikdagi ${position + 1}-belgi qaysi?`,
            answer,
            options: shuffle([answer, ...choices]),
            memory: true
        });
    }

    return pool;
}

// 4. DIQQAT O'YINI
function generateAttention(level) {
    const emojis = ["🍎", "🍌", "🍇", "🍒", "🍓", "🍉"];

    let pool = [];

    for (let i = 0; i < 120; i++) {
        let main = emojis[i % emojis.length];
        let odd = emojis[(i + 2) % emojis.length];

        let count = level === 1 ? 4 : level === 2 ? 5 : 6;

        let row = Array(count).fill(main);
        let position = i % count;
        row[position] = odd;

        let choices = shuffle(emojis.filter(x => x !== odd)).slice(0, 3);

        pool.push({
            prompt: row.join(" "),
            question: "Boshqalardan farq qiladigan belgini toping!",
            answer: odd,
            options: shuffle([odd, ...choices])
        });
    }

    return pool;
}

// 5. TILLAR UCHUN SO'ZLAR
const vocabulary = {
    english: [
        ["Apple","Olma"], ["Book","Kitob"], ["Water","Suv"],
        ["House","Uy"], ["School","Maktab"], ["Friend","Do'st"],
        ["Sun","Quyosh"], ["Moon","Oy"], ["Dog","It"],
        ["Cat","Mushuk"], ["Bird","Qush"], ["Tree","Daraxt"],
        ["Milk","Sut"], ["Bread","Non"], ["Mother","Ona"],
        ["Father","Ota"], ["Red","Qizil"], ["Blue","Ko'k"],
        ["Green","Yashil"], ["Flower","Gul"], ["Car","Mashina"],
        ["Window","Deraza"], ["Door","Eshik"], ["Pen","Ruchka"],
        ["Table","Stol"], ["Chair","Stul"], ["Orange","Apelsin"],
        ["Happy","Xursand"], ["Beautiful","Chiroyli"],
        ["Morning","Ertalab"], ["Night","Tun"], ["Food","Ovqat"],
        ["Family","Oila"], ["Star","Yulduz"], ["Fish","Baliq"],
        ["Sky","Osmon"], ["Rain","Yomg'ir"], ["Snow","Qor"],
        ["Garden","Bog'"], ["Teacher","O'qituvchi"]
    ],

    german: [
        ["Hallo","Salom"], ["Danke","Rahmat"], ["Wasser","Suv"],
        ["Buch","Kitob"], ["Haus","Uy"], ["Schule","Maktab"],
        ["Apfel","Olma"], ["Hund","It"], ["Katze","Mushuk"],
        ["Sonne","Quyosh"], ["Mond","Oy"], ["Freund","Do'st"],
        ["Mutter","Ona"], ["Vater","Ota"], ["Brot","Non"],
        ["Milch","Sut"], ["Blume","Gul"], ["Baum","Daraxt"],
        ["Rot","Qizil"], ["Blau","Ko'k"], ["Grün","Yashil"],
        ["Auto","Mashina"], ["Tür","Eshik"], ["Fenster","Deraza"],
        ["Tisch","Stol"], ["Stuhl","Stul"], ["Vogel","Qush"],
        ["Fisch","Baliq"], ["Stern","Yulduz"], ["Familie","Oila"],
        ["Lehrer","O'qituvchi"], ["Morgen","Ertalab"],
        ["Nacht","Tun"], ["Schön","Chiroyli"],
        ["Glücklich","Xursand"], ["Garten","Bog'"],
        ["Regen","Yomg'ir"], ["Schnee","Qor"],
        ["Essen","Ovqat"], ["Orange","Apelsin"]
    ],

    korean: [
        ["사과","Olma"], ["물","Suv"], ["책","Kitob"],
        ["학교","Maktab"], ["집","Uy"], ["친구","Do'st"],
        ["엄마","Ona"], ["아빠","Ota"], ["강아지","Kuchuk"],
        ["고양이","Mushuk"], ["해","Quyosh"], ["달","Oy"],
        ["나무","Daraxt"], ["꽃","Gul"], ["빵","Non"],
        ["우유","Sut"], ["물고기","Baliq"], ["새","Qush"],
        ["빨강","Qizil"], ["파랑","Ko'k"], ["초록","Yashil"],
        ["자동차","Mashina"], ["문","Eshik"], ["창문","Deraza"],
        ["책상","Stol"], ["의자","Stul"], ["별","Yulduz"],
        ["가족","Oila"], ["선생님","O'qituvchi"],
        ["아침","Ertalab"], ["밤","Tun"], ["하늘","Osmon"],
        ["비","Yomg'ir"], ["눈","Qor"], ["음식","Ovqat"],
        ["정원","Bog'"], ["예쁜","Chiroyli"],
        ["행복","Baxt"], ["오렌지","Apelsin"],
        ["안녕","Salom"]
    ]
};

// Har bir til uchun 120 ta topshiriq
function generateLanguage(language) {
    let words = vocabulary[language];
    let pool = [];

    for (let i = 0; i < 120; i++) {
        let index = i % words.length;
        let word = words[index];

        let reverse = Math.floor(i / words.length) % 2 === 1;

        let answer = reverse ? word[0] : word[1];
        let prompt = reverse
            ? `"${word[1]}" so'zining tarjimasini toping`
            : `"${word[0]}" so'zining ma'nosi nima?`;

        let wrong = shuffle(
            words.filter((w, j) => j !== index)
        ).slice(0, 3).map(w => reverse ? w[0] : w[1]);

        pool.push(makeQuestion(prompt, answer, wrong));
    }

    return pool;
}

// Savollarni tanlash
function createQuestionPool() {
    let level = ageSettings[currentAge].level;

    switch (currentGame.type) {
        case "math":
            return generateMath(level);

        case "logic":
            return generateLogic(level);

        case "memory":
            return generateMemory(level);

        case "attention":
            return generateAttention(level);

        case "english":
        case "german":
        case "korean":
            return generateLanguage(currentGame.type);

        default:
            return [];
    }
}

// Ovoz effektlari
function playSound(correct) {
    if (!soundEnabled) return;

    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const audio = new AudioContext();
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();

        oscillator.connect(gain);
        gain.connect(audio.destination);

        oscillator.frequency.value = correct ? 650 : 180;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(0.12, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(
            0.001,
            audio.currentTime + 0.25
        );

        oscillator.start();
        oscillator.stop(audio.currentTime + 0.25);
        oscillator.onended = () => audio.close();
    } catch (error) {
        console.log("Ovoz ishlamadi");
    }
}

// O'yinni boshlash
function startGame() {
    clearInterval(timerInterval);
    clearTimeout(nextTimeout);

    questionPool = shuffle(createQuestionPool());

    currentQuestion = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    totalStars = 0;

    document.getElementById("start-btn").hidden = true;
    document.getElementById("result-area").hidden = true;
    document.getElementById("next-btn").hidden = true;

    loadQuestion();
}

// Savolni chiqarish
function loadQuestion() {
    clearInterval(timerInterval);

    if (currentQuestion >= 10) {
        finishGame();
        return;
    }

    answered = false;

    let q = questionPool[currentQuestion];

    questionTime = ageSettings[currentAge].time;
    timeLeft = questionTime;

    document.getElementById("timer").textContent = timeLeft;
    document.getElementById("question-number").textContent =
        currentQuestion + 1;

    document.getElementById("stars").textContent = totalStars;

    document.getElementById("progress").style.width =
        (currentQuestion / 10 * 100) + "%";

    document.getElementById("feedback").textContent = "";
    document.getElementById("next-btn").hidden = true;

    let questionText = q.question || q.prompt;

    document.getElementById("question").textContent = questionText;

    let answers = document.getElementById("answers");
    answers.innerHTML = "";

    q.options.forEach(option => {
        let button = document.createElement("button");

        button.className = "answer-btn";
        button.textContent = option;

        button.onclick = () => checkAnswer(option, button);

        answers.appendChild(button);
    });

    if (q.memory) {
        document.getElementById("question").textContent = q.prompt;
        answers.innerHTML = "<p>👀 Diqqat bilan eslab qoling!</p>";

        setTimeout(() => {
            if (answered || currentQuestion >= 10) return;

            document.getElementById("question").textContent = q.question;

            answers.innerHTML = "";

            q.options.forEach(option => {
                let button = document.createElement("button");
                button.className = "answer-btn";
                button.textContent = option;
                button.onclick = () => checkAnswer(option, button);
                answers.appendChild(button);
            });
        }, 2500);
    }

    startTimer();
}

// Vaqt hisoblagichi
function startTimer() {
    timerInterval = setInterval(() => {
        if (answered) return;

        timeLeft--;

        document.getElementById("timer").textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            wrongAnswers++;
            answered = true;

            document.getElementById("feedback").textContent =
                "⏰ Vaqt tugadi! Keyingi savolga o'tamiz.";

            disableAnswers();

            nextTimeout = setTimeout(nextQuestion, 1300);
        }

    }, 1000);
}

// Javobni tekshirish
function checkAnswer(selected, button) {
    if (answered) return;

    answered = true;
    clearInterval(timerInterval);

    let q = questionPool[currentQuestion];
    let correct = selected === q.answer;

    if (correct) {
        correctAnswers++;

        let ratio = timeLeft / questionTime;
        let stars = ratio >= 0.8 ? 5 :
                    ratio >= 0.6 ? 4 :
                    ratio >= 0.4 ? 3 :
                    ratio >= 0.2 ? 2 : 1;

        totalStars += stars;

        button.classList.add("correct");

        document.getElementById("feedback").textContent =
            "🎉 Barakalla! +" + stars + " ⭐";

        playSound(true);
        showConfetti();

    } else {
        wrongAnswers++;

        button.classList.add("wrong");

        document.getElementById("feedback").textContent =
            "❌ To'g'ri javob: " + q.answer;

        playSound(false);
    }

    disableAnswers();

    document.getElementById("stars").textContent = totalStars;
    document.getElementById("next-btn").hidden = false;
}

// Javob tugmalarini bloklash
function disableAnswers() {
    document.querySelectorAll(".answer-btn").forEach(btn => {
        btn.disabled = true;

        if (btn.textContent === questionPool[currentQuestion].answer) {
            btn.classList.add("correct");
        }
    });
}

// Keyingi savol
function nextQuestion() {
    clearInterval(timerInterval);
    clearTimeout(nextTimeout);

    currentQuestion++;

    loadQuestion();
}

// O'yinni tugatish
function finishGame() {
    clearInterval(timerInterval);
    clearTimeout(nextTimeout);

    document.getElementById("question-area").hidden = true;
    document.getElementById("next-btn").hidden = true;
    document.getElementById("result-area").hidden = false;

    document.getElementById("progress").style.width = "100%";

    playerData.stars += totalStars;
    playerData.played++;
    playerData.correct += correctAnswers;
    playerData.best = Math.max(playerData.best, totalStars);

    localStorage.setItem("fgwData", JSON.stringify(playerData));

    let message = correctAnswers >= 9
        ? "🏆 Ajoyib! Siz haqiqiy bilimdonsiz!"
        : correctAnswers >= 6
        ? "🌟 Juda yaxshi! Davom eting!"
        : "💪 Harakat qiling! Siz albatta uddalaysiz!";

    document.getElementById("final-result").innerHTML = `
        ${message}<br><br>
        ✅ To'g'ri javoblar: ${correctAnswers}<br>
        ❌ Noto'g'ri javoblar: ${wrongAnswers}<br>
        ⭐ To'plangan yulduzlar: ${totalStars}<br>
        🏆 Jami yulduzlar: ${playerData.stars}
    `;

    document.getElementById("question-area").hidden = false;
    showConfetti();
}

// Konfetti effekti
function showConfetti() {
    const colors = ["⭐", "🌟", "✨", "🎉", "🎊"];

    for (let i = 0; i < 15; i++) {
        let particle = document.createElement("div");

        particle.textContent = colors[Math.floor(Math.random() * colors.length)];

        particle.style.position = "fixed";
        particle.style.left = Math.random() * 100 + "vw";
        particle.style.top = "-30px";
        particle.style.fontSize = "25px";
        particle.style.zIndex = "9999";
        particle.style.pointerEvents = "none";
        particle.style.transition = "transform 2s, opacity 2s";

        document.body.appendChild(particle);

        setTimeout(() => {
            particle.style.transform =
                `translateY(${window.innerHeight + 100}px) rotate(500deg)`;
            particle.style.opacity = "0";
        }, 50);

        setTimeout(() => particle.remove(), 2200);
    }
}

// O'yinlar sahifasiga qaytish
function backToGames() {
    clearInterval(timerInterval);
    clearTimeout(nextTimeout);

    document.getElementById("game-area").hidden = true;
    document.getElementById("games-section").hidden = false;

    document.getElementById("question-area").hidden = false;

    document.getElementById("games-section").scrollIntoView({
        behavior: "smooth"
    });
}

// Ovoz sozlamasi
function toggleSound() {
    soundEnabled = !soundEnabled;
    return soundEnabled;
}
