const winning_lines =[
    [[0,0], [1,0], [2,0]],
    [[0,1], [1,1], [2,1]],
    [[0,2], [1,2], [2,2]],
    [[0,0], [0,1], [0,2]],
    [[1,0], [1,1], [1,2]],
    [[2,0], [2,1], [2,2]],
    [[0,0], [1,1], [2,2]],
    [[0,2], [1,1], [2,0]]
];

scoreEnd = [
    [3,2,3],
    [2,4,2],
    [3,2,3]
];

function scoreMoves(board){
    let score = [[]]; 
    //For loop for if board coord is playable
    for (var i = 0; i <board.length; i++ ){ //y axis
        for (var j = 0; j <board.length; j++){ //x axis
            if (!board[i][j].isPlayed()){
                for (var m = 0; m <winning_lines[0].length; m++){
                    for (var n=0; n < winning_lines[0].length; n++){
                        if (i === winning_lines[m][n][0] && j === winning_lines[m][n][1]){
                            if (board[winning_lines[i][1][0]][winning_lines[i][1][1]].player !== 0 && 
                                board[winning_lines[i][2][0]][winning_lines[i][2][1]].player !== 0 && 
                                board[winning_lines[i][0][0]][winning_lines[i][0][1]].player !== 0){
                                score[i][j] += 1;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
    return score;
}

module.exports = scoreMoves;
