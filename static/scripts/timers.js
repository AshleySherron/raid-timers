//  creates a window.timers object which keeps a list of timers which can be manipulated and retrieved
/*  
    Format for a timer object: {
        id : int
        time : int
        name : string
        type : string
        description : string
        display : {
            time : string
            name : string
            type : string
            description : string
        }
    }
*/
(function() {
    var timers = {};
    var timerList = [];
    var nextID = 1;

    var sortTimers = function sortTimerList() {
        timerList.sort((a,b) => a.time - b.time);
    };
    
    var createTimerDisplay = (function() {
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        var escapeHTML = function (string) {
            return String(string).replace(/[&<>"'`=\/]/g, function (s) {
                return entityMap[s];
            });
        }
        
        return function createTimerDisplay (timer) {
            var minutes, seconds;
            minutes = Math.floor(timer.time / 60);
            seconds = timer.time % 60;
            if (seconds < 10) 
                seconds = '0' + seconds;
            timer.display = {
                time : minutes + ':' + seconds,
                name : escapeHTML(timer.name),
                type : escapeHTML(timer.type),
                description : escapeHTML(timer.description)
            }
        }
    }());

    /*Loads timers from a properly formatted JSON file. Must have the following format: {
            inputTimers : [timers]
        }
        timers should be formatted per the timer format at the top of this file, though this ignores the display field
        All current timers will be destroyed by this operation.
        Returns true if successful, otherwise false.
    */
    timers.loadFromJSON = function loadTimersFromJSON(input) {
        var inputObj = JSON.parse(input);
        if (!inputObj) {
            return false;
        }
        var inputTimers = inputObj.timers;
        if (!inputTimers) {
            return false;
        }
        return timers.load(inputTimers);
    }

    /*Loads timers from an array, containing entries formatted per the timer format at the top of this file, minus the display object
        All current timers will be destroyed by this operation.
        Returns true if successful, otherwise false.
    */
    timers.load = function loadTimers(input) {
        if (Array.isArray(input)) {
            timerList = [];
            nextID = 1;
            inputTimers.forEach(timers.add);
            return true;
        } else {
            return false;
        }
    }

    /*
    Returns a copy of the timerList object
    */
    timers.all = function getAllTimers() {
        sortTimers();
        var list = [];
        timerList.forEach(function(timer) {
            list.push({
                id : timer.id,
                time : timer.time,
                name : timer.name,
                type : timer,type,
                description : timer.description,
                display : {
                    time : timer.display.time,
                    name : timer.display.name,
                    type : timer.display.type,
                    description : timer.display.description
                }
            });
        })
        return list;
    }

    /*Adds a new timer. Should be formatted per the timer format at the top of this file, minus the display object.
    Returns the new timer's id.
    */
    timers.add = function addTimer(values) {
        if (values) {
            var timer = {
                id:nextID++,
                time:Math.abs(Math.floor(values.time)),
                name:values.name,
                type:values.type,
                description:values.description
            };
            createTimerDisplay(timer);
            timerList.push(timer);
            return timer.id;
        }
    }

    /*Edits an existing timer given an id and properly formatted values.
    Returns true if successful, or false if the operation fails
    */
    timers.edit = function editTimer(id, values) {
        var successful = false;
        timerList.forEach(function(timer) {
            if (timer.id === id) {
                timer.time = Math.floor(values.time);
                timer.name = values.name;
                timer.type = values.type;
                timer.description = values.description;
                createTimerDisplay(timer);
                successful = true;
            }
        });
        return successful;
    }
    /*Deletes an existing timer.
    Returns true if successful, or false if the operation fails
    */
    timers.delete = function deleteTimer(id) {
        var indexToDelete = null;
        timerList.forEach(function(timer, index) {
            if (timer.id === id) {
                indexToDelete = index;
            }
        });
        if (indexToDelete !== null) {
            timerList.splice(indexToDelete, 1);
            return true;
        } else {
            return false;
        }
    }

    /*Retrieves a timer based on its id.
        Returns the timer, or null if no timer matching that ID is found.
    */
    timers.get = function getTimerByID (id) {
        var indexToGet = null;
        timerList.forEach(function(timer, index) {
            if (timer.id === id) {
                indexToGet = index;
            }
        });
        if (indexToGet === null) {
            return null;
        } else {
            return timerList[indexToGet];
        }
    }

    window.timers = timers;
})();