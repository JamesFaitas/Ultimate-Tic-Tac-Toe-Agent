"use strict";

const UTTT = require('@socialgorithm/ultimate-ttt').default;
const ME = require("@socialgorithm/ultimate-ttt/dist/model/constants").ME;
const OPPONENT = require("@socialgorithm/ultimate-ttt/dist/model/constants").OPPONENT;
const MCTS = require("./mcts");
const State = require("./state");
const Move = require('./move');
const scoreMoves = require("./cellsWeight");

class GameLogic {
    constructor(player, size = 3){
        if(!player || player < ME || player > OPPONENT){
            throw new Error('Invalid player');
        }

        this.size = size;
        this.player = player;
        this.opponent = 1 - player;
        this.mcts = new MCTS(this.game);

        this.init();
    }

    /* ----- Required methods ----- */

    init(){
        this.game = new UTTT(this.size);
        this.state = new State([], this.game, this.player);
        if(this.mcts.nodes.size > 10000)
            this.mcts.nodes.clear();
    }

    addOpponentMove(board, move) {
        try {
            this.game = this.game.addOpponentMove(board, move);
            this.state = this.state.nextState(new Move(board[0], board[1], move[0], move[1], 0))
        } catch (e) {
            console.error('-------------------------------');
            console.error("\n"+'AddOpponentMove: Game probably already over when adding', board, move, e);
            console.error("\n"+this.game.prettyPrint());
            console.error("\n"+this.game.stateBoard.prettyPrint(true));
            console.error('-------------------------------');
            throw new Error(e);
        }
    }

    addMove(board, move){
        try {
            this.game = this.game.addMyMove(board, move);
            this.state = this.state.nextState(new Move(board[0], board[1], move[0], move[1], 0))
        } catch (e) {
            console.error('-------------------------------');
            console.error("\n"+'AddMyMove: Game probably already over when adding', board, move, e);
            console.error("\n"+this.game.prettyPrint());
            console.error("\n"+this.game.stateBoard.prettyPrint(true));
            console.error('-------------------------------');
            throw new Error(e);
        }
    }

    getMove(){
        let ret = this.mcts.runSearch(this.state, 90);
        let move = this.mcts.bestMove(this.state);
        return move;
    }
}

module.exports = GameLogic;