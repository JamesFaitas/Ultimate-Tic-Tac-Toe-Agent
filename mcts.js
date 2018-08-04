"use strict";

const MCTSNode = require('./mcts-node');
const Move = require('./move');
const State = require('./state');
const getCloseablePositions = require("./utils");
const getCloseablePositionsBigBoard = require("./utils-bigBoard");
const possibleWinPositions = require("./utils-cellsWeight");
const centerBoard = [1,1];
const cornerBoards = [[0,0],[0,2],[2,0],[2,2]];
const evalMove = require("./evalMove");

class MCTS{

    constructor(game, UCB1ExploreParam = 5){
        this.game = game;
        this.UCB1ExploreParam = UCB1ExploreParam;
        this.nodes = new Map() // map: State.hash() => mcts-node
    }

    makeNode(state){
        if(!this.nodes.has(state.hash())){
            let unexpandedMoves = state.legalMoves().slice();
            let node = new MCTSNode(null, null, null, state, unexpandedMoves);
            this.nodes.set(state.hash(), node)
        }
    }

    runSearch(state, timeout = 3){
        
        this.makeNode(state);

        let draws = 0;
        let totalSims = 0;

        let end = Date.now() + timeout;

        while(Date.now() < end) {

            let node = this.select(state);
            let winner = state.board.winner;
            
            if (node.isLeaf() === false && winner === undefined) {
                node = this.expand(node);
                winner = this.simulate(node);
            }

            this.backpropogate(node, winner);

            if (winner === -1)
                draws++;

            totalSims++;
        }


        return{runtime: timeout, simulations: totalSims, draws: draws};
    }

    bestMove(state){
        
        this.makeNode(state);

        if(state.board.getMoves() === 0){
            return new Move(1,1,1,1);
        }

        if (this.nodes.get(state.hash()).isFullyExpanded() === false){
            
            let legalMoves = state.legalMoves();
            let index = Math.floor(Math.random() * legalMoves.length);
            let bestMove = legalMoves[index];
        
        
            for(let i = 0; i < legalMoves.length; i++){
                legalMoves[i] = evalMove(state, legalMoves[i]);
            }
        
            for(let move of legalMoves){
                if(move.score > bestMove.score){
                    bestMove = move;
                }
            }
        }

        let node = this.nodes.get(state.hash());
        let allMoves = node.allMoves();
        let bestMove;

        let max = -Infinity;
        for(let move of allMoves) {
            if (node.children.get(move.hash()).node !== null){
                let childNode = node.childNode(move);
                if(childNode.n_moves > max){
                    bestMove = move;
                    max = childNode.n_moves;
                }
            }
        }


        return bestMove;
    }

    //Phase 1
    select(state){
        
        let node = this.nodes.get(state.hash());

        while(node.isFullyExpanded() && !node.isLeaf()){
            let moves = node.allMoves();
            let bestMove;
            let bestUCB1 = -Infinity;

            for(let move of moves){

                let childUCB1 = node.childNode(move).getUCB1(this.UCB1ExploreParam);
                
                if(childUCB1 > bestUCB1){
                    bestMove = move;
                    bestUCB1 = childUCB1;
                }
            }

            if(bestMove === undefined){
                let index = Math.floor(Math.random() * moves.length);
                bestMove = moves[index];
            }
            node = node.childNode(bestMove);
        }

        return node;
    }

    //Phase 2
    expand(node){

        let moves = node.unexpandedMoves();
        let index = Math.floor(Math.random() * moves.length);
        let move = moves[index];

        let childState = node.state.nextState(move);
        let childUnexpandedMoves = childState.legalMoves();

        let childNode = node.expand(move, childState, childUnexpandedMoves);

        this.nodes.set(childState.hash(), childNode);

        return childNode;
    }


    //Phase 3
    simulate(node){
        
        let state = node.state;
        let winner = state.board.winner;
        let maxHeur = 0;
        while(winner === undefined){
            
            let bestMove = null;

            let legalMoves = state.legalMoves();
            for(let lmove of legalMoves){
                lmove = evalMove(state, lmove);
                if(lmove.score > maxHeur)
                    bestMove = lmove;
            }

            if(bestMove === null || bestMove.score === 0)
                bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
                
            state = state.nextState(bestMove);
            winner = state.board.winner;
        }

        return winner;
    }


    //Phase 4
    backpropogate(node, winner){

        while(node != null){
            node.n_moves += 1;

            if(node.state.isPlayer(-winner)){
                node.n_wins += 1;
            }

            node = node.parent;
        }
    }
}


module.exports = MCTS;
