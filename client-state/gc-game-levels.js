(function() {
    window.gc_game = {
        currentLevel: 0,
        levels: []
    };

    function level(title) {
        gc_game.levels.push({ title, mxobjs: [] });
    }

    function o(x, y, id, name, persistable, subscribed, committed, changed, keep, refs, desc) {
        gc_game.levels[gc_game.levels.length - 1].mxobjs.push({
            id,
            name,
            state: {
                persistable,
                subscribed,
                committed,
                changed
            },
            game: {
                keep,
                userAnswer: null,
                desc,
                showAnswer: false,
                points: 10
            },
            rect: {
                x,
                y,
                width: 125,
                height: 50
            },
            refs: (refs || []).map(to => ({ to }))
        });
    }
    function fillLevels() {
        level("Level 1");
        o(10, 10, 1, "Object 1", true, true, true, false, true,[],
            "This object should be kept in state, because it is subscribed.");

        level("Level 2");
        o(10, 10, 1, "Object 1", true, false, true, true, false,[],
            "This object should not be kept in state, because it is not subscribed and has no references to other object(s)");

        level("Level 3");
        o(10, 10, 1, "Object 1", true, true, true, false, true,[],
            "This object should be kept in state, because it is subscribed.");
        o(200, 10, 2, "Object 2", false, false, false, false, false,[],
            "This object should not be kept in state, because it is not subscribed and not reachable from \"Object 1\"");

        level("Level 4");
        o(10, 10, 1, "Object 1", true, true, true, false, true,[],
            "This object should be kept in state, because it is subscribed.");
        o(200, 10, 2, "Object 2", false, false, true, false, true,[1],
            "This object should be kept in state, because it is non-persistent and reachable from \"Object 1\", which is subscribed.");

        level("Level 5");
        o(10, 10, 1, "Object 1", true, true, true, false, true,[],
            "This object should be kept in state, because it is subscribed.");
        o(200, 10, 2, "Object 2", false, false, true, false, true,[1],
            "This object should be kept in state, because it is non-persistent and reachable from \"Object 1\", which is subscribed.");
        o(400, 10, 3, "Object 3", false, false, true, false, true,[2],
            "This object should be kept in state, because it is non-persistent and reachable from \"Object 1\" (which is subscribed) through \"Object 2\".");


        level("Level 6");
        o(10, 120, 1, "Object 1", true, true, true, false, true,[],
            "This object should be kept in state, because it is subscribed.");
        o(200, 120, 2, "Object 2", false, false, false, false, true,[1, 3, 4],
            "This object should be kept in state, because it is non-persistent and reachable from \"Object 1\", which is subscribed.");
        o(200, 20, 3, "Object 3", true, false, true, true, true,[],
            "This object should be kept in state, because it has changes and reachable from \"Object 1\" (which is subscribed) through \"Object 2\".");
        o(200, 220, 4, "Object 4", true, false, true, false, false,[],
            "This object should not be kept in state, because it is persistent object with no changes, so it can be read from database if application needs it");
        o(380, 20, 5, "Object 5", true, false, true, true, false,[],
            "This object should not be kept in state, because it is not reachable from any other object(s) and is not subscribed.");

        level("Level 7");
        o(200, 10, 1, "Object 1", false, true, false, true, true,[2, 3],
            "This object should be kept in state, because it is subscribed.");
        o(110, 120, 2, "Object 2", true, false, true, false, false,[],
            "This object should not be kept in state, because even if it is reachable from both \"Object 1\" and \"Object 5\", it is neither new nor contains any change, so it can be read from database when necessary");
        o(300, 120, 3, "Object 3", true, false, true, true, true,[],
            "This object should be kept in state, because it is has changes and reachable through \"Object 1\", which is subscribed.");
        o(200, 230, 4, "Object 4", true, false, false, false, true,[2, 3],
            "This object should be kept in state, because it is new and reachable from \"Object 1\" over \"Object 3\".");
        o(20, 230, 5, "Object 5", true, true, true, false, true,[2],
            "This object should be kept in state, because it is subscribed.");
        o(380, 230, 6, "Object 6", true, false, true, false, false,[3],
            "This object should not be kept in state, because it is neither new nor changed, so it can be read from database when necessary");
        o(300, 340, 7, "Object 7", false, false, true, false, true,[4, 6],
            "This object should be kept in state, because it is a non-persistent entity and reachable from \"Object 4\" > \"Object 3\" > \"Object 1\" chain.");
        //
        // level("Level 8");
        // o(400, 350, 1, "Object 1", false, false, true, false, true,[],
        //     "This object should be kept in state, because it is an unpersistable object and reachable from Object X");
        // o(10, 10, 2, "Object 2", false, false, true, false, true,[1],
        //     "This object should be kept in state, because it is an unpersistable object and reachable from Object X");
    }

    fillLevels();
})();
