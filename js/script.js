(function($){
    var GAME = this;

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
            value = value > 1 ? value - 1 : 0;
        }
        $value.data('value', value);
        $value.html(list.length ? list[value] : value);
    });

    $body.on('click', '.panel .panel-heading', function() {
        $(this).siblings('.panel-body').slideToggle();
    });

    $body.on('click', '.clear-btn', function() {
        $(this).closest('.clear-group').find('.game-counter-value').html(0);
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


    // Dices page
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


    // Battle page
    var shipTypes = ['interceptor','cruiser','dreadnought','starbase'];
    var battleCalcProcess = false;
    $('#battle_run').on('click', function(){
        if (battleCalcProcess) {
            return;
        }
        battleCalcProcess = true;
        var $this = $(this);
        $this.removeClass('btn-primary');

        var technologies = ['antimatter_splitter','distortion_shield','point_defence'],
            fields = ['count','hull','morph','computer','shield','initiative',
                'cannon_ion','cannon_plasma','cannon_antimatter','rocket_ion','rocket_plasma','rocket_antimatter'];

        var parseArmy = function(idPrefix) {
            var army = {};

            for (var i in shipTypes) {
                army[shipTypes[i]] = {};
                for (var j in fields) {
                    army[shipTypes[i]][fields[j]] = parseInt($('#' + idPrefix + '_' + shipTypes[i] + '_' + fields[j]).data('value')) || 0;
                }

                army['technologies'] = {};
                for (var j in technologies) {
                    army['technologies'][technologies[j]] = parseInt($('#' + idPrefix + '_' + technologies[j]).data('value')) ? true : false;
                }

                army['side'] = {attack: false, defence: false};
                if (parseInt($('#' + idPrefix + '_side_attack').data('value'))) {
                    army['side'].attack = true;
                } else {
                    army['side'].defence = true;
                }
            }

            return army;
        };

        var firstArmy = parseArmy('battle_first');
        var secondArmy = parseArmy('battle_second');
        var count = parseInt($('#battle_count').html()) || 1000;

        var results = calcBattles(firstArmy, secondArmy, count);


        var width = (results[0] && results[-1]) ? 3 : ((results[0] || results[-1]) ? 4 : 6);
        var html = '';
        html += '<table class="table">';
        html += '<thead><tr>';

        html += '<th class="col-xs-' + width + '">First Victory</th>';
        html += '<th class="col-xs-' + width + '">Second Victory</th>';
        if (results[0]) {
            html += '<th class="col-xs-' + width + '">Draw</th>';
        }
        if (results[-1]) {
            html += '<th class="col-xs-' + width + '">Stalemate</th>';
        }

        html += '</tr></thead>';
        html += '<tbody><tr>';

        html += '<td>' + round(100 * results[1] / count, 1) + '&nbsp;%</td>';
        html += '<td>' + round(100 * results[2] / count, 1) + '&nbsp;%</td>';
        if (results[0]) {
            html += '<td>' + round(100 * results[0] / count, 1) + '&nbsp;%</td>';
        }
        if (results[-1]) {
            html += '<td>' + round(100 * results[-1] / count, 1) + '&nbsp;%</td>';
        }

        html += '</tr></tbody>';
        html += '</table>';

        $('#battle_result').html(html);

        $this.addClass('btn-primary');
        battleCalcProcess = false;
    });

    //$('#battle_first_interceptor_count, #battle_second_interceptor_count')
    //    .closest('.battle-ship-group').find('.panel-heading')
    //    .append('<button class="btn default-ancient-button pull-right">Ancient</button>');



    // Logic functions

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
        this.params = ['hull','morph','computer','shield','initiative',
            'cannon_ion','cannon_plasma','cannon_antimatter','rocket_ion','rocket_plasma','rocket_antimatter'];

        this.default = {};

        this.constructor = function(attrs) {
            this.initParams(attrs);
            this.damage = 0;
            return this;
        };

        this.initParams = function(attrs) {
            attrs = attrs || [];
            for (var i in this.params) {
                var param = this.params[i];
                this[param] = attrs[param] || (this.default[param] || 0);
            }
            return this;
        };

        this.clearDamage = function() {
            this.damage = 0;
            return this;
        };

        this.putDamage = function(damage) {
            this.damage += damage.getHit(this);
            return this;
        };

        this.getHealth = function() {
            return 1 + this.hull - this.damage;
        };

        this.isDestroy = function(damage) {
            return this.damage + (damage || 0) > this.hull;
        };

        this.fire = function(army, fireType) {
            fireType = fireType == 'rocket' ? 'rocket' : 'cannon';
            var damages = new DamageCollection();

            if (!this.isDestroy()) {
                var diceResult, cannonDamages = {'ion': 1, 'plasma': 2, 'antimatter': 4};
                for (var cannonType in cannonDamages) {
                    var cannonDamage = cannonDamages[cannonType];
                    var countDamage = 1;

                    if (fireType == 'cannon' && cannonType == 'antimatter' && (army.antimatter_splitter || false)) {
                        countDamage = cannonDamage;
                        cannonDamage = 1;
                    }

                    for (var i = 0; i < this[fireType + '_' + cannonType]; ++i) {
                        diceResult = dice();
                        for (var j = 0; j < countDamage; ++j) {
                            damages.add(new Damage({
                                dice: diceResult,
                                damage: cannonDamage,
                                computer: this.computer,
                                type: cannonType
                            }));
                        }
                    }
                }
            }

            return damages;
        };

        this.fireCannons = function(army) {
            return this.fire(army, 'cannon');
        };

        this.fireRockets = function(army) {
            return this.fire(army, 'rocket');
        };
    }

    function ShipCollection(ships) {
        this.items = [];
        this.type = Ship;

        this.add(ships || []);

        this.clearDamage = function() {
            this.each(function(ship) {
                ship.clearDamage();
            });
            return this;
        };

        this.fireCannons = function(army) {
            var damages = new DamageCollection();
            this.each(function(ship) {
                damages.add(ship.fireCannons(army));
            });
            return damages;
        };

        this.fireRockets = function(army) {
            var damages = new DamageCollection();
            this.each(function(ship) {
                damages.add(ship.fireRockets(army));
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

        self.potency = 1;

        self.constructor(attrs);
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

        self.potency = 3;

        self.constructor(attrs);
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

        self.potency = 4;

        self.constructor(attrs);
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

        self.potency = 2;

        self.constructor(attrs);
    }
    Starbase.prototype = new Ship;

    function Army(attrs) {
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

            for (var i = 0, ii = attrs.interceptor.count || 0; i < ii; ++i) {
                self.ships.push(new Interceptor(attrs.interceptor));
            }
            for (var i = 0, ii = attrs.cruiser.count || 0; i < ii; ++i) {
                self.ships.push(new Cruiser(attrs.cruiser));
            }
            for (var i = 0, ii = attrs.dreadnought.count || 0; i < ii; ++i) {
                self.ships.push(new Dreadnought(attrs.dreadnought));
            }
            for (var i = 0, ii = attrs.starbase.count || 0; i < ii; ++i) {
                self.ships.push(new Starbase(attrs.starbase));
            }

            self.shipsByInitiative = {};
            self.shipsByPotency = {};
            for (var i = 0, ii = self.ships.length; i < ii; ++i) {
                var ship = self.ships[i];

                if (!self.attack) {
                    ship.initiative += 0.5;
                }

                if (self.shipsByInitiative[ship.initiative] === undefined) {
                    self.shipsByInitiative[ship.initiative] = [];
                }
                self.shipsByInitiative[ship.initiative].push(ship);

                if (self.shipsByPotency[ship.potency] === undefined) {
                    self.shipsByPotency[ship.potency] = [];
                }
                self.shipsByPotency[ship.potency].push(ship);
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
            var initiatives = [];
            for (var initiative in self.shipsByInitiative) {
                initiatives.push(parseFloat(initiative));
            }
            return initiatives;
        };

        self.getPotencies = function() {
            var potencies = [];
            for (var potency in self.shipsByPotency) {
                potencies.push(parseFloat(potency));
            }
            return potencies;
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
                ships.each(function(ship) {
                    if (ship.isDestroy()) { return; }
                    if (ship.isDestroy(damages.getSumDamage(ship))) {
                        damages.getForShip(ship, true).each(function(damage) {
                            ship.putDamage(damage);
                        });
                    }
                });
            }

            if (damages.getSumDamage()) {
                // damage ships
                ships.each(function(ship) {
                    if (ship.isDestroy()) { return; }
                    damages.getForShip(ship, true).each(function(damage) {
                        ship.putDamage(damage);
                    });
                });
            }

            return this;
        };

        self.putDamagesRockets = function(damages) {
            // Point Defence
            if (self.point_defence) {
                var sortedDamages = damages.all().sort(function(a, b) { return b.damage - a.damage; });
                var defenceFire = self.getShips().fireCannons(self);
                defenceFire.each(function(damage) {
                    if (damage.getHit()) {
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
            this.getShips().each(function(ship) {
                if (ship.morph) {
                    ship.damage -= ship.morph;
                }
            });
        };

        self.init(attrs);
    }

    function Damage(attrs) {
        this.dice = attrs.dice || NaN;
        this.damage = attrs.damage || 0;
        this.computer = attrs.computer || 0;
        this.type = attrs.type || NaN;
        this.modify = attrs.modify || 0;

        this.getHit = function(ship) {
            if (ship === undefined) {
                if (this.dice > 1 && (this.dice + this.computer + this.modify) >= 6) {
                    return this.damage;
                }
                return 0;
            } else {
                if (this.dice > 1 && (this.dice + this.computer + this.modify - ship.shield) >= 6) {
                    return this.damage;
                }
                return 0;
            }
        }
    }

    function DamageCollection(damages) {
        this.items = [];
        this.type = Damage;

        this.add(damages || []);

        this.getSumDamage = function(ship) {
            var sum = 0;
            this.each(function(damage) {
                sum += damage.getHit(ship);
            });
            return sum;
        };

        this.getForShip = function(ship, remove) {
            remove = remove === undefined ? true : !!remove;
            var damage,
                hit,
                health = ship.getHealth(),
                all = this.all(),
                sum = 0,
                damages = [];

            for (var i = 0, ii = all.length; i < ii; ++i) {
                damage = all[i];
                if (hit = damage.getHit(ship)) {
                    damages.push(damage);
                    sum += hit;
                    if (sum >= health) {
                        break;
                    }
                }
            }

            if (remove) {
                this.remove(damages);
            }

            return new DamageCollection(damages);
        };
    }
    DamageCollection.prototype = new Collection;


    function calcBattles(firstArmyAttrs, secondArmyAttrs, count) {
        var firstArmy = new Army(firstArmyAttrs),
            secondArmy = new Army(secondArmyAttrs),
            results = {0: 0, 1: 0, 2: 0, '-1': 0};

        var order = [],
            ships = [],
            initiatives = firstArmy.getInitiatives().concat(secondArmy.getInitiatives());
        initiatives.sort(function (a, b) { return b - a; });
        for (var i = 0, ii = initiatives.length; i < ii; ++i) {
            if (firstArmy.attack) {
                ships = secondArmy.getShipsByInitiative(initiatives[i]);
                if (ships.count()) {
                    order.push({ships: ships, fireArmy: secondArmy, defenceArmy: firstArmy});
                }

                ships = firstArmy.getShipsByInitiative(initiatives[i]);
                if (ships.count()) {
                    order.push({ships: ships, fireArmy: firstArmy, defenceArmy: secondArmy});
                }
            } else {
                ships = firstArmy.getShipsByInitiative(initiatives[i]);
                if (ships.count()) {
                    order.push({ships: ships, fireArmy: firstArmy, defenceArmy: secondArmy});
                }

                ships = secondArmy.getShipsByInitiative(initiatives[i]);
                if (ships.count()) {
                    order.push({ships: ships, fireArmy: secondArmy, defenceArmy: firstArmy});
                }
            }
        }

        for (var i = 0, result; i < count; ++i) {
            result = calcBattle(firstArmy, secondArmy, order);
            ++results[result];
        }

        console.log('results', results, firstArmy, secondArmy);

        return results;
    }

    function calcBattle(firstArmy, secondArmy, order) {
        firstArmy.clearDamage();
        secondArmy.clearDamage();

        var result,
            action,
            damages;

        var getResult = function() {
            if (firstArmy.isDestroy() && secondArmy.isDestroy()) {
                return 0;
            }
            if (firstArmy.isDestroy()) {
                return 2;
            }
            if (secondArmy.isDestroy()) {
                return 1;
            }
            return -1;
        };

        // Rockets
        for (var i = 0, ii = order.length; i < ii; ++i) {
            action = order[i];
            damages = action.ships.fireRockets(action.fireArmy);
            action.defenceArmy.putDamagesRockets(damages);
        }

        if ((result = getResult()) >= 0) {
            return result;
        }

        // Rounds
        for (var j = 0; j < 1000; ++j) {
            for (var i = 0, ii = order.length; i < ii; ++i) {
                action = order[i];
                damages = action.ships.fireCannons(action.fireArmy);
                action.defenceArmy.putDamages(damages);

                if ((result = getResult()) >= 0) {
                    return result;
                }
            }

            firstArmy.endFireRound();
            secondArmy.endFireRound();
        }

        return getResult();
    }


    // Helpers functions
    function prob(p, m, n) { return Math.pow(p, m) * Math.pow(1-p, n-m); }
    function comb(m, n) { return fact(n) / (fact(m) * fact(n - m)); }
    function fact(n) { var v = 1; for (var i = 2; i <= n; i++) v = v * i; return v; }
    function dice() { return Math.floor(Math.random() * 6) + 1; }
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

    function diceTest(limit) {
        var result = {}, i;
        for (i = 1; i <= 6; ++i) { result[i] = 0; }
        for (i = 0; i < limit; ++i) { ++result[dice()]; }
        for (i = 1; i <= 6; ++i) { result[i] = result[i] / limit - 1 / 6; }
        return result;
    }
    //console.log(diceTest(Math.pow(10, 9)));
})(jQuery);