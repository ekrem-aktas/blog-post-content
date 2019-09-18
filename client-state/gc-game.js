(function () {
    const colors = {
        peBg: "#DAEFFA",
        peStroke: "#83CAED",
        npeBg: "#FEF0DD",
        npeStroke: "#FCD59F",
        subscribeStroke: "#FFB6B6",
        subscribeStrokeSoft: "#FFD5D5",
        peSoftBg: "#E2F7FF",
        npeSoftBg: "#FFF8E5",
        text: "#000",
        textSoft: "#777"
    };

    function createCanvas(targetElement) {
        const canvas = document.createElement("canvas");
        canvas.width = "730";
        canvas.height = "500";
        targetElement.appendChild(canvas);
        return canvas;
    }

    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined") {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    }

    function renderArrow(ctx, p1, p2, size) {
        var angle = Math.atan2((p2.y - p1.y), (p2.x - p1.x));
        var hyp = Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y));

        ctx.save();
        ctx.translate(p1.x, p1.y);
        ctx.rotate(angle);

        // line
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(hyp - size, 0);
        ctx.stroke();

        // triangle
        ctx.beginPath();
        ctx.lineTo(hyp - size, size);
        ctx.lineTo(hyp, 0);
        ctx.lineTo(hyp - size, -size);
        ctx.fill();

        ctx.restore();
    }

    function renderObject(mxObj, canvas) {
        const ctx = canvas.getContext("2d");

        const width = mxObj.rect.width = 125;
        const height = mxObj.rect.height = 50;

        const {name} = mxObj;
        const {persistable, subscribed, committed, changed} = mxObj.state;
        const {x, y} = mxObj.rect;
        const {userAnswer, showAnswer, keep} = mxObj.game;

        // render background
        configureRectangleStyle();
        roundRect(ctx, x, y, width, height, 7, true, true);

        // render display text
        ctx.font = "13px sans-serif";
        ctx.fillStyle = userAnswer === false ? colors.textSoft : colors.text;
        const displayText = getDisplayText();
        const displayTextWidth = ctx.measureText(displayText).width;
        ctx.fillText(displayText, x + (width - displayTextWidth) / 2, y + height / 1.7);

        if (userAnswer !== null) {
            const cross = "✘";
            const checkMark = "✔";
            const text = userAnswer === true ? checkMark : cross;
            ctx.fillStyle = userAnswer === true ? "green" : "red";
            ctx.font = "16px sans-serif";
            const textWidth = ctx.measureText(text).width;
            // ctx.fillText(text, x + (width - removeWidth) / 2, y + (height / 2) + 14);
            ctx.fillText(text, x + width - textWidth - 2, y + 16);
        }

        if (showAnswer) {
            const text = userAnswer === keep ? "Correct Answer!" : "Wrong answer😟";
            ctx.fillStyle = userAnswer === keep ? "green" : "red";
            ctx.font = "14px sans-serif";
            const textWidth = ctx.measureText(text).width;
            ctx.fillText(text, x + (width - textWidth) / 2, y + height - 4);
        }

        function getDisplayText() {
            let result = name;
            if (!committed) {
                result += '(new)';
            }
            if (changed) {
                result += '**';
            }
            return result;
        }

        function getFillStyle() {
            return persistable
                ? (userAnswer === false ? colors.peSoftBg : colors.peBg)
                : (userAnswer === false ? colors.npeSoftBg : colors.npeBg);
        }

        function configureRectangleStyle() {
            ctx.fillStyle = getFillStyle();

            /* if (showAnswer) {
              ctx.lineWidth = 8;
              ctx.strokeStyle = userAnswer === keep ? "green" : "red";
              return;
            } */

            if (subscribed) {
                ctx.lineWidth = 6;
                ctx.strokeStyle = userAnswer === false ? colors.subscribeStrokeSoft : colors.subscribeStroke;
            } else {
                ctx.lineWidth = 4;
                ctx.strokeStyle = persistable ? colors.peStroke : colors.npeStroke;
            }
        }
    }

    function renderRefs(mxObj, mxObjs, canvas) {
        const {x, y, width, height} = mxObj.rect;
        mxObj.refs.map(({to}) => {
            const targetRect = mxObjs.find(m => m.id === to).rect;

            const left = x > targetRect.x + targetRect.width;
            const right = x + width < targetRect.x;
            const up = y > targetRect.y + targetRect.height;
            const down = y + height < targetRect.y;

            const p1 = {x: 0, y: 0};
            const p2 = {x: 0, y: 0};

            if (left) {
                p1.x = x;
                p1.y = y + height / 2;
                p2.x = targetRect.x + targetRect.width;
                p2.y = targetRect.y + targetRect.height / 2;
            }

            if (right) {
                p1.x = x + width;
                p1.y = y + height / 2;
                p2.x = targetRect.x;
                p2.y = targetRect.y + targetRect.height / 2;
            }

            if (up) {
                p1.x = x + width / 2;
                p1.y = y;
                p2.x = targetRect.x + targetRect.width / 2;
                p2.y = targetRect.y + targetRect.height;
            }

            if (down) {
                p1.x = x + width / 2;
                p1.y = y + height;
                p2.x = targetRect.x + targetRect.width / 2;
                p2.y = targetRect.y;
            }

            const ctx = canvas.getContext("2d");
            ctx.strokeStyle = ctx.fillStyle = "#555";
            ctx.lineWidth = 2;
            renderArrow(ctx, p1, p2, 6);
        });
    }

    function renderAllReferences(mxObjs, canvas) {
        mxObjs.map(m => renderRefs(m, mxObjs, canvas));
    }

    function renderObjects(mxObjs, canvas) {
        mxObjs.map(m => renderObject(m, canvas));
    }

    function clear(canvas) {
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }

    function clearAnswers() {
        const summary = document.querySelector(".gc-game-container .summary");
        while (summary.firstChild) {
            summary.removeChild(summary.firstChild);
        }
    }

    function revealAnswers(game, canvas) {
        const mxobjs = game.levels[game.currentLevel].mxobjs;
        mxobjs.forEach(m => {
            m.game.showAnswer = !m.game.showAnswer;
        });
        clear(canvas);
        renderObjects(mxobjs, canvas);
        renderAllReferences(mxobjs, canvas);

        clearAnswers();

        const summary = document.querySelector(".gc-game-container .summary");
        mxobjs.forEach(m => {
            if (m.game.showAnswer) {
                const correctAnswer = m.game.userAnswer === m.game.keep;
                const li = document.createElement("li");
                li.innerText = `Answer for "${m.name}" is ${(!correctAnswer ? "not" : "")} correct: ${m.game.desc}`;
                li.style.color = correctAnswer ? "green" : "red";
                summary.appendChild(li);
            }
        });
    }

    function nextlevel(game, canvas) {
        game.currentLevel++;
        clearAnswers();
        renderGame(game, canvas);

        if(game.currentLevel === game.levels.length - 1)
            document.querySelector(".gc-game-container .next-level").disabled = true;
    }

    function renderGame(game, canvas) {
        clear(canvas);
        const mxobjs = game.levels[game.currentLevel].mxobjs;
        const height = mxobjs.reduce((max, current) => current.rect.y + current.rect.height > max ? current.rect.y + current.rect.height : max, 0) + 20;

        canvas.height = height.toString();

        renderObjects(mxobjs, canvas);
        renderAllReferences(mxobjs, canvas);
        document.querySelector(".gc-game-container .level-title").innerText = game.levels[game.currentLevel].title;
    }

    function initializeGame(game) {
        const c = createCanvas(document.querySelector(".gc-game-container .canvas"));

        c.addEventListener("click", e => {
            const {offsetX, offsetY} = e;

            const mxobjs = game.levels[game.currentLevel].mxobjs;

            mxobjs.filter(m => !m.game.showAnswer).forEach(mxObj => {
                const {x, y, width, height} = mxObj.rect;
                if (offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height) {
                    mxObj.game.userAnswer = !mxObj.game.userAnswer;
                    renderObject(mxObj, c);
                    renderAllReferences(mxobjs, c);
                }
            });
        });

        c.addEventListener("mousemove", e => {
            e.preventDefault();
            e.stopPropagation();

            const {offsetX, offsetY} = e;
            const mxobjs = game.levels[game.currentLevel].mxobjs;
            const onAnObject = mxobjs.some(mxObj => {
                const {x, y, width, height} = mxObj.rect;
                return offsetX >= x && offsetX <= x + width && offsetY >= y && offsetY <= y + height;
            });

            c.style.cursor = onAnObject ? "pointer" : "default";
        });

        document.querySelector(".gc-game-container .check-button").addEventListener("click", () => revealAnswers(game, c));
        document.querySelector(".gc-game-container .next-level").addEventListener("click", () => nextlevel(game, c));

        renderGame(game, c);
    }

    window.initializeGame = initializeGame;
})();
