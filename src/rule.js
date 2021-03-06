export const TimeLimit = {
    PLACEMENT: 1000,
}

export const StoneColor = {
    BLACK: 1,
    WHITE: 2
}

export function opponentColor(stoneColor) {
    return stoneColor === StoneColor.BLACK ? StoneColor.WHITE : StoneColor.BLACK;
}

/**
 * 돌을 놓는다고 가정했을 때, 이겼는지 검사
 */
export function checkVictory(x, y, stoneColor, board, boardSize) {

    board = board.slice(0)
    board[y * board.boardSize + x] = stoneColor;

    // 돌 연산자
    let at = (sx, sy) => board[sy * boardSize + sx];
    let inbound = (sx, sy) => (sx >= 0 && sy >= 0 && sx < boardSize && sy < boardSize);

    // 기준 돌
    let placement = at(x, y);

    // 흩어짐 체크
    let check = function (a, b, c, d) {
        let i = 0, j = 0;
        while (at(x + a * i, y + b * i) === placement && inbound(x + a * i, y + b * i)) {
            i++;
        }
        while (at(x + c * j, y + d * j) === placement && inbound(x + c * j, y + d * j)) {
            j++;
        }
        return i + j === 6;
    }

    // 가로, 세로, 대각선 검사
    return check(-1, 0, 1, 0) || check(0, -1, 0, 1) || check(-1, -1, 1, 1) || check(1, -1, -1, 1);
}

/**
 * 돌을 놓는다고 가정했을 때, 금수인지 검사
 */
export function checkValidity(x, y, stoneColor, board, boardSize) {

    board = board.slice(0)
    board[y * boardSize + x] = stoneColor;

    // 삼삼 체크
    let notDoubleThree = !checkDoubleN(x, y, stoneColor, board, boardSize, 3);

    // 사사 체크
    let notDoubleFour = !checkDoubleN(x, y, stoneColor, board, boardSize, 4);

    return notDoubleThree && notDoubleFour;
}

/**
 * NN 체크
 */
function checkDoubleN(x, y, stoneColor, board, boardSize, n) {

    // 돌 연산자
    let at = (sx, sy) => board[sy * boardSize + sx];
    let inbound = (sx, sy) => (sx >= 0 && sy >= 0 && sx < boardSize && sy < boardSize);

    // 기준 돌
    let opponentStoneColor = opponentColor(stoneColor)

    // 한쪽 방향으로 열림성 검사
    let traverse = (a, b) => {
        let i = 0;
        let stuck = true;
        let spaces = [];
        while (true) {
            if (at(x + a * i, y + b * i) === 0) spaces.push([x + a * i, y + b * i]);
            if (!inbound(x + a * (i + 1), y + b * (i + 1))) break;
            if (at(x + a * (i + 1), y + b * (i + 1)) === opponentStoneColor) break;
            if (at(x + a * (i + 1), y + b * (i + 1)) === 0 && at(x + a * i, y + b * i) === 0) {
                stuck = false;
                break;
            }
            i++;
        }
        return {length: i, stuck: stuck, spaces: spaces};
    }

    /**
     * 열린 N 검사
     * 열린4: 양쪽 모두가 막히지 않은 4
     * 열린3: 하나 두면 열린 4가 만들어 지는 것
     *     - 네 칸의 범위에서 같은 색깔 3개가 있어야 함.
     *     - 하나 둬서 4를 만들 수 있어야 함.
     * 쌍삼: 열린 3이 두개 만들어 지는 것
     */

    let checkOpenN = (a, b, c, d) => {

        let p = traverse(a, b);
        let q = traverse(c, d);
        let lsum = p.length + q.length;
        let csum = p.spaces.length + q.spaces.length - 2;

        if (at(x + a * p.length, y + b * p.length) === 0
            && at(x + c * q.length, y + d * q.length) === 0) {

            if (lsum === n + 1 && csum === 0) {
                return (this.checkValidity(p.spaces[0][0], p.spaces[0][1], stoneColor, board)
                    || this.checkValidity(q.spaces[0][0], q.spaces[0][1], stoneColor, board));
            }
            if (lsum === n + 2 && csum === 1 && !(p.stuck && q.stuck)) {
                let target = p.spaces.length > 1 ? p.spaces : q.spaces;
                return this.checkValidity(target[1][0], target[1][1], stoneColor, board);
            }
            return false;
        } else {
            return false;
        }
    }

    return (checkOpenN(-1, 0, 1, 0) + checkOpenN(0, -1, 0, 1)
        + checkOpenN(-1, -1, 1, 1) + checkOpenN(1, -1, -1, 1)) > 1

}
