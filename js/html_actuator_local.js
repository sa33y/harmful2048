function HTMLActuator() {
    this.tileContainer = document.querySelector(".tile-container");
    this.scoreContainer = document.querySelector(".score-container");
    this.bestContainer = document.querySelector(".best-container");
    this.messageContainer = document.querySelector(".game-message");
    this.sharingContainer = document.querySelector(".score-sharing");
    this.score = 0;
    this.maxTileValue = 63;
    this.pictureIndex = 0;
    this.originalPicture = "https://i.pinimg.com/236x/08/06/88/080688ab04f8715650cb5b8e52bd5d14.jpg";
    this.pictures = [
      "https://i.pinimg.com/236x/4b/05/0c/4b050ca4fcf588eedc58aa6135f5eecf.jpg"
    ];
}
HTMLActuator.prototype.actuate = function(grid, metadata) {
    var self = this;
    window.requestAnimationFrame(function() {
        self.clearContainer(self.tileContainer);
        grid.cells.forEach(function(column) {
            column.forEach(function(cell) {
                if (cell) {
                    self.addTile(cell);
                }
            });
        });
        self.updateScore(metadata.score);
        self.updateBestScore(metadata.bestScore);
        if (metadata.terminated) {
            if (metadata.over) {
                self.message(false);
            } else if (metadata.won) {
                self.message(true);
            }
        }
    });
}
;
HTMLActuator.prototype.continueGame = function() {
    this.clearMessage();
}
;
HTMLActuator.prototype.reset = function() {
    this.maxTileValue = 63;
    this.pictureIndex = 0;
    document.querySelector('body').style.backgroundImage = 'url("' + this.originalPicture  + '")';
}
;
HTMLActuator.prototype.clearContainer = function(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
;

HTMLActuator.prototype.addTile = function(tile) {
    var self = this;
    var wrapper = document.createElement("div");
    var inner = document.createElement("div");
    var position = tile.previousPosition || {
        x: tile.x,
        y: tile.y
    };
    var positionClass = this.positionClass(position);
    var classes = ["tile", "tile-" + tile.value, positionClass];
    if (tile.value > 2048)
        classes.push("tile-super");

	
    if (tile.value > this.maxTileValue && this.pictures.length > this.pictureIndex) {
        this.maxTileValue = tile.value;
        var pic = this.pictures[this.pictureIndex];
        document.querySelector('body').style.backgroundImage = 'url("' + pic  + '")';
        this.pictureIndex++;
    }

    this.applyClasses(wrapper, classes);
    inner.classList.add("tile-inner");
    inner.textContent = tile.value;
    if (tile.previousPosition) {
        window.requestAnimationFrame(function() {
            classes[2] = self.positionClass({
                x: tile.x,
                y: tile.y
            });
            self.applyClasses(wrapper, classes);
        });
    } else if (tile.mergedFrom) {
        classes.push("tile-merged");
        this.applyClasses(wrapper, classes);
        tile.mergedFrom.forEach(function(merged) {
            self.addTile(merged);
        });
    } else {
        classes.push("tile-new");
        this.applyClasses(wrapper, classes);
    }
    wrapper.appendChild(inner);
    this.tileContainer.appendChild(wrapper);
}
;
HTMLActuator.prototype.applyClasses = function(element, classes) {
    element.setAttribute("class", classes.join(" "));
}
;
HTMLActuator.prototype.normalizePosition = function(position) {
    return {
        x: position.x + 1,
        y: position.y + 1
    };
}
;
HTMLActuator.prototype.positionClass = function(position) {
    position = this.normalizePosition(position);
    return "tile-position-" + position.x + "-" + position.y;
}
;
HTMLActuator.prototype.updateScore = function(score) {
    this.clearContainer(this.scoreContainer);
    var difference = score - this.score;
    this.score = score;
    this.scoreContainer.textContent = this.score;
    if (difference > 0) {
        var addition = document.createElement("div");
        addition.classList.add("score-addition");
        addition.textContent = "+" + difference;
        this.scoreContainer.appendChild(addition);
    }
}
;
HTMLActuator.prototype.updateBestScore = function(bestScore) {
    this.bestContainer.textContent = bestScore;
}
;
HTMLActuator.prototype.message = function(won) {
    var type = won ? "game-won" : "game-over";
    var message = won ? "예이이! 완전히 벗겼습니다!" : "아앗... 완전히 벗기기 실패!";
    this.messageContainer.classList.add(type);
    this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    //this.clearContainer(this.sharingContainer);
    //this.sharingContainer.appendChild(this.scoreTweetButton());
    //twttr.widgets.load();
}
;
HTMLActuator.prototype.clearMessage = function() {
    this.messageContainer.classList.remove("game-won");
    this.messageContainer.classList.remove("game-over");
}
;
HTMLActuator.prototype.scoreTweetButton = function() {
    var tweet = document.createElement("a");
    tweet.classList.add("twitter-share-button");
    tweet.setAttribute("href", "https://twitter.com/share");
    tweet.setAttribute("data-url", "http://2048game.com");
    tweet.setAttribute("data-counturl", "http://2048game.com");
    tweet.textContent = "Tweet";
    var text = "I scored " + this.score + " points at 2048, a game where you " + "join numbers to score high! #2048game";
    tweet.setAttribute("data-text", text);
    return tweet;
}
;
