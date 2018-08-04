const getCloseablePositions = require("./utils");
const getCloseablePositionsBigBoard = require("./utils-bigBoard");
const possibleWinPositions = require("./utils-cellsWeight");
const centerBoard = [1,1];
const cornerBoards = [[0,0],[0,2],[2,0],[2,2]];

function evalMove(state, move){

    let nextState = state.nextState(move);

    if(nextState.board.winner === state.player){
        move.score = Infinity;
        return move;
    }

    if(nextState.board.board[move.row][move.col].isFinished()){
        if(move.getBoardCoords() === centerBoard){
            move.score += 200;
        }else if (cornerBoards.includes(move.getBoardCoords())){
            move.score +=60;
        }else{
            move.score +=100;
        }
    }

    let myOldWinningPositions = getCloseablePositions(state.board.board[move.subRow][move.subCol].board, state.player);
    let myNewWinningPositions = getCloseablePositions(nextState.board.board[move.subRow][move.subCol].board, state.player);
    
    if(myNewWinningPositions.length > myOldWinningPositions.length){
        move.score += 40;
    }

    let opponentOldWinningPositions = getCloseablePositions(nextState.board.board[move.subRow][move.subCol].board, state.player);
    let opponentNewWinningPositions = getCloseablePositions(state.board.board[move.subRow][move.subCol].board, state.player);

    if(opponentNewWinningPositions.length < opponentOldWinningPositions.length){
        move.score += 20;
    }

    let myOldWinningPositionsBigBoard = getCloseablePositionsBigBoard(state.board.board[move.subRow][move.subCol].board, state.player);
    let myNewWinningPositionsBigBoard = getCloseablePositionsBigBoard(nextState.board.board[move.subRow][move.subCol].board, state.player);

    if(myNewWinningPositionsBigBoard.length > myOldWinningPositionsBigBoard.length){
        move.score += 100;
    }

    let opponentOldWinningPositionsBigBoard = getCloseablePositionsBigBoard(nextState.board.board[move.subRow][move.subCol].board, state.player);
    let opponentNewWinningPositionsBigBoard = getCloseablePositionsBigBoard(state.board.board[move.subRow][move.subCol].board, state.player);

    if(opponentNewWinningPositionsBigBoard.length < opponentOldWinningPositionsBigBoard.length){
        move.score += 50;
    }

    let possibleWinningPos = possibleWinPositions(nextState.board.board[move.row][move.col].board, state.player);

    for(let cell of possibleWinningPos){
        if(Array.isArray(cell)){
            for(pCell of cell){
                let test = [move.subRow, move.subCol];
                if(test.x == pCell.coordinates.x && test.y == pCell.coordinates.y){
                    move.score +=3;
                }
            }
        }else{
            let test = [move.subRow, move.subCol];
            if(test.x == pCell.coordinates.x && test.y == pCell.coordinates.y){
                move.score +=3;
            }
        }
    }

    return move;

}

module.exports = evalMove;