$(function(){
    /**
     * @param n   Count dices
     * @param p   Probability
     * @param sum Summary probability
     */
    function calcDices(n, p, sum) {
        sum = sum === undefined ? true : !!sum;
        var result = [], value = 0;
        for (var m = n + 1; --m;) {
            value = prob(p, m, n) * comb(m, n) + (sum ? value : 0);
            result.unshift(value);
        }
        result.unshift(prob(p, m, n) * comb(0, n));
        return result;
    }

    function calcDicesMulti(n1, n2, n4, p, sum) {
        sum = sum === undefined ? true : !!sum;
        var result = [], i,
            result1 = calcDices(n1, p, false),
            result2 = calcDices(n2, p, false),
            result4 = calcDices(n4, p ,false),
            max = n1 + n2 * 2 + n4 * 4;
        for (i = 0; i <= max; i++) {
            result.push(0);
        }

        var value1, value2, value4, key;
        for (var i1 in result1) {
            value1 = result1[i1];
            for (var i2 in result2) {
                value2 = result2[i2];
                for (var i4 in result4) {
                    value4 = result4[i4];
                    key = parseInt(i1) + parseInt(i2) * 2 + parseInt(i4) * 4;
                    result[key] += value1 * value2 * value4;
                }
            }
        }

        if (sum && max > 0) {
            for (i = max; --i;) {
                result[i] += result[i+1];
            }
        }

        return result;
    }

    function prob(p, m, n) { return Math.pow(p, m) * Math.pow(1-p, n-m); }
    function comb(m, n) { return fact(n) / (fact(m) * fact(n - m)); }
    function fact(n) { var v = 1; for (var i = 2; i <= n; i++) v = v * i; return v; }
    function dice() { return Math.floor(Math.random() * 6) + 1; }
    function sleep(ms) { ms += new Date().getTime(); while (new Date() < ms) {} }
    function round(v, n) { return Math.round(v * Math.pow(10, n)) / Math.pow(10, n); }

    $('body').on('click', '.game-counter', function(e) {
        var $target = $(e.target), $value = $(this).find('.game-counter-value'), value = parseInt($value.html());
        if ($target.hasClass('game-counter-plus')) {
            $value.html(value + 1);
        } else if ($target.hasClass('game-counter-minus')) {
            $value.html(value > 1 ? value - 1 : 0);
        }
    });

    $('#cannons_calc').on('click', function(){
        var cannonsIon = parseInt($('#cannons_ion').html()) || 0,
            cannonsPlasma = parseInt($('#cannons_plasma').html()) || 0,
            cannonsAntimatter = parseInt($('#cannons_antimatter').html()) || 0,
            cannonsComputer = parseInt($('#cannons_computer').html()) || 0;

        var probability = ((cannonsComputer > 4 ? 4 : cannonsComputer) + 1) / 6,
            calc = calcDicesMulti(cannonsIon, cannonsPlasma, cannonsAntimatter, probability),
            html = '';

        html += '<table class="table table-striped table-align-center">';
        html += '<thead><tr><th>Damage</th><th>Probability</th></tr></thead>';
        html += '<tbody>';
        for (var i in calc) {
            html += '<tr>';
            html += '<td>' + (i > 0 ? '&ge; ' : '= ') + i + '</td>';
            html += '<td>' + (calc[i] < 0.1 ? '0' : '') + round(calc[i] * 100, 3).toFixed(3) + '%</td>';
            html += '</tr>';
        }
        html += '</tbody></table>';

        $('#cannons_result').html(html);
    });

    var dicesThrow = 0, dicesPause = 1000, dicesThrowPause = 3000;
    $('#dices_throw').on('click', function(){
        var pause = dicesPause + dicesThrowPause;
        if (dicesThrow > (new Date()).getTime()) {
            return;
        } else {
            dicesThrow = (new Date()).getTime() + pause;
        }

        var dicesIon = parseInt($('#dices_ion').html()) || 0,
            dicesPlasma = parseInt($('#dices_plasma').html()) || 0,
            dicesAntimatter = parseInt($('#dices_antimatter').html()) || 0,
            i, html = '',
            $result = $('#dices_result');

        $result.html('');

        var $this = $(this);
        $this.removeClass('btn-primary');
        setTimeout(function(){ $this.addClass('btn-primary'); }, pause);

        for (i = 0; i < dicesIon; i++) {
            html += '<div class="game-dice game-ion">' + dice() + '</div>';
        }
        for (i = 0; i < dicesPlasma; i++) {
            html += '<div class="game-dice game-plasma">' + dice() + '</div>';
        }
        for (i = 0; i < dicesAntimatter; i++) {
            html += '<div class="game-dice game-antimatter">' + dice() + '</div>';
        }

        setTimeout(function(){ $result.html(html); }, dicesPause);
    });

    $('#battle_run').on('click', function(){

    });
});