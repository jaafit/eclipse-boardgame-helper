(function($){

    var togglePanel = function(panel) {
        var body =  panel.find('.panel-body');
        var a = body.find('.game-number .active');
        if (!body.is(':visible')) {
            body.slideDown();
            a.data('value', '1').html(1); // change ship count to 1 upon showing

        }
        else {
            body.slideUp();
            a.data('value', '0').html(''); // change ship count to 0 upon hiding
        }
    };

    // Event Handlers
    var $body = $('body');

    $body.on('click', '.game-counter', function(e) {
        var $target = $(e.target),
            $value = $(this).find('.game-counter-value'),
            value = parseInt($value.data('value')),
            list = $(this).data('list') ? $(this).data('list').split(',') : [];
        if ($target.hasClass('game-counter-plus')) {
            value++;
        } else if ($target.hasClass('game-counter-minus')) {
            value--;
        }
        if ($(this).hasClass('negative'))
            value = Math.min(0, value);
        else
            value = Math.max(0, value);
        $value.data('value', value);
        $value.html(list.length ? list[value] : (value || ''));
    });

    $body.on('click', '.panel .panel-heading', function() {
        togglePanel($(this).closest('.panel'));
    });

    var clearShip = function(clearGroup) {
        var countervals = clearGroup.find('.game-counter-value');
        countervals.html('');
        countervals.data('value', 0);
    };

    $body.on('click', '.clear-btn', function() {
        var clearGroup = $(this).closest('.clear-group');
        clearShip(clearGroup);
        var a = clearGroup.find('.game-number .game-counter-value');
        a.html(1);
        a.data('value', 1);
        return false; // don't also toggle visible
    });

    var showNpcButtons = function() {
        var panel = $('.panel.npc');
        panel.find('.panel-body').slideUp();
        panel.hide();
        $('#npcbuttons').show();
    };

    $body.on('click', '.clear-fleet-btn', function() {
        var fleet = $(this).closest('.fleet');
        var clearGroup = fleet.find('.clear-group');
        clearShip(clearGroup);
        clearGroup.find('.panel-body').slideUp();

        if (fleet.hasClass('their_fleet'))
            showNpcButtons();
    });

    $body.on('click', '.npc .clear-btn', showNpcButtons);
    $body.on('click', '.panel.npc .panel-heading', showNpcButtons);


    $body.on('click', '#npcbuttons .npc', function() {
        var panel = $('.panel.npc');

        var npcs = {
            'npc_ancientA': {'cannon_ion': 2, 'initiative': 2, 'computer': 1, 'hull': 1},
            'npc_ancientB': {'cannon_plasma': 1, 'initiative': 1, 'computer': 1, 'hull': 2},
            'npc_guardianA': {'cannon_ion': 3, 'computer': 2, 'initiative': 3, 'hull': 2},
            'npc_guardianB': {'missile_plasma':2, 'cannon_antimatter': 1, 'computer': 1, 'hull': 3, 'initiative': 1},
            'npc_gcdsA': {'cannon_ion': 4, 'computer': 2, 'hull': 7},
            'npc_gcdsB': {'missile_ion': 4, 'cannon_antimatter': 1, 'computer': 2, 'hull': 3}
        };
        var npc = npcs[$(this).attr('id')];

        panel.find('.active').data('value', 0).html('');
        for (var property in npc) {
            var a = panel.find('#battle_second_npc_' + property);
            a.data('value', npc[property]);
            a.html(npc[property])
        }

        panel.show();
        togglePanel(panel);
        $('#npcbuttons').hide();
    });

    $body.on('click', '.button-checkbox', function() {
        var $this = $(this);
        if ($this.data('value') > 0) {
            $this.data('value', 0);
            $this.removeClass('btn-warning');
        } else {
            $this.data('value', 1);
            $this.addClass('btn-warning');
        }
    });

    $body.on('click', '.button-radio', function() {
        var $this = $(this);
        if ($this.data('value') == 0) {
            $this.data('value', 1);
            $this.addClass($this.data('class') || 'btn-warning');

            $this.siblings('.button-radio').each(function() {
                var $this = $(this);
                $this.data('value', 0);
                $this.removeClass($this.data('class') || 'btn-warning');
            });
        }
    });

    var battleSideSelectorActive = false;
    $body.on('click', '.battle-side .button-radio', function() {
        if (battleSideSelectorActive) {
            return;
        }
        battleSideSelectorActive = true;
        var $this = $(this);
        var $battleSide = $this.closest('.battle-side');
        if ($this.data('side') == 'attack') {
            $('.battle-side').not($battleSide).find('.button-radio[data-side="defence"]').click();
        } else {
            $('.battle-side').not($battleSide).find('.button-radio[data-side="attack"]').click();
        }
        battleSideSelectorActive = false;
    });


    // Cannons page
    $('#cannons_calc').on('click', function(){
        var cannonsIon = parseInt($('#cannons_ion').html()) || 0,
            cannonsPlasma = parseInt($('#cannons_plasma').html()) || 0,
            cannonsSoliton = parseInt($('#cannons_soliton').html()) || 0,
            cannonsAntimatter = parseInt($('#cannons_antimatter').html()) || 0,
            cannonsRift = parseInt($('#cannons_rift').html()) || 0,
            cannonsComputer = parseInt($('#cannons_computer').html()) || 0;

        var probability = ((cannonsComputer > 4 ? 4 : cannonsComputer) + 1) / 6,
            calc = calcDiceMulti(cannonsIon, cannonsPlasma, cannonsSoliton, cannonsAntimatter, cannonsRift, probability),
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


    // Dice page
    var diceThrow = 0, dicePause = 1000, diceThrowPause = 3000;
    $('#dice_throw').on('click', function(){
        var pause = dicePause + diceThrowPause;
        if (diceThrow > (new Date()).getTime()) {
            return;
        } else {
            diceThrow = (new Date()).getTime() + pause;
        }

        var diceIon = parseInt($('#dice_ion').html()) || 0,
            dicePlasma = parseInt($('#dice_plasma').html()) || 0,
            diceSoliton = parseInt($('#dice_soliton').html()) || 0,
            diceAntimatter = parseInt($('#dice_antimatter').html()) || 0,
            diceRift = parseInt($('#dice_rift').html()) || 0,
            i, html = '',
            $result = $('#dice_result');

        $result.html('');

        var $this = $(this);
        $this.removeClass('btn-primary');
        setTimeout(function(){ $this.addClass('btn-primary'); }, pause);

        for (i = 0; i < diceIon; i++) {
            html += '<div class="game-dice game-ion">' + dice() + '</div>';
        }
        for (i = 0; i < dicePlasma; i++) {
            html += '<div class="game-dice game-plasma">' + dice() + '</div>';
        }
        for (i = 0; i < diceSoliton; i++) {
            html += '<div class="game-dice game-soliton">' + dice() + '</div>';
        }
        for (i = 0; i < diceAntimatter; i++) {
            html += '<div class="game-dice game-antimatter">' + dice() + '</div>';
        }
        for (i = 0; i < diceRift; i++) {
            var side = dice();
            var hits = Math.max(0, side-3);
            var backfire = (side === 6 || side === 3) && '-1' || '';
            if (hits === 0 && backfire === '-1')
                hits = '';
            html += '<div class="game-dice game-rift">' + hits+backfire + '</div>';
        }


        setTimeout(function(){ $result.html(html); }, dicePause);
    });


    // Races page
    var $raceRun = $('#race_run'),
        $raceResult = $('#race_result'),
        raceRunPause = 3000,
        raceProcess = false;
    $raceRun.on('click', function() {
        if (raceProcess) {
            return;
        }
        raceProcess = true;
        setTimeout(function() {
            $raceRun.removeClass('btn-primary');
        }, 0);


        var $racePercents = $('#race_percents'),
            percents = {},
            sumPercents = 0;

        $racePercents.find('.game-counter-value').each(function() {
            var $this = $(this),
                value = parseInt($(this).html());
            percents[$this.attr('id')] = value;
            sumPercents += value;
        });

        var random = rand() * sumPercents,
            compareValue = 0,
            raceId;

        for (raceId in percents) {
            compareValue += percents[raceId];
            if (random < compareValue) {
                break;
            }
        }

        $raceResult.html('<img src="' + getRaceImgById(raceId) + '">');

        setTimeout(function() {
            $raceRun.addClass('btn-primary');
            raceProcess = false;
        }, raceRunPause);
    });

    function getRaceImgById(raceId) {
        switch (raceId) {
            case 'race_1':
                return 'img/EridaniEmpire.png';
            case 'race_2':
                return 'img/HydranProgress.png';
            case 'race_3':
                return 'img/Planta.png';
            case 'race_4':
                return 'img/DescendantsOfDraco.png';
            case 'race_5':
                return 'img/Mechanema.png';
            case 'race_6':
                return 'img/OrionHegemony.png';
            case 'race_7':
                return 'img/Exiles.png';
            case 'race_8':
                return 'img/RhoIndiSyndicate.png';
            case 'race_9':
                return 'img/EnlightenedOfLyra.png';
            case 'race_10':
                switch (randInt(3, 1)) {
                    case 1:
                        return 'img/WardensOfMagellan.png';
                    case 2:
                        return 'img/SentinelsOfMagellan.png';
                    case 3:
                        return 'img/KeepersOfMagellan.png';
                    default:
                        return 'img/WardensOfMagellan.png';
                }
            case 'race_11':
            default:
                switch (randInt(6, 1)) {
                    case 1:
                        return 'img/TerranDirectorate.png';
                    case 2:
                        return 'img/TerranFederation.png';
                    case 3:
                        return 'img/TerranUnion.png';
                    case 4:
                        return 'img/TerranRepublic.png';
                    case 5:
                        return 'img/TerranConglomerate.png';
                    case 6:
                        return 'img/TerranAlliance.png';
                    default:
                        return 'img/TerranFederation.png';
                }
        }
    }


    // Battle page
    var shipTypes = ['interceptor','cruiser','dreadnought','starbase','npc'],
        $battleRun = $('.battle_run'),
        $battleResult = $('#battle_result'),
        $battleResultAnchor = $('#battle_result_anchor'),
        resultsNumber = 0,
        startTime,
        battleCalcProcess = false;

    $battleRun.on('click', function(){
        if (battleCalcProcess) {
            return;
        }
        //battleCalcProcess = true;
        $battleRun.removeClass('btn-primary');
        $battleResult.html('<div style="height: ' + $battleResult.height() + 'px"><i>processing</i></div>');
        startTime = new Date().getTime();

        setTimeout(battleRun, 1);
    });

    function battleRun() {
        var technologies = ['antimatter_splitter','distortion_shield','point_defence'],
            fields = ['number','hull','regen','computer','shield','initiative',
                'cannon_ion','cannon_plasma','cannon_soliton','cannon_antimatter','cannon_rift','missile_ion','missile_plasma','missile_soliton','missile_antimatter'];

        var parseFleet = function(idPrefix) {
            var fleet = {};

            for (var i in shipTypes) {
                fleet[shipTypes[i]] = {};
                for (var j in fields) {
                    fleet[shipTypes[i]][fields[j]] = parseInt($('#' + idPrefix + '_' + shipTypes[i] + '_' + fields[j]).data('value')) || 0;
                }

                fleet['technologies'] = {};
                for (var j in technologies) {
                    fleet['technologies'][technologies[j]] = parseInt($('#' + idPrefix + '_technology_' + technologies[j]).data('value')) ? true : false;
                }

                fleet['side'] = {attack: false, defence: false};
                if (parseInt($('#' + idPrefix + '_side_attack').data('value'))) {
                    fleet['side'].attack = true;
                } else {
                    fleet['side'].defence = true;
                }
            }

            return fleet;
        };

        var firstFleet = parseFleet('battle_first');
        var secondFleet = parseFleet('battle_second');
        var number = parseInt($('#battle_number').html()) || 1000;

        var results = calcBattles(firstFleet, secondFleet, number);


        var width = (results.winner[0] && results.winner[-1]) ? 3 : ((results.winner[0] || results.winner[-1]) ? 4 : 6);
        var html = '';

        // Winner table
        html += '<h4>Winner</h4>';
        html += '<table class="table">';
        html += '<thead><tr>';

        html += '<th class="col-xs-' + width + '">Your Victory %</th>';
        html += '<th class="col-xs-' + width + '">Their Victory %</th>';
        if (results.winner[0]) {
            html += '<th class="col-xs-' + width + '">Draw %</th>';
        }
        if (results.winner[-1]) {
            html += '<th class="col-xs-' + width + '">Stalemate %</th>';
        }

        html += '</tr></thead>';
        html += '<tbody><tr>';

        html += '<td>' + round(100 * results.winner[1] / number, 1) + '&nbsp;%</td>';
        html += '<td>' + round(100 * results.winner[2] / number, 1) + '&nbsp;%</td>';
        if (results.winner[0]) {
            html += '<td>' + round(100 * results.winner[0] / number, 1) + '&nbsp;%</td>';
        }
        if (results.winner[-1]) {
            html += '<td>' + round(100 * results.winner[-1] / number, 1) + '&nbsp;%</td>';
        }

        html += '</tr></tbody>';
        html += '</table>';

        // Survivors table
        html += '<h4>Survivors</h4>';
        html += '<table class="table">';
        html += '<thead><tr><th></th><th>Your Fleet</th><th>Their Fleet</th></tr></thead>';
        html += '<tbody>';

        var stats = shipTypes.concat('mat lost', 'mat lost %');
        for (var i in stats) {
            html += '<tr>' +
            '<td>' + capitalize(stats[i]) + '</td>' +
            '<td>' + results.fleets[0][stats[i]] + '</td>' +
            '<td>' + results.fleets[1][stats[i]] + '</td>' +
            '</tr>';
        }
        html += '</tbody>';
        html += '</table>';
        html += 'elapsed time ' + (new Date().getTime() - startTime)/1000 + ' s';

        $battleResult.html(html);
        $battleRun.addClass('btn-primary');
        battleCalcProcess = false;

        setTimeout(function() {
            var anchor = 'results' + ++resultsNumber;
            $battleResultAnchor.attr('name', anchor);
            window.location.hash = anchor;
        }, 1);
    }



    // Logic functions

    /**
     * @param n   Number of dice
     * @param p   Probability
     * @param sum Summary probability
     */
    function calcDice(n, p) {
        var result = [], value = 0;
        for (var m = n + 1; --m;) {
            value = prob(p, m, n) * comb(m, n);
            result.unshift(value);
        }
        result.unshift(prob(p, m, n) * comb(0, n));
        return result;
    }

    function calcRift(n) {
        String.prototype.faceCount = function(f) {
            return (this.match(new RegExp(f, 'g')) || []).length;
        };
        var max = n * 3,
            result = [],
            combos = Math.pow(6,n), // how many different rolls are there?
            hitMap = [];

        if (combos === 0)
            return [1];

        var powers = []
        for (var place = 0; place < n; place++)
            powers.push( Math.pow(6,place)) // precalculate powers (1, 6, 36, 216, etc)

        for (var i = 0; i < combos; i++) {
            var hits = 0;
            var source = i;
            for (var place = n-1; place >= 0; place--) {
                var power = powers[place]; // 1, 6, 36, etc
                var face = Math.floor( source / power ); // which face did this die roll?
                hits += Math.max(0, face-2); // 1, 2 or 3 hits
                source -= face * power; // save remainder of source/power as source (the source of die faces)
           }

            if (hitMap[hits] === undefined)
                hitMap[hits] = 0;
            hitMap[hits]++;

        }

        for (i = max; i >= 0; i--) {
            var occurences = hitMap[i] || 0;
            result.unshift(occurences / combos);
        }
        return result;

    }

    function calcDiceMulti(n1, n2, n3, n4, nRift, p, sum) {
        sum = sum === undefined ? true : !!sum;
        var result = [], i,
            result1 = calcDice(n1, p),
            result2 = calcDice(n2, p),
            result3 = calcDice(n3, p),
            result4 = calcDice(n4, p),
            resultRift = calcRift(nRift),
            max = n1 + n2 * 2 + n3 * 3 + n4 * 4 + nRift * 3;
        for (i = 0; i <= max; i++) {
            result.push(0);
        }

        var value1, value2, value3, value4, valueRift, key;
        for (var i1 in result1) {
            value1 = result1[i1];
            for (var i2 in result2) {
                value2 = result2[i2];
                for (var i3 in result3) {
                    value3 = result3[i3];
                    for (var i4 in result4) {
                        value4 = result4[i4];
                        for (var ir in resultRift) {
                            valueRift = resultRift[ir];
                            key = parseInt(i1) + parseInt(i2) * 2 + parseInt(i3) * 3 + parseInt(i4) * 4 + parseInt(ir);
                            result[key] += value1 * value2 * value3 * value4 * valueRift;
                        }
                    }
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



    function ArrayCollection() {}
    ArrayCollection.prototype.push = function(key, value) {
        if (this[key] === undefined) {
            this[key] = [];
        }
        return this[key].push(value);
    };
    ArrayCollection.prototype.get = function(key) {
        return this[key] || [];
    };
    ArrayCollection.prototype.keys = function(callback) {
        var keys = [];
        for (var i in this) {
            if (this.hasOwnProperty(i)) {
                keys.push(callback === undefined ? i : callback(i));
            }
        }
        return keys;
    };


    function Collection(items) {
        this.type = Object;
        this.items = [];

        this.add = function(item) {
            if (item instanceof Collection) {
                item = item.all();
            }
            if (item instanceof Array) {
                for (var i in item) {
                    this.add(item[i]);
                }
            } else if (item instanceof this.type) {
                this.items.push(item);
            }
            return this;
        };

        this.remove = function(item) {
            if (!(item instanceof Array)) {
                item = [item];
            }
            for (var j in item) {
                for (var i = 0, ii = this.items.length; i < ii; ++i) {
                    if (this.items[i] === item[j]) {
                        this.items.splice(i, 1);
                        break;
                    }
                }
            }
            return this;
        };

        this.each = function(callback) {
            for (var i = 0, ii = this.items.length; i < ii; ++i) {
                callback(this.items[i], i, this.items);
            }
            return this;
        };

        this.all = function() {
            return [].concat(this.items);
        };

        this.sort = function(callback) {
            this.items.sort(callback);
            return this;
        };

        this.count = function() {
            return this.items.length;
        };

        this.add(items || []);
    }

    function Ship() {
        this.params = ['hull','regen','computer','shield','initiative',
            'cannon_ion','cannon_plasma','cannon_soliton','cannon_antimatter','cannon_rift','missile_ion','missile_plasma','missile_soliton','missile_antimatter'];

        this.default = {};
        this.type = 'ship';

        this.init = function(attrs) {
            this.initParams(attrs);
            this.damage = 0;
            return this;
        };

        this.initParams = function(attrs) {
            attrs = attrs || [];
            for (var i in this.params) {
                var param = this.params[i];
                this[param] = attrs[param] !== undefined ? attrs[param] : (this.default[param] !== undefined ? this.default[param] : 0);
            }
            this.resources = this.type === 'interceptor' && 3
                            || this.type === 'cruiser' && 5
                            || this.type === 'dreadnought' && 8
                            || this.type === 'starbase' && 3
                            || 1;
            return this;
        };

        this.clearDamage = function() {
            this.damage = 0;
            return this;
        };

        this.putDamage = function(damage) {
            this.damage += damage.getDamageToShip(this);
            return this;
        };

        this.putBackfires = function(bf) {
            this.damage += bf;
            return this;
        };

        this.getHealth = function() {
            return 1 + this.hull - this.damage;
        };

        this.isDestroy = function(damage) {
            return this.getHealth() - (damage || 0) <= 0;
        };

        this.isRifter = function() {
            return this['cannon_rift'];
        };

        this.fire = function(fleet, fireType) {
            fireType = fireType == 'missile' ? 'missile' : 'cannon';
            var damages = new DamageCollection();

            if (!this.isDestroy()) {
                var diceResult, cannonDamages = {'ion': 1, 'plasma': 2, 'soliton': 3, 'antimatter': 4, 'rift': '?'};
                for (var cannonType in cannonDamages) {
                    var cannonDamage = cannonDamages[cannonType];
                    var countDamage = 1;
                    var backfire = 0;

                    if (fireType === 'cannon' && cannonType === 'antimatter' && (fleet.antimatter_splitter)) {
                        countDamage = cannonDamage;
                        cannonDamage = 1;
                    }

                    for (var i = 0; i < this[fireType + '_' + cannonType]; ++i) {
                        diceResult = dice();
                        if (cannonType === 'rift') {
                            cannonDamage = Math.max(0, diceResult - 3);
                            backfire = (diceResult === 3 || diceResult === 6) ? 1 : 0;
                        }
                        for (var j = 0; j < countDamage; ++j) {
                            damages.add(new Damage({
                                dice: diceResult,
                                damage: cannonDamage,
                                backfire: backfire,
                                ship: this,
                                type: cannonType
                            }));
                        }
                    }
                }
            }

            return damages;
        };

        this.fireCannons = function(fleet) {
            return this.fire(fleet, 'cannon');
        };

        this.fireMissiles = function(fleet) {
            return this.fire(fleet, 'missile');
        };

        this.init();
    }

    function ShipCollection(ships) {
        this.items = [];
        this.type = Ship;

        this.add(ships || []);

        this.eachAliveRifter = function(callback) {
            for (var i = 0, ii = this.items.length; i < ii; ++i)
                if (!this.items[i].isDestroy() && this.items[i].isRifter())
                    callback(this.items[i]);
            return this;
        };


        this.eachAlive = function(callback) {
            for (var i = 0, ii = this.items.length; i < ii; ++i) {
                if (!this.items[i].isDestroy()) {
                    callback(this.items[i], i, this.items);
                }
            }
            return this;
        };

        this.eachDead = function(callback) {
            for (var i = 0, ii = this.items.length; i < ii; ++i) {
                if (this.items[i].isDestroy()) {
                    callback(this.items[i], i, this.items);
                }
            }
            return this;
        };


        this.getAlive = function () {
            var aliveships = [];
            this.eachAlive(function(ship) {
                aliveships.push(ship);
            });
            return new ShipCollection(aliveships);
        };

        this.clearDamage = function() {
            this.each(function(ship) {
                ship.clearDamage();
            });
            return this;
        };

        this.fireCannons = function(fleet) {
            var damages = new DamageCollection();
            this.each(function(ship) {
                damages.add(ship.fireCannons(fleet));
            });
            return damages;
        };

        this.fireMissiles = function(fleet) {
            var damages = new DamageCollection();
            this.each(function(ship) {
                damages.add(ship.fireMissiles(fleet));
            });
            return damages;
        };
    }
    ShipCollection.prototype = new Collection;

    function Interceptor(attrs) {
        var self = this;

        self.default = {
            'initiative': 3,
            'cannon_ion': 1
        };

        self.type = 'interceptor';

        self.potency = 1;

        self.init(attrs);
    }
    Interceptor.prototype = new Ship;

    function Cruiser(attrs) {
        var self = this;

        self.default = {
            'initiative': 2,
            'hull': 1,
            'computer': 1,
            'cannon_ion': 1
        };

        self.type = 'cruiser';

        self.potency = 3;

        self.init(attrs);
    }
    Cruiser.prototype = new Ship;

    function Dreadnought(attrs) {
        var self = this;

        self.default = {
            'initiative': 1,
            'hull': 2,
            'computer': 1,
            'cannon_ion': 2
        };

        self.type = 'dreadnought';

        self.potency = 4;

        self.init(attrs);
    }
    Dreadnought.prototype = new Ship;

    function Starbase(attrs) {
        var self = this;

        self.default = {
            'initiative': 4,
            'hull': 2,
            'computer': 1,
            'cannon_ion': 1
        };

        self.type = 'starbase';

        self.potency = 2;

        self.init(attrs);
    }
    Starbase.prototype = new Ship;

    function Npc(attrs) {
        var self = this;

        self.default = {
        };

        self.type = 'npc';

        self.potency = 1;

        self.init(attrs);
    }
    Npc.prototype = new Ship;

    function Fleet(attrs) {
        var self = this;

        self.initAttrs = attrs;

        self.init = function(attrs) {
            self.initSide(attrs);
            self.initShips(attrs);
            self.initTechnologies(attrs);
        };

        self.attack = false;
        self.initSide = function(attrs) {
            attrs = attrs || self.initAttrs;
            self.attack = false;
            if (attrs.side !== undefined && attrs.side.attack !== undefined) {
                self.attack = !!attrs.side.attack;
            }
        };

        self.ships = [];
        self.initShips = function(attrs) {
            self.ships = [];
            attrs = attrs || self.initAttrs;

            for (var i = 0, ii = attrs.interceptor.number || 0; i < ii; ++i) {
                self.ships.push(new Interceptor(attrs.interceptor));
            }
            for (i = 0, ii = attrs.cruiser.number || 0; i < ii; ++i) {
                self.ships.push(new Cruiser(attrs.cruiser));
            }
            for (i = 0, ii = attrs.dreadnought.number || 0; i < ii; ++i) {
                self.ships.push(new Dreadnought(attrs.dreadnought));
            }
            for (i = 0, ii = attrs.starbase.number || 0; i < ii; ++i) {
                self.ships.push(new Starbase(attrs.starbase));
            }
            for (i = 0, ii = attrs.npc.number || 0; i < ii; ++i) {
                self.ships.push(new Npc(attrs.npc));
            }


            self.shipsByInitiative = new ArrayCollection();
            self.shipsByPotency = new ArrayCollection();
            for (i = 0, ii = self.ships.length; i < ii; ++i) {
                var ship = self.ships[i];

                if (!self.attack) {
                    ship.initiative += 0.5;
                }

                self.shipsByInitiative.push(ship.initiative, ship);
                self.shipsByPotency.push(ship.potency, ship);
            }
        };

        self.getShips = function() {
            return new ShipCollection(self.ships);
        };

        self.technologies = ['antimatter_splitter','distortion_shield','point_defence'];
        self.initTechnologies = function(attrs) {
            attrs = attrs || self.initAttrs;
            for (var i in self.technologies) {
                var technology = self.technologies[i];
                self[technology] = attrs.technologies[technology] || false;
            }
        };

        self.getInitiatives = function() {
            return self.shipsByInitiative.keys(function(initiative) {
                return parseFloat(initiative);
            });
        };

        self.getPotencies = function() {
            return self.shipsByPotency.keys(function(potency) {
                return parseFloat(potency);
            });
        };

        self.getShipsByInitiative = function(initiative) {
            if (initiative === undefined) {
                var ships = new ShipCollection(),
                    initiatives = self.getInitiatives().sort(function(a, b) { return b - a; });
                for (var i in initiatives) {
                    ships.add(self.shipsByInitiative[initiatives[i]]);
                }
                return ships;
            } else {
                return new ShipCollection(self.shipsByInitiative[initiative] || []);
            }
        };

        self.getShipsByPotency = function(potency) {
            if (potency === undefined) {
                var ships = new ShipCollection(),
                    potencies = self.getPotencies().sort(function(a, b) { return b - a; });
                for (var i in potencies) {
                    ships.add(self.shipsByPotency[potencies[i]]);
                }
                return ships;
            } else {
                return new ShipCollection(self.shipsByPotency[potency] || []);
            }
        };

        self.clearDamage = function() {
            for (var i = 0, ii = self.ships.length; i < ii; ++i) {
                self.ships[i].clearDamage();
            }
        };

        self.putDamages = function(damages) {
            var ships = self.getShipsByPotency();

            if (damages.getSumDamage()) {
                // destroy ships
                ships.eachAlive(function(ship) {
                    if (ship.isDestroy(damages.getSumDamage(ship))) {
                        damages.getDamagesThisShipCouldTake(ship, true).each(function(damage) {
                            ship.putDamage(damage);
                        });
                    }
                });
            }

            if (damages.getSumDamage()) {
                // damage ships
                ships.eachAlive(function(ship) {
                    damages.getDamagesThisShipCouldTake(ship, true).each(function(damage) {
                        ship.putDamage(damage);
                    });
                });
            }

            return this;
        };

        self.putBackfires = function(damages) {
            //
            var ships = self.getShipsByPotency();

            // first, destroy ships
            var backfires = damages.getSumBackfires()
            if (backfires) {
                ships.eachAliveRifter(function(ship) {
                    if (ship.isDestroy(backfires)) {
                        var dmg = Math.min(ship.getHealth(), backfires);
                        ship.putBackfires(dmg);
                        backfires -= dmg;
                    }
                });
            }

            // then damage with remainder
            if (backfires) {
                ships.eachAliveRifter(function(ship) {
                    var dmg = Math.min(ship.getHealth(), backfires);
                    ship.putBackfires(dmg);
                    backfires -= dmg;
                });
            }

        };

        self.putDamagesMissiles = function(damages) {
            // Point Defence
            if (self.point_defence) {
                var sortedDamages = damages.all().sort(function(a, b) { return b.damage - a.damage; });
                var defenceFire = self.getShips().fireCannons(self);
                defenceFire.each(function(damage) {
                    if (damage.getDamageToShip()) {
                        sortedDamages.shift();
                    }
                });
                damages = new DamageCollection(sortedDamages);
            }

            // Distortion Shield
            if (self.distortion_shield) {
                damages.each(function(damage) {
                    damage.modify += -2;
                });
            }

            return self.putDamages(damages);
        };

        self.isDestroy = function() {
            for (var i = 0, ii = self.ships.length; i < ii; ++i) {
                if (!self.ships[i].isDestroy()) {
                    return false;
                }
            }
            return true;
        };

        self.endFireRound = function() {
            this.getShips().eachAlive(function(ship) {
                if (ship.regen)
                    ship.damage = Math.max(0, ship.damage - ship.regen);
            });
        };

        self.init(attrs);
    }

    function Damage(attrs) {
        this.dice = attrs.dice || NaN;
        this.damage = attrs.damage || 0;
        this.backfire = attrs.backfire || 0;
        this.ship = attrs.ship || new Ship();
        this.type = attrs.type || NaN;
        this.modify = attrs.modify || 0;

        this.getDamageToShip = function(targetShip) {
            var shield = targetShip && targetShip.shield || 0;

            if (this.dice === 6 || this.type === 'rift')
                return this.damage;
            else if (this.dice > 1 && this.dice + this.ship.computer + this.modify + shield >= 6)
                return this.damage;
            else
                return 0;
        }

    }

    function DamageCollection(damages) {
        this.items = [];
        this.type = Damage;

        this.add(damages || []);

        this.getDamagesThatHitThisShip = function(ship) {
            var damages = new DamageCollection();
            this.each(function(damage) {
                if (damage.getDamageToShip(ship) > 0) {
                    damages.add(damage);
                }
            });
            return damages;
        };

        this.getSumDamage = function(ship) {
            var sum = 0;
            this.each(function(damage) {
                sum += damage.getDamageToShip(ship);
            });
            return sum;
        };

        this.getSumBackfires = function() {
            var sum = 0;
            this.each(function(damage) {
                sum += damage.backfire;
            });
            return sum;
        };

        this.getDamagesThisShipCouldTake = function(ship, remove) {
            remove = remove === undefined ? true : !!remove;

            var collection = this.getDamagesThatHitThisShip(ship);

            if (ship.isDestroy(collection.getSumDamage(ship))) {
                var damagesByCount = new ArrayCollection(),
                    damagesByHit = new ArrayCollection();
                damagesByCount.push(collection.count(), collection);
                damagesByHit.push(collection.getSumDamage(ship), collection);

                for (var i = collection.count(); --i;) {
                    var damagesProcess = damagesByCount.get(i+1);
                    if (damagesProcess.length) {
                        for (var j in damagesProcess) {
                            damagesProcess[j].each(function(damage, k, damages) {
                                var list = damages.slice(0);
                                list.splice(k);
                                var collection = new DamageCollection(list),
                                    hits = collection.getSumDamage(ship);
                                if (ship.isDestroy(hits)) {
                                    damagesByCount.push(collection.count(), collection);
                                    damagesByHit.push(hits, collection);
                                }
                            });
                        }
                    } else {
                        break;
                    }
                }

                var hits = damagesByHit.keys();
                if (hits.length) {
                    hits.sort(function (a, b) { return parseInt(a) - parseInt(b); });
                    var bestDamages = damagesByHit.get(hits[0]);
                    bestDamages.sort(function (a, b) { return a.count() - b.count() });
                    collection = bestDamages[0];
                }
            }

            if (remove) {
                this.remove(collection.all());
            }

            return new DamageCollection(collection);
        };
    }
    DamageCollection.prototype = new Collection;


    function calcBattles(firstFleetAttrs, secondFleetAttrs, count) {
        var fleets = [new Fleet(firstFleetAttrs), new Fleet(secondFleetAttrs)]

        var order = [],
            ships = [],
            initiatives = fleets[0].getInitiatives().concat(fleets[1].getInitiatives());
        initiatives.sort(function (a, b) { return b - a; });
        for (var i = 0, ii = initiatives.length; i < ii; ++i) {
            var af = fleets[0].attack ? 0 : 1;
            var df = fleets[0].attack ? 1 : 0;

            ships = fleets[df].getShipsByInitiative(initiatives[i]);
            if (ships.count()) {
                order.push({ships: ships, fireFleet: fleets[df], catchFleet: fleets[af]});
            }

            ships = fleets[af].getShipsByInitiative(initiatives[i]);
            if (ships.count()) {
                order.push({ships: ships, fireFleet: fleets[af], catchFleet: fleets[df]});
            }

        }

        var stats = ['interceptor', 'cruiser', 'dreadnought', 'starbase', 'npc', 'mat lost', 'mat lost %'];
        var totalResources = []; // total resource cost of each fleet
        var results = {
            winner: {0: 0, 1: 0, 2: 0, '-1': 0},
            fleets: [{}, {}],
            number: 0
        };

        for (var f = 0; f < 2; f++) {
            totalResources[f] = 0;
            fleets[f].getShips().each(function(ship) {
                totalResources[f] += ship.resources;
            });

            for (var s = 0; s < stats.length; s++)
                results.fleets[f][stats[s]] = 0;
            results.fleets[f]['mat lost %'] = new Array(count);
        }

        for (var i = 0, result; i < count; ++i) {
            result = calcBattle(fleets[0], fleets[1], order, i + 1 === count);
            ++results.number;
            ++results.winner[result];

            for (f = 0; f < 2; f++) {
                fleets[f].getShips().eachAlive(function(ship) {
                    results.fleets[f][ship.type]++;
                });

                var resLost = 0;
                fleets[f].getShips().eachDead(function(ship) {
                    resLost += ship.resources;
                });
                results.fleets[f]['mat lost'] += resLost;
                results.fleets[f]['mat lost %'][i] = resLost / totalResources[f];
            }

        }

        if (results.number > 0) {
            for (var fr = 0; fr < 2; fr++) {
                var fleetResults = results.fleets[fr];

                // change resources from an array of results to "N.NN +/- N.NN"
                var avg = average(fleetResults['mat lost %']);
                var sd = stddev(fleetResults['mat lost %'], avg);
                fleetResults['mat lost %'] = Math.round(avg*100, 1) + '% +/- ' + Math.round(sd*100,1) + '%';

                // average all other stats
                for (var s = 0; s < stats.length; s++)
                    if (stats[s] !== 'mat lost %')
                        fleetResults[stats[s]] = round(fleetResults[stats[s]] / count, 2);

            }

        }

        return results;
    }

    function battleResult(firstFleet, secondFleet) {
        if (firstFleet.isDestroy() && secondFleet.isDestroy()) {
            return 0;
        }
        if (firstFleet.isDestroy()) {
            return 2;
        }
        if (secondFleet.isDestroy()) {
            return 1;
        }
        return -1;
    }

    function diceString(damages) {
        var dice = [];
        for (var d in damages.items) {
            var prefix = damages.items[d].type[0];
            dice.push( prefix + damages.items[d].dice );
        }
        return dice.join(' ');
    }

    function logFleet(fleet) {
        var ships = fleet.attack && 'attacking ships: ' || 'defending ships: ';
        for (var i = 0; i < fleet.ships.length; i++) {
            var ship = fleet.ships[i];
            if (ship.type === 'interceptor')
                ships += 'i';
            else if (ship.type ===  'cruiser')
                ships += 'c';
            else if (ship.type === 'dreadnought')
                ships += 'd';
            else if (ship.type === 'starbase')
                ships += 's';
            else if (ship.type === 'npc')
                ships += 'n';

            for (var d = 0; d < ship.damage; d++)
                ships += '*';
            ships += ' ';
        }
        console.log(ships);
    }

    function logFleets(first, second) {
        logFleet(first);
        logFleet(second);
    }

    function groupString(action) {
        if (!action.ships.getAlive().count())
            return '';

        var s = action.ships.getAlive().count() + ' ';
        s += action.fireFleet.attack && 'attacking ' || 'defending ';
        s += action.ships.items[0].type + 's';
        return s
    }

    function logDice(action, damages, morc) {
        console.log(groupString(action) + ' roll '+morc+': ' + diceString(damages));
    }

    function calcBattle(firstFleet, secondFleet, order, log) {
        firstFleet.clearDamage();
        secondFleet.clearDamage();

        var result,
            action,
            damages;

        log && console.log('------------------- battle start ------------------')

        // Missiles
        for (var i = 0, ii = order.length; i < ii; ++i) {
            action = order[i];
            damages = action.ships.fireMissiles(action.fireFleet);
            var rolled = damages.count(); log && rolled && logDice(action, damages, 'missiles');

            action.catchFleet.putDamagesMissiles(damages);
            log && rolled && logFleets(firstFleet, secondFleet);
        }

        if ((result = battleResult(firstFleet, secondFleet)) >= 0) {
            log && console.log('fleet '+result+' wins');
            return result;
        }


        // Rounds
        if (firstFleet.getShips().fireCannons(firstFleet).count() || secondFleet.getShips().fireCannons(secondFleet).count()) {
            for (var j = 0; j < 1000; ++j) {
                for (var i = 0, ii = order.length; i < ii; ++i) {
                    action = order[i];
                    if (!action.fireFleet.getShips().getAlive().count())
                        continue;

                    damages = action.ships.fireCannons(action.fireFleet);
                    var rolled = damages.count(); log && rolled && logDice(action, damages, 'cannons');

                    action.fireFleet.putBackfires(damages);
                    action.catchFleet.putDamages(damages);
                    log && rolled && logFleets(firstFleet, secondFleet);

                    if ((result = battleResult(firstFleet, secondFleet)) >= 0) {
                        log && console.log('fleet '+result+' wins');
                        return result;
                    }
                }

                firstFleet.endFireRound();
                secondFleet.endFireRound();
            }
        }

        result = battleResult(firstFleet, secondFleet);
        log && console.log('fleet '+result+' wins');
        return result;
    }


    // Helpers functions
    function average(a) { return a.reduce(function(a, b) { return a + b;}, 0) / a.length }
    function stddev(arr, av) {
        var sum = arr.reduce(function(a, b) { return Math.pow(Math.abs(b - av), 2) + a;}, 0);
        return Math.sqrt(sum/arr.length)}
    function prob(p, m, n) { return Math.pow(p, m) * Math.pow(1-p, n-m); }
    function comb(m, n) { return fact(n) / (fact(m) * fact(n - m)); }
    function fact(n) { var v = 1; for (var i = 2; i <= n; i++) v = v * i; return v; }
    function dice() { return randInt(6, 1); }
    function rand() { return Math.random(); }
    function randInt(max, min) { return Math.floor(rand() * def(max, 1)) + def(min, 0); }
    function sleep(ms) { ms += new Date().getTime(); while (new Date() < ms) {} }
    function round(v, n) { return Math.round(v * Math.pow(10, n)) / Math.pow(10, n); }
    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }
    function def(v,d) { return v !== undefined ? v : d; }
    function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    function diceTest(limit) {
        var result = {}, i;
        for (i = 1; i <= 6; ++i) { result[i] = 0; }
        for (i = 0; i < limit; ++i) { ++result[dice()]; }
        for (i = 1; i <= 6; ++i) { result[i] = result[i] / limit - 1 / 6; }
        return result;
    }
    //console.log(diceTest(Math.pow(10, 9)));
})(jQuery);